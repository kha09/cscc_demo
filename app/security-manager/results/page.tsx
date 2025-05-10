"use client"

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { GeneralResultsTab } from "@/components/ui/GeneralResultsTab";
import { OverallComplianceTab } from "@/components/ui/OverallComplianceTab";

// Client component
function ResultsContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "overall">("general");

  // Auth state
  const { user, loading: authLoading } = useAuth();

  // State for assessment data (needed for checking approval status)
  const [assessment, setAssessment] = useState<{id: string; assessmentName: string; logoPath?: string} | null>(null);
  const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  // State to track if assessment is approved by security manager
  const [isAssessmentApproved, setIsAssessmentApproved] = useState<boolean>(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState<boolean>(false);

  // --- Assessment Data Fetch & Approval Check ---
  useEffect(() => {
    if (!user?.id) {
      if (assessment) setAssessment(null);
      if (isAssessmentLoading) setIsAssessmentLoading(false);
      return;
    }

    const userId = user.id;

    const checkAssessmentApproval = async (assessmentId: string, securityManagerId: string) => {
      setIsCheckingApproval(true);
      try {
        console.log(`Checking approval status for assessment ID: ${assessmentId}`);
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
  }, [user?.id]); // Depend only on user ID to prevent loops if user object reference changes

  // Handle loading and unauthenticated states FIRST
  if (authLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]">جاري التحميل...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-[60vh]">الرجاء تسجيل الدخول للوصول لهذه الصفحة.</div>;
  }

  // Ensure user is a Security Manager
  if (user.role !== 'SECURITY_MANAGER') {
    return <div className="flex justify-center items-center min-h-[60vh]">غير مصرح لك بالوصول لهذه الصفحة.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "general" | "overall")}
        className="w-full"
        dir="rtl"
      >
        <TabsList className="flex w-full mb-4 flex-row-reverse justify-start gap-8 border-b">
          <TabsTrigger value="general" className="text-right data-[state=active]:border-b-2 data-[state=active]:border-nca-dark-blue data-[state=active]:text-nca-dark-blue pb-2 px-4 cursor-pointer">النتائج العامة</TabsTrigger>
          <TabsTrigger value="overall" className="text-right data-[state=active]:border-b-2 data-[state=active]:border-nca-dark-blue data-[state=active]:text-nca-dark-blue pb-2 px-4 cursor-pointer">المستوى العام للالتزام</TabsTrigger>
        </TabsList>

        {/* Conditionally render tab content directly */}
        {activeTab === 'general' && (
          <div>
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
              <GeneralResultsTab
                user={user}
                isAssessmentApproved={isAssessmentApproved}
                isCheckingApproval={isCheckingApproval}
              />
            )}
          </div>
        )}

        {activeTab === 'overall' && (
          <div>
            <OverallComplianceTab
              user={user}
              assessment={assessment}
              isAssessmentLoading={isAssessmentLoading}
              assessmentError={assessmentError}
              isAssessmentApproved={isAssessmentApproved}
              isCheckingApproval={isCheckingApproval}
            />
          </div>
        )}
      </Tabs>
    </div>
  );
}

// Main page component with Suspense boundary
export default function SecurityManagerResultsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]">جاري التحميل...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
