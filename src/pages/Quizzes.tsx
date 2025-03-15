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
          <h1 className="text-3xl font-bold mb-2">My Quizzes</h1>
          <p className="text-muted-foreground max-w-2xl">
            Review and take your saved quizzes
          </p>
        </motion.div>

        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleCreateNew} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
              <Brain className="w-4 h-4 mr-2" />
              Create New Quiz
            </Button>
          </div>
          
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
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Brain className="w-5 h-5 text-indigo-600" />
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
                          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                          onClick={() => handleTakeQuiz(quiz)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Take Quiz
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="px-3 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                          onClick={() => handleViewQuiz(quiz)}
                        >
                          <Eye className="w-4 h-4 text-indigo-600" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="px-3 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => setSelectedQuizId(quiz.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{viewQuiz?.title}</DialogTitle>
              <DialogDescription>
                Created on {viewQuiz && formatDate(viewQuiz.createdAt)}
              </DialogDescription>
            </DialogHeader>
            
            {viewQuiz && (
              <div className="mt-4 space-y-6">
                <h3 className="text-lg font-medium flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-indigo-600" />
                  Questions
                </h3>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-indigo-50">
                      <TableRow>
                        <TableHead className="w-12 font-bold text-indigo-900">#</TableHead>
                        <TableHead className="font-bold text-indigo-900">Question</TableHead>
                        <TableHead className="font-bold text-indigo-900">Type</TableHead>
                        <TableHead className="font-bold text-indigo-900">Correct Answer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewQuiz.questions.map((question, index) => {
                        const correctAnswer = question.answers.find(a => a.isCorrect);
                        
                        return (
                          <TableRow key={question.id} className="hover:bg-indigo-50/50">
                            <TableCell className="font-medium text-indigo-700">{index + 1}</TableCell>
                            <TableCell>{question.text}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200">
                                {question.type.replace('-', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-green-600">
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
                className="border-gray-200"
              >
                Close
              </Button>
              {viewQuiz && (
                <Button 
                  onClick={() => {
                    setDialogOpen(false);
                    handleTakeQuiz(viewQuiz);
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
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
