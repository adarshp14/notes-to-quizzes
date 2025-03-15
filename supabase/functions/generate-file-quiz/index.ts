
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
    const questionCount = body.num_questions || 1; // Set minimum to 1
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
  count = 1, // Set minimum to 1
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
  
  // If mixed type is requested, we'll generate a variety of question types
  const questionTypes = type === "mixed" 
    ? ["multiple_choice", "true_false", "fill_in_the_blank", "short_answer", "matching"]
    : [type];
  
  for (let i = 0; i < count; i++) {
    const topicIndex = Math.floor(Math.random() * topics.length);
    const topic = topics[topicIndex] || fallbackTopics[i % fallbackTopics.length];
    
    // For mixed type, cycle through question types
    const currentType = type === "mixed"
      ? questionTypes[i % questionTypes.length]
      : type;
    
    // Generate question based on difficulty
    let questionText = `What is ${topic}?`;
    if (difficulty === "medium") {
      questionText = `Explain the concept of ${topic}.`;
    } else if (difficulty === "hard") {
      questionText = `Analyze the implications of ${topic} in modern context.`;
    }
    
    // Adjust question for specific question types
    if (currentType === "fill_in_the_blank") {
      questionText = `Complete this statement: ${topic} is a __________ that impacts modern technology.`;
    } else if (currentType === "matching") {
      questionText = `Match ${topic} with its correct definition or application.`;
    }
    
    if (currentType === "multiple_choice") {
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
    } else if (currentType === "true_false") {
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
    } else if (currentType === "fill_in_the_blank") {
      // Fill in the blank question
      const answer = `technological innovation`;
      
      questions.push({
        question: questionText,
        options: [answer],
        correct_answer: answer,
        explanation: `${topic} is indeed a ${answer} because...`,
        question_type: "fill_in_the_blank"
      });
    } else if (currentType === "short_answer") {
      // Short answer question
      const answer = `${topic} is a concept that refers to advanced technology`;
      
      questions.push({
        question: `In 1-2 sentences, describe what ${topic} is.`,
        options: [answer],
        correct_answer: answer,
        explanation: `A good answer would include key aspects of ${topic} such as...`,
        question_type: "short_answer"
      });
    } else if (currentType === "matching") {
      // Matching question - for API we'll represent this as multiple choice
      const matchItems = [
        `${topic}`,
        `Application of ${topic}`,
        `History of ${topic}`,
        `Future of ${topic}`
      ];
      
      const matchAnswers = [
        `Definition of ${topic}`,
        `How ${topic} is used today`,
        `Evolution of ${topic} over time`,
        `Potential developments in ${topic}`
      ];
      
      // For API format compatibility, we'll just use the first pair
      questions.push({
        question: `Match ${topic} with its correct definition`,
        options: matchAnswers,
        correct_answer: matchAnswers[0],
        explanation: `${matchItems[0]} is correctly matched with ${matchAnswers[0]} because...`,
        question_type: "matching"
      });
    }
  }
  
  // If mixed type was requested, shuffle the questions
  if (type === "mixed") {
    questions.sort(() => Math.random() - 0.5);
  }
  
  return questions;
}
