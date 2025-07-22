"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Select,
  Card,
  CardBody,
  CardHeader,
  Skeleton,
} from "@chakra-ui/react";
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

interface StepComponentProps {
  formData: CreateApplicationData;
  updateFormData: (field: keyof CreateApplicationData, value: string | number) => void;
  errors: Record<string, string>;
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <Box w="full" bg="rgb(193,212,178)" borderRadius="full" h="3">
      <Box
        bg="rgb(9,76,9)"
        h="full"
        borderRadius="full"
        transition="width 0.5s ease"
        style={{ width: `${progress}%` }}
      />
    </Box>
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
    <HStack gap={{ base: 2, md: 4 }} justify="center" wrap="wrap">
      {steps.map((step, index: number) => {
        const Icon = icons[index];
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = index <= currentStep;
        
        return (
          <VStack
            key={step.id}
            gap={2}
            cursor={isClickable ? "pointer" : "default"}
            onClick={isClickable ? () => goToStep(index) : undefined}
            opacity={isClickable ? 1 : 0.5}
            flex={{ base: "0 0 auto", md: "unset" }}
          >
            <Box
              w={{ base: "40px", md: "50px" }}
              h={{ base: "40px", md: "50px" }}
              borderRadius="full"
              bg={isCompleted ? "rgb(9,76,9)" : isActive ? "rgb(92,127,66)" : "rgb(193,212,178)"}
              color={isCompleted || isActive ? "white" : "rgb(78,61,30)"}
              display="flex"
              alignItems="center"
              justifyContent="center"
              border="3px solid"
              borderColor={isActive ? "rgb(9,76,9)" : "transparent"}
              transition="all 0.3s ease"
              _hover={isClickable ? { transform: "scale(1.05)" } : {}}
            >
              <Icon size={20} />
            </Box>
            <Text
              fontSize="xs"
              textAlign="center"
              color={isActive ? "rgb(9,76,9)" : "rgb(78,61,30)"}
              fontWeight={isActive ? "bold" : "medium"}
              maxW="80px"
            >
              {step.title}
            </Text>
          </VStack>
        );
      })}
    </HStack>
  );
}

function PersonalInfoStep({ formData, updateFormData, errors }: StepComponentProps) {
  return (
    <VStack gap={6} align="stretch">
      <HStack gap={4}>
        <Box flex={1}>
          <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
            First Name *
          </Text>
          <Input
            value={formData.first_name}
            onChange={(e) => updateFormData('first_name', e.target.value)}
            borderColor={errors.first_name ? "red.300" : "rgb(146,169,129)"}
            _hover={{ borderColor: errors.first_name ? "red.400" : "rgb(92,127,66)" }}
            _focus={{
              borderColor: errors.first_name ? "red.500" : "rgb(9,76,9)",
              boxShadow: `0 0 0 1px ${errors.first_name ? "red.500" : "rgb(9,76,9)"}`
            }}
          />
          {errors.first_name && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.first_name}
            </Text>
          )}
        </Box>
        
        <Box flex={1}>
          <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
            Last Name *
          </Text>
          <Input
            value={formData.last_name}
            onChange={(e) => updateFormData('last_name', e.target.value)}
            borderColor={errors.last_name ? "red.300" : "rgb(146,169,129)"}
            _hover={{ borderColor: errors.last_name ? "red.400" : "rgb(92,127,66)" }}
            _focus={{
              borderColor: errors.last_name ? "red.500" : "rgb(9,76,9)",
              boxShadow: `0 0 0 1px ${errors.last_name ? "red.500" : "rgb(9,76,9)"}`
            }}
          />
          {errors.last_name && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.last_name}
            </Text>
          )}
        </Box>
      </HStack>

      <HStack gap={4}>
        <Box flex={1}>
          <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
            Email Address *
          </Text>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            borderColor={errors.email ? "red.300" : "rgb(146,169,129)"}
            _hover={{ borderColor: errors.email ? "red.400" : "rgb(92,127,66)" }}
            _focus={{
              borderColor: errors.email ? "red.500" : "rgb(9,76,9)",
              boxShadow: `0 0 0 1px ${errors.email ? "red.500" : "rgb(9,76,9)"}`
            }}
          />
          {errors.email && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.email}
            </Text>
          )}
        </Box>
        
        <Box flex={1}>
          <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
            Phone Number *
          </Text>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            borderColor={errors.phone ? "red.300" : "rgb(146,169,129)"}
            _hover={{ borderColor: errors.phone ? "red.400" : "rgb(92,127,66)" }}
            _focus={{
              borderColor: errors.phone ? "red.500" : "rgb(9,76,9)",
              boxShadow: `0 0 0 1px ${errors.phone ? "red.500" : "rgb(9,76,9)"}`
            }}
          />
          {errors.phone && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.phone}
            </Text>
          )}
        </Box>
      </HStack>

      <Box>
        <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
          Address *
        </Text>
        <Input
          value={formData.address}
          onChange={(e) => updateFormData('address', e.target.value)}
          borderColor={errors.address ? "red.300" : "rgb(146,169,129)"}
          _hover={{ borderColor: errors.address ? "red.400" : "rgb(92,127,66)" }}
          _focus={{
            borderColor: errors.address ? "red.500" : "rgb(9,76,9)",
            boxShadow: `0 0 0 1px ${errors.address ? "red.500" : "rgb(9,76,9)"}`
          }}
        />
        {errors.address && (
          <Text color="red.500" fontSize="sm" mt={1}>
            {errors.address}
          </Text>
        )}
      </Box>

      <HStack gap={4}>
        <Box flex={2}>
          <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
            City *
          </Text>
          <Input
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            borderColor={errors.city ? "red.300" : "rgb(146,169,129)"}
            _hover={{ borderColor: errors.city ? "red.400" : "rgb(92,127,66)" }}
            _focus={{
              borderColor: errors.city ? "red.500" : "rgb(9,76,9)",
              boxShadow: `0 0 0 1px ${errors.city ? "red.500" : "rgb(9,76,9)"}`
            }}
          />
          {errors.city && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.city}
            </Text>
          )}
        </Box>
        
        <Box flex={1}>
          <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
            State *
          </Text>
          <Input
            value={formData.state}
            onChange={(e) => updateFormData('state', e.target.value)}
            borderColor={errors.state ? "red.300" : "rgb(146,169,129)"}
            _hover={{ borderColor: errors.state ? "red.400" : "rgb(92,127,66)" }}
            _focus={{
              borderColor: errors.state ? "red.500" : "rgb(9,76,9)",
              boxShadow: `0 0 0 1px ${errors.state ? "red.500" : "rgb(9,76,9)"}`
            }}
          />
          {errors.state && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.state}
            </Text>
          )}
        </Box>
        
        <Box flex={1}>
          <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
            ZIP Code *
          </Text>
          <Input
            value={formData.zip}
            onChange={(e) => updateFormData('zip', e.target.value)}
            borderColor={errors.zip ? "red.300" : "rgb(146,169,129)"}
            _hover={{ borderColor: errors.zip ? "red.400" : "rgb(92,127,66)" }}
            _focus={{
              borderColor: errors.zip ? "red.500" : "rgb(9,76,9)",
              boxShadow: `0 0 0 1px ${errors.zip ? "red.500" : "rgb(9,76,9)"}`
            }}
          />
          {errors.zip && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.zip}
            </Text>
          )}
        </Box>
      </HStack>

      <Box>
        <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
          Date of Birth
        </Text>
        <Input
          type="date"
          value={formData.date_of_birth || ''}
          onChange={(e) => updateFormData('date_of_birth', e.target.value)}
          borderColor="rgb(146,169,129)"
          _hover={{ borderColor: "rgb(92,127,66)" }}
          _focus={{
            borderColor: "rgb(9,76,9)",
            boxShadow: "0 0 0 1px rgb(9,76,9)"
          }}
        />
      </Box>
    </VStack>
  );
}

function AcademicInfoStep({ formData, updateFormData, errors }: StepComponentProps) {
  return (
    <VStack gap={6} align="stretch">
      <Box>
        <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
          School/Institution *
        </Text>
        <Input
          value={formData.school}
          onChange={(e) => updateFormData('school', e.target.value)}
          placeholder="Enter your school or institution name"
          borderColor={errors.school ? "red.300" : "rgb(146,169,129)"}
          _hover={{ borderColor: errors.school ? "red.400" : "rgb(92,127,66)" }}
          _focus={{
            borderColor: errors.school ? "red.500" : "rgb(9,76,9)",
            boxShadow: `0 0 0 1px ${errors.school ? "red.500" : "rgb(9,76,9)"}`
          }}
        />
        {errors.school && (
          <Text color="red.500" fontSize="sm" mt={1}>
            {errors.school}
          </Text>
        )}
      </Box>

      <HStack gap={4}>
        <Box flex={1}>
          <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
            Academic Level *
          </Text>
          <select
            value={formData.academic_level}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFormData('academic_level', e.target.value)}
            style={{
              padding: '12px',
              borderWidth: '1px',
              borderColor: 'rgb(146,169,129)',
              borderRadius: '8px',
              backgroundColor: 'white',
              fontSize: '18px',
              width: '100%'
            }}
          >
            <option value="high_school">High School</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="graduate">Graduate</option>
            <option value="other">Other</option>
          </select>
        </Box>
        
        <Box flex={1}>
          <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
            Expected Graduation Year *
          </Text>
          <Input
            type="number"
            value={formData.graduation_year}
            onChange={(e) => updateFormData('graduation_year', parseInt(e.target.value))}
            min={new Date().getFullYear() - 5}
            max={new Date().getFullYear() + 10}
            borderColor={errors.graduation_year ? "red.300" : "rgb(146,169,129)"}
            _hover={{ borderColor: errors.graduation_year ? "red.400" : "rgb(92,127,66)" }}
            _focus={{
              borderColor: errors.graduation_year ? "red.500" : "rgb(9,76,9)",
              boxShadow: `0 0 0 1px ${errors.graduation_year ? "red.500" : "rgb(9,76,9)"}`
            }}
          />
          {errors.graduation_year && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.graduation_year}
            </Text>
          )}
        </Box>
      </HStack>

      <HStack gap={4}>
        <Box flex={2}>
          <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
            Major/Field of Study *
          </Text>
          <Input
            value={formData.major}
            onChange={(e) => updateFormData('major', e.target.value)}
            placeholder="e.g., Forestry, Environmental Science, Business"
            borderColor={errors.major ? "red.300" : "rgb(146,169,129)"}
            _hover={{ borderColor: errors.major ? "red.400" : "rgb(92,127,66)" }}
            _focus={{
              borderColor: errors.major ? "red.500" : "rgb(9,76,9)",
              boxShadow: `0 0 0 1px ${errors.major ? "red.500" : "rgb(9,76,9)"}`
            }}
          />
          {errors.major && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.major}
            </Text>
          )}
        </Box>
        
        <Box flex={1}>
          <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
            GPA (optional)
          </Text>
          <Input
            type="number"
            step="0.01"
            min="0"
            max="4"
            value={formData.gpa || ''}
            onChange={(e) => updateFormData('gpa', e.target.value ? parseFloat(e.target.value) : 0)}
            placeholder="e.g., 3.5"
            borderColor={errors.gpa ? "red.300" : "rgb(146,169,129)"}
            _hover={{ borderColor: errors.gpa ? "red.400" : "rgb(92,127,66)" }}
            _focus={{
              borderColor: errors.gpa ? "red.500" : "rgb(9,76,9)",
              boxShadow: `0 0 0 1px ${errors.gpa ? "red.500" : "rgb(9,76,9)"}`
            }}
          />
          {errors.gpa && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.gpa}
            </Text>
          )}
        </Box>
      </HStack>
    </VStack>
  );
}

function EssayStep({ formData, updateFormData, errors }: StepComponentProps) {
  return (
    <VStack gap={6} align="stretch">
      <Box>
        <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
          Career Goals and Aspirations * (minimum 50 characters)
        </Text>
        <Textarea
          value={formData.career_goals || ''}
          onChange={(e) => updateFormData('career_goals', e.target.value)}
          placeholder="Describe your career goals and how this scholarship will help you achieve them..."
          rows={4}
          resize="vertical"
          borderColor={errors.career_goals ? "red.300" : "rgb(146,169,129)"}
          _hover={{ borderColor: errors.career_goals ? "red.400" : "rgb(92,127,66)" }}
          _focus={{
            borderColor: errors.career_goals ? "red.500" : "rgb(9,76,9)",
            boxShadow: `0 0 0 1px ${errors.career_goals ? "red.500" : "rgb(9,76,9)"}`
          }}
        />
        <HStack justify="space-between" mt={1}>
          {errors.career_goals && (
            <Text color="red.500" fontSize="sm">
              {errors.career_goals}
            </Text>
          )}
          <Text fontSize="sm" color="gray.500" ml="auto">
            {formData.career_goals?.length || 0}/50 minimum
          </Text>
        </HStack>
      </Box>

      <Box>
        <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
          Financial Need * (minimum 25 characters)
        </Text>
        <Textarea
          value={formData.financial_need || ''}
          onChange={(e) => updateFormData('financial_need', e.target.value)}
          placeholder="Explain your financial situation and why you need this scholarship..."
          rows={4}
          resize="vertical"
          borderColor={errors.financial_need ? "red.300" : "rgb(146,169,129)"}
          _hover={{ borderColor: errors.financial_need ? "red.400" : "rgb(92,127,66)" }}
          _focus={{
            borderColor: errors.financial_need ? "red.500" : "rgb(9,76,9)",
            boxShadow: `0 0 0 1px ${errors.financial_need ? "red.500" : "rgb(9,76,9)"}`
          }}
        />
        <HStack justify="space-between" mt={1}>
          {errors.financial_need && (
            <Text color="red.500" fontSize="sm">
              {errors.financial_need}
            </Text>
          )}
          <Text fontSize="sm" color="gray.500" ml="auto">
            {formData.financial_need?.length || 0}/25 minimum
          </Text>
        </HStack>
      </Box>

      <Box>
        <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
          Community Involvement * (minimum 25 characters)
        </Text>
        <Textarea
          value={formData.community_involvement || ''}
          onChange={(e) => updateFormData('community_involvement', e.target.value)}
          placeholder="Describe your involvement in community service, volunteering, or local organizations..."
          rows={4}
          resize="vertical"
          borderColor={errors.community_involvement ? "red.300" : "rgb(146,169,129)"}
          _hover={{ borderColor: errors.community_involvement ? "red.400" : "rgb(92,127,66)" }}
          _focus={{
            borderColor: errors.community_involvement ? "red.500" : "rgb(9,76,9)",
            boxShadow: `0 0 0 1px ${errors.community_involvement ? "red.500" : "rgb(9,76,9)"}`
          }}
        />
        <HStack justify="space-between" mt={1}>
          {errors.community_involvement && (
            <Text color="red.500" fontSize="sm">
              {errors.community_involvement}
            </Text>
          )}
          <Text fontSize="sm" color="gray.500" ml="auto">
            {formData.community_involvement?.length || 0}/25 minimum
          </Text>
        </HStack>
      </Box>

      <Box>
        <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
          Why You Deserve This Scholarship * (minimum 25 characters)
        </Text>
        <Textarea
          value={formData.why_deserve_scholarship || ''}
          onChange={(e) => updateFormData('why_deserve_scholarship', e.target.value)}
          placeholder="Explain why you are a deserving candidate for this scholarship..."
          rows={4}
          resize="vertical"
          borderColor={errors.why_deserve_scholarship ? "red.300" : "rgb(146,169,129)"}
          _hover={{ borderColor: errors.why_deserve_scholarship ? "red.400" : "rgb(92,127,66)" }}
          _focus={{
            borderColor: errors.why_deserve_scholarship ? "red.500" : "rgb(9,76,9)",
            boxShadow: `0 0 0 1px ${errors.why_deserve_scholarship ? "red.500" : "rgb(9,76,9)"}`
          }}
        />
        <HStack justify="space-between" mt={1}>
          {errors.why_deserve_scholarship && (
            <Text color="red.500" fontSize="sm">
              {errors.why_deserve_scholarship}
            </Text>
          )}
          <Text fontSize="sm" color="gray.500" ml="auto">
            {formData.why_deserve_scholarship?.length || 0}/25 minimum
          </Text>
        </HStack>
      </Box>
    </VStack>
  );
}

function AdditionalInfoStep({ formData, updateFormData }: StepComponentProps) {
  return (
    <VStack gap={6} align="stretch">
      <Box>
        <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
          Work Experience (optional)
        </Text>
        <Textarea
          value={formData.work_experience || ''}
          onChange={(e) => updateFormData('work_experience', e.target.value)}
          placeholder="Describe any relevant work experience, internships, or part-time jobs..."
          rows={4}
          resize="vertical"
          borderColor="rgb(146,169,129)"
          _hover={{ borderColor: "rgb(92,127,66)" }}
          _focus={{
            borderColor: "rgb(9,76,9)",
            boxShadow: "0 0 0 1px rgb(9,76,9)"
          }}
        />
      </Box>

      <Box>
        <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
          Extracurricular Activities (optional)
        </Text>
        <Textarea
          value={formData.extracurricular_activities || ''}
          onChange={(e) => updateFormData('extracurricular_activities', e.target.value)}
          placeholder="List clubs, sports, organizations, or other activities you participate in..."
          rows={4}
          resize="vertical"
          borderColor="rgb(146,169,129)"
          _hover={{ borderColor: "rgb(92,127,66)" }}
          _focus={{
            borderColor: "rgb(9,76,9)",
            boxShadow: "0 0 0 1px rgb(9,76,9)"
          }}
        />
      </Box>

      <Box>
        <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
          Awards and Honors (optional)
        </Text>
        <Textarea
          value={formData.awards_and_honors || ''}
          onChange={(e) => updateFormData('awards_and_honors', e.target.value)}
          placeholder="List any academic awards, honors, recognitions, or achievements..."
          rows={4}
          resize="vertical"
          borderColor="rgb(146,169,129)"
          _hover={{ borderColor: "rgb(92,127,66)" }}
          _focus={{
            borderColor: "rgb(9,76,9)",
            boxShadow: "0 0 0 1px rgb(9,76,9)"
          }}
        />
      </Box>
    </VStack>
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
    <VStack gap={6} align="stretch">
      {/* Scholarship Info */}
      <Box bg="rgb(193,212,178)" border="2px" borderColor="rgb(146,169,129)" borderRadius="md" p={4}>
        <CardBody>
          <VStack gap={3} align="start">
            <Heading size="md" color="rgb(61,84,44)">
              Scholarship: {scholarship.name}
            </Heading>
            <Text color="rgb(78,61,30)">{scholarship.description}</Text>
            <HStack>
              <Text fontWeight="bold" color="rgb(9,76,9)">
                Award Amount: {formatCurrency(scholarship.amount)}
              </Text>
              {scholarship.deadline && (
                <Text color="rgb(78,61,30)">
                  • Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                </Text>
              )}
            </HStack>
          </VStack>
        </CardBody>
      </Box>

      {/* Application Review */}
      <VStack gap={4} align="stretch">
        <Heading size="md" color="rgb(61,84,44)">
          Your Application Summary
        </Heading>
        
        <Box bg="white" border="2px" borderColor="rgb(146,169,129)" borderRadius="md" p={4}>
          <Box pb={2}>
            <Heading size="sm" color="rgb(61,84,44)">Personal Information</Heading>
          </Box>
          <Box pt={0}>
            <VStack gap={2} align="start" fontSize="sm">
              <Text><strong>Name:</strong> {formData.first_name} {formData.last_name}</Text>
              <Text><strong>Email:</strong> {formData.email}</Text>
              <Text><strong>Phone:</strong> {formData.phone}</Text>
              <Text><strong>Address:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zip}</Text>
            </VStack>
          </Box>
        </Box>

        <Box bg="white" border="2px" borderColor="rgb(146,169,129)" borderRadius="md" p={4}>
          <Box pb={2}>
            <Heading size="sm" color="rgb(61,84,44)">Academic Information</Heading>
          </Box>
          <Box pt={0}>
            <VStack gap={2} align="start" fontSize="sm">
              <Text><strong>School:</strong> {formData.school}</Text>
              <Text><strong>Major:</strong> {formData.major}</Text>
              <Text><strong>Academic Level:</strong> {formData.academic_level.replace('_', ' ')}</Text>
              <Text><strong>Graduation Year:</strong> {formData.graduation_year}</Text>
              {formData.gpa && <Text><strong>GPA:</strong> {formData.gpa}</Text>}
            </VStack>
          </Box>
        </Box>

        <Box bg="white" border="2px" borderColor="rgb(146,169,129)" borderRadius="md" p={4}>
          <Box pb={2}>
            <Heading size="sm" color="rgb(61,84,44)">Essay Responses</Heading>
          </Box>
          <Box pt={0}>
            <VStack gap={3} align="start" fontSize="sm">
              <Box>
                <Text fontWeight="bold">Career Goals:</Text>
                <Text>{formData.career_goals}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Financial Need:</Text>
                <Text>{formData.financial_need}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Community Involvement:</Text>
                <Text>{formData.community_involvement}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Why You Deserve This Scholarship:</Text>
                <Text>{formData.why_deserve_scholarship}</Text>
              </Box>
            </VStack>
          </Box>
        </Box>
      </VStack>
    </VStack>
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
      <Box minHeight="100vh" bg="rgb(193,212,178)" p={6}>
        <Box maxW="4xl" mx="auto">
          <VStack gap={8}>
            <Skeleton height="60px" width="300px" />
            <Skeleton height="400px" width="100%" />
          </VStack>
        </Box>
      </Box>
    );
  }

  if (error || !scholarship) {
    return (
      <Box minHeight="100vh" bg="rgb(193,212,178)" p={6}>
        <Box maxW="4xl" mx="auto" textAlign="center" py={20}>
          <VStack gap={4}>
            <Heading color="rgb(61,84,44)">Scholarship Not Found</Heading>
            <Text color="rgb(78,61,30)">
              {error || "The scholarship you're looking for doesn't exist or may have been removed."}
            </Text>
            <Button
              onClick={() => router.push('/scholarships')}
              bg="rgb(9,76,9)"
              color="white"
              _hover={{ bg: "rgb(92,127,66)" }}
            >
              Browse Scholarships
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  const currentStepData = steps[currentStep];
  
  return (
    <Box minHeight="100vh" bg="rgb(193,212,178)">
      {/* Header */}
      <Box bg="white" borderBottom="2px" borderColor="rgb(146,169,129)" p={6}>
        <Box maxW="6xl" mx="auto">
          <VStack gap={6}>
            <HStack justify="space-between" w="full">
              <Button
                variant="ghost"
                color="rgb(78,61,30)"
                onClick={() => router.push('/scholarships')}
                _hover={{ bg: "rgb(193,212,178)" }}
              >
                <FiArrowLeft style={{ marginRight: '8px' }} />
                Back to Scholarships
              </Button>
              
              <Button
                
                variant="ghost"
                color="rgb(9,76,9)"
                onClick={handleSaveDraft}
                _hover={{ bg: "rgb(193,212,178)" }}
              >
                <FiSave style={{ marginRight: '8px' }} />
                Save Draft
              </Button>
            </HStack>
            
            <VStack gap={4} w="full">
              <Heading size="xl" color="rgb(61,84,44)" textAlign="center">
                Apply for {scholarship.name}
              </Heading>
              
              <ProgressBar progress={getStepProgress()} />
              
              <StepIndicator 
                steps={steps} 
                currentStep={currentStep} 
                goToStep={goToStep}
              />
            </VStack>
          </VStack>
        </Box>
      </Box>

      {/* Form Content */}
      <Box maxW="4xl" mx="auto" p={{ base: 4, md: 6 }}>
        <Box bg="white" border="2px" borderColor="rgb(146,169,129)" boxShadow="xl" borderRadius="md">
          <Box bg="rgb(193,212,178)" borderBottom="2px" borderBottomColor="rgb(146,169,129)" p={4}>
            <VStack gap={2} align="start">
              <Heading size={{ base: "md", md: "lg" }} color="rgb(61,84,44)">
                {currentStepData.title}
              </Heading>
              <Text color="rgb(78,61,30)">
                {currentStepData.description}
              </Text>
            </VStack>
          </Box>

          <CardBody p={8}>
            <Box minH="400px">
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
            </Box>

            {/* Navigation */}
            <Box mt={8} pt={6} borderTop="1px" borderColor="rgb(193,212,178)">
              {/* Mobile Layout - Stacked */}
              <VStack gap={3} display={{ base: "flex", md: "none" }}>
                <HStack gap={3} w="full">
                  <Button
                    
                    variant="ghost"
                    onClick={prevStep}
                    disabled={isFirstStep}
                    color="rgb(78,61,30)"
                    _hover={{ bg: "rgb(193,212,178)" }}
                    flex="1"
                    size="sm"
                  >
                    <FiArrowLeft style={{ marginRight: '8px' }} />
                    Previous
                  </Button>
                  {isReviewStep ? (
                    <Button
                      
                      bg="rgb(9,76,9)"
                      color="white"
                      onClick={handleSubmit}
                      loading={submitting}
                      loadingText="Submitting..."
                      _hover={{ bg: "rgb(92,127,66)" }}
                      flex="1"
                      size="sm"
                    >
                      Submit
                      <FiSend style={{ marginLeft: '8px' }} />
                    </Button>
                  ) : (
                    <Button
                      
                      bg="rgb(9,76,9)"
                      color="white"
                      onClick={nextStep}
                      _hover={{ bg: "rgb(92,127,66)" }}
                      flex="1"
                      size="sm"
                    >
                      {isLastStep ? "Review" : "Continue"}
                      <FiArrowRight style={{ marginLeft: '8px' }} />
                    </Button>
                  )}
                </HStack>
              </VStack>

              {/* Desktop Layout - Horizontal */}
              <HStack justify="space-between" display={{ base: "none", md: "flex" }}>
                <Button
                  
                  variant="ghost"
                  onClick={prevStep}
                  disabled={isFirstStep}
                  color="rgb(78,61,30)"
                  _hover={{ bg: "rgb(193,212,178)" }}
                >
                  <FiArrowLeft style={{ marginRight: '8px' }} />
                  Previous
                </Button>

                {isReviewStep ? (
                  <Button
                    
                    bg="rgb(9,76,9)"
                    color="white"
                    size="lg"
                    onClick={handleSubmit}
                    loading={submitting}
                    loadingText="Submitting..."
                    _hover={{ bg: "rgb(92,127,66)" }}
                    _active={{ transform: "scale(0.98)" }}
                  >
                    Submit Application
                    <FiSend style={{ marginLeft: '8px' }} />
                  </Button>
                ) : (
                  <Button
                    
                    bg="rgb(9,76,9)"
                    color="white"
                    onClick={nextStep}
                    _hover={{ bg: "rgb(92,127,66)" }}
                  >
                    {isLastStep ? "Review Application" : "Continue"}
                    <FiArrowRight style={{ marginLeft: '8px' }} />
                  </Button>
                )}
              </HStack>
            </Box>
          </CardBody>
        </Box>
      </Box>
    </Box>
  );
}