
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Question, Answer, QuestionType } from '@/utils/quizUtils';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

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
  const [showExplanation, setShowExplanation] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const correctAnswer = question.answers.find(a => a.isCorrect);
  const isCorrect = userAnswer && correctAnswer?.id === userAnswer;
  
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
    
    if (question.answers.length > 0) {
      onAnswerSelect(e.target.value);
    }
  };

  const formatQuestionText = (text: string) => {
    if (question.type === 'fill-in-the-blank') {
      return text.replace(/___+/g, '_____');
    }
    return text;
  };

  // Ensure true/false questions have both options
  const ensureTrueFalseOptions = () => {
    if (question.type === 'true-false') {
      // Check if both true and false options exist
      const hasTrue = question.answers.some(a => a.text.toLowerCase() === 'true');
      const hasFalse = question.answers.some(a => a.text.toLowerCase() === 'false');
      
      if (!hasTrue || !hasFalse) {
        console.error("True/False question doesn't have proper options:", question);
        return false;
      }
      return true;
    }
    return true;
  };

  // This function renders different question types
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            {question.answers.map((answer) => (
              <motion.div
                key={answer.id}
                initial={{ opacity: 0.8, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "relative p-4 border rounded-lg transition-all duration-200 cursor-pointer transform hover:translate-y-[-2px]",
                  userAnswer === answer.id
                    ? showResults
                      ? isCorrect
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : "border-indigo-500 bg-indigo-50"
                    : showResults && answer.isCorrect
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                )}
                onClick={() => onAnswerSelect(answer.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-base font-medium">{answer.text}</p>
                  </div>

                  {showResults && (
                    <div className="ml-3 flex-shrink-0">
                      {answer.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : userAnswer === answer.id ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        );
      
      case 'true-false':
        // Create standard true/false options if they don't exist
        if (!ensureTrueFalseOptions()) {
          return (
            <div className="p-4 border rounded-lg">
              <p className="text-red-500">This true/false question is incorrectly formatted.</p>
            </div>
          );
        }
        
        // Sort to ensure "True" is always first
        const sortedOptions = [...question.answers].sort((a, b) => {
          if (a.text.toLowerCase() === 'true') return -1;
          if (b.text.toLowerCase() === 'true') return 1;
          return 0;
        });
        
        return (
          <div className="space-y-4">
            {sortedOptions.map((answer) => (
              <motion.div
                key={answer.id}
                initial={{ opacity: 0.8, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "relative p-4 border rounded-lg transition-all duration-200 cursor-pointer transform hover:translate-y-[-2px]",
                  userAnswer === answer.id
                    ? showResults
                      ? answer.isCorrect
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : "border-indigo-500 bg-indigo-50"
                    : showResults && answer.isCorrect
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                )}
                onClick={() => onAnswerSelect(answer.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-base font-medium">{answer.text}</p>
                  </div>

                  {showResults && (
                    <div className="ml-3 flex-shrink-0">
                      {answer.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : userAnswer === answer.id ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        );
      
      case 'fill-in-the-blank':
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <p className="mb-4 text-gray-600 italic">Fill in the blank with the correct answer:</p>
              <Input
                type="text"
                placeholder="Type your answer here..."
                value={textAnswer}
                onChange={handleTextInputChange}
                className="w-full focus:ring-2 focus:ring-indigo-500"
                disabled={showResults}
              />
              
              {showResults && correctAnswer && (
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                  <p className="text-sm font-medium text-gray-700">Correct answer:</p>
                  <p className="text-base text-green-700">{correctAnswer.text}</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'short-answer':
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <p className="mb-4 text-gray-600 italic">Provide a short answer to the question:</p>
              <Textarea
                placeholder="Type your answer here..."
                value={textAnswer}
                onChange={handleTextInputChange}
                className="w-full min-h-[120px] focus:ring-2 focus:ring-indigo-500"
                disabled={showResults}
              />
              
              {showResults && correctAnswer && (
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                  <p className="text-sm font-medium text-gray-700">Sample answer:</p>
                  <p className="text-base text-green-700">{correctAnswer.text}</p>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-4 border rounded-lg">
            <p className="text-gray-500">This question type ({question.type}) is not supported.</p>
          </div>
        );
    }
  };

  const getQuestionTypeDisplay = (type: string): string => {
    switch (type) {
      case 'multiple-choice': return 'Multiple Choice';
      case 'true-false': return 'True/False';
      case 'fill-in-the-blank': return 'Fill in the Blank';
      case 'short-answer': return 'Short Answer';
      default: return type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ');
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={cardVariants}
      className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex justify-between items-center mb-3">
          <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-200 font-medium">
            Question {questionNumber} of {totalQuestions}
          </Badge>
          <Badge variant="outline" className="capitalize bg-white text-purple-700 border-purple-200">
            {getQuestionTypeDisplay(question.type)}
          </Badge>
        </div>
        <h3 className="text-xl font-medium text-gray-800">{formatQuestionText(question.text)}</h3>
      </div>

      <div className="p-6 space-y-4">
        {renderQuestionContent()}

        {showResults && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full justify-start text-left border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
              </Button>

              {showExplanation && question.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 p-4 bg-indigo-50 rounded-lg text-sm text-gray-700 border border-indigo-100"
                >
                  {question.explanation}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 flex justify-between bg-gray-50">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={questionNumber === 1}
          className={cn(
            "border-gray-300 hover:bg-gray-100",
            questionNumber === 1 && "opacity-50"
          )}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          variant={userAnswer ? "default" : "outline"}
          size="sm"
          onClick={onNext}
          disabled={!userAnswer && !showResults}
          className={cn(
            userAnswer ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700" : 
            "border-gray-300 hover:bg-gray-100",
            !userAnswer && !showResults && "opacity-50"
          )}
        >
          {questionNumber === totalQuestions ? "Finish Quiz" : "Next"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

export default QuizCard;
