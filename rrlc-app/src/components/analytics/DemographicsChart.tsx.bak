'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, Grid, Box, Text } from '@chakra-ui/react';

interface DemographicData {
  name: string;
  count: number;
}

interface DemographicsChartProps {
  schools: DemographicData[];
  majors: DemographicData[];
  states: DemographicData[];
}

// Natural color palette for pie charts
const SCHOOL_COLORS = [
  'rgb(9,76,9)',     // Deep green
  'rgb(61,84,44)',   // Dark forest green
  'rgb(146,169,129)', // Medium sage
  'rgb(255,211,88)',  // Golden yellow
  'rgb(197,155,60)',  // Warm gold
  'rgb(92,127,66)',   // Forest accent
  'rgb(78,61,30)',    // Warm brown
  'rgb(130,99,32)',   // Deep gold
];

const MAJOR_COLORS = [
  'rgb(255,211,88)',  // Golden yellow
  'rgb(197,155,60)',  // Warm gold
  'rgb(130,99,32)',   // Deep gold
  'rgb(9,76,9)',      // Deep green
  'rgb(61,84,44)',    // Dark forest green
  'rgb(146,169,129)', // Medium sage
  'rgb(92,127,66)',   // Forest accent
  'rgb(78,61,30)',    // Warm brown
];

const STATE_COLORS = [
  'rgb(146,169,129)', // Medium sage
  'rgb(92,127,66)',   // Forest accent
  'rgb(9,76,9)',      // Deep green
  'rgb(61,84,44)',    // Dark forest green
  'rgb(255,211,88)',  // Golden yellow
  'rgb(197,155,60)',  // Warm gold
  'rgb(130,99,32)',   // Deep gold
  'rgb(78,61,30)',    // Warm brown
];

function CustomPieChart({ 
  data, 
  colors, 
  title 
}: { 
  data: DemographicData[]; 
  colors: string[]; 
  title: string; 
}) {
  // Take only top 6 for better visualization
  const chartData = data.slice(0, 6);
  
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title fontSize="lg">{title}</Card.Title>
        <Card.Description>
          Top {chartData.length} by application count
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(193,212,178)',
                border: '1px solid rgb(146,169,129)',
                borderRadius: '8px',
                color: 'rgb(78,61,30)'
              }}
              formatter={(value: number) => [`${value} applications`, 'Count']}
            />
            <Legend 
              wrapperStyle={{ 
                color: 'rgb(78,61,30)', 
                fontSize: '12px',
                paddingTop: '10px'
              }}
              formatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card.Root>
  );
}

export default function DemographicsChart({ schools, majors, states }: DemographicsChartProps) {
  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" mb={4} color="rgb(78,61,30)">
        Applicant Demographics
      </Text>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
        <CustomPieChart 
          data={schools} 
          colors={SCHOOL_COLORS} 
          title="Top Schools"
        />
        <CustomPieChart 
          data={majors} 
          colors={MAJOR_COLORS} 
          title="Top Majors" 
        />
        <CustomPieChart 
          data={states} 
          colors={STATE_COLORS} 
          title="States" 
        />
      </Grid>
    </Box>
  );
}