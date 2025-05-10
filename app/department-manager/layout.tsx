"use client"

import { useState } from "react";
import Link from "next/link";
import { default as _Image } from "next/image";
import { useAuth as _useAuth } from "@/lib/auth-context";
import { useRouter as _useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/ui/AppHeader"; // Import the new header
import {
  // Bell, // Moved to AppHeader
  // User as UserIcon, // Moved to AppHeader
  LogOut as _LogOut, // Keep LogOut for sidebar close button
  Menu,
  LayoutDashboard,
  Users, // Icon for Team Tasks
  ClipboardCheck, // Icon for Detailed Results
} from "lucide-react";

export default function DepartmentManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // const { user, logout } = useAuth(); // Moved to AppHeader
  // const router = useRouter(); // Moved to AppHeader

  // const handleLogout = () => { // Moved to AppHeader
  //   logout();
  //   router.push('/signin');
  // };

  // Define header height (based on AppHeader: py-3 + h-16 logo = 12+12+64 = 88px)
  const headerHeight = 88;

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Use the shared AppHeader */}
      <AppHeader />

      {/* Main Layout with Sidebar */}
      {/* Flex container now has min-height to fill viewport below header, allowing it (and children) to grow taller if content requires */}
      <div className="flex flex-row min-h-[calc(100vh-${headerHeight}px)]"> {/* Added min-height calculation */}
        {/* Sidebar (Copied from Security Manager structure, adapted for Department Manager) */}
        {/* No explicit height - will stretch via flexbox */}
        {/* Sticky positioning remains to keep it below the header */}
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
            {/* Links for Department Manager */}
            <Link href="/department-manager" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>لوحة المعلومات</span>
            </Link>
            <Link href="/department-manager/team-tasks" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <Users className="h-5 w-5 flex-shrink-0" /> {/* Using Users icon */}
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>مهام الفريق</span>
            </Link>
            <Link href="/department-manager/detailed-results" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <ClipboardCheck className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>مراجعات مدير الأمن</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        {/* Re-added explicit height calculation to ensure it fills the viewport height below the header */}
        <main className={`flex-1 p-6 overflow-y-auto h-[calc(100vh-${headerHeight}px)] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:mr-0' : 'md:mr-20'}`}> {/* Adjust margin based on sidebar width */}
          {/* Overlay for mobile when sidebar is open */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-10 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}
          {children} {/* Page content will be rendered here */}
        </main>
      </div>
    </div>
  );
}
