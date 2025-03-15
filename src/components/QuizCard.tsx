
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, HelpCircle, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Question, Answer, MatchItem } from '@/utils/quizUtils';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  userAnswer: string | null;
  onAnswerSelect: (answerId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  showResults: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  showResults,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const [matchSelections, setMatchSelections] = useState<Record<string, string>>({});
  const correctAnswer = question.answers.find(a => a.isCorrect);
  const isCorrect = userAnswer && correctAnswer?.id === userAnswer;
  
  // Reset state when question changes
  useEffect(() => {
    setTextAnswer('');
    setMatchSelections({});
    setShowExplanation(false);
  }, [question.id]);
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  // Handle text input for short answer and fill-in-the-blank questions
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTextAnswer(e.target.value);
    
    if (question.answers.length > 0) {
      // Just store the text answer - evaluation happens on submit
      onAnswerSelect(e.target.value);
    }
  };

  // Handle matching selection change
  const handleMatchChange = (item: string, value: string) => {
    const newSelections = { ...matchSelections, [item]: value };
    setMatchSelections(newSelections);
    
    // Check if all matches are made
    if (question.options && question.options.length > 0) {
      const allMatchesMade = Object.keys(newSelections).length === question.options.length;
      
      if (allMatchesMade) {
        // Format user's selections to match the correct format (e.g., "a-1, b-2, c-3")
        const userMatching = question.options
          .map((item, index) => {
            const letter = String.fromCharCode(97 + index);
            const match = newSelections[item] || '';
            return `${letter}-${match}`;
          })
          .join(', ');
        
        // Store the formatted matching string
        onAnswerSelect(userMatching);
      }
    }
  };

  // Format the question text to highlight blanks for fill-in-the-blank questions
  const formatQuestionText = (text: string) => {
    if (question.type === 'fill-in-the-blank') {
      return text.replace(/___+/g, '_____');
    }
    return text;
  };

  // Generate matches for matching questions
  const generateMatches = () => {
    if (!question.options || question.options.length === 0) {
      return { items: [], matches: [] };
    }
    
    const items = question.options;
    // For matching questions, generate sequential numbers as match options
    const matches = Array.from({ length: items.length }, (_, i) => `${i + 1}`);
    
    return { items, matches };
  };

  // Get the matching items and options
  const { items, matches } = question.type === 'matching' ? generateMatches() : { items: [], matches: [] };

  // Render different question UI based on question type
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            {question.answers.map((answer) => (
              <motion.div
                key={answer.id}
                initial={{ opacity: 0.8, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "relative p-4 border rounded-lg transition-all duration-200 cursor-pointer transform hover:translate-y-[-2px]",
                  userAnswer === answer.id
                    ? showResults
                      ? isCorrect
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : "border-indigo-500 bg-indigo-50"
                    : showResults && answer.isCorrect
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                )}
                onClick={() => onAnswerSelect(answer.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-base font-medium">{answer.text}</p>
                  </div>

                  {showResults && (
                    <div className="ml-3 flex-shrink-0">
                      {answer.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : userAnswer === answer.id ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        );
      
      case 'true-false':
        return (
          <div className="space-y-4">
            {['True', 'False'].map((option) => {
              const answer = question.answers.find(a => a.text === option);
              if (!answer) return null;
              
              return (
                <motion.div
                  key={answer.id}
                  initial={{ opacity: 0.8, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "relative p-4 border rounded-lg transition-all duration-200 cursor-pointer transform hover:translate-y-[-2px]",
                    userAnswer === answer.id
                      ? showResults
                        ? answer.isCorrect
                          ? "border-green-500 bg-green-50"
                          : "border-red-500 bg-red-50"
                        : "border-indigo-500 bg-indigo-50"
                      : showResults && answer.isCorrect
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                  )}
                  onClick={() => onAnswerSelect(answer.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-base font-medium">{option}</p>
                    </div>

                    {showResults && (
                      <div className="ml-3 flex-shrink-0">
                        {answer.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : userAnswer === answer.id ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        );
      
      case 'fill-in-the-blank':
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <p className="mb-4 text-gray-600 italic">Fill in the blank with the correct answer:</p>
              <Input
                type="text"
                placeholder="Type your answer here..."
                value={textAnswer}
                onChange={handleTextInputChange}
                className="w-full focus:ring-2 focus:ring-indigo-500"
                disabled={showResults}
              />
              
              {showResults && correctAnswer && (
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                  <p className="text-sm font-medium text-gray-700">Correct answer:</p>
                  <p className="text-base text-green-700">{correctAnswer.text}</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'short-answer':
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <p className="mb-4 text-gray-600 italic">Provide a short answer to the question:</p>
              <Textarea
                placeholder="Type your answer here..."
                value={textAnswer}
                onChange={handleTextInputChange}
                className="w-full min-h-[120px] focus:ring-2 focus:ring-indigo-500"
                disabled={showResults}
              />
              
              {showResults && correctAnswer && (
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                  <p className="text-sm font-medium text-gray-700">Sample answer:</p>
                  <p className="text-base text-green-700">{correctAnswer.text}</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'matching':
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-sm mb-4 text-gray-600 italic">Match each item with its correct option by selecting a number from the dropdown:</p>
              
              {items.map((item, index) => (
                <div key={index} className="mb-3 p-3 bg-white rounded border">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="font-medium text-indigo-700">{String.fromCharCode(97 + index)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="font-medium">{item}</span>
                      </div>
                      
                      {!showResults ? (
                        <Select
                          onValueChange={(value) => handleMatchChange(item, value)}
                          value={matchSelections[item] || ""}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a match..." />
                          </SelectTrigger>
                          <SelectContent>
                            {matches.map((match, idx) => (
                              <SelectItem key={idx} value={match}>
                                {match}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                          <p className="text-sm text-green-700">
                            <span className="font-medium">Correct match: </span>
                            {question.correctMatching && 
                             question.correctMatching.split(',').find(pair => pair.trim().startsWith(String.fromCharCode(97 + index)))
                                ?.split('-')[1] || '?'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {showResults && question.correctMatching && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="text-sm font-medium text-gray-700 mb-2">Correct matching:</p>
                  {question.correctMatching.split(',').map(pair => {
                    const [letter, number] = pair.trim().split('-');
                    const itemIndex = letter.charCodeAt(0) - 97;
                    const item = items[itemIndex] || `Item ${letter}`;
                    return (
                      <div key={letter} className="my-1 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="font-medium text-green-700">{letter}</span>
                        </div>
                        <span>{item}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 mx-1" />
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="font-medium text-purple-700">{number}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'mixed':
        // For mixed questions, use the actual question type for rendering
        // This is needed because 'mixed' is a category, not an actual question type
        if (question.type === 'mixed' && question.answers.length > 0) {
          // Determine actual type from answers or structure
          let actualType = 'multiple-choice';
          
          if (question.answers.length === 2 && 
              question.answers.some(a => a.text === 'True') && 
              question.answers.some(a => a.text === 'False')) {
            actualType = 'true-false';
          } else if (question.correctMatching) {
            actualType = 'matching';
          } else if (question.text.includes('_____')) {
            actualType = 'fill-in-the-blank';
          } else if (question.answers.length === 1) {
            actualType = 'short-answer';
          }
          
          // Create a temporary question with the actual type
          const typedQuestion = { ...question, type: actualType as any };
          
          // Render based on the actual type
          return renderQuestionContent();
        }
        return (
          <div className="p-4 border rounded-lg">
            <p className="text-gray-500">This mixed question type couldn't be determined.</p>
          </div>
        );
      
      default:
        return (
          <div className="p-4 border rounded-lg">
            <p className="text-gray-500">This question type ({question.type}) is not supported.</p>
          </div>
        );
    }
  };

  // Get the type display name
  const getQuestionTypeDisplay = (type: string): string => {
    switch (type) {
      case 'multiple-choice': return 'Multiple Choice';
      case 'true-false': return 'True/False';
      case 'fill-in-the-blank': return 'Fill in the Blank';
      case 'short-answer': return 'Short Answer';
      case 'matching': return 'Matching';
      case 'mixed': return 'Mixed';
      default: return type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ');
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={cardVariants}
      className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden"
    >
      {/* Question header with gradient background */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex justify-between items-center mb-3">
          <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-200 font-medium">
            Question {questionNumber} of {totalQuestions}
          </Badge>
          <Badge variant="outline" className="capitalize bg-white text-purple-700 border-purple-200">
            {getQuestionTypeDisplay(question.type)}
          </Badge>
        </div>
        <h3 className="text-xl font-medium text-gray-800">{formatQuestionText(question.text)}</h3>
      </div>

      {/* Answer options */}
      <div className="p-6 space-y-4">
        {renderQuestionContent()}

        {/* Explanation toggle */}
        {showResults && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full justify-start text-left border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
              </Button>

              {showExplanation && question.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 p-4 bg-indigo-50 rounded-lg text-sm text-gray-700 border border-indigo-100"
                >
                  {question.explanation}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Card footer */}
      <div className="p-4 border-t border-gray-100 flex justify-between bg-gray-50">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={questionNumber === 1}
          className={cn(
            "border-gray-300 hover:bg-gray-100",
            questionNumber === 1 && "opacity-50"
          )}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          variant={userAnswer ? "default" : "outline"}
          size="sm"
          onClick={onNext}
          disabled={!userAnswer && !showResults}
          className={cn(
            userAnswer ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700" : 
            "border-gray-300 hover:bg-gray-100",
            !userAnswer && !showResults && "opacity-50"
          )}
        >
          {questionNumber === totalQuestions ? "Finish Quiz" : "Next"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

export default QuizCard;
