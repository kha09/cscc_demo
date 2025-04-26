"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Bell, User as UserIcon, LogOut } from "lucide-react";

export function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/signin'); // Redirect to signin page after logout
  };

  // Determine the correct "Home" link based on user role if available
  // Defaulting to /dashboard, adjust if needed
  const homeLink = user?.role === 'DEPARTMENT_MANAGER' ? '/department-manager'
                 : user?.role === 'SECURITY_MANAGER' ? '/security-manager'
                 : user?.role === 'ADMIN' ? '/admin'
                 : '/dashboard'; // Fallback or general dashboard

  return (
    <header className="w-full bg-slate-900 text-white py-3 px-6 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Logo and Title - Right Side */}
        <div className="flex items-center gap-2 font-bold text-sm md:text-base lg:text-lg">
          <div className="relative h-16 w-16">
            <Link href={homeLink}>
              <Image
                src="/static/image/logo.png" width={160} height={160}
                alt="Logo"
                className="object-contain cursor-pointer"
              />
            </Link>
          </div>
          {/* Optional Title */}
          {/* <span className="text-lg">منصة تقييم الأمن السيبراني</span> */}
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
          {/* "الرئيسية" now always links to /home */}
          <Link href="/home" className="text-white hover:text-gray-300 px-3 py-2">
            الرئيسية
          </Link>
          {/* "لوحة المستخدم" now links to the user's specific dashboard */}
          <Link href={homeLink} className="text-white hover:text-gray-300 px-3 py-2">
            لوحة المستخدم
          </Link>
        </nav>

        {/* Spacer to push user icons to the left */}
        <div className="flex-grow"></div>

        {/* User Profile, Bell, Logout - Left Side */}
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
          {/* Note: Sidebar toggle is removed as it's specific to the department manager layout */}
        </div>
      </div>
    </header>
  );
}
