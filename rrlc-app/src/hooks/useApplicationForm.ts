import { useState, useCallback } from 'react';
import { CreateApplicationData } from '@/services/applications';
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
    fields: ['school', 'graduation_year', 'gpa', 'major', 'academic_level']
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
    academic_level: 'undergraduate',
    status: 'draft'
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateFormData = useCallback((field: keyof CreateApplicationData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const updateMultipleFields = useCallback((updates: Partial<CreateApplicationData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    if (updatedFields.some(field => errors[field])) {
      setErrors(prev => {
        const newErrors = { ...prev };
        updatedFields.forEach(field => {
          delete newErrors[field];
        });
        return newErrors;
      });
    }
  }, [errors]);

  const validateStep = useCallback((stepIndex: number): boolean => {
    const step = APPLICATION_STEPS[stepIndex];
    const stepErrors: FormErrors = {};

    step.fields.forEach(field => {
      const value = formData[field as keyof CreateApplicationData];
      
      switch (field) {
        case 'first_name':
        case 'last_name':
          if (!value || (value as string).trim().length < 2) {
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
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!value || !phoneRegex.test((value as string).replace(/[\s\-\(\)]/g, ''))) {
            stepErrors[field] = 'Valid phone number is required';
          }
          break;
          
        case 'address':
        case 'city':
        case 'state':
        case 'zip':
          if (!value || (value as string).trim().length === 0) {
            stepErrors[field] = 'This field is required';
          }
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
        throw new Error('Failed to save draft');
      }
      return { success: true, data };
    } catch (error) {
      console.error('Error saving draft:', error);
      return { success: false, error };
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
        throw new Error('Failed to submit application');
      }
      return { success: true, data };
    } catch (error) {
      console.error('Error submitting application:', error);
      return { success: false, error };
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateStep]);

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
    validateStep,
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