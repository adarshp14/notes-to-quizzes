
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the request body
    const body = await req.json();
    
    // Parse input parameters with defaults
    const questionCount = body.num_questions || 5;
    const answerOptions = body.num_options || 4;
    const questionType = body.question_type || "multiple_choice";
    const difficulty = body.difficulty || "medium";
    const text = body.text || "";
    const filename = body.filename || "";
    
    console.log("Generating quiz with parameters:", { 
      questionCount, 
      answerOptions, 
      questionType, 
      difficulty,
      hasText: Boolean(text),
      hasFilename: Boolean(filename)
    });
    
    // Generate questions based on provided text or file
    const questions = generateQuestions(
      text || filename, 
      questionCount, 
      answerOptions, 
      questionType, 
      difficulty
    );
    
    // Ensure each question has a valid options array and correct question type
    questions.forEach(question => {
      // Fix true/false questions that might be incorrectly labeled
      if ((question.correct_answer === "True" || question.correct_answer === "False") && 
          (question.options === null || question.options?.length === 0)) {
        question.options = ["True", "False"];
        question.question_type = "true_false";
      }
      
      // Detect matching questions by correct_answer pattern (e.g., "a-4, b-1, c-3, d-2")
      if (question.correct_answer && 
          /^[a-z]-\d+(?:,\s*[a-z]-\d+)*$/i.test(question.correct_answer)) {
        question.question_type = "matching";
      }
      
      // If options is still null, initialize it as an empty array
      if (question.options === null) {
        if (question.correct_answer) {
          // For short_answer or other types with a single correct answer but no options
          question.options = [question.correct_answer];
        } else {
          question.options = [];
        }
      }
      
      // Ensure short_answer questions have at least the correct answer in options
      if (question.question_type === "short_answer" && 
          !question.options.includes(question.correct_answer)) {
        question.options.push(question.correct_answer);
      }
    });
    
    return new Response(
      JSON.stringify({ 
        questions,
        source_text_summary: `Quiz generated from ${text ? "notes" : "file"} with ${questionCount} questions.`
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-file-quiz function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Function to generate quiz questions
function generateQuestions(
  source: string,
  count = 5, 
  options = 4, 
  type = "multiple_choice", 
  difficulty = "medium"
) {
  const questions = [];
  
  // Extract key phrases from the source text (simplified approach)
  const words = source.split(/\s+/).filter(word => word.length > 4);
  const uniqueWords = [...new Set(words)];
  
  // Fallback topics if source doesn't provide enough content
  const fallbackTopics = [
    "artificial intelligence",
    "quantum computing",
    "machine learning",
    "blockchain technology",
    "renewable energy",
    "space exploration",
    "cybersecurity",
    "biotechnology"
  ];
  
  // Combine extracted words with fallback topics
  const topics = uniqueWords.length > count
    ? uniqueWords.slice(0, count * 2)
    : fallbackTopics;
  
  // All supported question types
  const questionTypes = [
    "multiple_choice", 
    "true_false", 
    "fill_in_the_blank", 
    "short_answer", 
    "matching"
  ];
  
  for (let i = 0; i < count; i++) {
    const topicIndex = Math.floor(Math.random() * topics.length);
    const topic = topics[topicIndex] || fallbackTopics[i % fallbackTopics.length];
    
    // Determine question type - either use specified type or mix
    let actualType = type;
    if (type === "mixed") {
      actualType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    }
    
    // Generate question based on difficulty
    let questionText = `What is ${topic}?`;
    if (difficulty === "medium") {
      questionText = `Explain the concept of ${topic}.`;
    } else if (difficulty === "hard") {
      questionText = `Analyze the implications of ${topic} in modern context.`;
    }
    
    if (actualType === "multiple_choice") {
      const optionsArray = [];
      const correctIndex = Math.floor(Math.random() * options);
      
      for (let j = 0; j < options; j++) {
        if (j === correctIndex) {
          optionsArray.push(`Correct explanation of ${topic}`);
        } else {
          optionsArray.push(`Incorrect explanation ${j + 1} about ${topic}`);
        }
      }
      
      questions.push({
        question: questionText,
        options: optionsArray,
        correct_answer: optionsArray[correctIndex],
        explanation: `This is an explanation about ${topic}.`,
        question_type: "multiple_choice"
      });
    } 
    else if (actualType === "true_false") {
      // True/False question
      const isTrue = Math.random() > 0.5;
      const statement = isTrue 
        ? `${topic} is a significant development in its field.` 
        : `${topic} has been proven to be irrelevant in modern applications.`;
      
      questions.push({
        question: statement,
        options: ["True", "False"],
        correct_answer: isTrue ? "True" : "False",
        explanation: `This statement about ${topic} is ${isTrue ? "true" : "false"} because...`,
        question_type: "true_false"
      });
    }
    else if (actualType === "fill_in_the_blank") {
      // Fill in the blank question
      const blankQuestion = `${topic} is a key concept in this field. ${topic} can be defined as ___________.`;
      
      questions.push({
        question: blankQuestion,
        options: [`The correct definition of ${topic}`, `An incorrect definition of ${topic}`],
        correct_answer: `The correct definition of ${topic}`,
        explanation: `The blank should be filled with the definition of ${topic}.`,
        question_type: "fill_in_the_blank"
      });
    }
    else if (actualType === "short_answer") {
      // Short answer question
      const shortAnswerQuestion = `Briefly explain the concept of ${topic} in your own words.`;
      const correctAnswer = `A proper explanation of ${topic} would include key points about its definition, purpose, and application.`;
      
      questions.push({
        question: shortAnswerQuestion,
        options: [correctAnswer], // Ensure options is an array, not null
        correct_answer: correctAnswer,
        explanation: `A good answer would discuss what ${topic} is and why it's important.`,
        question_type: "short_answer"
      });
    }
    else if (actualType === "matching") {
      // Matching question
      const matchingQuestion = `Match the following terms with their correct definitions:`;
      
      // For demonstration, we'll create a simple matching representation
      const matchTerms = ['Term A', 'Term B', 'Term C', 'Term D'].slice(0, Math.min(4, options));
      const correctMatching = `${matchTerms.join(', ')} matched with their correct definitions`;
      
      const incorrectOptions = Array(options - 1).fill(0).map((_, idx) => 
        `Incorrect matching option ${idx + 1}`
      );
      
      questions.push({
        question: matchingQuestion,
        options: [correctMatching, ...incorrectOptions],
        correct_answer: correctMatching,
        explanation: `This matching question tests your understanding of terminology related to ${topic}.`,
        question_type: "matching"
      });
    }
  }
  
  // Randomize question order if mixed type was specified
  if (type === "mixed") {
    questions.sort(() => Math.random() - 0.5);
  }
  
  return questions;
}
