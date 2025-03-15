
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import QuizCard from '@/components/QuizCard';
import QuizResults from '@/components/QuizResults';
import { Question } from '@/utils/quizUtils';
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

  useEffect(() => {
    // Check if we have questions in the location state
    if (location.state?.questions) {
      setIsLoading(true);
      const receivedQuestions = location.state.questions as Question[];
      
      // Ensure all questions have a correct answer marked
      const validatedQuestions = receivedQuestions.map(question => {
        const hasCorrectAnswer = question.answers.some(answer => answer.isCorrect);
        
        // If no correct answer is marked, mark the first one as correct
        if (!hasCorrectAnswer && question.answers.length > 0) {
          const updatedAnswers = [...question.answers];
          updatedAnswers[0] = { ...updatedAnswers[0], isCorrect: true };
          return { ...question, answers: updatedAnswers };
        }
        
        return question;
      });
      
      setQuestions(validatedQuestions);
      
      // Initialize userAnswers with null values
      const initialAnswers: Record<string, string | null> = {};
      validatedQuestions.forEach(q => {
        initialAnswers[q.id] = null;
      });
      setUserAnswers(initialAnswers);
      setIsLoading(false);
    } else {
      // Redirect to create quiz if no questions are available
      toast.error("No quiz questions found. Redirecting to quiz creation.");
      navigate('/create');
    }
  }, [location.state, navigate]);

  // Handle selecting an answer - just stores the selection
  const handleAnswerSelect = (answerId: string) => {
    if (questions.length === 0 || showResults) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    
    // Store user's answer without immediate evaluation
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
      // End of quiz - now we evaluate all answers
      setIsEvaluating(true);
      evaluateQuiz();
      setShowResults(true);
      setQuizCompleted(true);
    }
  };

  // Evaluate all answers at the end of the quiz
  const evaluateQuiz = () => {
    // For text-based and matching questions, we need to perform evaluation
    // This is now done in bulk at the end of the quiz
    const evaluatedAnswers = { ...userAnswers };
    
    questions.forEach(question => {
      const userAnswer = evaluatedAnswers[question.id];
      
      // Skip questions that have no answer selected
      if (!userAnswer) return;
      
      // For text-based questions, evaluate against correct answer
      if ((question.type === 'short-answer' || question.type === 'fill-in-the-blank') && 
          userAnswer !== 'incorrect') {
        const correctAnswer = question.answers.find(a => a.isCorrect);
        if (correctAnswer) {
          // Simple string comparison - could be improved with more sophisticated matching
          const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.text.trim().toLowerCase();
          evaluatedAnswers[question.id] = isCorrect ? correctAnswer.id : 'incorrect';
        }
      }
      
      // For matching questions, evaluate the matching pattern
      if (question.type === 'matching' && userAnswer !== 'incorrect' && question.correctMatching) {
        // Compare the user's matching string with the correct matching pattern
        const isCorrect = compareMatchingAnswers(userAnswer, question.correctMatching);
        
        const correctAnswer = question.answers.find(a => a.isCorrect);
        if (correctAnswer) {
          evaluatedAnswers[question.id] = isCorrect ? correctAnswer.id : 'incorrect';
        }
      }
    });
    
    setUserAnswers(evaluatedAnswers);
    setIsEvaluating(false);
  };

  // Helper function to compare matching answers
  const compareMatchingAnswers = (userMatching: string, correctMatching: string): boolean => {
    // Normalize the strings by removing spaces and converting to lowercase
    const normalizeMatching = (matchStr: string) => 
      matchStr.split(',')
        .map(pair => pair.trim().toLowerCase())
        .sort()
        .join(',');
    
    const normalizedUser = normalizeMatching(userMatching);
    const normalizedCorrect = normalizeMatching(correctMatching);
    
    return normalizedUser === normalizedCorrect;
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
    
    toast.success("Quiz restarted. Good luck!");
  };

  // Return to create page
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
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4"
            >
              <Brain className="w-8 h-8 text-indigo-600 animate-pulse" />
            </motion.div>
            <h2 className="text-xl font-semibold mb-2">Loading quiz questions...</h2>
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
            <p>No questions available for this quiz. Please create a new quiz.</p>
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
            className="mb-4 text-indigo-700 hover:bg-indigo-50" 
            onClick={handleBackToCreate}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Create
          </Button>
          
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Take Quiz</h1>
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
                <p className="text-indigo-600 font-medium">Evaluating your answers...</p>
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
