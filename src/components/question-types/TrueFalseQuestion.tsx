
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Answer } from '@/utils/quizUtils';

interface TrueFalseQuestionProps {
  answers: Answer[];
  userAnswer: string | null;
  onAnswerSelect: (answerId: string) => void;
  showResults: boolean;
}

const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
  answers,
  userAnswer,
  onAnswerSelect,
  showResults,
}) => {
  if (!answers || answers.length < 2) {
    return (
      <div className="p-4 border rounded-lg border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-700">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
          <p className="text-yellow-800 dark:text-yellow-200">
            This true/false question is incorrectly formatted.
          </p>
        </div>
      </div>
    );
  }
  
  // Sort to ensure True comes before False
  const sortedOptions = [...answers].sort((a, b) => {
    if (a.text.toLowerCase() === 'true') return -1;
    if (b.text.toLowerCase() === 'true') return 1;
    return 0;
  });
  
  return (
    <div className="space-y-4">
      {sortedOptions.map((answer) => {
        const isCorrect = answer.isCorrect;
        const isSelected = userAnswer === answer.id;
        
        return (
          <motion.div
            key={answer.id}
            initial={{ opacity: 0.8, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative p-4 border rounded-lg transition-all duration-200 cursor-pointer transform hover:translate-y-[-2px]",
              isSelected
                ? showResults
                  ? isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30 dark:border-green-600"
                    : "border-red-500 bg-red-50 dark:bg-red-950/30 dark:border-red-600"
                  : "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-600"
                : showResults && isCorrect
                ? "border-green-500 bg-green-50 dark:bg-green-950/30 dark:border-green-600"
                : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
            )}
            onClick={() => onAnswerSelect(answer.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-base font-medium dark:text-gray-200">{answer.text}</p>
              </div>

              {showResults && (
                <div className="ml-3 flex-shrink-0">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                  ) : null}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TrueFalseQuestion;
