"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { FiCheckCircle, FiHome, FiArrowLeft, FiMail } from "react-icons/fi";

export default function ApplicationSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const scholarshipId = params.id as string;

  return (
    <Box minHeight="100vh" bg="rgb(193,212,178)">
      <Box maxW="4xl" mx="auto" p={6}>
        <VStack spacing={8} py={20}>
          {/* Success Icon */}
          <Box
            w="120px"
            h="120px"
            borderRadius="full"
            bg="rgb(9,76,9)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="xl"
          >
            <FiCheckCircle size={60} color="white" />
          </Box>

          {/* Success Message */}
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl" color="rgb(61,84,44)">
              Application Submitted Successfully!
            </Heading>
            <Text fontSize="xl" color="rgb(78,61,30)" maxW="2xl">
              Thank you for applying! Your application has been received and will be reviewed by our scholarship committee.
            </Text>
          </VStack>

          {/* Info Card */}
          <Card bg="white" border="2px" borderColor="rgb(146,169,129)" maxW="2xl" w="full">
            <CardBody>
              <VStack spacing={4}>
                <Heading size="md" color="rgb(61,84,44)" textAlign="center">
                  What happens next?
                </Heading>
                
                <VStack spacing={3} align="start" w="full">
                  <HStack spacing={3} align="start">
                    <FiMail color="rgb(9,76,9)" size={20} style={{ marginTop: '2px' }} />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium" color="rgb(78,61,30)">
                        Confirmation Email
                      </Text>
                      <Text fontSize="sm" color="rgb(78,61,30)" opacity={0.8}>
                        You'll receive a confirmation email with your application details within the next few minutes.
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={3} align="start">
                    <FiCheckCircle color="rgb(9,76,9)" size={20} style={{ marginTop: '2px' }} />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium" color="rgb(78,61,30)">
                        Review Process
                      </Text>
                      <Text fontSize="sm" color="rgb(78,61,30)" opacity={0.8}>
                        Our scholarship committee will review your application along with all other submissions.
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={3} align="start">
                    <FiMail color="rgb(9,76,9)" size={20} style={{ marginTop: '2px' }} />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium" color="rgb(78,61,30)">
                        Decision Notification
                      </Text>
                      <Text fontSize="sm" color="rgb(78,61,30)" opacity={0.8}>
                        You'll be notified via email about the decision within 2-4 weeks after the application deadline.
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <VStack spacing={4} w="full" maxW="md">
            <Button
              leftIcon={<FiHome />}
              bg="rgb(9,76,9)"
              color="white"
              size="lg"
              w="full"
              onClick={() => router.push('/scholarships')}
              _hover={{ bg: "rgb(92,127,66)" }}
              _active={{ transform: "scale(0.98)" }}
            >
              Browse More Scholarships
            </Button>
            
            <Button
              leftIcon={<FiArrowLeft />}
              variant="ghost"
              color="rgb(78,61,30)"
              size="lg"
              onClick={() => router.push(`/scholarships/${scholarshipId}`)}
              _hover={{ bg: "white" }}
            >
              Back to Scholarship Details
            </Button>
          </VStack>

          {/* Contact Info */}
          <Card bg="rgb(255,211,88)" border="2px" borderColor="rgb(218,165,32)" maxW="2xl" w="full">
            <CardBody textAlign="center">
              <VStack spacing={2}>
                <Text fontWeight="bold" color="rgb(78,61,30)">
                  Questions about your application?
                </Text>
                <Text color="rgb(78,61,30)">
                  Contact us at scholarships@rrlc.org or call (555) 123-4567
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
}