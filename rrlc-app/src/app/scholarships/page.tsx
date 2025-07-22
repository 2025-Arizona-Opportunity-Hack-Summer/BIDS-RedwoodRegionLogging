"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Heading,
  Text,
  Badge,
  Input,
  Skeleton,
  Stack,
} from "@chakra-ui/react";
import { FiClock, FiDollarSign, FiFileText, FiArrowRight } from "react-icons/fi";
import { usePublicScholarships } from "@/hooks/usePublicScholarships";
import { Scholarship } from "@/types/database";

function ScholarshipCardSkeleton() {
  const CardContent = (
    <Stack direction="column" gap={4} align="stretch">
      <Skeleton height="24px" width="80%" />
      <Skeleton height="60px" width="100%" />
      <Stack direction="row" gap={4}>
        <Skeleton height="20px" width="100px" />
        <Skeleton height="20px" width="80px" />
      </Stack>
      <Skeleton height="40px" width="120px" />
    </Stack>
  );

  return (
    <Box bg="white" border="2px" borderColor="rgb(146,169,129)" h="350px" borderRadius="md" p={6}>
      {CardContent}
    </Box>
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
        <Stack direction="row" gap={1}>
          <FiClock size={12} />
          <Text fontSize="xs">No deadline</Text>
        </Stack>
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
      <Stack direction="row" gap={1}>
        <FiClock size={12} />
        <Text fontSize="xs" fontWeight="medium">
          {days} days • {urgencyText}
        </Text>
      </Stack>
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

  const cardProps = {
    bg: "white",
    border: "2px",
    borderColor: "rgb(146,169,129)",
    _hover: {
      borderColor: "rgb(9,76,9)",
      boxShadow: "xl",
      transform: "translateY(-4px)"
    },
    transition: "all 0.3s ease",
    h: "400px",
    borderRadius: "md"
  };

  const CardContent = (
    <Box display="flex" flexDirection="column" justifyContent="space-between" h="full" p={6}>
      <Stack direction="column" align="start" gap={4} flex={1}>
        {/* Header with deadline badge */}
        <Stack direction="row" justify="space-between" w="full" align="start">
          <Heading size="md" color="rgb(61,84,44)" lineHeight="short">
            {scholarship.name}
          </Heading>
          <CountdownBadge deadline={scholarship.deadline} />
        </Stack>

        {/* Description */}
        <Text 
          color="rgb(78,61,30)" 
          fontSize="sm"
          lineHeight="1.5"
          flex={1}
          overflow="hidden"
          textOverflow="ellipsis"
          css={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical"
          }}
        >
          {scholarship.description || "No description available"}
        </Text>

        {/* Amount and details */}
        <Stack direction="column" align="start" gap={3} w="full">
          <Stack direction="row" gap={2}>
            <FiDollarSign color="rgb(9,76,9)" size={16} />
            <Text fontWeight="bold" color="rgb(9,76,9)" fontSize="lg">
              {formatCurrency(scholarship.amount)}
            </Text>
          </Stack>

          {scholarship.requirements && (
            <Stack direction="row" gap={2} align="start">
              <FiFileText color="rgb(78,61,30)" size={14} style={{ marginTop: '2px' }} />
              <Text 
                fontSize="xs" 
                color="rgb(78,61,30)" 
                overflow="hidden"
                textOverflow="ellipsis"
                css={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical"
                }}
              >
                {scholarship.requirements}
              </Text>
            </Stack>
          )}
        </Stack>
      </Stack>

      {/* Apply button */}
      <Link href={`/scholarships/${scholarship.id}/apply`}>
        <Button
          bg="rgb(9,76,9)"
          color="white"
          size="md"
          w="full"
          _hover={{ bg: "rgb(92,127,66)" }}
          _active={{ transform: "scale(0.98)" }}
          mt={4}
        >
          Apply Now
          <Box as={FiArrowRight} ml={2} />
        </Button>
      </Link>
    </Box>
  );

  return (
    <Box {...cardProps}>
      {CardContent}
    </Box>
  );
}

interface FilterSectionProps {
  filters: { search: string; deadline: 'week' | 'month' | 'quarter' | 'all' };
  updateFilters: (updates: Partial<{ search: string; deadline: 'week' | 'month' | 'quarter' | 'all' }>) => void;
}

function FilterSection({ filters, updateFilters }: FilterSectionProps) {
  return (
    <Box 
      bg="white" 
      border="2px" 
      borderColor="rgb(146,169,129)" 
      boxShadow="md"
      borderRadius="md"
      p={6}
    >
      <Stack direction="column" gap={4} align="stretch">
        <Stack direction="row" gap={4} align="center" flexWrap="wrap">
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
          <Box minW="150px">
            <select
              value={filters.deadline}
              onChange={(e) => updateFilters({ deadline: e.target.value as 'week' | 'month' | 'quarter' | 'all' })}
              style={{
                padding: '12px',
                borderWidth: '1px',
                borderColor: 'rgb(146,169,129)',
                borderRadius: '6px',
                backgroundColor: 'white',
                fontSize: '16px',
                minWidth: '150px',
                outline: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgb(92,127,66)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgb(146,169,129)'}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgb(9,76,9)';
                e.currentTarget.style.boxShadow = '0 0 0 1px rgb(9,76,9)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgb(146,169,129)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="all">All deadlines</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="quarter">Next 3 months</option>
            </select>
          </Box>
        </Stack>
      </Stack>
    </Box>
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

  // Enhanced error handling for better user experience
  const hasScholarships = scholarships && scholarships.length > 0;
  const hasFilters = filters.search || filters.deadline !== 'all';
  const showEmptyState = !loading && !hasScholarships;

  // Type-safe filter props
  const filterProps = {
    search: filters.search || '',
    deadline: (filters.deadline as 'week' | 'month' | 'quarter' | 'all') || 'all'
  };

  const handleUpdateFilters = (updates: Partial<{ search: string; deadline: 'week' | 'month' | 'quarter' | 'all' }>) => {
    updateFilters(updates);
  };

  return (
    <Box minHeight="100vh" bg="rgb(193,212,178)">
      {/* Hero Section */}
      <Box
        bg="linear-gradient(135deg, rgb(61,84,44) 0%, rgb(92,127,66) 100%)"
        color="white"
        py={16}
        px={6}
        borderBottomLeftRadius="2xl"
        borderBottomRightRadius="2xl"
        boxShadow="lg"
      >
        <Box maxW="5xl" mx="auto" textAlign="center">
          <Stack direction="column" gap={4}>
            <Heading size="2xl" fontWeight="bold" letterSpacing="tight">
              Discover Your Future
            </Heading>
            <Text fontSize="lg" opacity={0.95} maxW="2xl" mx="auto">
              Explore scholarship opportunities from the Redwood Region Logging Conference. 
              Find funding to support your education and career in forestry and sustainable logging.
            </Text>
            <Stack direction="row" gap={6} fontSize="md" justify="center" align="center">
              <Stack direction="row" align="center">
                <FiDollarSign />
                <Text>Financial Support</Text>
              </Stack>
              <Text>•</Text>
              <Stack direction="row" align="center">
                <FiClock />
                <Text>Multiple Deadlines</Text>
              </Stack>
              <Text>•</Text>
              <Stack direction="row" align="center">
                <FiFileText />
                <Text>Easy Application</Text>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxW="6xl" mx="auto" p={{ base: 4, md: 8 }}>
        <Stack direction="column" gap={10} align="stretch">
          {/* Filters */}
          <Box mb={2}>
            <FilterSection filters={filterProps} updateFilters={handleUpdateFilters} />
          </Box>

          {/* Results Header */}
          <Stack direction="row" justify="space-between" align="center" mb={2}>
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
          </Stack>

          {/* Error State */}
          {error && (
            <Box p={8} bg="orange.50" border="2px" borderColor="orange.200" borderRadius="md" boxShadow="sm">
              <Stack direction="column" gap={4} align="center">
                <Text color="orange.800" textAlign="center" fontSize="lg" fontWeight="medium">
                  {error}
                </Text>
                <Text color="orange.700" textAlign="center" fontSize="sm">
                  This might be because the database is not yet configured or there&apos;s a connection issue.
                  The application will work normally once the database is set up.
                </Text>
                <Button 
                  size="sm" 
                  colorScheme="orange" 
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </Stack>
            </Box>
          )}

          {/* Scholarship Grid */}
          <Box>
            {loading ? (
              <Box
                display="grid"
                gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                gap={8}
              >
                {[...Array(6)].map((_, i) => (
                  <ScholarshipCardSkeleton key={i} />
                ))}
              </Box>
            ) : showEmptyState ? (
              <Box textAlign="center" py={16}>
                <Stack direction="column" gap={6} align="center">
                  <Text fontSize="2xl" color="rgb(78,61,30)" fontWeight="medium">
                    {hasFilters
                      ? "No scholarships match your search criteria"
                      : error 
                        ? "Database Not Connected"
                        : "No scholarships available yet"
                    }
                  </Text>
                  <Text color="rgb(78,61,30)" opacity={0.8} maxW="md">
                    {hasFilters
                      ? "Try adjusting your search terms or deadline filters to find more opportunities."
                      : error
                        ? "The scholarship database is not configured yet. This is normal for a new installation."
                        : "Scholarship opportunities will appear here once they are added by administrators."
                    }
                  </Text>
                  {hasFilters && (
                    <Button
                      onClick={() => updateFilters({ search: '', deadline: 'all' })}
                      bg="rgb(9,76,9)"
                      color="white"
                      _hover={{ bg: "rgb(92,127,66)" }}
                      size="lg"
                    >
                      Clear all filters
                    </Button>
                  )}
                  {!hasFilters && !error && (
                    <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                      <Text fontSize="sm" color="blue.800">
                        💡 Administrators can add scholarships through the admin panel
                      </Text>
                    </Box>
                  )}
                </Stack>
              </Box>
            ) : (
              <Box
                display="grid"
                gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                gap={8}
              >
                {scholarships.map((scholarship) => (
                  <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                ))}
              </Box>
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}