"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Box, 
  Button, 
  Input, 
  Heading, 
  Stack,
  Text 
} from "@chakra-ui/react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/admin");
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={20} p={8} borderWidth={1} borderRadius="lg" boxShadow="md">
      <Heading mb={6} size="lg" textAlign="center">
        Admin Login
      </Heading>
      <form onSubmit={handleLogin}>
        <Stack gap={4}>
          <Box>
            <Text mb={2} fontSize="sm" fontWeight="medium">
              Email address <Text as="span" color="red.500">*</Text>
            </Text>
            <Input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </Box>
          
          <Box>
            <Text mb={2} fontSize="sm" fontWeight="medium">
              Password <Text as="span" color="red.500">*</Text>
            </Text>
            <Input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </Box>
          
          {error && (
            <Box p={3} bg="red.50" border="1px" borderColor="red.200" borderRadius="md">
              <Text color="red.700" fontSize="sm">
                {error}
              </Text>
            </Box>
          )}
          
          <Button 
            colorScheme="teal" 
            type="submit" 
            loading={loading}
            w="full"
          >
            Login
          </Button>
        </Stack>
      </form>
    </Box>
  );
}