
import React, { useState, useEffect } from 'react';
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
  generateDemoQuestions, // Add this import
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
  
  // Debug logging on component mount
  useEffect(() => {
    console.log("DEBUG - QuizGenerator mounted");
    console.log("DEBUG - Environment API URL:", baseUrl);
    console.log("DEBUG - Environment variables:", import.meta.env);
  }, [baseUrl]);
  
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
      console.log("DEBUG - Starting generateQuizFromNotes call");
      const questions = await generateQuizFromNotes(notes, settings);
      console.log("DEBUG - generateQuizFromNotes returned successfully with", questions.length, "questions");
      
      if (questions.length === 0) {
        toast.error('No questions could be generated. Using demo questions instead.');
        const demoQuestions = generateDemoQuestions(
          notes,
          settings.questionCount,
          settings.answerOptions,
          settings.questionTypes,
          settings.difficulty
        );
        setCurrentQuiz(demoQuestions);
        onQuizGenerated(demoQuestions);
        toast.success(`Generated ${demoQuestions.length} demo questions as fallback`);
        return;
      }
      
      setCurrentQuiz(questions);
      onQuizGenerated(questions);
      toast.success(`Generated ${questions.length} questions from your notes!`);
    } catch (error) {
      console.error('DEBUG - Error in handleGenerateFromNotes:', error);
      toast.error('Failed to generate quiz. Using demo questions instead.');
      
      // Always fall back to demo questions on error
      const demoQuestions = generateDemoQuestions(
        notes,
        settings.questionCount,
        settings.answerOptions,
        settings.questionTypes,
        settings.difficulty
      );
      setCurrentQuiz(demoQuestions);
      onQuizGenerated(demoQuestions);
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
      console.log("DEBUG - Starting generateQuizFromFile call");
      const questions = await generateQuizFromFile(file, settings);
      console.log("DEBUG - generateQuizFromFile returned successfully with", questions.length, "questions");
      
      if (questions.length === 0) {
        toast.error('No questions could be generated. Using demo questions instead.');
        const demoQuestions = generateDemoQuestions(
          file.name,
          settings.questionCount,
          settings.answerOptions,
          settings.questionTypes,
          settings.difficulty
        );
        setCurrentQuiz(demoQuestions);
        onQuizGenerated(demoQuestions);
        toast.success(`Generated ${demoQuestions.length} demo questions as fallback`);
        return;
      }
      
      setCurrentQuiz(questions);
      onQuizGenerated(questions);
      toast.success(`Generated ${questions.length} questions from your file!`);
    } catch (error) {
      console.error('DEBUG - Error in handleGenerateFromFile:', error);
      toast.error('Failed to generate quiz from file. Using demo questions instead.');
      
      // Always fall back to demo questions on error
      const demoQuestions = generateDemoQuestions(
        file.name,
        settings.questionCount,
        settings.answerOptions,
        settings.questionTypes,
        settings.difficulty
      );
      setCurrentQuiz(demoQuestions);
      onQuizGenerated(demoQuestions);
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

      {/* Environment Debug Info (only visible in development) */}
      {import.meta.env.DEV && (
        <div className="p-2 mt-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          <details>
            <summary className="cursor-pointer font-mono">Debug Info</summary>
            <div className="mt-2">
              <p>API URL: {baseUrl}</p>
              <p>Input Method: {inputMethod}</p>
              <p>Settings: {JSON.stringify(settings)}</p>
            </div>
          </details>
        </div>
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
