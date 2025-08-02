"use client";

import { useState, useEffect } from "react";
import { 
  FiSave, 
  FiSend, 
  FiChevronLeft, 
  FiChevronRight,
  FiCheck,
  FiAlertCircle
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scholarship, CustomField } from "@/types/database";
import { useApplicationForm, FormStep as StepType } from "@/hooks/useApplicationForm";
import { FormStep } from "./FormStep";
import { FormProgress } from "./FormProgress";
import { useAuth } from "@/contexts/AuthContext";

interface ApplicationFormProps {
  scholarship: Scholarship;
  onSuccess: () => void;
}

export function ApplicationForm({ scholarship, onSuccess }: ApplicationFormProps) {
  const { user } = useAuth();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const {
    currentStep,
    formData,
    errors,
    loading,
    submitting,
    updateFormData,
    updateMultipleFields,
    validateStep,
    validateCustomFields,
    nextStep,
    prevStep,
    goToStep,
    saveDraft,
    submitApplication,
    getStepProgress,
    steps,
    isFirstStep,
    isLastStep,
    isReviewStep
  } = useApplicationForm(scholarship.id);

  // Auto-save draft every 30 seconds if there are changes
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isSubmitted && Object.keys(formData).some(key => formData[key as keyof typeof formData])) {
        const result = await handleSaveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, isSubmitted]);

  // Pre-fill email from authenticated user
  useEffect(() => {
    if (user?.email && !formData.email) {
      updateFormData('email', user.email);
    }
  }, [user, formData.email, updateFormData]);

  // Add custom fields step if scholarship has custom fields
  const allSteps = [...steps];
  if (scholarship.custom_fields && scholarship.custom_fields.length > 0) {
    // Insert custom fields step before the review step
    const customStep: StepType = {
      id: 'custom',
      title: 'Additional Information',
      description: 'Scholarship-specific questions',
      fields: scholarship.custom_fields.map(field => field.id)
    };
    allSteps.splice(allSteps.length - 1, 0, customStep);
  }

  const currentStepData = allSteps[currentStep];

  const handleSaveDraft = async () => {
    setSaveError(null);
    const result = await saveDraft();
    if (result.success) {
      setLastSaved(new Date());
    } else {
      setSaveError('Failed to save draft. Please try again.');
    }
    return result;
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    const result = await submitApplication();
    if (result.success) {
      setIsSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } else {
      setSubmitError(result.error?.toString() || 'Failed to submit application. Please try again.');
    }
  };

  const handleNext = () => {
    // Special handling for custom fields step
    if (currentStepData.id === 'custom' && scholarship.custom_fields) {
      const customFieldErrors = validateCustomFields(scholarship.custom_fields);
      if (Object.keys(customFieldErrors).length > 0) {
        // Set errors but don't use the main setErrors since it's managed by the hook
        // Instead, we'll trust that the CustomFieldRenderer will show errors
        return;
      }
    }
    
    if (validateStep(currentStep)) {
      nextStep();
    }
  };

  if (isSubmitted) {
    return (
      <Card className="bg-white border-2 border-accent-dark">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Application Submitted!</h2>
            <p className="text-primary-dark">
              Your application for {scholarship.name} has been successfully submitted.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              You will receive a confirmation email shortly.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white border-2 border-accent-dark">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-primary mb-2">
            Apply for {scholarship.name}
          </h1>
          <p className="text-primary-dark">
            Complete all sections to submit your application
          </p>
        </CardContent>
      </Card>

      {/* Progress */}
      <FormProgress 
        currentStep={currentStep} 
        totalSteps={allSteps.length}
        stepProgress={getStepProgress()}
        steps={allSteps}
        onStepClick={goToStep}
      />

      {/* Form */}
      <Card className="bg-white border-2 border-accent-dark">
        <CardContent className="p-6">
          {/* Step Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-primary mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-primary-dark">
              {currentStepData.description}
            </p>
          </div>

          {/* Step Content */}
          <FormStep
            step={currentStepData}
            formData={formData}
            errors={errors}
            onFieldChange={updateFormData}
            onMultipleFieldsChange={updateMultipleFields}
            customFields={currentStepData.id === 'custom' ? scholarship.custom_fields : undefined}
            isReviewStep={isReviewStep}
            scholarship={scholarship}
          />

          {/* Error Messages */}
          {(saveError || submitError) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <FiAlertCircle />
                <span>{saveError || submitError}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={isFirstStep || loading || submitting}
                className="border-gray-300"
              >
                <FiChevronLeft className="mr-1" />
                Previous
              </Button>
              
              {!isLastStep && (
                <Button
                  onClick={handleNext}
                  disabled={loading || submitting}
                  className="bg-primary text-white hover:bg-primary-light"
                >
                  Next
                  <FiChevronRight className="ml-1" />
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={loading || submitting || isSubmitted}
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                <FiSave className="mr-1" />
                Save Draft
              </Button>
              
              {isLastStep && (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || submitting}
                  className="bg-secondary text-white hover:bg-secondary-dark"
                >
                  <FiSend className="mr-1" />
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </div>

          {/* Auto-save indicator */}
          {(lastSaved || loading) && (
            <div className="mt-4 text-sm text-center">
              {loading ? (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Saving draft...</span>
                </div>
              ) : lastSaved ? (
                <span className="text-green-600">
                  ✓ Draft saved {lastSaved.toLocaleTimeString()}
                </span>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}