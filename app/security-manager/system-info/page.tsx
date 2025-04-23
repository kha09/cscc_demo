"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { User, SensitiveSystemInfo } from "@prisma/client"; // Import necessary types
import {
  Bell,
  User as UserIcon,
  // Search, // Removed unused import
  Menu,
  Server, // Sidebar icon
  // FileText, // Removed unused import
  // FileWarning, // Removed unused import
  LayoutDashboard, // Sidebar icon
  // ListChecks, // Removed unused import
  // ShieldCheck, // Removed unused import
  BarChart // Added for Results link
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card"; // Removed unused CardTitle
// Removed unused Input import
import Link from "next/link";

// Define the type for the fetched data including the nested assessment
type SensitiveSystemInfoWithAssessment = SensitiveSystemInfo & {
  assessment: {
    id: string;
    companyNameAr: string;
    companyNameEn: string;
  } | null;
};

export default function SystemInfoPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar
  const [userId, setUserId] = useState<string | null>(null); // SM User ID (temporary fetch)
  const [userError, setUserError] = useState<string | null>(null); // Error for user fetch

  // State for System Info list
  const [systemInfoList, setSystemInfoList] = useState<SensitiveSystemInfoWithAssessment[]>([]);
  const [systemInfoLoading, setSystemInfoLoading] = useState(true);
  const [systemInfoError, setSystemInfoError] = useState<string | null>(null);

  // --- Temporary User ID Fetch ---
  // In a real app, get this from auth context/session
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch('/api/users/security-managers'); 
        if (!response.ok) throw new Error('Failed to fetch security managers');
        const managers: User[] = await response.json();
        if (managers.length > 0) {
          setUserId(managers[0].id);
        } else {
          setUserError("No Security Manager user found.");
          setSystemInfoLoading(false); // Stop loading if no user
        }
      } catch (err: unknown) { // Changed any to unknown
        console.error("Error fetching user ID:", err);
        // Added instanceof Error check
        setUserError(err instanceof Error ? err.message : "Failed to get user ID");
        setSystemInfoLoading(false); // Stop loading on error
      }
    };
    fetchUserId();
  }, []);
  // --- End Temporary User ID Fetch ---

  // Fetch sensitive system info when userId is available
  useEffect(() => {
    if (!userId) return; 

    const fetchSystemInfo = async () => {
      setSystemInfoLoading(true);
      setSystemInfoError(null);
      try {
        const response = await fetch(`/api/users/${userId}/sensitive-systems`);
        if (!response.ok) {
          throw new Error(`Failed to fetch system info: ${response.statusText}`);
        }
        const data: SensitiveSystemInfoWithAssessment[] = await response.json();
        setSystemInfoList(data);
      } catch (err: unknown) { // Changed any to unknown
        console.error("Error fetching system info:", err);
        // Added instanceof Error check
        setSystemInfoError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setSystemInfoLoading(false);
      }
    };

    fetchSystemInfo();
  }, [userId]); 

  // Format date helper
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch { // Removed unused variable e
      return 'Invalid Date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="w-full bg-slate-900 text-white py-3 px-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm md:text-base lg:text-lg">
            <div className="relative h-16 w-16">
              <Image
                src="/static/image/logo.png" width={160} height={160}
                alt="Logo"
                className="object-contain"
              />
            </div>
          </div>
          <div className="flex-grow"></div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
              <UserIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-slate-700 md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
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
             <Button
               variant="ghost"
               size="icon"
               className="text-white hover:bg-slate-700"
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             >
               <Menu className="h-6 w-6" />
             </Button>
           </div>
          <nav className="space-y-2">
            {/* Sidebar Links - Copied from main dashboard, adjust active state if needed */}
            <Link href="/security-manager" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>لوحة المعلومات</span>
            </Link>
            {/* <Link href="/security-manager#assessments" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <ShieldCheck className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>التقييمات المعينة</span>
            </Link> */}
             {/* Highlight the current page */}
             <Link href="/security-manager/system-info" className={`flex items-center gap-3 px-3 py-2 rounded bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <Server className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>معلومات الأنظمة</span>
            </Link>
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
            {/* Link to Results/Analytics Page - Added */}
            <Link href="/security-manager/results" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <BarChart className="h-5 w-5 flex-shrink-0" /> {/* Using BarChart icon for analytics */}
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>النتائج</span>
            </Link>
            {/* Add missing Departments link (commented out) for consistency, though it wasn't here before */}
            {/* <Link href="/security-manager/departments" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <Building className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>إدارة الأقسام</span>
            </Link> */}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 p-6 overflow-y-auto h-[calc(100vh-76px)] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:mr-0' : 'md:mr-20'}`}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">معلومات الأنظمة المقدمة</h1>
            {/* Add search or filter if needed */}
          </div>

          {/* System Information Section */}
           <Card className="mb-6">
            <CardHeader>
              {/* Optional: Add filter/export buttons here if needed */}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-right border-b border-gray-200">
                      <th className="pb-3 font-medium text-gray-700 pr-4">اسم النظام</th>
                      <th className="pb-3 font-medium text-gray-700">فئة النظام</th>
                      <th className="pb-3 font-medium text-gray-700">الشركة</th>
                      <th className="pb-3 font-medium text-gray-700">تاريخ الإدخال</th>
                      <th className="pb-3 font-medium text-gray-700">إجمالي الأصول</th>
                      {/* <th className="pb-3 font-medium text-gray-700">الإجراءات</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {userError ? ( // Display error if user ID couldn't be fetched
                       <tr><td colSpan={5} className="text-center py-4 text-red-600">{userError}</td></tr>
                    ) : systemInfoLoading ? (
                      <tr><td colSpan={5} className="text-center py-4">جاري تحميل معلومات الأنظمة...</td></tr>
                    ) : systemInfoError ? (
                      <tr><td colSpan={5} className="text-center py-4 text-red-600">{systemInfoError}</td></tr>
                    ) : systemInfoList.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-4">لم يتم إدخال معلومات أنظمة بعد.</td></tr>
                    ) : (
                      systemInfoList.map((info) => (
                        <tr key={info.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 pr-4">{info.systemName}</td>
                          <td className="py-4">{info.systemCategory}</td>
                          <td className="py-4">{info.assessment?.companyNameAr || 'N/A'}</td>
                          <td className="py-4">{formatDate(info.createdAt)}</td>
                          <td className="py-4">{info.totalAssetCount}</td>
                          {/* Add actions like 'View Details' button if needed */}
                          {/* <td className="py-4">
                            <Button variant="ghost" size="sm">عرض</Button>
                          </td> */}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
