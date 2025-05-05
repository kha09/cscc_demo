"use client"

import { useState, useEffect, Suspense } from "react"; // Remove useRef
import Link from "next/link";
// Removed unused Image import
import { useAuth } from "@/lib/auth-context";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Removed TabsContent
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Menu, LayoutDashboard, Server, BarChart, Activity } from "lucide-react"; // Remove FileDown
import { GeneralResultsTab } from "@/components/ui/GeneralResultsTab";
import { OverallComplianceTab } from "@/components/ui/OverallComplianceTab";
// Removed unused User type import
// import type { User } from "@prisma/client";
// Remove PDF generation imports
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";


// --- Component ---

// Client component
function ResultsContent() {
  const router = useRouter();
  // State for layout
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // State for active tab, default to 'general'
  const [activeTab, setActiveTab] = useState<"general" | "overall">("general");

  // Auth state
  const { user, loading: authLoading } = useAuth(); // Keep only one call

  // State for assessment data (needed for checking approval status)
  const [assessment, setAssessment] = useState<{id: string; assessmentName: string; logoPath?: string} | null>(null);
  const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  // State to track if assessment is approved by security manager
  const [isAssessmentApproved, setIsAssessmentApproved] = useState<boolean>(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState<boolean>(false);

  // Remove PDF generation ref and state
  // const overallComplianceRef = useRef<HTMLDivElement>(null);
  // const [isPdfGenerating, setIsPdfGenerating] = useState(false);


  // --- Assessment Data Fetch & Approval Check ---
  useEffect(() => {
    if (!user?.id) {
      if (assessment) setAssessment(null);
      if (isAssessmentLoading) setIsAssessmentLoading(false);
      return;
    }

    // Removed duplicate user check block

    const userId = user.id;

    // Define checkAssessmentApproval inside the useEffect
    const checkAssessmentApproval = async (assessmentId: string, securityManagerId: string) => {
      setIsCheckingApproval(true);
      try {
        console.log(`Checking approval status for assessment ID: ${assessmentId}`);
        // Assuming the sensitiveSystemId is the same as assessmentId for the overall check
        const response = await fetch(`/api/assessment-status/security-check?assessmentId=${assessmentId}&sensitiveSystemId=${assessmentId}&securityManagerId=${securityManagerId}`);
        if (!response.ok) {
          throw new Error(`Failed to check approval status: ${response.statusText}`);
        }
        const data = await response.json();
        const isApproved = data.securityManagerStatus === 'FINISHED';
        setIsAssessmentApproved(isApproved);
        console.log(`Assessment approval status: ${isApproved ? 'Approved' : 'Not Approved'}`);
      } catch (err) {
        console.error("Error checking assessment approval:", err);
        // Optionally set an error state here
      } finally {
        setIsCheckingApproval(false);
      }
    };

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
          setAssessment(assessments[0]);
          // Check approval status after fetching the assessment
          checkAssessmentApproval(assessments[0].id, userId);
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

    // Fetch only if user exists and assessment is not already loaded/loading
    if (user?.id && !assessment && !isAssessmentLoading) {
      fetchAssessment();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Depend only on user ID to prevent loops if user object reference changes
  // --- End Assessment Data Fetch & Approval Check ---


  // Define estimated header height (should match AppHeader)
  const HEADER_HEIGHT = 88; // Adjust if AppHeader styling changes

  // Handle loading and unauthenticated states FIRST
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

  // Now render the main component structure
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
            <Link href="/security-manager/detailed-results" className={`flex items-center gap-3 px-3 py-2 rounded text-white text-sm hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <Activity className="h-4 w-4 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden md:hidden' : 'block'}`}>سير العمل</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        {/* Adjust margin based on sidebar state for desktop and height */}
        <main className={`flex-1 p-4 md:p-6 overflow-y-auto h-[calc(100vh-${HEADER_HEIGHT}px)] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:mr-64' : 'md:mr-20'}`}>
           {/* Tabs Navigation */}
           <Tabs
             value={activeTab}
             onValueChange={(val) => setActiveTab(val as "general" | "overall")} // Directly set state
             className="w-full"
             dir="rtl"
           > {/* Ensure Tabs has dir */}
             {/* Use flexbox for RTL tab order */}
             <TabsList className="flex w-full mb-4 flex-row-reverse justify-start gap-8 border-b">
               <TabsTrigger value="general" className="text-right data-[state=active]:border-b-2 data-[state=active]:border-nca-dark-blue data-[state=active]:text-nca-dark-blue pb-2 px-4 cursor-pointer">النتائج العامة</TabsTrigger>
               <TabsTrigger value="overall" className="text-right data-[state=active]:border-b-2 data-[state=active]:border-nca-dark-blue data-[state=active]:text-nca-dark-blue pb-2 px-4 cursor-pointer">المستوى العام للالتزام</TabsTrigger>
             </TabsList>

             {/* Conditionally render tab content directly */}
             {activeTab === 'general' && (
               <div> {/* Wrap content */}
                 {isCheckingApproval ? (
                   <div className="flex justify-center items-center h-[calc(100vh-250px)]">
                     <Loader2 className="h-8 w-8 animate-spin text-nca-teal" />
                   <span className="mr-2">جاري التحقق من حالة الاعتماد...</span>
                 </div>
               ) : !isAssessmentApproved ? (
                 <div className="flex flex-col justify-center items-center h-[calc(100vh-250px)] text-center">
                   <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                   <h3 className="text-xl font-bold text-slate-800 mb-2">لم يتم اعتماد التقييم بعد</h3>
                   <p className="text-gray-600 mb-6">يجب اعتماد التقييم من قبل مدير الأمن قبل عرض النتائج</p>
                   <Button
                     onClick={() => router.push('/security-manager')}
                     className="bg-nca-dark-blue hover:bg-nca-teal text-white"
                   >
                     العودة إلى لوحة المعلومات
                   </Button>
                 </div>
               ) : (
                 /* Render the GeneralResultsTab component */
                 <GeneralResultsTab
                   user={user}
                   isAssessmentApproved={isAssessmentApproved}
                   isCheckingApproval={isCheckingApproval}
                 />
               )}
               </div>
             )}

             {activeTab === 'overall' && (
               <div> {/* Wrap content */}
                 {/* Render the OverallComplianceTab component */}
                 <OverallComplianceTab
                   user={user}
                 assessment={assessment}
                 isAssessmentLoading={isAssessmentLoading}
                 assessmentError={assessmentError}
                 isAssessmentApproved={isAssessmentApproved}
                 isCheckingApproval={isCheckingApproval}
                   // Remove props related to PDF generation
                 />
               </div>
             )}
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
