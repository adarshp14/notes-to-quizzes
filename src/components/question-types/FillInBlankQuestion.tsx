
import React from 'react';
import { Input } from '@/components/ui/input';
import { Answer } from '@/utils/quizUtils';

interface FillInBlankQuestionProps {
  correctAnswer: Answer | undefined;
  textAnswer: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showResults: boolean;
}

const FillInBlankQuestion: React.FC<FillInBlankQuestionProps> = ({
  correctAnswer,
  textAnswer,
  onChange,
  showResults,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg dark:border-gray-700 dark:bg-gray-800/50">
        <p className="mb-4 text-gray-600 dark:text-gray-400 italic">Fill in the blank with the correct answer:</p>
        <Input
          type="text"
          placeholder="Type your answer here..."
          value={textAnswer}
          onChange={onChange}
          className="w-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          disabled={showResults}
        />
        
        {showResults && correctAnswer && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded border dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Correct answer:</p>
            <p className="text-base text-green-700 dark:text-green-400">{correctAnswer.text}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FillInBlankQuestion;
