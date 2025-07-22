"use client";

import { useState } from "react";
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
  CardHeader,
  Skeleton,
} from "@chakra-ui/react";
import { 
  FiDownload, 
  FiEye, 
  FiCheck, 
  FiX, 
  FiClock,
  FiDollarSign,
  FiUsers
} from "react-icons/fi";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAdminApplications } from "@/hooks/useAdminApplications";
import { ApplicationWithScholarship } from "@/services/adminApplications";

function StatsCard({ icon, title, value, subtitle, color = "rgb(9,76,9)" }: any) {
  const Icon = icon;
  
  return (
    <Card bg="white" border="2px" borderColor="rgb(146,169,129)">
      <CardBody>
        <HStack spacing={4}>
          <Box
            w="50px"
            h="50px"
            borderRadius="lg"
            bg={color}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon size={24} color="white" />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color="rgb(61,84,44)">
              {value}
            </Text>
            <Text fontSize="sm" color="rgb(78,61,30)" fontWeight="medium">
              {title}
            </Text>
            {subtitle && (
              <Text fontSize="xs" color="rgb(78,61,30)" opacity={0.8}>
                {subtitle}
              </Text>
            )}
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
}

function ApplicationStatusBadge({ status }: { status: string }) {
  const statusConfig: any = {
    draft: { bg: "gray.400", color: "white", label: "Draft" },
    submitted: { bg: "rgb(255,211,88)", color: "rgb(78,61,30)", label: "Submitted" },
    under_review: { bg: "rgb(146,169,129)", color: "white", label: "Under Review" },
    approved: { bg: "rgb(9,76,9)", color: "white", label: "Approved" },
    rejected: { bg: "rgb(94,60,23)", color: "white", label: "Rejected" },
    awarded: { bg: "rgb(218,165,32)", color: "white", label: "Awarded" }
  };

  const config = statusConfig[status] || statusConfig.submitted;

  return (
    <Badge
      bg={config.bg}
      color={config.color}
      px={3}
      py={1}
      borderRadius="full"
      fontSize="xs"
      fontWeight="medium"
    >
      {config.label}
    </Badge>
  );
}

function ApplicationCard({ application, onStatusUpdate }: { 
  application: ApplicationWithScholarship; 
  onStatusUpdate: (id: string, status: string) => void;
}) {
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    await onStatusUpdate(application.id, newStatus);
    setUpdating(false);
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card
      bg="white"
      border="2px"
      borderColor="rgb(146,169,129)"
      _hover={{
        borderColor: "rgb(92,127,66)",
        boxShadow: "md"
      }}
      transition="all 0.2s"
    >
      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1}>
              <Heading size="md" color="rgb(61,84,44)">
                {application.first_name} {application.last_name}
              </Heading>
              <Text fontSize="sm" color="rgb(78,61,30)" opacity={0.8}>
                {application.scholarships?.name || 'Unknown Scholarship'}
              </Text>
            </VStack>
            <ApplicationStatusBadge status={application.status} />
          </HStack>

          {/* Application Details */}
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" color="rgb(78,61,30)">
                <strong>Email:</strong> {application.email}
              </Text>
              <Text fontSize="sm" color="rgb(78,61,30)">
                <strong>Phone:</strong> {application.phone}
              </Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontSize="sm" color="rgb(78,61,30)">
                <strong>School:</strong> {application.school}
              </Text>
              <Text fontSize="sm" color="rgb(78,61,30)">
                <strong>Major:</strong> {application.major}
              </Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontSize="sm" color="rgb(78,61,30)">
                <strong>GPA:</strong> {application.gpa || 'N/A'}
              </Text>
              <Text fontSize="sm" color="rgb(78,61,30)">
                <strong>Graduation:</strong> {application.graduation_year}
              </Text>
            </HStack>

            <Text fontSize="sm" color="rgb(78,61,30)">
              <strong>Applied:</strong> {new Date(application.created_at).toLocaleDateString()}
            </Text>

            {application.awarded_amount && (
              <Text fontSize="sm" color="rgb(9,76,9)" fontWeight="bold">
                <strong>Awarded:</strong> {formatCurrency(application.awarded_amount)}
              </Text>
            )}
          </VStack>

          {/* Action Buttons */}
          <HStack spacing={2} justify="flex-end">
            <Button
              leftIcon={<FiEye />}
              size="sm"
              variant="ghost"
              color="rgb(9,76,9)"
              _hover={{ bg: "rgb(193,212,178)" }}
            >
              View Details
            </Button>

            {application.status === 'submitted' && (
              <Button
                leftIcon={<FiClock />}
                size="sm"
                bg="rgb(146,169,129)"
                color="white"
                _hover={{ bg: "rgb(92,127,66)" }}
                onClick={() => handleStatusUpdate('under_review')}
                isLoading={updating}
              >
                Review
              </Button>
            )}

            {application.status === 'under_review' && (
              <>
                <Button
                  leftIcon={<FiCheck />}
                  size="sm"
                  bg="rgb(9,76,9)"
                  color="white"
                  _hover={{ bg: "rgb(92,127,66)" }}
                  onClick={() => handleStatusUpdate('approved')}
                  isLoading={updating}
                >
                  Approve
                </Button>
                <Button
                  leftIcon={<FiX />}
                  size="sm"
                  bg="rgb(94,60,23)"
                  color="white"
                  _hover={{ bg: "rgb(78,61,30)" }}
                  onClick={() => handleStatusUpdate('rejected')}
                  isLoading={updating}
                >
                  Reject
                </Button>
              </>
            )}

            {application.status === 'approved' && (
              <Button
                leftIcon={<FiDollarSign />}
                size="sm"
                bg="rgb(218,165,32)"
                color="white"
                _hover={{ bg: "rgb(184,134,11)" }}
                onClick={() => handleStatusUpdate('awarded')}
                isLoading={updating}
              >
                Award
              </Button>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

function ApplicationsContent() {
  const {
    applications,
    loading,
    error,
    stats,
    filters,
    updateFilters,
    applyFilters,
    updateApplicationStatus,
    exportApplications,
    totalCount
  } = useAdminApplications();
  
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    const result = await exportApplications();
    if (!result.success) {
      alert('Failed to export applications: ' + (result.error || 'Unknown error'));
    }
    setExporting(false);
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const result = await updateApplicationStatus(id, status);
    if (!result.success) {
      alert('Failed to update application status: ' + (result.error || 'Unknown error'));
    }
  };

  return (
    <Box minHeight="100vh" bg="rgb(193,212,178)" p={6}>
      <Box maxW="7xl" mx="auto">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <Box>
              <Heading size="2xl" color="rgb(61,84,44)" mb={2}>
                Application Management
              </Heading>
              <Text fontSize="lg" color="rgb(78,61,30)">
                Review and manage scholarship applications
              </Text>
            </Box>
            
            <Button
              leftIcon={<FiDownload />}
              bg="rgb(9,76,9)"
              color="white"
              size="lg"
              _hover={{ bg: "rgb(92,127,66)" }}
              onClick={handleExport}
              isLoading={exporting}
              loadingText="Exporting..."
            >
              Export CSV
            </Button>
          </HStack>

          {/* Stats Cards */}
          {stats && (
            <Box
              display="grid"
              gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
              gap={6}
            >
              <StatsCard
                icon={FiUsers}
                title="Total Applications"
                value={stats.total}
                subtitle={`${stats.thisMonth} this month`}
              />
              <StatsCard
                icon={FiClock}
                title="Under Review"
                value={stats.under_review}
                subtitle={`${stats.submitted} newly submitted`}
                color="rgb(146,169,129)"
              />
              <StatsCard
                icon={FiCheck}
                title="Approved"
                value={stats.approved}
                subtitle={`${stats.awarded} awarded`}
                color="rgb(9,76,9)"
              />
              <StatsCard
                icon={FiDollarSign}
                title="Total Awarded"
                value={`$${stats.totalAwarded.toLocaleString()}`}
                subtitle={`${stats.awarded} recipients`}
                color="rgb(218,165,32)"
              />
            </Box>
          )}

          {/* Enhanced Filters */}
          <Card bg="white" border="2px" borderColor="rgb(146,169,129)">
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* Primary Search Row */}
                <HStack spacing={4} wrap="wrap">
                  <Input
                    placeholder="🔍 Search by name, email, school, or major..."
                    value={filters.search || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      updateFilters({ search: newValue });
                      // Auto-apply search after a brief delay (debounce effect)
                      setTimeout(() => {
                        if (newValue === filters.search) {
                          // Value hasn't changed, apply the search
                          applyFilters();
                        }
                      }, 300);
                    }}
                    maxW="400px"
                    borderColor="rgb(146,169,129)"
                    _hover={{ borderColor: "rgb(92,127,66)" }}
                    _focus={{
                      borderColor: "rgb(9,76,9)",
                      boxShadow: "0 0 0 1px rgb(9,76,9)"
                    }}
                  />

                  <Box
                    as="select"
                    value={filters.status || ''}
                    onChange={(e) => {
                      updateFilters({ status: e.target.value || undefined });
                      setTimeout(() => applyFilters(), 100);
                    }}
                    p={2}
                    borderWidth="1px"
                    borderColor="rgb(146,169,129)"
                    borderRadius="md"
                    bg="white"
                    minW="150px"
                    _hover={{ borderColor: "rgb(92,127,66)" }}
                  >
                    <option value="">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="awarded">Awarded</option>
                  </Box>

                  <Button
                    bg="rgb(9,76,9)"
                    color="white"
                    size="md"
                    _hover={{ bg: "rgb(92,127,66)" }}
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </Button>
                </HStack>

                {/* Advanced Filters Row */}
                <HStack spacing={4} wrap="wrap">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xs" color="rgb(78,61,30)" fontWeight="medium">
                      Application Date From
                    </Text>
                    <Input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => updateFilters({ dateFrom: e.target.value || undefined })}
                      size="sm"
                      maxW="160px"
                      borderColor="rgb(146,169,129)"
                      _hover={{ borderColor: "rgb(92,127,66)" }}
                      _focus={{
                        borderColor: "rgb(9,76,9)",
                        boxShadow: "0 0 0 1px rgb(9,76,9)"
                      }}
                    />
                  </VStack>

                  <VStack align="start" spacing={1}>
                    <Text fontSize="xs" color="rgb(78,61,30)" fontWeight="medium">
                      Application Date To
                    </Text>
                    <Input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => updateFilters({ dateTo: e.target.value || undefined })}
                      size="sm"
                      maxW="160px"
                      borderColor="rgb(146,169,129)"
                      _hover={{ borderColor: "rgb(92,127,66)" }}
                      _focus={{
                        borderColor: "rgb(9,76,9)",
                        boxShadow: "0 0 0 1px rgb(9,76,9)"
                      }}
                    />
                  </VStack>

                  <VStack align="start" spacing={1} justify="end">
                    <Text fontSize="xs" color="transparent">
                      Clear
                    </Text>
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor="rgb(146,169,129)"
                      color="rgb(78,61,30)"
                      _hover={{ borderColor: "rgb(92,127,66)", bg: "rgb(193,212,178)" }}
                      onClick={() => {
                        updateFilters({ 
                          search: undefined, 
                          status: undefined, 
                          dateFrom: undefined, 
                          dateTo: undefined 
                        });
                        setTimeout(() => applyFilters(), 100);
                      }}
                    >
                      Clear All
                    </Button>
                  </VStack>
                </HStack>

                {/* Active Filters Display */}
                {(filters.search || filters.status || filters.dateFrom || filters.dateTo) && (
                  <HStack spacing={2} wrap="wrap">
                    <Text fontSize="xs" color="rgb(78,61,30)" fontWeight="medium">
                      Active Filters:
                    </Text>
                    {filters.search && (
                      <Badge bg="rgb(255,211,88)" color="rgb(78,61,30)" px={2} py={1}>
                        Search: &quot;{filters.search}&quot;
                      </Badge>
                    )}
                    {filters.status && (
                      <Badge bg="rgb(9,76,9)" color="white" px={2} py={1}>
                        Status: {filters.status.replace('_', ' ')}
                      </Badge>
                    )}
                    {filters.dateFrom && (
                      <Badge bg="rgb(146,169,129)" color="white" px={2} py={1}>
                        From: {new Date(filters.dateFrom).toLocaleDateString()}
                      </Badge>
                    )}
                    {filters.dateTo && (
                      <Badge bg="rgb(146,169,129)" color="white" px={2} py={1}>
                        To: {new Date(filters.dateTo).toLocaleDateString()}
                      </Badge>
                    )}
                  </HStack>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Applications List */}
          <Card bg="white" border="2px" borderColor="rgb(146,169,129)">
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md" color="rgb(61,84,44)">
                  Applications ({totalCount})
                </Heading>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              {error && (
                <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md" mb={4}>
                  <Text color="red.800">{error}</Text>
                </Box>
              )}

              {loading ? (
                <VStack spacing={4}>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} height="200px" width="100%" />
                  ))}
                </VStack>
              ) : applications.length === 0 ? (
                <Box textAlign="center" py={12}>
                  <Text color="rgb(78,61,30)" fontSize="lg">
                    No applications found
                  </Text>
                  <Text color="rgb(78,61,30)" opacity={0.8}>
                    Applications will appear here once students start applying
                  </Text>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {applications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
}

export default function ApplicationManagementPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <ApplicationsContent />
    </ProtectedRoute>
  );
}