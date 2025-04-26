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

  // Prepare data for the chart, ensuring numbers are valid
  const chartData = data.map(item => ({
    name: item.name,
    'مُطبق': item.withCompliance || 0, // Controls with compliance level set
    'غير مُطبق': item.withoutCompliance || 0, // Controls without compliance level set
  }));

  return (
    <div className="mt-6 p-4 border rounded-lg shadow-sm bg-white" dir="rtl">
      <h3 className="text-lg font-semibold mb-4 text-center">تحليل الضوابط حسب المحور الرئيسي</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          layout="vertical" // Use vertical layout for better readability with long names
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={150} interval={0} /> {/* Adjust width as needed */}
          <Tooltip
            formatter={(value: number, name: string) => [`${value} ضابط`, name]}
            labelFormatter={(label: string) => `المحور: ${label}`}
          />
          <Legend
             formatter={(value: string) => {
                if (value === 'مُطبق') return 'ضوابط ذات مستوى امتثال';
                if (value === 'غير مُطبق') return 'ضوابط بدون مستوى امتثال';
                return value;
             }}
          />
          <Bar dataKey="مُطبق" stackId="a" fill="#22c55e" name="ضوابط ذات مستوى امتثال" /> {/* Green */}
          <Bar dataKey="غير مُطبق" stackId="a" fill="#facc15" name="ضوابط بدون مستوى امتثال" /> {/* Yellow */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SystemAnalyticsCharts;
