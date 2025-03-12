
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import NoteInput from '@/components/NoteInput';
import QuizCustomizer, { QuizSettings } from '@/components/QuizCustomizer';
import QuizGenerator from '@/components/QuizGenerator';
import { Question } from '@/utils/quizUtils';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [settings, setSettings] = useState<QuizSettings>({
    questionCount: 10,
    answerOptions: 4,
    questionTypes: 'multiple-choice',
    difficulty: 'medium'
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);

  // Handle notes changes
  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
  };

  // Handle settings changes
  const handleSettingsChange = (newSettings: QuizSettings) => {
    setSettings(newSettings);
  };

  // Handle quiz generation
  const handleQuizGenerated = (questions: Question[]) => {
    setGeneratedQuestions(questions);
    
    // Navigate to the quiz after a short delay
    setTimeout(() => {
      navigate('/take-quiz', { state: { questions } });
    }, 1000);
  };

  return (
    <>
      <Header />
      <main className="page-container mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold mb-2">Create Your Quiz</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enter your notes or upload a file below, then customize your quiz settings and generate questions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notes Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-4">Enter Your Notes</h2>
              <NoteInput onNotesChange={handleNotesChange} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="pt-4"
            >
              <h2 className="text-xl font-semibold mb-4">Generate Quiz</h2>
              <QuizGenerator 
                notes={notes} 
                settings={settings} 
                onQuizGenerated={handleQuizGenerated} 
              />
            </motion.div>
          </div>
          
          {/* Settings Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-4">Quiz Settings</h2>
              <QuizCustomizer 
                settings={settings} 
                onSettingsChange={handleSettingsChange} 
              />
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CreateQuiz;
