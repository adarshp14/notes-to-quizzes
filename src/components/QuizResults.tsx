
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, RefreshCw, Save, DownloadCloud, HelpCircle, Trophy, BookOpen, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Question, createQuiz, saveQuiz, generatePDF } from '@/utils/quizUtils';
import { Progress } from '@/components/ui/progress';

interface QuizResultsProps {
  questions: Question[];
  userAnswers: Record<string, string | null>;
  onRestartQuiz: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ questions, userAnswers, onRestartQuiz }) => {
  // Calculate score
  const totalQuestions = questions.length;
  const correctAnswers = questions.filter(q => {
    const userAnswer = userAnswers[q.id];
    const correctAnswer = q.answers.find(a => a.isCorrect);
    return userAnswer === correctAnswer?.id;
  }).length;
  
  const scorePercentage = totalQuestions > 0 
    ? Math.round((correctAnswers / totalQuestions) * 100) 
    : 0;
  
  // Performance message and color
  const getPerformanceData = () => {
    if (scorePercentage >= 90) return { message: "Excellent job!", color: "text-green-600 dark:text-green-400" };
    if (scorePercentage >= 70) return { message: "Great work!", color: "text-blue-600 dark:text-blue-400" };
    if (scorePercentage >= 50) return { message: "Good effort!", color: "text-yellow-600 dark:text-yellow-400" };
    return { message: "Keep practicing!", color: "text-orange-600 dark:text-orange-400" };
  };

  const performanceData = getPerformanceData();

  // Save quiz results
  const handleSaveResults = () => {
    const quiz = createQuiz(`Quiz Results - ${new Date().toLocaleString()}`, questions);
    saveQuiz(quiz);
    toast.success('Quiz results saved successfully!');
  };

  // Download quiz results as PDF
  const handleDownloadPDF = () => {
    const quiz = createQuiz(`Quiz Results - ${new Date().toLocaleString()}`, questions);
    generatePDF(quiz, userAnswers);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-md overflow-hidden"
    >
      <div className="p-8 text-center border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-gray-700 shadow-sm border-4 border-indigo-100 dark:border-indigo-900"
        >
          <Trophy className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        </motion.div>
        <h3 className="text-2xl font-bold mb-2 dark:text-white">Quiz Complete!</h3>
        <p className={`text-xl font-semibold ${performanceData.color} mb-4`}>
          {performanceData.message}
        </p>
        <Progress value={scorePercentage} className="h-2 w-64 mx-auto bg-gray-100 dark:bg-gray-700" indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-600" />
      </div>
      
      <div className="p-6 dark:bg-gray-800">
        {/* Score display */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{correctAnswers}</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">Correct Answers</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800"
            >
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">{totalQuestions - correctAnswers}</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">Incorrect Answers</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800"
            >
              <div className="flex items-center justify-between mb-2">
                <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{scorePercentage}%</span>
              </div>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">Total Score</p>
            </motion.div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button
            variant="outline"
            className="flex-1 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:bg-gray-800"
            onClick={handleSaveResults}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Results
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 dark:bg-gray-800"
            onClick={handleDownloadPDF}
          >
            <DownloadCloud className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            onClick={onRestartQuiz}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
        
        {/* Question review */}
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <BookOpen className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-lg font-semibold dark:text-white">Question Review</h4>
          </div>
          {questions.map((question, index) => {
            const userAnswerId = userAnswers[question.id];
            const userAnswerObj = question.answers.find(a => a.id === userAnswerId);
            const correctAnswer = question.answers.find(a => a.isCorrect);
            const isCorrect = userAnswerId === correctAnswer?.id;

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  isCorrect 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-2 dark:text-white">{question.text}</p>
                    <div className="space-y-1 text-sm">
                      <p className={`${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        Your answer: {userAnswerObj?.text || 'No answer selected'}
                      </p>
                      {correctAnswer && (
                        <p className="text-green-700 dark:text-green-300">
                          Correct answer: {correctAnswer.text}
                        </p>
                      )}
                      {question.explanation && (
                        <p className="mt-2 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 bg-opacity-50 dark:bg-opacity-50 p-2 rounded">
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default QuizResults;
