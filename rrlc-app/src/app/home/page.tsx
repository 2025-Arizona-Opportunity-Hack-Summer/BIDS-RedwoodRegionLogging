"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  Heading, 
  VStack, 
  Text, 
  Grid, 
  GridItem,
  Card,
  HStack,
  Badge,
  Icon,
  Skeleton
} from "@chakra-ui/react";
import { 
  FiFileText, 
  FiClock, 
  FiDollarSign, 
  FiBookmark,
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiXCircle
} from "react-icons/fi";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Application } from "@/types/database";

function ApplicantHomeContent() {
  const { profile, user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalAwarded: 0
  });

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            scholarship:scholarships(*)
          `)
          .eq('applicant_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        setApplications(data || []);

        // Calculate stats
        const allApps = data || [];
        setStats({
          totalApplications: allApps.length,
          pendingApplications: allApps.filter(app => 
            ['submitted', 'under_review'].includes(app.status)
          ).length,
          approvedApplications: allApps.filter(app => 
            app.status === 'approved' || app.status === 'awarded'
          ).length,
          totalAwarded: allApps
            .filter(app => app.status === 'awarded')
            .reduce((sum, app) => sum + (app.awarded_amount || 0), 0)
        });
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'submitted': return 'blue';
      case 'under_review': return 'orange';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'awarded': return 'purple';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'awarded':
        return FiCheckCircle;
      case 'rejected':
        return FiXCircle;
      default:
        return FiClock;
    }
  };

  return (
    <Box 
      minHeight="100vh" 
      bg="rgb(193,212,178)" 
      p={6}
    >
      <Box maxW="7xl" mx="auto">
        <VStack gap={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading 
              size="2xl" 
              color="rgb(61,84,44)"
              mb={2}
            >
              Welcome back, {profile?.full_name?.split(' ')[0] || "Student"}!
            </Heading>
            <Text 
              fontSize="lg" 
              color="rgb(78,61,30)"
            >
              Track your scholarship applications and discover new opportunities
            </Text>
          </Box>

          {/* Stats Overview */}
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
            <GridItem>
              <Card.Root 
                bg="white"
                border="2px"
                borderColor="rgb(146,169,129)"
                _hover={{ borderColor: "rgb(92,127,66)" }}
              >
                <Card.Body>
                  <HStack justify="space-between" mb={2}>
                    <Icon as={FiFileText} size="xl" color="rgb(9,76,9)" />
                    <Text fontSize="2xl" fontWeight="bold" color="rgb(9,76,9)">
                      {stats.totalApplications}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="rgb(78,61,30)">Total Applications</Text>
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
                <Card.Body>
                  <HStack justify="space-between" mb={2}>
                    <Icon as={FiClock} size="xl" color="rgb(255,211,88)" />
                    <Text fontSize="2xl" fontWeight="bold" color="rgb(130,99,32)">
                      {stats.pendingApplications}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="rgb(78,61,30)">Pending Review</Text>
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
                <Card.Body>
                  <HStack justify="space-between" mb={2}>
                    <Icon as={FiCheckCircle} size="xl" color="rgb(92,127,66)" />
                    <Text fontSize="2xl" fontWeight="bold" color="rgb(9,76,9)">
                      {stats.approvedApplications}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="rgb(78,61,30)">Approved</Text>
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
                <Card.Body>
                  <HStack justify="space-between" mb={2}>
                    <Icon as={FiDollarSign} size="xl" color="rgb(9,76,9)" />
                    <Text fontSize="2xl" fontWeight="bold" color="rgb(9,76,9)">
                      ${stats.totalAwarded.toLocaleString()}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="rgb(78,61,30)">Total Awarded</Text>
                </Card.Body>
              </Card.Root>
            </GridItem>
          </Grid>

          {/* Quick Actions */}
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
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
                <VStack gap={3} align="stretch">
                  <Link href="/scholarships">
                    <Button 
                      size="lg"
                      w="full"
                      bg="rgb(9,76,9)"
                      color="white"
                      _hover={{ bg: "rgb(92,127,66)" }}
                      leftIcon={<FiBookmark />}
                    >
                      Browse Scholarships
                    </Button>
                  </Link>
                  
                  <Link href="/applications">
                    <Button 
                      size="lg"
                      w="full"
                      bg="rgb(94,60,23)"
                      color="white"
                      _hover={{ bg: "rgb(78,61,30)" }}
                      leftIcon={<FiFileText />}
                    >
                      View All Applications
                    </Button>
                  </Link>
                  
                  <Link href="/profile">
                    <Button 
                      size="lg"
                      w="full"
                      variant="outline"
                      borderColor="rgb(146,169,129)"
                      color="rgb(9,76,9)"
                      _hover={{ 
                        bg: "rgb(193,212,178)",
                        borderColor: "rgb(9,76,9)"
                      }}
                    >
                      Update Profile
                    </Button>
                  </Link>
                </VStack>
              </Card.Body>
            </Card.Root>

            {/* Recent Applications */}
            <Card.Root 
              bg="white"
              border="2px"
              borderColor="rgb(146,169,129)"
            >
              <Card.Header>
                <HStack justify="space-between">
                  <Heading 
                    size="lg" 
                    color="rgb(61,84,44)"
                  >
                    Recent Applications
                  </Heading>
                  {applications.length > 0 && (
                    <Link href="/applications">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        color="rgb(9,76,9)"
                        rightIcon={<FiArrowRight />}
                      >
                        View All
                      </Button>
                    </Link>
                  )}
                </HStack>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <VStack gap={3}>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} height="60px" width="100%" />
                    ))}
                  </VStack>
                ) : applications.length === 0 ? (
                  <VStack py={8} gap={4}>
                    <Text color="rgb(78,61,30)" textAlign="center">
                      No applications yet
                    </Text>
                    <Link href="/scholarships">
                      <Button 
                        size="sm"
                        bg="rgb(9,76,9)"
                        color="white"
                        _hover={{ bg: "rgb(92,127,66)" }}
                      >
                        Find Scholarships
                      </Button>
                    </Link>
                  </VStack>
                ) : (
                  <VStack gap={3} align="stretch">
                    {applications.slice(0, 3).map((app) => (
                      <Box
                        key={app.id}
                        p={3}
                        borderRadius="md"
                        border="1px"
                        borderColor="rgb(193,212,178)"
                        _hover={{ bg: "rgb(243,248,240)" }}
                      >
                        <HStack justify="space-between">
                          <VStack align="start" gap={0}>
                            <Text fontWeight="medium" color="rgb(61,84,44)">
                              {app.scholarship?.name || 'Scholarship'}
                            </Text>
                            <HStack gap={2}>
                              <Icon 
                                as={FiCalendar} 
                                size="sm" 
                                color="rgb(78,61,30)" 
                              />
                              <Text fontSize="sm" color="rgb(78,61,30)">
                                Applied {new Date(app.created_at).toLocaleDateString()}
                              </Text>
                            </HStack>
                          </VStack>
                          <Badge colorScheme={getStatusColor(app.status)}>
                            <HStack gap={1}>
                              <Icon as={getStatusIcon(app.status)} />
                              <Text>{app.status.replace('_', ' ')}</Text>
                            </HStack>
                          </Badge>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Card.Body>
            </Card.Root>
          </Grid>

          {/* Upcoming Deadlines */}
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
                Upcoming Deadlines
              </Heading>
            </Card.Header>
            <Card.Body>
              <Text color="rgb(78,61,30)" textAlign="center" py={8}>
                No upcoming deadlines. Browse scholarships to find new opportunities!
              </Text>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    </Box>
  );
}

export default function ApplicantHomePage() {
  return (
    <ProtectedRoute requireAdmin={false}>
      <ApplicantHomeContent />
    </ProtectedRoute>
  );
}