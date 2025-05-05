"use client"

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import type { User } from "@prisma/client"; // Assuming User type is needed

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
// Removed the window.resolve polyfill as it might be unnecessary and causing issues.

// --- Analytics Specific Types and Constants (Copied from results/page.tsx) ---
interface AnalyticsAssignment {
  id: string;
  complianceLevel: ComplianceLevel | null;
  control: {
    id: string;
    mainComponent: string;
    controlNumber: string;
  };
}

interface ComponentAnalytics {
  total: number;
  levels: {
    [key in ComplianceLevel]: number;
  };
  percentages: {
    [key in ComplianceLevel]: number;
  };
}

interface ProcessedAnalyticsData {
  [mainComponent: string]: ComponentAnalytics;
}

enum ComplianceLevel {
  NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
  PARTIALLY_IMPLEMENTED = "PARTIALLY_IMPLEMENTED",
  IMPLEMENTED = "IMPLEMENTED",
  NOT_APPLICABLE = "NOT_APPLICABLE",
}

const complianceLevelLabels: Record<ComplianceLevel, string> = {
  [ComplianceLevel.NOT_IMPLEMENTED]: "غير مطبق",
  [ComplianceLevel.PARTIALLY_IMPLEMENTED]: "مطبق جزئيًا",
  [ComplianceLevel.IMPLEMENTED]: "مطبق كليًا",
  [ComplianceLevel.NOT_APPLICABLE]: "لا ينطبق",
};

const complianceLevelColors: Record<ComplianceLevel, string> = {
  [ComplianceLevel.NOT_IMPLEMENTED]: '#EF4444', // Red-500
  [ComplianceLevel.PARTIALLY_IMPLEMENTED]: '#F59E0B', // Amber-500
  [ComplianceLevel.IMPLEMENTED]: '#10B981', // Emerald-500
  [ComplianceLevel.NOT_APPLICABLE]: '#6B7280', // Gray-500
};

const complianceLevelOrder: ComplianceLevel[] = [
  ComplianceLevel.IMPLEMENTED,
  ComplianceLevel.PARTIALLY_IMPLEMENTED,
  ComplianceLevel.NOT_IMPLEMENTED,
  ComplianceLevel.NOT_APPLICABLE,
];
// --- End Analytics Specific Types ---

interface GeneralResultsTabProps {
  user: User | null; // Pass user object as prop
  isAssessmentApproved: boolean; // Pass approval status
  isCheckingApproval: boolean; // Pass checking status
}

export function GeneralResultsTab({ user, isAssessmentApproved, isCheckingApproval }: GeneralResultsTabProps) {
  const [analyticsData, setAnalyticsData] = useState<ProcessedAnalyticsData | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // --- General Analytics Data Fetch (Triggered by user and approval status) ---
  useEffect(() => {
    // Don't fetch if user ID is not available or assessment is not approved yet
    if (!user?.id || !isAssessmentApproved) {
      if (analyticsData) setAnalyticsData(null);
      if (isAnalyticsLoading) setIsAnalyticsLoading(false); // Ensure loading stops if conditions not met
      return;
    }

    const userId = user.id;

    const fetchAnalyticsData = async () => {
      setIsAnalyticsLoading(true);
      setAnalyticsError(null);
      setAnalyticsData(null);

      try {
        console.log(`Fetching general analytics for user ID: ${userId}`);
        const response = await fetch(`/api/control-assignments/analytics?securityManagerId=${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch analytics data: ${response.statusText}`);
        }
        const rawAssignments: AnalyticsAssignment[] = await response.json();

        // Process the data
        const processedData: ProcessedAnalyticsData = {};
        rawAssignments.forEach(assignment => {
          const component = assignment.control.mainComponent;
          const level = assignment.complianceLevel;
          if (!component) return;
          if (!processedData[component]) {
            processedData[component] = {
              total: 0,
              levels: { [ComplianceLevel.NOT_IMPLEMENTED]: 0, [ComplianceLevel.PARTIALLY_IMPLEMENTED]: 0, [ComplianceLevel.IMPLEMENTED]: 0, [ComplianceLevel.NOT_APPLICABLE]: 0 },
              percentages: { [ComplianceLevel.NOT_IMPLEMENTED]: 0, [ComplianceLevel.PARTIALLY_IMPLEMENTED]: 0, [ComplianceLevel.IMPLEMENTED]: 0, [ComplianceLevel.NOT_APPLICABLE]: 0 }
            };
          }
          processedData[component].total++;
          if (level && complianceLevelLabels[level]) {
            processedData[component].levels[level]++;
          }
        });

        // Calculate percentages
        Object.keys(processedData).forEach(component => {
          const componentData = processedData[component];
          if (componentData.total > 0) {
            complianceLevelOrder.forEach(level => {
              componentData.percentages[level] = parseFloat(((componentData.levels[level] / componentData.total) * 100).toFixed(1));
            });
          }
        });

        setAnalyticsData(processedData);
      } catch (err: unknown) {
        console.error("Error fetching or processing analytics data:", err);
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred.";
        setAnalyticsError(errorMsg);
      } finally {
        setIsAnalyticsLoading(false);
      }
    };

    // Only fetch if approved and not already loading
    if (isAssessmentApproved && !isAnalyticsLoading) {
        fetchAnalyticsData();
    }
  // Depend on user and approval status
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAssessmentApproved]); 
  // --- End General Analytics Data Fetch ---

  // --- Chart Options ---
  const mainComponents = analyticsData ? Object.keys(analyticsData).sort() : [];

  const polarSeries = analyticsData
    ? mainComponents.map(
        (component) =>
          analyticsData[component]?.percentages[ComplianceLevel.IMPLEMENTED] || 0
      )
    : [];
  const polarOptions: ApexCharts.ApexOptions = {
    chart: { type: 'polarArea', fontFamily: 'inherit' },
    labels: mainComponents,
    fill: { opacity: 0.8 },
    stroke: { width: 1 },
    legend: { position: 'bottom', fontFamily: 'inherit' },
    tooltip: { y: { formatter: (val) => `${val.toFixed(1)}%` }, style: { fontFamily: 'inherit' } }
  };
  // --- End Chart Options ---

  // --- Render Logic ---
  if (isCheckingApproval) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-250px)]">
        <Loader2 className="h-8 w-8 animate-spin text-nca-teal" />
        <span className="mr-2">جاري التحقق من حالة الاعتماد...</span>
      </div>
    );
  }

  if (!isAssessmentApproved) {
    // Message handled in parent component, return null or minimal loader
    return null; 
  }

  if (isAnalyticsLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-250px)]">
        <Loader2 className="h-8 w-8 animate-spin text-nca-teal" />
        <span className="mr-2">جاري تحميل بيانات النتائج العامة...</span>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-250px)] text-red-600">
        <AlertCircle className="h-6 w-6" />
        <span className="mr-2">خطأ في تحميل النتائج العامة: {analyticsError}</span>
      </div>
    );
  }

  if (!analyticsData || mainComponents.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600">
        لا توجد بيانات نتائج عامة لعرضها.
      </div>
    );
  }

  // Actual chart rendering
  return (
    <div className="space-y-6 pt-4" dir="rtl">
      {/* Overall Polar Area Chart */}
      <Card className="shadow-md">
        <CardHeader className="bg-gray-50 rounded-t-lg">
          <CardTitle className="text-lg font-semibold text-slate-700">نظرة عامة على الامتثال حسب المكون الرئيسي (% المطبق كليًا)</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Chart options={polarOptions} series={polarSeries} type="polarArea" height={350} width="100%" />
        </CardContent>
      </Card>

      {/* Individual Doughnut Charts per Component */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mainComponents.map((component) => {
          const componentData = analyticsData[component];
          if (!componentData) return null;

          const doughnutSeries = complianceLevelOrder.map(level => componentData.levels[level]);
          const doughnutLabels = complianceLevelOrder.map(level => complianceLevelLabels[level]);
          const doughnutColors = complianceLevelOrder.map(level => complianceLevelColors[level]);

          const doughnutOptions: ApexCharts.ApexOptions = {
            chart: { type: 'donut', fontFamily: 'inherit' },
            labels: doughnutLabels,
            colors: doughnutColors,
            legend: { position: 'bottom', fontFamily: 'inherit' },
            tooltip: { y: { formatter: (val) => `${val} (${((val / componentData.total) * 100).toFixed(1)}%)` }, style: { fontFamily: 'inherit' } },
            dataLabels: { enabled: true, formatter: (val) => `${parseFloat(val as string).toFixed(1)}%`, style: { fontFamily: 'inherit' } },
            plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, label: 'الإجمالي', formatter: () => componentData.total.toString() } } } } },
            responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
          };

          return (
            <Card key={component} className="shadow-md">
              <CardHeader className="bg-gray-50 rounded-t-lg py-3 px-4">
                <CardTitle className="text-base font-semibold truncate text-slate-700" title={component}>{component}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Chart options={doughnutOptions} series={doughnutSeries} type="donut" height={300} width="100%" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
