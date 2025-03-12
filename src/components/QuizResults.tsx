
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, RefreshCw, Save, DownloadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Question, createQuiz, saveQuiz, generatePDF } from '@/utils/quizUtils';

interface QuizResultsProps {
  questions: Question[];
  userAnswers: Record<string, string | null>;
  onRestartQuiz: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ questions, userAnswers, onRestartQuiz }) => {
  // Calculate score
  const totalQuestions = questions.length;
  const answeredQuestions = Object.values(userAnswers).filter(a => a !== null).length;
  const correctAnswers = questions.filter(q => {
    const userAnswer = userAnswers[q.id];
    const correctAnswer = q.answers.find(a => a.isCorrect);
    return userAnswer === correctAnswer?.id;
  }).length;
  
  const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  // Get performance message based on score
  const getPerformanceMessage = () => {
    if (scorePercentage >= 90) return "Excellent job!";
    if (scorePercentage >= 70) return "Great work!";
    if (scorePercentage >= 50) return "Good effort!";
    return "Keep practicing!";
  };

  // Save quiz results
  const handleSaveResults = () => {
    const quiz = createQuiz(`Quiz Results - ${new Date().toLocaleString()}`, questions);
    saveQuiz(quiz);
    toast.success('Quiz results saved successfully!');
  };

  // Download quiz results as PDF
  const handleDownloadPDF = () => {
    const quiz = createQuiz(`Quiz Results - ${new Date().toLocaleString()}`, questions);
    generatePDF(quiz);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 text-center">
        <h3 className="text-2xl font-semibold mb-2">Quiz Results</h3>
        <p className="text-muted-foreground">{getPerformanceMessage()}</p>
      </div>
      
      <div className="p-6">
        {/* Score display */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-primary/10 mb-4">
            <span className="text-3xl font-bold text-primary">{scorePercentage}%</span>
          </div>
          <div className="flex justify-center space-x-8 text-center">
            <div>
              <div className="text-3xl font-semibold">{correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="text-3xl font-semibold">{totalQuestions - correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
            <div>
              <div className="text-3xl font-semibold">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
        
        {/* Question breakdown */}
        <h4 className="font-medium mb-4">Question Breakdown</h4>
        <div className="space-y-4 mb-6">
          {questions.map((question, index) => {
            const userAnswer = userAnswers[question.id];
            const correctAnswer = question.answers.find(a => a.isCorrect);
            const isCorrect = userAnswer === correctAnswer?.id;
            
            return (
              <div key={question.id} className="flex items-center">
                <div className="mr-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Question {index + 1}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{question.text}</div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1" onClick={onRestartQuiz}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleSaveResults}>
            <Save className="w-4 h-4 mr-2" />
            Save Results
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleDownloadPDF}>
            <DownloadCloud className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizResults;
