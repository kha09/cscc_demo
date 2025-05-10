"use client"

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/ui/AppHeader";
import { cn } from "@/lib/utils";
import {
  Menu,
  LayoutDashboard,
  Users2,
  FileText,
  Building2,
  ClipboardList,
  MessageSquare,
} from "lucide-react";

export default function SecurityManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Define header height (based on AppHeader: py-3 + h-16 logo = 12+12+64 = 88px)
  const headerHeight = 88;

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Use the shared AppHeader */}
      <AppHeader />

      {/* Main Layout with Sidebar */}
      <div className="flex flex-row min-h-[calc(100vh-${headerHeight}px)]">
        {/* Sidebar */}
        <aside className={`bg-slate-800 text-white p-4 sticky top-[${headerHeight}px] overflow-y-auto transition-all duration-300 ease-in-out hidden md:block ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
          {/* Toggle Button inside sidebar for larger screens */}
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
            <Link href="/security-manager" className={cn(
              "flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700",
              !isSidebarOpen ? 'justify-center' : '',
              pathname === "/security-manager" && "bg-slate-700"
            )}>
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>لوحة المعلومات</span>
            </Link>
            <Link href="/security-manager/departments" className={cn(
              "flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700",
              !isSidebarOpen ? 'justify-center' : '',
              pathname === "/security-manager/departments" && "bg-slate-700"
            )}>
              <Building2 className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>الإدارات</span>
            </Link>
            <Link href="/security-manager/system-info" className={cn(
              "flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700",
              !isSidebarOpen ? 'justify-center' : '',
              pathname === "/security-manager/system-info" && "bg-slate-700"
            )}>
              <FileText className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>معلومات الأنظمة</span>
            </Link>
            <Link href="/security-manager/detailed-results" className={cn(
              "flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700",
              !isSidebarOpen ? 'justify-center' : '',
              pathname === "/security-manager/detailed-results" && "bg-slate-700"
            )}>
              <ClipboardList className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>النتائج التفصيلية</span>
            </Link>
            <Link href="/security-manager/manager-reviews" className={cn(
              "flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700",
              !isSidebarOpen ? 'justify-center' : '',
              pathname === "/security-manager/manager-reviews" && "bg-slate-700"
            )}>
              <MessageSquare className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>ملاحظات مدير القسم</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 p-6 overflow-y-auto h-[calc(100vh-${headerHeight}px)] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:mr-0' : 'md:mr-20'}`}>
          {/* Overlay for mobile when sidebar is open */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-10 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
