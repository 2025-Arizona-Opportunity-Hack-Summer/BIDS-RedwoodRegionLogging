"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  Box, 
  Flex, 
  Spacer, 
  Button, 
  Text, 
  HStack, 
  VStack,
  Badge
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, profile, signOut, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double-clicks
    
    setIsLoggingOut(true);
    try {
      const { error } = await signOut();
      if (!error) {
        // Small delay to ensure auth state updates
        setTimeout(() => {
          router.push("/login");
        }, 100);
      } else {
        console.error('Logout error:', error);
        // Reset state on error so user can try again
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <Box 
      as="nav" 
      bg="rgb(61,84,44)" // Dark forest green
      color="white"
      borderBottomWidth={2}
      borderBottomColor="rgb(255,211,88)" // Golden yellow accent
    >
      <Flex align="center" p={4}>
        <Link href="/">
          <Text 
            fontWeight="bold" 
            fontSize={{ base: "lg", md: "xl" }}
            color="white"
            _hover={{ color: "rgb(255,211,88)" }}
            cursor="pointer"
          >
            RRLC Scholarship Portal
          </Text>
        </Link>
        
        <Spacer />
        
        {/* Desktop Navigation */}
        <HStack gap={4} display={{ base: "none", md: "flex" }}>
          <Link href="/scholarships">
            <Button 
              variant="ghost" 
              size="sm"
              color="white"
              _hover={{ 
                bg: "rgb(92,127,66)",
                color: "white"
              }}
            >
              Browse Scholarships
            </Button>
          </Link>

          {isAuthenticated() ? (
            <>
              <Link href={isAdmin() ? "/admin" : "/home"}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  color="white"
                  _hover={{ 
                    bg: "rgb(92,127,66)",
                    color: "white"
                  }}
                >
                  Home
                </Button>
              </Link>
              
              {isAdmin() && (
                <Link href="/admin">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    color="white"
                    _hover={{ 
                      bg: "rgb(92,127,66)",
                      color: "white"
                    }}
                  >
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              
              <Box textAlign="right">
                <Text fontSize="sm" color="rgb(255,211,88)">
                  {profile?.full_name || user?.email}
                </Text>
                {profile?.role && (
                  <Badge 
                    size="sm" 
                    bg="rgb(255,211,88)"
                    color="rgb(78,61,30)"
                    textTransform="capitalize"
                  >
                    {profile.role}
                  </Badge>
                )}
              </Box>
              
              <Button 
                size="sm" 
                onClick={handleLogout}
                loading={isLoggingOut}
                disabled={isLoggingOut}
                bg="rgb(94,60,23)" // Rich brown
                color="white"
                _hover={{ 
                  bg: "rgb(78,61,30)" // Darker brown on hover
                }}
                _active={{
                  bg: "rgb(78,61,30)",
                  transform: "scale(0.98)"
                }}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button 
                size="sm"
                bg="rgb(9,76,9)" // Deep green
                color="white"
                _hover={{ 
                  bg: "rgb(92,127,66)" // Forest accent on hover
                }}
              >
                Login
              </Button>
            </Link>
          )}
        </HStack>

        {/* Mobile Navigation - Simplified */}
        <VStack 
          gap={2} 
          display={{ base: "flex", md: "none" }}
          position="absolute"
          top="100%"
          left={0}
          right={0}
          bg="rgb(61,84,44)"
          p={4}
          borderTopWidth={1}
          borderTopColor="rgb(92,127,66)"
          zIndex={10}
        >
          <Link href="/scholarships">
            <Button 
              variant="ghost" 
              size="sm"
              color="white"
              w="100%"
              _hover={{ 
                bg: "rgb(92,127,66)",
                color: "white"
              }}
            >
              Browse Scholarships
            </Button>
          </Link>

          {isAuthenticated() ? (
            <>
              {isAdmin() && (
                <Link href="/admin">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    color="white"
                    w="100%"
                    _hover={{ 
                      bg: "rgb(92,127,66)",
                      color: "white"
                    }}
                  >
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              
              <Button 
                size="sm" 
                onClick={handleLogout}
                loading={isLoggingOut}
                disabled={isLoggingOut}
                bg="rgb(94,60,23)"
                color="white"
                w="100%"
                _hover={{ 
                  bg: "rgb(78,61,30)"
                }}
                _active={{
                  bg: "rgb(78,61,30)",
                  transform: "scale(0.98)"
                }}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button 
                size="sm"
                bg="rgb(9,76,9)"
                color="white"
                w="100%"
                _hover={{ 
                  bg: "rgb(92,127,66)"
                }}
              >
                Login
              </Button>
            </Link>
          )}
        </VStack>
      </Flex>
    </Box>
  );
} 