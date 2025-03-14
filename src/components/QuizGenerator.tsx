
import React, { useState } from 'react';
import { Brain, Loader2, DownloadCloud, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  generateDemoQuestions, 
  Question, 
  createQuiz, 
  saveQuiz, 
  generatePDF,
  convertApiResponsesToQuestions
} from '@/utils/quizUtils';
import { QuizSettings } from './QuizCustomizer';
import { supabase } from '@/integrations/supabase/client';

interface QuizGeneratorProps {
  notes: string;
  settings: QuizSettings;
  onQuizGenerated: (questions: Question[]) => void;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ notes, settings, onQuizGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Question[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Generate the quiz from text notes
  const handleGenerateQuiz = async () => {
    if (!notes.trim()) {
      toast.error('Please enter some notes first');
      return;
    }

    setIsGenerating(true);
    setCurrentQuiz(null);

    try {
      // Call the local text quiz generation API
      const response = await fetch('http://localhost:8000/generate-text-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: notes,
          num_questions: settings.questionCount,
          num_options: settings.answerOptions,
          question_type: settings.questionTypes === 'multiple-choice' ? 'multiple_choice' : 'true_false',
          difficulty: settings.difficulty
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data?.questions) {
        // Convert API response format to our app's Question format
        const questions = convertApiResponsesToQuestions(data.questions);
        setCurrentQuiz(questions);
        onQuizGenerated(questions);
        toast.success(`Generated ${questions.length} questions successfully!`);
      } else {
        throw new Error('Invalid response from quiz generation API');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate quiz from file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsGenerating(true);
    setCurrentQuiz(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('num_questions', settings.questionCount.toString());
      formData.append('num_options', settings.answerOptions.toString());
      formData.append('question_type', settings.questionTypes === 'multiple-choice' ? 'multiple_choice' : 'true_false');
      formData.append('difficulty', settings.difficulty);

      // Call the local file quiz generation API
      const response = await fetch('http://localhost:8000/generate-file-quiz', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data?.questions) {
        // Convert API response format to our app's Question format
        const questions = convertApiResponsesToQuestions(data.questions);
        setCurrentQuiz(questions);
        onQuizGenerated(questions);
        toast.success(`Generated ${questions.length} questions from your file!`);
      } else {
        throw new Error('Invalid response from quiz generation API');
      }
    } catch (error) {
      console.error('Error generating quiz from file:', error);
      toast.error('Failed to generate quiz from file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploading(false);
      setIsGenerating(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file input click
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
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
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={handleGenerateQuiz} 
          disabled={isGenerating || !notes.trim()} 
          className="flex-1"
        >
          {isGenerating && !isUploading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Quiz...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2" />
              Generate from Notes
            </>
          )}
        </Button>

        <div className="relative flex-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <Button 
            onClick={handleFileButtonClick}
            disabled={isGenerating}
            className="w-full"
            variant="outline"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Generate from File
              </>
            )}
          </Button>
        </div>
      </div>

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
