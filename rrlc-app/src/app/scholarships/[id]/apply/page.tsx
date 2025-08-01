"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  FiArrowLeft, 
  FiArrowRight, 
  FiSave, 
  FiSend, 
  FiUser, 
  FiBook, 
  FiEdit3, 
  FiPlus, 
  FiCheckCircle 
} from "react-icons/fi";
import { useApplicationForm } from "@/hooks/useApplicationForm";
import { getScholarshipById } from "@/services/scholarships";
import { Scholarship } from "@/types/database";
import { CreateApplicationData } from "@/services/applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface StepComponentProps {
  formData: CreateApplicationData;
  updateFormData: (field: keyof CreateApplicationData, value: string | number) => void;
  errors: Record<string, string>;
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-accent rounded-full h-3">
      <div
        className="h-full rounded-full transition-all duration-500 ease-in-out"
        style={{ 
          width: `${progress}%`,
          backgroundColor: 'rgb(9,76,9)'
        }}
      />
    </div>
  );
}

interface StepIndicatorProps {
  steps: { id: string; title: string; description: string }[];
  currentStep: number;
  goToStep: (step: number) => void;
}

function StepIndicator({ steps, currentStep, goToStep }: StepIndicatorProps) {
  const icons = [FiUser, FiBook, FiEdit3, FiPlus, FiCheckCircle];
  
  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-4">
      {steps.map((step, index: number) => {
        const Icon = icons[index];
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = index <= currentStep;
        
        return (
          <div
            key={step.id}
            className={`flex flex-col items-center gap-2 ${
              isClickable ? 'cursor-pointer' : 'cursor-default'
            } ${
              isClickable ? 'opacity-100' : 'opacity-50'
            } flex-shrink-0 md:flex-auto`}
            onClick={isClickable ? () => goToStep(index) : undefined}
          >
            <div
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${
                isClickable ? 'hover:scale-105' : ''
              } ${
                isCompleted 
                  ? 'text-white border-transparent' 
                  : isActive 
                  ? 'text-white border-primary-dark'
                  : 'text-primary border-transparent'
              }`}
              style={{
                backgroundColor: isCompleted 
                  ? 'rgb(9,76,9)' 
                  : isActive 
                  ? 'rgb(92,127,66)' 
                  : 'rgb(193,212,178)',
                borderColor: isActive ? 'rgb(9,76,9)' : 'transparent'
              }}
            >
              <Icon size={20} />
            </div>
            <p
              className={`text-xs text-center max-w-20 ${
                isActive ? 'font-bold' : 'font-medium'
              }`}
              style={{
                color: isActive ? 'rgb(9,76,9)' : 'rgb(78,61,30)'
              }}
            >
              {step.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function PersonalInfoStep({ formData, updateFormData, errors }: StepComponentProps) {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block mb-2 text-black font-medium">
            First Name *
          </label>
          <Input
            value={formData.first_name}
            onChange={(e) => updateFormData('first_name', e.target.value)}
            className={`bg-white text-black placeholder:text-gray-500 placeholder:opacity-80 ${
              errors.first_name 
                ? 'border-red-300 hover:border-red-400 focus-visible:ring-red-500' 
                : 'border-accent-dark hover:border-primary-light focus-visible:ring-primary'
            }`}
            error={!!errors.first_name}
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.first_name}
            </p>
          )}
        </div>
        
        <div className="flex-1">
          <label className="block mb-2 text-black font-medium">
            Last Name *
          </label>
          <Input
            value={formData.last_name}
            onChange={(e) => updateFormData('last_name', e.target.value)}
            className={`bg-white text-black placeholder:text-gray-500 placeholder:opacity-80 ${
              errors.last_name 
                ? 'border-red-300 hover:border-red-400 focus-visible:ring-red-500' 
                : 'border-accent-dark hover:border-primary-light focus-visible:ring-primary'
            }`}
            error={!!errors.last_name}
          />
          {errors.last_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.last_name}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block mb-2 text-black font-medium">
            Email Address *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className={`bg-white text-black placeholder:text-gray-500 placeholder:opacity-80 ${
              errors.email 
                ? 'border-red-300 hover:border-red-400 focus-visible:ring-red-500' 
                : 'border-accent-dark hover:border-primary-light focus-visible:ring-primary'
            }`}
            error={!!errors.email}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email}
            </p>
          )}
        </div>
        
        <div className="flex-1">
          <label className="block mb-2 text-black font-medium">
            Phone Number *
          </label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            className={`bg-white text-black placeholder:text-gray-500 placeholder:opacity-80 ${
              errors.phone 
                ? 'border-red-300 hover:border-red-400 focus-visible:ring-red-500' 
                : 'border-accent-dark hover:border-primary-light focus-visible:ring-primary'
            }`}
            error={!!errors.phone}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block mb-2 text-black font-medium">
          Address *
        </label>
        <Input
          value={formData.address}
          onChange={(e) => updateFormData('address', e.target.value)}
          className={`bg-white text-black placeholder:text-gray-500 placeholder:opacity-80 ${
            errors.address 
              ? 'border-red-300 hover:border-red-400 focus-visible:ring-red-500' 
              : 'border-accent-dark hover:border-primary-light focus-visible:ring-primary'
          }`}
          error={!!errors.address}
        />
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">
            {errors.address}
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-2">
          <label className="block mb-2 text-black font-medium">
            City *
          </label>
          <Input
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            className={`bg-white text-black placeholder:text-gray-500 placeholder:opacity-80 ${
              errors.city 
                ? 'border-red-300 hover:border-red-400 focus-visible:ring-red-500' 
                : 'border-accent-dark hover:border-primary-light focus-visible:ring-primary'
            }`}
            error={!!errors.city}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">
              {errors.city}
            </p>
          )}
        </div>
        
        <div className="flex-1">
          <label className="block mb-2 text-black font-medium">
            State *
          </label>
          <Input
            value={formData.state}
            onChange={(e) => updateFormData('state', e.target.value)}
            className={`bg-white text-black placeholder:text-gray-500 placeholder:opacity-80 ${
              errors.state 
                ? 'border-red-300 hover:border-red-400 focus-visible:ring-red-500' 
                : 'border-accent-dark hover:border-primary-light focus-visible:ring-primary'
            }`}
            error={!!errors.state}
          />
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">
              {errors.state}
            </p>
          )}
        </div>
        
        <div className="flex-1">
          <label className="block mb-2 text-black font-medium">
            ZIP Code *
          </label>
          <Input
            value={formData.zip}
            onChange={(e) => updateFormData('zip', e.target.value)}
            className={`bg-white text-black placeholder:text-gray-500 placeholder:opacity-80 ${
              errors.zip 
                ? 'border-red-300 hover:border-red-400 focus-visible:ring-red-500' 
                : 'border-accent-dark hover:border-primary-light focus-visible:ring-primary'
            }`}
            error={!!errors.zip}
          />
          {errors.zip && (
            <p className="text-red-500 text-sm mt-1">
              {errors.zip}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block mb-2 text-black font-medium">
          Date of Birth
        </label>
        <Input
          type="date"
          value={formData.date_of_birth || ''}
          onChange={(e) => updateFormData('date_of_birth', e.target.value)}
          className="bg-white text-black placeholder:text-gray-500 placeholder:opacity-80 border-accent-dark hover:border-primary-light focus-visible:ring-primary"
        />
      </div>
    </div>
  );
}

function AcademicInfoStep({ formData, updateFormData, errors }: StepComponentProps) {
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <label className="block mb-2 text-black font-medium">
          School/Institution *
        </label>
        <Input
          value={formData.school}
          onChange={(e) => updateFormData('school', e.target.value)}
          placeholder="Enter your school or institution name"
          className={`bg-white text-black placeholder:text-gray-500 placeholder:opacity-80 ${
            errors.school 
              ? 'border-red-300 hover:border-red-400 focus-visible:ring-red-500' 
              : 'border-accent-dark hover:border-primary-light focus-visible:ring-primary'
          }`}
          error={!!errors.school}
        />
        {errors.school && (
          <p className="text-red-500 text-sm mt-1">
            {errors.school}
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block mb-2 text-black font-medium">
            Academic Level *
          </label>
          <select
            value={formData.academic_level}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFormData('academic_level', e.target.value)}
            className="w-full p-3 border border-accent-dark rounded-lg text-white text-lg"
            style={{
              backgroundColor: 'rgb(146,169,129)'
            }}
          >
            <option value="high_school">High School</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="graduate">Graduate</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block mb-2 text-black font-medium">
            Expected Graduation Year *
          </label>
          <Input
            type="number"
            value={formData.graduation_year}
            onChange={(e) => updateFormData('graduation_year', parseInt(e.target.value))}
            min={new Date().getFullYear() - 5}
            max={new Date().getFullYear() + 10}
            className={`bg-white text-black placeholder:text-gray-500 placeholder:opacity-80 ${
              errors.graduation_year 
                ? 'border-red-300 hover:border-red-400 focus-visible:ring-red-500' 
                : 'border-accent-dark hover:border-primary-light focus-visible:ring-primary'
            }`}
            error={!!errors.graduation_year}
          />
          {errors.graduation_year && (
            <p className="text-red-500 text-sm mt-1">
              {errors.graduation_year}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-2">
          <label className="block mb-2 text-black font-medium">
            Major/Field of Study *
          </label>
          <Input
            value={formData.major}
            onChange={(e) => updateFormData('major', e.target.value)}
            placeholder="e.g., Forestry, Environmental Science, Business"
            className={`bg-white text-black placeholder:text-gray-500 placeholder:opacity-80 ${
              errors.major 
                ? 'border-red-300 hover:border-red-400 focus-visible:ring-red-500' 
                : 'border-accent-dark hover:border-primary-light focus-visible:ring-primary'
            }`}
            error={!!errors.major}
          />
          {errors.major && (
            <p className="text-red-500 text-sm mt-1">
              {errors.major}
            </p>
          )}
        </div>
        
        <div className="flex-1">
          <label className="block mb-2 text-black font-medium">
            GPA (optional)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max="4"
            value={formData.gpa || ''}
            onChange={(e) => updateFormData('gpa', e.target.value ? parseFloat(e.target.value) : 0)}
            placeholder="e.g., 3.5"
            className={`bg-white text-black placeholder:text-gray-500 placeholder:opacity-80 ${
              errors.gpa 
                ? 'border-red-300 hover:border-red-400 focus-visible:ring-red-500' 
                : 'border-accent-dark hover:border-primary-light focus-visible:ring-primary'
            }`}
            error={!!errors.gpa}
          />
          {errors.gpa && (
            <p className="text-red-500 text-sm mt-1">
              {errors.gpa}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function EssayStep({ formData, updateFormData, errors }: StepComponentProps) {
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <label className="block mb-2 text-black font-medium">
          Career Goals and Aspirations * (minimum 50 characters)
        </label>
        <textarea
          value={formData.career_goals || ''}
          onChange={(e) => updateFormData('career_goals', e.target.value)}
          placeholder="Describe your career goals and how this scholarship will help you achieve them..."
          rows={4}
          className={`textarea resize-y ${
            errors.career_goals 
              ? 'border-red-300 hover:border-red-400 focus-visible:ring-red-500' 
              : 'border-accent-dark hover:border-primary-light focus-visible:ring-primary'
          } bg-white text-black placeholder:text-gray-500 placeholder:opacity-80`}
        />
        <div className="flex justify-between mt-1">
          {errors.career_goals && (
            <p className="text-red-500 text-sm">
              {errors.career_goals}
            </p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {formData.career_goals?.length || 0}/50 minimum
          </p>
        </div>
      </div>

      <div>
        <label className="block mb-2 text-black font-medium">
          Financial Need * (minimum 25 characters)
        </label>
        <textarea
          value={formData.financial_need || ''}
          onChange={(e) => updateFormData('financial_need', e.target.value)}
          placeholder="Explain your financial situation and why you need this scholarship..."
          rows={4}
          className={`textarea resize-y ${
            errors.financial_need 
              ? 'border-red-300 hover:border-red-400 focus-visible:ring-red-500' 
              : 'border-accent-dark hover:border-primary-light focus-visible:ring-primary'
          } bg-white text-black placeholder:text-gray-500 placeholder:opacity-80`}
        />
        <div className="flex justify-between mt-1">
          {errors.financial_need && (
            <p className="text-red-500 text-sm">
              {errors.financial_need}
            </p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {formData.financial_need?.length || 0}/25 minimum
          </p>
        </div>
      </div>

      <div>
        <label className="block mb-2 text-black font-medium">
          Community Involvement * (minimum 25 characters)
        </label>
        <textarea
          value={formData.community_involvement || ''}
          onChange={(e) => updateFormData('community_involvement', e.target.value)}
          placeholder="Describe your involvement in community service, volunteering, or local organizations..."
          rows={4}
          className={`textarea resize-y ${
            errors.community_involvement 
              ? 'border-red-300 hover:border-red-400 focus-visible:ring-red-500' 
              : 'border-accent-dark hover:border-primary-light focus-visible:ring-primary'
          } bg-white text-black placeholder:text-gray-500 placeholder:opacity-80`}
        />
        <div className="flex justify-between mt-1">
          {errors.community_involvement && (
            <p className="text-red-500 text-sm">
              {errors.community_involvement}
            </p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {formData.community_involvement?.length || 0}/25 minimum
          </p>
        </div>
      </div>

      <div>
        <label className="block mb-2 text-black font-medium">
          Why You Deserve This Scholarship * (minimum 25 characters)
        </label>
        <textarea
          value={formData.why_deserve_scholarship || ''}
          onChange={(e) => updateFormData('why_deserve_scholarship', e.target.value)}
          placeholder="Explain why you are a deserving candidate for this scholarship..."
          rows={4}
          className={`textarea resize-y ${
            errors.why_deserve_scholarship 
              ? 'border-red-300 hover:border-red-400 focus-visible:ring-red-500' 
              : 'border-accent-dark hover:border-primary-light focus-visible:ring-primary'
          } bg-white text-black placeholder:text-gray-500 placeholder:opacity-80`}
        />
        <div className="flex justify-between mt-1">
          {errors.why_deserve_scholarship && (
            <p className="text-red-500 text-sm">
              {errors.why_deserve_scholarship}
            </p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {formData.why_deserve_scholarship?.length || 0}/25 minimum
          </p>
        </div>
      </div>
    </div>
  );
}

function AdditionalInfoStep({ formData, updateFormData }: StepComponentProps) {
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <label className="block mb-2 text-black font-medium">
          Work Experience (optional)
        </label>
        <textarea
          value={formData.work_experience || ''}
          onChange={(e) => updateFormData('work_experience', e.target.value)}
          placeholder="Describe any relevant work experience, internships, or part-time jobs..."
          rows={4}
          className="textarea resize-y border-accent-dark hover:border-primary-light focus-visible:ring-primary bg-white text-black placeholder:text-gray-500 placeholder:opacity-80"
        />
      </div>

      <div>
        <label className="block mb-2 text-black font-medium">
          Extracurricular Activities (optional)
        </label>
        <textarea
          value={formData.extracurricular_activities || ''}
          onChange={(e) => updateFormData('extracurricular_activities', e.target.value)}
          placeholder="List clubs, sports, organizations, or other activities you participate in..."
          rows={4}
          className="textarea resize-y border-accent-dark hover:border-primary-light focus-visible:ring-primary bg-white text-black placeholder:text-gray-500 placeholder:opacity-80"
        />
      </div>

      <div>
        <label className="block mb-2 text-black font-medium">
          Awards and Honors (optional)
        </label>
        <textarea
          value={formData.awards_and_honors || ''}
          onChange={(e) => updateFormData('awards_and_honors', e.target.value)}
          placeholder="List any academic awards, honors, recognitions, or achievements..."
          rows={4}
          className="textarea resize-y border-accent-dark hover:border-primary-light focus-visible:ring-primary bg-white text-black placeholder:text-gray-500 placeholder:opacity-80"
        />
      </div>
    </div>
  );
}

function ReviewStep({ formData, scholarship }: { formData: CreateApplicationData; scholarship: Scholarship }) {
  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Amount varies";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Scholarship Info */}
      <Card 
        className="p-4 border-2" 
        style={{ 
          backgroundColor: 'rgb(193,212,178)', 
          borderColor: 'rgb(146,169,129)' 
        }}
      >
        <CardContent className="p-0">
          <div className="flex flex-col space-y-3">
            <h3 className="text-lg font-semibold" style={{ color: 'rgb(61,84,44)' }}>
              Scholarship: {scholarship.name}
            </h3>
            <p style={{ color: 'rgb(78,61,30)' }}>{scholarship.description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold" style={{ color: 'rgb(9,76,9)' }}>
                Award Amount: {formatCurrency(scholarship.amount)}
              </p>
              {scholarship.deadline && (
                <p style={{ color: 'rgb(78,61,30)' }}>
                  • Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Review */}
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: 'rgb(61,84,44)' }}>
          Your Application Summary
        </h3>
        
        <Card className="bg-white border-2 p-4" style={{ borderColor: 'rgb(146,169,129)' }}>
          <CardHeader className="pb-2 px-0">
            <h4 className="text-base font-semibold" style={{ color: 'rgb(61,84,44)' }}>Personal Information</h4>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="flex flex-col space-y-2 text-sm">
              <p><strong>Name:</strong> {formData.first_name} {formData.last_name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Phone:</strong> {formData.phone}</p>
              <p><strong>Address:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zip}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 p-4" style={{ borderColor: 'rgb(146,169,129)' }}>
          <CardHeader className="pb-2 px-0">
            <h4 className="text-base font-semibold" style={{ color: 'rgb(61,84,44)' }}>Academic Information</h4>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="flex flex-col space-y-2 text-sm">
              <p><strong>School:</strong> {formData.school}</p>
              <p><strong>Major:</strong> {formData.major}</p>
              <p><strong>Academic Level:</strong> {formData.academic_level.replace('_', ' ')}</p>
              <p><strong>Graduation Year:</strong> {formData.graduation_year}</p>
              {formData.gpa && <p><strong>GPA:</strong> {formData.gpa}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 p-4" style={{ borderColor: 'rgb(146,169,129)' }}>
          <CardHeader className="pb-2 px-0">
            <h4 className="text-base font-semibold" style={{ color: 'rgb(61,84,44)' }}>Essay Responses</h4>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="flex flex-col space-y-3 text-sm">
              <div>
                <p className="font-bold">Career Goals:</p>
                <p>{formData.career_goals}</p>
              </div>
              <div>
                <p className="font-bold">Financial Need:</p>
                <p>{formData.financial_need}</p>
              </div>
              <div>
                <p className="font-bold">Community Involvement:</p>
                <p>{formData.community_involvement}</p>
              </div>
              <div>
                <p className="font-bold">Why You Deserve This Scholarship:</p>
                <p>{formData.why_deserve_scholarship}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ScholarshipApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const scholarshipId = params.id as string;
  
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    currentStep,
    formData,
    errors,
    submitting,
    updateFormData,
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
  } = useApplicationForm(scholarshipId);

  useEffect(() => {
    const fetchScholarship = async () => {
      setLoading(true);
      const { data, error } = await getScholarshipById(scholarshipId);
      
      if (error) {
        setError('Failed to load scholarship details');
        console.error('Error fetching scholarship:', error);
      } else if (data) {
        setScholarship(data);
      }
      
      setLoading(false);
    };

    if (scholarshipId) {
      fetchScholarship();
    }
  }, [scholarshipId]);

  const handleSubmit = async () => {
    const result = await submitApplication();
    
    if (result.success) {
      router.push(`/scholarships/${scholarshipId}/success`);
    } else {
      alert('Failed to submit application. Please try again.');
    }
  };

  const handleSaveDraft = async () => {
    const result = await saveDraft();
    
    if (result.success) {
      alert('Draft saved successfully!');
    } else {
      alert('Failed to save draft. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(193,212,178)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col space-y-8">
            <div className="h-15 w-75 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-96 w-full bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(193,212,178)' }}>
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="flex flex-col space-y-4">
            <h1 className="text-2xl font-bold" style={{ color: 'rgb(61,84,44)' }}>Scholarship Not Found</h1>
            <p style={{ color: 'rgb(78,61,30)' }}>
              {error || "The scholarship you're looking for doesn't exist or may have been removed."}
            </p>
            <Button
              onClick={() => router.push('/scholarships')}
              className="bg-primary text-white hover:bg-primary-light"
            >
              Browse Scholarships
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(193,212,178)' }}>
      {/* Header */}
      <div className="bg-white border-b-2 p-6" style={{ borderColor: 'rgb(146,169,129)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col space-y-6">
            <div className="flex justify-between w-full">
              <Button
                variant="ghost"
                onClick={() => router.push('/scholarships')}
                className="text-primary hover:bg-accent"
              >
                <FiArrowLeft className="mr-2" />
                Back to Scholarships
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleSaveDraft}
                className="hover:bg-accent"
                style={{ color: 'rgb(9,76,9)' }}
              >
                <FiSave className="mr-2" />
                Save Draft
              </Button>
            </div>
            
            <div className="flex flex-col space-y-4 w-full">
              <h1 className="text-3xl font-bold text-center" style={{ color: 'rgb(61,84,44)' }}>
                Apply for {scholarship.name}
              </h1>
              
              <ProgressBar progress={getStepProgress()} />
              
              <StepIndicator 
                steps={steps} 
                currentStep={currentStep} 
                goToStep={goToStep}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="bg-white border-2 shadow-xl rounded-md" style={{ borderColor: 'rgb(146,169,129)' }}>
          <div className="border-b-2 p-4" style={{ backgroundColor: 'rgb(193,212,178)', borderColor: 'rgb(146,169,129)' }}>
            <div className="flex flex-col space-y-2">
              <h2 className="text-lg md:text-xl font-semibold" style={{ color: 'rgb(61,84,44)' }}>
                {currentStepData.title}
              </h2>
              <p style={{ color: 'rgb(78,61,30)' }}>
                {currentStepData.description}
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="min-h-96">
                {currentStep === 0 && (
                  <PersonalInfoStep 
                    formData={formData} 
                    updateFormData={updateFormData} 
                    errors={errors} 
                  />
                )}
                {currentStep === 1 && (
                  <AcademicInfoStep 
                    formData={formData} 
                    updateFormData={updateFormData} 
                    errors={errors} 
                  />
                )}
                {currentStep === 2 && (
                  <EssayStep 
                    formData={formData} 
                    updateFormData={updateFormData} 
                    errors={errors} 
                  />
                )}
                {currentStep === 3 && (
                  <AdditionalInfoStep 
                    formData={formData} 
                    updateFormData={updateFormData} 
                    errors={errors}
                  />
                )}
                {currentStep === 4 && (
                  <ReviewStep 
                    formData={formData} 
                    scholarship={scholarship}
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgb(193,212,178)' }}>
                {/* Mobile Layout - Stacked */}
                <div className="flex flex-col space-y-3 md:hidden">
                  <div className="flex gap-3 w-full">
                    <Button
                      variant="ghost"
                      onClick={prevStep}
                      disabled={isFirstStep}
                      className="flex-1 text-primary hover:bg-accent"
                      size="sm"
                    >
                      <FiArrowLeft className="mr-2" />
                      Previous
                    </Button>
                    {isReviewStep ? (
                      <Button
                        onClick={handleSubmit}
                        loading={submitting}
                        className="flex-1 text-white hover:bg-primary-light"
                        style={{ backgroundColor: 'rgb(9,76,9)' }}
                        size="sm"
                      >
                        Submit
                        <FiSend className="ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={nextStep}
                        className="flex-1 text-white hover:bg-primary-light"
                        style={{ backgroundColor: 'rgb(9,76,9)' }}
                        size="sm"
                      >
                        {isLastStep ? "Review" : "Continue"}
                        <FiArrowRight className="ml-2" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Desktop Layout - Horizontal */}
                <div className="hidden md:flex justify-between">
                  <Button
                    variant="ghost"
                    onClick={prevStep}
                    disabled={isFirstStep}
                    className="text-primary hover:bg-accent"
                  >
                    <FiArrowLeft className="mr-2" />
                    Previous
                  </Button>

                  {isReviewStep ? (
                    <Button
                      onClick={handleSubmit}
                      loading={submitting}
                      size="lg"
                      className="text-white hover:bg-primary-light active:scale-98"
                      style={{ backgroundColor: 'rgb(9,76,9)' }}
                    >
                      Submit Application
                      <FiSend className="ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={nextStep}
                      className="text-white hover:bg-primary-light"
                      style={{ backgroundColor: 'rgb(9,76,9)' }}
                    >
                      {isLastStep ? "Review Application" : "Continue"}
                      <FiArrowRight className="ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}