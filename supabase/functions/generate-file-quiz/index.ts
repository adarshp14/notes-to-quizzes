
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
    
    // For now, generate some demo questions
    const questionCount = body.num_questions || 5;
    const answerOptions = body.num_options || 4;
    const questionType = body.question_type || "multiple_choice";
    const difficulty = body.difficulty || "medium";
    
    // Generate questions based on provided text
    const questions = generateDemoQuestions(questionCount, answerOptions, questionType, difficulty);
    
    return new Response(
      JSON.stringify({ 
        questions,
        source_text_summary: "This is a demo summary generated by the Supabase Edge Function."
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

// Helper function to generate demo questions
function generateDemoQuestions(count = 5, options = 4, type = "multiple_choice", difficulty = "medium") {
  const questions = [];
  
  const topics = [
    "artificial intelligence",
    "quantum computing",
    "machine learning",
    "blockchain technology",
    "renewable energy",
    "space exploration",
    "cybersecurity",
    "biotechnology"
  ];
  
  for (let i = 0; i < count; i++) {
    const topicIndex = Math.floor(Math.random() * topics.length);
    const topic = topics[topicIndex];
    
    if (type === "multiple_choice") {
      const optionsArray = [];
      const correctIndex = Math.floor(Math.random() * options);
      
      for (let j = 0; j < options; j++) {
        if (j === correctIndex) {
          optionsArray.push(`Answer about ${topic}`);
        } else {
          optionsArray.push(`Wrong answer ${j + 1} about ${topic}`);
        }
      }
      
      questions.push({
        question: `What is the main concept of ${topic}?`,
        options: optionsArray,
        correct_answer: optionsArray[correctIndex],
        explanation: `This is a demo explanation about ${topic}.`,
        question_type: "multiple_choice"
      });
    } else {
      // True/False question
      const isTrue = Math.random() > 0.5;
      questions.push({
        question: `Is ${topic} transforming modern technology?`,
        options: ["True", "False"],
        correct_answer: isTrue ? "True" : "False",
        explanation: `This is a demo explanation about whether ${topic} is transforming modern technology.`,
        question_type: "true_false"
      });
    }
  }
  
  return questions;
}
