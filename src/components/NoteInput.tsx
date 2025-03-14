import React, { useState, useRef } from 'react';
import { Upload, FileText, X, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NoteInputProps {
  // Pass typed notes to the parent
  onNotesChange: (notes: string) => void;
  // Pass selected file to the parent
  onFileChange: (file: File | null) => void;

  // Current input method: "text" or "upload"
  inputMethod: 'text' | 'upload';
  // Callback to switch methods
  onInputMethodChange: (method: 'text' | 'upload') => void;
}

const NoteInput: React.FC<NoteInputProps> = ({
  onNotesChange,
  onFileChange,
  inputMethod,
  onInputMethodChange,
}) => {
  const [notes, setNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle text input
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    onNotesChange(value); // Pass typed notes up
  };

  // Called whenever the user selects a file
  const handleFileUpload = (newFile: File) => {
    setIsLoading(true);

    // Check file type for allowed formats
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    if (!allowedTypes.includes(newFile.type)) {
      toast.error('Invalid file type. Please upload PDF, TXT, DOCX, JPG, or PNG.');
      setIsLoading(false);
      return;
    }

    // Save locally
    setFile(newFile);
    // Also inform parent
    onFileChange(newFile);

    // Simulate some "loading" just to show the user a spinner
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`File ready: ${newFile.name}`);
    }, 1000);
  };

  // Standard <input> onChange
  const handleFileChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  // Drag & drop events
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

  // Clear the file
  const clearFile = () => {
    setFile(null);
    onFileChange(null);  // Let parent know we cleared it
    setNotes('');
    onNotesChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Manually open file picker
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Toggle "Type Notes" vs. "Upload File" */}
      <div className="flex space-x-2 mb-4">
        <Button
          type="button"
          variant={inputMethod === 'text' ? 'default' : 'outline'}
          onClick={() => onInputMethodChange('text')}
          className="flex-1 sm:flex-none"
        >
          <FileText className="w-4 h-4 mr-2" />
          Type Notes
        </Button>
        <Button
          type="button"
          variant={inputMethod === 'upload' ? 'default' : 'outline'}
          onClick={() => onInputMethodChange('upload')}
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
                onChange={handleFileChangeEvent}
                accept=".pdf,.txt,.docx,.jpeg,.jpg,.png"
              />
              
              {file ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                    <File className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium break-all">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
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
                    <p className="text-sm text-muted-foreground mb-4">
                      Supports PDF, TXT, DOCX, JPG, and PNG formats
                    </p>
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
