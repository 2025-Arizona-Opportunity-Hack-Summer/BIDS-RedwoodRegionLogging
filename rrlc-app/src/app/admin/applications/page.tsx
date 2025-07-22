"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  Badge,
  Input,
  Skeleton,
} from "@chakra-ui/react";
import { Select as ChakraSelect } from "@chakra-ui/react";
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
    <Box bg="white" border="2px" borderColor="rgb(146,169,129)" borderRadius="md" p={4} boxShadow="sm">
      <Stack direction="row" gap={4} align="center">
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
        <Stack direction="column" gap={1} align="start">
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
        </Stack>
      </Stack>
    </Box>
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
    <Box bg="white" border="2px" borderColor="rgb(146,169,129)" borderRadius="md" p={6} boxShadow="sm">
      <Stack direction="column" gap={4} align="stretch">
        {/* Header */}
        <Stack direction="row" gap={4} justify="space-between" align="start">
          <Stack direction="column" align="start" gap={1}>
            <Heading size="md" color="rgb(61,84,44)">
              {application.first_name} {application.last_name}
            </Heading>
            <Text fontSize="sm" color="rgb(78,61,30)" opacity={0.8}>
              {application.scholarships?.name || 'Unknown Scholarship'}
            </Text>
          </Stack>
          <ApplicationStatusBadge status={application.status || ''} />
        </Stack>

        {/* Application Details */}
        <Stack direction="column" gap={2} align="stretch">
          <Stack direction="row" gap={4} justify="space-between">
            <Text fontSize="sm" color="rgb(78,61,30)">
              <strong>Email:</strong> {application.email}
            </Text>
            <Text fontSize="sm" color="rgb(78,61,30)">
              <strong>Phone:</strong> {application.phone}
            </Text>
          </Stack>
          <Stack direction="row" gap={4} justify="space-between">
            <Text fontSize="sm" color="rgb(78,61,30)">
              <strong>School:</strong> {application.school}
            </Text>
            <Text fontSize="sm" color="rgb(78,61,30)">
              <strong>Major:</strong> {application.major}
            </Text>
          </Stack>
          <Stack direction="row" gap={4} justify="space-between">
            <Text fontSize="sm" color="rgb(78,61,30)">
              <strong>GPA:</strong> {application.gpa || 'N/A'}
            </Text>
            <Text fontSize="sm" color="rgb(78,61,30)">
              <strong>Graduation:</strong> {application.graduation_year}
            </Text>
          </Stack>
          <Text fontSize="sm" color="rgb(78,61,30)">
            <strong>Applied:</strong> {new Date(application.created_at).toLocaleDateString()}
          </Text>
          {application.awarded_amount && (
            <Text fontSize="sm" color="rgb(9,76,9)" fontWeight="bold">
              <strong>Awarded:</strong> {formatCurrency(application.awarded_amount)}
            </Text>
          )}
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" gap={2} justify="flex-end">
          <Button
            size="sm"
            variant="ghost"
            color="rgb(9,76,9)"
            _hover={{ bg: "rgb(193,212,178)" }}
          >
            <Box as={FiEye} mr={2} />
            View Details
          </Button>
          {application.status === 'submitted' && (
            <Button
              size="sm"
              bg="rgb(146,169,129)"
              color="white"
              _hover={{ bg: "rgb(92,127,66)" }}
              onClick={() => handleStatusUpdate('under_review')}
              loading={updating}
            >
              <Box as={FiClock} mr={2} />
              Review
            </Button>
          )}
          {String(application.status) === 'under_review' && (
            <>
              <Button
                size="sm"
                bg="rgb(9,76,9)"
                color="white"
                _hover={{ bg: "rgb(92,127,66)" }}
                onClick={() => handleStatusUpdate('approved')}
                loading={updating}
              >
                <Box as={FiCheck} mr={2} />
                Approve
              </Button>
              <Button
                size="sm"
                bg="rgb(94,60,23)"
                color="white"
                _hover={{ bg: "rgb(78,61,30)" }}
                onClick={() => handleStatusUpdate('rejected')}
                loading={updating}
              >
                <Box as={FiX} mr={2} />
                Reject
              </Button>
            </>
          )}
          {String(application.status) === 'approved' && (
            <Button
              size="sm"
              bg="rgb(218,165,32)"
              color="white"
              _hover={{ bg: "rgb(184,134,11)" }}
              onClick={() => handleStatusUpdate('awarded')}
              loading={updating}
            >
              <Box as={FiDollarSign} mr={2} />
              Award
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
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
        <Stack direction="column" gap={8} align="stretch">
          {/* Header */}
          <Stack direction="row" gap={4} justify="space-between" align="center">
            <Box>
              <Heading size="2xl" color="rgb(61,84,44)" mb={2}>
                Application Management
              </Heading>
              <Text fontSize="lg" color="rgb(78,61,30)">
                Review and manage scholarship applications
              </Text>
            </Box>
            
            <Button
              bg="rgb(9,76,9)"
              color="white"
              size="lg"
              _hover={{ bg: "rgb(92,127,66)" }}
              onClick={handleExport}
              loading={exporting}
            >
              Export CSV
            </Button>
          </Stack>

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
          <Box bg="white" border="2px" borderColor="rgb(146,169,129)" borderRadius="md" p={6} boxShadow="sm">
            <Stack direction="column" gap={4} align="stretch">
                {/* Primary Search Row */}
                <Stack direction="row" gap={4} wrap="wrap">
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

                  <select
                    value={typeof filters.status === 'string' ? filters.status : ''}
                    onChange={(e) => {
                      updateFilters({ status: e.target.value || undefined });
                      setTimeout(() => applyFilters(), 100);
                    }}
                    style={{
                      padding: '8px',
                      borderWidth: '1px',
                      borderColor: 'rgb(146,169,129)',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      minWidth: '150px',
                      maxWidth: '200px',
                      fontSize: '16px',
                    }}
                  >
                    <option value="">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="awarded">Awarded</option>
                  </select>

                  <Button
                    bg="rgb(9,76,9)"
                    color="white"
                    size="md"
                    _hover={{ bg: "rgb(92,127,66)" }}
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </Button>
                </Stack>

                {/* Advanced Filters Row */}
                <Stack direction="row" gap={4} wrap="wrap">
                  <Stack direction="column" align="start" gap={1}>
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
                  </Stack>

                  <Stack direction="column" align="start" gap={1}>
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
                  </Stack>

                  <Stack direction="column" align="start" gap={1} justify="end">
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
                  </Stack>
                </Stack>

                {/* Active Filters Display */}
                {(filters.search || filters.status || filters.dateFrom || filters.dateTo) && (
                  <Stack direction="row" gap={2} wrap="wrap">
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
                  </Stack>
                )}
              </Stack>
            </Box>

          {/* Applications List */}
          <Box bg="white" border="2px" borderColor="rgb(146,169,129)" borderRadius="md" p={6} boxShadow="sm">
            <Box mb={4}>
              <Stack direction="row" gap={4} justify="space-between">
                <Heading size="md" color="rgb(61,84,44)">
                  Applications ({totalCount})
                </Heading>
              </Stack>
            </Box>
            <Box pt={0}>
              {error && (
                <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md" mb={4}>
                  <Text color="red.800">{error}</Text>
                </Box>
              )}

              {loading ? (
                <Stack direction="column" gap={4}>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} height="200px" width="100%" />
                  ))}
                </Stack>
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
                <Stack direction="column" gap={4} align="stretch">
                  {applications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </Stack>
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