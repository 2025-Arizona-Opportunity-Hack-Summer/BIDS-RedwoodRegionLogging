"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormStep as StepType } from "@/hooks/useApplicationForm";
import { CreateApplicationData, CustomField, FormField, Scholarship } from "@/types/database";
import { CustomFieldRenderer } from "./CustomFieldRenderer";
import { FiCalendar, FiDollarSign, FiFileText, FiUser } from "react-icons/fi";

interface FormStepProps {
  step: StepType;
  formData: CreateApplicationData;
  errors: Record<string, string>;
  onFieldChange: (field: keyof CreateApplicationData, value: string | number) => void;
  onMultipleFieldsChange: (updates: Partial<CreateApplicationData>) => void;
  onCustomFieldChange?: (fieldId: string, value: any) => void;
  customFields?: (CustomField | FormField)[] | null;
  isReviewStep?: boolean;
  scholarship?: Scholarship;
}

export function FormStep({
  step,
  formData,
  errors,
  onFieldChange,
  onMultipleFieldsChange,
  onCustomFieldChange,
  customFields,
  isReviewStep,
  scholarship
}: FormStepProps) {
  if (isReviewStep) {
    return (
      <div className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <FiUser />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <span className="text-sm text-gray-600">Name:</span>
              <p className="font-medium">{formData.first_name} {formData.last_name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Email:</span>
              <p className="font-medium">{formData.email}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Phone:</span>
              <p className="font-medium">{formData.phone || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Address:</span>
              <p className="font-medium">
                {formData.address && formData.city && formData.state && formData.zip
                  ? `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`
                  : 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <FiFileText />
            Academic Background
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <span className="text-sm text-gray-600">School:</span>
              <p className="font-medium">{formData.school || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Graduation Year:</span>
              <p className="font-medium">{formData.graduation_year || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Major:</span>
              <p className="font-medium">{formData.major || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">GPA:</span>
              <p className="font-medium">{formData.gpa || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Essays */}
        {(formData.career_goals || formData.financial_need || formData.community_involvement) && (
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Essay Responses</h3>
            <div className="space-y-4">
              {formData.career_goals && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Career Goals:</p>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full">
                      {formData.career_goals}
                    </div>
                  </div>
                </div>
              )}
              {formData.financial_need && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Financial Need:</p>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full">
                      {formData.financial_need}
                    </div>
                  </div>
                </div>
              )}
              {formData.community_involvement && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Community Involvement:</p>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full">
                      {formData.community_involvement}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scholarship Info */}
        {scholarship && (
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <FiDollarSign />
              Scholarship Details
            </h3>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="font-medium text-blue-900">{scholarship.name}</p>
              {scholarship.amount && (
                <p className="text-blue-700">
                  Award Amount: ${scholarship.amount.toLocaleString()}
                </p>
              )}
              {scholarship.deadline && (
                <p className="text-blue-700 flex items-center gap-2">
                  <FiCalendar size={16} />
                  Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Handle dynamic form sections or legacy custom fields
  if (customFields && customFields.length > 0) {
    return (
      <div className="space-y-6">
        {customFields.map((field) => (
          <CustomFieldRenderer
            key={field.id}
            field={field as CustomField} // Both CustomField and FormField have the same structure
            value={formData.custom_responses?.[field.id] || ''}
            onChange={(value) => {
              if (onCustomFieldChange) {
                onCustomFieldChange(field.id, value);
              } else {
                // Fallback to the old method if onCustomFieldChange is not provided
                const currentResponses = formData.custom_responses || {};
                onMultipleFieldsChange({
                  custom_responses: {
                    ...currentResponses,
                    [field.id]: value
                  }
                });
              }
            }}
            error={errors[field.id]}
          />
        ))}
      </div>
    );
  }

  // Render standard form fields
  return (
    <div className="space-y-6">
      {step.fields.map((fieldName) => {
        const value = formData[fieldName as keyof CreateApplicationData] || '';
        const error = errors[fieldName];

        switch (fieldName) {
          case 'first_name':
          case 'last_name':
          case 'email':
          case 'phone':
          case 'address':
          case 'city':
          case 'state':
          case 'zip':
          case 'school':
          case 'major':
            return (
              <div key={fieldName}>
                <Label htmlFor={fieldName} className="text-primary">
                  {fieldName.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                  {['first_name', 'last_name', 'email', 'school', 'major'].includes(fieldName) && 
                    <span className="text-red-500 ml-1">*</span>
                  }
                </Label>
                <Input
                  id={fieldName}
                  type={fieldName === 'email' ? 'email' : 'text'}
                  value={value as string}
                  onChange={(e) => onFieldChange(fieldName as keyof CreateApplicationData, e.target.value)}
                  className={`mt-1 ${error ? 'border-red-500' : ''}`}
                  placeholder={
                    fieldName === 'email' ? 'your.email@example.com' :
                    fieldName === 'phone' ? '(555) 123-4567' :
                    ''
                  }
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>
            );

          case 'graduation_year':
            return (
              <div key={fieldName}>
                <Label htmlFor={fieldName} className="text-primary">
                  Graduation Year
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id={fieldName}
                  type="number"
                  min={new Date().getFullYear() - 10}
                  max={new Date().getFullYear() + 10}
                  value={value as number}
                  onChange={(e) => onFieldChange(fieldName as keyof CreateApplicationData, parseInt(e.target.value))}
                  className={`mt-1 ${error ? 'border-red-500' : ''}`}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>
            );

          case 'gpa':
            return (
              <div key={fieldName}>
                <Label htmlFor={fieldName} className="text-primary">
                  GPA (0.0 - 4.0)
                </Label>
                <Input
                  id={fieldName}
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={value as number}
                  onChange={(e) => onFieldChange(fieldName as keyof CreateApplicationData, parseFloat(e.target.value))}
                  className={`mt-1 ${error ? 'border-red-500' : ''}`}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>
            );

          case 'career_goals':
          case 'financial_need':
          case 'community_involvement':
          case 'why_deserve_scholarship':
          case 'work_experience':
          case 'extracurricular_activities':
          case 'awards_and_honors':
            return (
              <div key={fieldName}>
                <Label htmlFor={fieldName} className="text-primary">
                  {fieldName === 'career_goals' && 'What are your career goals?'}
                  {fieldName === 'financial_need' && 'Describe your financial need'}
                  {fieldName === 'community_involvement' && 'Describe your community involvement'}
                  {fieldName === 'why_deserve_scholarship' && 'Why do you deserve this scholarship?'}
                  {fieldName === 'work_experience' && 'Work Experience'}
                  {fieldName === 'extracurricular_activities' && 'Extracurricular Activities'}
                  {fieldName === 'awards_and_honors' && 'Awards and Honors'}
                  {['career_goals', 'financial_need', 'community_involvement', 'why_deserve_scholarship'].includes(fieldName) && 
                    <span className="text-red-500 ml-1">*</span>
                  }
                </Label>
                <Textarea
                  id={fieldName}
                  value={value as string}
                  onChange={(e) => onFieldChange(fieldName as keyof CreateApplicationData, e.target.value)}
                  className={`mt-1 ${error ? 'border-red-500' : ''}`}
                  rows={6}
                  placeholder={
                    fieldName === 'career_goals' ? 'Describe your short-term and long-term career goals...' :
                    fieldName === 'financial_need' ? 'Explain your financial situation and need for this scholarship...' :
                    fieldName === 'community_involvement' ? 'List your community service and volunteer activities...' :
                    fieldName === 'why_deserve_scholarship' ? 'Explain why you are a strong candidate for this scholarship...' :
                    ''
                  }
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  {['career_goals'].includes(fieldName) && 'Minimum 50 characters'}
                  {['financial_need', 'community_involvement', 'why_deserve_scholarship'].includes(fieldName) && 'Minimum 25 characters'}
                </p>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}