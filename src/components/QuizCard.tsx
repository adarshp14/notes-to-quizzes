
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, HelpCircle, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Question, Answer } from '@/utils/quizUtils';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  // Handle text input for short answer and fill-in-the-blank questions
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTextAnswer(e.target.value);
    // For text-based questions, we'll use the first answer's ID as a reference
    // but the actual comparison would be done with the text value
    if (question.answers.length > 0) {
      onAnswerSelect(question.answers[0].id);
    }
  };

  // Handle matching selection change
  const handleMatchChange = (item: string, value: string) => {
    const newSelections = { ...matchSelections, [item]: value };
    setMatchSelections(newSelections);
    
    // Once all matches are made, create a formatted answer string and submit
    if (question.answers.length > 0) {
      const allMatchesMade = Object.keys(newSelections).length === (question.matchItems?.length || 0);
      if (allMatchesMade) {
        onAnswerSelect(question.answers[0].id);
      }
    }
  };

  // Parse matching format (e.g., "a-4, b-1, c-3, d-2") to get items and options
  const parseMatchingFormat = () => {
    // Extract matching items and their correct matches from correct_answer if available
    const matchingPairs: Array<{item: string, match: string}> = [];
    const items: string[] = [];
    const matches: string[] = [];

    // Try to extract matching information from question text or correct answer
    if (question.type === 'matching' && correctAnswer) {
      // If the options array contains the items to match
      if (question.answers.length > 0 && Array.isArray(question.options)) {
        return {
          items: question.options || [],
          matches: question.options.map((_item, index) => `Option ${index + 1}`)
        };
      }
    }

    return {
      items: items.length > 0 ? items : ['Item A', 'Item B', 'Item C', 'Item D'],
      matches: matches.length > 0 ? matches : ['Match 1', 'Match 2', 'Match 3', 'Match 4']
    };
  };

  // Get the matching items and options
  const { items, matches } = question.type === 'matching' ? parseMatchingFormat() : { items: [], matches: [] };

  // Render different question UI based on question type
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
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
      
      case 'fill-in-the-blank':
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <Input
                type="text"
                placeholder="Type your answer here..."
                value={textAnswer}
                onChange={handleTextInputChange}
                className="w-full focus:ring-2 focus:ring-indigo-500"
                disabled={showResults}
              />
              
              {showResults && (
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                  <p className="text-sm font-medium text-gray-700">Correct answer:</p>
                  <p className="text-base text-green-700">{correctAnswer?.text}</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'short-answer':
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <Textarea
                placeholder="Type your answer here..."
                value={textAnswer}
                onChange={handleTextInputChange}
                className="w-full min-h-[120px] focus:ring-2 focus:ring-indigo-500"
                disabled={showResults}
              />
              
              {showResults && (
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                  <p className="text-sm font-medium text-gray-700">Sample answer:</p>
                  <p className="text-base text-green-700">{correctAnswer?.text}</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'matching':
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-sm mb-4 text-gray-500">Match each item with its correct option:</p>
              
              {/* For the case of matching, display the original options as items to match */}
              {question.options && Array.isArray(question.options) && question.options.map((item, index) => (
                <div key={index} className="mb-3 p-3 bg-white rounded border">
                  <div className="mb-2">
                    <span className="font-medium">{String.fromCharCode(97 + index)}) </span>
                    <span>{item}</span>
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
                        {Array.from({ length: question.options.length }, (_, i) => (
                          <SelectItem key={i} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                      <p className="text-sm text-green-700">
                        <span className="font-medium">Correct match: </span>
                        {/* Extract the match from the correct_answer format if possible */}
                        {correctAnswer && correctAnswer.text && correctAnswer.text.includes(String.fromCharCode(97 + index))
                          ? correctAnswer.text.match(new RegExp(`${String.fromCharCode(97 + index)}-([0-9]+)`))?.at(1) || '?'
                          : index + 1}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              
              {/* If we only have regular multiple choice answers but it's labeled as matching */}
              {(!question.options || !Array.isArray(question.options) || question.options.length === 0) && 
               question.answers.map((answer) => (
                <motion.div
                  key={answer.id}
                  initial={{ opacity: 0.8, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "relative p-4 mb-2 border rounded-lg bg-white transition-all duration-200 cursor-pointer transform hover:translate-y-[-2px]",
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
              
              {showResults && correctAnswer && (
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                  <p className="text-sm font-medium text-gray-700">Correct matching:</p>
                  <p className="text-base text-green-700 whitespace-pre-line">{correctAnswer.text}</p>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-4 border rounded-lg">
            <p className="text-gray-500">This question type is not supported.</p>
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
      default: return 'Multiple Choice';
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
        <h3 className="text-xl font-medium text-gray-800">{question.text}</h3>
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
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

export default QuizCard;
