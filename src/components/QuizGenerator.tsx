import React, { useState } from 'react';
import { Brain, Loader2, DownloadCloud, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Question, 
  createQuiz, 
  saveQuiz, 
  generatePDF,
} from '@/utils/quizUtils';
import { generateQuizFromNotes, generateQuizFromFile } from '@/utils/quizAPI';
import { QuizSettings } from './QuizCustomizer';

interface QuizGeneratorProps {
  notes: string;
  file: File | null;   // The file selected in NoteInput (or null if none)
  settings: QuizSettings;
  onQuizGenerated: (questions: Question[]) => void;
  inputMethod: 'text' | 'upload';
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  notes,
  file,
  settings,
  onQuizGenerated,
  inputMethod
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Question[] | null>(null);
  const baseUrl = import.meta.env.VITE_API_URL || '';
  
  console.log("API URL being used:", baseUrl);

  // -----------------------------
  // Generate from typed notes
  // -----------------------------
  const handleGenerateFromNotes = async () => {
    if (!notes.trim()) {
      toast.error('Please enter some notes first.');
      return;
    }
    setIsGenerating(true);
    setCurrentQuiz(null);

    try {
      const questions = await generateQuizFromNotes(notes, settings);
      setCurrentQuiz(questions);
      onQuizGenerated(questions);
      toast.success(`Generated ${questions.length} questions from your notes!`);
    } catch (error) {
      console.error('Error generating quiz from notes:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // -----------------------------
  // Generate from uploaded file
  // -----------------------------
  const handleGenerateFromFile = async () => {
    if (!file) {
      toast.error('No file selected.');
      return;
    }

    setIsGenerating(true);
    setIsUploading(true);
    setCurrentQuiz(null);

    try {
      const questions = await generateQuizFromFile(file, settings);
      setCurrentQuiz(questions);
      onQuizGenerated(questions);
      toast.success(`Generated ${questions.length} questions from your file!`);
    } catch (error) {
      console.error('Error generating quiz from file:', error);
      toast.error('Failed to generate quiz from file. Please try again.');
    } finally {
      setIsUploading(false);
      setIsGenerating(false);
    }
  };

  // Save quiz to DB
  const handleSaveQuiz = () => {
    if (currentQuiz) {
      const quiz = createQuiz('Quiz - ' + new Date().toLocaleString(), currentQuiz);
      saveQuiz(quiz);
    }
  };

  // Download quiz as PDF
  const handleDownloadPDF = () => {
    if (currentQuiz) {
      const quiz = createQuiz('Quiz - ' + new Date().toLocaleString(), currentQuiz);
      generatePDF(quiz);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Generate from Notes Button */}
        <Button
          onClick={handleGenerateFromNotes}
          disabled={
            isGenerating ||
            inputMethod !== 'text' ||   // only enable in text mode
            !notes.trim()
          }
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

        {/* Generate from File Button */}
        <Button
          onClick={handleGenerateFromFile}
          disabled={
            isGenerating ||
            inputMethod !== 'upload' || // only enable in upload mode
            !file
          }
          className="flex-1"
          variant="outline"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Generate from File
            </>
          )}
        </Button>
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
