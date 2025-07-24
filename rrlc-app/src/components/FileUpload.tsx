"use client";

import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Icon,
  Progress,
  Alert,
  AlertIcon,
  IconButton,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiX, FiDownload } from 'react-icons/fi';
import { uploadApplicationDocument, deleteApplicationDocument, validateFile } from '@/services/fileUpload';

export interface UploadedFile {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  document_type: 'transcript' | 'recommendation' | 'essay' | 'other';
  uploaded_at: string;
}

interface FileUploadProps {
  applicationId: string;
  documentType: 'transcript' | 'recommendation' | 'essay' | 'other';
  existingFiles: UploadedFile[];
  onFileUploaded: (file: UploadedFile) => void;
  onFileDeleted: (fileId: string) => void;
  maxFiles?: number;
  required?: boolean;
}

export function FileUpload({
  applicationId,
  documentType,
  existingFiles,
  onFileUploaded,
  onFileDeleted,
  maxFiles = 3,
  required = false
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const canUploadMore = existingFiles.length < maxFiles;

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
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!canUploadMore) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const file = files[0]; // Only handle first file
    setError(null);

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadApplicationDocument(applicationId, file, documentType);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.documentId) {
        // Create the uploaded file object (this would normally come from the API)
        const uploadedFile: UploadedFile = {
          id: result.documentId,
          file_name: file.name,
          file_url: '', // This would be returned from the API
          file_size: file.size,
          mime_type: file.type,
          document_type: documentType,
          uploaded_at: new Date().toISOString()
        };

        onFileUploaded(uploadedFile);
        
        toast({
          title: "File uploaded successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      const result = await deleteApplicationDocument(fileId);
      
      if (result.success) {
        onFileDeleted(fileId);
        toast({
          title: "File deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error deleting file",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error deleting file",
        description: error instanceof Error ? error.message : 'Unknown error',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type: string): string => {
    switch (type) {
      case 'transcript': return 'Transcript';
      case 'recommendation': return 'Recommendation Letter';
      case 'essay': return 'Essay';
      case 'other': return 'Other Document';
      default: return 'Document';
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Upload Area */}
      {canUploadMore && (
        <Box
          border="2px dashed"
          borderColor={dragActive ? "blue.400" : "gray.300"}
          borderRadius="lg"
          p={8}
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
            accept="application/pdf,image/*,.doc,.docx,.txt"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          
          <VStack spacing={3}>
            <Icon as={FiUpload} w={8} h={8} color="gray.400" />
            <Text fontSize="lg" fontWeight="medium" color="gray.700">
              Upload {getDocumentTypeLabel(documentType)}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Drag and drop or click to select
            </Text>
            <Text fontSize="xs" color="gray.400">
              PDF, Word, Image, or Text files (max 5MB)
            </Text>
            {required && (
              <Badge colorScheme="red" variant="subtle">Required</Badge>
            )}
          </VStack>
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
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <VStack spacing={2} align="stretch">
          <Text fontSize="sm" fontWeight="medium" color="gray.700">
            Uploaded Files ({existingFiles.length}/{maxFiles})
          </Text>
          
          {existingFiles.map((file) => (
            <Box
              key={file.id}
              p={3}
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              bg="white"
            >
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <Icon as={FiFile} color="gray.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium">
                      {file.file_name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatFileSize(file.file_size)} • {new Date(file.uploaded_at).toLocaleDateString()}
                    </Text>
                  </VStack>
                </HStack>
                
                <HStack spacing={1}>
                  {file.file_url && (
                    <IconButton
                      size="sm"
                      variant="ghost"
                      aria-label="Download file"
                      icon={<FiDownload />}
                      onClick={() => window.open(file.file_url, '_blank')}
                    />
                  )}
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    aria-label="Delete file"
                    icon={<FiX />}
                    onClick={() => handleDelete(file.id, file.file_name)}
                  />
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}

      {/* Max files reached message */}
      {!canUploadMore && (
        <Alert status="info">
          <AlertIcon />
          Maximum {maxFiles} files uploaded. Delete a file to upload another.
        </Alert>
      )}
      
      {/* Additional upload button when files exist but can upload more */}
      {existingFiles.length > 0 && canUploadMore && (
        <Button
          variant="outline"
          leftIcon={<FiUpload />}
          onClick={openFilePicker}
          disabled={uploading}
        >
          Upload Another File
        </Button>
      )}
    </VStack>
  );
}