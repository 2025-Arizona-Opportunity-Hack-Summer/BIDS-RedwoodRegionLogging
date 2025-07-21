"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Card,
  CardBody,
  CardHeader,
} from "@chakra-ui/react";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useScholarships } from "@/hooks/useScholarships";
import { CreateScholarshipData } from "@/types/database";

interface FormErrors {
  name?: string;
  description?: string;
  amount?: string;
  deadline?: string;
  requirements?: string;
}

function CreateScholarshipContent() {
  const router = useRouter();
  const { createScholarship } = useScholarships();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState<CreateScholarshipData>({
    name: "",
    description: "",
    amount: undefined,
    deadline: "",
    requirements: "",
    status: "active",
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Scholarship name is required";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.amount && formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate < today) {
        newErrors.deadline = "Deadline must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      await createScholarship(formData);
      
      setSuccessMessage("Scholarship created successfully!");
      setTimeout(() => {
        router.push("/admin/scholarships");
      }, 1500);
    } catch {
      setErrors({ name: "Failed to create scholarship. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateScholarshipData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Box
      minHeight="100vh"
      bg="rgb(193,212,178)"
      p={6}
    >
      <Box maxW="4xl" mx="auto">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack spacing={4}>
            <Link href="/admin/scholarships">
              <Button
                leftIcon={<FiArrowLeft />}
                variant="ghost"
                color="rgb(78,61,30)"
                _hover={{ bg: "rgb(146,169,129)" }}
              >
                Back to Scholarships
              </Button>
            </Link>
            
            <Box flex={1}>
              <Heading
                size="2xl"
                color="rgb(61,84,44)"
                mb={2}
              >
                Create New Scholarship
              </Heading>
              <Text
                fontSize="lg"
                color="rgb(78,61,30)"
              >
                Add a new scholarship opportunity for students
              </Text>
            </Box>
          </HStack>

          {/* Form */}
          <Card bg="white" border="2px" borderColor="rgb(146,169,129)" boxShadow="lg">
            <CardHeader bg="rgb(193,212,178)" borderBottom="2px" borderBottomColor="rgb(146,169,129)">
              <Heading size="lg" color="rgb(61,84,44)">
                Scholarship Details
              </Heading>
            </CardHeader>
            
            <CardBody p={8}>
              {/* Success Message */}
              {successMessage && (
                <Box
                  p={4}
                  bg="green.50"
                  border="1px"
                  borderColor="green.200"
                  borderRadius="md"
                  mb={6}
                >
                  <Text color="green.800" fontWeight="medium">
                    {successMessage}
                  </Text>
                </Box>
              )}

              <form onSubmit={handleSubmit}>
                <VStack spacing={8} align="stretch">
                  {/* Basic Information */}
                  <VStack spacing={6} align="stretch">
                    <Heading size="md" color="rgb(61,84,44)">
                      Basic Information
                    </Heading>
                    
                    <Box>
                      <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
                        Scholarship Name *
                      </Text>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter the scholarship name..."
                        size="lg"
                        borderColor="rgb(146,169,129)"
                        _hover={{ borderColor: "rgb(92,127,66)" }}
                        _focus={{
                          borderColor: "rgb(9,76,9)",
                          boxShadow: "0 0 0 1px rgb(9,76,9)"
                        }}
                        bg="white"
                      />
                      {errors.name && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {errors.name}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
                        Description *
                      </Text>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Describe the scholarship, its purpose, and what makes it special..."
                        rows={4}
                        resize="vertical"
                        borderColor="rgb(146,169,129)"
                        _hover={{ borderColor: "rgb(92,127,66)" }}
                        _focus={{
                          borderColor: "rgb(9,76,9)",
                          boxShadow: "0 0 0 1px rgb(9,76,9)"
                        }}
                        bg="white"
                      />
                      {errors.description && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {errors.description}
                        </Text>
                      )}
                    </Box>
                  </VStack>

                  <Box height="1px" bg="rgb(146,169,129)" />

                  {/* Financial & Timeline Details */}
                  <VStack spacing={6} align="stretch">
                    <Heading size="md" color="rgb(61,84,44)">
                      Financial & Timeline Details
                    </Heading>
                    
                    <HStack spacing={6} align="start">
                      <Box flex={1}>
                        <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
                          Award Amount
                        </Text>
                        <Input
                          type="number"
                          value={formData.amount || ""}
                          onChange={(e) => {
                            const value = e.target.value ? parseFloat(e.target.value) : undefined;
                            handleInputChange("amount", value);
                          }}
                          placeholder="Enter amount (e.g., 5000)"
                          size="lg"
                          borderColor="rgb(146,169,129)"
                          _hover={{ borderColor: "rgb(92,127,66)" }}
                          _focus={{
                            borderColor: "rgb(9,76,9)",
                            boxShadow: "0 0 0 1px rgb(9,76,9)"
                          }}
                          bg="white"
                          step="0.01"
                          min="0"
                        />
                        {errors.amount && (
                          <Text color="red.500" fontSize="sm" mt={1}>
                            {errors.amount}
                          </Text>
                        )}
                      </Box>

                      <Box flex={1}>
                        <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
                          Application Deadline *
                        </Text>
                        <Input
                          type="date"
                          value={formData.deadline}
                          onChange={(e) => handleInputChange("deadline", e.target.value)}
                          size="lg"
                          borderColor="rgb(146,169,129)"
                          _hover={{ borderColor: "rgb(92,127,66)" }}
                          _focus={{
                            borderColor: "rgb(9,76,9)",
                            boxShadow: "0 0 0 1px rgb(9,76,9)"
                          }}
                          bg="white"
                        />
                        {errors.deadline && (
                          <Text color="red.500" fontSize="sm" mt={1}>
                            {errors.deadline}
                          </Text>
                        )}
                      </Box>
                    </HStack>
                  </VStack>

                  <Box height="1px" bg="rgb(146,169,129)" />

                  {/* Requirements & Settings */}
                  <VStack spacing={6} align="stretch">
                    <Heading size="md" color="rgb(61,84,44)">
                      Requirements & Settings
                    </Heading>
                    
                    <Box>
                      <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
                        Application Requirements
                      </Text>
                      <Textarea
                        value={formData.requirements}
                        onChange={(e) => handleInputChange("requirements", e.target.value)}
                        placeholder="List the requirements for this scholarship (e.g., GPA requirements, essay topics, documentation needed)..."
                        rows={5}
                        resize="vertical"
                        borderColor="rgb(146,169,129)"
                        _hover={{ borderColor: "rgb(92,127,66)" }}
                        _focus={{
                          borderColor: "rgb(9,76,9)",
                          boxShadow: "0 0 0 1px rgb(9,76,9)"
                        }}
                        bg="white"
                      />
                      {errors.requirements && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {errors.requirements}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text mb={2} color="rgb(78,61,30)" fontWeight="medium">
                        Initial Status
                      </Text>
                      <Box
                        as="select"
                        value={formData.status}
                        onChange={(e: any) => handleInputChange("status", e.target.value as "active" | "inactive")}
                        p={3}
                        borderWidth="1px"
                        borderColor="rgb(146,169,129)"
                        borderRadius="md"
                        width="full"
                        bg="white"
                        fontSize="lg"
                        _hover={{ borderColor: "rgb(92,127,66)" }}
                        _focus={{
                          borderColor: "rgb(9,76,9)",
                          boxShadow: "0 0 0 1px rgb(9,76,9)"
                        }}
                      >
                        <option value="active">Active (Open for Applications)</option>
                        <option value="inactive">Inactive (Draft)</option>
                      </Box>
                    </Box>
                  </VStack>

                  {/* Action Buttons */}
                  <HStack spacing={4} justify="flex-end" pt={4}>
                    <Link href="/admin/scholarships">
                      <Button
                        variant="ghost"
                        color="rgb(78,61,30)"
                        size="lg"
                        _hover={{ bg: "rgb(193,212,178)" }}
                      >
                        Cancel
                      </Button>
                    </Link>
                    
                    <Button
                      type="submit"
                      leftIcon={<FiSave />}
                      bg="rgb(9,76,9)"
                      color="white"
                      size="lg"
                      _hover={{ bg: "rgb(92,127,66)" }}
                      isLoading={loading}
                      loadingText="Creating..."
                      boxShadow="md"
                      _active={{ transform: "translateY(1px)" }}
                    >
                      Create Scholarship
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
}

export default function CreateScholarshipPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <CreateScholarshipContent />
    </ProtectedRoute>
  );
}