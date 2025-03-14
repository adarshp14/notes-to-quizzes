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
  generatePDF
} from '@/utils/quizUtils';
import { QuizSettings } from './QuizCustomizer';

interface QuizGeneratorProps {
  notes: string;
  file: File | null;   // The file selected in NoteInput (or null if none)
  settings: QuizSettings;
  onQuizGenerated: (questions: Question[]) => void;
  inputMethod: 'text' | 'upload';
}

interface ApiQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  question_type: string;
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
  const baseUrl = import.meta.env.VITE_API_URL;

  // Convert API response to local question shape
  const convertApiResponseToQuestions = (apiQuestions: ApiQuestion[]): Question[] => {
    return apiQuestions.map((q, index) => ({
      id: `${index + 1}`,
      text: q.question,
      type: q.question_type === 'multiple_choice' ? 'multiple-choice' : 'true-false',
      answers: q.options.map((option, optIndex) => ({
        id: `${index + 1}-${optIndex}`,
        text: option,
        isCorrect: option === q.correct_answer
      })),
      explanation: q.explanation
    }));
  };

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
      const response = await fetch('${baseUrl}/generate-text-quiz', {
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
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        const questions = convertApiResponseToQuestions(data.questions);
        setCurrentQuiz(questions);
        onQuizGenerated(questions);
        toast.success(`Generated ${questions.length} questions from your notes!`);
      } else {
        throw new Error('Invalid response from quiz generation API');
      }
    } catch (error) {
      console.error('Error generating quiz from notes:', error);
      // fallback to demo
      const demoQuestions = await generateDemoQuestions(
        notes,
        settings.questionCount,
        settings.answerOptions,
        settings.questionTypes,
        settings.difficulty
      );
      setCurrentQuiz(demoQuestions);
      onQuizGenerated(demoQuestions);
      toast.warning(`Couldn't connect to the API. Generated demo questions instead.`);
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
      if (file.type === 'text/plain') {
        // If it's plain text, read its contents & call /generate-text-quiz
        const textContent = await file.text();
        const response = await fetch('${baseUrl}/generate-text-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textContent,
            num_questions: settings.questionCount,
            num_options: settings.answerOptions,
            question_type: settings.questionTypes === 'multiple-choice' ? 'multiple_choice' : 'true_false',
            difficulty: settings.difficulty
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.questions) {
          const questions = convertApiResponseToQuestions(data.questions);
          setCurrentQuiz(questions);
          onQuizGenerated(questions);
          toast.success(`Generated ${questions.length} questions from your text file!`);
        } else {
          throw new Error('Invalid response from quiz generation API');
        }
      } else {
        // Otherwise, call /generate-file-quiz with FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('num_questions', settings.questionCount.toString());
        formData.append('num_options', settings.answerOptions.toString());
        formData.append('question_type', 'multiple_choice'); // or derive from settings if you like
        formData.append('difficulty', 'easy');              // or derive from settings if you like

        const response = await fetch('${baseUrl}/generate-file-quiz', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.questions) {
          const questions = convertApiResponseToQuestions(data.questions);
          setCurrentQuiz(questions);
          onQuizGenerated(questions);
          toast.success(`Generated ${questions.length} questions from your file!`);
        } else {
          throw new Error('Invalid response from quiz generation API');
        }
      }
    } catch (error) {
      console.error('Error generating quiz from file:', error);
      // fallback to demo
      const demoQuestions = await generateDemoQuestions(
        file.name,
        settings.questionCount,
        settings.answerOptions,
        settings.questionTypes,
        settings.difficulty
      );
      setCurrentQuiz(demoQuestions);
      onQuizGenerated(demoQuestions);
      toast.warning(`Couldn't process the file. Generated demo questions instead.`);
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
