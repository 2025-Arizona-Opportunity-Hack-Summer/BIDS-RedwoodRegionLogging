"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Input,
  Card,
  Skeleton,
} from "@chakra-ui/react";
import { FiPlus, FiEdit3, FiTrash2, FiEye } from "react-icons/fi";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useScholarships } from "@/hooks/useScholarships";
import { Scholarship } from "@/types/database";

function ScholarshipTableSkeleton() {
  return (
    <Card.Root bg="white" border="2px" borderColor="rgb(146,169,129)">
      <Card.Body>
        <VStack gap={4}>
          {[...Array(5)].map((_, i) => (
            <HStack key={i} w="full" gap={4}>
              <Skeleton height="20px" width="200px" />
              <Skeleton height="20px" width="100px" />
              <Skeleton height="20px" width="150px" />
              <Skeleton height="20px" width="100px" />
              <Skeleton height="20px" width="120px" />
            </HStack>
          ))}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

function ScholarshipBadge({ status }: { status: string }) {
  const colorMap = {
    active: { bg: "rgb(9,76,9)", color: "white" },
    inactive: { bg: "rgb(146,169,129)", color: "white" },
    closed: { bg: "rgb(78,61,30)", color: "white" }
  };

  const colors = colorMap[status as keyof typeof colorMap] || colorMap.inactive;

  return (
    <Badge
      bg={colors.bg}
      color={colors.color}
      px={3}
      py={1}
      borderRadius="full"
      textTransform="capitalize"
      fontWeight="medium"
    >
      {status}
    </Badge>
  );
}


function ScholarshipManagementContent() {
  const { scholarships, loading, deleteScholarship } = useScholarships();
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter scholarships based on search query
  const filteredScholarships = scholarships.filter(scholarship =>
    scholarship.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scholarship.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ""
  );

  const handleDelete = async (scholarship: Scholarship) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the scholarship "${scholarship.name}"? This action will set it to inactive and it can be reactivated later.`
    );
    
    if (!confirmed) return;

    setDeletingId(scholarship.id);
    try {
      await deleteScholarship(scholarship.id);
      alert("Scholarship deleted successfully.");
    } catch {
      alert("Failed to delete scholarship. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "No deadline";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <HStack justify="space-between" align="center">
            <Box>
              <Heading
                size="2xl"
                color="rgb(61,84,44)"
                mb={2}
              >
                Scholarship Management
              </Heading>
              <Text
                fontSize="lg"
                color="rgb(78,61,30)"
              >
                Manage all scholarship opportunities
              </Text>
            </Box>
            
            <Link href="/admin/scholarships/new">
              <Button
                bg="rgb(9,76,9)"
                color="white"
                size="lg"
                _hover={{ bg: "rgb(92,127,66)" }}
                boxShadow="md"
                _active={{ transform: "translateY(1px)" }}
              >
                <FiPlus style={{ marginRight: '8px' }} />
                Create Scholarship
              </Button>
            </Link>
          </HStack>

          {/* Search and Filters */}
          <Card.Root bg="white" border="2px" borderColor="rgb(146,169,129)" boxShadow="md">
            <Card.Body>
              <HStack gap={4}>
                <Input
                  placeholder="🔍 Search scholarships..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  maxW="400px"
                  borderColor="rgb(146,169,129)"
                  _hover={{ borderColor: "rgb(92,127,66)" }}
                  _focus={{
                    borderColor: "rgb(9,76,9)",
                    boxShadow: "0 0 0 1px rgb(9,76,9)"
                  }}
                />
                
              </HStack>
            </Card.Body>
          </Card.Root>


          {/* Table */}
          {loading ? (
            <ScholarshipTableSkeleton />
          ) : (
            <Card.Root bg="white" border="2px" borderColor="rgb(146,169,129)" boxShadow="md">
              <Card.Body p={0}>
                {filteredScholarships.length === 0 ? (
                  <Box textAlign="center" py={12}>
                    <Text color="rgb(78,61,30)" fontSize="lg" mb={4}>
                      {searchQuery ? "No scholarships found matching your search." : "No scholarships created yet."}
                    </Text>
                    {!searchQuery && (
                      <Link href="/admin/scholarships/new">
                        <Button
                          bg="rgb(9,76,9)"
                          color="white"
                          _hover={{ bg: "rgb(92,127,66)" }}
                        >
                          Create Your First Scholarship
                        </Button>
                      </Link>
                    )}
                  </Box>
                ) : (
                  <VStack gap={4} align="stretch">
                    {filteredScholarships.map((scholarship) => (
                      <Card.Root
                        key={scholarship.id}
                        bg="white"
                        border="1px"
                        borderColor="rgb(146,169,129)"
                        _hover={{
                          borderColor: "rgb(92,127,66)",
                          boxShadow: "md",
                          transform: "translateY(-1px)"
                        }}
                        transition="all 0.2s"
                      >
                        <Card.Body>
                          <HStack justify="space-between" align="start">
                            {/* Scholarship Info */}
                            <VStack align="start" gap={2} flex={1}>
                              <HStack justify="space-between" w="full">
                                <Heading size="md" color="rgb(61,84,44)">
                                  {scholarship.name}
                                </Heading>
                                <ScholarshipBadge status={scholarship.status} />
                              </HStack>
                              
                              {scholarship.description && (
                                <Text
                                  color="rgb(78,61,30)"
                                  opacity={0.8}
                                >
                                  {scholarship.description}
                                </Text>
                              )}
                              
                              <HStack gap={6}>
                                <VStack align="start" gap={1}>
                                  <Text fontSize="sm" color="rgb(78,61,30)" fontWeight="medium">
                                    Award Amount
                                  </Text>
                                  <Text fontWeight="bold" color="rgb(9,76,9)" fontSize="lg">
                                    {formatCurrency(scholarship.amount)}
                                  </Text>
                                </VStack>
                                
                                <VStack align="start" gap={1}>
                                  <Text fontSize="sm" color="rgb(78,61,30)" fontWeight="medium">
                                    Deadline
                                  </Text>
                                  <Text color="rgb(78,61,30)">
                                    {formatDate(scholarship.deadline)}
                                  </Text>
                                </VStack>
                              </HStack>
                            </VStack>
                            
                            {/* Actions */}
                            <HStack gap={2}>
                              <Link href={`/admin/scholarships/${scholarship.id}`}>
                                <IconButton
                                  aria-label="View scholarship"
                                  size="sm"
                                  variant="ghost"
                                  color="rgb(9,76,9)"
                                  _hover={{ bg: "rgb(193,212,178)" }}
                                >
                                  <FiEye />
                                </IconButton>
                              </Link>
                              <Link href={`/admin/scholarships/${scholarship.id}/edit`}>
                                <IconButton
                                  aria-label="Edit scholarship"
                                  size="sm"
                                  variant="ghost"
                                  color="rgb(255,211,88)"
                                  _hover={{ bg: "rgb(193,212,178)" }}
                                >
                                  <FiEdit3 />
                                </IconButton>
                              </Link>
                              <IconButton
                                aria-label="Delete scholarship"
                                size="sm"
                                variant="ghost"
                                color="rgb(94,60,23)"
                                _hover={{ bg: "rgb(193,212,178)" }}
                                onClick={() => handleDelete(scholarship)}
                                loading={deletingId === scholarship.id}
                              >
                                <FiTrash2 />
                              </IconButton>
                            </HStack>
                          </HStack>
                        </Card.Body>
                      </Card.Root>
                    ))}
                  </VStack>
                )}
              </Card.Body>
            </Card.Root>
          )}
        </VStack>
      </Box>
    </Box>
  );
}

export default function ScholarshipManagementPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <ScholarshipManagementContent />
    </ProtectedRoute>
  );
} 