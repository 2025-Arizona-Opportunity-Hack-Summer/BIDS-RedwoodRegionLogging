'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@chakra-ui/react';

interface StatusData {
  status: string;
  count: number;
  percentage: number;
}

interface ApplicationStatusChartProps {
  data: StatusData[];
}

// Natural color palette for chart
const COLORS = {
  primary: 'rgb(9,76,9)', // Deep green
  secondary: 'rgb(61,84,44)', // Dark forest green
  accent: 'rgb(146,169,129)', // Medium sage
  highlight: 'rgb(255,211,88)', // Golden yellow
  background: 'rgb(193,212,178)' // Light sage
};

export default function ApplicationStatusChart({ data }: ApplicationStatusChartProps) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Application Status Distribution</Card.Title>
        <Card.Description>
          Breakdown of applications by current status
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.accent} opacity={0.3} />
            <XAxis 
              dataKey="status" 
              tick={{ fill: 'rgb(78,61,30)', fontSize: 12 }}
              axisLine={{ stroke: COLORS.accent }}
            />
            <YAxis 
              tick={{ fill: 'rgb(78,61,30)', fontSize: 12 }}
              axisLine={{ stroke: COLORS.accent }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: COLORS.background,
                border: `1px solid ${COLORS.accent}`,
                borderRadius: '8px',
                color: 'rgb(78,61,30)'
              }}
              formatter={(value: number) => [
                `${value} applications`,
                'Count'
              ]}
              labelFormatter={(label) => `Status: ${label}`}
            />
            <Bar 
              dataKey="count" 
              fill={COLORS.primary}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card.Root>
  );
}