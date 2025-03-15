
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, Calendar, Play, Trash2, Eye, CheckCircle } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { getSavedQuizzes, Quiz } from '@/utils/quizUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const Quizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [viewQuiz, setViewQuiz] = useState<Quiz | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const savedQuizzes = getSavedQuizzes();
    setQuizzes(savedQuizzes);
  }, []);

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

  const handleTakeQuiz = (quiz: Quiz) => {
    navigate('/take-quiz', { state: { questions: quiz.questions } });
  };

  const handleDeleteQuiz = (id: string) => {
    const updatedQuizzes = quizzes.filter(quiz => quiz.id !== id);
    localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes));
    setQuizzes(updatedQuizzes);
    toast.success('Quiz deleted successfully');
  };

  const handleViewQuiz = (quiz: Quiz) => {
    setViewQuiz(quiz);
    setDialogOpen(true);
  };

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
          <h1 className="text-3xl font-bold mb-2 dark:text-white">My Quizzes</h1>
          <p className="text-muted-foreground max-w-2xl">
            Review and take your saved quizzes
          </p>
        </motion.div>

        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleCreateNew} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-indigo-600 dark:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800">
              <Brain className="w-4 h-4 mr-2" />
              Create New Quiz
            </Button>
          </div>
          
          {quizzes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-muted dark:bg-gray-800/20 dark:border-gray-700"
            >
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 dark:bg-primary/20">
                <Brain className="w-8 h-8 text-primary dark:text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2 dark:text-white">No Quizzes Found</h3>
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
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-900/50"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/30">
                          <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(quiz.createdAt)}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-medium mb-1 line-clamp-1 dark:text-white">{quiz.title}</h3>
                      
                      <div className="flex items-center space-x-4 mb-4 text-sm text-muted-foreground dark:text-gray-400">
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
                          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-indigo-600 dark:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800"
                          onClick={() => handleTakeQuiz(quiz)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Take Quiz
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="px-3 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-indigo-800 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400 dark:text-gray-300"
                          onClick={() => handleViewQuiz(quiz)}
                        >
                          <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="px-3 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/30 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => setSelectedQuizId(quiz.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="dark:text-white">Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription className="dark:text-gray-400">
                                This will permanently delete this quiz. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => selectedQuizId && handleDeleteQuiz(selectedQuizId)}
                                className="dark:bg-red-600 dark:hover:bg-red-700"
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-auto dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold dark:text-white">{viewQuiz?.title}</DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                Created on {viewQuiz && formatDate(viewQuiz.createdAt)}
              </DialogDescription>
            </DialogHeader>
            
            {viewQuiz && (
              <div className="mt-4 space-y-6">
                <h3 className="text-lg font-medium flex items-center dark:text-white">
                  <CheckCircle className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Questions
                </h3>
                <div className="rounded-lg border overflow-hidden dark:border-gray-700">
                  <Table>
                    <TableHeader className="bg-indigo-50 dark:bg-indigo-900/30">
                      <TableRow className="dark:border-gray-700">
                        <TableHead className="w-12 font-bold text-indigo-900 dark:text-indigo-300">#</TableHead>
                        <TableHead className="font-bold text-indigo-900 dark:text-indigo-300">Question</TableHead>
                        <TableHead className="font-bold text-indigo-900 dark:text-indigo-300">Type</TableHead>
                        <TableHead className="font-bold text-indigo-900 dark:text-indigo-300">Correct Answer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewQuiz.questions.map((question, index) => {
                        const correctAnswer = question.answers.find(a => a.isCorrect);
                        
                        return (
                          <TableRow key={question.id} className="hover:bg-indigo-50/50 dark:border-gray-700 dark:hover:bg-indigo-900/20">
                            <TableCell className="font-medium text-indigo-700 dark:text-indigo-400">{index + 1}</TableCell>
                            <TableCell className="dark:text-gray-300">{question.text}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/60">
                                {question.type.replace('-', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-green-600 dark:text-green-400">
                              {correctAnswer ? correctAnswer.text : 'N/A'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            <DialogFooter className="mt-6 gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                className="border-gray-200 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
              >
                Close
              </Button>
              {viewQuiz && (
                <Button 
                  onClick={() => {
                    setDialogOpen(false);
                    handleTakeQuiz(viewQuiz);
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-indigo-600 dark:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Take This Quiz
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
};

export default Quizzes;
