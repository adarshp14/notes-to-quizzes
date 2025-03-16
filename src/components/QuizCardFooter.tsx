
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuizCardFooterProps {
  questionNumber: number;
  totalQuestions: number;
  userAnswer: string | null;
  showResults: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const QuizCardFooter: React.FC<QuizCardFooterProps> = ({
  questionNumber,
  totalQuestions,
  userAnswer,
  showResults,
  onPrevious,
  onNext,
}) => {
  return (
    <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between bg-gray-50 dark:bg-gray-800">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={questionNumber === 1}
        className={cn(
          "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300",
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
          userAnswer ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white" : 
          "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300",
          !userAnswer && !showResults && "opacity-50"
        )}
      >
        {questionNumber === totalQuestions ? "Finish Quiz" : "Next"}
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export default QuizCardFooter;
