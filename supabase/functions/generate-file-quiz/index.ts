
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
    // Check if it's a multipart form request
    const contentType = req.headers.get("content-type") || "";
    
    let body;
    let text = "";
    let filename = "";
    
    if (contentType.includes("multipart/form-data")) {
      // Handle multipart form data (file upload)
      const formData = await req.formData();
      const file = formData.get("file");
      
      if (file && file instanceof File) {
        text = await file.text();
        filename = file.name;
      }
      
      // Get other form parameters
      const questionCount = parseInt(formData.get("num_questions")?.toString() || "1", 10);
      const answerOptions = parseInt(formData.get("num_options")?.toString() || "4", 10);
      const questionType = formData.get("question_type")?.toString() || "multiple_choice";
      const difficulty = formData.get("difficulty")?.toString() || "medium";
      
      body = { 
        num_questions: questionCount, 
        num_options: answerOptions, 
        question_type: questionType, 
        difficulty: difficulty,
        text, 
        filename 
      };
    } else {
      // Handle regular JSON request
      body = await req.json();
    }
    
    // Parse input parameters with defaults
    const questionCount = body.num_questions || 1; // Set minimum to 1
    const answerOptions = body.num_options || 4;
    const questionType = body.question_type || "multiple_choice";
    const difficulty = body.difficulty || "medium";
    text = body.text || text;
    filename = body.filename || filename;
    
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
        options: null,  // No options for fill in the blank
        correct_answer: answer,
        explanation: `${topic} is indeed a ${answer} because...`,
        question_type: "fill_in_the_blank"
      });
    } else if (currentType === "short_answer") {
      // Short answer question
      const answer = `${topic} is a concept that refers to advanced technology`;
      
      questions.push({
        question: `In 1-2 sentences, describe what ${topic} is.`,
        options: null,  // No options for short answer
        correct_answer: answer,
        explanation: `A good answer would include key aspects of ${topic} such as...`,
        question_type: "short_answer"
      });
    } else if (currentType === "matching") {
      // Matching question
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
      
      questions.push({
        question: `Match the following terms related to ${topic}:`,
        options: [
          `a) ${matchItems[0]} - 1) ${matchAnswers[0]}`,
          `b) ${matchItems[1]} - 2) ${matchAnswers[1]}`,
          `c) ${matchItems[2]} - 3) ${matchAnswers[2]}`,
          `d) ${matchItems[3]} - 4) ${matchAnswers[3]}`
        ],
        correct_answer: `a) 1, b) 2, c) 3, d) 4`,
        explanation: `These are the correct matches for terms related to ${topic}.`,
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
