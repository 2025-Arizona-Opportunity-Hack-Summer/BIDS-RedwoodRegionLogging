"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Progress,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useDisclosure,
  createToaster,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { FiDownload, FiUpload, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { SimpleFileUpload } from './SimpleFileUpload';
import {
  parseCSVFile,
  validateAndTransformRow,
  validateParsedApplications,
  checkDuplicateEmails,
  checkExistingApplications,
  importApplications,
  generateCSVTemplate,
  ParsedApplication,
  ImportResult,
  ImportError
} from '@/services/csvImport';

interface CSVImportProps {
  onImportComplete?: (result: ImportResult) => void;
}

type ImportStep = 'upload' | 'validate' | 'preview' | 'importing' | 'complete';

export function CSVImport({ onImportComplete }: CSVImportProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedApplication[]>([]);
  const [validData, setValidData] = useState<ParsedApplication[]>([]);
  const [invalidData, setInvalidData] = useState<ParsedApplication[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toaster = createToaster({
    placement: 'top',
  });

  const downloadTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scholarship_application_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toaster.create({
      title: 'Template downloaded',
      description: 'CSV template has been downloaded to your computer',
      duration: 3000,
    });
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setStep('validate');
    setProgress(10);

    try {
      // Parse CSV file
      const { data, errors: parseErrors } = await parseCSVFile(file);
      setProgress(30);

      if (parseErrors.length > 0) {
        setErrors(parseErrors.map((error, index) => ({ row: index, message: error })));
        setStep('upload');
        return;
      }

      if (data.length === 0) {
        setErrors([{ row: 0, message: 'CSV file is empty or contains no valid data' }]);
        setStep('upload');
        return;
      }

      // Transform and validate rows
      const transformed = data.map((row, index) => 
        validateAndTransformRow(row, index + 2) // +2 because CSV has header row and is 1-indexed
      );
      setParsedData(transformed);
      setProgress(50);

      // Validate applications
      const { valid, invalid, errors: validationErrors } = validateParsedApplications(transformed);
      setValidData(valid);
      setInvalidData(invalid);
      setProgress(70);

      // Check for duplicates in batch
      const duplicateErrors = checkDuplicateEmails(transformed);
      setProgress(80);

      // Check for existing applications in database
      const existingErrors = await checkExistingApplications(valid);
      setProgress(90);

      // Combine all errors
      const allErrors = [...validationErrors, ...duplicateErrors, ...existingErrors];
      setErrors(allErrors);
      setProgress(100);

      setStep('preview');
    } catch (error) {
      console.error('Error processing CSV:', error);
      setErrors([{ row: 0, message: `Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}` }]);
      setStep('upload');
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setParsedData([]);
    setValidData([]);
    setInvalidData([]);
    setErrors([]);
    setImportResult(null);
    setProgress(0);
    setStep('upload');
  };

  const handleImport = async () => {
    if (validData.length === 0) {
      toaster.create({
        title: 'No valid data to import',
        duration: 3000,
      });
      return;
    }

    setImporting(true);
    setStep('importing');

    try {
      const result = await importApplications(validData);
      setImportResult(result);
      setStep('complete');
      
      if (onImportComplete) {
        onImportComplete(result);
      }

      toaster.create({
        title: result.success ? 'Import completed' : 'Import failed',
        description: `${result.successCount} applications imported successfully, ${result.errorCount} failed`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Import error:', error);
      toaster.create({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000,
      });
      setStep('preview');
    } finally {
      setImporting(false);
    }
  };

  const renderUploadStep = () => (
    <VStack spacing={6}>
      <Box textAlign="center">
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          Import Applications from CSV
        </Text>
        <Text color="gray.600" mb={4}>
          Upload a CSV file containing scholarship application data
        </Text>
      </Box>

      <Button
        leftIcon={<FiDownload />}
        onClick={downloadTemplate}
        variant="outline"
        colorScheme="blue"
      >
        Download CSV Template
      </Button>

      <SimpleFileUpload
        onFileSelect={handleFileSelect}
        onFileRemove={handleFileRemove}
        selectedFile={selectedFile}
        accept=".csv,text/csv"
        label="Upload CSV File"
      />

      {errors.length > 0 && (
        <Alert status="error">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">File processing errors:</Text>
            {errors.slice(0, 5).map((error, index) => (
              <Text key={index} fontSize="sm">
                Row {error.row}: {error.message}
              </Text>
            ))}
            {errors.length > 5 && (
              <Text fontSize="sm" color="gray.600">
                ... and {errors.length - 5} more errors
              </Text>
            )}
          </VStack>
        </Alert>
      )}
    </VStack>
  );

  const renderValidatingStep = () => (
    <VStack spacing={4}>
      <Text fontSize="lg" fontWeight="bold">
        Processing CSV File...
      </Text>
      <Progress value={progress} w="100%" />
      <Text color="gray.600">
        Validating data and checking for conflicts
      </Text>
    </VStack>
  );

  const renderPreviewStep = () => (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="bold">
          Import Preview
        </Text>
        <HStack>
          <Button onClick={handleFileRemove} variant="outline">
            Start Over
          </Button>
          <Button
            onClick={handleImport}
            colorScheme="green"
            isDisabled={validData.length === 0}
            leftIcon={<FiUpload />}
          >
            Import {validData.length} Applications
          </Button>
        </HStack>
      </HStack>

      <HStack spacing={4}>
        <Badge colorScheme="green" p={2}>
          <HStack>
            <FiCheckCircle />
            <Text>{validData.length} Valid</Text>
          </HStack>
        </Badge>
        <Badge colorScheme="red" p={2}>
          <HStack>
            <FiAlertTriangle />
            <Text>{invalidData.length + errors.length} Errors</Text>
          </HStack>
        </Badge>
      </HStack>

      <Tabs>
        <TabList>
          <Tab>Valid Applications ({validData.length})</Tab>
          <Tab>Errors ({invalidData.length + errors.length})</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box maxH="400px" overflowY="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Row</Th>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>School</Th>
                    <Th>Major</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {validData.slice(0, 50).map((app, index) => (
                    <Tr key={index}>
                      <Td>{app._rowNumber}</Td>
                      <Td>{app.first_name} {app.last_name}</Td>
                      <Td>{app.email}</Td>
                      <Td>{app.school}</Td>
                      <Td>{app.major}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {validData.length > 50 && (
                <Text p={4} color="gray.600">
                  Showing first 50 of {validData.length} valid applications
                </Text>
              )}
            </Box>
          </TabPanel>

          <TabPanel>
            <VStack spacing={4} align="stretch">
              {errors.map((error, index) => (
                <Alert key={index} status="error">
                  <AlertIcon />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">Row {error.row}</Text>
                    <Text fontSize="sm">{error.message}</Text>
                  </VStack>
                </Alert>
              ))}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );

  const renderImportingStep = () => (
    <VStack spacing={4}>
      <Text fontSize="lg" fontWeight="bold">
        Importing Applications...
      </Text>
      <Progress value={progress} w="100%" isIndeterminate />
      <Text color="gray.600">
        Please wait while we import your data
      </Text>
    </VStack>
  );

  const renderCompleteStep = () => (
    <VStack spacing={6}>
      <Alert status={importResult?.success ? "success" : "error"}>
        <AlertIcon />
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold">
            Import {importResult?.success ? 'Completed' : 'Failed'}
          </Text>
          <Text>
            {importResult?.successCount} applications imported successfully
          </Text>
          {importResult && importResult.errorCount > 0 && (
            <Text>
              {importResult.errorCount} applications failed to import
            </Text>
          )}
        </VStack>
      </Alert>

      {importResult && importResult.errors.length > 0 && (
        <Box w="100%">
          <Text fontWeight="bold" mb={2}>Import Errors:</Text>
          <VStack spacing={2} align="stretch">
            {importResult.errors.slice(0, 10).map((error, index) => (
              <Alert key={index} status="error" size="sm">
                <AlertIcon />
                <Text fontSize="sm">
                  Row {error.row}: {error.message}
                </Text>
              </Alert>
            ))}
            {importResult.errors.length > 10 && (
              <Text color="gray.600" fontSize="sm">
                ... and {importResult.errors.length - 10} more errors
              </Text>
            )}
          </VStack>
        </Box>
      )}

      <Button onClick={handleFileRemove} colorScheme="blue">
        Import Another File
      </Button>
    </VStack>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 'upload':
        return renderUploadStep();
      case 'validate':
        return renderValidatingStep();
      case 'preview':
        return renderPreviewStep();
      case 'importing':
        return renderImportingStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderUploadStep();
    }
  };

  return (
    <Box p={6} border="1px" borderColor="gray.200" borderRadius="lg" bg="white">
      {renderCurrentStep()}
    </Box>
  );
}