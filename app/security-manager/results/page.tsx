"use client"

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Bell, User as UserIcon, Menu, LayoutDashboard, Server, BarChart } from "lucide-react"; // Removed ShieldCheck, Building, ListChecks, FileWarning, FileText
import type { User } from "@prisma/client"; // Import User type

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// --- Analytics Specific Types and Constants ---

// Define the expected structure of the fetched analytics data item
interface AnalyticsAssignment {
  id: string;
  complianceLevel: ComplianceLevel | null; // Can be null if not set
  control: {
    id: string;
    mainComponent: string;
    controlNumber: string;
  };
}

// Define the structure for processed data grouped by main component
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

// Define ComplianceLevel Enum based on Prisma schema
enum ComplianceLevel {
  NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
  PARTIALLY_IMPLEMENTED = "PARTIALLY_IMPLEMENTED",
  IMPLEMENTED = "IMPLEMENTED",
  NOT_APPLICABLE = "NOT_APPLICABLE",
}

// Mapping for display names (Arabic)
const complianceLevelLabels: Record<ComplianceLevel, string> = {
  [ComplianceLevel.NOT_IMPLEMENTED]: "غير مطبق",
  [ComplianceLevel.PARTIALLY_IMPLEMENTED]: "مطبق جزئيًا",
  [ComplianceLevel.IMPLEMENTED]: "مطبق كليًا",
  [ComplianceLevel.NOT_APPLICABLE]: "لا ينطبق",
};

// Define colors for consistency (adjust as needed)
const complianceLevelColors: Record<ComplianceLevel, string> = {
  [ComplianceLevel.NOT_IMPLEMENTED]: '#EF4444', // Red-500
  [ComplianceLevel.PARTIALLY_IMPLEMENTED]: '#F59E0B', // Amber-500
  [ComplianceLevel.IMPLEMENTED]: '#10B981', // Emerald-500
  [ComplianceLevel.NOT_APPLICABLE]: '#6B7280', // Gray-500
};

// Order for displaying levels in charts/legends
const complianceLevelOrder: ComplianceLevel[] = [
  ComplianceLevel.IMPLEMENTED,
  ComplianceLevel.PARTIALLY_IMPLEMENTED,
  ComplianceLevel.NOT_IMPLEMENTED,
  ComplianceLevel.NOT_APPLICABLE,
];

// --- Component ---

export default function SecurityManagerResultsPage() {
  // State for layout
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // State for analytics data
  const [userId, setUserId] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<ProcessedAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- User ID Fetch (Common logic) ---
  useEffect(() => {
    const fetchUserId = async () => {
      // Reset loading/error states related to analytics when user ID fetch starts
      setIsLoading(true);
      setError(null);
      setAnalyticsData(null);
      try {
        const response = await fetch('/api/users/security-managers');
        if (!response.ok) throw new Error('Failed to fetch security managers');
        const managers: User[] = await response.json();
        if (managers.length > 0) {
          setUserId(managers[0].id);
          // Keep setIsLoading(true) here, data fetching starts in the next effect
        } else {
          setError("No Security Manager user found.");
          setIsLoading(false); // Stop loading if no user found
        }
      } catch (err: unknown) { // Changed any to unknown
        console.error("Error fetching user ID:", err);
        const errorMsg = err instanceof Error ? err.message : "Failed to get user ID"; // Added type check
        setError(errorMsg);
        setIsLoading(false); // Stop loading on error
      }
    };
    fetchUserId();
  }, []);
  // --- End User ID Fetch ---

  // --- Analytics Data Fetch and Processing ---
  useEffect(() => {
    if (!userId) {
        // If userId is null (either initially or after failed fetch), don't attempt to fetch data
        if (!isLoading && !error) { // Only set loading false if it wasn't already set by error/no user
           // This case might not be strictly necessary if the initial state handles it
        }
        return;
    }


    const fetchAnalyticsData = async () => {
      // setIsLoading(true); // Already set true by userId fetch or initial state
      setError(null);
      setAnalyticsData(null);

      try {
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

      } catch (err: unknown) { // Changed any to unknown
        console.error("Error fetching or processing analytics data:", err);
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred."; // Added type check
        setError(errorMsg);
      } finally {
        setIsLoading(false); // Stop loading after fetch attempt (success or fail)
      }
    };

    fetchAnalyticsData();
  }, [userId, error, isLoading]); // Added error and isLoading to dependencies
  // --- End Analytics Data Fetch ---


  // --- Chart Options ---
  const mainComponents = analyticsData ? Object.keys(analyticsData).sort() : [];

  const stackedBarSeries = analyticsData ? complianceLevelOrder.map(level => ({
    name: complianceLevelLabels[level],
    data: mainComponents.map(component => analyticsData[component]?.percentages[level] || 0)
  })) : [];

  const stackedBarOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', stacked: true, stackType: '100%', toolbar: { show: true }, fontFamily: 'inherit' },
    plotOptions: { bar: { horizontal: false } },
    xaxis: { categories: mainComponents, labels: { style: { fontFamily: 'inherit' } } },
    yaxis: { labels: { formatter: (val) => `${val.toFixed(0)}%`, style: { fontFamily: 'inherit' } } },
    colors: complianceLevelOrder.map(level => complianceLevelColors[level]),
    legend: { position: 'top', horizontalAlign: 'center', fontFamily: 'inherit', markers: { offsetX: 5 } },
    tooltip: { y: { formatter: (val) => `${val.toFixed(1)}%` }, style: { fontFamily: 'inherit' } },
    dataLabels: { enabled: false },
    grid: { borderColor: '#e7e7e7', row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 } },
  };
  // --- End Chart Options ---


  // --- Render Logic ---
  const renderAnalyticsContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[calc(100vh-200px)]"> {/* Adjusted height */}
          <Loader2 className="h-8 w-8 animate-spin text-nca-teal" />
          <span className="mr-2">جاري تحميل البيانات...</span> {/* Use mr-2 for RTL */}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-[calc(100vh-200px)] text-red-600"> {/* Adjusted height */}
          <AlertCircle className="h-6 w-6" />
          <span className="mr-2">خطأ: {error}</span> {/* Use mr-2 for RTL */}
        </div>
      );
    }

    if (!analyticsData || mainComponents.length === 0) {
      return (
        <div className="text-center py-10 text-gray-600">
          لا توجد بيانات نتائج لعرضها.
        </div>
      );
    }

    // Actual chart rendering
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">نتائج الامتثال</h1>

        {/* Overall Stacked Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">نظرة عامة على الامتثال حسب المكون الرئيسي</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart options={stackedBarOptions} series={stackedBarSeries} type="bar" height={350} width="100%" />
          </CardContent>
        </Card>

        {/* Individual Doughnut Charts per Component */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <Card key={component}>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold truncate" title={component}>{component}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart options={doughnutOptions} series={doughnutSeries} type="donut" height={300} width="100%" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="w-full bg-slate-900 text-white py-3 px-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 font-bold text-sm md:text-base lg:text-lg">
            <div className="relative h-16 w-16">
              <Image src="/static/image/logo.png" width={160} height={160} alt="Logo" className="object-contain" />
            </div>
          </div>
          {/* Spacer */}
          <div className="flex-grow"></div>
          {/* User Icons & Toggle */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
              <UserIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700 md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-row">
        {/* Sidebar */}
        <aside className={`bg-slate-800 text-white p-4 sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto transition-all duration-300 ease-in-out hidden md:block ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
          <div className={`flex ${isSidebarOpen ? 'justify-end' : 'justify-center'} mb-4`}>
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          <nav className="space-y-2">
            {/* Sidebar Links - Copied from dashboard */}
            <Link href="/security-manager" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>لوحة المعلومات</span>
            </Link>
            {/* <Link href="/security-manager#assessments" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <ShieldCheck className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>التقييمات المعينة</span>
            </Link> */}
             <Link href="/security-manager/system-info" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <Server className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>معلومات الأنظمة</span>
            </Link>
            {/* <Link href="/security-manager/departments" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <Building className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>إدارة الأقسام</span>
            </Link> */}
            {/* <Link href="/security-manager#tasks" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <ListChecks className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>المهام</span>
            </Link> */}
            {/* <Link href="/security-manager#risks" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <FileWarning className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>المخاطر</span>
            </Link> */}
            {/* <Link href="/security-manager#reports" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <FileText className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>التقارير</span>
            </Link> */}
            <Link href="/security-manager/results" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <BarChart className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>النتائج</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 p-6 overflow-y-auto h-[calc(100vh-76px)] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:mr-0' : 'md:mr-20'}`}>
          {/* Render the analytics content, loading, or error state */}
          {renderAnalyticsContent()}
        </main>
      </div>
    </div>
  );
}
