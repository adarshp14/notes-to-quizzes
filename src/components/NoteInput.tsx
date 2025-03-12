
import React, { useState, useRef } from 'react';
import { Upload, FileText, X, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NoteInputProps {
  onNotesChange: (notes: string) => void;
}

const NoteInput: React.FC<NoteInputProps> = ({ onNotesChange }) => {
  const [notes, setNotes] = useState('');
  const [inputMethod, setInputMethod] = useState<'text' | 'upload'>('text');
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    onNotesChange(value);
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    setIsLoading(true);
    
    // Check file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, TXT, or DOCX file.');
      setIsLoading(false);
      return;
    }

    setFile(file);
    
    // For demo purposes, we'll simulate file reading
    // In a real application, you would parse the file content properly
    setTimeout(() => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          // For TXT files, we can directly use the result
          if (file.type === 'text/plain') {
            const content = e.target.result as string;
            setNotes(content);
            onNotesChange(content);
          } else {
            // For PDF and DOCX, we'd normally use a parser library
            // For demo, we'll just show a placeholder
            const fileName = file.name;
            const placeholder = `Content extracted from: ${fileName}\n\nThis is placeholder text for the extracted content from your ${file.type === 'application/pdf' ? 'PDF' : 'DOCX'} file. In a production environment, we would use a proper parser to extract the actual text content.`;
            setNotes(placeholder);
            onNotesChange(placeholder);
          }
        }
        setIsLoading(false);
      };
      
      reader.onerror = () => {
        toast.error('Error reading file');
        setIsLoading(false);
      };
      
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        // In a real app, we'd use a PDF or DOCX parser here
        reader.readAsDataURL(file);
      }
    }, 1000);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileUpload(droppedFile);
    }
  };

  // Clear file
  const clearFile = () => {
    setFile(null);
    setNotes('');
    onNotesChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Input Method Tabs */}
      <div className="flex space-x-2 mb-4">
        <Button
          type="button"
          variant={inputMethod === 'text' ? 'default' : 'outline'}
          onClick={() => setInputMethod('text')}
          className="flex-1 sm:flex-none"
        >
          <FileText className="w-4 h-4 mr-2" />
          Type Notes
        </Button>
        <Button
          type="button"
          variant={inputMethod === 'upload' ? 'default' : 'outline'}
          onClick={() => setInputMethod('upload')}
          className="flex-1 sm:flex-none"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      </div>
      
      <AnimatePresence mode="wait">
        {inputMethod === 'text' ? (
          <motion.div
            key="text-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Textarea
              placeholder="Enter your notes here..."
              className="min-h-[300px] resize-y text-base p-4"
              value={notes}
              onChange={handleTextChange}
            />
          </motion.div>
        ) : (
          <motion.div
            key="file-upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
                isDragging ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300",
                isLoading && "opacity-75"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.txt,.docx"
              />
              
              {file ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                    <File className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium break-all">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  {isLoading ? (
                    <div className="flex justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={clearFile}>
                      <X className="w-4 h-4 mr-2" />
                      Remove File
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Drag and drop your file here</p>
                    <p className="text-sm text-muted-foreground mb-4">Supports PDF, TXT, and DOCX formats</p>
                    <Button type="button" onClick={triggerFileInput}>
                      <Upload className="w-4 h-4 mr-2" />
                      Select File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NoteInput;
