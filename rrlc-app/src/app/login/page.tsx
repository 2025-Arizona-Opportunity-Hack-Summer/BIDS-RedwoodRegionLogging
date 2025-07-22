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

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<'admin' | 'applicant'>('applicant');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, signUp, isAuthenticated, isAdmin } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push(isAdmin() ? "/admin" : "/");
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          router.push("/admin");
        }
      } else {
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          setError(error.message);
        } else {
          setError("Please check your email to verify your account.");
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
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
            {isLogin ? "Sign in to your account" : "Create your account"}
          </Text>

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <VStack gap={4}>
              {!isLogin && (
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
                    color="black"
                    _hover={{ borderColor: "rgb(92,127,66)" }}
                    _focus={{ 
                      borderColor: "rgb(9,76,9)",
                      boxShadow: "0 0 0 1px rgb(9,76,9)"
                    }}
                  />
                </Box>
              )}
              {/* Role selector for sign up */}
              {!isLogin && (
                <Box w="full">
                  <Text mb={2} fontSize="sm" fontWeight="medium" color="rgb(78,61,30)">
                    Role <Text as="span" color="red.500">*</Text>
                  </Text>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as 'admin' | 'applicant')}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid rgb(146,169,129)',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      color: 'black',
                    }}
                  >
                    <option value="applicant">Applicant</option>
                    <option value="admin">Admin</option>
                  </select>
                </Box>
              )}
              
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
                  color="black"
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
                  color="black"
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
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </VStack>
          </form>

          <Box textAlign="center" borderTop="2px" borderTopColor="rgb(146,169,129)" pt={6}>
            <Text color="rgb(78,61,30)" fontSize="sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <Link 
              onClick={() => setIsLogin(!isLogin)}
              color="rgb(9,76,9)"
              fontWeight="medium"
              _hover={{ color: "rgb(92,127,66)" }}
              cursor="pointer"
            >
              {isLogin ? "Sign up here" : "Sign in here"}
            </Link>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}