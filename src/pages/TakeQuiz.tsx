import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import QuizCard from '@/components/QuizCard';
import QuizResults from '@/components/QuizResults';
import { Question, QuestionType, generateId } from '@/utils/quizUtils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain } from 'lucide-react';
import { toast } from 'sonner';

const TakeQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | null>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const mapToQuestionType = (typeStr: string): QuestionType => {
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

  const cleanAnswerText = (text: string): string => {
    if (!text) return '';
    return text.replace(/^[a-z][\)\.]?\s*/i, '').trim();
  };

  const extractLetterPrefix = (text: string): string | null => {
    if (!text) return null;
    const match = text.match(/^([a-d])[.)\s]/i);
    return match ? match[1].toUpperCase() : null;
  };

  useEffect(() => {
    if (location.state?.questions) {
      setIsLoading(true);
      const receivedQuestions = location.state.questions as any[];
      
      const processedQuestions = receivedQuestions.map((question, index) => {
        let questionType: QuestionType = mapToQuestionType(question.question_type || question.type || '');
        
        const isTrueFalseQuestion = 
          (questionType === 'true-false') || 
          ((question.options?.includes('True') && question.options?.includes('False') && question.options?.length === 2)) ||
          ((question.correct_answer === 'True' || question.correct_answer === 'False'));
        
        if (isTrueFalseQuestion) {
          questionType = 'true-false';
          
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
        } 
        else if (questionType === 'multiple-choice') {
          const options = question.options || [];
          let answers = [];
          
          if (options.length > 0) {
            const letterPrefix = question.correct_letter || extractLetterPrefix(question.correct_answer);
            let correctIndex = -1;
            
            if (letterPrefix) {
              correctIndex = letterPrefix.charCodeAt(0) - 65;
            } else {
              const cleanedCorrectAnswer = question.clean_answer || cleanAnswerText(question.correct_answer);
              for (let i = 0; i < options.length; i++) {
                if (cleanAnswerText(options[i]).toLowerCase() === cleanedCorrectAnswer.toLowerCase()) {
                  correctIndex = i;
                  break;
                }
              }
            }
            
            if (correctIndex < 0 || correctIndex >= options.length) {
              correctIndex = 0;
            }
            
            answers = options.map((option: string, idx: number) => {
              return {
                id: `${index}-${idx}`,
                text: option,
                isCorrect: idx === correctIndex
              };
            });
          } else if (question.correct_answer) {
            answers = [{
              id: `${index}-0`,
              text: cleanAnswerText(question.correct_answer),
              isCorrect: true
            }];
          }
          
          return { 
            id: question.id || `${index + 1}`,
            text: question.question || question.text,
            type: questionType,
            answers: answers,
            explanation: question.explanation || ''
          };
        }
        else if (!question.answers || question.answers.length === 0) {
          const options = question.options || [];
          let answers = [];
          
          if (options.length > 0) {
            const cleanedCorrectAnswer = cleanAnswerText(question.correct_answer);
            
            answers = options.map((option: string, idx: number) => {
              const cleanedOption = cleanAnswerText(option);
              return {
                id: `${index}-${idx}`,
                text: option,
                isCorrect: cleanedOption === cleanedCorrectAnswer || option === question.correct_answer
              };
            });
            
            if (!answers.some(a => a.isCorrect) && cleanedCorrectAnswer) {
              for (let i = 0; i < answers.length; i++) {
                if (cleanAnswerText(answers[i].text).toLowerCase() === cleanedCorrectAnswer.toLowerCase()) {
                  answers[i].isCorrect = true;
                  break;
                }
              }
            }
          } else if (question.correct_answer) {
            answers = [{
              id: `${index}-0`,
              text: question.correct_answer,
              isCorrect: true
            }];
          } else {
            answers = [{
              id: `${index}-0`,
              text: "No answer provided",
              isCorrect: true
            }];
          }
          
          answers = answers.map((answer: any, aIdx: number) => {
            if (!answer.id) {
              return {
                ...answer,
                id: `${index}-${aIdx}`
              };
            }
            return answer;
          });
          
          return { 
            ...question, 
            id: question.id || `${index + 1}`,
            text: question.question || question.text,
            type: questionType,
            answers: answers
          };
        }
        
        const formattedAnswers = question.answers.map((answer: any, aIdx: number) => {
          if (!answer.id) {
            return {
              ...answer,
              id: `${index}-${aIdx}`
            };
          }
          return answer;
        });
        
        return { 
          ...question, 
          id: question.id || `${index + 1}`,
          text: question.question || question.text,
          type: questionType,
          answers: formattedAnswers
        };
      });
      
      const filteredQuestions = processedQuestions.filter(q => 
        q.type !== 'matching' && q.type !== 'mixed'
      );
      
      setQuestions(filteredQuestions);
      
      const initialAnswers: Record<string, string | null> = {};
      filteredQuestions.forEach(q => {
        initialAnswers[q.id] = null;
      });
      setUserAnswers(initialAnswers);
      setIsLoading(false);
    } else {
      toast.error("No quiz questions found. Redirecting to quiz creation.");
      navigate('/create');
    }
  }, [location.state, navigate]);

  const handleAnswerSelect = (answerId: string) => {
    if (questions.length === 0 || showResults) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerId
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsEvaluating(true);
      evaluateQuiz();
      setShowResults(true);
      setQuizCompleted(true);
    }
  };

  const evaluateQuiz = () => {
    const evaluatedAnswers = { ...userAnswers };
    
    questions.forEach(question => {
      const userAnswer = evaluatedAnswers[question.id];
      
      if (!userAnswer) return;
      
      if ((question.type === 'short-answer' || question.type === 'fill-in-the-blank') && 
          userAnswer !== 'incorrect') {
        const correctAnswer = question.answers.find(a => a.isCorrect);
        if (correctAnswer) {
          const isCorrect = cleanAnswerText(userAnswer).toLowerCase() === cleanAnswerText(correctAnswer.text).toLowerCase();
          evaluatedAnswers[question.id] = isCorrect ? correctAnswer.id : 'incorrect';
        }
      }
    });
    
    setUserAnswers(evaluatedAnswers);
    setIsEvaluating(false);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleRestartQuiz = () => {
    const initialAnswers: Record<string, string | null> = {};
    questions.forEach(q => {
      initialAnswers[q.id] = null;
    });
    setUserAnswers(initialAnswers);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setQuizCompleted(false);
    
    toast.success("Quiz restarted. Good luck!");
  };

  const handleBackToCreate = () => {
    navigate('/create');
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="page-container mt-20">
          <div className="text-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4"
            >
              <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </motion.div>
            <h2 className="text-xl font-semibold mb-2 dark:text-gray-200">Loading quiz questions...</h2>
            <p className="text-muted-foreground">Please wait while we prepare your quiz.</p>
          </div>
        </main>
      </>
    );
  }

  if (questions.length === 0) {
    return (
      <>
        <Header />
        <main className="page-container mt-20">
          <div className="text-center">
            <p className="dark:text-gray-300">No questions available for this quiz. Please create a new quiz.</p>
            <Button onClick={handleBackToCreate} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
              Create New Quiz
            </Button>
          </div>
        </main>
      </>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      <Header />
      <main className="page-container mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            className="mb-4 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30" 
            onClick={handleBackToCreate}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Create
          </Button>
          
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-200">Take Quiz</h1>
          {!quizCompleted && (
            <p className="text-muted-foreground">
              Complete the quiz by answering all questions. You can review your answers at the end.
            </p>
          )}
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {isEvaluating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center mb-4"
              >
                <p className="text-indigo-600 dark:text-indigo-400 font-medium">Evaluating your answers...</p>
              </motion.div>
            )}
            {quizCompleted ? (
              <QuizResults 
                key="results"
                questions={questions} 
                userAnswers={userAnswers} 
                onRestartQuiz={handleRestartQuiz} 
              />
            ) : (
              <QuizCard 
                key={`question-${currentQuestionIndex}`}
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                userAnswer={userAnswers[currentQuestion.id]}
                onAnswerSelect={handleAnswerSelect}
                onNext={handleNext}
                onPrevious={handlePrevious}
                showResults={showResults}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
};

export default TakeQuiz;
