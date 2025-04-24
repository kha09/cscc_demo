"use client"

import { useState, useEffect, useCallback } from "react" // Added useEffect, useCallback
import Image from "next/image"
import { useRouter } from 'next/navigation'; // Import useRouter
import { useAuth } from "@/lib/auth-context"; // Import useAuth
// Import necessary types
import type {
  User as PrismaUser,
  Task as PrismaTask,
  Control as PrismaControl,
  SensitiveSystemInfo as PrismaSensitiveSystemInfo,
  // Removed unused PrismaControlAssignment import
  TaskStatus
} from "@prisma/client";
import {
   Bell,
   User,
   LogOut, // Import LogOut icon
   ClipboardList, 
  AlertTriangle, 
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  Send,
  Upload,
  RefreshCw, // Added for loading indicator
  CalendarIcon // Added for date picker
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card" // Removed unused CardHeader, CardTitle, CardContent
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Badge, type BadgeProps } from "@/components/ui/badge"; // Added BadgeProps type
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; // Added Dialog
import { Label } from "@/components/ui/label"; // Added Label
import { Textarea } from "@/components/ui/textarea"; // Added Textarea
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Added Popover for Calendar
import { Calendar } from "@/components/ui/calendar"; // Added Calendar
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select
import { cn } from "@/lib/utils"; // Added cn utility
import { format } from "date-fns"; // Added date-fns for formatting
import { ComplianceLevel } from "@prisma/client"; // Import ComplianceLevel enum

// Frontend type definitions (similar to department-manager)
// Changed interface to type to satisfy @typescript-eslint/no-empty-object-type
type FrontendUser = Pick<PrismaUser, 'id' | 'name' | 'nameAr' | 'email' | 'role' | 'department'>;

// Changed interface to type to satisfy @typescript-eslint/no-empty-object-type
type FrontendControl = Pick<PrismaControl, 'id' | 'controlNumber' | 'controlText' | 'mainComponent' | 'subComponent' | 'controlType'>;

interface FrontendTask extends Pick<PrismaTask, 'id' | 'deadline' | 'status'> {
  sensitiveSystem: Pick<PrismaSensitiveSystemInfo, 'systemName'> | null;
}

// Define the interface explicitly to avoid Omit conflicts
// Kept as interface, but ensured FrontendControl type is used correctly
interface FrontendControlAssignment {
  id: string;
  status: TaskStatus;
  taskId: string;
  controlId: string;
  assignedUserId: string | null;
  notes?: string | null; // Optional
  correctiveActions?: string | null; // Optional
  expectedComplianceDate?: Date | string | null; // Optional, allow string from fetch
  complianceLevel?: ComplianceLevel | null; // Optional
  control: FrontendControl; // Relation
  task: FrontendTask; // Relation
}

// Type for the modal form data
interface ModalFormData {
    notes: string;
    correctiveActions: string;
    expectedComplianceDate: Date | undefined;
    complianceLevel: ComplianceLevel | ""; // Use "" for unselected state in Select
}


export default function UserDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<FrontendUser | null>(null);
  const [assignedControls, setAssignedControls] = useState<FrontendControlAssignment[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingControls, setIsLoadingControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<FrontendControlAssignment | null>(null);
  // Initialize modal form data state
  const [modalFormData, setModalFormData] = useState<ModalFormData>({
    notes: "",
    correctiveActions: "",
    expectedComplianceDate: undefined,
    complianceLevel: "",
  });
  const [isSaving, setIsSaving] = useState(false); // State for save button loading
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // State for date picker popover

  // Auth and Routing
  const { logout } = useAuth();
  const router = useRouter();

  // Handle Logout
  const handleLogout = () => {
    logout();
    router.push('/signin'); // Redirect to signin page after logout
  };

  // --- Fetch Current User ---
  // Placeholder: Fetch all users and find the first 'USER'. Replace with actual auth logic.
  useEffect(() => {
    const fetchCurrentUser = async () => {
      setIsLoadingUser(true);
      setError(null);
      try {
        const response = await fetch('/api/users?role=USER'); // Fetch only users with USER role
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`);
        const users: FrontendUser[] = await response.json();

        // Find a user (e.g., the first one for demo purposes)
        // In a real app, this would come from session/token
        const user = users.length > 0 ? users[0] : null;

        if (user) {
          setCurrentUser(user);
        } else {
          setError("User not found or not logged in."); // Adjust error message
        }
      } catch (err: unknown) { // Changed any to unknown
        console.error("Error fetching current user:", err);
        // Added instanceof Error check
        setError(err instanceof Error ? err.message : "Failed to get current user information.");
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchCurrentUser();
  }, []);

  // --- Fetch Assigned Controls for Current User ---
  const fetchAssignedControls = useCallback(async () => {
    if (!currentUser?.id) {
      if (!isLoadingUser) setIsLoadingControls(false); // Stop loading if user fetch failed
      return;
    }

    setIsLoadingControls(true);
    // Don't clear user fetch errors
    // setError(null);

    try {
      // Fetch control assignments for the current user
      // We'll create this API endpoint next: /api/control-assignments?userId=...
      const response = await fetch(`/api/control-assignments?userId=${currentUser.id}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to fetch assigned controls: ${response.statusText}`);
      }
      const controlsData: FrontendControlAssignment[] = await response.json();
      setAssignedControls(controlsData);
      if (!error) setError(null); // Clear error only if controls fetch succeeds and no user error exists

    } catch (e) {
      console.error("Failed to fetch assigned controls:", e);
      if (e instanceof Error) {
          setError(`فشل في جلب الضوابط المعينة: ${e.message}`);
      } else {
           setError("فشل في جلب الضوابط المعينة بسبب خطأ غير معروف.");
      }
    } finally {
      setIsLoadingControls(false);
    }
  }, [currentUser, isLoadingUser, error]); // Depend on user, loading status, and error

  useEffect(() => {
    fetchAssignedControls();
  }, [fetchAssignedControls]); // Run when fetchAssignedControls changes

  // Helper function to format date (copied from department-manager)
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch { return 'تاريخ غير صالح'; } // Removed unused variable e
  };

  // Helper to map status to Badge variant and style (copied from department-manager)
  // Explicitly type the return value
  const getStatusBadgeProps = (status: TaskStatus | undefined): { variant: BadgeProps["variant"], className: string } => {
    switch (status) {
      case 'COMPLETED': return { variant: 'default', className: 'bg-green-100 text-green-700' };
      case 'PENDING': return { variant: 'default', className: 'bg-yellow-100 text-yellow-700' };
      case 'IN_PROGRESS': return { variant: 'default', className: 'bg-blue-100 text-blue-700' };
      case 'OVERDUE': return { variant: 'default', className: 'bg-red-100 text-red-700' };
      default: return { variant: 'secondary', className: 'bg-gray-100 text-gray-700' };
    }
  };


  // --- Modal Handling ---

  // Function to open the details modal and populate form data
  const handleOpenDetailsModal = (assignment: FrontendControlAssignment) => {
    setSelectedAssignment(assignment);
    // Populate form state from the selected assignment's data
    setModalFormData({
      notes: assignment.notes ?? "",
      correctiveActions: assignment.correctiveActions ?? "",
      // Ensure expectedComplianceDate is a Date object or undefined
      expectedComplianceDate: assignment.expectedComplianceDate ? new Date(assignment.expectedComplianceDate) : undefined,
      complianceLevel: assignment.complianceLevel ?? "",
    });
    setIsDetailsModalOpen(true);
  };

  // Generic handler for text input changes in the modal
  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setModalFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler for date changes
  const handleModalDateChange = (date: Date | undefined) => {
    setModalFormData(prev => ({ ...prev, expectedComplianceDate: date }));
  };

  // Handler for select changes (Compliance Level)
  const handleModalSelectChange = (value: string) => {
    // Ensure the value is a valid ComplianceLevel or reset to ""
    const level = Object.values(ComplianceLevel).includes(value as ComplianceLevel)
      ? value as ComplianceLevel
      : "";
    setModalFormData(prev => ({ ...prev, complianceLevel: level }));
  };

  // Placeholder for saving data
  const handleSaveDetails = async () => {
    if (!selectedAssignment) return;

    setIsSaving(true);
    setError(null); // Clear previous errors

    console.log("Saving data for assignment:", selectedAssignment.id);
    console.log("Form data:", modalFormData);

    // TODO: Implement API call using PATCH /api/control-assignments/[assignmentId]
    // Convert date back to ISO string or keep as Date depending on API expectation
    const payload = {
        ...modalFormData,
        // Send date as ISO string if it exists, otherwise null
        expectedComplianceDate: modalFormData.expectedComplianceDate?.toISOString() ?? null,
        // Send complianceLevel or null if it's an empty string
        complianceLevel: modalFormData.complianceLevel === "" ? null : modalFormData.complianceLevel,
    };

    try {
        const response = await fetch(`/api/control-assignments/${selectedAssignment.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to save details: ${response.statusText}`);
        }

        // --- Optimistic Update ---
        // Update the local state immediately on success
        setAssignedControls(prevControls =>
            prevControls.map(control =>
                control.id === selectedAssignment.id
                    ? { ...control, ...payload, expectedComplianceDate: modalFormData.expectedComplianceDate } // Update with new data (keep Date object locally)
                    : control
            )
        );
        // --- End Optimistic Update ---

        setIsDetailsModalOpen(false); // Close modal on success

    } catch (err: unknown) { // Re-applying fix for catch block
        console.error("Error saving details:", err);
        // Ensure 'err' is used correctly with instanceof check
        setError(err instanceof Error ? err.message : "Failed to save compliance details.");
        // Keep modal open on error
    } finally {
        setIsSaving(false);
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
            <Link href="/user-dashboard" className="text-white bg-nca-teal px-3 py-2 rounded">
              لوحة المستخدم
            </Link>
          </nav>

          {/* User Profile and Bell - Left Side */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="icon" className="text-white">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <User className="h-5 w-5" />
            </Button>
            
            {/* Logout Button */}
            <Button variant="ghost" size="icon" className="text-white" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Display General Errors */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">خطأ! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            {/* Dynamically display user name */}
            <h1 className="text-2xl font-bold text-slate-800">
              لوحة المستخدم {currentUser ? `- ${currentUser.nameAr || currentUser.name}` : ''}
              {isLoadingUser && ' (جاري التحميل...)'}
            </h1>
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

          {/* Stats Cards - Updated counts based on fetched assignedControls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{isLoadingControls ? '...' : assignedControls.length}</div>
                <ClipboardList className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">الضوابط المعينة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                {/* Calculated completed count */}
                <div className="text-3xl font-bold">{isLoadingControls ? '...' : assignedControls.filter(c => c.status === 'COMPLETED').length}</div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-sm text-gray-600 mt-2">الضوابط المكتملة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                 {/* Calculated pending/in-progress count */}
                <div className="text-3xl font-bold">{isLoadingControls ? '...' : assignedControls.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length}</div>
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-sm text-gray-600 mt-2">الضوابط المعلقة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                 {/* Calculated overdue count */}
                <div className="text-3xl font-bold">{isLoadingControls ? '...' : assignedControls.filter(c => c.status === 'OVERDUE').length}</div>
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="text-sm text-gray-600 mt-2">ضوابط متأخرة</div>
            </Card>
          </div>

          {/* My Tasks Section - Updated to show assigned controls */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">الضوابط المعينة لي</h2>
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
                    <th className="pb-3 font-medium text-gray-700 pr-4">الضابط</th>
                    <th className="pb-3 font-medium text-gray-700">النظام</th>
                    <th className="pb-3 font-medium text-gray-700">الموعد النهائي للمهمة</th>
                    <th className="pb-3 font-medium text-gray-700">حالة الضابط</th>
                    <th className="pb-3 font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingControls ? (
                    <tr><td colSpan={5} className="text-center py-4"><RefreshCw className="h-6 w-6 animate-spin inline-block mr-2" /> جاري تحميل الضوابط...</td></tr>
                  ) : assignedControls.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4">لا توجد ضوابط معينة لك حاليًا.</td></tr>
                  ) : (
                    assignedControls.map((assignment) => (
                      <tr key={assignment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 pr-4" title={assignment.control.controlText}>
                          {assignment.control.controlNumber}
                        </td>
                        <td className="py-4">{assignment.task.sensitiveSystem?.systemName || 'غير محدد'}</td>
                        <td className="py-4">{formatDate(assignment.task.deadline)}</td>
                        <td className="py-4">
                          <Badge {...getStatusBadgeProps(assignment.status)}>
                            {assignment.status} {/* TODO: Translate status */}
                          </Badge>
                        </td>
                        <td className="py-4">
                          {/* Updated button to open modal */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-900"
                            onClick={() => handleOpenDetailsModal(assignment)} // Pass assignment data
                          >
                            عرض التفاصيل
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
            {/* Current Task */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">المهمة الحالية</h2>
              <div className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">تقديم أدلة الامتثال لضوابط التشفير</h3>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">متأخر</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  يجب تقديم الأدلة التي تثبت تطبيق ضوابط التشفير على البيانات الحساسة أثناء النقل والتخزين وفقاً للضابط 2-7-1 من ضوابط الأمن السيبراني للأنظمة الحساسة.
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">التقييم: تقييم ضوابط الأمن السيبراني - Q1</span>
                  <span className="text-sm text-gray-500">الموعد النهائي: 10 مارس 2025</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">المتطلبات:</h4>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>تقديم سياسة التشفير المعتمدة</li>
                    <li>تقديم إثبات تطبيق التشفير للبيانات أثناء النقل</li>
                    <li>تقديم إثبات تطبيق التشفير للبيانات أثناء التخزين</li>
                    <li>تقديم قائمة بخوارزميات التشفير المستخدمة</li>
                  </ul>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">رفع الأدلة</h3>
                <div className="space-y-3">
                  <div className="border border-dashed rounded-lg p-6 text-center">
                    <div className="flex justify-center mb-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">اسحب الملفات هنا أو انقر للاختيار</p>
                    <Button variant="outline" size="sm" className="text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                      اختيار الملفات
                    </Button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">ملاحظات</label>
                    <textarea className="w-full p-2 border rounded-md text-right h-24 resize-none"></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button className="bg-nca-teal text-white hover:bg-nca-teal-dark">
                      تقديم المهمة
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Upcoming Tasks */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">المهام القادمة</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">تحديث سياسات كلمات المرور</span>
                    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm">قيد التنفيذ</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">تحديث سياسات كلمات المرور وفقاً للضوابط الجديدة</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">تقييم ضوابط الأمن السيبراني - Q1</span>
                    <span className="text-xs text-gray-500">الموعد النهائي: 20 مارس 2025</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">مراجعة إعدادات جدار الحماية</span>
                    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm">قيد التنفيذ</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">مراجعة وتحديث إعدادات جدار الحماية وفقاً للضوابط</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">تقييم أمن الشبكات</span>
                    <span className="text-xs text-gray-500">الموعد النهائي: 5 أبريل 2025</span>
                  </div>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold mb-4 mt-6">المهام المكتملة</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">تحديث خطة التعافي من الكوارث</span>
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">مكتمل</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">تحديث وتوثيق خطة التعافي من الكوارث</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">تقييم ضوابط الأمن السيبراني - Q1</span>
                    <span className="text-xs text-gray-500">تاريخ الإكمال: 8 فبراير 2025</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">تنفيذ اختبار الاختراق</span>
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">مكتمل</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">تنفيذ اختبار اختراق للأنظمة وتوثيق النتائج</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">تقييم أمن التطبيقات</span>
                    <span className="text-xs text-gray-500">تاريخ الإكمال: 12 فبراير 2025</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Compliance Assistant */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">مساعد الامتثال</h2>
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-700">كيف يمكنني مساعدتك في مهامك اليوم؟</h3>
            </div>
            <div className="flex gap-2">
              <Input placeholder="اكتب سؤالك..." className="text-right" />
              <Button size="icon" className="bg-nca-teal hover:bg-nca-teal-dark">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">ما هي متطلبات ضوابط التشفير للبيانات الحساسة؟</p>
              </div>
              <div className="p-3 bg-nca-teal bg-opacity-10 rounded-lg">
                <p className="text-sm text-gray-700">
                  وفقاً للضابط 2-7-1 من ضوابط الأمن السيبراني للأنظمة الحساسة، يجب تشفير جميع البيانات الحساسة أثناء النقل والتخزين. يتطلب ذلك استخدام خوارزميات تشفير قوية ومعتمدة، وإدارة آمنة لمفاتيح التشفير، وتوثيق سياسات وإجراءات التشفير.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Details Modal */}
      {/* Pass isDatePickerOpen state to inert attribute */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent
          className="sm:max-w-[600px] text-right"
          dir="rtl"
          // inert={isDatePickerOpen} // Removed this line to fix date picker interaction
        >
          <DialogHeader>
            <DialogTitle>تفاصيل الضابط: {selectedAssignment?.control?.controlNumber}</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.control?.controlText}
            </DialogDescription>
          </DialogHeader>
          {/* Display Error within Modal */}
          {error && isDetailsModalOpen && (
             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
               <strong className="font-bold">خطأ! </strong>
               <span className="block sm:inline">{error}</span>
             </div>
           )}
          <div className="grid gap-4 py-4">
            {/* Notes */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right col-span-1">
                الملاحظات
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={modalFormData.notes}
                onChange={handleModalInputChange}
                className="col-span-3 h-24"
                placeholder="أضف ملاحظاتك هنا..."
              />
            </div>
            {/* Corrective Actions */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="correctiveActions" className="text-right col-span-1">
                إجراءات التصحيح
              </Label>
              <Textarea
                id="correctiveActions"
                name="correctiveActions"
                value={modalFormData.correctiveActions}
                onChange={handleModalInputChange}
                className="col-span-3 h-24"
                placeholder="صف الإجراءات التصحيحية المتخذة أو المخطط لها..."
              />
            </div>
            {/* Expected Compliance Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expectedComplianceDate" className="text-right col-span-1">
                تاريخ الالتزام المتوقع
               </Label>
               {/* Control the Popover open state */}
               <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen} modal={false}>
                 <PopoverTrigger asChild>
                   <Button
                     variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-right font-normal",
                      !modalFormData.expectedComplianceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {modalFormData.expectedComplianceDate ? (
                      format(modalFormData.expectedComplianceDate, "PPP")
                    ) : (
                      <span>اختر تاريخًا</span>
                    )}
                  </Button>
                </PopoverTrigger>
                {/* Stop propagation inside PopoverContent - Removed stopPropagation */}
                <PopoverContent
                  className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={modalFormData.expectedComplianceDate}
                    onSelect={handleModalDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Compliance Level */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="complianceLevel" className="text-right col-span-1">
                مستوى الالتزام
              </Label>
              <Select
                value={modalFormData.complianceLevel}
                onValueChange={handleModalSelectChange}
                dir="rtl"
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر مستوى..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ComplianceLevel.NOT_IMPLEMENTED}>غير مطبق - Not Implemented</SelectItem>
                  <SelectItem value={ComplianceLevel.PARTIALLY_IMPLEMENTED}>مطبق جزئيًا - Partially Implemented</SelectItem>
                  <SelectItem value={ComplianceLevel.IMPLEMENTED}>مطبق كليًا - Implemented</SelectItem>
                  <SelectItem value={ComplianceLevel.NOT_APPLICABLE}>لا ينطبق - Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)} disabled={isSaving}>
              إلغاء
            </Button>
            <Button onClick={handleSaveDetails} disabled={isSaving}>
              {isSaving ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> جاري الحفظ...</> : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
