"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAuth } from "@/lib/auth-context";
import { AlertCircle, Loader2, Menu, LayoutDashboard, Server, BarChart, Building, CheckCircle, MinusCircle, ChevronDown, ChevronUp, User } from "lucide-react";
import { TaskStatus } from "@prisma/client";

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
  [ComplianceLevel.NOT_IMPLEMENTED]: '#EF4444',
  [ComplianceLevel.PARTIALLY_IMPLEMENTED]: '#F59E0B',
  [ComplianceLevel.IMPLEMENTED]: '#10B981',
  [ComplianceLevel.NOT_APPLICABLE]: '#6B7280',
};

// Define estimated header height (should match AppHeader)
const HEADER_HEIGHT = 88; // Adjust if AppHeader styling changes

// --- Detailed Analytics Types ---
interface DetailedAssignmentData {
  id: string;
  status: TaskStatus;
  complianceLevel: ComplianceLevel | null;
  assignedUserId: string | null;
  reviewRequested: boolean;
  reviewComment?: string | null;
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

// Define SensitiveSystemInfo interface based on expected API response structure
interface SensitiveSystemInfo {
  id: string;
  systemName: string;
  systemDescription?: string | null;
  assessment?: {
    id: string;
    companyNameAr: string;
    companyNameEn: string;
    assessmentStatuses: {
      departmentManager: {
        nameAr: string | null;
        name: string;
        department: string | null;
      };
    }[];
  } | null;
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

// State for summary analytics per system (for the cards)
interface SystemSummaryAnalytics {
  assigned: number;
  finished: number;
}

function DetailedResultsContent() {
  // State for layout
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auth state
  const { user } = useAuth();

  // State for systems
  const [systems, setSystems] = useState<SensitiveSystemInfo[]>([]);
  const [isSystemsLoading, setIsSystemsLoading] = useState(false);
  const [systemsError, setSystemsError] = useState<string | null>(null);

  // State for summary analytics per system (for the cards)
  const [systemAnalytics, setSystemAnalytics] = useState<Record<string, SystemSummaryAnalytics>>({});
  const [isSystemAnalyticsLoading, setIsSystemAnalyticsLoading] = useState(false);
  const [systemAnalyticsError, setSystemAnalyticsError] = useState<string | null>(null);

  // State for detailed view when a system is selected
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [selectedSystemDetails, setSelectedSystemDetails] = useState<ProcessedDetailedAnalytics | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [expandedMainComponents, setExpandedMainComponents] = useState<Record<string, boolean>>({});
  const [updatingComplianceId, setUpdatingComplianceId] = useState<string | null>(null);

  // State for security review dialog
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedMainComponent, setSelectedMainComponent] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<"CONFIRM" | "REQUEST_REVIEW" | null>(null);
  const [selectedControls, setSelectedControls] = useState<string[]>([]);
  const [reviewNote, setReviewNote] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Fetch systems when user is available
  useEffect(() => {
    if (!user?.id) return;

    const fetchSystems = async () => {
      setIsSystemsLoading(true);
      setSystemsError(null);
      try {
        const response = await fetch(`/api/users/${user.id}/sensitive-systems`);
        if (!response.ok) {
          throw new Error(`Failed to fetch systems: ${response.statusText}`);
        }
        const data = await response.json();
        setSystems(data);
      } catch (err) {
        console.error("Error fetching systems:", err);
        setSystemsError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsSystemsLoading(false);
      }
    };

    fetchSystems();
  }, [user]);

  // Fetch summary analytics for all systems
  useEffect(() => {
    if (!user?.id || systems.length === 0) return;

    const fetchSystemAnalytics = async () => {
      setIsSystemAnalyticsLoading(true);
      setSystemAnalyticsError(null);
      try {
        const response = await fetch(`/api/control-assignments/analytics/summary-by-system?securityManagerId=${user.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch analytics: ${response.statusText}`);
        }
        const data = await response.json();
        setSystemAnalytics(data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setSystemAnalyticsError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsSystemAnalyticsLoading(false);
      }
    };

    fetchSystemAnalytics();
  }, [user, systems]);

  // Fetch detailed analytics when a system is selected
  useEffect(() => {
    if (!selectedSystemId || !user?.id) return;

    const fetchDetailedAnalytics = async () => {
      setIsDetailsLoading(true);
      setDetailsError(null);
      try {
        const response = await fetch(`/api/control-assignments/analytics/by-system/${selectedSystemId}?securityManagerId=${user.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch detailed analytics: ${response.statusText}`);
        }
        const data: DetailedSystemAnalyticsResponse = await response.json();
        
        // Process the data into the required format
        const processedData: ProcessedDetailedAnalytics = {};
        data.assignments.forEach(assignment => {
          const mainComponent = assignment.control.mainComponent;
          if (!processedData[mainComponent]) {
            processedData[mainComponent] = {
              subControls: [],
              counts: {
                total: 0,
                finished: 0,
                assigned: 0,
                notAssigned: 0
              }
            };
          }
          
          processedData[mainComponent].subControls.push(assignment);
          processedData[mainComponent].counts.total++;
          if (assignment.status === TaskStatus.COMPLETED) {
            processedData[mainComponent].counts.finished++;
          }
          if (assignment.assignedUserId) {
            processedData[mainComponent].counts.assigned++;
          } else {
            processedData[mainComponent].counts.notAssigned++;
          }
        });

          setSelectedSystemDetails(processedData);

          // Also refresh the summary analytics
          const analyticsResponse = await fetch(`/api/control-assignments/analytics/summary-by-system?securityManagerId=${user.id}`);
          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            setSystemAnalytics(analyticsData);
          }
      } catch (err) {
        console.error("Error fetching detailed analytics:", err);
        setDetailsError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsDetailsLoading(false);
      }
    };

    fetchDetailedAnalytics();
  }, [selectedSystemId, user]);

  // Handle security review submission
  const handleSecurityReviewSubmit = async () => {
    if (!selectedMainComponent || !selectedAction || selectedControls.length === 0) {
      return;
    }

    setIsSubmittingReview(true);
    try {
      // Get stored user from localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('User not found');
      }

      const response = await fetch('/api/security-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${encodeURIComponent(storedUser)}`,
        },
        body: JSON.stringify({
          systemId: selectedSystemId,
          mainComponent: selectedMainComponent,
          action: selectedAction,
          note: reviewNote,
          controlAssignmentIds: selectedControls,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit security review');
      }

      // Show success message and reset form
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSelectedAction(null);
        setSelectedControls([]);
        setReviewNote('');
        setIsReviewDialogOpen(false);
      }, 1500);

      // Refresh the detailed view
      if (selectedSystemId && user?.id) {
        const response = await fetch(`/api/control-assignments/analytics/by-system/${selectedSystemId}?securityManagerId=${user.id}`);
        if (response.ok) {
          const data: DetailedSystemAnalyticsResponse = await response.json();
          
          // Process the data into the required format
          const processedData: ProcessedDetailedAnalytics = {};
          data.assignments.forEach(assignment => {
            const mainComponent = assignment.control.mainComponent;
            if (!processedData[mainComponent]) {
              processedData[mainComponent] = {
                subControls: [],
                counts: {
                  total: 0,
                  finished: 0,
                  assigned: 0,
                  notAssigned: 0
                }
              };
            }
            
            processedData[mainComponent].subControls.push(assignment);
            processedData[mainComponent].counts.total++;
            if (assignment.status === TaskStatus.COMPLETED) {
              processedData[mainComponent].counts.finished++;
            }
            if (assignment.assignedUserId) {
              processedData[mainComponent].counts.assigned++;
            } else {
              processedData[mainComponent].counts.notAssigned++;
            }
          });

          setSelectedSystemDetails(processedData);
        }
      }
    } catch (error) {
      console.error('Error submitting security review:', error);
      // Handle error (show notification, etc.)
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      <AppHeader />
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
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          {/* Toggle button for desktop */}
          <div className={`hidden md:flex ${isSidebarOpen ? 'justify-end' : 'justify-center'} mb-4`}>
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <nav className="space-y-1">
            {/* Sidebar Links */}
            <Link href="/security-manager" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 text-sm ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden md:hidden' : 'block'}`}>لوحة المعلومات</span>
            </Link>
            <Link href="/security-manager/system-info" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 text-sm ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <Server className="h-4 w-4 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden md:hidden' : 'block'}`}>معلومات الأنظمة</span>
            </Link>
            <Link href="/security-manager/results" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 text-sm ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <BarChart className="h-4 w-4 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden md:hidden' : 'block'}`}>النتائج</span>
            </Link>
            <Link href="/security-manager/detailed-results" className={`flex items-center gap-3 px-3 py-2 rounded bg-nca-dark-blue text-white font-semibold text-sm ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <span className={`${!isSidebarOpen ? 'hidden md:hidden' : 'block'}`}>سير العمل</span>
            </Link>
          </nav>
        </aside>
        <main className={`flex-1 p-4 md:p-6 overflow-y-auto h-[calc(100vh-${HEADER_HEIGHT}px)] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:mr-64' : 'md:mr-20'}`}>
          <div className="space-y-6 pt-4" dir="rtl">
            {/* Combined loading state check */}
            {isSystemsLoading || isSystemAnalyticsLoading ? (
              <div className="flex justify-center items-center h-[calc(100vh-250px)]">
                <Loader2 className="h-8 w-8 animate-spin text-nca-teal" />
                <span className="mr-2">جاري تحميل بيانات الأنظمة والنتائج...</span>
              </div>
            ) : null}

            {/* Combined error state check */}
            {(systemsError || systemAnalyticsError) && !(isSystemsLoading || isSystemAnalyticsLoading) ? (
              <div className="flex justify-center items-center h-[calc(100vh-250px)] text-red-600">
                <AlertCircle className="h-6 w-6" />
                <span className="mr-2">خطأ في تحميل البيانات: {systemsError || systemAnalyticsError}</span>
              </div>
            ) : null}

            {/* No systems found */}
            {systems.length === 0 && !(isSystemsLoading || systemsError) ? (
              <div className="text-center py-10 text-gray-600">
                لم يتم العثور على أنظمة حساسة مرتبطة بهذا المستخدم.
              </div>
            ) : null}

            {/* Render system boxes */}
            {!isSystemsLoading && !systemsError && systems.length > 0 ? (
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
                        <span className="font-medium text-red-600">-- / 105</span>
                      </div>
                      {/* Department Manager Information */}
                      <div className="flex items-center gap-2 pt-2 border-t mt-2 text-gray-700">
                        <Building className="h-4 w-4 text-gray-500"/>
                        <span>
                          مدير القسم:{' '}
                          {system.assessment?.assessmentStatuses?.[0]?.departmentManager 
                            ? `${system.assessment.assessmentStatuses[0].departmentManager.nameAr || system.assessment.assessmentStatuses[0].departmentManager.name} - ${system.assessment.assessmentStatuses[0].departmentManager.department}`
                            : 'غير متوفر'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}

            {/* Detailed View Area */}
            {selectedSystemId && (
              <div className="mt-6" dir="rtl">
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
                      .sort(([mainA], [mainB]) => mainA.localeCompare(mainB))
                      .map(([mainComponent, data]) => (
                      <Card key={mainComponent} className="shadow-sm border border-gray-200">
                        <CardHeader
                          className="bg-gray-100 rounded-t-md p-3 flex flex-row justify-between items-center cursor-pointer hover:bg-gray-200"
                          onClick={() => setExpandedMainComponents(prev => ({ ...prev, [mainComponent]: !prev[mainComponent] }))}
                        >
                          <CardTitle className="text-base font-medium text-slate-700">{mainComponent}</CardTitle>
                          <div className="flex items-center gap-4">
                            <div className="text-xs text-gray-600">
                              <span>الإجمالي: {data.counts.total}</span>
                              <span className="mx-2 text-green-600">مكتمل: {data.counts.finished}</span>
                              <span className="mx-2 text-blue-600">معين: {data.counts.assigned}</span>
                              <span className="mx-2 text-orange-600">غير معين: {data.counts.notAssigned}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMainComponent(mainComponent);
                                setIsReviewDialogOpen(true);
                              }}
                              className="mr-4"
                            >
                              الإجراء
                            </Button>
                            {expandedMainComponents[mainComponent] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </CardHeader>
                        {expandedMainComponents[mainComponent] && (
                          <CardContent className="p-0">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="px-4 py-2 text-right font-medium text-gray-500 tracking-wider">رقم الضابط</th>
                                    <th scope="col" className="px-4 py-2 text-right font-medium text-gray-500 tracking-wider">نص الضابط / المكون الفرعي</th>
                                    <th scope="col" className="px-4 py-2 text-center font-medium text-gray-500 tracking-wider">الحالة</th>
                                    <th scope="col" className="px-4 py-2 text-center font-medium text-gray-500 tracking-wider">مستوى الامتثال</th>
                                    <th scope="col" className="px-4 py-2 text-center font-medium text-gray-500 tracking-wider">طلب مراجعة</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {data.subControls.map(assignment => (
                                    <tr key={assignment.id}>
                                      <td className="px-4 py-2 whitespace-nowrap text-gray-700">{assignment.control.controlNumber}</td>
                                      <td className="px-4 py-2 text-gray-700">{assignment.control.subComponent || assignment.control.controlText}</td>
                                      <td className="px-4 py-2 text-center whitespace-nowrap">
                                        {assignment.status === TaskStatus.COMPLETED ? (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <CheckCircle className="h-3 w-3 mr-1" /> مكتمل
                                          </span>
                                        ) : assignment.assignedUserId ? (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            <User className="h-3 w-3 mr-1" /> معين
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                            <MinusCircle className="h-3 w-3 mr-1" /> غير معين
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-2 text-center whitespace-nowrap">
                                        <div className="relative">
                                          <Select
                                            value={assignment.complianceLevel ?? undefined}
                                            onValueChange={async (value) => {
                                              setUpdatingComplianceId(assignment.id);
                                              try {
                                                const response = await fetch(`/api/control-assignments/${assignment.id}`, {
                                                  method: 'PATCH',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({
                                                    complianceLevel: value || null
                                                  })
                                                });
                                                
                                                if (!response.ok) {
                                                  throw new Error('Failed to update compliance level');
                                                }
                                                
                                                // Update local state
                                                if (selectedSystemDetails) {
                                                  const updatedDetails = { ...selectedSystemDetails };
                                                  Object.keys(updatedDetails).forEach(mainComponent => {
                                                    updatedDetails[mainComponent].subControls = 
                                                      updatedDetails[mainComponent].subControls.map(control => 
                                                        control.id === assignment.id 
                                                          ? { ...control, complianceLevel: (value as ComplianceLevel) || null }
                                                          : control
                                                      );
                                                  });
                                                  setSelectedSystemDetails(updatedDetails);
                                                }
                                              } catch (error) {
                                                console.error('Error updating compliance level:', error);
                                                setDetailsError('Failed to update compliance level. Please try again.');
                                              } finally {
                                                setUpdatingComplianceId(null);
                                              }
                                            }}
                                            disabled={updatingComplianceId === assignment.id}
                                          >
                                            <SelectTrigger 
                                              className="h-7 w-36 text-xs justify-center"
                                              style={{
                                                backgroundColor: assignment.complianceLevel 
                                                  ? `${complianceLevelColors[assignment.complianceLevel]}20`
                                                  : undefined,
                                                color: assignment.complianceLevel 
                                                  ? complianceLevelColors[assignment.complianceLevel]
                                                  : '#9CA3AF'
                                              }}
                                            >
                                              <SelectValue placeholder="-" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {Object.entries(complianceLevelLabels).map(([level, label]) => (
                                                <SelectItem key={level} value={level}>
                                                  {label}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          {updatingComplianceId === assignment.id && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-center whitespace-nowrap">
{assignment.reviewRequested ? (
  <div className="relative inline-block group">
    <div className="flex items-center justify-center">
      <AlertCircle className="h-5 w-5 text-amber-500 cursor-help" />
    </div>
    {assignment.reviewComment && (
      <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-200 rounded-md shadow-lg p-2 w-64 text-right text-xs text-gray-700 right-0 mt-1">
        <p className="font-bold mb-1">تعليق المراجعة:</p>
        <p>{assignment.reviewComment}</p>
      </div>
    )}
  </div>
) : assignment.status === TaskStatus.APPROVED ? (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            معتمد
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
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Security Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>مراجعة الضوابط</DialogTitle>
            {showSuccessMessage && (
              <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-md text-sm flex items-center justify-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                تم حفظ المراجعة بنجاح
              </div>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Select
                value={selectedAction || undefined}
                onValueChange={(value: "CONFIRM" | "REQUEST_REVIEW") => setSelectedAction(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر الإجراء" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONFIRM">اعتماد</SelectItem>
                  <SelectItem value="REQUEST_REVIEW">طلب مراجعة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-3 space-y-2">
                <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border rounded-md">
                  {selectedControls.map(controlId => {
                    const control = selectedMainComponent && 
                      selectedSystemDetails?.[selectedMainComponent]?.subControls.find(c => c.id === controlId)?.control;
                    return control ? (
                      <div key={controlId} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md text-xs">
                        <span>{control.controlNumber}</span>
                        <button
                          onClick={() => setSelectedControls(prev => prev.filter(id => id !== controlId))}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
                <Select
                  value={undefined}
                  onValueChange={(value: string) => {
                    if (!selectedControls.includes(value)) {
                      setSelectedControls(prev => [...prev, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الضوابط" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedMainComponent && selectedSystemDetails?.[selectedMainComponent]?.subControls
                      .filter(control => !selectedControls.includes(control.id))
                      .map(control => (
                        <SelectItem key={control.id} value={control.id}>
                          {control.control.controlNumber} - {control.control.subComponent || control.control.controlText}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Textarea
                value={reviewNote}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewNote(e.target.value)}
                placeholder="أضف ملاحظاتك هنا..."
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSecurityReviewSubmit}
              disabled={!selectedAction || selectedControls.length === 0 || isSubmittingReview}
            >
              {isSubmittingReview ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SecurityManagerDetailedResultsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>}>
      <DetailedResultsContent />
    </Suspense>
  );
}
