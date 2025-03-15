
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
          (question.options === null || question.options?.length === 0 || 
           question.options?.length === 1 || question.question_type === "short_answer")) {
        question.options = ["True", "False"];
        question.question_type = "true_false";
      }
      
      // Detect matching questions by correct_answer pattern (e.g., "a-4, b-1, c-3, d-2")
      if (question.correct_answer && 
          /^[a-z]-\d+(?:,\s*[a-z]-\d+)*$/i.test(question.correct_answer)) {
        question.question_type = "matching";
        
        // If options don't exist, create proper options for matching
        if (!question.options || question.options.length === 0) {
          // For matching questions, we need both items to match and their matches
          // Creating example items (left side)
          const matchCount = Math.min((question.correct_answer.match(/[a-z]-\d+/gi) || []).length, 4);
          const leftItems = Array.from({ length: matchCount }, (_, i) => 
            `Item ${String.fromCharCode(97 + i)}`
          );
          
          question.options = leftItems;
        }
        
        // Ensure the correct matching answer has actual matching pairs with proper format
        if (question.options && question.options.length > 0) {
          const matchPairs = [];
          const itemCount = Math.min(question.options.length, 4); // Limit to 4 pairs max for UI clarity
          
          for (let i = 0; i < itemCount; i++) {
            const letter = String.fromCharCode(97 + i);
            // Random matching but ensure each number is used only once
            const number = (i + 1).toString();
            matchPairs.push(`${letter}-${number}`);
          }
          
          question.correct_answer = matchPairs.join(", ");
        }
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
      
      // Special handling for mixed question type
      if (question.question_type === "mixed") {
        // Let's explicitly assign an actual question type based on the structure
        const isTrue = question.correct_answer === "True";
        const isFalse = question.correct_answer === "False";
        
        if (isTrue || isFalse) {
          question.question_type = "true_false";
          question.options = ["True", "False"];
        } else if (question.question.includes("_____")) {
          question.question_type = "fill_in_the_blank";
        } else if (question.options && question.options.length > 2) {
          question.question_type = "multiple_choice";
        } else {
          question.question_type = "short_answer";
        }
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
      // Matching question - let's create a more realistic example
      if (topic === "artificial intelligence" || topic.includes("ai")) {
        questionText = `Match the job title with its area of AI expertise.`;
      } else if (topic.includes("data") || topic.includes("science")) {
        questionText = `Match the data tool with its primary function.`;
      } else {
        questionText = `Match the following terms related to ${topic} with their definitions:`;
      }
      
      // Create the matching items (typically 4 items to match)
      const numItems = Math.min(4, options);
      
      // Create an array of left-side items
      const matchItems = [];
      for (let j = 0; j < numItems; j++) {
        matchItems.push(`${topic.charAt(0).toUpperCase() + topic.slice(1)} term ${j+1}`);
      }
      
      // Create the correct matching pattern (e.g., "a-2, b-1, c-4, d-3")
      const numbers = Array.from({length: numItems}, (_, i) => i + 1);
      // Shuffle the numbers for random matching
      const shuffledNumbers = [...numbers].sort(() => Math.random() - 0.5);
      
      const correctMatching = matchItems.map((_, index) => {
        const letter = String.fromCharCode(97 + index);
        return `${letter}-${shuffledNumbers[index]}`;
      }).join(", ");
      
      questions.push({
        question: questionText,
        options: matchItems,
        correct_answer: correctMatching,
        explanation: `This matching question tests your knowledge of terminology related to ${topic}.`,
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
