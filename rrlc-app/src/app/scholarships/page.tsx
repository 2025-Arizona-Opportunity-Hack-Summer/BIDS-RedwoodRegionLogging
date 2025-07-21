"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Input,
  Card,
  CardBody,
  Skeleton,
} from "@chakra-ui/react";
import { FiClock, FiDollarSign, FiFileText, FiArrowRight } from "react-icons/fi";
import { usePublicScholarships } from "@/hooks/usePublicScholarships";
import { Scholarship } from "@/types/database";

function ScholarshipCardSkeleton() {
  return (
    <Card bg="white" border="2px" borderColor="rgb(146,169,129)" h="350px">
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Skeleton height="24px" width="80%" />
          <Skeleton height="60px" width="100%" />
          <HStack spacing={4}>
            <Skeleton height="20px" width="100px" />
            <Skeleton height="20px" width="80px" />
          </HStack>
          <Skeleton height="40px" width="120px" />
        </VStack>
      </CardBody>
    </Card>
  );
}

function CountdownBadge({ deadline }: { deadline: string | null }) {
  const getDaysUntilDeadline = (deadline: string | null): number | null => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const days = getDaysUntilDeadline(deadline);
  
  if (days === null) {
    return (
      <Badge bg="gray.100" color="gray.600" px={3} py={1} borderRadius="full">
        <HStack spacing={1}>
          <FiClock size={12} />
          <Text fontSize="xs">No deadline</Text>
        </HStack>
      </Badge>
    );
  }

  let colorScheme = "green";
  let urgencyText = "plenty of time";
  
  if (days <= 3) {
    colorScheme = "red";
    urgencyText = "urgent";
  } else if (days <= 7) {
    colorScheme = "orange";
    urgencyText = "soon";
  } else if (days <= 30) {
    colorScheme = "yellow";
    urgencyText = "closing soon";
  }

  return (
    <Badge
      bg={colorScheme === "green" ? "rgb(9,76,9)" : 
          colorScheme === "yellow" ? "rgb(255,211,88)" :
          colorScheme === "orange" ? "orange.400" : "red.400"}
      color={colorScheme === "yellow" ? "rgb(78,61,30)" : "white"}
      px={3}
      py={1}
      borderRadius="full"
    >
      <HStack spacing={1}>
        <FiClock size={12} />
        <Text fontSize="xs" fontWeight="medium">
          {days} days • {urgencyText}
        </Text>
      </HStack>
    </Badge>
  );
}

function ScholarshipCard({ scholarship }: { scholarship: Scholarship }) {
  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Amount varies";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card
      bg="white"
      border="2px"
      borderColor="rgb(146,169,129)"
      _hover={{
        borderColor: "rgb(9,76,9)",
        boxShadow: "xl",
        transform: "translateY(-4px)"
      }}
      transition="all 0.3s ease"
      h="400px"
    >
      <CardBody display="flex" flexDirection="column" justify="space-between">
        <VStack align="start" spacing={4} flex={1}>
          {/* Header with deadline badge */}
          <HStack justify="space-between" w="full" align="start">
            <Heading size="md" color="rgb(61,84,44)" lineHeight="short">
              {scholarship.name}
            </Heading>
            <CountdownBadge deadline={scholarship.deadline} />
          </HStack>

          {/* Description */}
          <Text 
            color="rgb(78,61,30)" 
            fontSize="sm"
            lineHeight="1.5"
            noOfLines={3}
            flex={1}
          >
            {scholarship.description || "No description available"}
          </Text>

          {/* Amount and details */}
          <VStack align="start" spacing={3} w="full">
            <HStack spacing={2}>
              <FiDollarSign color="rgb(9,76,9)" size={16} />
              <Text fontWeight="bold" color="rgb(9,76,9)" fontSize="lg">
                {formatCurrency(scholarship.amount)}
              </Text>
            </HStack>

            {scholarship.requirements && (
              <HStack spacing={2} align="start">
                <FiFileText color="rgb(78,61,30)" size={14} style={{ marginTop: '2px' }} />
                <Text fontSize="xs" color="rgb(78,61,30)" noOfLines={2}>
                  {scholarship.requirements}
                </Text>
              </HStack>
            )}
          </VStack>
        </VStack>

        {/* Apply button */}
        <Link href={`/scholarships/${scholarship.id}/apply`}>
          <Button
            rightIcon={<FiArrowRight />}
            bg="rgb(9,76,9)"
            color="white"
            size="md"
            w="full"
            _hover={{ bg: "rgb(92,127,66)" }}
            _active={{ transform: "scale(0.98)" }}
            mt={4}
          >
            Apply Now
          </Button>
        </Link>
      </CardBody>
    </Card>
  );
}

function FilterSection({ filters, updateFilters }: { filters: any; updateFilters: any; }) {
  return (
    <Card bg="white" border="2px" borderColor="rgb(146,169,129)" boxShadow="md">
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack spacing={4} align="center" flexWrap="wrap">
            {/* Search */}
            <Box flex={1} minW="300px">
              <Input
                placeholder="🔍 Search scholarships..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                borderColor="rgb(146,169,129)"
                _hover={{ borderColor: "rgb(92,127,66)" }}
                _focus={{
                  borderColor: "rgb(9,76,9)",
                  boxShadow: "0 0 0 1px rgb(9,76,9)"
                }}
                size="lg"
              />
            </Box>

            {/* Deadline filter */}
            <Box
              as="select"
              value={filters.deadline}
              onChange={(e) => updateFilters({ deadline: e.target.value })}
              p={3}
              borderWidth="1px"
              borderColor="rgb(146,169,129)"
              borderRadius="md"
              bg="white"
              fontSize="md"
              minW="150px"
              _hover={{ borderColor: "rgb(92,127,66)" }}
              _focus={{
                borderColor: "rgb(9,76,9)",
                boxShadow: "0 0 0 1px rgb(9,76,9)"
              }}
            >
              <option value="all">All deadlines</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="quarter">Next 3 months</option>
            </Box>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

export default function PublicScholarshipsPage() {
  const { 
    scholarships, 
    loading, 
    error, 
    filters, 
    updateFilters,
    filteredCount,
    totalCount
  } = usePublicScholarships();

  return (
    <Box minHeight="100vh" bg="rgb(193,212,178)">
      {/* Hero Section */}
      <Box
        bg="linear-gradient(135deg, rgb(61,84,44) 0%, rgb(92,127,66) 100%)"
        color="white"
        py={20}
        px={6}
      >
        <Box maxW="6xl" mx="auto" textAlign="center">
          <VStack spacing={6}>
            <Heading size="3xl" fontWeight="bold">
              Discover Your Future
            </Heading>
            <Text fontSize="xl" opacity={0.9} maxW="2xl">
              Explore scholarship opportunities from the Redwood Region Logging Conference. 
              Find funding to support your education and career in forestry and sustainable logging.
            </Text>
            <HStack spacing={4} fontSize="lg">
              <HStack>
                <FiDollarSign />
                <Text>Financial Support</Text>
              </HStack>
              <Text>•</Text>
              <HStack>
                <FiClock />
                <Text>Multiple Deadlines</Text>
              </HStack>
              <Text>•</Text>
              <HStack>
                <FiFileText />
                <Text>Easy Application</Text>
              </HStack>
            </HStack>
          </VStack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxW="7xl" mx="auto" p={6}>
        <VStack spacing={8} align="stretch">
          {/* Filters */}
          <FilterSection filters={filters} updateFilters={updateFilters} />

          {/* Results Header */}
          <HStack justify="space-between" align="center">
            <Box>
              <Heading size="lg" color="rgb(61,84,44)">
                Available Scholarships
              </Heading>
              <Text color="rgb(78,61,30)">
                {loading ? "Loading..." : 
                 filteredCount === totalCount 
                   ? `${totalCount} scholarship${totalCount !== 1 ? 's' : ''} available`
                   : `${filteredCount} of ${totalCount} scholarship${totalCount !== 1 ? 's' : ''} match your criteria`
                }
              </Text>
            </Box>
          </HStack>

          {/* Error State */}
          {error && (
            <Box p={6} bg="red.50" border="1px" borderColor="red.200" borderRadius="md">
              <Text color="red.800" textAlign="center">
                {error}
              </Text>
            </Box>
          )}

          {/* Scholarship Grid */}
          {loading ? (
            <Box
              display="grid"
              gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
              gap={6}
            >
              {[...Array(6)].map((_, i) => (
                <ScholarshipCardSkeleton key={i} />
              ))}
            </Box>
          ) : scholarships.length === 0 ? (
            <Box textAlign="center" py={16}>
              <VStack spacing={4}>
                <Text fontSize="xl" color="rgb(78,61,30)">
                  {filters.search || filters.deadline !== 'all'
                    ? "No scholarships match your search criteria"
                    : "No active scholarships available"
                  }
                </Text>
                <Text color="rgb(78,61,30)" opacity={0.8}>
                  {filters.search || filters.deadline !== 'all'
                    ? "Try adjusting your search or filters"
                    : "Check back later for new opportunities"
                  }
                </Text>
                {(filters.search || filters.deadline !== 'all') && (
                  <Button
                    onClick={() => updateFilters({ search: '', deadline: 'all' })}
                    variant="ghost"
                    color="rgb(9,76,9)"
                  >
                    Clear all filters
                  </Button>
                )}
              </VStack>
            </Box>
          ) : (
            <Box
              display="grid"
              gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
              gap={6}
            >
              {scholarships.map((scholarship) => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
              ))}
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
}