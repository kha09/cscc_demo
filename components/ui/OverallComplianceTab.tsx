"use client"

import { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, FileDown } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { User } from "@prisma/client"; // Assuming User type is needed
import type { Props as ReactApexChartProps } from 'react-apexcharts'; // Import chart props type

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Polyfill for potential ApexCharts issue (ReferenceError: resolve is not defined)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof window !== 'undefined' && typeof (window as any).resolve !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).resolve = function() {};
}

// Helper component to delay chart rendering until mounted client-side
const ClientOnlyChart = (props: ReactApexChartProps) => { // Use imported type
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    // Optional: Render a placeholder or loader while waiting for mount
    return <div className="flex justify-center items-center h-[350px]"><Loader2 className="h-6 w-6 animate-spin text-nca-teal" /></div>;
  }

  return <Chart {...props} />;
};
// Removed the window.resolve polyfill as it might be unnecessary and causing issues.

// --- Types and Constants (Copied from results/page.tsx) ---
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

interface DetailedAssignmentData { // Needed for system compliance fetch
  id: string;
  complianceLevel: ComplianceLevel | null;
  // Add other fields if needed by the API response structure
}

interface SystemComplianceData {
  systemName: string;
  complianceCounts: Record<ComplianceLevel, number>;
  totalControls: number;
}

interface AnalyticsAssignment { // Needed for overall compliance fetch
  id: string;
  complianceLevel: ComplianceLevel | null;
  // Add other fields if needed
}
// --- End Types and Constants ---

interface OverallComplianceTabProps {
  user: User | null; // Pass user object as prop
  assessment: {id: string; assessmentName: string; logoPath?: string} | null; // Pass assessment data
  isAssessmentLoading: boolean;
  assessmentError: string | null;
  isAssessmentApproved: boolean; // Pass approval status
  isCheckingApproval: boolean; // Pass checking status
}

export function OverallComplianceTab({ 
  user, 
  assessment, 
  isAssessmentLoading, 
  assessmentError, 
  isAssessmentApproved, 
  isCheckingApproval 
}: OverallComplianceTabProps) {
  
  // State specific to this tab
  const [systemsCount, setSystemsCount] = useState<number>(0);
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
  
  const [systemsComplianceData, setSystemsComplianceData] = useState<SystemComplianceData[]>([]);
  const [isSystemsComplianceLoading, setIsSystemsComplianceLoading] = useState(false);
  const [systemsComplianceError, setSystemsComplianceError] = useState<string | null>(null);

  const overallComplianceRef = useRef<HTMLDivElement>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // --- Sensitive Systems Count Fetch ---
  const fetchSensitiveSystemsCount = async (assessmentId: string) => {
    if (!assessmentId) return;
    
    setIsSystemsCountLoading(true);
    setSystemsCountError(null);
    setSystemsCount(0); // Reset count
    
    try {
      console.log(`Fetching sensitive systems for assessment ID: ${assessmentId}`);
      const response = await fetch(`/api/assessments/${assessmentId}/sensitive-systems`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch sensitive systems: ${response.statusText}`);
      }
      
      const systems = await response.json();
      setSystemsCount(systems.length);
      
      // Fetch compliance data for each system
      if (systems.length > 0) {
        fetchSystemsComplianceData(systems, assessmentId);
      } else {
        // If no systems, clear system compliance data and stop loading
        setSystemsComplianceData([]);
        setIsSystemsComplianceLoading(false);
      }
    } catch (err) {
      console.error("Error fetching sensitive systems count:", err);
      const errorMsg = err instanceof Error ? err.message : "An unknown error occurred.";
      setSystemsCountError(errorMsg);
      setIsSystemsComplianceLoading(false); // Stop loading on error
    } finally {
      setIsSystemsCountLoading(false);
    }
  };
  // --- End Sensitive Systems Count Fetch ---
  
  // --- Systems Compliance Data Fetch ---
  const fetchSystemsComplianceData = async (systems: {id: string; systemName: string}[], assessmentId: string) => {
    if (!systems.length || !assessmentId || !user?.id) {
        setIsSystemsComplianceLoading(false); // Ensure loading stops if conditions not met
        return;
    }
    
    setIsSystemsComplianceLoading(true);
    setSystemsComplianceError(null);
    setSystemsComplianceData([]); // Reset data
    
    try {
      const systemsData: SystemComplianceData[] = [];
      
      // Process each system sequentially
      for (const system of systems) {
        console.log(`Fetching compliance data for system ID: ${system.id}`);
        // Ensure securityManagerId is included if your API requires it
        const response = await fetch(`/api/control-assignments/analytics/by-system/${system.id}?securityManagerId=${user.id}`); 
        
        if (!response.ok) {
          const errorData = await response.json();
          // Log specific error for this system but continue if possible
          console.error(`Failed to fetch compliance data for system ${system.systemName}: ${errorData.message || response.statusText}`);
          // Optionally add a placeholder or skip this system
          continue; // Skip to the next system on error
        }
        
        const data = await response.json();
        
        const counts = {
          [ComplianceLevel.IMPLEMENTED]: 0,
          [ComplianceLevel.PARTIALLY_IMPLEMENTED]: 0,
          [ComplianceLevel.NOT_IMPLEMENTED]: 0,
          [ComplianceLevel.NOT_APPLICABLE]: 0
        };
        
        // Check if data.assignments exists and is an array
        if (data.assignments && Array.isArray(data.assignments)) {
            data.assignments.forEach((assignment: DetailedAssignmentData) => {
              if (assignment.complianceLevel && counts[assignment.complianceLevel] !== undefined) {
                counts[assignment.complianceLevel]++;
              }
            });
            
            systemsData.push({
              systemName: system.systemName,
              complianceCounts: counts,
              totalControls: data.assignments.length
            });
        } else {
            console.warn(`No assignments data found for system ${system.systemName}`);
             systemsData.push({ // Add entry even if no assignments
              systemName: system.systemName,
              complianceCounts: counts,
              totalControls: 0
            });
        }
      }
      
      setSystemsComplianceData(systemsData);
    } catch (err) {
      console.error("Error fetching systems compliance data:", err);
      const errorMsg = err instanceof Error ? err.message : "An unknown error occurred.";
      setSystemsComplianceError(errorMsg);
    } finally {
      setIsSystemsComplianceLoading(false);
    }
  };
  // --- End Systems Compliance Data Fetch ---

  // --- Compliance Counts Fetch ---
  const fetchComplianceCounts = async (assessmentId: string) => {
    if (!assessmentId) return;
    
    setIsComplianceCountsLoading(true);
    setComplianceCountsError(null);
    // Reset counts
    setComplianceCounts({
        [ComplianceLevel.IMPLEMENTED]: 0,
        [ComplianceLevel.PARTIALLY_IMPLEMENTED]: 0,
        [ComplianceLevel.NOT_IMPLEMENTED]: 0,
        [ComplianceLevel.NOT_APPLICABLE]: 0
    });
    
    try {
      console.log(`Fetching compliance counts for assessment ID: ${assessmentId}`);
      // Ensure securityManagerId is included if your API requires it
      const response = await fetch(`/api/control-assignments/analytics?assessmentId=${assessmentId}&securityManagerId=${user?.id}`); 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch compliance counts: ${response.statusText}`);
      }
      
      const assignments: AnalyticsAssignment[] = await response.json();
      
      const counts = {
        [ComplianceLevel.IMPLEMENTED]: 0,
        [ComplianceLevel.PARTIALLY_IMPLEMENTED]: 0,
        [ComplianceLevel.NOT_IMPLEMENTED]: 0,
        [ComplianceLevel.NOT_APPLICABLE]: 0
      };
      
      assignments.forEach((assignment: AnalyticsAssignment) => {
        if (assignment.complianceLevel && counts[assignment.complianceLevel] !== undefined) {
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

  // --- Trigger fetches when assessment is approved and available ---
  useEffect(() => {
    if (isAssessmentApproved && assessment?.id && user?.id) {
      // Fetch data only if approved and assessment ID exists
      fetchSensitiveSystemsCount(assessment.id); // This will trigger fetchSystemsComplianceData
      fetchComplianceCounts(assessment.id);
    } else {
      // Reset states if assessment is not approved or ID is missing
      setSystemsCount(0);
      setComplianceCounts({
        [ComplianceLevel.IMPLEMENTED]: 0,
        [ComplianceLevel.PARTIALLY_IMPLEMENTED]: 0,
        [ComplianceLevel.NOT_IMPLEMENTED]: 0,
        [ComplianceLevel.NOT_APPLICABLE]: 0
      });
      setSystemsComplianceData([]);
      // Ensure loading states are false if fetch is not triggered
      if (isSystemsCountLoading) setIsSystemsCountLoading(false);
      if (isComplianceCountsLoading) setIsComplianceCountsLoading(false);
      if (isSystemsComplianceLoading) setIsSystemsComplianceLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAssessmentApproved, assessment?.id, user?.id]); // Depend on approval status, assessment ID, and user ID

  // --- Render Logic ---
  if (isCheckingApproval || isAssessmentLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-250px)]">
        <Loader2 className="h-8 w-8 animate-spin text-nca-teal" />
        <span className="mr-2">جاري تحميل البيانات...</span>
      </div>
    );
  }

  if (!isAssessmentApproved) {
    // Message handled in parent component, return null or minimal loader
    return null; 
  }

  // Handle errors after approval check
  if (assessmentError) {
     return (
       <div className="flex justify-center items-center h-[calc(100vh-250px)] text-red-600">
         <AlertCircle className="h-6 w-6" />
         <span className="mr-2">خطأ في تحميل التقييم: {assessmentError}</span>
       </div>
     );
  }
  
  if (!assessment) {
    return (
      <div className="text-center py-10 text-gray-600">
        لا توجد تقييمات متاحة لعرض المستوى العام للالتزام.
      </div>
    );
  }

  // Loading state for data specific to this tab
  if (isSystemsCountLoading || isComplianceCountsLoading) {
     return (
       <div className="flex justify-center items-center h-[calc(100vh-250px)]">
         <Loader2 className="h-8 w-8 animate-spin text-nca-teal" />
         <span className="mr-2">جاري تحميل بيانات المستوى العام للالتزام...</span>
       </div>
     );
  }

  // Error state for data specific to this tab
  if (systemsCountError || complianceCountsError) {
     return (
       <div className="flex justify-center items-center h-[calc(100vh-250px)] text-red-600">
         <AlertCircle className="h-6 w-6" />
         <span className="mr-2">خطأ في تحميل البيانات: {systemsCountError || complianceCountsError}</span>
       </div>
     );
  }

  // Actual content rendering
  return (
    <div ref={overallComplianceRef} className="space-y-6 pt-4" dir="rtl">
      {/* Assessment Logo and Name */}
      <div className="text-center mb-8">
        {/* Print Button */}
        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => {
              if (!overallComplianceRef.current) return;
              
              setIsPdfGenerating(true);
              
              setTimeout(() => {
                const content = overallComplianceRef.current;
                if (!content) {
                  setIsPdfGenerating(false);
                  return;
                }
                
                html2canvas(content, { scale: 2, useCORS: true, logging: false,
                  onclone: (document) => {
                    const buttons = document.querySelectorAll('button');
                    buttons.forEach(button => {
                      if (button.textContent?.includes('تصدير') || button.textContent?.includes('طباعة')) {
                        button.style.display = 'none';
                      }
                    });
                  }
                }).then(canvas => {
                  const imgData = canvas.toDataURL('image/png');
                  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                  const imgWidth = 210; 
                  const imgHeight = canvas.height * imgWidth / canvas.width;
                  let position = 0;
                  const pageHeight = 295; 
                  
                  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                  let remainingHeight = imgHeight - pageHeight;
                  
                  while (remainingHeight > 0) {
                    position -= pageHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    remainingHeight -= pageHeight;
                  }
                  
                  pdf.save(`تقرير_المستوى_العام_للالتزام_${new Date().toLocaleDateString('ar-SA')}.pdf`);
                  setIsPdfGenerating(false);
                }).catch(err => {
                  console.error("Error generating PDF:", err);
                  setIsPdfGenerating(false);
                });
              }, 100);
            }}
            disabled={isPdfGenerating}
            className="bg-nca-teal hover:bg-nca-dark-blue text-white"
          >
            {isPdfGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                جاري التصدير...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 ml-2" />
                تصدير PDF
              </>
            )}
          </Button>
        </div>
        
        {assessment.logoPath && (
          <div>
            <Image 
              src={assessment.logoPath} 
              alt={assessment.assessmentName} 
              className="mx-auto h-24 w-auto mb-4"
              width={96}
              height={96}
              priority // Prioritize loading logo
            />
          </div>
        )}
        <h2 className="text-lg font-medium text-slate-600">{assessment.assessmentName}</h2>
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
            {/* Add loading check specifically for this chart's data */}
            {isComplianceCountsLoading ? (
              <div className="flex justify-center items-center h-[350px]">
                <Loader2 className="h-6 w-6 animate-spin text-nca-teal" />
              </div>
            ) : Object.values(complianceCounts).every(count => count === 0) ? (
              <div className="text-center py-10 text-gray-600">
                لا توجد بيانات التزام لعرضها.
              </div>
            ) : (
              <ClientOnlyChart // Use the wrapper component
                options={{
                  chart: { type: 'pie', fontFamily: 'inherit' },
                  labels: complianceLevelOrder.map(level => complianceLevelLabels[level]),
                  colors: complianceLevelOrder.map(level => complianceLevelColors[level]),
                  legend: { position: 'bottom', fontFamily: 'inherit' },
                  tooltip: {
                    y: { formatter: (val: number) => `${val} ضابط` }, // Add type for val
                    style: { fontFamily: 'inherit' }
                  },
                  dataLabels: {
                    enabled: true,
                    // Add types for val and opts, disable lint for w: any
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter: (val: number, opts: { seriesIndex: number; w: any }) => {
                      const total = opts.w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                      if (total === 0) return '0%';
                      // Ensure series value is treated as a number
                      const seriesValue = Number(opts.w.globals.series[opts.seriesIndex]); 
                      if (isNaN(seriesValue)) return 'N/A'; // Handle potential NaN
                      return `${((seriesValue / total) * 100).toFixed(1)}%`;
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
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500">مستوى الالتزام</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500">عدد الضوابط</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500">النسبة المئوية</th>
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
      
      {/* System-specific compliance sections */}
      {isSystemsComplianceLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-nca-teal" />
          <span className="mr-2">جاري تحميل بيانات الأنظمة...</span>
        </div>
      ) : systemsComplianceError ? (
        <div className="flex justify-center items-center py-8 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span className="mr-2">خطأ في تحميل بيانات الأنظمة: {systemsComplianceError}</span>
        </div>
      ) : systemsComplianceData.length === 0 ? (
         systemsCount > 0 && // Only show if systems exist but data failed/is empty
         <div className="text-center py-8 text-gray-600">
           لا توجد بيانات التزام تفصيلية للأنظمة لعرضها.
         </div>
      ) : (
        <div className="mt-12">
          <h2 className="text-lg font-medium text-slate-600 text-center mb-8">مستوى الالتزام لكل نظام</h2>
          
          {systemsComplianceData.map((system, index) => (
            <div key={index} className="mb-12 pb-12 border-b border-gray-200 last:border-0">
              <h3 className="text-lg font-bold text-slate-800 text-center mb-6">
                مستوى نظام {system.systemName}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left column: Pie chart */}
                <Card className="shadow-md">
                  <CardHeader className="bg-gray-50 rounded-t-lg">
                    <CardTitle className="text-lg font-semibold text-slate-700">توزيع مستويات الالتزام</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {/* Add loading check specifically for this system's chart data */}
                    {isSystemsComplianceLoading ? ( // Use the overall system loading flag here
                       <div className="flex justify-center items-center h-[350px]">
                         <Loader2 className="h-6 w-6 animate-spin text-nca-teal" />
                       </div>
                    ) : Object.values(system.complianceCounts).every(count => count === 0) ? (
                      <div className="text-center py-10 text-gray-600">
                        لا توجد بيانات التزام لعرضها.
                      </div>
                    ) : (
                      <ClientOnlyChart // Use the wrapper component
                        options={{
                          chart: { type: 'pie', fontFamily: 'inherit' },
                          labels: complianceLevelOrder.map(level => complianceLevelLabels[level]),
                          colors: complianceLevelOrder.map(level => complianceLevelColors[level]),
                          legend: { position: 'bottom', fontFamily: 'inherit' },
                          tooltip: {
                            y: { formatter: (val: number) => `${val} ضابط` }, // Add type for val
                            style: { fontFamily: 'inherit' }
                          },
                          dataLabels: {
                            enabled: true,
                             // Add types for val and opts, disable lint for w: any
                             // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter: (val: number, opts: { seriesIndex: number; w: any }) => {
                              const total = opts.w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                              if (total === 0) return '0%';
                              // Ensure series value is treated as a number
                              const seriesValue = Number(opts.w.globals.series[opts.seriesIndex]);
                              if (isNaN(seriesValue)) return 'N/A'; // Handle potential NaN
                              return `${((seriesValue / total) * 100).toFixed(1)}%`;
                            },
                            style: { fontFamily: 'inherit' } 
                          },
                        }} 
                        series={complianceLevelOrder.map(level => system.complianceCounts[level])} 
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
                    <CardTitle className="text-lg font-semibold text-slate-700">إحصائيات النظام</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h4 className="text-xl font-bold text-slate-800 mb-2">اسم النظام</h4>
                      <div className="text-2xl font-bold text-nca-teal mb-8">{system.systemName}</div>
                      
                      <h4 className="text-xl font-bold text-slate-800 mb-4">إجمالي الضوابط</h4>
                      <div className="text-3xl font-bold text-slate-700">
                        {system.totalControls}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Compliance levels table for system */}
              <Card className="shadow-md">
                <CardHeader className="bg-gray-50 rounded-t-lg">
                  <CardTitle className="text-lg font-semibold text-slate-700">تفاصيل مستويات الالتزام</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500">مستوى الالتزام</th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500">عدد الضوابط</th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500">النسبة المئوية</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {complianceLevelOrder.map(level => {
                          const count = system.complianceCounts[level];
                          const total = Object.values(system.complianceCounts).reduce((sum, c) => sum + c, 0);
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
                            {Object.values(system.complianceCounts).reduce((sum, count) => sum + count, 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">100%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {/* Signature Section */}
          <div className="mt-16 mb-10">
            <div className="border-t border-gray-300 pt-8">
              <h2 className="text-xl font-bold text-slate-800 text-center mb-6">اعتماد مدير الأمن</h2>
              <div className="flex flex-col items-center">
                <div className="border-2 border-dashed border-gray-400 rounded-md w-64 h-32 mb-6 flex items-center justify-center bg-gray-50">
                  <span className="text-gray-400 text-sm"></span> {/* Placeholder for signature */}
                </div>
                <div className="grid grid-cols-2 gap-8 w-full max-w-lg">
                  <div className="flex flex-col items-center">
                    <div className="border-b border-gray-400 w-full text-center pb-1 mb-1">
                      &nbsp; {/* Placeholder for name */}
                    </div>
                    <span className="text-sm text-gray-600 p-2">الاسم</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="border-b border-gray-400 w-full text-center pb-1 mb-1">
                      &nbsp; {/* Placeholder for date */}
                    </div>
                    <span className="text-sm text-gray-600 p-2">التاريخ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
