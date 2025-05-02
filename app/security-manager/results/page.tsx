"use client"

import { useState, useEffect, Suspense } from "react";
import dynamic from 'next/dynamic';
// import Image from "next/image"; // Removed, AppHeader handles logo
import Link from "next/link";
import { useAuth } from "@/lib/auth-context"; // Import useAuth
import { AppHeader } from "@/components/ui/AppHeader"; // Import shared header
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, Menu, LayoutDashboard, Server, BarChart, Building, CheckCircle, XCircle as _XCircle, AlertTriangle as _AlertTriangle, MinusCircle, ChevronDown, ChevronUp, User as _UserIcon } from "lucide-react"; // Prefixed unused imports with underscore
import { TaskStatus } from "@prisma/client";
import type { User as _User } from "@prisma/client"; // Prefixed with underscore to avoid unused type error
import SystemAnalyticsCharts from "@/components/ui/SystemAnalyticsCharts"; // Import the new chart component

// Add TypeScript declaration for window.resolve
declare global {
  interface Window {
    resolve?: (url: string) => string;
  }
}

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => 
  import('react-apexcharts').then(mod => {
    // Add a global polyfill for resolve if it doesn't exist
    if (typeof window !== 'undefined' && !window.resolve) {
      window.resolve = function(url: string): string {
        return url;
      };
    }
    return mod;
  }),
  { ssr: false }
);

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

// Define ComplianceLevel Enum based on Prisma schema (Keep existing)
enum ComplianceLevel {
  NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
  PARTIALLY_IMPLEMENTED = "PARTIALLY_IMPLEMENTED",
  IMPLEMENTED = "IMPLEMENTED",
  NOT_APPLICABLE = "NOT_APPLICABLE",
}

// Mapping for display names (Arabic) (Keep existing)
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
const complianceLevelOrder: ComplianceLevel[] = [ // Keep this for the general analytics tab
  ComplianceLevel.IMPLEMENTED,
  ComplianceLevel.PARTIALLY_IMPLEMENTED,
  ComplianceLevel.NOT_IMPLEMENTED,
  ComplianceLevel.NOT_APPLICABLE,
];

// --- Detailed Analytics Types (for the new API endpoint) ---
interface DetailedAssignmentData {
  id: string;
  status: TaskStatus; // Use imported TaskStatus
  complianceLevel: ComplianceLevel | null;
  assignedUserId: string | null;
  control: {
    id: string;
    mainComponent: string;
    subComponent: string | null;
    controlNumber: string;
    controlText: string;
  };
}

// Structure for chart data points (as defined in the API)
interface ChartDataPoint {
  name: string; // Main control name
  totalControls: number;
  withCompliance: number;
  withoutCompliance: number;
} // <-- Add missing closing brace

interface DetailedSystemAnalyticsResponse {
  systemName: string;
  assignments: DetailedAssignmentData[];
  chartData: ChartDataPoint[]; // Expect chart data from the API
}

// Structure for processed detailed data, grouped by main component
interface MainComponentDetailedAnalytics {
  subControls: DetailedAssignmentData[];
  counts: {
    total: number;
    finished: number; // Status = DONE
    assigned: number; // assignedUserId is not null AND status != DONE
    notAssigned: number; // assignedUserId is null
    // Add compliance level counts if needed later
  };
}

interface ProcessedDetailedAnalytics {
  [mainComponent: string]: MainComponentDetailedAnalytics;
}


// --- Component ---

// Client component that uses searchParams
function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "detailed" ? "detailed" : 
                   tabParam === "overall" ? "overall" : "general";
  
  // State for layout
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auth state
  const { user, loading: authLoading } = useAuth();

  // State for overall analytics
  // State for overall analytics (General Results Tab)
  const [analyticsData, setAnalyticsData] = useState<ProcessedAnalyticsData | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true); // Loading for general analytics
  const [analyticsError, setAnalyticsError] = useState<string | null>(null); // Error for general analytics

  // State for assessment data (Overall Compliance Tab)
  const [assessment, setAssessment] = useState<any>(null);
  const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  
  // State for sensitive systems count (Overall Compliance Tab)
  const [systemsCount, setSystemsCount] = useState<number>(0);
  const [isSystemsCountLoading, setIsSystemsCountLoading] = useState(false);
  const [systemsCountError, setSystemsCountError] = useState<string | null>(null);
  
  // State for compliance counts (Overall Compliance Tab)
  const [complianceCounts, setComplianceCounts] = useState<Record<ComplianceLevel, number>>({
    [ComplianceLevel.IMPLEMENTED]: 0,
    [ComplianceLevel.PARTIALLY_IMPLEMENTED]: 0,
    [ComplianceLevel.NOT_IMPLEMENTED]: 0,
    [ComplianceLevel.NOT_APPLICABLE]: 0
  });
  const [isComplianceCountsLoading, setIsComplianceCountsLoading] = useState(false);
  const [complianceCountsError, setComplianceCountsError] = useState<string | null>(null);

  // State for detailed results (Detailed Results Tab)
  // Define SensitiveSystemInfo interface based on expected API response structure
  interface SensitiveSystemInfo {
    id: string;
    systemName: string;
    systemDescription?: string | null;
    department?: {
      id: string;
      name: string;
      manager?: {
        id: string;
        name: string;
      } | null;
    } | null;
    // Add other relevant fields as needed from your API
  }
  const [systems, setSystems] = useState<SensitiveSystemInfo[]>([]);
  const [isSystemsLoading, setIsSystemsLoading] = useState(false); // Start false, trigger on user ID
  const [systemsError, setSystemsError] = useState<string | null>(null);

  // State for summary analytics per system (for the cards)
  interface SystemSummaryAnalytics {
    assigned: number;
    finished: number;
    // delayed: number; // Omitted for now
  }
  const [systemAnalytics, setSystemAnalytics] = useState<Record<string, SystemSummaryAnalytics>>({});
  const [isSystemAnalyticsLoading, setIsSystemAnalyticsLoading] = useState(false); // Single loading state for all system summaries
  const [systemAnalyticsError, setSystemAnalyticsError] = useState<string | null>(null);

  // State for detailed view when a system is selected
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [selectedSystemDetails, setSelectedSystemDetails] = useState<ProcessedDetailedAnalytics | null>(null);
  const [selectedSystemChartData, setSelectedSystemChartData] = useState<ChartDataPoint[] | null>(null); // State for chart data
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [expandedMainComponents, setExpandedMainComponents] = useState<Record<string, boolean>>({});

  // --- User ID Fetch --- Removed
  // useEffect(() => {
  //   const fetchUserId = async () => {
  //     // Reset states on new fetch attempt
  //     setIsAnalyticsLoading(true);
  //     setAnalyticsError(null);
  //     setAnalyticsData(null);
  //     setIsSystemsLoading(false); // Don't start system loading yet
  //     setSystemsError(null);
  //     setSystems([]);
  //     try {
  //       const response = await fetch('/api/users/security-managers');
  //       if (!response.ok) throw new Error('Failed to fetch security managers');
  //       const managers: User[] = await response.json();
  //       if (managers.length > 0) {
  //         setUserId(managers[0].id);
  //         // Analytics and Systems fetching will be triggered by userId change in their respective useEffects
  //       } else {
  //         const errorMsg = "No Security Manager user found.";
  //         setAnalyticsError(errorMsg);
  //         setSystemsError(errorMsg); // Also set systems error
  //         setIsAnalyticsLoading(false);
  //         setIsSystemsLoading(false);
  //       }
  //     } catch (err: unknown) {
  //       console.error("Error fetching user ID:", err);
  //       const errorMsg = err instanceof Error ? err.message : "Failed to get user ID";
  //       setAnalyticsError(errorMsg);
  //       setSystemsError(errorMsg); // Also set systems error
  //       setIsAnalyticsLoading(false);
  //       setIsSystemsLoading(false);
  //     }
  //   };
  //   fetchUserId();
  // }, []);
  // --- End User ID Fetch --- Removed


  // --- Assessment Data Fetch (Triggered by user) ---
  useEffect(() => {
    if (!user?.id) {
      if (assessment) setAssessment(null);
      if (isAssessmentLoading) setIsAssessmentLoading(false);
      return;
    }

    const userId = user.id;

    const fetchAssessment = async () => {
      setIsAssessmentLoading(true);
      setAssessmentError(null);
      setAssessment(null);

      try {
        console.log(`Fetching assessments for user ID: ${userId}`);
        const response = await fetch(`/api/users/${userId}/assessments`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch assessments: ${response.statusText}`);
        }
        
        const assessments = await response.json();
        if (assessments.length > 0) {
          // Get the first assessment
          setAssessment(assessments[0]);
          
          // Fetch sensitive systems and compliance counts for this assessment
          fetchSensitiveSystemsCount(assessments[0].id);
          fetchComplianceCounts(assessments[0].id);
        } else {
          setAssessmentError("لا توجد تقييمات متاحة");
        }
      } catch (err) {
        console.error("Error fetching assessment:", err);
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred.";
        setAssessmentError(errorMsg);
      } finally {
        setIsAssessmentLoading(false);
      }
    };

    fetchAssessment();
  }, [user]);
  // --- End Assessment Data Fetch ---

  // --- Sensitive Systems Count Fetch ---
  const fetchSensitiveSystemsCount = async (assessmentId: string) => {
    if (!assessmentId) return;
    
    setIsSystemsCountLoading(true);
    setSystemsCountError(null);
    
    try {
      console.log(`Fetching sensitive systems for assessment ID: ${assessmentId}`);
      const response = await fetch(`/api/assessments/${assessmentId}/sensitive-systems`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch sensitive systems: ${response.statusText}`);
      }
      
      const systems = await response.json();
      setSystemsCount(systems.length);
    } catch (err) {
      console.error("Error fetching sensitive systems count:", err);
      const errorMsg = err instanceof Error ? err.message : "An unknown error occurred.";
      setSystemsCountError(errorMsg);
    } finally {
      setIsSystemsCountLoading(false);
    }
  };
  // --- End Sensitive Systems Count Fetch ---

  // --- Compliance Counts Fetch ---
  const fetchComplianceCounts = async (assessmentId: string) => {
    if (!assessmentId) return;
    
    setIsComplianceCountsLoading(true);
    setComplianceCountsError(null);
    
    try {
      console.log(`Fetching compliance counts for assessment ID: ${assessmentId}`);
      const response = await fetch(`/api/control-assignments/analytics?assessmentId=${assessmentId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch compliance counts: ${response.statusText}`);
      }
      
      const assignments = await response.json();
      
      // Initialize counts
      const counts = {
        [ComplianceLevel.IMPLEMENTED]: 0,
        [ComplianceLevel.PARTIALLY_IMPLEMENTED]: 0,
        [ComplianceLevel.NOT_IMPLEMENTED]: 0,
        [ComplianceLevel.NOT_APPLICABLE]: 0
      };
      
      // Count assignments by compliance level
      assignments.forEach((assignment: AnalyticsAssignment) => {
        if (assignment.complianceLevel) {
          counts[assignment.complianceLevel]++;
        }
      });
      
      setComplianceCounts(counts);
    } catch (err) {
      console.error("Error fetching compliance counts:", err);
      const errorMsg = err instanceof Error ? err.message : "An unknown error occurred.";
      setComplianceCountsError(errorMsg);
    } finally {
      setIsComplianceCountsLoading(false);
    }
  };
  // --- End Compliance Counts Fetch ---

  // --- General Analytics Data Fetch (Triggered by user) ---
  useEffect(() => {
    if (!user?.id) {
      // Don't fetch if user ID is not available
      // Ensure loading is false if user becomes null after being set
      if (analyticsData) setAnalyticsData(null); // Clear old data if user resets
      if (isAnalyticsLoading) setIsAnalyticsLoading(false);
      return;
    }

    const userId = user.id; // Use authenticated user's ID

    const fetchAnalyticsData = async () => {
      setIsAnalyticsLoading(true); // Start loading for analytics
      setAnalyticsError(null);
      // setAnalyticsData(null); // Keep previous data while loading? Or clear? Let's clear.
      setAnalyticsData(null);

      try {
        console.log(`Fetching general analytics for user ID: ${userId}`);
        const response = await fetch(`/api/control-assignments/analytics?securityManagerId=${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch analytics data: ${response.statusText}`);
        }
        // --- Start of correct logic ---
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
        // --- End of correct logic ---

      } catch (err: unknown) { // Changed any to unknown
        console.error("Error fetching or processing analytics data:", err);
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred."; // Added type check
        setAnalyticsError(errorMsg);
      } finally {
        setIsAnalyticsLoading(false);
      }
    };

    fetchAnalyticsData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Dependency: user object
  // --- End General Analytics Data Fetch ---


  // --- Systems List Fetch (Triggered by user) ---
  useEffect(() => {
    if (!user?.id) {
      // Don't fetch if user ID is not available
      if (systems.length > 0) setSystems([]); // Clear old data if user resets
      if (isSystemsLoading) setIsSystemsLoading(false);
      return;
    }

    const userId = user.id; // Use authenticated user's ID

    const fetchSystems = async () => {
      setIsSystemsLoading(true);
      setSystemsError(null);
      setSystems([]); // Clear previous systems

      try {
        console.log(`Fetching systems for user ID: ${userId}`);
        const response = await fetch(`/api/users/${userId}/sensitive-systems`); // Use authenticated user ID
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch systems: ${response.statusText}`);
        }
        const fetchedSystems: SensitiveSystemInfo[] = await response.json();
        setSystems(fetchedSystems);
      } catch (err: unknown) {
        console.error("Error fetching systems:", err);
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred while fetching systems.";
        setSystemsError(errorMsg);
      } finally {
        setIsSystemsLoading(false);
      }
    };

    fetchSystems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Dependency: user object
  // --- End Systems List Fetch ---


  // --- System Summary Analytics Fetch (Triggered by user) ---
  useEffect(() => {
    if (!user?.id) {
      if (Object.keys(systemAnalytics).length > 0) setSystemAnalytics({}); // Clear old data
      if (isSystemAnalyticsLoading) setIsSystemAnalyticsLoading(false);
      return;
    }

    const userId = user.id; // Use authenticated user's ID

    const fetchSystemAnalytics = async () => {
      setIsSystemAnalyticsLoading(true);
      setSystemAnalyticsError(null);
      setSystemAnalytics({}); // Clear previous data

      try {
        console.log(`Fetching system summary analytics for user ID: ${userId}`);
        // Use the new dedicated endpoint for summary counts
        const response = await fetch(`/api/control-assignments/analytics/summary-by-system?securityManagerId=${userId}`); // Use authenticated user ID
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch system summary analytics: ${response.statusText}`);
        }
        const fetchedAnalytics: Record<string, SystemSummaryAnalytics> = await response.json();
        setSystemAnalytics(fetchedAnalytics);
      } catch (err: unknown) {
        console.error("Error fetching system summary analytics:", err);
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred while fetching system analytics.";
        setSystemAnalyticsError(errorMsg); // Use the dedicated error state
      } finally {
        setIsSystemAnalyticsLoading(false);
      }
    };

    fetchSystemAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Dependency: user object
  // --- End System Summary Analytics Fetch ---


  // --- Detailed System Analytics Fetch (Triggered by selectedSystemId and user) ---
  useEffect(() => {
    if (!selectedSystemId || !user?.id) { // Check user.id as well
      setSelectedSystemDetails(null);
      setSelectedSystemChartData(null); // Clear chart data too
      setDetailsError(null);
      if (isDetailsLoading) setIsDetailsLoading(false);
      setExpandedMainComponents({});
      return;
    }

    const userId = user.id; // Use authenticated user's ID

    const fetchDetailedAnalytics = async () => {
      setIsDetailsLoading(true);
      setDetailsError(null);
      setSelectedSystemDetails(null);
      setSelectedSystemChartData(null); // Clear previous chart data
      setExpandedMainComponents({});

      try {
        console.log(`Fetching detailed analytics for system ID: ${selectedSystemId}, user ID: ${userId}`);
        const response = await fetch(`/api/control-assignments/analytics/by-system/${selectedSystemId}?securityManagerId=${userId}`); // Use authenticated user ID
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch detailed analytics: ${response.statusText}`);
        }
        const rawData: DetailedSystemAnalyticsResponse = await response.json();

        // Process the detailed data
        const processed: ProcessedDetailedAnalytics = {};
        rawData.assignments.forEach(assignment => {
          const mainComponent = assignment.control.mainComponent;
          if (!processed[mainComponent]) {
            processed[mainComponent] = {
              subControls: [],
              counts: { total: 0, finished: 0, assigned: 0, notAssigned: 0 }
            };
          }
          processed[mainComponent].subControls.push(assignment);
          processed[mainComponent].counts.total++;

          if (assignment.status === TaskStatus.COMPLETED) { // Correct enum member
            processed[mainComponent].counts.finished++;
          } else if (assignment.assignedUserId) {
            processed[mainComponent].counts.assigned++;
          } else {
            processed[mainComponent].counts.notAssigned++;
          }
        });

        // Sort subControls within each main component (optional)
        Object.values(processed).forEach(mc => {
          mc.subControls.sort((a, b) => a.control.controlNumber.localeCompare(b.control.controlNumber));
        });

        setSelectedSystemDetails(processed);
        setSelectedSystemChartData(rawData.chartData); // Store the chart data

      } catch (err: unknown) {
        console.error("Error fetching detailed system analytics:", err);
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred while fetching detailed analytics.";
        setDetailsError(errorMsg);
      } finally {
        setIsDetailsLoading(false);
      }
    };

    fetchDetailedAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSystemId, user]); // Dependencies: selectedSystemId and user object
  // --- End Detailed System Analytics Fetch ---

  // --- Chart Options (For General Analytics Tab) ---
  const mainComponents = analyticsData ? Object.keys(analyticsData).sort() : [];

  const _stackedBarSeries = analyticsData ? complianceLevelOrder.map(level => ({
    name: complianceLevelLabels[level],
    data: mainComponents.map(component => analyticsData[component]?.percentages[level] || 0)
  })) : [];

  const _stackedBarOptions: ApexCharts.ApexOptions = {
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

 // --- Polar Area Chart Options (For General Analytics Tab) ---
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
 // --- End Polar Area Chart Options ---


  // --- Render Logic for General Analytics Tab ---
  const renderGeneralAnalyticsContent = () => {
    if (isAnalyticsLoading) {
      return (
        <div className="flex justify-center items-center h-[calc(100vh-250px)]"> {/* Adjusted height for tabs */}
          <Loader2 className="h-8 w-8 animate-spin text-nca-teal" />
          <span className="mr-2">جاري تحميل بيانات النتائج العامة...</span>
        </div>
      );
    }

    if (analyticsError) {
      return (
        <div className="flex justify-center items-center h-[calc(100vh-250px)] text-red-600"> {/* Adjusted height */}
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

    // Actual chart rendering for general analytics
    return (
      <div className="space-y-6 pt-4"> {/* Add padding top */}
        {/* Overall Stacked Bar Chart */}
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50 rounded-t-lg">
            <CardTitle className="text-lg font-semibold text-slate-700">نظرة عامة على الامتثال حسب المكون الرئيسي</CardTitle>
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
        </div> {/* Closing tag for the grid div */}
      </div> // Closing tag for the main space-y-6 div
    );
  };
  // --- End Render Logic for General Analytics Tab ---


  // --- Render Logic for Detailed Results Tab ---
  const renderDetailedResultsContent = () => {
    // Combined loading state check
    if (isSystemsLoading || isSystemAnalyticsLoading) {
      return (
        <div className="flex justify-center items-center h-[calc(100vh-250px)]">
          <Loader2 className="h-8 w-8 animate-spin text-nca-teal" />
          <span className="mr-2">جاري تحميل بيانات الأنظمة والنتائج...</span>
        </div>
      );
    }

    // Combined error state check
    const combinedError = systemsError || systemAnalyticsError;
    if (combinedError) {
      return (
        <div className="flex justify-center items-center h-[calc(100vh-250px)] text-red-600">
          <AlertCircle className="h-6 w-6" />
          <span className="mr-2">خطأ في تحميل البيانات: {combinedError}</span>
        </div>
      );
    }

    if (systems.length === 0) {
      return (
        <div className="text-center py-10 text-gray-600">
          لم يتم العثور على أنظمة حساسة مرتبطة بهذا المستخدم.
        </div>
      );
    }

    // Render system boxes
    return (
      <div className="space-y-6 pt-4" dir="rtl"> {/* Ensure container has dir */}
         <h2 className="text-xl font-bold text-slate-800 text-right">النتائج المفصلة لكل نظام</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systems.map((system) => (
              <Card
                key={system.id}
                className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  // Reset expansion state when selecting a new system or deselecting
                  setExpandedMainComponents({});
                  setSelectedSystemId(system.id === selectedSystemId ? null : system.id);
                }}
              >
                <CardHeader className="bg-gray-50 rounded-t-lg py-3 px-4">
                  <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2 truncate">
                      <Server className="h-4 w-4 text-nca-teal" />
                     {system.systemName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-sm">
                  {/* Display fetched control counts */}
                  <div className="flex justify-between items-center text-gray-600">
                    <span>الضوابط المكتملة:</span>
                    <span className={`font-medium ${systemAnalytics[system.id]?.finished > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {systemAnalytics[system.id]?.finished ?? '--'} / 105
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>الضوابط المعينة:</span>
                     <span className={`font-medium ${systemAnalytics[system.id]?.assigned > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                       {systemAnalytics[system.id]?.assigned ?? '--'} / 105
                     </span>
                  </div>
                   <div className="flex justify-between items-center text-gray-600">
                    <span>الضوابط المتأخرة:</span>
                    <span className="font-medium text-red-600">-- / 105</span> {/* Still Placeholder */}
                  </div>
                  {/* Department Managers */}
                  {system.department?.manager && (
                     <div className="flex items-center gap-2 pt-2 border-t mt-2 text-gray-700">
                       <Building className="h-4 w-4 text-gray-500"/>
                       <span>مدير القسم: {system.department.manager.name} ({system.department.name})</span>
                     </div>
                  )}
                   {/* TODO: Fetch and display actual counts and potentially more manager info */}
                </CardContent>
              </Card>
            ))}
         </div> {/* Closing tag for the grid div */}

         {/* Detailed View Area (Placeholder) */}
          {/* --- Detailed View Area --- */}
          {selectedSystemId && (
            <div className="mt-6" dir="rtl"> {/* Ensure container has dir */}
              <h3 className="text-lg font-semibold text-slate-800 mb-3 text-right">
                تفاصيل النظام: {systems.find(s => s.id === selectedSystemId)?.systemName}
              </h3>
              {isDetailsLoading && (
                <div className="flex justify-center items-center p-6 bg-white rounded shadow">
                  <Loader2 className="h-6 w-6 animate-spin text-nca-teal" />
                  <span className="mr-2">جاري تحميل التفاصيل...</span>
                </div>
              )}
              {detailsError && (
                <div className="flex justify-center items-center p-6 bg-red-50 text-red-700 rounded shadow">
                  <AlertCircle className="h-5 w-5" />
                  <span className="mr-2">خطأ في تحميل التفاصيل: {detailsError}</span>
                </div>
              )}
              {selectedSystemDetails && !isDetailsLoading && !detailsError && (
                <div className="space-y-4">
                  {Object.entries(selectedSystemDetails)
                    .sort(([mainA], [mainB]) => mainA.localeCompare(mainB)) // Sort main components alphabetically
                    .map(([mainComponent, data]) => (
                    <Card key={mainComponent} className="shadow-sm border border-gray-200">
                      <CardHeader
                        className="bg-gray-100 rounded-t-md p-3 flex flex-row justify-between items-center cursor-pointer hover:bg-gray-200"
                        onClick={() => setExpandedMainComponents(prev => ({ ...prev, [mainComponent]: !prev[mainComponent] }))}
                      >
                        <CardTitle className="text-base font-medium text-slate-700">{mainComponent}</CardTitle>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                           <span>الإجمالي: {data.counts.total}</span>
                           <span className="text-green-600">مكتمل: {data.counts.finished}</span>
                           <span className="text-blue-600">معين: {data.counts.assigned}</span>
                           <span className="text-orange-600">غير معين: {data.counts.notAssigned}</span>
                           {expandedMainComponents[mainComponent] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </CardHeader>
                      {expandedMainComponents[mainComponent] && (
                        <CardContent className="p-0"> {/* Remove padding for table */}
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-4 py-2 text-right font-medium text-gray-500 tracking-wider">رقم الضابط</th>
                                  <th scope="col" className="px-4 py-2 text-right font-medium text-gray-500 tracking-wider">نص الضابط / المكون الفرعي</th>
                                  <th scope="col" className="px-4 py-2 text-center font-medium text-gray-500 tracking-wider">الحالة</th>
                                  <th scope="col" className="px-4 py-2 text-center font-medium text-gray-500 tracking-wider">مستوى الامتثال</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {data.subControls.map(assignment => (
                                  <tr key={assignment.id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-700">{assignment.control.controlNumber}</td>
                                    <td className="px-4 py-2 text-gray-700">{assignment.control.subComponent || assignment.control.controlText}</td>
                                    <td className="px-4 py-2 text-center whitespace-nowrap">
                                      {assignment.status === TaskStatus.COMPLETED ? ( // Correct enum member
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          <CheckCircle className="h-3 w-3 mr-1" /> مكتمل
                                        </span>
                                      ) : assignment.assignedUserId ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          <_UserIcon className="h-3 w-3 mr-1" /> معين
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                          <MinusCircle className="h-3 w-3 mr-1" /> غير معين
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-center whitespace-nowrap">
                                      {assignment.complianceLevel ? (
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium`}
                                              style={{
                                                backgroundColor: `${complianceLevelColors[assignment.complianceLevel]}20`, // Add alpha for background
                                                color: complianceLevelColors[assignment.complianceLevel]
                                              }}>
                                          {complianceLevelLabels[assignment.complianceLevel]}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}

                  {/* Render the chart component if data is available */}
                  {selectedSystemChartData && selectedSystemChartData.length > 0 && (
                    <SystemAnalyticsCharts data={selectedSystemChartData} />
                  )}

                </div>
              )}
            </div>
          )}
          {/* --- End Detailed View Area --- */}
      </div>
    );
  };
  // --- End Render Logic for Detailed Results Tab ---

  // Handle loading and unauthenticated states
  if (authLoading) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">الرجاء تسجيل الدخول للوصول لهذه الصفحة.</div>;
  }

  // Ensure user is a Security Manager
  if (user.role !== 'SECURITY_MANAGER') {
    return <div className="flex justify-center items-center min-h-screen">غير مصرح لك بالوصول لهذه الصفحة.</div>;
  }

  // Define estimated header height (should match AppHeader)
  const HEADER_HEIGHT = 88; // Adjust if AppHeader styling changes

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Use shared AppHeader */}
      <AppHeader />

      {/* Main Layout with Sidebar */}
      <div className="flex flex-row">
        {/* Sidebar */}
        {/* Conditional rendering for mobile sidebar overlay */}
         {isSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}
        {/* Adjusted sticky top and height */}
        <aside className={`fixed md:sticky top-0 md:top-[${HEADER_HEIGHT}px] right-0 h-full md:h-[calc(100vh-${HEADER_HEIGHT}px)] bg-slate-800 text-white p-4 overflow-y-auto transition-transform duration-300 ease-in-out z-50 md:z-30 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 ${isSidebarOpen ? 'w-64' : 'md:w-20'}`}>
           {/* Close button for mobile */}
           <div className="flex justify-end mb-4 md:hidden">
             <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={() => setIsSidebarOpen(false)}>
               <Menu className="h-5 w-5" /> {/* Use X icon? */}
             </Button>
           </div>
           {/* Toggle button for desktop */}
           <div className={`hidden md:flex ${isSidebarOpen ? 'justify-end' : 'justify-center'} mb-4`}>
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button> {/* Corrected: Closing Button tag */}
           </div> {/* Corrected: Closing div tag */}
          <nav className="space-y-1"> {/* Reduced spacing */}
            {/* Sidebar Links */}
            <Link href="/security-manager" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 text-sm ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden md:hidden' : 'block'}`}>لوحة المعلومات</span>
            </Link>
            {/* <Link href="/security-manager#assessments" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 text-sm ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <ShieldCheck className="h-4 w-4 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden md:hidden' : 'block'}`}>التقييمات المعينة</span>
            </Link> */}
             <Link href="/security-manager/system-info" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 text-sm ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <Server className="h-4 w-4 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden md:hidden' : 'block'}`}>معلومات الأنظمة</span>
            </Link>
            {/* <Link href="/security-manager/departments" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 text-sm ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <Building className="h-4 w-4 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden md:hidden' : 'block'}`}>إدارة الأقسام</span>
            </Link> */}
            {/* <Link href="/security-manager#tasks" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 text-sm ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <ListChecks className="h-4 w-4 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden md:hidden' : 'block'}`}>المهام</span>
            </Link> */}
            {/* <Link href="/security-manager#risks" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 text-sm ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <FileWarning className="h-4 w-4 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden md:hidden' : 'block'}`}>المخاطر</span>
            </Link> */}
            {/* <Link href="/security-manager#reports" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 text-sm ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden md:hidden' : 'block'}`}>التقارير</span>
            </Link> */}
            <Link href="/security-manager/results" className={`flex items-center gap-3 px-3 py-2 rounded bg-nca-dark-blue text-white font-semibold text-sm ${!isSidebarOpen ? 'justify-center' : ''}`}> {/* Active link style */}
              <BarChart className="h-4 w-4 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden md:hidden' : 'block'}`}>النتائج</span>
            </Link>
            <Link href="/security-manager/results?tab=detailed" className={`flex items-center gap-3 px-3 py-2 rounded text-white text-sm ${activeTab === "detailed" ? 'bg-nca-dark-blue font-semibold' : 'hover:bg-slate-700'} ${!isSidebarOpen ? 'justify-center' : ''}`}>
              سير العمل
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        {/* Adjust margin based on sidebar state for desktop and height */}
        <main className={`flex-1 p-4 md:p-6 overflow-y-auto h-[calc(100vh-${HEADER_HEIGHT}px)] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:mr-64' : 'md:mr-20'}`}>
           {/* Tabs Navigation */}
           <Tabs
             value={activeTab}
             onValueChange={(val) => {
               if (val === "detailed") {
                 router.push("/security-manager/results?tab=detailed");
               } else if (val === "overall") {
                 router.push("/security-manager/results?tab=overall");
               } else {
                 router.push("/security-manager/results?tab=general");
               }
             }}
             className="w-full"
             dir="rtl"
           > {/* Ensure Tabs has dir */}
             {/* Use flexbox for RTL tab order */}
             <TabsList className="flex w-full mb-4 flex-row-reverse justify-start gap-8 border-b">
               <TabsTrigger value="general" className="text-right data-[state=active]:border-b-2 data-[state=active]:border-nca-dark-blue data-[state=active]:text-nca-dark-blue pb-2 px-4 cursor-pointer">النتائج العامة</TabsTrigger>
               <TabsTrigger value="overall" className="text-right data-[state=active]:border-b-2 data-[state=active]:border-nca-dark-blue data-[state=active]:text-nca-dark-blue pb-2 px-4 cursor-pointer">المستوى العام للالتزام</TabsTrigger>
             </TabsList>
             <TabsContent value="general" dir="rtl"> {/* Ensure content has dir */}
               {/* Render the general analytics content, loading, or error state */}
               {renderGeneralAnalyticsContent()}
             </TabsContent>
             <TabsContent value="overall" dir="rtl"> {/* Overall Compliance Tab */}
               {isAssessmentLoading || isSystemsCountLoading || isComplianceCountsLoading ? (
                 <div className="flex justify-center items-center h-[calc(100vh-250px)]">
                   <Loader2 className="h-8 w-8 animate-spin text-nca-teal" />
                   <span className="mr-2">جاري تحميل بيانات المستوى العام للالتزام...</span>
                 </div>
               ) : assessmentError || systemsCountError || complianceCountsError ? (
                 <div className="flex justify-center items-center h-[calc(100vh-250px)] text-red-600">
                   <AlertCircle className="h-6 w-6" />
                   <span className="mr-2">خطأ في تحميل البيانات: {assessmentError || systemsCountError || complianceCountsError}</span>
                 </div>
               ) : !assessment ? (
                 <div className="text-center py-10 text-gray-600">
                   لا توجد تقييمات متاحة لعرض المستوى العام للالتزام.
                 </div>
               ) : (
                 <div className="space-y-6 pt-4">
                   {/* Assessment Logo and Name */}
                   <div className="text-center mb-8">
                     {assessment.logoPath && (
                       <img 
                         src={assessment.logoPath} 
                         alt={assessment.assessmentName} 
                         className="mx-auto h-24 w-auto mb-4"
                       />
                     )}
                     <h2 className="text-xl font-bold text-slate-800">{assessment.assessmentName}</h2>
                     <h3 className="text-lg font-medium text-slate-600 mt-2">المستوى العام للالتزام</h3>
                   </div>
                   
                   {/* Two-column grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Left column: Pie chart */}
                     <Card className="shadow-md">
                       <CardHeader className="bg-gray-50 rounded-t-lg">
                         <CardTitle className="text-lg font-semibold text-slate-700">توزيع مستويات الالتزام</CardTitle>
                       </CardHeader>
                       <CardContent className="p-4">
                         {Object.values(complianceCounts).every(count => count === 0) ? (
                           <div className="text-center py-10 text-gray-600">
                             لا توجد بيانات التزام لعرضها.
                           </div>
                         ) : (
                           <Chart 
                             options={{
                               chart: { type: 'pie', fontFamily: 'inherit' },
                               labels: complianceLevelOrder.map(level => complianceLevelLabels[level]),
                               colors: complianceLevelOrder.map(level => complianceLevelColors[level]),
                               legend: { position: 'bottom', fontFamily: 'inherit' },
                               tooltip: { 
                                 y: { 
                                   formatter: (val) => `${val} ضابط` 
                                 }, 
                                 style: { fontFamily: 'inherit' } 
                               },
                               dataLabels: { 
                                 enabled: true, 
                                 formatter: (val, opts) => {
                                   const total = opts.w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                                   if (total === 0) return '0%';
                                   return `${((opts.w.globals.series[opts.seriesIndex] / total) * 100).toFixed(1)}%`;
                                 },
                                 style: { fontFamily: 'inherit' } 
                               },
                             }} 
                             series={complianceLevelOrder.map(level => complianceCounts[level])} 
                             type="pie" 
                             height={350} 
                             width="100%" 
                           />
                         )}
                       </CardContent>
                     </Card>
                     
                     {/* Right column: Stat card */}
                     <Card className="shadow-md">
                       <CardHeader className="bg-gray-50 rounded-t-lg">
                         <CardTitle className="text-lg font-semibold text-slate-700">إحصائيات التقييم</CardTitle>
                       </CardHeader>
                       <CardContent className="p-6">
                         <div className="text-center">
                           <h4 className="text-xl font-bold text-slate-800 mb-2">عدد الأنظمة الحساسة</h4>
                           <div className="text-4xl font-bold text-nca-teal">{systemsCount}</div>
                           
                           <div className="mt-8">
                             <h4 className="text-xl font-bold text-slate-800 mb-4">إجمالي الضوابط</h4>
                             <div className="text-3xl font-bold text-slate-700">
                               {Object.values(complianceCounts).reduce((sum, count) => sum + count, 0)}
                             </div>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   </div>
                   
                   {/* Compliance levels table */}
                   <Card className="shadow-md">
                     <CardHeader className="bg-gray-50 rounded-t-lg">
                       <CardTitle className="text-lg font-semibold text-slate-700">تفاصيل مستويات الالتزام</CardTitle>
                     </CardHeader>
                     <CardContent className="p-0"> {/* Remove padding for table */}
                       <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-gray-200">
                           <thead className="bg-gray-50">
                             <tr>
                               <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مستوى الالتزام</th>
                               <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">عدد الضوابط</th>
                               <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">النسبة المئوية</th>
                             </tr>
                           </thead>
                           <tbody className="bg-white divide-y divide-gray-200">
                             {complianceLevelOrder.map(level => {
                               const count = complianceCounts[level];
                               const total = Object.values(complianceCounts).reduce((sum, c) => sum + c, 0);
                               const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
                               
                               return (
                                 <tr key={level}>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                     <div className="flex items-center">
                                       <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: complianceLevelColors[level] }}></div>
                                       <div className="text-sm font-medium text-gray-900">{complianceLevelLabels[level]}</div>
                                     </div>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{count}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{percentage}%</td>
                                 </tr>
                               );
                             })}
                             <tr className="bg-gray-50 font-medium">
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">الإجمالي</td>
                               <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                 {Object.values(complianceCounts).reduce((sum, count) => sum + count, 0)}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">100%</td>
                             </tr>
                           </tbody>
                         </table>
                       </div>
                     </CardContent>
                   </Card>
                 </div>
               )}
             </TabsContent>
             <TabsContent value="detailed" dir="rtl"> {/* Ensure content has dir */}
               {/* Render the detailed results content, loading, or error state */}
               {renderDetailedResultsContent()}
             </TabsContent>
           </Tabs>
        </main>
      </div> {/* Closing tag for the flex flex-row div */}

    </div> // Closing tag for the main min-h-screen div
  );
}

// Main page component with Suspense boundary
export default function SecurityManagerResultsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
