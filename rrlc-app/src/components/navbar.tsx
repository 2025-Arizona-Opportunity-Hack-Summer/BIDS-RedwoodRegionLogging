"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Flex, Spacer, Button, Text, HStack, Badge } from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, profile, signOut, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <Box 
      as="nav" 
      p={4} 
      bg="rgb(61,84,44)" // Dark forest green
      color="white"
      borderBottomWidth={2}
      borderBottomColor="rgb(255,211,88)" // Golden yellow accent
    >
      <Flex align="center">
        <Link href="/">
          <Text 
            fontWeight="bold" 
            fontSize="xl"
            color="white"
            _hover={{ color: "rgb(255,211,88)" }}
            cursor="pointer"
          >
            RRLC Scholarship Portal
          </Text>
        </Link>
        
        <Spacer />
        
        <HStack spacing={4}>
          {/* Browse Scholarships - Always visible */}
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
                bg="rgb(94,60,23)" // Rich brown
                color="white"
                _hover={{ 
                  bg: "rgb(78,61,30)" // Darker brown on hover
                }}
              >
                Logout
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
      </Flex>
    </Box>
  );
} 