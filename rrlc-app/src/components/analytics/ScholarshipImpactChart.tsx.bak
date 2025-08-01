'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@chakra-ui/react';

interface ScholarshipData {
  name: string;
  applications: number;
  awarded: number;
  totalFunding: number;
  successRate: number;
}

interface ScholarshipImpactChartProps {
  data: ScholarshipData[];
}

// Natural color palette for chart
const COLORS = {
  applications: 'rgb(146,169,129)', // Medium sage
  awarded: 'rgb(9,76,9)', // Deep green
  funding: 'rgb(255,211,88)', // Golden yellow
  grid: 'rgb(146,169,129)', // Medium sage
  background: 'rgb(193,212,178)' // Light sage
};

export default function ScholarshipImpactChart({ data }: ScholarshipImpactChartProps) {
  // Process data for chart display - truncate long names
  const chartData = data.map(item => ({
    ...item,
    shortName: item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name
  }));

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Scholarship Impact Analysis</Card.Title>
        <Card.Description>
          Applications vs. awards by scholarship program
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={400}>
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
                if (name === 'applications') return [`${value} applications`, 'Applications'];
                if (name === 'awarded') return [`${value} awarded`, 'Awarded'];
                if (name === 'totalFunding') return [`$${value.toLocaleString()}`, 'Total Funding'];
                return [value, name];
              }}
              labelFormatter={(label) => {
                const fullName = data.find(item => item.shortName === label)?.name || label;
                return `Scholarship: ${fullName}`;
              }}
            />
            <Legend 
              wrapperStyle={{ color: 'rgb(78,61,30)' }}
            />
            <Bar 
              dataKey="applications" 
              fill={COLORS.applications}
              name="Applications"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="awarded" 
              fill={COLORS.awarded}
              name="Awarded"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card.Root>
  );
}