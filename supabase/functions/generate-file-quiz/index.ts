
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
      const questionCount = parseInt(formData.get("num_questions")?.toString() || "5", 10);
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
    const questionCount = body.num_questions || 5; // Default to 5 questions
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
      textLength: text ? text.length : 0,
      hasFilename: Boolean(filename)
    });
    
    if ((!text || text.trim().length === 0) && !filename) {
      return new Response(
        JSON.stringify({ 
          error: "No content provided for quiz generation",
          questions: []
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Extract key topics from the text (simple approach)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const keyPhrases = extractKeyPhrases(text || filename);
    
    console.log(`Extracted ${keyPhrases.length} key phrases and ${sentences.length} sentences`);
    
    // Generate questions based on provided text or file
    const questions = generateQuestions(
      text || filename, 
      keyPhrases,
      sentences,
      questionCount, 
      answerOptions, 
      questionType, 
      difficulty
    );
    
    console.log(`Generated ${questions.length} questions of type ${questionType}`);
    
    // Create a summary
    let summary = "";
    if (text) {
      summary = summarizeText(text);
    } else {
      summary = `Quiz generated from file "${filename}" with ${questionCount} questions.`;
    }
    
    return new Response(
      JSON.stringify({ 
        questions,
        source_text_summary: summary
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-file-quiz function:", error);
    return new Response(JSON.stringify({ error: error.message, questions: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Function to summarize text
function summarizeText(text: string): string {
  // Simple summarization - take first few sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let summary = "";
  
  // Get some sentences from beginning, middle and end
  if (sentences.length > 2) {
    summary = sentences.slice(0, 2).join('. ') + '. ';
    if (sentences.length > 5) {
      summary += sentences[Math.floor(sentences.length / 2)].trim() + '. ';
    }
    summary += sentences[sentences.length - 1].trim() + '.';
  } else {
    summary = text.length > 200 ? text.substring(0, 200) + "..." : text;
  }
  
  return summary;
}

// Function to extract key phrases from text
function extractKeyPhrases(text: string): string[] {
  // Simple extraction - get noun phrases and important terms
  const words = text.split(/\s+/);
  const phrases: string[] = [];
  
  // Use a sliding window to find potential phrases
  for (let i = 0; i < words.length; i++) {
    // Skip common words
    if (isCommonWord(words[i])) continue;
    
    // Single word phrases (longer words)
    if (words[i].length > 6) {
      phrases.push(words[i]);
    }
    
    // Two word phrases
    if (i < words.length - 1 && !isCommonWord(words[i+1])) {
      phrases.push(`${words[i]} ${words[i+1]}`);
    }
    
    // Three word phrases
    if (i < words.length - 2 && !isCommonWord(words[i+1]) && !isCommonWord(words[i+2])) {
      phrases.push(`${words[i]} ${words[i+1]} ${words[i+2]}`);
    }
  }
  
  // Remove duplicates and limit to a reasonable number
  return [...new Set(phrases)].slice(0, 50);
}

// Check if a word is common/stopword
function isCommonWord(word: string): boolean {
  const stopwords = ["the", "and", "a", "an", "in", "on", "at", "to", "for", "of", "with", "by", "as", 
                     "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
                     "do", "does", "did", "will", "would", "shall", "should", "may", "might",
                     "must", "can", "could", "that", "this", "these", "those", "their", "they"];
  return stopwords.includes(word.toLowerCase());
}

// Function to generate quiz questions
function generateQuestions(
  source: string,
  keyPhrases: string[],
  sentences: string[],
  count = 5, // Default to 5 questions
  options = 4, 
  type = "multiple_choice", 
  difficulty = "medium"
): any[] {
  const questions = [];
  
  // Fallback topics if source doesn't provide enough content
  const fallbackTopics = [
    "artificial intelligence",
    "machine learning",
    "deep learning",
    "neural networks",
    "natural language processing",
    "computer vision",
    "robotics",
    "data science",
    "ethics in AI",
    "future of AI"
  ];
  
  // Use extracted phrases or fallback to defaults
  const topics = keyPhrases.length > count
    ? keyPhrases
    : fallbackTopics;
  
  // If mixed type is requested, we'll generate a variety of question types
  const questionTypes = type === "mixed" 
    ? ["multiple_choice", "true_false", "fill_in_the_blank", "short_answer"]
    : [type];
  
  for (let i = 0; i < count; i++) {
    try {
      // Select a topic and sentence for this question
      const topicIndex = Math.floor(Math.random() * topics.length);
      const topic = topics[topicIndex] || fallbackTopics[i % fallbackTopics.length];
      
      // Get a related sentence if possible
      let relatedSentence = "";
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(topic.toLowerCase())) {
          relatedSentence = sentence;
          break;
        }
      }
      
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
      
      // Use the related sentence to enhance the question if available
      if (relatedSentence && difficulty !== "easy") {
        questionText = `Based on the text: "${relatedSentence.trim()}", ${questionText.toLowerCase()}`;
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
          question: `Complete this statement: ${topic} is a __________ that impacts modern technology.`,
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
      }
    } catch (error) {
      console.error(`Error generating question ${i+1}:`, error);
      // Add a fallback question
      questions.push({
        question: `What is the importance of ${fallbackTopics[i % fallbackTopics.length]}?`,
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        correct_answer: "Option 1",
        explanation: "This is a fallback explanation.",
        question_type: "multiple_choice"
      });
    }
  }
  
  return questions;
}
