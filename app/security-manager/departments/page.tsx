'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Image from "next/image"; // Added for header logo
import Link from "next/link"; // Added for sidebar links
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  Trash2, // Icon for delete button
  Bell,   // Header icon
  User as UserIcon, // Header icon
  Menu,   // Sidebar toggle icon
  Server, // Sidebar icon
  FileText, // Sidebar icon
  FileWarning, // Sidebar icon
  LayoutDashboard, // Sidebar icon
  ListChecks, // Sidebar icon
  ShieldCheck, // Sidebar icon
  Building, // Sidebar icon (current page)
  BarChart // Added for Results link
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context'; // Assuming you have auth context
import { useRouter } from 'next/navigation';

interface Department {
    id: string;
    name: string;
    createdAt: string; // Or Date if you parse it
    updatedAt: string; // Or Date
}

export default function ManageDepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addError, setAddError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar

    const { user: _user } = useAuth(); // Prefixed unused user
    const _router = useRouter(); // Prefixed unused router

    // Optional: Redirect if not a security manager (or admin)
    // useEffect(() => {
    //     if (_user && _user.role !== 'SECURITY_MANAGER' && _user.role !== 'ADMIN') { // Use _user
    //         _router.push('/unauthorized'); // Or your login/home page // Use _router
    //     }
    // }, [_user, _router]); // Use _user, _router

    // Fetch departments on component mount
    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/departments');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: Department[] = await response.json();
            setDepartments(data);
        } catch (err) {
            console.error("Failed to fetch departments:", err);
            if (err instanceof Error) {
                setError(`فشل في تحميل قائمة الأقسام: ${err.message}`);
            } else {
                setError('فشل في تحميل قائمة الأقسام.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddDepartment = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAddError(null);
        if (!newDepartmentName.trim()) {
            setAddError('اسم القسم مطلوب.');
            return;
        }

        try {
            const response = await fetch('/api/departments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newDepartmentName.trim() }),
            });

            const result = await response.json();

            if (!response.ok) {
                 // Use message from API if available, otherwise generic error
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            setNewDepartmentName(''); // Clear input
            fetchDepartments(); // Refresh the list
        } catch (err) {
             console.error("Failed to add department:", err);
             if (err instanceof Error) {
                setAddError(`فشل في إضافة القسم: ${err.message}`);
            } else {
                setAddError('فشل في إضافة القسم.');
            }
        }
    };

    const handleDeleteDepartment = async (departmentId: string) => {
        // Optional: Add a confirmation dialog here
        if (!confirm(`هل أنت متأكد من رغبتك في حذف هذا القسم؟ لا يمكن التراجع عن هذا الإجراء.`)) {
             return;
        }

        try {
            const response = await fetch(`/api/departments/${departmentId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                // Try to get error message from response body if available
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const result = await response.json();
                    errorMsg = result.message || errorMsg;
                } catch { // Removed unused variable _err
                    // Ignore if response body is not JSON or empty
                }
                 throw new Error(errorMsg);
            }

            fetchDepartments(); // Refresh the list
        } catch (err) {
            console.error("Failed to delete department:", err);
             if (err instanceof Error) {
                alert(`فشل في حذف القسم: ${err.message}`); // Use alert for delete errors
            } else {
                alert('فشل في حذف القسم.');
            }
        }
    };

    // Optional: Add loading state check for user role if implementing redirection
    // if (!_user) return <div>Loading user data...</div>; // Use _user

    return (
        <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
            {/* Header - Copied from system-info */}
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

            {/* Main Layout with Sidebar - Copied from system-info */}
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
                        {/* Sidebar Links - Copied from main dashboard */}
                        <Link href="/security-manager" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
                            <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                            <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>لوحة المعلومات</span>
                        </Link>
                        <Link href="/security-manager#assessments" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
                            <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                            <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>التقييمات المعينة</span>
                        </Link>
                        <Link href="/security-manager/system-info" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
                            <Server className="h-5 w-5 flex-shrink-0" />
                            <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>معلومات الأنظمة</span>
                        </Link>
                        {/* Highlight the current page */}
                        <Link href="/security-manager/departments" className={`flex items-center gap-3 px-3 py-2 rounded bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
                            <Building className="h-5 w-5 flex-shrink-0" />
                            <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>إدارة الأقسام</span>
                        </Link>
                        <Link href="/security-manager#tasks" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
                            <ListChecks className="h-5 w-5 flex-shrink-0" />
                            <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>المهام</span>
                        </Link>
                        <Link href="/security-manager#risks" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
                            <FileWarning className="h-5 w-5 flex-shrink-0" />
                            <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>المخاطر</span>
                        </Link>
                        <Link href="/security-manager#reports" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
                            <FileText className="h-5 w-5 flex-shrink-0" />
                            <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>التقارير</span>
                        </Link>
                        <Link href="/security-manager/results" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
                            <BarChart className="h-5 w-5 flex-shrink-0" />
                            <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>النتائج</span>
                        </Link>
                        <Link href="/security-manager/results?tab=detailed" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
                            <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>سير العمل</span>
                        </Link>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className={`flex-1 p-6 overflow-y-auto h-[calc(100vh-76px)] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:mr-0' : 'md:mr-20'}`}>
                    {/* Original Page Content Starts Here */}
                    <div className="flex justify-between items-center mb-6">
                         <h1 className="text-2xl font-bold text-slate-800">إدارة الأقسام</h1>
                         {/* Optional: Add search or other controls if needed */}
                    </div>


                    {/* Add Department Form */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>إضافة قسم جديد</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleAddDepartment}>
                            <CardContent>
                                <Input
                                    type="text"
                                    placeholder="أدخل اسم القسم الجديد"
                                    value={newDepartmentName}
                                    onChange={(e) => setNewDepartmentName(e.target.value)}
                                    required
                                    className="mb-2"
                                />
                                {addError && <p className="text-red-500 text-sm">{addError}</p>}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit">إضافة القسم</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* Departments List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>الأقسام الحالية</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading && <p>جاري تحميل الأقسام...</p>}
                            {error && <p className="text-red-500">{error}</p>}
                            {!isLoading && !error && departments.length === 0 && (
                                <p>لا توجد أقسام مضافة حالياً.</p>
                            )}
                            {!isLoading && !error && departments.length > 0 && (
                                <ul className="space-y-3">
                                    {departments.map((dept) => (
                                        <li key={dept.id} className="flex justify-between items-center p-3 border rounded-md bg-gray-50 hover:bg-gray-100">
                                            <span className="font-medium">{dept.name}</span>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteDepartment(dept.id)}
                                                aria-label={`حذف قسم ${dept.name}`}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                حذف
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                    {/* Original Page Content Ends Here */}
                </main>
            </div>
        </div>
    );
}
