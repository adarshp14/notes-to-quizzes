
import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionExplanationProps {
  showExplanation: boolean;
  explanation: string | undefined;
  onToggle: () => void;
}

const QuestionExplanation: React.FC<QuestionExplanationProps> = ({
  showExplanation,
  explanation,
  onToggle,
}) => {
  return (
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
        onClick={onToggle}
        className="w-full justify-start text-left border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
      </Button>

      {showExplanation && explanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-indigo-100 dark:border-indigo-500/30"
        >
          {explanation}
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuestionExplanation;
