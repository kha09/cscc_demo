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
  managerStatus?: string | null; // Added manager status
  managerNote?: string | null;   // Added manager note
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
  useEffect(() => {
    const fetchCurrentUser = async () => {
      setIsLoadingUser(true);
      setError(null);
      try {
        const response = await fetch('/api/users?role=USER'); // Fetch only users with USER role
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`);
        const users: FrontendUser[] = await response.json();
        const user = users.length > 0 ? users[0] : null; // Use first USER for demo

        if (user) {
          setCurrentUser(user);
        } else {
          setError("User not found or not logged in.");
        }
      } catch (err: unknown) {
        console.error("Error fetching current user:", err);
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
      if (!isLoadingUser) setIsLoadingControls(false);
      return;
    }

    setIsLoadingControls(true);
    try {
      const response = await fetch(`/api/control-assignments?userId=${currentUser.id}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to fetch assigned controls: ${response.statusText}`);
      }
      const controlsData: FrontendControlAssignment[] = await response.json();
      setAssignedControls(controlsData);
      if (!error) setError(null); // Clear error only if controls fetch succeeds

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
  }, [fetchAssignedControls]);

  // Helper function to format date
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch { return 'تاريخ غير صالح'; }
  };

  // Helper to map status to Badge props
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
  const handleOpenDetailsModal = (assignment: FrontendControlAssignment) => {
    setSelectedAssignment(assignment);
    setModalFormData({
      notes: assignment.notes ?? "",
      correctiveActions: assignment.correctiveActions ?? "",
      expectedComplianceDate: assignment.expectedComplianceDate ? new Date(assignment.expectedComplianceDate) : undefined,
      complianceLevel: assignment.complianceLevel ?? "",
    });
    setIsDetailsModalOpen(true);
  };

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setModalFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModalDateChange = (date: Date | undefined) => {
    setModalFormData(prev => ({ ...prev, expectedComplianceDate: date }));
    setIsDatePickerOpen(false); // Close picker after selection
  };

  const handleModalSelectChange = (value: string) => {
    const level = Object.values(ComplianceLevel).includes(value as ComplianceLevel)
      ? value as ComplianceLevel
      : "";
    setModalFormData(prev => ({ ...prev, complianceLevel: level }));
  };

  const handleSaveDetails = async () => {
    if (!selectedAssignment) return;

    setIsSaving(true);
    setError(null);

    const payload = {
        ...modalFormData,
        expectedComplianceDate: modalFormData.expectedComplianceDate?.toISOString() ?? null,
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

        // Optimistic Update
        setAssignedControls(prevControls =>
            prevControls.map(control =>
                control.id === selectedAssignment.id
                    ? { ...control, ...payload, expectedComplianceDate: modalFormData.expectedComplianceDate }
                    : control
            )
        );
        setIsDetailsModalOpen(false);

    } catch (err: unknown) {
        console.error("Error saving details:", err);
        setError(err instanceof Error ? err.message : "Failed to save compliance details.");
    } finally {
        setIsSaving(false);
    }
  };

  // Helper function to translate ComplianceLevel enum to Arabic text
  const getComplianceLevelText = (level: ComplianceLevel | null | undefined): string => {
    switch (level) {
      case ComplianceLevel.NOT_IMPLEMENTED: return "غير مطبق";
      case ComplianceLevel.PARTIALLY_IMPLEMENTED: return "مطبق جزئيًا";
      case ComplianceLevel.IMPLEMENTED: return "مطبق كليًا";
      case ComplianceLevel.NOT_APPLICABLE: return "لا ينطبق";
      default: return "غير محدد";
    }
  };

  // Helper function to get background color class for ComplianceLevel
  const getComplianceLevelBackgroundColorClass = (level: ComplianceLevel | null | undefined): string => {
    switch (level) {
      case ComplianceLevel.IMPLEMENTED: return "bg-green-200 text-green-800";
      case ComplianceLevel.PARTIALLY_IMPLEMENTED: return "bg-yellow-200 text-yellow-800";
      case ComplianceLevel.NOT_IMPLEMENTED: return "bg-red-200 text-red-800";
      case ComplianceLevel.NOT_APPLICABLE: return "bg-gray-200 text-gray-800";
      default: return "";
    }
  };

  // Filter controls based on search query
  const filteredControls = assignedControls.filter(assignment => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      assignment.control.controlNumber.toLowerCase().includes(searchTerm) ||
      assignment.control.controlText.toLowerCase().includes(searchTerm) ||
      (assignment.task.sensitiveSystem?.systemName &&
        assignment.task.sensitiveSystem.systemName.toLowerCase().includes(searchTerm)) ||
      assignment.status.toLowerCase().includes(searchTerm) ||
      getComplianceLevelText(assignment.complianceLevel).toLowerCase().includes(searchTerm)
    );
  });


  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="w-full bg-slate-900 text-white py-3 px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 font-bold text-sm md:text-base lg:text-lg">
            <div className="relative h-16 w-16">
              <Image
                src="/static/image/logo.png" width={160} height={160}
                alt="Logo"
                className="object-contain"
              />
            </div>
          </div>
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            <Link href="/dashboard" className="text-white hover:text-gray-300 px-3 py-2">الرئيسية</Link>
            <Link href="#" className="text-white hover:text-gray-300 px-3 py-2">التقارير</Link>
            <Link href="/assessment" className="text-white hover:text-gray-300 px-3 py-2">التقييم</Link>
            <Link href="#" className="text-white hover:text-gray-300 px-3 py-2">الدعم</Link>
            <Link href="/user-dashboard" className="text-white bg-nca-teal px-3 py-2 rounded">لوحة المستخدم</Link>
          </nav>
          {/* User Profile & Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="icon" className="text-white"><Bell className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="text-white"><User className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="text-white" onClick={handleLogout}><LogOut className="h-5 w-5" /></Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* General Error Display */}
          {error && !isDetailsModalOpen && ( // Only show general error if modal is closed
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">خطأ! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Page Header & Search */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">
              لوحة المستخدم {currentUser ? `- ${currentUser.nameAr || currentUser.name}` : ''}
              {isLoadingUser && ' (جاري التحميل...)'}
            </h1>
            <div className="relative">
              <Search className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="بحث في الضوابط..."
                className="pl-4 pr-10 w-64 text-right"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{isLoadingControls ? '...' : assignedControls.length}</div>
                <ClipboardList className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">إجمالي الضوابط المعينة</div>
            </Card>
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{isLoadingControls ? '...' : assignedControls.filter(c => c.status === 'COMPLETED').length}</div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-sm text-gray-600 mt-2">الضوابط المكتملة</div>
            </Card>
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{isLoadingControls ? '...' : assignedControls.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length}</div>
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-sm text-gray-600 mt-2">الضوابط المعلقة</div>
            </Card>
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{isLoadingControls ? '...' : assignedControls.filter(c => c.status === 'OVERDUE').length}</div>
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="text-sm text-gray-600 mt-2">ضوابط متأخرة</div>
            </Card>
          </div>

          {/* Assigned Controls Table */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">الضوابط المعينة لي</h2>
              {/* Add Filter/Export later if needed */}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-right border-b border-gray-200">
                    <th className="pb-3 font-medium text-gray-700 pr-4">الضابط</th>
                    <th className="pb-3 font-medium text-gray-700">النظام الحساس</th>
                    <th className="pb-3 font-medium text-gray-700">الموعد النهائي للمهمة</th>
                    <th className="pb-3 font-medium text-gray-700">حالة الضابط</th>
                    <th className="pb-3 font-medium text-gray-700">مستوى الالتزام</th>
                    <th className="pb-3 font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingControls ? (
                    <tr><td colSpan={6} className="text-center py-4"><RefreshCw className="h-6 w-6 animate-spin inline-block mr-2" /> جاري تحميل الضوابط...</td></tr>
                  ) : filteredControls.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4">{searchQuery ? 'لا توجد نتائج مطابقة للبحث.' : 'لا توجد ضوابط معينة لك حاليًا.'}</td></tr>
                  ) : (
                    filteredControls.map((assignment) => (
                      <tr key={assignment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 pr-4" title={assignment.control.controlText}>
                          {assignment.control.controlNumber}
                        </td>
                        <td className="py-4">{assignment.task.sensitiveSystem?.systemName || 'غير محدد'}</td>
                        <td className="py-4">{formatDate(assignment.task.deadline)}</td>
                        <td className="py-4">
                          {assignment.managerStatus ? (
                            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                              {assignment.managerStatus}
                            </Badge>
                          ) : (
                            <Badge {...getStatusBadgeProps(assignment.status)}>
                              {/* TODO: Translate status */}
                              {assignment.status}
                            </Badge>
                          )}
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded ${getComplianceLevelBackgroundColorClass(assignment.complianceLevel)}`}>
                            {getComplianceLevelText(assignment.complianceLevel)}
                          </span>
                        </td>
                        <td className="py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-900"
                            onClick={() => handleOpenDetailsModal(assignment)}
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

          {/* Placeholder Sections (Current Task, Upcoming, Completed, Assistant) */}
          {/* These can be implemented later or removed if not needed */}
          {/* ... */}

        </div>
      </main>

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px] text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الضابط: {selectedAssignment?.control?.controlNumber}</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.control?.controlText}
            </DialogDescription>
          </DialogHeader>

          {/* Display Error within Modal */}
          {error && isDetailsModalOpen && (
             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
               <strong className="font-bold">خطأ! </strong>
               <span className="block sm:inline">{error}</span>
             </div>
           )}

          <div className="grid gap-4 py-4">
            {/* Notes */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right col-span-1">الملاحظات</Label>
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
              <Label htmlFor="correctiveActions" className="text-right col-span-1">إجراءات التصحيح</Label>
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
              <Label htmlFor="expectedComplianceDate" className="text-right col-span-1">تاريخ الالتزام المتوقع</Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-right font-normal",
                      !modalFormData.expectedComplianceDate && "text-muted-foreground"
                    )}
                    onClick={() => setIsDatePickerOpen(true)} // Explicitly open on click
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {modalFormData.expectedComplianceDate ? (
                      format(modalFormData.expectedComplianceDate, "PPP") // Removed locale option
                    ) : (
                      <span>اختر تاريخًا</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={modalFormData.expectedComplianceDate}
                    onSelect={handleModalDateChange} // This now closes the picker too
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Compliance Level */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="complianceLevel" className="text-right col-span-1">مستوى الالتزام</Label>
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

            {/* --- Display Manager Review (Read-Only) --- */}
            {selectedAssignment?.managerStatus && (
              <div className="grid grid-cols-4 items-center gap-4 mt-4 pt-4 border-t">
                <Label className="text-right col-span-1 font-semibold">حالة المراجعة</Label>
                <Badge variant="secondary" className="col-span-3 justify-start">
                  {selectedAssignment.managerStatus}
                </Badge>
              </div>
            )}
            {selectedAssignment?.managerNote && (
              <div className="grid grid-cols-4 items-start gap-4 mt-2">
                <Label className="text-right col-span-1 font-semibold pt-1">ملاحظة المدير</Label>
                <p className="col-span-3 text-sm bg-gray-100 p-2 rounded border">
                  {selectedAssignment.managerNote}
                </p>
              </div>
            )}
            {/* --- End Display Manager Review --- */}

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
  );
}
