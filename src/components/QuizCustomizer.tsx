
import React from 'react';
import { Settings, HelpCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { QuestionType } from '@/utils/quizUtils';

export interface QuizSettings {
  questionCount: number;
  answerOptions: number;
  questionTypes: QuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizCustomizerProps {
  settings: QuizSettings;
  onSettingsChange: (settings: QuizSettings) => void;
}

const QuizCustomizer: React.FC<QuizCustomizerProps> = ({ settings, onSettingsChange }) => {
  // Update settings
  const updateSettings = (key: keyof QuizSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <motion.div 
      className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center mb-6">
        <Settings className="w-5 h-5 text-primary mr-2" />
        <h3 className="text-lg font-semibold">Quiz Customization</h3>
      </div>
      
      <div className="space-y-8">
        {/* Number of Questions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="question-count" className="font-medium">
              Number of Questions
            </Label>
            <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
              {settings.questionCount}
            </span>
          </div>
          <Slider
            id="question-count"
            min={5}
            max={30}
            step={1}
            value={[settings.questionCount]}
            onValueChange={(value) => updateSettings('questionCount', value[0])}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5</span>
            <span>30</span>
          </div>
        </div>
        
        {/* Answer Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="answer-options" className="font-medium">
              Answer Options Per Question
            </Label>
            <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
              {settings.answerOptions}
            </span>
          </div>
          <Slider
            id="answer-options"
            min={2}
            max={5}
            step={1}
            value={[settings.answerOptions]}
            onValueChange={(value) => updateSettings('answerOptions', value[0])}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2</span>
            <span>5</span>
          </div>
        </div>
        
        {/* Question Types */}
        <div className="space-y-3">
          <div className="flex items-center">
            <Label className="font-medium">Question Types</Label>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground ml-2 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    Choose the type of questions to include in your quiz
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <RadioGroup 
            value={settings.questionTypes} 
            onValueChange={(value) => updateSettings('questionTypes', value as QuestionType)}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multiple-choice" id="multiple-choice" />
              <Label htmlFor="multiple-choice" className="cursor-pointer">Multiple Choice</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true-false" id="true-false" />
              <Label htmlFor="true-false" className="cursor-pointer">True/False</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fill-in-the-blank" id="fill-in-the-blank" />
              <Label htmlFor="fill-in-the-blank" className="cursor-pointer">Fill in the Blank</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="short-answer" id="short-answer" />
              <Label htmlFor="short-answer" className="cursor-pointer">Short Answer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="matching" id="matching" />
              <Label htmlFor="matching" className="cursor-pointer">Matching</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mixed" id="mixed" />
              <Label htmlFor="mixed" className="cursor-pointer">Mixed (Random Types)</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Difficulty Level */}
        <div className="space-y-3">
          <div className="flex items-center">
            <Label className="font-medium">Difficulty Level</Label>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground ml-2 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    Determines the complexity of questions generated
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <RadioGroup 
            value={settings.difficulty} 
            onValueChange={(value) => updateSettings('difficulty', value as 'easy' | 'medium' | 'hard')}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="easy" id="easy" />
              <Label htmlFor="easy" className="cursor-pointer">Easy</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium" className="cursor-pointer">Medium</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hard" id="hard" />
              <Label htmlFor="hard" className="cursor-pointer">Hard</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizCustomizer;
