
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/utils/quizUtils';

// Import the new components
import QuizCardHeader from './QuizCardHeader';
import QuizCardFooter from './QuizCardFooter';
import MultipleChoiceQuestion from './question-types/MultipleChoiceQuestion';
import TrueFalseQuestion from './question-types/TrueFalseQuestion';
import FillInBlankQuestion from './question-types/FillInBlankQuestion';
import ShortAnswerQuestion from './question-types/ShortAnswerQuestion';
import QuestionExplanation from './QuestionExplanation';

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  userAnswer: string | null;
  onAnswerSelect: (answerId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  showResults: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  showResults,
}) => {
  console.log("QuizCard props:", { 
    question, 
    questionNumber, 
    totalQuestions, 
    userAnswer,
    questionType: question.type,
    hasAnswers: !!question.answers,
    answerCount: question.answers?.length || 0
  });

  const [showExplanation, setShowExplanation] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const correctAnswer = question.answers?.find(a => a.isCorrect);
  
  useEffect(() => {
    setTextAnswer('');
    setShowExplanation(false);
  }, [question.id]);
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTextAnswer(e.target.value);
    
    if (question.answers && question.answers.length > 0) {
      onAnswerSelect(e.target.value);
    }
  };

  const renderQuestionContent = () => {
    console.log(`Rendering question content for type: ${question.type}`);
    
    // Ensure question.answers is always an array
    const answers = Array.isArray(question.answers) ? question.answers : [];
    
    switch (question.type) {
      case 'multiple-choice':
        return (
          <MultipleChoiceQuestion
            answers={answers}
            userAnswer={userAnswer}
            onAnswerSelect={onAnswerSelect}
            showResults={showResults}
          />
        );
      
      case 'true-false':
        return (
          <TrueFalseQuestion
            answers={answers}
            userAnswer={userAnswer}
            onAnswerSelect={onAnswerSelect}
            showResults={showResults}
          />
        );
      
      case 'fill-in-the-blank':
        return (
          <FillInBlankQuestion
            correctAnswer={correctAnswer}
            textAnswer={textAnswer}
            onChange={handleTextInputChange}
            showResults={showResults}
          />
        );
      
      case 'short-answer':
        return (
          <ShortAnswerQuestion
            correctAnswer={correctAnswer}
            textAnswer={textAnswer}
            onChange={handleTextInputChange}
            showResults={showResults}
          />
        );
      
      default:
        return (
          <div className="p-4 border rounded-lg dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">This question type ({question.type}) is not supported.</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={cardVariants}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-md overflow-hidden"
    >
      <QuizCardHeader 
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        questionType={question.type}
        questionText={question.text}
      />

      <div className="p-6 space-y-4 dark:bg-gray-900">
        {renderQuestionContent()}

        {showResults && (
          <AnimatePresence>
            <QuestionExplanation
              showExplanation={showExplanation}
              explanation={question.explanation}
              onToggle={() => setShowExplanation(!showExplanation)}
            />
          </AnimatePresence>
        )}
      </div>

      <QuizCardFooter
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        userAnswer={userAnswer}
        showResults={showResults}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </motion.div>
  );
};

export default QuizCard;
