"use client";

import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Text,
  HStack,
  Icon,
  Progress,
  Alert,
  AlertIcon,
  VStack,
} from '@chakra-ui/react';
import { FiUpload, FiFile } from 'react-icons/fi';
import { validateFile } from '@/services/fileUpload';

interface SimpleFileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  uploading?: boolean;
  uploadProgress?: number;
  error?: string | null;
  accept?: string;
  label?: string;
  required?: boolean;
}

export function SimpleFileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  uploading = false,
  uploadProgress = 0,
  error = null,
  accept = "application/pdf,image/*,.doc,.docx,.txt",
  label = "Upload Document",
  required = false
}: SimpleFileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);
    if (validation.valid) {
      onFileSelect(file);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <VStack spacing={3} align="stretch">
      {!selectedFile ? (
        <Box
          border="2px dashed"
          borderColor={dragActive ? "blue.400" : "gray.300"}
          borderRadius="md"
          p={6}
          textAlign="center"
          bg={dragActive ? "blue.50" : "gray.50"}
          transition="all 0.2s"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          cursor="pointer"
          onClick={openFilePicker}
          _hover={{ borderColor: "blue.400", bg: "blue.50" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          
          <VStack spacing={2}>
            <Icon as={FiUpload} w={6} h={6} color="gray.400" />
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              {label}
            </Text>
            <Text fontSize="xs" color="gray.500">
              Drag and drop or click to select
            </Text>
            <Text fontSize="xs" color="gray.400">
              PDF, Word, Image, or Text files (max 5MB)
            </Text>
            {required && (
              <Text fontSize="xs" color="red.500">* Required</Text>
            )}
          </VStack>
        </Box>
      ) : (
        <Box
          p={3}
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          bg="gray.50"
        >
          <HStack justify="space-between">
            <HStack spacing={3}>
              <Icon as={FiFile} color="gray.500" />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="medium">
                  {selectedFile.name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {formatFileSize(selectedFile.size)}
                </Text>
              </VStack>
            </HStack>
            
            {!uploading && (
              <Button
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={onFileRemove}
              >
                Remove
              </Button>
            )}
          </HStack>
        </Box>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Box>
          <Text fontSize="sm" mb={2}>Uploading...</Text>
          <Progress value={uploadProgress} colorScheme="blue" />
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert status="error" size="sm">
          <AlertIcon />
          <Text fontSize="sm">{error}</Text>
        </Alert>
      )}
    </VStack>
  );
}