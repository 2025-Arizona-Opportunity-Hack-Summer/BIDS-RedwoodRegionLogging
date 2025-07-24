'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, Text, Box, Flex } from '@chakra-ui/react';

interface EventData {
  name: string;
  capacity: number;
  registered: number;
  attended?: number;
  utilization: number;
}

interface EventAttendanceChartProps {
  data: EventData[];
  totalEvents: number;
  totalRegistrations: number;
  averageAttendance: number;
}

// Natural color palette for chart
const COLORS = {
  capacity: 'rgb(193,212,178)', // Light sage (background)
  registered: 'rgb(9,76,9)', // Deep green
  attended: 'rgb(255,211,88)', // Golden yellow
  grid: 'rgb(146,169,129)', // Medium sage
  background: 'rgb(193,212,178)' // Light sage
};

export default function EventAttendanceChart({ 
  data, 
  totalEvents, 
  totalRegistrations, 
  averageAttendance 
}: EventAttendanceChartProps) {
  // Process data for chart display - truncate long names
  const chartData = data.map(item => ({
    ...item,
    shortName: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name
  }));

  return (
    <Box>
      {/* Summary Stats */}
      <Flex gap={6} mb={6} wrap="wrap">
        <Box 
          bg="rgb(193,212,178)" 
          p={4} 
          borderRadius="lg" 
          border="1px solid rgb(146,169,129)"
        >
          <Text fontSize="2xl" fontWeight="bold" color="rgb(9,76,9)">
            {totalEvents}
          </Text>
          <Text fontSize="sm" color="rgb(78,61,30)">Total Events</Text>
        </Box>
        <Box 
          bg="rgb(193,212,178)" 
          p={4} 
          borderRadius="lg" 
          border="1px solid rgb(146,169,129)"
        >
          <Text fontSize="2xl" fontWeight="bold" color="rgb(9,76,9)">
            {totalRegistrations}
          </Text>
          <Text fontSize="sm" color="rgb(78,61,30)">Total Registrations</Text>
        </Box>
        <Box 
          bg="rgb(193,212,178)" 
          p={4} 
          borderRadius="lg" 
          border="1px solid rgb(146,169,129)"
        >
          <Text fontSize="2xl" fontWeight="bold" color="rgb(9,76,9)">
            {averageAttendance.toFixed(1)}
          </Text>
          <Text fontSize="sm" color="rgb(78,61,30)">Avg. Attendance</Text>
        </Box>
      </Flex>

      {/* Chart */}
      <Card.Root>
        <Card.Header>
          <Card.Title>Event Attendance & Capacity Utilization</Card.Title>
          <Card.Description>
            Registration vs. capacity by event
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} opacity={0.3} />
              <XAxis 
                dataKey="shortName" 
                tick={{ fill: 'rgb(78,61,30)', fontSize: 11 }}
                axisLine={{ stroke: COLORS.grid }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fill: 'rgb(78,61,30)', fontSize: 12 }}
                axisLine={{ stroke: COLORS.grid }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: COLORS.background,
                  border: `1px solid ${COLORS.grid}`,
                  borderRadius: '8px',
                  color: 'rgb(78,61,30)'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'capacity') return [`${value} spots`, 'Capacity'];
                  if (name === 'registered') return [`${value} registered`, 'Registered'];
                  if (name === 'utilization') return [`${value.toFixed(1)}%`, 'Utilization'];
                  return [value, name];
                }}
                labelFormatter={(label) => {
                  const fullName = data.find(item => item.shortName === label)?.name || label;
                  return `Event: ${fullName}`;
                }}
              />
              <Legend 
                wrapperStyle={{ color: 'rgb(78,61,30)' }}
              />
              <Bar 
                dataKey="capacity" 
                fill={COLORS.capacity}
                name="Capacity"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="registered" 
                fill={COLORS.registered}
                name="Registered"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}