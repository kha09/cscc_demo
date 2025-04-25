"use client"

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context"; // Import useAuth
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Bell,
  User as UserIcon,
  LogOut,
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
  const { user, logout } = useAuth(); // Get user and logout function
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/signin'); // Redirect to signin page after logout
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="w-full bg-slate-900 text-white py-3 px-6 sticky top-0 z-10">
         <div className="flex items-center justify-between">
           {/* Logo and Title - Right Side */}
           <div className="flex items-center gap-2 font-bold text-sm md:text-base lg:text-lg">
             <div className="relative h-16 w-16">
               <Image
                 src="/static/image/logo.png" width={160} height={160}
                 alt="Logo"
                 className="object-contain"
               />
             </div>
             {/* Optional Title */}
             {/* <span className="text-lg">منصة تقييم الأمن السيبراني</span> */}
           </div>

           {/* Center Navigation (Keep or remove based on overall app structure) */}
           {/* <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
             <Link href="/dashboard" className="text-white hover:text-gray-300 px-3 py-2">
               الرئيسية
             </Link>
             <Link href="#" className="text-white hover:text-gray-300 px-3 py-2">
               التقارير
             </Link>
             <Link href="/assessment" className="text-white hover:text-gray-300 px-3 py-2">
               التقييم
             </Link>
             <Link href="#" className="text-white hover:text-gray-300 px-3 py-2">
               الدعم
             </Link>
           </nav> */}
            <div className="flex-grow"></div> {/* Spacer */}


           {/* User Profile, Bell, Logout, Sidebar Toggle - Left Side */}
           <div className="flex items-center space-x-4 space-x-reverse">
             <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
               <Bell className="h-5 w-5" />
             </Button>
             <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
               <UserIcon className="h-5 w-5" />
             </Button>
             <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={handleLogout}>
               <LogOut className="h-5 w-5" />
             </Button>
             {/* Sidebar Toggle Button */}
             <Button
               variant="ghost"
               size="icon"
               className="text-white hover:bg-slate-700 md:hidden" // Show only on smaller screens
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
        {/* Conditional rendering for mobile */}
        <aside className={`bg-slate-800 text-white p-4 fixed md:sticky top-0 md:top-[76px] right-0 h-full md:h-[calc(100vh-76px)] z-20 md:z-0 overflow-y-auto transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:relative ${isSidebarOpen ? 'w-64' : 'md:w-20'}`}>
           {/* Close button for mobile */}
           <div className="flex md:hidden justify-start mb-4">
             <Button
               variant="ghost"
               size="icon"
               className="text-white hover:bg-slate-700"
               onClick={() => setIsSidebarOpen(false)}
             >
               <LogOut className="h-6 w-6" /> {/* Using LogOut as a generic close icon */}
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
        {/* Adjusted margin-right based on sidebar state for larger screens */}
        <main className={`flex-1 p-6 overflow-y-auto h-[calc(100vh-76px)] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:mr-64' : 'md:mr-20'}`}>
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
