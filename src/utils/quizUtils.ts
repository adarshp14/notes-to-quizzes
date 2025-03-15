import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-in-the-blank' | 'short-answer' | 'matching' | 'mixed';

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

export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

export const convertApiResponsesToQuestions = (apiQuestions: ApiQuestion[]): Question[] => {
  return apiQuestions.map(apiQ => {
    const questionType: QuestionType =
      apiQ.question_type === 'true_false' ? 'true-false' : 'multiple-choice';

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
