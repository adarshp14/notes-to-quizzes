import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-in-the-blank' | 'short-answer' | 'matching' | 'mixed';

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MatchItem {
  item: string;
  match: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  answers: Answer[];
  explanation?: string;
  options?: string[];
  matchItems?: MatchItem[];
  correctMatching?: string;
  correctLetter?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  createdAt: Date;
}

interface ApiQuestion {
  question: string;
  options: string[] | null;
  correct_answer: string;
  correct_letter?: string;
  clean_answer?: string;
  explanation: string;
  question_type: string;
}

export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
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

export const convertApiResponsesToQuestions = (apiQuestions: ApiQuestion[]): Question[] => {
  return apiQuestions.map(apiQ => {
    // Determine the question type based on API response
    let questionType: QuestionType;
    
    // Map API question types to our app's question types
    switch(apiQ.question_type) {
      case 'true_false':
        questionType = 'true-false';
        break;
      case 'fill_in_the_blank':
        questionType = 'fill-in-the-blank';
        break;
      case 'short_answer':
        questionType = 'short-answer';
        break;
      case 'matching':
      case 'mixed':
        questionType = 'multiple-choice';
        break;
      case 'multiple_choice':
        questionType = 'multiple-choice';
        break;
      default:
        // Default to multiple-choice if unknown
        questionType = 'multiple-choice';
    }
    
    // Special detection of true/false questions based on content
    if ((apiQ.correct_answer === 'True' || apiQ.correct_answer === 'False') &&
        (apiQ.options?.length === 2 && 
         apiQ.options.includes('True') && 
         apiQ.options.includes('False'))) {
      questionType = 'true-false';
    }
    
    // Ensure options is an array
    const options = apiQ.options || [];
    
    let answers: Answer[] = [];
    
    // Process answers based on question type
    if (questionType === 'true-false') {
      // Create true/false answers - ensure both exist and only the correct one is marked
      answers = [
        {
          id: generateId(),
          text: 'True',
          isCorrect: apiQ.correct_answer === 'True'
        },
        {
          id: generateId(),
          text: 'False',
          isCorrect: apiQ.correct_answer === 'False'
        }
      ];
    }
    else if (questionType === 'fill-in-the-blank' || questionType === 'short-answer') {
      // Create a single correct answer
      answers = [{
        id: generateId(),
        text: apiQ.correct_answer,
        isCorrect: true
      }];
    }
    else if (questionType === 'multiple-choice') {
      // For multiple-choice questions
      if (options.length > 0) {
        // Check for letter-based answer (A, B, C, D)
        const letterPrefix = apiQ.correct_letter || extractLetterPrefix(apiQ.correct_answer);
        let correctIndex = -1;
        
        if (letterPrefix) {
          // Convert letter to index (A=0, B=1, etc.)
          correctIndex = letterPrefix.charCodeAt(0) - 65;
          // Ensure the index is valid
          if (correctIndex < 0 || correctIndex >= options.length) {
            correctIndex = -1; // Reset if invalid
          }
        }
        
        // If letter-based matching failed, try text-based matching
        if (correctIndex === -1) {
          const cleanedCorrectAnswer = apiQ.clean_answer || cleanAnswerText(apiQ.correct_answer);
          
          // Find match by comparing cleaned text
          for (let i = 0; i < options.length; i++) {
            if (cleanAnswerText(options[i]).toLowerCase() === cleanedCorrectAnswer.toLowerCase()) {
              correctIndex = i;
              break;
            }
          }
        }
        
        // Default to first option if still not found
        if (correctIndex === -1 && options.length > 0) {
          correctIndex = 0;
        }
        
        // Create answer objects from options
        answers = options.map((option, idx) => {
          return {
            id: generateId(),
            text: option,
            isCorrect: idx === correctIndex
          };
        });
      } else if (apiQ.correct_answer) {
        // If no options but we have a correct answer, create it
        answers = [{
          id: generateId(),
          text: cleanAnswerText(apiQ.correct_answer),
          isCorrect: true
        }];
      }
    }

    // Create question object
    const question: Question = {
      id: generateId(),
      text: apiQ.question,
      type: questionType,
      answers,
      options,
      explanation: apiQ.explanation
    };
    
    // Add letter-based information for multiple-choice questions
    if (questionType === 'multiple-choice' && apiQ.correct_letter) {
      question.correctLetter = apiQ.correct_letter;
    }

    return question;
  });
};

export const generateDemoQuestions = (
  notes: string,
  count: number,
  answerOptions: number,
  questionTypes: QuestionType,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<Question[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const questions: Question[] = [];

      const notesWords = notes.split(/\s+/).filter(word => word.length > 4);
      const uniqueWords = [...new Set(notesWords)];

      const topics = uniqueWords
        .slice(0, Math.min(count * 2, uniqueWords.length))
        .filter(() => Math.random() > 0.3)
        .map(word => word.replace(/[^a-zA-Z]/g, ''))
        .filter(word => word.length > 3);

      for (let i = 0; i < count; i++) {
        let type: QuestionType = 'multiple-choice';

        if (questionTypes === 'mixed') {
          const types: QuestionType[] = ['multiple-choice', 'true-false', 'fill-in-the-blank', 'short-answer', 'matching'];
          type = types[Math.floor(Math.random() * types.length)];
        } else {
          type = questionTypes;
        }

        const topic = topics[i % topics.length] || 'concept';

        let questionText = '';
        if (difficulty === 'easy') {
          questionText = `What is the definition of ${topic}?`;
        } else if (difficulty === 'medium') {
          questionText = `How does ${topic} relate to the key concepts in these notes?`;
        } else {
          questionText = `Analyze the significance of ${topic} in the context of the broader subject matter.`;
        }

        const answers: Answer[] = [];

        if (type === 'multiple-choice') {
          const options = answerOptions;
          answers.push({
            id: generateId(),
            text: `This is the correct definition of ${topic}`,
            isCorrect: true
          });

          for (let j = 1; j < options; j++) {
            answers.push({
              id: generateId(),
              text: `This is incorrect option ${j} about ${topic}`,
              isCorrect: false
            });
          }

          answers.sort(() => Math.random() - 0.5);
        } 
        else if (type === 'true-false') {
          const correctAnswer = Math.random() > 0.5;
          answers.push({
            id: generateId(),
            text: 'True',
            isCorrect: correctAnswer
          });
          answers.push({
            id: generateId(),
            text: 'False',
            isCorrect: !correctAnswer
          });
        } 
        else if (type === 'fill-in-the-blank') {
          questionText = `${topic} is a key concept in this field. ${topic} can be defined as ___________.`;
          answers.push({
            id: generateId(),
            text: `The correct definition of ${topic}`,
            isCorrect: true
          });
        } 
        else if (type === 'short-answer') {
          questionText = `Briefly explain the concept of ${topic} in your own words.`;
          answers.push({
            id: generateId(),
            text: `A proper explanation of ${topic} would include key points about its definition, purpose, and application.`,
            isCorrect: true
          });
        } 
        else if (type === 'matching') {
          questionText = `Match the following terms with their correct definitions:`;
          
          const matchTerms = ['Term A', 'Term B', 'Term C', 'Term D'].slice(0, Math.min(4, answerOptions));
          
          answers.push({
            id: generateId(),
            text: `${matchTerms.join(', ')} matched with their correct definitions`,
            isCorrect: true
          });
          
          for (let j = 1; j < answerOptions; j++) {
            answers.push({
              id: generateId(),
              text: `Incorrect matching option ${j}`,
              isCorrect: false
            });
          }
          
          answers.sort(() => Math.random() - 0.5);
        }

        questions.push({
          id: generateId(),
          text: questionText,
          type,
          answers,
          explanation: `This explanation provides context about ${topic} and why the correct answer is correct.`
        });
      }

      if (questionTypes === 'mixed') {
        questions.sort(() => Math.random() - 0.5);
      }

      resolve(questions);
    }, 2000);
  });
};

export const createQuiz = (title: string, questions: Question[]): Quiz => {
  return {
    id: generateId(),
    title,
    questions,
    createdAt: new Date()
  };
};

export const saveQuiz = (quiz: Quiz): void => {
  try {
    const savedQuizzes = getSavedQuizzes();
    savedQuizzes.push(quiz);
    localStorage.setItem('savedQuizzes', JSON.stringify(savedQuizzes));
    toast.success('Quiz saved successfully');
  } catch (error) {
    console.error('Error saving quiz:', error);
    toast.error('Failed to save quiz');
  }
};

export const getSavedQuizzes = (): Quiz[] => {
  try {
    const quizzes = localStorage.getItem('savedQuizzes');
    return quizzes ? JSON.parse(quizzes) : [];
  } catch (error) {
    console.error('Error getting saved quizzes:', error);
    return [];
  }
};

export const generatePDF = (
  quiz: Quiz,
  userAnswers?: Record<string, string | null>
): void => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    doc.setFontSize(16);
    doc.text(quiz.title || 'Quiz Results', 14, 20);

    const rows: any[] = [];

    quiz.questions.forEach((q, index) => {
      const correctAnswer = q.answers.find(a => a.isCorrect);

      let userAnswerText = 'N/A';
      if (userAnswers) {
        const userAnswerId = userAnswers[q.id];
        const userAnswerObj = q.answers.find(a => a.id === userAnswerId);
        if (userAnswerObj) {
          userAnswerText = userAnswerObj.text;
        }
      }

      const explanation = q.explanation || '';

      rows.push([
        `Q${index + 1}`,
        q.text,
        userAnswerText,
        correctAnswer ? correctAnswer.text : 'N/A',
        explanation
      ]);
    });

    autoTable(doc, {
      startY: 30,
      head: [['#', 'Question', 'Your Answer', 'Correct Answer', 'Explanation']],
      body: rows,

      styles: {
        fontSize: 9,
        cellPadding: 3,
        valign: 'top',
        overflow: 'linebreak',
      },

      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 50 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 },
        4: {
          cellWidth: 60,
          overflow: 'linebreak',
        },
      },

      margin: { left: 10, right: 10 },
      tableWidth: 'wrap',
      pageBreak: 'auto',
    });

    doc.save('quiz_results.pdf');
    toast.success('Quiz PDF generated and downloaded successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF');
  }
};
