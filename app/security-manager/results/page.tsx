"use client"

import { useState, useEffect, Suspense } from "react";
import dynamic from 'next/dynamic';
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AppHeader } from "@/components/ui/AppHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, Menu, LayoutDashboard, Server, BarChart, Building, CheckCircle, XCircle, AlertTriangle, MinusCircle, ChevronDown, ChevronUp, User } from "lucide-react";
import { TaskStatus } from "@prisma/client";
import SystemAnalyticsCharts from "@/components/ui/SystemAnalyticsCharts";

// Add TypeScript declaration for window.resolve
declare global {
  interface Window {
    resolve?: (url: string) => string;
  }
}

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => 
  import('react-apexcharts').then(mod => {
    if (typeof window !== 'undefined' && !window.resolve) {
      window.resolve = function(url: string): string {
        return url;
      };
    }
    return mod;
  }),
  { ssr: false }
);

// Define Assessment interface
interface Assessment {
  id: string;
  name: string;
  logoUrl: string | null;
  createdAt: string;
  securityManagerId: string;
}

// Define the expected structure of the fetched analytics data item
interface AnalyticsAssignment {
  id: string;
  complianceLevel: ComplianceLevel | null;
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

// Define colors for consistency
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

// Detailed Analytics Types
interface DetailedAssignmentData {
  id: string;
  status: TaskStatus;
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

// Structure for chart data points
interface ChartDataPoint {
  name: string;
  totalControls: number;
  withCompliance: number;
  withoutCompliance: number;
}

interface DetailedSystemAnalyticsResponse {
  systemName: string;
  assignments: DetailedAssignmentData[];
  chartData: ChartDataPoint[];
}

// Structure for processed detailed data, grouped by main component
interface MainComponentDetailedAnalytics {
  subControls: DetailedAssignmentData[];
  counts: {
    total: number;
    finished: number;
    assigned: number;
    notAssigned: number;
  };
}

interface ProcessedDetailedAnalytics {
  [mainComponent: string]: MainComponentDetailedAnalytics;
}

// Define SensitiveSystemInfo interface
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
}

// State for summary analytics per system
interface SystemSummaryAnalytics {
  assigned: number;
  finished: number;
}

// Client component that uses searchParams
export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <Suspense fallback={<div className="flex justify-center items-center h-[calc(100vh-64px)]"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <ResultsContent />
      </Suspense>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "overall" ? "overall" : tabParam === "detailed" ? "detailed" : "general";
  
  // State for layout
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auth state
  const { user, loading: authLoading } = useAuth();

  // State for overall analytics (General Results Tab)
  const [analyticsData, setAnalyticsData] = useState<ProcessedAnalyticsData | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // State for overall compliance tab
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  
  const [sensitiveSystemsCount, setSensitiveSystemsCount] = useState<number>(0);
  const [isSystemsCountLoading, setIsSystemsCountLoading] = useState(false);
  const [systemsCountError, setSystemsCountError] = useState<string | null>(null);
  
  const [complianceCounts, setComplianceCounts] = useState<Record<ComplianceLevel, number>>({
    [ComplianceLevel.IMPLEMENTED]: 0,
    [ComplianceLevel.PARTIALLY_IMPLEMENTED]: 0,
    [ComplianceLevel.NOT_IMPLEMENTED]: 0,
    [ComplianceLevel.NOT_APPLICABLE]: 0
  });
  const [isComplianceCountsLoading, setIsComplianceCountsLoading] = useState(false);
  const [complianceCountsError, setComplianceCountsError] = useState<string | null>(null);

  // --- Latest Assessment Fetch (Triggered by user) ---
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchLatestAssessment = async () => {
      setIsAssessmentLoading(true);
      try {
        const response = await fetch(`/api/users/${user.id}/assessments`);
        if (!response.ok) throw new Error(`Failed to fetch assessments: ${response.statusText}`);
        
        const assessments: Assessment[] = await response.json();
        if (assessments.length > 0) {
          setAssessment(assessments[0]);
        } else {
          setAssessmentError("No assessments found for this user.");
        }
      } catch (err: any) {
        setAssessmentError(err.message || "An unknown error occurred.");
      } finally {
        setIsAssessmentLoading(false);
      }
    };

    fetchLatestAssessment();
  }, [user]);

  // --- Sensitive Systems Count Fetch (Triggered by assessment) ---
  useEffect(() => {
    if (!assessment?.id) return;
    
    const fetchSensitiveSystemsCount = async () => {
      setIsSystemsCountLoading(true);
      try {
        const response = await fetch(`/api/assessments/${assessment.id}/sensitive-systems`);
        if (!response.ok) throw new Error(`Failed to fetch sensitive systems: ${response.statusText}`);
        
        const sensitiveSystems = await response.json();
        setSensitiveSystemsCount(sensitiveSystems.length);
      } catch (err: any) {
        setSystemsCountError(err.message || "An unknown error occurred.");
      } finally {
        setIsSystemsCountLoading(false);
      }
    };

    fetchSensitiveSystemsCount();
  }, [assessment]);

  // --- Compliance Counts Fetch (Triggered by assessment) ---
  useEffect(() => {
    if (!assessment?.id) return;
    
    const fetchComplianceCounts = async () => {
      setIsComplianceCountsLoading(true);
      try {
        const response = await fetch(`/api/control-assignments/analytics?assessmentId=${assessment.id}`);
        if (!response.ok) throw new Error(`Failed to fetch compliance counts: ${response.statusText}`);
        
        const assignments: AnalyticsAssignment[] = await response.json();
        const counts = {
          [ComplianceLevel.IMPLEMENTED]: 0,
          [ComplianceLevel.PARTIALLY_IMPLEMENTED]: 0,
          [ComplianceLevel.NOT_IMPLEMENTED]: 0,
          [ComplianceLevel.NOT_APPLICABLE]: 0
        };
        
        assignments.forEach(assignment => {
          if (assignment.complianceLevel) {
            counts[assignment.complianceLevel]++;
          }
        });
        
        setComplianceCounts(counts);
      } catch (err: any) {
        setComplianceCountsError(err.message || "An unknown error occurred.");
      } finally {
        setIsComplianceCountsLoading(false);
      }
    };

    fetchComplianceCounts();
  }, [assessment]);

  // --- General Analytics Data Fetch (Triggered by user) ---
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchAnalyticsData = async () => {
      setIsAnalyticsLoading(true);
      try {
        const response = await fetch(`/api/control-assignments/analytics?securityManagerId=${user.id}`);
        if (!response.ok) throw new Error(`Failed to fetch analytics data: ${response.statusText}`);
        
        const rawAssignments: AnalyticsAssignment[] = await response.json();
        const processedData: ProcessedAnalyticsData = {};
        
        // Process the data
        rawAssignments.forEach(assignment => {
          const component = assignment.control.mainComponent;
          const level = assignment.complianceLevel;
          if (!component) return;
          
          if (!processedData[component]) {
            processedData[component] = {
              total: 0,
              levels: { 
                [ComplianceLevel.NOT_IMPLEMENTED]: 0, 
                [ComplianceLevel.PARTIALLY_IMPLEMENTED]: 0, 
                [ComplianceLevel.IMPLEMENTED]: 0, 
                [ComplianceLevel.NOT_APPLICABLE]: 0 
              },
              percentages: { 
                [ComplianceLevel.NOT_IMPLEMENTED]: 0, 
                [ComplianceLevel.PARTIALLY_IMPLEMENTED]: 0, 
                [ComplianceLevel.IMPLEMENTED]: 0, 
                [ComplianceLevel.NOT_APPLICABLE]: 0 
              }
            };
          }
          
          processedData[component].total++;
          if (level) {
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
      } catch (err: any) {
        setAnalyticsError(err.message || "An unknown error occurred.");
      } finally {
        setIsAnalyticsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user]);

  // --- Pie Chart Options (For Overall Compliance Tab) ---
  const compliancePieSeries = Object.values(complianceCounts);
  const compliancePieLabels = Object.keys(complianceCounts).map(key => complianceLevelLabels[key as ComplianceLevel]);
  const compliancePieColors = Object.keys(complianceCounts).map(key => complianceLevelColors[key as ComplianceLevel]);
  
  const compliancePieOptions: ApexCharts.ApexOptions = {
    chart: { type: 'pie', fontFamily: 'inherit' },
    labels: compliancePieLabels,
    colors: compliancePieColors,
    legend: { position: 'bottom', fontFamily: 'inherit' },
    tooltip: { 
      y: { 
        formatter: (val) => `${val} (${((val / compliancePieSeries.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)` 
      }, 
      style: { fontFamily: 'inherit' } 
    },
    dataLabels: { 
      enabled: true, 
      formatter: (val) => `${parseFloat(val as string).toFixed(1)}%`, 
      style: { fontFamily: 'inherit' } 
    },
    responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
  };

  // --- Convert analyticsData to format expected by SystemAnalyticsCharts ---
  const convertedChartData = analyticsData ? 
    Object.keys(analyticsData).map(component => {
      const data = analyticsData[component];
      return {
        name: component,
        totalControls: data.total,
        withCompliance: data.levels[ComplianceLevel.IMPLEMENTED] + 
                        data.levels[ComplianceLevel.PARTIALLY_IMPLEMENTED] + 
                        data.levels[ComplianceLevel.NOT_APPLICABLE],
        withoutCompliance: data.levels[ComplianceLevel.NOT_IMPLEMENTED]
      };
    }) : [];

  // --- Render Logic for Overall Compliance Tab ---
  const renderOverallComplianceContent = () => {
    const isLoading = isAssessmentLoading || isSystemsCountLoading || isComplianceCountsLoading;
    const error = assessmentError || systemsCountError || complianceCountsError;

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[calc(100vh-250px)]">
          <Loader2 className="h-8 w-8 animate-spin text-nca-teal" />
          <span className="mr-2">جاري تحميل بيانات المستوى العام للالتزام...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-[calc(100vh-250px)] text-red-600">
          <AlertCircle className="h-6 w-6" />
          <span className="mr-2">خطأ في تحميل البيانات: {error}</span>
        </div>
      );
    }

    if (!assessment) {
      return (
        <div className="text-center py-10 text-gray-600">
          لا يوجد تقييم لعرض المستوى العام للالتزام.
        </div>
      );
    }

    return (
      <div className="space-y-8 pt-4">
        {/* Assessment Logo and Name */}
        <div className="text-center space-y-4">
          {assessment.logoUrl && (
            <div className="flex justify-center">
              <Image 
                src={assessment.logoUrl} 
                alt={assessment.name} 
                width={120} 
                height={120} 
                className="rounded-md"
              />
            </div>
          )}
          <h2 className="text-2xl font-bold text-slate-800">{assessment.name}</h2>
          <h3 className="text-xl font-semibold text-slate-700">المستوى العام للالتزام</h3>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: Pie chart */}
          <Card className="shadow-md">
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="text-lg font-semibold text-slate-700">توزيع مستويات الالتزام</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Chart 
                options={compliancePieOptions} 
                series={compliancePieSeries} 
                type="pie" 
                height={350} 
                width="100%" 
              />
            </CardContent>
          </Card>

          {/* Right column: Sensitive Systems Count */}
          <Card className="shadow-md">
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="text-lg font-semibold text-slate-700">إحصائيات التقييم</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Sensitive Systems Count */}
                <div className="text-center">
                  <h4 className="text-lg font-medium text-slate-600 mb-2">عدد الأنظمة الحساسة</h4>
                  <div className="text-3xl font-bold text-slate-800">{sensitiveSystemsCount}</div>
                </div>

                {/* Compliance Levels Table */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-slate-600 mb-3">الحالة</h4>
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            مستوى الالتزام
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            العدد
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(complianceCounts).map(([level, count]) => (
                          <tr key={level}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {complianceLevelLabels[level as ComplianceLevel]}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // --- Render Logic for General Analytics Tab ---
  const renderGeneralAnalyticsContent = () => {
    if (isAnalyticsLoading) {
      return (
        <div className="flex justify-center items-center h-[calc(100vh-250px)]">
          <Loader2 className="h-8 w-8 animate-spin text-nca-teal" />
          <span className="mr-2">جاري تحميل بيانات التحليل...</span>
        </div>
      );
    }

    if (analyticsError) {
      return (
        <div className="flex justify-center items-center h-[calc(100vh-250px)] text-red-600">
          <AlertCircle className="h-6 w-6" />
          <span className="mr-2">خطأ في تحميل البيانات: {analyticsError}</span>
        </div>
      );
    }

    if (!analyticsData || Object.keys(analyticsData).length === 0) {
      return (
        <div className="text-center py-10 text-gray-600">
          لا توجد بيانات تحليلية متاحة.
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <SystemAnalyticsCharts data={convertedChartData} />
      </div>
    );
  };

  // --- Render Logic for Detailed Analytics Tab ---
  const renderDetailedAnalyticsContent = () => {
    return (
      <div className="text-center py-10 text-gray-600">
        تفاصيل التحليل غير متاحة حاليًا.
      </div>
    );
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    router.push(`/security-manager/results?tab=${value}`);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] text-red-600">
        <AlertCircle className="h-6 w-6" />
        <span className="mr-2">يجب تسجيل الدخول للوصول إلى هذه الصفحة.</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">نتائج التحليل</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">التحليل العام</TabsTrigger>
          <TabsTrigger value="detailed">تحليل الأنظمة</TabsTrigger>
          <TabsTrigger value="overall">المستوى العام للالتزام</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-6">
          {renderGeneralAnalyticsContent()}
        </TabsContent>
        <TabsContent value="detailed" className="mt-6">
          {renderDetailedAnalyticsContent()}
        </TabsContent>
        <TabsContent value="overall" className="mt-6">
          {renderOverallComplianceContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
