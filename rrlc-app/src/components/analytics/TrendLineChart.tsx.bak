'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@chakra-ui/react';

interface TrendData {
  month: string;
  applications: number;
  awarded: number;
  funding: number;
}

interface TrendLineChartProps {
  data: TrendData[];
  title: string;
  description: string;
  showFunding?: boolean;
}

// Natural color palette for chart
const COLORS = {
  applications: 'rgb(9,76,9)', // Deep green
  awarded: 'rgb(255,211,88)', // Golden yellow
  funding: 'rgb(61,84,44)', // Dark forest green
  grid: 'rgb(146,169,129)', // Medium sage
  background: 'rgb(193,212,178)' // Light sage
};

export default function TrendLineChart({ 
  data, 
  title, 
  description, 
  showFunding = false 
}: TrendLineChartProps) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
        <Card.Description>{description}</Card.Description>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} opacity={0.3} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'rgb(78,61,30)', fontSize: 12 }}
              axisLine={{ stroke: COLORS.grid }}
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
            />
            <Legend 
              wrapperStyle={{ color: 'rgb(78,61,30)' }}
            />
            <Line
              type="monotone"
              dataKey="applications"
              stroke={COLORS.applications}
              strokeWidth={3}
              dot={{ fill: COLORS.applications, strokeWidth: 2, r: 4 }}
              name="Applications"
            />
            <Line
              type="monotone"
              dataKey="awarded"
              stroke={COLORS.awarded}
              strokeWidth={3}
              dot={{ fill: COLORS.awarded, strokeWidth: 2, r: 4 }}
              name="Awarded"
            />
            {showFunding && (
              <Line
                type="monotone"
                dataKey="funding"
                stroke={COLORS.funding}
                strokeWidth={3}
                dot={{ fill: COLORS.funding, strokeWidth: 2, r: 4 }}
                name="Funding ($)"
                yAxisId="right"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card.Root>
  );
}