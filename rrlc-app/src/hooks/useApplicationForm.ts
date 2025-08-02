import { useState, useCallback, useEffect } from 'react';
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
    fields: ['career_goals', 'financial_need', 'community_involvement', 'why_deserve_scholarship']
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

export function useApplicationForm(scholarshipId: string) {
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
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Load existing draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      if (draftLoaded) return; // Prevent multiple loads
      
      try {
        const { data: draft, error } = await applicationService.loadApplicationDraft(scholarshipId);
        if (draft && !error) {
          // Merge draft data with form data, preserving any required fields
          setFormData(prev => ({
            ...prev,
            ...draft,
            scholarship_id: scholarshipId, // Ensure scholarship_id is correct
          }));
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      } finally {
        setDraftLoaded(true);
      }
    };

    loadDraft();
  }, [scholarshipId, draftLoaded]);

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

  const validateStep = useCallback((stepIndex: number): boolean => {
    const step = APPLICATION_STEPS[stepIndex];
    const stepErrors: FormErrors = {};

    step.fields.forEach(field => {
      const value = formData[field as keyof CreateApplicationData];
      
      switch (field) {
        case 'first_name':
        case 'last_name':
          const stringValue = value as string;
          if (!stringValue || stringValue.trim().length < 2) {
            stepErrors[field] = 'Must be at least 2 characters';
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
        case 'why_deserve_scholarship':
          if (!value || (value as string).trim().length < 25) {
            stepErrors[field] = 'Please provide at least 25 characters';
          }
          break;
      }
    });

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [formData]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, APPLICATION_STEPS.length - 1));
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < APPLICATION_STEPS.length) {
      setCurrentStep(stepIndex);
    }
  }, []);

  const saveDraft = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await applicationService.saveApplicationDraft(formData);
      if (error) {
        console.error('Draft save error:', error);
        // Provide a more user-friendly error message
        const errorMessage = (error as any)?.message || 'Failed to save draft';
        return { success: false, error: errorMessage };
      }
      return { success: true, data };
    } catch (error) {
      console.error('Error saving draft:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while saving your draft';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const submitApplication = useCallback(async () => {
    // Validate all steps before submission
    let isValid = true;
    for (let i = 0; i < APPLICATION_STEPS.length - 1; i++) {
      if (!validateStep(i)) {
        isValid = false;
        setCurrentStep(i); // Go to first invalid step
        break;
      }
    }

    if (!isValid) {
      return { success: false, error: 'Please complete all required fields' };
    }

    setSubmitting(true);
    try {
      const { data, error } = await applicationService.submitApplication(formData);
      if (error) {
        console.error('Application submission error:', error);
        const errorMessage = (error as any)?.message || 'Failed to submit application';
        return { success: false, error: errorMessage };
      }
      return { success: true, data };
    } catch (error) {
      console.error('Error submitting application:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while submitting your application';
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateStep]);

  const validateCustomFields = useCallback((customFields: CustomField[]): FormErrors => {
    const fieldErrors: FormErrors = {};
    const customResponses = formData.custom_responses || {};

    customFields.forEach(field => {
      const value = customResponses[field.id];
      
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
            if (field.validation?.minLength && value.length < field.validation.minLength) {
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
  }, [formData.custom_responses]);

  const getStepProgress = useCallback(() => {
    return ((currentStep + 1) / APPLICATION_STEPS.length) * 100;
  }, [currentStep]);

  return {
    currentStep,
    formData,
    errors,
    loading,
    submitting,
    updateFormData,
    updateMultipleFields,
    updateCustomFieldResponse,
    validateStep,
    validateCustomFields,
    nextStep,
    prevStep,
    goToStep,
    saveDraft,
    submitApplication,
    getStepProgress,
    steps: APPLICATION_STEPS,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === APPLICATION_STEPS.length - 1,
    isReviewStep: currentStep === APPLICATION_STEPS.length - 1
  };
}