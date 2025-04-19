"use client"

import { useState, useEffect } from "react" // Added useEffect
import Image from "next/image"
import { Assessment, User } from "@prisma/client"; // Added Assessment, User types
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Added Dialog components
import { 
  Bell, 
  User as UserIcon, // Aliased the User icon
  ClipboardList, 
  BarChart, 
  FileText, 
  AlertTriangle, 
  Search,
  Plus,
  Filter,
  Download,
  Calendar,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
// Import the form component
import SensitiveSystemForm from "@/components/sensitive-system-form"; 

export default function SecurityManagerDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  // --- Temporary User ID Fetch ---
  // In a real app, get this from auth context/session
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // Fetch the first security manager user as a placeholder
        // Ensure the API endpoint exists and returns security managers
        const response = await fetch('/api/users/security-managers'); 
        if (!response.ok) throw new Error('Failed to fetch security managers');
        const managers: User[] = await response.json();
        if (managers.length > 0) {
          setUserId(managers[0].id);
        } else {
          setError("No Security Manager user found to display assessments for.");
          setIsLoading(false); // Stop loading if no user found
        }
      } catch (err: any) {
        console.error("Error fetching user ID:", err);
        setError(err.message || "Failed to get user ID");
        setIsLoading(false); // Stop loading on error
      }
    };
    fetchUserId();
  }, []);
  // --- End Temporary User ID Fetch ---

  // Fetch assessments when userId is available
  useEffect(() => {
    if (!userId) return; // Don't fetch if userId is not set

    const fetchAssessments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/users/${userId}/assessments`);
        if (!response.ok) {
          throw new Error(`Failed to fetch assessments: ${response.statusText}`);
        }
        const data: Assessment[] = await response.json();
        setAssessments(data);
      } catch (err: any) {
        console.error("Error fetching assessments:", err);
        setError(err.message || "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, [userId]); // Re-run when userId changes

  const handleOpenForm = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    setIsModalOpen(true);
  };

  // Filter assessments based on search query (simple example)
  const filteredAssessments = assessments.filter(assessment => 
    assessment.companyNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assessment.companyNameEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date helper
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', { // Use Arabic locale for formatting
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
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
            <Link href="/security-manager" className="text-white bg-nca-teal px-3 py-2 rounded">
              مدير الأمن
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
            <h1 className="text-2xl font-bold text-slate-800">لوحة مدير الأمن</h1>
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
              <Button className="bg-nca-teal hover:bg-nca-teal-dark text-white gap-2">
                <Plus className="h-4 w-4" />
                تقييم جديد
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">18</div>
                <ClipboardList className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">التقييمات النشطة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">76%</div>
                <BarChart className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">متوسط نسبة الامتثال</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">12</div>
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-sm text-gray-600 mt-2">مخاطر متوسطة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">5</div>
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="text-sm text-gray-600 mt-2">مخاطر عالية</div>
            </Card>
          </div>

          

          {/* Active Assessments Section */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold"> التقييمات النشطة والمنتهية</h2>
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
                    <th className="pb-3 font-medium text-gray-700 pr-4">اسم الشركة (عربي)</th>
                    <th className="pb-3 font-medium text-gray-700">اسم الشركة (انجليزي)</th>
                    <th className="pb-3 font-medium text-gray-700">تاريخ الإنشاء</th>
                    {/* <th className="pb-3 font-medium text-gray-700">الموعد النهائي</th> */}
                    {/* <th className="pb-3 font-medium text-gray-700">التقدم</th> */}
                    <th className="pb-3 font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">جاري تحميل التقييمات...</td>
                    </tr>
                  ) : error ? (
                     <tr>
                      <td colSpan={5} className="text-center py-4 text-red-600">{error}</td>
                    </tr>
                  ) : filteredAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">لا توجد تقييمات معينة لك.</td>
                    </tr>
                  ) : (
                    filteredAssessments.map((assessment) => (
                      <tr key={assessment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 pr-4">{assessment.companyNameAr}</td>
                        <td className="py-4">{assessment.companyNameEn}</td>
                        <td className="py-4">{formatDate(assessment.createdAt)}</td>
                        {/* Add other columns like deadline or progress if available in Assessment model */}
                        {/* <td className="py-4">N/A</td> */}
                        {/* <td className="py-4">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                            <span className="text-sm">0%</span>
                          </div>
                        </td> */}
                        <td className="py-4">
                          {/* Button to open the form modal */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white"
                            onClick={() => handleOpenForm(assessment.id)}
                          >
                            إضافة معلومات النظام
                          </Button>
                          {/* Add other actions like 'View Details' if needed */}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Modal for Sensitive System Form */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            {/* DialogTrigger is usually placed on the button, but we trigger manually */}
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>معلومات اساسية عن الأنظمة الحساسة</DialogTitle>
              </DialogHeader>
              {selectedAssessmentId ? (
                <SensitiveSystemForm 
                  assessmentId={selectedAssessmentId} 
                  onFormSubmit={() => setIsModalOpen(false)} // Close modal on successful submit
                />
              ) : (
                <div className="p-4 text-center">لم يتم تحديد تقييم.</div>
              )}
            </DialogContent>
          </Dialog>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task Assignment */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">تعيين المهام</h2>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">اختر الضابط</span>
                </div>
                <div className="relative">
                  <select className="w-full p-2 border rounded-md text-right pr-10 appearance-none bg-white">
                    <option>1-1-3-1 إجراء اختبار التحمل (Stress Testing) للتأكد من سعة المكونات المختلفة.
                    </option>
                    <option>2-1-3-1 التأكد من تطبيق متطلبات استمرارية الأعمال.
                    </option>

                    <option>3-2-3-1 تأمين واجهة برمجة التطبيقات.
                    </option>
                  </select>
                  <ChevronDown className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">اختر القسم</span>
                </div>
                <div className="relative">
                  <select className="w-full p-2 border rounded-md text-right pr-10 appearance-none bg-white">
                    <option>تكنولوجيا المعلومات</option>
                    <option>البنية التحتية</option>
                  </select>
                  <ChevronDown className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">الموعد النهائي</span>
                </div>
                <div className="relative">
                  <Input type="date" className="w-full p-2 border rounded-md text-right" />
                  <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <Button className="w-full bg-nca-teal text-white hover:bg-nca-teal-dark">
                تعيين المهمة
              </Button>
            </Card>

            {/* Risk Assessment */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">تقييم المخاطر</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-red-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">عدم تطبيق التشفير للبيانات الحساسة</span>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">مخاطرة عالية</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">قد يؤدي إلى تسريب البيانات الحساسة في حالة الاختراق</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">تكنولوجيا المعلومات</span>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                      معالجة
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">ضعف في إدارة كلمات المرور</span>
                    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm">مخاطرة متوسطة</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">عدم تطبيق سياسة قوية لكلمات المرور</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">الأمن السيبراني</span>
                    <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-600 hover:bg-yellow-50">
                      معالجة
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4 text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                عرض جميع المخاطر
              </Button>
            </Card>
          </div>
          
          {/* Report Generation (Keep existing sections) */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">إنشاء التقارير</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-6 hover:border-nca-teal cursor-pointer transition-all">
                <div className="flex justify-center mb-4">
                  <div className="bg-nca-teal bg-opacity-10 p-4 rounded-full">
                    <FileText className="h-8 w-8 text-nca-teal" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-center mb-2">تقرير الامتثال</h3>
                <p className="text-sm text-gray-600 text-center">تقرير شامل عن مستوى الامتثال لضوابط الأمن السيبراني</p>
              </div>
              
              <div className="border rounded-lg p-6 hover:border-nca-teal cursor-pointer transition-all">
                <div className="flex justify-center mb-4">
                  <div className="bg-nca-teal bg-opacity-10 p-4 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-nca-teal" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-center mb-2">تقرير المخاطر</h3>
                <p className="text-sm text-gray-600 text-center">تقرير مفصل عن المخاطر المكتشفة وتوصيات المعالجة</p>
              </div>
              
              <div className="border rounded-lg p-6 hover:border-nca-teal cursor-pointer transition-all">
                <div className="flex justify-center mb-4">
                  <div className="bg-nca-teal bg-opacity-10 p-4 rounded-full">
                    <BarChart className="h-8 w-8 text-nca-teal" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-center mb-2">تقرير تحليلي</h3>
                <p className="text-sm text-gray-600 text-center">تقرير تحليلي مع رسوم بيانية ومؤشرات أداء</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium mb-3">إعدادات التقرير</h3>
              <div className="flex justify-end mt-4">
                <Button className="bg-nca-teal text-white hover:bg-nca-teal-dark gap-2">
                  <Download className="h-4 w-4" />
                  إنشاء التقرير
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
