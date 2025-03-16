
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuizEmptyProps {
  onCreateNewQuiz: () => void;
}

const QuizEmpty: React.FC<QuizEmptyProps> = ({ onCreateNewQuiz }) => {
  return (
    <div className="text-center">
      <p className="dark:text-gray-300">No questions available for this quiz. Please create a new quiz.</p>
      <Button onClick={onCreateNewQuiz} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
        Create New Quiz
      </Button>
    </div>
  );
};

export default QuizEmpty;
