
import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const QuizLoading: React.FC = () => {
  return (
    <div className="text-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4"
      >
        <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
      </motion.div>
      <h2 className="text-xl font-semibold mb-2 dark:text-gray-200">Loading quiz questions...</h2>
      <p className="text-muted-foreground">Please wait while we prepare your quiz.</p>
    </div>
  );
};

export default QuizLoading;
