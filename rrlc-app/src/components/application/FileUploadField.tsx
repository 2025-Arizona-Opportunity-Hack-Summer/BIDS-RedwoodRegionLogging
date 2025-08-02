"use client";

import { useState, useRef } from "react";
import { FiUpload, FiFile, FiX, FiAlertCircle } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface FileUploadFieldProps {
  id: string;
  value?: File | string | null;
  onChange: (file: File | null) => void;
  acceptedFormats?: string[];
  maxSize?: number; // in bytes
  error?: string;
}

export function FileUploadField({
  id,
  value,
  onChange,
  acceptedFormats = ['.pdf', '.doc', '.docx', '.txt'],
  maxSize = 5 * 1024 * 1024, // 5MB default
  error
}: FileUploadFieldProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`;
    }

    // Check file type
    if (acceptedFormats.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type.toLowerCase();
      
      const isValidExtension = acceptedFormats.some(format => 
        format.toLowerCase() === fileExtension
      );
      
      const isValidMimeType = acceptedFormats.some(format => {
        switch (format.toLowerCase()) {
          case '.pdf':
            return mimeType === 'application/pdf';
          case '.doc':
            return mimeType === 'application/msword';
          case '.docx':
            return mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          case '.txt':
            return mimeType === 'text/plain';
          case '.jpg':
          case '.jpeg':
            return mimeType === 'image/jpeg';
          case '.png':
            return mimeType === 'image/png';
          default:
            return false;
        }
      });

      if (!isValidExtension && !isValidMimeType) {
        return `File type must be one of: ${acceptedFormats.join(', ')}`;
      }
    }

    return null;
  };

  const handleFile = (file: File) => {
    setUploadError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCurrentFileName = () => {
    if (value instanceof File) {
      return value.name;
    }
    if (typeof value === 'string' && value) {
      // Extract filename from URL or path
      return value.split('/').pop() || value;
    }
    return null;
  };

  const getCurrentFileSize = () => {
    if (value instanceof File) {
      return formatFileSize(value.size);
    }
    return null;
  };

  const fileName = getCurrentFileName();
  const fileSize = getCurrentFileSize();
  const displayError = error || uploadError;

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      {!fileName ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : displayError
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <FiUpload className={`mx-auto mb-2 ${displayError ? 'text-red-400' : 'text-gray-400'}`} size={24} />
          <p className={`text-sm font-medium ${displayError ? 'text-red-600' : 'text-gray-600'}`}>
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {acceptedFormats.join(', ')} up to {formatFileSize(maxSize)}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiFile className="text-primary" size={20} />
              <div>
                <p className="text-sm font-medium text-gray-900">{fileName}</p>
                {fileSize && (
                  <p className="text-xs text-gray-500">{fileSize}</p>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <FiX size={16} />
            </Button>
          </div>
        </div>
      )}

      {displayError && (
        <div className="flex items-center gap-1 text-red-500 text-sm">
          <FiAlertCircle size={14} />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}