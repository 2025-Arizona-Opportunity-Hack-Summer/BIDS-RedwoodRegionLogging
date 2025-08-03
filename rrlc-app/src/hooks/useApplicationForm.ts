import { useState, useCallback } from 'react';
import { CreateApplicationData } from '@/types/database';
import { CustomField } from '@/types/database';
import * as applicationService from '@/services/applications';

export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: string[];
}

export const APPLICATION_STEPS: FormStep[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Tell us about yourself',
    fields: ['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'date_of_birth']
  },
  {
    id: 'academic',
    title: 'Academic Background',
    description: 'Share your educational journey',
    fields: ['school', 'graduation_year', 'gpa', 'major']
  },
  {
    id: 'essays',
    title: 'Essay Questions',
    description: 'Help us understand your goals and motivations',
    fields: ['career_goals', 'financial_need', 'community_involvement']
  },
  {
    id: 'additional',
    title: 'Additional Information',
    description: 'Share more about your experiences',
    fields: ['work_experience', 'extracurricular_activities', 'awards_and_honors']
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review your application before submitting',
    fields: []
  }
];

export interface FormErrors {
  [key: string]: string;
}

export function useApplicationForm(scholarshipId: string, isEditMode: boolean = false, totalSteps?: number, dynamicSteps?: FormStep[]) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CreateApplicationData>({
    scholarship_id: scholarshipId,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    school: '',
    graduation_year: new Date().getFullYear() + 1,
    major: '',
    custom_responses: {},
    status: 'draft'
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const updateFormData = useCallback((field: keyof CreateApplicationData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const updateMultipleFields = useCallback((updates: Partial<CreateApplicationData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      let hasChanges = false;
      updatedFields.forEach(field => {
        if (newErrors[field]) {
          delete newErrors[field];
          hasChanges = true;
        }
      });
      return hasChanges ? newErrors : prev;
    });
  }, []);

  const updateCustomFieldResponse = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      custom_responses: {
        ...prev.custom_responses,
        [fieldId]: value
      }
    }));
    
    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[fieldId]) {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Helper function to validate a step and return errors without setting global state
  const validateStepAndGetErrors = useCallback((stepIndex: number, stepData?: FormStep): FormErrors => {
    // Use provided stepData, or try dynamic steps, or fall back to APPLICATION_STEPS
    const step = stepData || (dynamicSteps && dynamicSteps[stepIndex]) || APPLICATION_STEPS[stepIndex];
    const stepErrors: FormErrors = {};

    step.fields.forEach(field => {
      const value = formData[field as keyof CreateApplicationData];
      
      switch (field) {
        case 'first_name':
        case 'last_name':
          const stringValue = value as string;
          if (!stringValue || stringValue.trim().length === 0) {
            stepErrors[field] = 'This field is required';
          }
          break;
          
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!value || !emailRegex.test(value as string)) {
            stepErrors[field] = 'Valid email address is required';
          }
          break;
          
        case 'phone':
          // Phone is optional, only validate if provided
          if (value && (value as string).trim().length > 0) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test((value as string).replace(/[\s\-\(\)]/g, ''))) {
              stepErrors[field] = 'Please enter a valid phone number';
            }
          }
          break;
          
        case 'address':
        case 'city':
        case 'state':
        case 'zip':
          // Address fields are optional, skip validation
          break;
          
        case 'school':
        case 'major':
          if (!value || (value as string).trim().length === 0) {
            stepErrors[field] = 'This field is required';
          }
          break;
          
        case 'graduation_year':
          const currentYear = new Date().getFullYear();
          if (!value || (value as number) < currentYear - 10 || (value as number) > currentYear + 10) {
            stepErrors[field] = 'Please enter a valid graduation year';
          }
          break;
          
        case 'gpa':
          if (value && ((value as number) < 0 || (value as number) > 4.0)) {
            stepErrors[field] = 'GPA must be between 0.0 and 4.0';
          }
          break;
          
        case 'career_goals':
          if (!value || (value as string).trim().length < 50) {
            stepErrors[field] = 'Please provide at least 50 characters';
          }
          break;
          
        case 'financial_need':
        case 'community_involvement':
          if (!value || (value as string).trim().length < 25) {
            stepErrors[field] = 'Please provide at least 25 characters';
          }
          break;
      }
    });

    return stepErrors;
  }, [formData, dynamicSteps]);

  const validateStep = useCallback((stepIndex: number, stepData?: FormStep): boolean => {
    const stepErrors = validateStepAndGetErrors(stepIndex, stepData);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [validateStepAndGetErrors]);

  const nextStep = useCallback((skipValidation: boolean = false) => {
    if (skipValidation || validateStep(currentStep)) {
      const maxSteps = totalSteps || APPLICATION_STEPS.length;
      setCurrentStep(prev => Math.min(prev + 1, maxSteps - 1));
    }
  }, [currentStep, validateStep, totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    const maxSteps = totalSteps || APPLICATION_STEPS.length;
    if (stepIndex >= 0 && stepIndex < maxSteps) {
      setCurrentStep(stepIndex);
    }
  }, [totalSteps]);


  const submitApplication = useCallback(async () => {
    // Validate all steps before submission using the actual step count
    const maxSteps = totalSteps || APPLICATION_STEPS.length;
    let isValid = true;
    let firstInvalidStep = -1;
    const validationErrors: string[] = [];
    
    // Only validate non-review steps (exclude the last step which is review)
    for (let i = 0; i < maxSteps - 1; i++) {
      const currentStepData = (dynamicSteps && dynamicSteps[i]) || APPLICATION_STEPS[i];
      let stepValid = true;
      let stepErrorDetails: string[] = [];
      
      // For dynamic steps with custom fields, use custom field validation
      if (dynamicSteps && dynamicSteps[i] && dynamicSteps[i].fields.length === 0) {
        // This might be a custom field step - skip standard validation
        stepValid = true;
      } else if (dynamicSteps && currentStepData.id !== 'personal' && currentStepData.id !== 'academic' && 
                 currentStepData.id !== 'essays' && currentStepData.id !== 'additional' && currentStepData.id !== 'review') {
        // This is likely a dynamic form section with custom fields
        // For now, assume it's valid - the custom field validation happens in the UI
        stepValid = true;
      } else {
        // Standard step validation using our new function
        const stepErrors = validateStepAndGetErrors(i);
        
        // Filter out errors for fields that don't exist in the actual form
        const actualFields = currentStepData.fields;
        const relevantErrors: FormErrors = {};
        
        Object.entries(stepErrors).forEach(([field, error]) => {
          if (actualFields.includes(field)) {
            relevantErrors[field] = error;
          }
        });
        
        stepValid = Object.keys(relevantErrors).length === 0;
        
        if (!stepValid) {
          // Collect specific field error messages
          stepErrorDetails = Object.entries(relevantErrors).map(([field, error]) => `${field}: ${error}`);
        }
      }
      
      if (!stepValid) {
        isValid = false;
        if (firstInvalidStep === -1) {
          firstInvalidStep = i;
        }
        
        if (stepErrorDetails.length > 0) {
          validationErrors.push(`Step ${i + 1} (${currentStepData.title}): ${stepErrorDetails.join(', ')}`);
        } else {
          validationErrors.push(`Step ${i + 1} (${currentStepData.title}): Missing required fields`);
        }
      }
    }

    if (!isValid) {
      // Set specific field errors for the first invalid step so users see red text under fields
      if (firstInvalidStep !== -1) {
        const firstInvalidStepData = (dynamicSteps && dynamicSteps[firstInvalidStep]) || APPLICATION_STEPS[firstInvalidStep];
        const stepErrors = validateStepAndGetErrors(firstInvalidStep, firstInvalidStepData);
        
        // Filter errors to only include fields that actually exist in the form
        const actualFields = firstInvalidStepData.fields;
        const relevantErrors: FormErrors = {};
        
        Object.entries(stepErrors).forEach(([field, error]) => {
          if (actualFields.includes(field)) {
            relevantErrors[field] = error;
          }
        });
        
        setErrors(relevantErrors); // This will show red error text under each field
        setCurrentStep(firstInvalidStep); // Go to first invalid step
      }
      return { success: false, error: `Please complete all required fields. Issues found: ${validationErrors.join('; ')}` };
    }

    setSubmitting(true);
    try {
      const { data, error } = await applicationService.submitApplication(formData, isEditMode);
      if (error) {
        console.error('Application submission error:', error);
        console.error('Application submission error details:', JSON.stringify(error, null, 2));
        // Provide a more user-friendly error message with specific details
        let errorMessage = 'Failed to submit application';
        if (error && typeof error === 'object') {
          if ('message' in error && error.message && typeof error.message === 'string') {
            errorMessage = error.message;
          } else if ('code' in error && error.code) {
            errorMessage = `Database error: ${error.code}`;
          } else if ('hint' in error && error.hint) {
            errorMessage = `Database hint: ${error.hint}`;
          }
        }
        return { success: false, error: errorMessage };
      }
      return { success: true, data };
    } catch (error) {
      console.error('Error submitting application:', error);
      console.error('Application submission catch error details:', JSON.stringify(error, null, 2));
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while submitting your application';
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateStepAndGetErrors, isEditMode, totalSteps, dynamicSteps]);

  const validateCustomFields = useCallback((customFields: CustomField[]): FormErrors => {
    const fieldErrors: FormErrors = {};
    const customResponses = formData.custom_responses || {};
    
    // List of standard fields that should be checked in main form data
    const standardFields = ['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'zip', 
                           'school', 'major', 'graduation_year', 'gpa', 'career_goals', 'financial_need', 
                           'community_involvement', 'additional_info'];

    customFields.forEach(field => {
      // Check if this is a standard field or a custom field
      const isStandardField = standardFields.includes(field.id);
      const value = isStandardField 
        ? formData[field.id as keyof CreateApplicationData]
        : customResponses[field.id];
      
      // Required field validation
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        fieldErrors[field.id] = 'This field is required';
        return;
      }

      // Skip validation if field is not required and empty
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return;
      }

      // Type-specific validation
      switch (field.type) {
        case 'text':
        case 'textarea':
          if (typeof value === 'string') {
            if (field.validation?.minLength && field.validation.minLength > 1 && value.length < field.validation.minLength) {
              fieldErrors[field.id] = `Minimum ${field.validation.minLength} characters required`;
            }
            if (field.validation?.maxLength && value.length > field.validation.maxLength) {
              fieldErrors[field.id] = `Maximum ${field.validation.maxLength} characters allowed`;
            }
            if (field.validation?.pattern) {
              const regex = new RegExp(field.validation.pattern);
              if (!regex.test(value)) {
                fieldErrors[field.id] = 'Invalid format';
              }
            }
          }
          break;

        case 'number':
          const numValue = typeof value === 'string' ? parseFloat(value) : value;
          if (isNaN(numValue)) {
            fieldErrors[field.id] = 'Must be a valid number';
          } else {
            if (field.validation?.min !== undefined && numValue < field.validation.min) {
              fieldErrors[field.id] = `Minimum value is ${field.validation.min}`;
            }
            if (field.validation?.max !== undefined && numValue > field.validation.max) {
              fieldErrors[field.id] = `Maximum value is ${field.validation.max}`;
            }
          }
          break;

        case 'email':
          if (typeof value === 'string') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              fieldErrors[field.id] = 'Invalid email address';
            }
          }
          break;

        case 'phone':
          if (typeof value === 'string') {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
              fieldErrors[field.id] = 'Invalid phone number';
            }
          }
          break;

        case 'date':
          if (typeof value === 'string' && value) {
            const dateValue = new Date(value);
            if (isNaN(dateValue.getTime())) {
              fieldErrors[field.id] = 'Invalid date';
            }
          }
          break;

        case 'file':
          // File validation would be handled by the FileUploadField component
          break;
      }
    });

    return fieldErrors;
  }, [formData]);

  const getStepProgress = useCallback(() => {
    const maxSteps = totalSteps || APPLICATION_STEPS.length;
    return ((currentStep + 1) / maxSteps) * 100;
  }, [currentStep, totalSteps]);

  return {
    currentStep,
    formData,
    errors,
    submitting,
    updateFormData,
    updateMultipleFields,
    updateCustomFieldResponse,
    validateStep,
    validateCustomFields,
    nextStep,
    prevStep,
    goToStep,
    submitApplication,
    getStepProgress,
    steps: APPLICATION_STEPS,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === (totalSteps || APPLICATION_STEPS.length) - 1,
    isReviewStep: currentStep === (totalSteps || APPLICATION_STEPS.length) - 1
  };
}