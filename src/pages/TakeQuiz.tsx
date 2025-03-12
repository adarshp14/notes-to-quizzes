
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import QuizCard from '@/components/QuizCard';
import QuizResults from '@/components/QuizResults';
import { Question } from '@/utils/quizUtils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TakeQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | null>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    // Check if we have questions in the location state
    if (location.state?.questions) {
      const receivedQuestions = location.state.questions as Question[];
      setQuestions(receivedQuestions);
      
      // Initialize userAnswers with null values
      const initialAnswers: Record<string, string | null> = {};
      receivedQuestions.forEach(q => {
        initialAnswers[q.id] = null;
      });
      setUserAnswers(initialAnswers);
    } else {
      // Redirect to create quiz if no questions are available
      navigate('/create');
    }
  }, [location.state, navigate]);

  // Handle selecting an answer
  const handleAnswerSelect = (answerId: string) => {
    if (questions.length === 0) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerId
    }));
  };

  // Handle moving to the next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // End of quiz
      setShowResults(true);
      setQuizCompleted(true);
    }
  };

  // Handle moving to the previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Restart the quiz
  const handleRestartQuiz = () => {
    // Reset all states
    const initialAnswers: Record<string, string | null> = {};
    questions.forEach(q => {
      initialAnswers[q.id] = null;
    });
    setUserAnswers(initialAnswers);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setQuizCompleted(false);
  };

  // Return to create page
  const handleBackToCreate = () => {
    navigate('/create');
  };

  if (questions.length === 0) {
    return (
      <>
        <Header />
        <main className="page-container mt-20">
          <div className="text-center">
            <p>Loading quiz questions...</p>
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
            className="mb-4" 
            onClick={handleBackToCreate}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Create
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Take Quiz</h1>
          {!quizCompleted && (
            <p className="text-muted-foreground">
              Complete the quiz by answering all questions. You can review your answers at the end.
            </p>
          )}
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
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
