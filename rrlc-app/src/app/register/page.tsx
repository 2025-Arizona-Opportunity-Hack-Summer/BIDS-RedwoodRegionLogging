"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Box, 
  Button, 
  Input, 
  Heading,
  Text,
  VStack,
  Link
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  // All users are applicants by default
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  // Auto-redirect to login after successful signup
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 4000); // 4 seconds

      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await signUp(email, password, fullName, 'applicant');
      if (error) {
        setError(error.message);
        setSuccess("");
      } else {
        setSuccess("Account created successfully! Please check your email to verify your account, then log in.");
        setError("");
        // Clear form
        setEmail("");
        setPassword("");
        setFullName("");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setSuccess("");
    }
    
    setLoading(false);
  };

  return (
    <Box
      minHeight="100vh"
      bg="rgb(193,212,178)" // Light sage background
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box 
        maxW="md" 
        w="full"
        bg="white"
        p={8} 
        borderRadius="lg" 
        boxShadow="lg"
        border="2px"
        borderColor="rgb(146,169,129)" // Medium sage border
      >
        <VStack gap={6}>
          <Heading 
            size="xl" 
            textAlign="center"
            color="rgb(61,84,44)" // Dark forest green
          >
            RRLC Scholarship Portal
          </Heading>
          
          <Text 
            textAlign="center" 
            color="rgb(78,61,30)" // Primary text color
            fontSize="md"
          >
            Create your account
          </Text>

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <VStack gap={4}>
              <Box w="full">
                <Text mb={2} fontSize="sm" fontWeight="medium" color="rgb(78,61,30)">
                  Full Name <Text as="span" color="red.500">*</Text>
                </Text>
                <Input 
                  type="text" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  borderColor="rgb(146,169,129)"
                  color="rgb(78,61,30)"
                  _placeholder={{ color: "gray.500", opacity: 0.8 }}
                  _hover={{ borderColor: "rgb(92,127,66)" }}
                  _focus={{ 
                    borderColor: "rgb(9,76,9)",
                    boxShadow: "0 0 0 1px rgb(9,76,9)"
                  }}
                />
              </Box>

              
              <Box w="full">
                <Text mb={2} fontSize="sm" fontWeight="medium" color="rgb(78,61,30)">
                  Email Address <Text as="span" color="red.500">*</Text>
                </Text>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  borderColor="rgb(146,169,129)"
                  color="rgb(78,61,30)"
                  _placeholder={{ color: "gray.500", opacity: 0.8 }}
                  _hover={{ borderColor: "rgb(92,127,66)" }}
                  _focus={{ 
                    borderColor: "rgb(9,76,9)",
                    boxShadow: "0 0 0 1px rgb(9,76,9)"
                  }}
                />
              </Box>
              
              <Box w="full">
                <Text mb={2} fontSize="sm" fontWeight="medium" color="rgb(78,61,30)">
                  Password <Text as="span" color="red.500">*</Text>
                </Text>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  borderColor="rgb(146,169,129)"
                  color="rgb(78,61,30)"
                  _placeholder={{ color: "gray.500", opacity: 0.8 }}
                  _hover={{ borderColor: "rgb(92,127,66)" }}
                  _focus={{ 
                    borderColor: "rgb(9,76,9)",
                    boxShadow: "0 0 0 1px rgb(9,76,9)"
                  }}
                />
              </Box>
              
              {error && (
                <Box 
                  p={3} 
                  bg="red.50" 
                  border="1px" 
                  borderColor="red.200" 
                  borderRadius="md"
                  w="full"
                >
                  <Text color="red.700" fontSize="sm">
                    {error}
                  </Text>
                </Box>
              )}
              
              {success && (
                <Box 
                  p={3} 
                  bg="green.50" 
                  border="1px" 
                  borderColor="green.200" 
                  borderRadius="md"
                  w="full"
                >
                  <Text color="green.700" fontSize="sm">
                    {success}
                  </Text>
                </Box>
              )}
              
              <Button 
                type="submit" 
                loading={loading}
                w="full"
                bg="rgb(9,76,9)" // Deep green
                color="white"
                _hover={{ 
                  bg: "rgb(92,127,66)" // Forest accent on hover
                }}
                _active={{ 
                  bg: "rgb(9,76,9)" 
                }}
                size="lg"
              >
                Create Account
              </Button>
            </VStack>
          </form>

          <Box textAlign="center" borderTop="2px" borderTopColor="rgb(146,169,129)" pt={6}>
            <Text color="rgb(78,61,30)" fontSize="sm">
              Already have an account?
            </Text>
            <Link 
              href="/login"
              color="rgb(9,76,9)"
              fontWeight="medium"
              _hover={{ color: "rgb(92,127,66)" }}
            >
              Sign in here
            </Link>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}