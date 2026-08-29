"""Self-check for the only hand-written logic left: shaping Gemini's JSON.

Run: python test_normalise.py
"""
import os

os.environ.setdefault("GEMINI_API_KEY", "test-key-not-used")

from app.main import QuestionType, normalise


def test_multiple_choice_trims_options_and_unwraps_answer():
    out = normalise(
        {
            "source_text_summary": "A summary.",
            "questions": [
                {
                    "question": "Q?",
                    "question_type": "multiple_choice",
                    "options": ["a", "b", "c", "d", "e", ""],
                    "correct_answer": ["b"],
                    "explanation": "because",
                }
            ],
        },
        num_questions=5,
        num_options=4,
    )
    q = out.questions[0]
    assert q.options == ["a", "b", "c", "d"], q.options  # blank dropped, trimmed to 4
    assert q.correct_answer == "b", q.correct_answer  # single answer unwrapped to str
    assert out.source_text_summary == "A summary."


def test_matching_keeps_the_answer_list():
    out = normalise(
        {
            "source_text_summary": "",
            "questions": [
                {
                    "question": "Match:",
                    "question_type": "matching",
                    "options": ["Cat - Feline", "Dog - Canine"],
                    "correct_answer": ["Cat - Feline", "Dog - Canine"],
                    "explanation": "e",
                }
            ],
        },
        num_questions=5,
        num_options=4,
    )
    assert out.questions[0].correct_answer == ["Cat - Feline", "Dog - Canine"]


def test_open_ended_types_carry_no_options():
    out = normalise(
        {
            "source_text_summary": "",
            "questions": [
                {
                    "question": "The capital is _____.",
                    "question_type": "fill_in_the_blank",
                    "options": ["stray", "options"],
                    "correct_answer": ["Paris"],
                    "explanation": "e",
                }
            ],
        },
        num_questions=5,
        num_options=4,
    )
    assert out.questions[0].options is None
    assert out.questions[0].question_type is QuestionType.fill_in_the_blank


def test_answerless_question_is_dropped_and_count_is_capped():
    out = normalise(
        {
            "source_text_summary": "",
            "questions": [
                {"question": "1", "question_type": "short_answer", "correct_answer": [], "explanation": ""},
                {"question": "2", "question_type": "short_answer", "correct_answer": ["y"], "explanation": ""},
                {"question": "3", "question_type": "short_answer", "correct_answer": ["z"], "explanation": ""},
            ],
        },
        num_questions=2,
        num_options=4,
    )
    # capped at 2 before filtering, and the answerless one is dropped
    assert [q.question for q in out.questions] == ["2"]
    assert out.questions[0].explanation == "No explanation provided"


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_"):
            fn()
            print(f"ok  {name}")
    print("all passed")
