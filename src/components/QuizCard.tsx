
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Question, Answer } from '@/utils/quizUtils';

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
  const isAnswered = userAnswer !== null;
  const correctAnswer = question.answers.find(a => a.isCorrect);
  const isCorrect = userAnswer && correctAnswer?.id === userAnswer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Question header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
            {question.type === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}
          </span>
        </div>
        <h3 className="text-lg font-medium">{question.text}</h3>
      </div>

      {/* Answer options */}
      <div className="p-6 space-y-3">
        {question.answers.map((answer) => (
          <div
            key={answer.id}
            className={cn(
              "relative p-4 border rounded-lg transition-all duration-200 cursor-pointer",
              userAnswer === answer.id
                ? showResults
                  ? isCorrect
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                  : "border-primary bg-primary/5"
                : showResults && answer.isCorrect
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
              showResults && "pointer-events-none"
            )}
            onClick={() => !isAnswered && onAnswerSelect(answer.id)}
          >
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-base">{answer.text}</p>
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
          </div>
        ))}

        {/* Explanation toggle */}
        {showResults && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full justify-start text-left"
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
                  className="mt-3 p-4 bg-muted/20 rounded-lg text-sm text-muted-foreground"
                >
                  {question.explanation}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Card footer */}
      <div className="p-4 border-t border-gray-100 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={questionNumber === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          variant={isAnswered ? "default" : "outline"}
          size="sm"
          onClick={onNext}
          disabled={!isAnswered && !showResults}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

export default QuizCard;
