
import { Question, convertApiResponsesToQuestions, generateDemoQuestions } from "./quizUtils";
import { QuizSettings } from "@/components/QuizCustomizer";
import { toast } from "sonner";

// Helper to convert app question type to API format
export const getApiQuestionType = (questionType: string): string => {
  switch (questionType) {
    case 'multiple-choice': return 'multiple_choice';
    case 'true-false': return 'true_false';
    case 'fill-in-the-blank': return 'fill_in_the_blank';
    case 'short-answer': return 'short_answer';
    case 'matching': return 'matching';
    default: return 'mixed';
  }
};

// Generate quiz from text notes
export const generateQuizFromNotes = async (
  notes: string,
  settings: QuizSettings
): Promise<Question[]> => {
  try {
    console.log("DEBUG - Starting generateQuizFromNotes");
    console.log("DEBUG - Environment variables:", import.meta.env);
    
    const apiQuestionType = getApiQuestionType(settings.questionTypes);
    
    // Get the API URL from environment variables with proper fallback
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // Check if API URL is configured
    if (!apiUrl) {
      console.error("DEBUG - No API URL configured, using fallback demo questions");
      toast.error("API not configured. Using demo questions instead.");
      return await generateDemoQuestions(
        notes,
        settings.questionCount,
        settings.answerOptions,
        settings.questionTypes,
        settings.difficulty
      );
    }
    
    // Direct API call to the text quiz endpoint
    const endpoint = `${apiUrl}/generate-text-quiz`;
    
    console.log("DEBUG - Calling API endpoint:", endpoint);
    console.log("DEBUG - with settings:", {
      notes: notes.substring(0, 50) + "...",
      questionCount: settings.questionCount,
      answerOptions: settings.answerOptions,
      questionType: apiQuestionType,
      difficulty: settings.difficulty
    });

    // Set a reasonable timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: notes,
          num_questions: settings.questionCount,
          num_options: settings.answerOptions,
          question_type: apiQuestionType,
          difficulty: settings.difficulty
        }),
        signal: controller.signal
      });
      
      // Clear the timeout since the request completed
      clearTimeout(timeoutId);

      console.log("DEBUG - API Response status:", response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("DEBUG - Error response from API:", errorText);
        toast.error(`API error: ${response.status} ${response.statusText}`);
        console.log("DEBUG - Falling back to demo questions");
        return await generateDemoQuestions(
          notes,
          settings.questionCount,
          settings.answerOptions,
          settings.questionTypes,
          settings.difficulty
        );
      }

      const data = await response.json();
      console.log("DEBUG - API Response data:", data);
      
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        return convertApiResponsesToQuestions(data.questions);
      } else {
        console.log("DEBUG - API returned empty or invalid questions array, using fallback");
        toast.warning("Couldn't generate questions from your content. Using demo questions instead.");
        return await generateDemoQuestions(
          notes,
          settings.questionCount,
          settings.answerOptions,
          settings.questionTypes,
          settings.difficulty
        );
      }
    } catch (fetchError: any) {
      // Clear the timeout in case of error
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error("DEBUG - Request timed out");
        toast.error("Request timed out. Using demo questions instead.");
      } else {
        console.error("DEBUG - Fetch error:", fetchError);
        toast.error("Network error. Using demo questions instead.");
      }
      
      return await generateDemoQuestions(
        notes,
        settings.questionCount,
        settings.answerOptions,
        settings.questionTypes,
        settings.difficulty
      );
    }
  } catch (error) {
    console.error('DEBUG - Error generating quiz from notes:', error);
    toast.error('Error generating quiz. Using demo questions instead.');
    return await generateDemoQuestions(
      notes,
      settings.questionCount,
      settings.answerOptions,
      settings.questionTypes,
      settings.difficulty
    );
  }
};

// Generate quiz from file
export const generateQuizFromFile = async (
  file: File,
  settings: QuizSettings
): Promise<Question[]> => {
  try {
    console.log("DEBUG - Starting generateQuizFromFile");
    console.log("DEBUG - Environment variables:", import.meta.env);
    
    const apiQuestionType = getApiQuestionType(settings.questionTypes);
    
    // Get the API URL from environment variables with proper fallback
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // Check if API URL is configured
    if (!apiUrl) {
      console.error("DEBUG - No API URL configured, using fallback demo questions");
      toast.error("API not configured. Using demo questions instead.");
      return await generateDemoQuestions(
        file.name,
        settings.questionCount,
        settings.answerOptions,
        settings.questionTypes,
        settings.difficulty
      );
    }
    
    // Set a reasonable timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      if (file.type === 'text/plain') {
        // If it's plain text, read its contents & call the API
        const textContent = await file.text();
        
        console.log("DEBUG - Sending text file content with length:", textContent.length);
        
        const endpoint = `${apiUrl}/generate-text-quiz`; // Use text endpoint for text files
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textContent,
            num_questions: settings.questionCount,
            num_options: settings.answerOptions,
            question_type: apiQuestionType,
            difficulty: settings.difficulty
          }),
          signal: controller.signal
        });
        
        // Clear the timeout since the request completed
        clearTimeout(timeoutId);

        console.log("DEBUG - API Response status:", response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("DEBUG - Error response from API:", errorText);
          toast.error(`API error: ${response.status} ${response.statusText}`);
          console.log("DEBUG - Falling back to demo questions");
          return await generateDemoQuestions(
            file.name,
            settings.questionCount,
            settings.answerOptions,
            settings.questionTypes,
            settings.difficulty
          );
        }

        const data = await response.json();
        console.log("DEBUG - API Response data:", data);
        
        if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
          return convertApiResponsesToQuestions(data.questions);
        } else {
          console.log("DEBUG - API returned empty or invalid questions array, using fallback");
          toast.warning("Couldn't generate questions from your file. Using demo questions instead.");
          return await generateDemoQuestions(
            file.name,
            settings.questionCount,
            settings.answerOptions,
            settings.questionTypes,
            settings.difficulty
          );
        }
      } else {
        // For other file types, use FormData and file endpoint
        const formData = new FormData();
        formData.append('file', file);
        formData.append('num_questions', settings.questionCount.toString());
        formData.append('num_options', settings.answerOptions.toString());
        formData.append('question_type', apiQuestionType);
        formData.append('difficulty', settings.difficulty);

        const endpoint = `${apiUrl}/generate-file-quiz`;
        
        console.log("DEBUG - Sending file to API:", endpoint);
        console.log("DEBUG - File being sent:", file.name, file.type, file.size);

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        
        // Clear the timeout since the request completed
        clearTimeout(timeoutId);

        console.log("DEBUG - API Response status:", response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("DEBUG - Error response from API:", errorText);
          toast.error(`API error: ${response.status} ${response.statusText}`);
          console.log("DEBUG - Falling back to demo questions");
          return await generateDemoQuestions(
            file.name,
            settings.questionCount,
            settings.answerOptions,
            settings.questionTypes,
            settings.difficulty
          );
        }

        const data = await response.json();
        console.log("DEBUG - API Response data:", data);
        
        if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
          return convertApiResponsesToQuestions(data.questions);
        } else {
          console.log("DEBUG - API returned empty or invalid questions array, using fallback");
          toast.warning("Couldn't generate questions from your file. Using demo questions instead.");
          return await generateDemoQuestions(
            file.name,
            settings.questionCount,
            settings.answerOptions,
            settings.questionTypes,
            settings.difficulty
          );
        }
      }
    } catch (fetchError: any) {
      // Clear the timeout in case of error
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error("DEBUG - Request timed out");
        toast.error("Request timed out. Using demo questions instead.");
      } else {
        console.error("DEBUG - Fetch error:", fetchError);
        toast.error("Network error. Using demo questions instead.");
      }
      
      return await generateDemoQuestions(
        file.name,
        settings.questionCount,
        settings.answerOptions,
        settings.questionTypes,
        settings.difficulty
      );
    }
  } catch (error) {
    console.error('DEBUG - Error generating quiz from file:', error);
    toast.error('Error generating quiz. Using demo questions instead.');
    return await generateDemoQuestions(
      file.name,
      settings.questionCount,
      settings.answerOptions,
      settings.questionTypes,
      settings.difficulty
    );
  }
};
