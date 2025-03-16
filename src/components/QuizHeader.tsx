
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface QuizHeaderProps {
  onBackToCreate: () => void;
  quizCompleted: boolean;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({ onBackToCreate, quizCompleted }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8"
    >
      <Button 
        variant="ghost" 
        className="mb-4 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30" 
        onClick={onBackToCreate}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Create
      </Button>
      
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-200">Take Quiz</h1>
      {!quizCompleted && (
        <p className="text-muted-foreground">
          Complete the quiz by answering all questions. You can review your answers at the end.
        </p>
      )}
    </motion.div>
  );
};

export default QuizHeader;
