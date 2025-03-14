
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file");
    const numQuestions = formData.get("num_questions") || "5";
    const numOptions = formData.get("num_options") || "4";
    const questionType = formData.get("question_type") || "multiple_choice";
    const difficulty = formData.get("difficulty") || "medium";

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No file uploaded or invalid file" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("File received:", file.name, "Size:", file.size);
    console.log("Settings:", { numQuestions, numOptions, questionType, difficulty });

    // For now, we'll simulate the API response with a mocked response
    // In a real implementation, you would send this to another service or process it here

    // Mock data structure that matches your API response format
    const questions = [
      {
        question: "According to the notes, which form is associated with the Work Opportunity Credit?",
        options: [
          "Form 3800",
          "Form 8826",
          "Form 5884",
          "Form 1040"
        ],
        correct_answer: "Form 5884",
        explanation: "The text states \"Work Opportunity Credit - form 5884\".",
        question_type: "multiple_choice"
      },
      {
        question: "The Disabled Access Credit can apply to what kind of expenditure?",
        options: [
          "New building construction",
          "Providing access to disabled people",
          "Employee salaries",
          "Office supplies"
        ],
        correct_answer: "Providing access to disabled people",
        explanation: "The text says \"Qualifying expenditure to provide access to disabled people\".",
        question_type: "multiple_choice"
      },
      {
        question: "For the Work Opportunity Credit, how many hours must an employee work in a calendar year to be eligible for the credit?",
        options: [
          "At least 40 hours",
          "At least 80 hours",
          "At least 128 hours",
          "At least 200 hours"
        ],
        correct_answer: "At least 128 hours",
        explanation: "The text mentions \"At least 128 hrs in a calendar year to be eligible for the credit\".",
        question_type: "multiple_choice"
      },
      {
        question: "The notes suggest that the credit is NOT allowed for a new building regarding which other credit?",
        options: [
          "General Business Credit",
          "Work Opportunity Credit",
          "Disabled Access Credit",
          "Small Business Credit"
        ],
        correct_answer: "Disabled Access Credit",
        explanation: "The notes say \"Credit not allowed for new building\" referring to the Disabled Access Credit.",
        question_type: "multiple_choice"
      }
    ];

    // In a real implementation, you would generate these questions based on the file content
    const response = {
      questions: questions.slice(0, parseInt(numQuestions as string)),
      source_text_summary: "The image contains handwritten notes about various business-related tax credits."
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-file-quiz function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
