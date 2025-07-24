'use client';

import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Button, 
  Card,
  Grid,
  Skeleton,
  Separator
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { TimeRange } from '@/services/analytics';
import ApplicationStatusChart from '@/components/analytics/ApplicationStatusChart';
import TrendLineChart from '@/components/analytics/TrendLineChart';
import ScholarshipImpactChart from '@/components/analytics/ScholarshipImpactChart';
import DemographicsChart from '@/components/analytics/DemographicsChart';
import EventAttendanceChart from '@/components/analytics/EventAttendanceChart';

export default function AnalyticsPage() {
  const { data, quickStats, loading, error, refreshData, setTimeRange } = useAnalytics();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    
    const now = new Date();
    let range: TimeRange | undefined;

    switch (period) {
      case 'month':
        range = {
          start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
        };
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        range = {
          start: new Date(now.getFullYear(), quarter * 3, 1).toISOString(),
          end: new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString()
        };
        break;
      case 'year':
        range = {
          start: new Date(now.getFullYear(), 0, 1).toISOString(),
          end: new Date(now.getFullYear(), 11, 31).toISOString()
        };
        break;
      default:
        range = undefined;
    }

    setTimeRange(range);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Box p={6}>
        <Skeleton height="40px" mb={4} />
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4} mb={6}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} height="120px" />
          ))}
        </Grid>
        <Skeleton height="400px" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Box 
          bg="rgb(254,226,226)" 
          border="1px solid rgb(254,178,178)" 
          borderRadius="md" 
          p={4} 
          mb={4}
        >
          <Text color="rgb(153,27,27)" fontWeight="bold">Error loading analytics data</Text>
          <Text color="rgb(153,27,27)">{error}</Text>
        </Box>
        <Button mt={4} onClick={refreshData} bg="rgb(9,76,9)" color="white">
          Try Again
        </Button>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={6}>
        <Text>No analytics data available.</Text>
        <Button mt={4} onClick={refreshData} colorScheme="green">
          Refresh
        </Button>
      </Box>
    );
  }

  // Transform event data for chart
  const eventChartData = data.eventAnalytics ? [{
    name: 'All Events',
    capacity: Math.round(data.eventAnalytics.totalRegistrations / (data.eventAnalytics.capacityUtilization / 100) || 0),
    registered: data.eventAnalytics.totalRegistrations,
    utilization: data.eventAnalytics.capacityUtilization
  }] : [];

  return (
    <Box p={6}>
      {/* Header */}
      <VStack align="stretch" mb={6}>
        <HStack justify="space-between" wrap="wrap">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="rgb(78,61,30)">
              Analytics Dashboard
            </Text>
            <Text color="rgb(78,61,30)" opacity={0.8}>
              Comprehensive insights into scholarship program performance
            </Text>
          </Box>
          <HStack gap={3}>
            <select
              value={selectedPeriod}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handlePeriodChange(e.target.value)}
              style={{
                width: '200px',
                padding: '8px 12px',
                backgroundColor: 'rgb(193,212,178)',
                border: '1px solid rgb(146,169,129)',
                borderRadius: '6px',
                color: 'rgb(78,61,30)',
                fontSize: '14px'
              }}
            >
              <option value="all">All Time</option>
              <option value="year">This Year</option>
              <option value="quarter">This Quarter</option>
              <option value="month">This Month</option>
            </select>
            <Button onClick={refreshData} colorScheme="green" size="sm">
              Refresh
            </Button>
          </HStack>
        </HStack>
      </VStack>

      {/* Quick Stats Cards */}
      {quickStats && (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4} mb={8}>
          <Card.Root bg="rgb(193,212,178)" borderColor="rgb(146,169,129)">
            <Card.Body>
              <VStack align="start" gap={2}>
                <Text fontSize="sm" color="rgb(78,61,30)" opacity={0.8}>
                  Total Applications
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="rgb(9,76,9)">
                  {quickStats.applications.total.toLocaleString()}
                </Text>
                <Text 
                  fontSize="sm" 
                  color={quickStats.applications.change >= 0 ? 'rgb(9,76,9)' : 'rgb(194,65,12)'}
                >
                  {formatPercentage(quickStats.applications.change)} from last month
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="rgb(193,212,178)" borderColor="rgb(146,169,129)">
            <Card.Body>
              <VStack align="start" gap={2}>
                <Text fontSize="sm" color="rgb(78,61,30)" opacity={0.8}>
                  Total Funding
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="rgb(9,76,9)">
                  {formatCurrency(quickStats.funding.total)}
                </Text>
                <Text 
                  fontSize="sm" 
                  color={quickStats.funding.change >= 0 ? 'rgb(9,76,9)' : 'rgb(194,65,12)'}
                >
                  {formatPercentage(quickStats.funding.change)} from last month
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="rgb(193,212,178)" borderColor="rgb(146,169,129)">
            <Card.Body>
              <VStack align="start" gap={2}>
                <Text fontSize="sm" color="rgb(78,61,30)" opacity={0.8}>
                  Success Rate
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="rgb(9,76,9)">
                  {quickStats.successRate.rate.toFixed(1)}%
                </Text>
                <Text 
                  fontSize="sm" 
                  color={quickStats.successRate.change >= 0 ? 'rgb(9,76,9)' : 'rgb(194,65,12)'}
                >
                  {formatPercentage(quickStats.successRate.change)} from last month
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="rgb(193,212,178)" borderColor="rgb(146,169,129)">
            <Card.Body>
              <VStack align="start" gap={2}>
                <Text fontSize="sm" color="rgb(78,61,30)" opacity={0.8}>
                  Active Events
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="rgb(9,76,9)">
                  {quickStats.events.total}
                </Text>
                <Text 
                  fontSize="sm" 
                  color={quickStats.events.change >= 0 ? 'rgb(9,76,9)' : 'rgb(194,65,12)'}
                >
                  {formatPercentage(quickStats.events.change)} from last month
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Grid>
      )}

      {/* Charts Section */}
      <VStack align="stretch" gap={8}>
        {/* Application Status and Trends */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          <ApplicationStatusChart data={data.statusDistribution} />
          <TrendLineChart 
            data={data.applicationTrends}
            title="Application Trends"
            description="Monthly application and award trends over time"
            showFunding={false}
          />
        </Grid>

        <Separator />

        {/* Scholarship Impact */}
        <ScholarshipImpactChart data={data.scholarshipImpact} />

        <Separator />

        {/* Demographics */}
        <DemographicsChart 
          schools={data.demographics.schools}
          majors={data.demographics.majors}
          states={data.demographics.states}
        />

        <Separator />

        {/* Event Analytics */}
        {data.eventAnalytics.totalEvents > 0 && (
          <EventAttendanceChart 
            data={eventChartData}
            totalEvents={data.eventAnalytics.totalEvents}
            totalRegistrations={data.eventAnalytics.totalRegistrations}
            averageAttendance={data.eventAnalytics.averageAttendance}
          />
        )}
      </VStack>
    </Box>
  );
}