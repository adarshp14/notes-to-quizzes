
import React, { useState } from 'react';
import { Brain, Loader2, DownloadCloud, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  generateDemoQuestions, 
  Question, 
  createQuiz, 
  saveQuiz, 
  generatePDF 
} from '@/utils/quizUtils';
import { QuizSettings } from './QuizCustomizer';

interface QuizGeneratorProps {
  notes: string;
  settings: QuizSettings;
  onQuizGenerated: (questions: Question[]) => void;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ notes, settings, onQuizGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Question[] | null>(null);

  // Generate the quiz
  const handleGenerateQuiz = async () => {
    if (!notes.trim()) {
      toast.error('Please enter some notes first');
      return;
    }

    setIsGenerating(true);
    setCurrentQuiz(null);

    try {
      // In a real app, this would call an API with the OpenAI integration
      const questions = await generateDemoQuestions(
        notes,
        settings.questionCount,
        settings.answerOptions,
        settings.questionTypes,
        settings.difficulty
      );
      
      setCurrentQuiz(questions);
      onQuizGenerated(questions);
      toast.success(`Generated ${questions.length} questions successfully!`);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save the current quiz
  const handleSaveQuiz = () => {
    if (currentQuiz) {
      const quiz = createQuiz('Quiz - ' + new Date().toLocaleString(), currentQuiz);
      saveQuiz(quiz);
    }
  };

  // Download the quiz as PDF
  const handleDownloadPDF = () => {
    if (currentQuiz) {
      const quiz = createQuiz('Quiz - ' + new Date().toLocaleString(), currentQuiz);
      generatePDF(quiz);
    }
  };

  return (
    <div className="space-y-6">
      <Button 
        onClick={handleGenerateQuiz} 
        disabled={isGenerating || !notes.trim()} 
        size="lg"
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating Quiz...
          </>
        ) : (
          <>
            <Brain className="w-5 h-5 mr-2" />
            Generate Quiz
          </>
        )}
      </Button>

      {isGenerating && (
        <Card className="overflow-hidden">
          <CardHeader className="p-6 animate-pulse bg-muted/30">
            <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
            <div className="h-4 w-1/2 bg-muted rounded"></div>
          </CardHeader>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 w-full bg-muted/50 rounded"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-3 w-5/6 bg-muted/40 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {currentQuiz && !isGenerating && (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleSaveQuiz}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Quiz
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleDownloadPDF}
            >
              <DownloadCloud className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QuizGenerator;
