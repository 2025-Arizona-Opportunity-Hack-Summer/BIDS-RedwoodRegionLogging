"use client";

import Link from "next/link";
import { 
  Box, 
  Button, 
  Heading, 
  VStack, 
  Text, 
  Grid, 
  GridItem,
  Card
} from "@chakra-ui/react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

function AdminDashboardContent() {
  const { profile } = useAuth();

  return (
    <Box 
      minHeight="100vh" 
      bg="rgb(193,212,178)" // Light sage background
      p={6}
    >
      <Box maxW="7xl" mx="auto">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading 
              size="2xl" 
              color="rgb(61,84,44)" // Dark forest green
              mb={2}
            >
              Admin Dashboard
            </Heading>
            <Text 
              fontSize="lg" 
              color="rgb(78,61,30)" // Primary text color
            >
              Welcome back, {profile?.full_name || "Administrator"}!
            </Text>
          </Box>

          {/* Stats Overview */}
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
            <GridItem>
              <Card.Root 
                bg="white"
                border="2px"
                borderColor="rgb(146,169,129)" // Medium sage
                _hover={{ borderColor: "rgb(92,127,66)" }}
              >
                <Card.Body textAlign="center">
                  <Text fontSize="sm" color="rgb(78,61,30)" mb={2}>Total Applications</Text>
                  <Text fontSize="3xl" fontWeight="bold" color="rgb(9,76,9)">0</Text>
                  <Text fontSize="sm" color="rgb(78,61,30)">This month</Text>
                </Card.Body>
              </Card.Root>
            </GridItem>
            
            <GridItem>
              <Card.Root 
                bg="white"
                border="2px"
                borderColor="rgb(146,169,129)"
                _hover={{ borderColor: "rgb(92,127,66)" }}
              >
                <Card.Body textAlign="center">
                  <Text fontSize="sm" color="rgb(78,61,30)" mb={2}>Active Scholarships</Text>
                  <Text fontSize="3xl" fontWeight="bold" color="rgb(9,76,9)">0</Text>
                  <Text fontSize="sm" color="rgb(78,61,30)">Currently open</Text>
                </Card.Body>
              </Card.Root>
            </GridItem>
            
            <GridItem>
              <Card.Root 
                bg="white"
                border="2px"
                borderColor="rgb(146,169,129)"
                _hover={{ borderColor: "rgb(92,127,66)" }}
              >
                <Card.Body textAlign="center">
                  <Text fontSize="sm" color="rgb(78,61,30)" mb={2}>Awards Pending</Text>
                  <Text fontSize="3xl" fontWeight="bold" color="rgb(255,211,88)">0</Text>
                  <Text fontSize="sm" color="rgb(78,61,30)">Awaiting approval</Text>
                </Card.Body>
              </Card.Root>
            </GridItem>
            
            <GridItem>
              <Card.Root 
                bg="white"
                border="2px"
                borderColor="rgb(146,169,129)"
                _hover={{ borderColor: "rgb(92,127,66)" }}
              >
                <Card.Body textAlign="center">
                  <Text fontSize="sm" color="rgb(78,61,30)" mb={2}>Total Awarded</Text>
                  <Text fontSize="3xl" fontWeight="bold" color="rgb(9,76,9)">$0</Text>
                  <Text fontSize="sm" color="rgb(78,61,30)">This year</Text>
                </Card.Body>
              </Card.Root>
            </GridItem>
          </Grid>

          {/* Quick Actions */}
          <Card.Root 
            bg="white"
            border="2px"
            borderColor="rgb(146,169,129)"
          >
            <Card.Header>
              <Heading 
                size="lg" 
                color="rgb(61,84,44)"
              >
                Quick Actions
              </Heading>
            </Card.Header>
            <Card.Body>
              <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                <Link href="/admin/scholarships">
                  <Button 
                    size="lg"
                    w="full"
                    bg="rgb(9,76,9)" // Deep green
                    color="white"
                    _hover={{ bg: "rgb(92,127,66)" }}
                  >
                    Manage Scholarships
                  </Button>
                </Link>
                
                <Link href="/admin/applications">
                  <Button 
                    size="lg"
                    w="full"
                    bg="rgb(94,60,23)" // Rich brown
                    color="white"
                    _hover={{ bg: "rgb(78,61,30)" }}
                  >
                    Review Applications
                  </Button>
                </Link>
                
                <Link href="/admin/users">
                  <Button 
                    size="lg"
                    w="full"
                    bg="rgb(255,211,88)" // Golden yellow
                    color="rgb(78,61,30)"
                    _hover={{ bg: "rgb(197,155,60)" }}
                  >
                    User Management
                  </Button>
                </Link>
                
                <Link href="/admin/reports">
                  <Button 
                    size="lg"
                    w="full"
                    bg="rgb(146,169,129)" // Medium sage
                    color="white"
                    _hover={{ bg: "rgb(92,127,66)" }}
                  >
                    Generate Reports
                  </Button>
                </Link>
              </Grid>
            </Card.Body>
          </Card.Root>

          {/* Recent Activity */}
          <Card.Root 
            bg="white"
            border="2px"
            borderColor="rgb(146,169,129)"
          >
            <Card.Header>
              <Heading 
                size="lg" 
                color="rgb(61,84,44)"
              >
                Recent Activity
              </Heading>
            </Card.Header>
            <Card.Body>
              <Text color="rgb(78,61,30)" textAlign="center" py={8}>
                No recent activity to display.
              </Text>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    </Box>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
} 