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
  QuestionType
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
  options: string[] | null;
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

  const mapQuestionTypeToApi = (type: QuestionType): string => {
    switch(type) {
      case 'multiple-choice': return 'multiple_choice';
      case 'true-false': return 'true_false';
      case 'fill-in-the-blank': return 'fill_in_the_blank';
      case 'short-answer': return 'short_answer';
      case 'matching': return 'matching';
      case 'mixed': return 'mixed';
      default: return 'multiple_choice';
    }
  };

  const mapApiQuestionTypeToLocal = (type: string): QuestionType => {
    switch(type) {
      case 'multiple_choice': return 'multiple-choice';
      case 'true_false': return 'true-false';
      case 'fill_in_the_blank': return 'fill-in-the-blank';
      case 'short_answer': return 'short-answer';
      case 'matching': return 'matching';
      case 'mixed': return 'mixed';
      default: return 'multiple-choice';
    }
  };

  const convertApiResponseToQuestions = (apiQuestions: ApiQuestion[]): Question[] => {
    return apiQuestions.map((q, index) => {
      const options = q.options || [];
      
      let answers = options.map((option, optIndex) => ({
        id: `${index + 1}-${optIndex}`,
        text: option,
        isCorrect: option === q.correct_answer
      }));
      
      if (answers.length === 0 && q.correct_answer) {
        answers = [{
          id: `${index + 1}-0`,
          text: q.correct_answer,
          isCorrect: true
        }];
      }

      return {
        id: `${index + 1}`,
        text: q.question,
        type: mapApiQuestionTypeToLocal(q.question_type),
        answers: answers,
        explanation: q.explanation
      };
    });
  };

  const handleGenerateFromNotes = async () => {
    if (!notes.trim()) {
      toast.error('Please enter some notes first.');
      return;
    }
    setIsGenerating(true);
    setCurrentQuiz(null);

    try {
      const response = await fetch(`/api/generate-text-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: notes,
          num_questions: settings.questionCount,
          num_options: settings.answerOptions,
          question_type: mapQuestionTypeToApi(settings.questionTypes),
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
        const textContent = await file.text();
        const response = await fetch(`/api/generate-text-quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textContent,
            num_questions: settings.questionCount,
            num_options: settings.answerOptions,
            question_type: mapQuestionTypeToApi(settings.questionTypes),
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
        const formData = new FormData();
        formData.append('file', file);
        formData.append('num_questions', settings.questionCount.toString());
        formData.append('num_options', settings.answerOptions.toString());
        formData.append('question_type', mapQuestionTypeToApi(settings.questionTypes));
        formData.append('difficulty', settings.difficulty);

        const response = await fetch(`/api/generate-file-quiz`, {
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

  const handleSaveQuiz = () => {
    if (currentQuiz) {
      const quiz = createQuiz('Quiz - ' + new Date().toLocaleString(), currentQuiz);
      saveQuiz(quiz);
    }
  };

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
          onClick={handleGenerateFromNotes}
          disabled={
            isGenerating ||
            inputMethod !== 'text' ||
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

        <Button
          onClick={handleGenerateFromFile}
          disabled={
            isGenerating ||
            inputMethod !== 'upload' ||
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
