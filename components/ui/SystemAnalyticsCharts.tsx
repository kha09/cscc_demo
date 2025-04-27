'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  name: string; // Main control name
  totalControls: number;
  withCompliance: number;
  withoutCompliance: number;
}

interface SystemAnalyticsChartsProps {
  data: ChartDataPoint[];
}

const SystemAnalyticsCharts: React.FC<SystemAnalyticsChartsProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">لا توجد بيانات لعرض الرسم البياني.</p>;
  }

  // Generate safe IDs for chart elements to avoid CSS selector issues
  const safeData = data.map((item, index) => ({
    ...item,
    // Use a simple index-based ID instead of the Arabic name to avoid selector issues
    safeId: `component-${index}`,
    // Keep the original name for display purposes
    displayName: item.name
  }));

  // Prepare data for the chart, ensuring numbers are valid
  const chartData = safeData.map(item => ({
    name: item.displayName,
    safeId: item.safeId,
    'implemented': item.withCompliance || 0, // Controls with compliance level set
    'notImplemented': item.withoutCompliance || 0, // Controls without compliance level set
  }));

  return (
    <div className="mt-6 p-4 border rounded-lg shadow-sm bg-white" dir="rtl">
      <h3 className="text-lg font-semibold mb-4 text-center">تحليل الضوابط حسب المكون الأساسي</h3>
      <ResponsiveContainer width="100%" height={400}>
          <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 200,     // Further increased left margin
            bottom: 5,
          }}
          layout="vertical" // Use vertical layout for better readability with long names
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={350} 
            interval={0}
            // Use the safe ID for internal references but display the original name
            tickFormatter={(value, index) => value}
          /> 
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'implemented') return [`${value} ضابط`, 'ضوابط ذات مستوى امتثال'];
              if (name === 'notImplemented') return [`${value} ضابط`, 'ضوابط بدون مستوى امتثال'];
              return [`${value}`, name];
            }}
            labelFormatter={(label: string) => `المكون الأساسي: ${label}`}
          />
          <Legend
             formatter={(value: string) => {
                if (value === 'implemented') return 'ضوابط ذات مستوى امتثال';
                if (value === 'notImplemented') return 'ضوابط بدون مستوى امتثال';
                return value;
             }}
          />
          <Bar dataKey="implemented" stackId="a" fill="#22c55e" name="implemented" /> {/* Green */}
          <Bar dataKey="notImplemented" stackId="a" fill="#facc15" name="notImplemented" /> {/* Yellow */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SystemAnalyticsCharts;
