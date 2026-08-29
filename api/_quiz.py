import base64
import json
import os
import tempfile
from enum import Enum
from typing import Any, Dict, List, Optional, Union

import docx
import pymupdf
import requests
from fastapi import APIRouter, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY environment variable is not set!")

# gemini-2.0-flash was shut down 2026-06-01; 3.5-flash is the migration target.
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash")
GEMINI_API_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
)
MAX_UPLOAD_BYTES = int(os.environ.get("MAX_UPLOAD_MB", "10")) * 1024 * 1024
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "*").split(",")]

app = FastAPI(title="Quiz Generator", version="2.0.0")
router = APIRouter()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    # credentials cannot be combined with a wildcard origin — browsers reject it
    allow_credentials=ALLOWED_ORIGINS != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionType(str, Enum):
    multiple_choice = "multiple_choice"
    true_false = "true_false"
    fill_in_the_blank = "fill_in_the_blank"
    short_answer = "short_answer"
    matching = "matching"
    mixed = "mixed"


class DifficultyLevel(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class TextQuizRequest(BaseModel):
    text: str = Field(min_length=1)
    num_questions: int = Field(default=5, gt=0, le=20)
    num_options: int = Field(default=4, gt=1, le=6)
    question_type: Union[QuestionType, List[QuestionType]] = QuestionType.multiple_choice
    difficulty: DifficultyLevel = DifficultyLevel.medium


class QuizQuestion(BaseModel):
    question: str
    options: Optional[List[str]] = None
    correct_answer: Union[str, List[str]]
    explanation: str
    question_type: QuestionType


class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
    source_text_summary: str


CONCRETE_TYPES = [t.value for t in QuestionType if t is not QuestionType.mixed]
NO_OPTION_TYPES = {QuestionType.fill_in_the_blank, QuestionType.short_answer}

# Flat on purpose: the generateContent responseSchema rejects $defs/$ref.
QUIZ_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "source_text_summary": {"type": "string"},
        "questions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "question": {"type": "string"},
                    "question_type": {"type": "string", "enum": CONCRETE_TYPES},
                    "options": {"type": "array", "items": {"type": "string"}},
                    # always a list; collapsed to a bare string below unless it is
                    # a matching question, which legitimately has several answers
                    "correct_answer": {"type": "array", "items": {"type": "string"}},
                    "explanation": {"type": "string"},
                },
                "required": ["question", "question_type", "correct_answer", "explanation"],
            },
        },
    },
    "required": ["source_text_summary", "questions"],
}

TYPE_RULES = {
    "multiple_choice": "exactly {n} unique options, and the correct_answer must be the full text of one of them",
    "true_false": "options are exactly ['True', 'False']",
    "fill_in_the_blank": "one blank written as _____ , and no options",
    "short_answer": "no options; the answer is a brief phrase",
    "matching": "{n} option entries each formatted 'Term - Definition', and correct_answer lists the correct pairings",
}


def build_prompt(
    num_questions: int, num_options: int, types: List[str], difficulty: str
) -> str:
    wanted = CONCRETE_TYPES if "mixed" in types else types
    rules = "\n".join(
        f"- {t}: {TYPE_RULES[t].format(n=num_options)}" for t in wanted if t in TYPE_RULES
    )
    spread = (
        "Spread the questions across all of the types listed below."
        if len(wanted) > 1
        else f"Every question must be of type {wanted[0]}."
    )
    return (
        f"Generate exactly {num_questions} quiz questions at '{difficulty}' difficulty, "
        f"based solely on the supplied source material. Every question must be answerable "
        f"from that material alone, and every explanation must justify the answer from it.\n"
        f"{spread}\n"
        f"Type rules:\n{rules}\n"
        f"Also write source_text_summary: a 3-5 sentence summary of the source material."
    )


def call_gemini(parts: List[Dict[str, Any]], schema: Optional[Dict[str, Any]] = None) -> str:
    payload: Dict[str, Any] = {"contents": [{"parts": parts}]}
    if schema:
        payload["generationConfig"] = {
            "responseMimeType": "application/json",
            "responseSchema": schema,
        }
    response = requests.post(
        GEMINI_API_URL,
        headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY},
        json=payload,
        timeout=120,
    )
    if response.status_code != 200:
        raise HTTPException(
            status_code=502, detail=f"Gemini API error ({response.status_code}): {response.text[:400]}"
        )
    candidates = response.json().get("candidates") or []
    if not candidates:
        raise HTTPException(status_code=502, detail="Gemini returned no candidates")
    return candidates[0]["content"]["parts"][0]["text"]


def normalise(payload: Dict[str, Any], num_questions: int, num_options: int) -> QuizResponse:
    """Turn Gemini's schema-validated JSON into the public response shape."""
    questions: List[QuizQuestion] = []
    for raw in payload.get("questions", [])[:num_questions]:
        q_type = QuestionType(raw["question_type"])
        answers = raw.get("correct_answer") or []
        if isinstance(answers, str):
            answers = [answers]
        if not answers:
            continue  # a question with no answer is not a question
        options = [o for o in (raw.get("options") or []) if o.strip()][:num_options]
        questions.append(
            QuizQuestion(
                question=raw["question"],
                options=None if q_type in NO_OPTION_TYPES else (options or None),
                correct_answer=answers if q_type is QuestionType.matching else answers[0],
                explanation=raw.get("explanation") or "No explanation provided",
                question_type=q_type,
            )
        )
    return QuizResponse(
        questions=questions, source_text_summary=payload.get("source_text_summary", "")
    )


def generate_quiz(
    source: List[Dict[str, Any]],
    num_questions: int,
    num_options: int,
    question_types: Union[str, List[str]],
    difficulty: str,
) -> QuizResponse:
    types = question_types if isinstance(question_types, list) else [question_types]
    types = [t.value if isinstance(t, Enum) else str(t) for t in types]
    prompt = build_prompt(num_questions, num_options, types, difficulty)
    text = call_gemini(source + [{"text": prompt}], QUIZ_SCHEMA)
    try:
        payload = json.loads(text)
    except ValueError as exc:  # schema-enforced, so this means a truncated response
        raise HTTPException(status_code=502, detail=f"Gemini returned malformed JSON: {exc}")
    return normalise(payload, num_questions, num_options)


def extract_text_from_docx(path: str) -> str:
    return "\n".join(p.text for p in docx.Document(path).paragraphs)


def extract_text_from_pdf(path: str) -> str:
    with pymupdf.open(path) as doc:
        return "\n".join(page.get_text() for page in doc)


def extract_text_from_txt(path: str) -> str:
    with open(path, "r", encoding="utf-8", errors="replace") as handle:
        return handle.read()


@router.get("/health")
def health():
    return {"status": "ok", "model": GEMINI_MODEL}


# sync def on purpose: requests blocks, so FastAPI runs these in its threadpool
# instead of stalling the event loop.
@router.post("/generate-text-quiz", response_model=QuizResponse)
def generate_quiz_from_text(request: TextQuizRequest):
    return generate_quiz(
        [{"text": f"Source material:\n{request.text}"}],
        request.num_questions,
        request.num_options,
        request.question_type,
        request.difficulty,
    )


@router.post("/generate-file-quiz", response_model=QuizResponse)
def generate_quiz_from_file(
    file: UploadFile = File(...),
    num_questions: int = Form(5, gt=0, le=20),
    num_options: int = Form(4, gt=1, le=6),
    question_type: str = Form(QuestionType.multiple_choice.value),
    difficulty: DifficultyLevel = Form(DifficultyLevel.medium),
):
    extension = os.path.splitext(file.filename or "")[1].lower()
    images = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}
    readers = {
        ".docx": extract_text_from_docx,
        ".pdf": extract_text_from_pdf,
        ".txt": extract_text_from_txt,
    }
    if extension not in images and extension not in readers:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{extension or file.filename}'. "
            f"Supported: {', '.join(sorted(set(readers) | set(images)))}",
        )

    payload = file.file.read(MAX_UPLOAD_BYTES + 1)
    if len(payload) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413, detail=f"File exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)}MB limit"
        )

    with tempfile.NamedTemporaryFile(suffix=extension, delete=False) as temp:
        temp.write(payload)
        temp_path = temp.name
    try:
        if extension in images:
            # sent inline — the model reads the image and writes the quiz in one call
            source = [
                {
                    "inline_data": {
                        "mime_type": images[extension],
                        "data": base64.b64encode(payload).decode(),
                    }
                }
            ]
        else:
            text = readers[extension](temp_path).strip()
            if not text:
                raise HTTPException(
                    status_code=422, detail="No text could be extracted from that file"
                )
            source = [{"text": f"Source material:\n{text}"}]
        types = [t.strip() for t in question_type.split(",") if t.strip()]
        for t in types:
            if t not in CONCRETE_TYPES + ["mixed"]:
                raise HTTPException(status_code=400, detail=f"Unknown question_type '{t}'")
        return generate_quiz(source, num_questions, num_options, types, difficulty)
    finally:
        os.unlink(temp_path)


# Vercel routes each api/<name>.py file at /api/<name>, so the deployed app is
# addressed under /api. Mounting bare as well keeps `uvicorn api._quiz:app`
# working locally against VITE_API_URL=http://localhost:8000.
app.include_router(router)
app.include_router(router, prefix="/api")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api._quiz:app", host="0.0.0.0", port=8000, reload=True)
