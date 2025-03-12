
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, Calendar, Play, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getSavedQuizzes, Quiz } from '@/utils/quizUtils';

const Quizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  // Load saved quizzes on component mount
  useEffect(() => {
    const savedQuizzes = getSavedQuizzes();
    setQuizzes(savedQuizzes);
  }, []);

  // Format date
  const formatDate = (date: Date): string => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Take a quiz
  const handleTakeQuiz = (quiz: Quiz) => {
    navigate('/take-quiz', { state: { questions: quiz.questions } });
  };

  // Delete a quiz
  const handleDeleteQuiz = (id: string) => {
    const updatedQuizzes = quizzes.filter(quiz => quiz.id !== id);
    localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes));
    setQuizzes(updatedQuizzes);
    toast.success('Quiz deleted successfully');
  };

  // Navigate to create quiz page
  const handleCreateNew = () => {
    navigate('/create');
  };

  return (
    <>
      <Header />
      <main className="page-container mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">My Quizzes</h1>
          <p className="text-muted-foreground max-w-2xl">
            Review and take your saved quizzes
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Create new quiz button */}
          <div className="flex justify-end">
            <Button onClick={handleCreateNew}>
              <Brain className="w-4 h-4 mr-2" />
              Create New Quiz
            </Button>
          </div>
          
          {/* Quiz list */}
          {quizzes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-muted"
            >
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Quizzes Found</h3>
              <p className="text-muted-foreground mb-6">
                You haven't created any quizzes yet. Get started by creating your first quiz.
              </p>
              <Button onClick={handleCreateNew}>Create Quiz</Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {quizzes.map((quiz, index) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.05, 
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Brain className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(quiz.createdAt)}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-medium mb-1 line-clamp-1">{quiz.title}</h3>
                      
                      <div className="flex items-center space-x-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Brain className="w-4 h-4 mr-1" />
                          <span>{quiz.questions.length} Questions</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>~{Math.round(quiz.questions.length * 0.5)} min</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1"
                          onClick={() => handleTakeQuiz(quiz)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Take Quiz
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="px-3"
                              onClick={() => setSelectedQuizId(quiz.id)}
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this quiz. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => selectedQuizId && handleDeleteQuiz(selectedQuizId)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
};

export default Quizzes;
