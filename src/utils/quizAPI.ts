
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
    const baseUrl = import.meta.env.VITE_API_URL || '';
    console.log("Calling API with URL:", baseUrl);
    
    const apiQuestionType = getApiQuestionType(settings.questionTypes);

    const response = await fetch(`${baseUrl}/generate-text-quiz`, {
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
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.questions && Array.isArray(data.questions)) {
      return convertApiResponsesToQuestions(data.questions);
    } else {
      throw new Error('Invalid response from quiz generation API');
    }
  } catch (error) {
    console.error('Error generating quiz from notes:', error);
    // fallback to demo
    return generateDemoQuestions(
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
    const baseUrl = import.meta.env.VITE_API_URL || '';
    console.log("Calling API with URL:", baseUrl);
    
    const apiQuestionType = getApiQuestionType(settings.questionTypes);

    if (file.type === 'text/plain') {
      // If it's plain text, read its contents & call the API
      const textContent = await file.text();
      
      const response = await fetch(`${baseUrl}/generate-file-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textContent,
          num_questions: settings.questionCount,
          num_options: settings.answerOptions,
          question_type: apiQuestionType,
          difficulty: settings.difficulty
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.questions) {
        return convertApiResponsesToQuestions(data.questions);
      } else {
        throw new Error('Invalid response from quiz generation API');
      }
    } else {
      // For other file types, use FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('num_questions', settings.questionCount.toString());
      formData.append('num_options', settings.answerOptions.toString());
      formData.append('question_type', apiQuestionType);
      formData.append('difficulty', settings.difficulty);

      console.log("Sending file to API:", baseUrl);
      console.log("File being sent:", file.name, file.type, file.size);

      const response = await fetch(`${baseUrl}/generate-file-quiz`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from API:", errorText);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.questions) {
        return convertApiResponsesToQuestions(data.questions);
      } else {
        throw new Error('Invalid response from quiz generation API');
      }
    }
  } catch (error) {
    console.error('Error generating quiz from file:', error);
    // fallback to demo
    return generateDemoQuestions(
      file.name,
      settings.questionCount,
      settings.answerOptions,
      settings.questionTypes,
      settings.difficulty
    );
  }
};
