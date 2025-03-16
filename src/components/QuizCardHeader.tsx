
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { QuestionType } from '@/utils/quizUtils';

interface QuizCardHeaderProps {
  questionNumber: number;
  totalQuestions: number;
  questionType: QuestionType;
  questionText: string;
}

const QuizCardHeader: React.FC<QuizCardHeaderProps> = ({
  questionNumber,
  totalQuestions,
  questionType,
  questionText,
}) => {
  const getQuestionTypeDisplay = (type: string): string => {
    switch (type) {
      case 'multiple-choice': return 'Multiple Choice';
      case 'true-false': return 'True/False';
      case 'fill-in-the-blank': return 'Fill in the Blank';
      case 'short-answer': return 'Short Answer';
      default: return type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ');
    }
  };

  const formatQuestionText = (text: string): string => {
    if (questionType === 'fill-in-the-blank') {
      return text.replace(/___+/g, '_____');
    }
    return text;
  };

  return (
    <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
      <div className="flex justify-between items-center mb-3">
        <Badge variant="outline" className="bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 font-medium">
          Question {questionNumber} of {totalQuestions}
        </Badge>
        <Badge variant="outline" className="capitalize bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30">
          {getQuestionTypeDisplay(questionType)}
        </Badge>
      </div>
      <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">{formatQuestionText(questionText)}</h3>
    </div>
  );
};

export default QuizCardHeader;
