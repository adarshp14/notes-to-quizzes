
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import QuizCard from '@/components/QuizCard';
import QuizResults from '@/components/QuizResults';
import QuizLoading from '@/components/QuizLoading';
import QuizEmpty from '@/components/QuizEmpty';
import QuizHeader from '@/components/QuizHeader';
import { Question, generateId } from '@/utils/quizUtils';
import { processQuestions } from '@/utils/questionProcessing';
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

  useEffect(() => {
    if (location.state?.questions) {
      setIsLoading(true);
      const receivedQuestions = location.state.questions as any[];
      
      // Process the questions using our utility function
      const processedQuestions = processQuestions(receivedQuestions);
      setQuestions(processedQuestions);
      
      // Initialize user answers
      const initialAnswers: Record<string, string | null> = {};
      processedQuestions.forEach(q => {
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
          // For text-based questions, compare user text input with the correct answer
          const isCorrect = userAnswer.toLowerCase() === correctAnswer.text.toLowerCase();
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

  // Render loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="page-container mt-20">
          <QuizLoading />
        </main>
      </>
    );
  }

  // Render empty state
  if (questions.length === 0) {
    return (
      <>
        <Header />
        <main className="page-container mt-20">
          <QuizEmpty onCreateNewQuiz={handleBackToCreate} />
        </main>
      </>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      <Header />
      <main className="page-container mt-20">
        <QuizHeader 
          onBackToCreate={handleBackToCreate}
          quizCompleted={quizCompleted}
        />

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
