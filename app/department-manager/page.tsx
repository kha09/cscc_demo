"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type { User as PrismaUser, Task as PrismaTask, Control as PrismaControl, SensitiveSystemInfo as PrismaSensitiveSystemInfo } from "@prisma/client"; // Use type imports
// No longer need Zod here
import {
  Bell,
  User as UserIcon,
  ClipboardList, 
  BarChart, 
  FileText, 
  AlertTriangle, 
  Search,
  Filter,
  Download,
  CheckCircle,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

// Define a more specific Task type for the frontend, including nested data
// This uses Prisma's generated types for better type safety
interface FrontendTask extends Omit<PrismaTask, 'deadline' | 'createdAt' | 'updatedAt' | 'sensitiveSystem' | 'controls'> {
  deadline: string; // Keep as string for initial state, format later
  createdAt: string;
  sensitiveSystem: Pick<PrismaSensitiveSystemInfo, 'systemName'> | null; // Allow null
  controls: Pick<PrismaControl, 'id' | 'controlText'>[];
  // Add assignedTo if needed for display
  // assignedTo?: Pick<PrismaUser, 'id' | 'name' | 'nameAr'> | null;
}


export default function DepartmentManagerDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  // Use the correct FrontendTask type for the state
  const [tasks, setTasks] = useState<FrontendTask[]>([]) // State for tasks
  const [isLoading, setIsLoading] = useState(true) // Loading state
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // State for current user ID (logged-in Dept Manager)
  // const [currentUserDeptName, setCurrentUserDeptName] = useState<string | null>(null); // No longer needed

  // --- Fetch Current User (Department Manager) ---
  // TODO: Replace with actual user ID from auth context/session
  useEffect(() => {
    const fetchDeptManager = async () => {
      try {
        // Placeholder: Fetch the first user with the DEPARTMENT_MANAGER role
        // In a real app, you'd get the logged-in user's ID from the session
        const response = await fetch('/api/users'); // Assuming this endpoint can filter or you find the first manager
        if (!response.ok) throw new Error('Failed to fetch users');
        const users: PrismaUser[] = await response.json(); // Corrected type annotation
        // IMPORTANT: In a real app, you MUST get the logged-in user's ID from the session/auth context.
        // This placeholder fetches the *first* DEPARTMENT_MANAGER found, which is incorrect for multi-user scenarios.
        const deptManager = users.find(user => user.role === 'DEPARTMENT_MANAGER');

        if (deptManager) {
          setCurrentUserId(deptManager.id); // Set the ID of the found manager
          // No need to fetch department name anymore
        } else {
          setError("Logged-in user is not a Department Manager or user not found."); // Updated error
          setIsLoading(false); // Stop loading if no manager found
        }
      } catch (err: any) {
        console.error("Error fetching current user:", err);
        setError(err.message || "Failed to get current user information.");
        setIsLoading(false); // Stop loading on error
      }
    };
    fetchDeptManager();
  }, []);
  // --- End Fetch Current User ---


   useEffect(() => {
    // Fetch Tasks assigned TO the current user (Department Manager)
    const fetchTasks = async () => {
      // Only fetch if currentUserId (the logged-in Department Manager's ID) is available
      if (!currentUserId) {
        // If still loading user info, wait. If error occurred fetching user, error is already set.
        if (isLoading) return; // Still waiting for user ID
         // If not loading and no user ID, it means user fetch failed or user is not a Dept Manager.
         // Error state should already be set by the user fetch effect.
         setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

       try {
         // Fetch tasks assigned to the current user ID
         const response = await fetch(`/api/tasks?assignedToId=${currentUserId}`);

         if (!response.ok) {
          const errorData = await response.text(); // Read error response body
          // Provide a more specific error message based on status code if possible
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const parsedError = JSON.parse(errorData);
            errorMessage += `, message: ${parsedError.message || errorData}`;
          } catch {
            errorMessage += `, message: ${errorData}`;
          }
          throw new Error(errorMessage);
        }
        const data: FrontendTask[] = await response.json(); // Use the frontend-specific type
        setTasks(data);
      } catch (e) {
        console.error("Failed to fetch assigned tasks:", e);
        if (e instanceof Error) {
            setError(`فشل في جلب المهام: ${e.message}`);
        } else {
             setError("فشل في جلب المهام بسبب خطأ غير معروف.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  // Depend on currentUserId. Also include isLoading in dependency array if fetchTasks sets it.
  }, [currentUserId, isLoading]);


  // Helper function to format date (already exists, ensure it's used)
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'غير محدد';
    try {
      // Use 'en-CA' for YYYY-MM-DD format which is less ambiguous, or keep 'ar-SA' for locale-specific format
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'تاريخ غير صالح';
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="w-full bg-slate-900 text-white py-3 px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and Title - Right Side */}
          <div className="flex items-center gap-2 font-bold text-sm md:text-base lg:text-lg">
            <div className="relative h-16 w-16">
              <Image
                src="/static/image/logo.png" width={160} height={160}
                alt="Logo"
                
                className="object-contain"
              />
            </div>
          </div>

          {/* Navigation - Center */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
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
            <Link href="/department-manager" className="text-white bg-nca-teal px-3 py-2 rounded">
              مدير القسم
            </Link>
          </nav>

          {/* User Profile and Bell - Left Side */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="icon" className="text-white">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <UserIcon className="h-5 w-5" /> {/* Use the aliased icon */}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">لوحة مدير القسم - تقنية المعلومات</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="بحث..." 
                  className="pl-4 pr-10 w-64 text-right" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">8</div>
                <ClipboardList className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">التقييمات النشطة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">68%</div>
                <BarChart className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">متوسط نسبة الامتثال</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">15</div>
                <Users className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">أعضاء الفريق</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">7</div>
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-sm text-gray-600 mt-2">مهام معلقة</div>
            </Card>
          </div>

          {/* Active Assessments Section */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">التقييمات النشطة والمنتهية للقسم</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  تصفية
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  تصدير
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-right border-b border-gray-200">
                    {/* Updated Headers */}
                    <th className="pb-3 font-medium text-gray-700 pr-4">النظام</th>
                    <th className="pb-3 font-medium text-gray-700">الضوابط</th>
                    {/* <th className="pb-3 font-medium text-gray-700">تاريخ البدء</th> */}
                    <th className="pb-3 font-medium text-gray-700">الموعد النهائي</th>
                    <th className="pb-3 font-medium text-gray-700">الحالة</th>
                    <th className="pb-3 font-medium text-gray-700">التقدم</th>
                    <th className="pb-3 font-medium text-gray-700 pl-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">جاري تحميل المهام...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-red-600">{error}</td>
                    </tr>
                  ) : tasks.length === 0 ? (
                     <tr>
                      {/* Updated message */}
                      <td colSpan={6} className="text-center py-4">لا توجد مهام معينة لك.</td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                        {/* Updated Data Mapping */}
                        <td className="py-4 pr-4">{task.sensitiveSystem?.systemName || 'غير محدد'}</td>
                        {/* Explicitly type 'control' parameter */}
                        <td className="py-4 max-w-xs truncate" title={task.controls?.map((control: Pick<PrismaControl, 'id' | 'controlText'>) => control.controlText).join(', ') || ''}>
                          {task.controls?.map((control: Pick<PrismaControl, 'id' | 'controlText'>) => control.controlText).join(', ') || 'لا توجد ضوابط'}
                        </td>
                        {/* <td className="py-4">{formatDate(task.createdAt)}</td> */}
                        <td className="py-4">{formatDate(task.deadline)}</td>
                         <td className="py-4">
                           {/* Display task status - Add styling based on status */}
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                             task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                             task.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                             task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                             task.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : // Added Overdue style
                             'bg-gray-100 text-gray-700' // Default
                           }`}>
                             {task.status} {/* TODO: Map status keys to Arabic names */}
                           </span>
                         </td>
                         <td className="py-4">
                          {/* Placeholder for progress - needs logic */}
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '0%' }}></div> {/* Default to 0% */}
                            </div>
                            <span className="text-sm">0%</span>
                          </div>
                        </td>
                         <td className="py-4">
                           {/* Display task status - Add styling based on status */}
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                             task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                             task.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                             task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                             'bg-gray-100 text-gray-700' // Default/Overdue etc.
                           }`}>
                             {task.status} {/* You might want to map status keys to Arabic names */}
                           </span>
                         </td>
                        <td className="py-4">
                          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                            عرض
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Members */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">أعضاء الفريق</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-nca-teal text-white flex items-center justify-center mr-3">
                      <span>أم</span>
                    </div>
                    <div>
                      <p className="font-medium">أحمد محمد</p>
                      <p className="text-sm text-gray-500">مهندس أمن سيبراني</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm ml-2">3 مهام</span>
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                      عرض
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-nca-teal text-white flex items-center justify-center mr-3">
                      <span>سع</span>
                    </div>
                    <div>
                      <p className="font-medium">سارة عبدالله</p>
                      <p className="text-sm text-gray-500">محلل أمن سيبراني</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm ml-2">2 مهام</span>
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                      عرض
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-nca-teal text-white flex items-center justify-center mr-3">
                      <span>مع</span>
                    </div>
                    <div>
                      <p className="font-medium">محمد علي</p>
                      <p className="text-sm text-gray-500">مطور برمجيات</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm ml-2">1 مهمة</span>
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                      عرض
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4 text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                عرض جميع أعضاء الفريق
              </Button>
            </Card>

            {/* Pending Tasks */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">المهام المعلقة</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">تقديم أدلة الامتثال لضوابط التشفير</span>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">متأخر</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">المسؤول: أحمد محمد</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">تاريخ الاستحقاق: 10 مارس 2025</span>
                    <Button variant="outline" size="sm" className="text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                      متابعة
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">مراجعة سياسات كلمات المرور</span>
                    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm">قريب</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">المسؤول: سارة عبدالله</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">تاريخ الاستحقاق: 20 مارس 2025</span>
                    <Button variant="outline" size="sm" className="text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                      متابعة
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">تحديث نظام التشغيل للخوادم</span>
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">في الوقت</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">المسؤول: محمد علي</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">تاريخ الاستحقاق: 5 أبريل 2025</span>
                    <Button variant="outline" size="sm" className="text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                      متابعة
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4 text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                عرض جميع المهام
              </Button>
            </Card>
          </div>
          
          {/* Compliance Status */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">حالة الامتثال للقسم</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">حوكمة الأمن السيبراني</h3>
                  <span className="text-sm">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">تعزيز الأمن السيبراني</h3>
                  <span className="text-sm">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">صمود الأمن السيبراني</h3>
                  <span className="text-sm">80%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">الأمن السيبراني المتعلق بالأطراف الخارجية</h3>
                  <span className="text-sm">55%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '55%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-sm font-medium">15 ضابط ممتثل</p>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
                <p className="text-sm font-medium">8 ضوابط جزئية</p>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-sm font-medium">5 ضوابط غير ممتثلة</p>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <FileText className="h-6 w-6 text-nca-teal" />
                </div>
                <p className="text-sm font-medium">4 ضوابط معلقة</p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button className="bg-nca-teal text-white hover:bg-nca-teal-dark gap-2">
                <FileText className="h-4 w-4" />
                عرض التقرير التفصيلي
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
