'use client'

import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Badge,
  Grid
} from "@chakra-ui/react";
import { 
  FiAward, 
  FiUsers, 
  FiDollarSign, 
  FiTrendingUp,
  FiArrowRight,
  FiShield,
  FiClock
} from "react-icons/fi";

function FeatureCard({ icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <Box
      bg="white"
      p={10}
      borderRadius="xl"
      border="2px"
      borderColor="rgb(146,169,129)"
      _hover={{
        borderColor: "rgb(9,76,9)",
        transform: "translateY(-4px)",
        boxShadow: "xl"
      }}
      transition="all 0.3s ease"
    >
      <VStack align="start" spacing={4}>
        <Icon as={icon} size={8} color="rgb(9,76,9)" />
        <Heading size="md" color="rgb(61,84,44)">
          {title}
        </Heading>
        <Text color="rgb(78,61,30)" lineHeight="1.6">
          {description}
        </Text>
      </VStack>
    </Box>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <Box textAlign="center">
      <Heading size="2xl" color="white" fontWeight="bold">
        {number}
      </Heading>
      <Text color="rgba(255,255,255,0.9)" fontSize="lg">
        {label}
      </Text>
    </Box>
  );
}

export default function HomePage() {
  return (
    <Box minHeight="100vh" bg="rgb(193,212,178)">
      {/* Hero Section */}
      <Box
        bg="linear-gradient(135deg, rgb(61,84,44) 0%, rgb(92,127,66) 100%)"
        color="white"
        py={56}
        px={6}
        position="relative"
        overflow="hidden"
      >
        {/* Background Pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.1}
          backgroundImage="radial-gradient(circle at 25% 25%, white 2px, transparent 2px)"
          backgroundSize="50px 50px"
        />
        
        <Container maxW="6xl" position="relative">
          <VStack spacing={8} textAlign="center">
            <Badge
              bg="rgba(255,255,255,0.2)"
              color="white"
              px={4}
              py={2}
              borderRadius="full"
              fontSize="sm"
              fontWeight="medium"
            >
              🌲 Empowering Future Forest Stewards
            </Badge>
            
            <Heading size="4xl" fontWeight="bold" maxW="4xl" lineHeight="1.1">
              Redwood Region Logging Conference
              <Text as="span" display="block" color="rgb(193,212,178)">
                Scholarship Portal
              </Text>
            </Heading>
            
            <Text fontSize="xl" opacity={0.9} maxW="2xl" lineHeight="1.6">
              Supporting the next generation of sustainable forestry professionals through 
              educational scholarships and career development opportunities.
            </Text>
            
            <HStack spacing={6} flexWrap="wrap" justify="center">
              <Link href="/scholarships">
                <Button
                  size="lg"
                  bg="white"
                  color="rgb(9,76,9)"
                  _hover={{ 
                    bg: "rgb(193,212,178)",
                    transform: "translateY(-2px)"
                  }}
                  rightIcon={<FiArrowRight />}
                  fontWeight="bold"
                  px={8}
                >
                  Explore Scholarships
                </Button>
              </Link>
              
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="rgba(255,255,255,0.5)"
                  color="white"
                  _hover={{ 
                    bg: "rgba(255,255,255,0.1)",
                    borderColor: "white"
                  }}
                  px={8}
                >
                  Apply Now
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box bg="rgb(9,76,9)" py={16}>
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
            <StatCard number="$250K+" label="Awarded Annually" />
            <StatCard number="150+" label="Students Supported" />
            <StatCard number="25+" label="Partner Organizations" />
            <StatCard number="98%" label="Graduation Rate" />
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={24} px={6}>
        <Container maxW="6xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center" pb={8}>
              <Heading size="2xl" color="rgb(61,84,44)">
                Why Choose RRLC Scholarships?
              </Heading>
              <Text fontSize="xl" color="rgb(78,61,30)" maxW="2xl">
                We&apos;re committed to fostering sustainable forestry education and 
                supporting students who will become tomorrow&apos;s environmental leaders.
              </Text>
            </VStack>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap="48px">
              <FeatureCard
                icon={FiDollarSign}
                title="Financial Support"
                description="Competitive scholarship amounts ranging from $1,000 to $10,000 to help cover tuition, books, and living expenses."
              />
              
              <FeatureCard
                icon={FiUsers}
                title="Mentorship Network"
                description="Connect with industry professionals and RRLC members for guidance, internships, and career opportunities."
              />
              
              <FeatureCard
                icon={FiAward}
                title="Merit & Need Based"
                description="Awards recognize both academic excellence and financial need, ensuring opportunities for all qualified students."
              />
              
              <FeatureCard
                icon={FiTrendingUp}
                title="Career Development"
                description="Access to exclusive workshops, conferences, and networking events in the forestry and logging industry."
              />
              
              <FeatureCard
                icon={FiShield}
                title="Renewable Awards"
                description="Many scholarships are renewable for multiple years, providing ongoing support throughout your education."
              />
              
              <FeatureCard
                icon={FiClock}
                title="Rolling Applications"
                description="Multiple application deadlines throughout the year, giving you flexibility in when to apply."
              />
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box bg="white" py={20} px={6}>
        <Container maxW="4xl" textAlign="center">
          <VStack spacing={8}>
            <VStack spacing={4}>
              <Heading size="2xl" color="rgb(61,84,44)">
                Ready to Invest in Your Future?
              </Heading>
              <Text fontSize="lg" color="rgb(78,61,30)" lineHeight="1.6">
                Join hundreds of students who have launched successful careers in 
                sustainable forestry with support from RRLC scholarships.
              </Text>
            </VStack>
            
            <HStack spacing={4} flexWrap="wrap" justify="center">
              <Link href="/scholarships">
                <Button
                  size="lg"
                  bg="rgb(9,76,9)"
                  color="white"
                  _hover={{ bg: "rgb(92,127,66)" }}
                  rightIcon={<FiArrowRight />}
                  px={8}
                >
                  View Available Scholarships
                </Button>
              </Link>
              
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="rgb(146,169,129)"
                  color="rgb(9,76,9)"
                  _hover={{ 
                    bg: "rgb(193,212,178)",
                    borderColor: "rgb(9,76,9)"
                  }}
                  px={8}
                >
                  Create Account
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}