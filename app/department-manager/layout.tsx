"use client"

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/ui/AppHeader"; // Import the new header
import {
  // Bell, // Moved to AppHeader
  // User as UserIcon, // Moved to AppHeader
  LogOut, // Keep LogOut for sidebar close button
  Menu,
  LayoutDashboard,
  Users, // Icon for Team Tasks
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

  // Calculate header height dynamically if possible, or use a fixed value
  const headerHeight = 76; // Assuming the header height is approx 76px based on previous code

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Use the shared AppHeader */}
      <AppHeader />

      {/* Main Layout with Sidebar */}
      {/* Adjust top padding/margin if needed based on sticky header */}
      <div className="flex flex-row">
        {/* Sidebar */}
        {/* Adjust sidebar positioning based on the actual header height */}
        <aside className={`bg-slate-800 text-white p-4 fixed md:sticky top-0 md:top-[${headerHeight}px] right-0 h-full md:h-[calc(100vh-${headerHeight}px)] z-20 md:z-0 overflow-y-auto transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:relative ${isSidebarOpen ? 'w-64' : 'md:w-20'}`}>
           {/* Close button for mobile */}
           <div className="flex md:hidden justify-start mb-4">
             <Button
               variant="ghost"
               size="icon"
               className="text-white hover:bg-slate-700"
               onClick={() => setIsSidebarOpen(false)}
             >
               {/* Using a more appropriate icon for close if available, otherwise keep LogOut */}
               <LogOut className="h-6 w-6" /> {/* Placeholder: Consider changing icon */}
             </Button>
           </div>
           {/* Toggle Button inside sidebar for larger screens */}
           <div className={`hidden md:flex ${isSidebarOpen ? 'justify-end' : 'justify-center'} mb-4`}>
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
              <Users className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>مهام الفريق</span>
            </Link>
            {/* Add more links as needed */}
          </nav>
        </aside>

        {/* Main Content Area */}
        {/* Adjust main content height based on header height */}
        <main className={`flex-1 p-6 overflow-y-auto h-[calc(100vh-${headerHeight}px)] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:mr-0' : 'md:mr-20'}`}>
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
