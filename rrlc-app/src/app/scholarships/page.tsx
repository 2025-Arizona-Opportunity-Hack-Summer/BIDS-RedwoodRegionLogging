"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { FiClock, FiDollarSign, FiFileText, FiArrowRight, FiSearch, FiInfo } from "react-icons/fi";
import { usePublicScholarships } from "@/hooks/usePublicScholarships";
import { useAuth } from "@/contexts/AuthContext";
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
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Amount varies";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleApplyClick = () => {
    if (isAuthenticated()) {
      router.push(`/scholarships/${scholarship.id}/apply`);
    } else {
      router.push('/login');
    }
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
      <Button
        bg="rgb(9,76,9)"
        color="white"
        size="md"
        w="full"
        _hover={{ bg: "rgb(92,127,66)" }}
        _active={{ transform: "scale(0.98)" }}
        mt={4}
        onClick={handleApplyClick}
      >
        Apply Now
        <Box as={FiArrowRight} ml={2} />
      </Button>
    </Box>
  );

  return (
    <Box {...cardProps}>
      {CardContent}
    </Box>
  );
}

interface FilterSectionProps {
  filters: { 
    search: string; 
    deadline: 'week' | 'month' | 'quarter' | 'all';
    minAmount?: number;
    maxAmount?: number;
  };
  updateFilters: (updates: Partial<{ 
    search: string; 
    deadline: 'week' | 'month' | 'quarter' | 'all';
    minAmount?: number;
    maxAmount?: number;
  }>) => void;
}

function FilterSection({ filters, updateFilters }: FilterSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters(localFilters);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [localFilters, updateFilters]);

  const handleLocalFilterChange = (updates: Partial<typeof filters>) => {
    setLocalFilters(prev => ({ ...prev, ...updates }));
  };

  const clearAllFilters = () => {
    const cleared = { 
      search: '', 
      deadline: 'all' as const,
      minAmount: undefined,
      maxAmount: undefined
    };
    setLocalFilters(cleared);
    updateFilters(cleared);
  };

  const hasActiveFilters = filters.search || filters.deadline !== 'all' || filters.minAmount || filters.maxAmount;

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
        {/* Primary Filter Row */}
        <Stack direction="row" gap={4} align="center" flexWrap="wrap">
          {/* Search */}
          <Box flex={1} minW="300px">
            <Input
              placeholder="🔍 Search scholarships by name, description, or requirements..."
              value={localFilters.search}
              onChange={(e) => handleLocalFilterChange({ search: e.target.value })}
              size="lg"
              borderColor="rgb(146,169,129)"
              _hover={{ borderColor: "rgb(92,127,66)" }}
              _focus={{
                borderColor: "rgb(9,76,9)",
                boxShadow: "0 0 0 1px rgb(9,76,9)"
              }}
            />
          </Box>

          {/* Deadline filter */}
          <Box minW="150px">
            <select
              value={localFilters.deadline}
              onChange={(e) => handleLocalFilterChange({ deadline: e.target.value as 'week' | 'month' | 'quarter' | 'all' })}
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

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            borderColor="rgb(146,169,129)"
            color="rgb(78,61,30)"
            _hover={{ borderColor: "rgb(92,127,66)", bg: "rgb(193,212,178)" }}
            onClick={() => setShowAdvanced(!showAdvanced)}
            size="lg"
          >
            {showAdvanced ? 'Hide' : 'More'} Filters
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              color="rgb(94,60,23)"
              _hover={{ bg: "rgb(193,212,178)" }}
              onClick={clearAllFilters}
              size="lg"
            >
              Clear All
            </Button>
          )}
        </Stack>

        {/* Advanced Filters Section */}
        {showAdvanced && (
          <Box
            bg="rgb(193,212,178)"
            border="1px"
            borderColor="rgb(146,169,129)"
            borderRadius="md"
            p={4}
            mt={2}
          >
            <Stack direction="column" gap={4}>
              <Text fontSize="sm" fontWeight="medium" color="rgb(61,84,44)">
                Advanced Filters
              </Text>
              
              <Stack direction="row" gap={4} align="end" flexWrap="wrap">
                {/* Amount Range */}
                <Stack direction="column" gap={1} minW="120px">
                  <Text fontSize="xs" color="rgb(78,61,30)" fontWeight="medium">
                    Min Amount ($)
                  </Text>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={localFilters.minAmount || ''}
                    onChange={(e) => handleLocalFilterChange({ 
                      minAmount: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    size="sm"
                    bg="white"
                    borderColor="rgb(146,169,129)"
                    _hover={{ borderColor: "rgb(92,127,66)" }}
                    _focus={{
                      borderColor: "rgb(9,76,9)",
                      boxShadow: "0 0 0 1px rgb(9,76,9)"
                    }}
                  />
                </Stack>

                <Stack direction="column" gap={1} minW="120px">
                  <Text fontSize="xs" color="rgb(78,61,30)" fontWeight="medium">
                    Max Amount ($)
                  </Text>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={localFilters.maxAmount || ''}
                    onChange={(e) => handleLocalFilterChange({ 
                      maxAmount: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    size="sm"
                    bg="white"
                    borderColor="rgb(146,169,129)"
                    _hover={{ borderColor: "rgb(92,127,66)" }}
                    _focus={{
                      borderColor: "rgb(9,76,9)",
                      boxShadow: "0 0 0 1px rgb(9,76,9)"
                    }}
                  />
                </Stack>

                {/* Quick Amount Filters */}
                <Stack direction="column" gap={1}>
                  <Text fontSize="xs" color="rgb(78,61,30)" fontWeight="medium">
                    Quick Amount
                  </Text>
                  <Stack direction="row" gap={2}>
                    <Button
                      size="sm"
                      variant={(!localFilters.minAmount && !localFilters.maxAmount) ? "solid" : "outline"}
                      bg={(!localFilters.minAmount && !localFilters.maxAmount) ? "rgb(9,76,9)" : "transparent"}
                      color={(!localFilters.minAmount && !localFilters.maxAmount) ? "white" : "rgb(78,61,30)"}
                      borderColor="rgb(146,169,129)"
                      _hover={{ bg: (!localFilters.minAmount && !localFilters.maxAmount) ? "rgb(92,127,66)" : "rgb(193,212,178)" }}
                      onClick={() => handleLocalFilterChange({ minAmount: undefined, maxAmount: undefined })}
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant={(localFilters.minAmount === 1000 && localFilters.maxAmount === 5000) ? "solid" : "outline"}
                      bg={(localFilters.minAmount === 1000 && localFilters.maxAmount === 5000) ? "rgb(9,76,9)" : "transparent"}
                      color={(localFilters.minAmount === 1000 && localFilters.maxAmount === 5000) ? "white" : "rgb(78,61,30)"}
                      borderColor="rgb(146,169,129)"
                      _hover={{ bg: (localFilters.minAmount === 1000 && localFilters.maxAmount === 5000) ? "rgb(92,127,66)" : "rgb(193,212,178)" }}
                      onClick={() => handleLocalFilterChange({ minAmount: 1000, maxAmount: 5000 })}
                    >
                      $1K-$5K
                    </Button>
                    <Button
                      size="sm"
                      variant={(localFilters.minAmount === 5000) ? "solid" : "outline"}
                      bg={(localFilters.minAmount === 5000) ? "rgb(9,76,9)" : "transparent"}
                      color={(localFilters.minAmount === 5000) ? "white" : "rgb(78,61,30)"}
                      borderColor="rgb(146,169,129)"
                      _hover={{ bg: (localFilters.minAmount === 5000) ? "rgb(92,127,66)" : "rgb(193,212,178)" }}
                      onClick={() => handleLocalFilterChange({ minAmount: 5000, maxAmount: undefined })}
                    >
                      $5K+
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <Stack direction="row" gap={2} wrap="wrap" align="center">
            <Text fontSize="xs" color="rgb(78,61,30)" fontWeight="medium">
              Active filters:
            </Text>
            {filters.search && (
              <Badge bg="rgb(255,211,88)" color="rgb(78,61,30)" px={2} py={1} borderRadius="md">
                Search: "{filters.search}"
              </Badge>
            )}
            {filters.deadline !== 'all' && (
              <Badge bg="rgb(9,76,9)" color="white" px={2} py={1} borderRadius="md">
                Deadline: {filters.deadline}
              </Badge>
            )}
            {(localFilters.minAmount || localFilters.maxAmount) && (
              <Badge bg="rgb(146,169,129)" color="white" px={2} py={1} borderRadius="md">
                Amount: {localFilters.minAmount ? `$${localFilters.minAmount.toLocaleString()}` : '$0'} - {localFilters.maxAmount ? `$${localFilters.maxAmount.toLocaleString()}` : 'max'}
              </Badge>
            )}
          </Stack>
        )}
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
  const hasFilters = filters.search || filters.deadline !== 'all' || filters.minAmount || filters.maxAmount;
  const showEmptyState = !loading && !hasScholarships;

  // Type-safe filter props
  const filterProps = {
    search: filters.search || '',
    deadline: (filters.deadline as 'week' | 'month' | 'quarter' | 'all') || 'all',
    minAmount: filters.minAmount,
    maxAmount: filters.maxAmount
  };

  const handleUpdateFilters = (updates: Partial<{ 
    search: string; 
    deadline: 'week' | 'month' | 'quarter' | 'all';
    minAmount?: number;
    maxAmount?: number;
  }>) => {
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
                      onClick={() => updateFilters({ 
                        search: '', 
                        deadline: 'all', 
                        minAmount: undefined, 
                        maxAmount: undefined 
                      })}
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
                        <FiInfo style={{ display: 'inline', marginRight: '8px' }} /> Administrators can add scholarships through the admin panel
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