"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import type { SensitiveSystemInfo, Assessment } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SensitiveSystemForm from "@/components/sensitive-system-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// Extend SensitiveSystemInfo to include its assessment
type SensitiveSystemInfoWithAssessment = SensitiveSystemInfo & {
  assessment: {
    id: string;
    companyNameAr: string;
    companyNameEn: string;
  } | null;
};

export default function SystemInfoPage() {
  const { user, loading: authLoading } = useAuth();

  const [systemInfoList, setSystemInfoList] = useState<SensitiveSystemInfoWithAssessment[]>([]);
  const [systemInfoLoading, setSystemInfoLoading] = useState(true);
  const [systemInfoError, setSystemInfoError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [latestAssessmentId, setLatestAssessmentId] = useState<string>("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(true);
  const [assessmentsError, setAssessmentsError] = useState<string | null>(null);

  // Fetch assessments to find the latest one
  useEffect(() => {
    if (!user?.id) return;
    const userId = user.id;
    const fetchAssessments = async () => {
      setIsLoadingAssessments(true);
      setAssessmentsError(null);
      try {
        const resp = await fetch(`/api/users/${userId}/assessments`);
        if (!resp.ok) throw new Error(resp.statusText);
        const data: Assessment[] = await resp.json();
        setAssessments(data);
        if (data.length > 0) {
          const sorted = [...data].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setLatestAssessmentId(sorted[0].id);
        }
      } catch (err: unknown) {
        setAssessmentsError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoadingAssessments(false);
      }
    };
    fetchAssessments();
  }, [user]);

  // Fetch sensitive system info
  useEffect(() => {
    if (!user?.id) return;
    const userId = user.id;
    const fetchSystemInfo = async () => {
      setSystemInfoLoading(true);
      setSystemInfoError(null);
      try {
        const resp = await fetch(`/api/users/${userId}/sensitive-systems`);
        if (!resp.ok) throw new Error(resp.statusText);
        const data: SensitiveSystemInfoWithAssessment[] = await resp.json();
        setSystemInfoList(data);
      } catch (err: unknown) {
        setSystemInfoError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setSystemInfoLoading(false);
      }
    };
    fetchSystemInfo();
  }, [user]);

  // Format dates for display
  const formatDate = (dateString: string | Date) => {
    try {
      return new Date(dateString).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        جاري التحميل...
      </div>
    );
  }
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        الرجاء تسجيل الدخول للوصول لهذه الصفحة.
      </div>
    );
  }
  if (user.role !== "SECURITY_MANAGER") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        غير مصرح لك بالوصول لهذه الصفحة.
      </div>
    );
  }

  const HEADER_HEIGHT = 88;

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      <main
        className={`p-6 overflow-y-auto h-[calc(100vh-${HEADER_HEIGHT}px)] flex-1`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            معلومات الأنظمة المقدمة
          </h1>
          <Button
            variant="default"
            size="sm"
            className="bg-nca-teal text-white hover:bg-nca-teal-dark"
            onClick={() => setIsModalOpen(true)}
            disabled={isLoadingAssessments || !latestAssessmentId}
          >
            إضافة معلومات النظام
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 font-medium text-gray-700 pr-4">
                      اسم النظام
                    </th>
                    <th className="pb-3 font-medium text-gray-700">
                      فئة النظام
                    </th>
                    <th className="pb-3 font-medium text-gray-700">
                      الشركة
                    </th>
                    <th className="pb-3 font-medium text-gray-700">
                      تاريخ الإدخال
                    </th>
                    <th className="pb-3 font-medium text-gray-700">
                      إجمالي الأصول
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {systemInfoLoading ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center">
                        جاري تحميل معلومات الأنظمة...
                      </td>
                    </tr>
                  ) : systemInfoError ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-red-600">
                        {systemInfoError}
                      </td>
                    </tr>
                  ) : systemInfoList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center">
                        لم يتم إدخال معلومات أنظمة بعد.
                      </td>
                    </tr>
                  ) : (
                    systemInfoList.map((info) => (
                      <tr
                        key={info.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 pr-4">{info.systemName}</td>
                        <td className="py-4">{info.systemCategory}</td>
                        <td className="py-4">
                          {info.assessment?.companyNameAr || "N/A"}
                        </td>
                        <td className="py-4">{formatDate(info.createdAt)}</td>
                        <td className="py-4">{info.totalAssetCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة معلومات النظام</DialogTitle>
          </DialogHeader>
          {latestAssessmentId ? (
            <SensitiveSystemForm
              assessmentId={latestAssessmentId}
              onFormSubmit={() => {
                setIsModalOpen(false);
                // Refresh list
                if (user?.id) {
                  setSystemInfoLoading(true);
                  fetch(`/api/users/${user.id}/sensitive-systems`)
                    .then((r) => (r.ok ? r.json() : []))
                    .then((d) => setSystemInfoList(d))
                    .catch((e) => console.error(e))
                    .finally(() => setSystemInfoLoading(false));
                }
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
);
}
