import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export type QuestionType = 'multiple-choice' | 'true-false';

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  answers: Answer[];
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  createdAt: Date;
}

interface ApiQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  question_type: string;
}

// Helper to create an ID
export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

// Convert API response format to our application's Question format
export const convertApiResponsesToQuestions = (apiQuestions: ApiQuestion[]): Question[] => {
  return apiQuestions.map(apiQ => {
    const questionType: QuestionType =
      apiQ.question_type === 'true_false' ? 'true-false' : 'multiple-choice';

    // Create answers array from options
    const answers: Answer[] = apiQ.options.map(option => ({
      id: generateId(),
      text: option,
      isCorrect: option === apiQ.correct_answer
    }));

    return {
      id: generateId(),
      text: apiQ.question,
      type: questionType,
      answers,
      explanation: apiQ.explanation
    };
  });
};

// Generate random questions for demo purposes
export const generateDemoQuestions = (
  notes: string,
  count: number,
  answerOptions: number,
  questionTypes: 'multiple-choice' | 'true-false' | 'mixed',
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<Question[]> => {
  return new Promise(resolve => {
    // This is a demo implementation - in a real app, you would use an API
    // like OpenAI to generate questions from the notes

    // Simulate API call delay
    setTimeout(() => {
      // Generate demo questions
      const questions: Question[] = [];

      const notesWords = notes.split(/\s+/).filter(word => word.length > 4);
      const uniqueWords = [...new Set(notesWords)];

      // Simple demo topics extraction
      const topics = uniqueWords
        .slice(0, Math.min(count * 2, uniqueWords.length))
        .filter(() => Math.random() > 0.3) // Randomly filter some words
        .map(word => word.replace(/[^a-zA-Z]/g, '')) // Clean up words
        .filter(word => word.length > 3); // Only keep substantial words

      for (let i = 0; i < count; i++) {
        // Determine if this question should be multiple choice or true/false
        let type: QuestionType = 'multiple-choice';

        if (questionTypes === 'true-false') {
          type = 'true-false';
        } else if (questionTypes === 'mixed') {
          type = Math.random() > 0.5 ? 'multiple-choice' : 'true-false';
        }

        // Generate question
        const topic = topics[i % topics.length] || 'concept';

        // Create question text based on difficulty
        let questionText = '';
        if (difficulty === 'easy') {
          questionText = `What is the definition of ${topic}?`;
        } else if (difficulty === 'medium') {
          questionText = `How does ${topic} relate to the key concepts in these notes?`;
        } else {
          questionText = `Analyze the significance of ${topic} in the context of the broader subject matter.`;
        }

        // Create answers
        const answers: Answer[] = [];

        if (type === 'multiple-choice') {
          // Number of options for multiple choice
          const options = answerOptions;

          // Generate correct answer
          answers.push({
            id: generateId(),
            text: `This is the correct definition of ${topic}`,
            isCorrect: true
          });

          // Generate distractors
          for (let j = 1; j < options; j++) {
            answers.push({
              id: generateId(),
              text: `This is incorrect option ${j} about ${topic}`,
              isCorrect: false
            });
          }

          // Shuffle answers
          answers.sort(() => Math.random() - 0.5);
        } else {
          // True/False question
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

        questions.push({
          id: generateId(),
          text: questionText,
          type,
          answers,
          explanation: `This explanation provides context about ${topic} and why the correct answer is correct.`
        });
      }

      resolve(questions);
    }, 2000); // Simulate API delay of 2 seconds
  });
};

// Create quiz from questions
export const createQuiz = (title: string, questions: Question[]): Quiz => {
  return {
    id: generateId(),
    title,
    questions,
    createdAt: new Date()
  };
};

// Save quiz to localStorage
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

// Get all saved quizzes from localStorage
export const getSavedQuizzes = (): Quiz[] => {
  try {
    const quizzes = localStorage.getItem('savedQuizzes');
    return quizzes ? JSON.parse(quizzes) : [];
  } catch (error) {
    console.error('Error getting saved quizzes:', error);
    return [];
  }
};

/**
 * Generate a PDF for the quiz, including user answers.
 *
 * @param quiz The quiz object (title, questions, etc.)
 * @param userAnswers A map of questionId -> userAnswerId
 */
export const generatePDF = (
  quiz: Quiz,
  userAnswers?: Record<string, string | null>
): void => {
  // If you do not pass userAnswers, we only list the correct answers & question text
  // If userAnswers is present, we also show the user's chosen answer

  try {
    const doc = new jsPDF({
      // You can specify page size or orientation if needed:
      // orientation: 'portrait',
      // unit: 'pt',
      // format: 'a4',
    });

    // Title at the top
    doc.setFontSize(16);
    doc.text(quiz.title || 'Quiz Results', 14, 20);

    // Prepare table rows
    const rows: any[] = [];

    quiz.questions.forEach((q, index) => {
      // Find the correct answer
      const correctAnswer = q.answers.find(a => a.isCorrect);

      // If userAnswers is provided, find the user's chosen answer
      let userAnswerText = 'N/A';
      if (userAnswers) {
        const userAnswerId = userAnswers[q.id];
        const userAnswerObj = q.answers.find(a => a.id === userAnswerId);
        if (userAnswerObj) {
          userAnswerText = userAnswerObj.text;
        }
      }

      // Explanation
      const explanation = q.explanation || '';

      // We'll push a row containing question #, question text, user answer, correct answer, explanation
      rows.push([
        `Q${index + 1}`,
        q.text,
        userAnswerText,
        correctAnswer ? correctAnswer.text : 'N/A',
        explanation
      ]);
    });

    // Use autoTable to generate a table
    autoTable(doc, {
      startY: 30,
      head: [['#', 'Question', 'Your Answer', 'Correct Answer', 'Explanation']],
      body: rows,

      // Global styles so text wraps by default
      styles: {
        fontSize: 9,
        cellPadding: 3,
        valign: 'top',
        overflow: 'linebreak', // ensures text wraps instead of cutting off
      },

      // Per-column styles
      columnStyles: {
        0: { cellWidth: 10 }, // # column
        1: { cellWidth: 50 }, // Question
        2: { cellWidth: 40 }, // Your Answer
        3: { cellWidth: 40 }, // Correct Answer
        4: {
          cellWidth: 60,
          overflow: 'linebreak',
        },
      },

      // Margins so the table isn't pressed against the edges
      margin: { left: 10, right: 10 },

      // Let autoTable wrap columns instead of pushing them off-page
      tableWidth: 'wrap',

      // Page-break automatically if the table is too tall
      pageBreak: 'auto',
    });

    // Save (download) the PDF
    doc.save('quiz_results.pdf');
    toast.success('Quiz PDF generated and downloaded successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF');
  }
};
