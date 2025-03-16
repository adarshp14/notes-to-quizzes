
import { Question, QuestionType, Answer, generateId } from '@/utils/quizUtils';

export const mapToQuestionType = (typeStr: string): QuestionType => {
  switch(typeStr.toLowerCase()) {
    case 'multiple-choice':
    case 'multiple_choice':
      return 'multiple-choice';
    case 'true-false':
    case 'true_false':
      return 'true-false';
    case 'fill-in-the-blank':
    case 'fill_in_the_blank':
      return 'fill-in-the-blank';
    case 'short-answer':
    case 'short_answer':
      return 'short-answer';
    default:
      return 'multiple-choice'; // Default to multiple-choice if unknown
  }
};

export const cleanAnswerText = (text: string): string => {
  if (!text) return '';
  return text.replace(/^[a-z][\)\.]?\s*/i, '').trim();
};

export const extractLetterPrefix = (text: string): string | null => {
  if (!text) return null;
  const match = text.match(/^([a-d])[.)\s]/i);
  return match ? match[1].toUpperCase() : null;
};

export const processQuestions = (receivedQuestions: any[]): Question[] => {
  console.log("Original questions from API:", receivedQuestions);
  
  const processedQuestions = receivedQuestions.map((question, index) => {
    let questionType: QuestionType = mapToQuestionType(question.question_type || question.type || '');
    
    const isTrueFalseQuestion = 
      (questionType === 'true-false') || 
      ((question.options?.includes('True') && question.options?.includes('False') && question.options?.length === 2)) ||
      ((question.correct_answer === 'True' || question.correct_answer === 'False'));
    
    if (isTrueFalseQuestion) {
      return processTrueFalseQuestion(question, index);
    } 
    else if (questionType === 'multiple-choice') {
      return processMultipleChoiceQuestion(question, index);
    }
    else if (questionType === 'fill-in-the-blank' || questionType === 'short-answer') {
      return processTextInputQuestion(question, index, questionType);
    }
    else {
      // Handle other question types or use multiple-choice as fallback
      return processMultipleChoiceQuestion(question, index);
    }
  });
  
  const filteredQuestions = processedQuestions.filter(q => 
    q.type !== 'matching' && q.type !== 'mixed'
  );
  
  logProcessedQuestions(filteredQuestions);
  
  return filteredQuestions;
};

const processTrueFalseQuestion = (question: any, index: number): Question => {
  const answers = [
    {
      id: `tf-true-${index}`,
      text: 'True',
      isCorrect: question.correct_answer === 'True'
    },
    {
      id: `tf-false-${index}`,
      text: 'False',
      isCorrect: question.correct_answer === 'False'
    }
  ];

  return {
    id: question.id || `${index + 1}`,
    text: question.question || question.text,
    type: 'true-false',
    answers: answers,
    explanation: question.explanation || ''
  };
};

const processMultipleChoiceQuestion = (question: any, index: number): Question => {
  const options = question.options || [];
  let answers: Answer[] = [];
  
  console.log(`Processing multiple-choice Q${index + 1}:`, {
    options,
    correctAnswer: question.correct_answer,
    correctLetter: question.correct_letter,
    cleanAnswer: question.clean_answer
  });
  
  if (options && options.length > 0) {
    let correctIndex = 0; // Default to first option if we can't determine
    const letterPrefix = question.correct_letter || extractLetterPrefix(question.correct_answer);
    
    if (letterPrefix) {
      correctIndex = letterPrefix.charCodeAt(0) - 65;
      if (correctIndex < 0 || correctIndex >= options.length) {
        console.log(`Invalid letter index ${correctIndex} for Q${index+1}, defaulting to 0`);
        correctIndex = 0;
      }
      console.log(`Using letter prefix "${letterPrefix}" for correct index: ${correctIndex}`);
    } 
    else if (question.correct_answer) {
      const cleanedCorrectAnswer = question.clean_answer || cleanAnswerText(question.correct_answer);
      for (let i = 0; i < options.length; i++) {
        const optionText = cleanAnswerText(options[i]);
        if (optionText.toLowerCase() === cleanedCorrectAnswer.toLowerCase()) {
          correctIndex = i;
          break;
        }
      }
      console.log(`Using text matching for correct index: ${correctIndex}, Answer: "${cleanedCorrectAnswer}"`);
    }
    
    answers = options.map((option: string, idx: number) => {
      return {
        id: `${index}-${idx}`,
        text: cleanAnswerText(option) || `Option ${idx + 1}`,
        isCorrect: idx === correctIndex
      };
    });
    
    console.log(`Created ${answers.length} answers for Q${index + 1} with correct index ${correctIndex}`);
  } 
  else if (question.correct_answer) {
    answers = [{
      id: `${index}-0`,
      text: cleanAnswerText(question.correct_answer) || "Correct Answer",
      isCorrect: true
    }];
    console.log(`Created single answer for Q${index + 1} from correct_answer`);
  }
  
  if (!answers || answers.length === 0) {
    console.log(`No answers were created for Q${index + 1}, creating fallbacks`);
    answers = [
      {
        id: `${index}-fallback-0`,
        text: "Option A",
        isCorrect: true
      },
      {
        id: `${index}-fallback-1`,
        text: "Option B",
        isCorrect: false
      },
      {
        id: `${index}-fallback-2`,
        text: "Option C",
        isCorrect: false
      },
      {
        id: `${index}-fallback-3`,
        text: "Option D",
        isCorrect: false
      }
    ];
  }
  
  console.log(`Final answers for Q${index + 1}:`, answers);
  
  return { 
    id: question.id || `${index + 1}`,
    text: question.question || question.text,
    type: 'multiple-choice',
    answers: answers,
    explanation: question.explanation || ''
  };
};

const processTextInputQuestion = (question: any, index: number, questionType: QuestionType): Question => {
  // Create a single correct answer
  const answers = [{
    id: `${index}-0`,
    text: cleanAnswerText(question.correct_answer) || "Correct Answer",
    isCorrect: true
  }];
  
  return { 
    id: question.id || `${index + 1}`,
    text: question.question || question.text,
    type: questionType,
    answers: answers,
    explanation: question.explanation || ''
  };
};

const logProcessedQuestions = (questions: Question[]) => {
  console.log("Processed questions:", questions);
  questions.forEach((q, i) => {
    console.log(`Question ${i+1} (${q.type}):`, q.text);
    console.log(`Answers for Q${i+1}:`, q.answers);
    if (!q.answers || q.answers.length === 0) {
      console.error(`ERROR: No answers for question ${i+1}!`);
    }
  });
};
