"use client";

import { useState, useEffect, useCallback } from "react"; // Added useEffect, useCallback
// import Image from "next/image"; // Removed, handled by AppHeader
import { useRouter } from 'next/navigation'; // Uncommented
import { useAuth } from "@/lib/auth-context"; // Uncommented
import { AppHeader } from "@/components/ui/AppHeader"; // Import the shared header
import { ChatBox } from "@/components/ChatBox"; // Import the ChatBox component
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
  // Bell, // Removed, handled by AppHeader
  // User, // Removed, handled by AppHeader
  // LogOut, // Removed, handled by AppHeader
  ClipboardList,
  AlertTriangle,
  Search,
  Filter as _Filter, // Prefixed with underscore to avoid unused var error
  Download as _Download, // Prefixed with underscore to avoid unused var error
  CheckCircle,
  Clock,
  Send as _Send, // Prefixed with underscore to avoid unused var error
  Upload,
  RefreshCw, // Added for loading indicator
  CalendarIcon // Added for date picker
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card" // Removed unused CardHeader, CardTitle, CardContent
import { Input } from "@/components/ui/input"
// import Link from "next/link" // Removed unused import
import { Badge, type BadgeProps } from "@/components/ui/badge"; // Added BadgeProps type
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; // Added Dialog
import { Label } from "@/components/ui/label"; // Added Label
import { Textarea } from "@/components/ui/textarea"; // Added Textarea
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Added Popover for Calendar
import { Calendar } from "@/components/ui/calendar"; // Added Calendar
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select
import { cn } from "@/lib/utils"; // Added cn utility
import { format } from "date-fns";
import { ComplianceLevel, ControlFile as PrismaControlFile } from "@prisma/client"; // Import ComplianceLevel enum and ControlFile type

// Frontend type definitions (similar to department-manager)
// Changed interface to type to satisfy @typescript-eslint/no-empty-object-type
type FrontendUser = Pick<PrismaUser, 'id' | 'name' | 'nameAr' | 'email' | 'role' | 'department'>;

// Changed interface to type to satisfy @typescript-eslint/no-empty-object-type
type FrontendControl = Pick<PrismaControl, 'id' | 'controlNumber' | 'controlText' | 'mainComponent' | 'subComponent' | 'controlType'>;

interface FrontendTask extends Pick<PrismaTask, 'id' | 'deadline' | 'status'> {
  sensitiveSystem: (Pick<PrismaSensitiveSystemInfo, 'systemName'> & {
    assessment: {
      assessmentName: string;
    } | null; // Allow assessment to be null
  }) | null;
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
  // files are fetched separately now, not included here directly
}

// Type for the modal form data
interface ModalFormData {
    notes: string;
    correctiveActions: string;
    expectedComplianceDate: Date | undefined;
    complianceLevel: ComplianceLevel | ""; // Use "" for unselected state in Select
}

// Type for uploaded file data (matching backend) - Use Prisma type directly
type UploadedFileData = PrismaControlFile;


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
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null); // State for selected files for upload
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileData[]>([]); // State for already uploaded files
  const [isUploading, setIsUploading] = useState(false); // State for upload loading indicator
  const [uploadError, setUploadError] = useState<string | null>(null); // State for upload errors

  // Auth and Routing - Need router for redirect
  // const { logout } = useAuth(); // Logout is handled by AppHeader
  const router = useRouter(); // Uncommented router initialization

  // Handle Logout - Removed, handled by AppHeader
  // const handleLogout = () => {
  //   logout();
  //   router.push('/signin');
  // };

  // --- Get Current User from Auth Context ---
  const { user: authUser } = useAuth();
  
  useEffect(() => {
    setIsLoadingUser(true);
    setError(null);
    
    try {
      if (authUser) {
        // Convert Prisma User to FrontendUser
        const frontendUser: FrontendUser = {
          id: authUser.id,
          name: authUser.name,
          nameAr: authUser.nameAr || null,
          email: authUser.email,
          role: authUser.role,
          department: authUser.department || null
        };
        
        setCurrentUser(frontendUser);
      } else {
        setError("المستخدم غير مسجل الدخول. يرجى تسجيل الدخول للوصول إلى لوحة المستخدم.");
        router.push('/signin');
      }
    } catch (err: unknown) {
      console.error("Error setting current user:", err);
      setError(err instanceof Error ? err.message : "فشل في الحصول على معلومات المستخدم الحالي.");
    } finally {
      setIsLoadingUser(false);
    }
  }, [authUser, router]);

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
  }, [currentUser, isLoadingUser, error]); // router is not used in the callback

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

  // Helper function to get the appropriate date to display (expected compliance date or task deadline)
  const getDisplayDate = (assignment: FrontendControlAssignment) => {
    // If expected compliance date exists, use it
    if (assignment.expectedComplianceDate) {
      return formatDate(assignment.expectedComplianceDate);
    }
    // Otherwise use task deadline
    return formatDate(assignment.task.deadline);
  };

  // Helper to map status to Badge props - now all use grey background
  const getStatusBadgeProps = (_status: TaskStatus | undefined): { variant: BadgeProps["variant"], className: string } => {
    // Return grey styling for all statuses
    return { variant: 'outline', className: 'bg-gray-100 text-gray-700 border-gray-300' };
  };

  // Helper function to translate TaskStatus enum to Arabic text
  const translateStatus = (status: TaskStatus | undefined): string => {
    switch (status) {
      case 'COMPLETED': return "مكتمل";
      case 'PENDING': return "غير محدد"; // Changed from PENDING
      case 'IN_PROGRESS': return "قيد التنفيذ";
      case 'OVERDUE': return "متأخر";
      default: return "غير معروف";
    }
  };

  // --- File Handling Functions ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
    setUploadError(null); // Clear previous upload errors on new selection
  };

  const fetchUploadedFiles = useCallback(async (assignmentId: string) => {
    if (!assignmentId) return;
    try {
      const response = await fetch(`/api/control-assignments/${assignmentId}/files`);
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const filesData: UploadedFileData[] = await response.json();
       setUploadedFiles(filesData);
     } catch (err: unknown) { // Add type annotation for err
       console.error("Error fetching uploaded files:", err);
       setUploadError(err instanceof Error ? err.message : "Failed to load existing files.");
    }
  }, []); // No dependencies needed as it uses the passed assignmentId

  const handleUploadFiles = async () => {
    if (!selectedFiles || selectedFiles.length === 0 || !selectedAssignment) {
      setUploadError("Please select files to upload.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
    }

    try {
      const response = await fetch(`/api/control-assignments/${selectedAssignment.id}/files`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, browser does it automatically for FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      // Add newly uploaded files to the state
      setUploadedFiles(prev => [...prev, ...result.files]);
      setSelectedFiles(null); // Clear selected files after successful upload
      // Optionally clear the file input visually if needed (requires ref)

    } catch (err) {
      console.error("Error uploading files:", err);
      setUploadError(err instanceof Error ? err.message : "An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };


  // --- Modal Handling ---
  const handleOpenDetailsModal = (assignment: FrontendControlAssignment) => {
    setSelectedAssignment(assignment);
    // Reset states for the modal
    setUploadedFiles([]); // Clear previous files
    setSelectedFiles(null); // Clear selected files
    setUploadError(null); // Clear upload errors
    setModalFormData({
      notes: assignment.notes ?? "",
      correctiveActions: assignment.correctiveActions ?? "",
      expectedComplianceDate: assignment.expectedComplianceDate ? new Date(assignment.expectedComplianceDate) : undefined,
      complianceLevel: assignment.complianceLevel ?? "",
    });
    setIsDetailsModalOpen(true);
    // Fetch existing files for this assignment
    fetchUploadedFiles(assignment.id);
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
    
    // Handle conditional date behavior based on compliance level
    if (level === ComplianceLevel.PARTIALLY_IMPLEMENTED || level === ComplianceLevel.NOT_IMPLEMENTED) {
      // For partially implemented or not implemented, keep the date picker available
      // but don't change the current date value
    } else if (level === ComplianceLevel.IMPLEMENTED || level === ComplianceLevel.NOT_APPLICABLE) {
      // For implemented or not applicable, set the date to the task deadline
      if (selectedAssignment?.task?.deadline) {
        setModalFormData(prev => ({ 
          ...prev, 
          complianceLevel: level,
          expectedComplianceDate: new Date(selectedAssignment.task.deadline)
        }));
      }
    }
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
   const filteredControls = assignedControls.filter((assignment: FrontendControlAssignment) => { // Add type annotation
     const searchTerm = searchQuery.toLowerCase();
     return (
      assignment.control.controlNumber.toLowerCase().includes(searchTerm) ||
      assignment.control.controlText.toLowerCase().includes(searchTerm) ||
      (assignment.task.sensitiveSystem?.systemName &&
        assignment.task.sensitiveSystem.systemName.toLowerCase().includes(searchTerm)) ||
      (assignment.task.sensitiveSystem?.assessment?.assessmentName && // Added assessment name to search
        assignment.task.sensitiveSystem.assessment.assessmentName.toLowerCase().includes(searchTerm)) ||
      translateStatus(assignment.status).toLowerCase().includes(searchTerm) ||
      getComplianceLevelText(assignment.complianceLevel).toLowerCase().includes(searchTerm)
     );
   });
   const now = new Date();

   // --- Determine Table Body Content ---
   let tableBodyContent;
   if (isLoadingControls) {
     tableBodyContent = (
       <tr><td colSpan={7} className="text-center py-4"><RefreshCw className="h-6 w-6 animate-spin inline-block mr-2" /> جاري تحميل الضوابط...</td></tr>
     );
   } else if (filteredControls.length === 0) {
     tableBodyContent = (
       <tr><td colSpan={7} className="text-center py-4">{searchQuery ? 'لا توجد نتائج مطابقة للبحث.' : 'لا توجد ضوابط معينة لك حاليًا.'}</td></tr>
     );
   } else {
     tableBodyContent = (
       <>
         {filteredControls.map((assignment) => (
           <tr key={assignment.id} className="group border-b border-gray-100 hover:bg-gray-50">
             <td className="py-4 pr-4">{assignment.task.sensitiveSystem?.assessment?.assessmentName || 'غير محدد'}</td>
             <td className="py-4" title={assignment.control.controlText}>
               {assignment.control.controlNumber}
             </td>
             <td className="py-4">{assignment.task.sensitiveSystem?.systemName || 'غير محدد'}</td>
             <td className="py-4">{getDisplayDate(assignment)}</td>
             <td className="py-4">
               {assignment.managerStatus ? (
                 <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                   {assignment.managerStatus}
                 </Badge>
               ) : (
                 <Badge {...getStatusBadgeProps(assignment.status)}>
                   {translateStatus(assignment.status)}
                 </Badge>
               )}
             </td>
             <td className="py-4 bg-white group-hover:bg-white">
               <Badge variant="outline" className={`px-2 py-1 border border-gray-400 ${getComplianceLevelBackgroundColorClass(assignment.complianceLevel)}`}>
                 {getComplianceLevelText(assignment.complianceLevel)}
               </Badge>
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
         ))}
       </>
     );
   }
   // --- End Determine Table Body Content ---


   return (
     <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
       {/* Use the shared AppHeader */}
      <AppHeader />

      {/* Main Content */}
      {/* No height adjustment needed here as it's not a sidebar layout */}
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
                <div className="text-3xl font-bold">{isLoadingControls ? '...' : assignedControls.filter(c => c.complianceLevel === ComplianceLevel.IMPLEMENTED).length}</div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-sm text-gray-600 mt-2">الضوابط المكتملة</div>
            </Card>
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{isLoadingControls ? '...' : assignedControls.filter(c => c.complianceLevel == null).length}</div>
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-sm text-gray-600 mt-2">الضوابط المعلقة</div>
            </Card>
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{isLoadingControls ? '...' : assignedControls.filter(c => new Date(c.task.deadline) < now).length}</div>
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
                   <th className="pb-3 font-medium text-gray-700 pr-4">اسم التقييم</th> {/* Moved column header */}
                   <th className="pb-3 font-medium text-gray-700">الضابط</th>
                   <th className="pb-3 font-medium text-gray-700">النظام الحساس</th>
                   <th className="pb-3 font-medium text-gray-700">تاريخ الالتزام المتوقع / الموعد النهائي</th>
                   <th className="pb-3 font-medium text-gray-700">حالة الضابط</th>
                   <th className="pb-3 font-medium text-gray-700">مستوى الالتزام</th>
                    <th className="pb-3 font-medium text-gray-700">الإجراءات</th>
                  </tr>
                 </thead>
                 <tbody>
                   {tableBodyContent}
                 </tbody>
               </table>
             </div>
          </Card>

          {/* OpenAI Chat Assistant */}
          <div className="w-full mt-8">
            <div className="flex items-center mb-4">
              
              <h2 className="text-xl font-semibold"> </h2>
            </div>
<ChatBox assistantId="asst_eG6IXbCoDgmOBx8eMa2qJWML" />
          </div>

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
          {error && isDetailsModalOpen && ( // Only show general error if modal is closed
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
            {/* Expected Compliance Date - Only show when compliance level is partially implemented or not implemented */}
            {(modalFormData.complianceLevel === ComplianceLevel.PARTIALLY_IMPLEMENTED || 
              modalFormData.complianceLevel === ComplianceLevel.NOT_IMPLEMENTED) && (
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
            )}
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

            {/* --- File Upload Section --- */}
            <div className="grid grid-cols-4 items-start gap-4 pt-4 border-t">
              <Label htmlFor="file-upload" className="text-right col-span-1 pt-2">رفع ملفات الأدلة</Label>
              <div className="col-span-3">
                <Input
                  id="file-upload"
                  type="file"
                  multiple // Allow multiple file selection
                  onChange={handleFileChange}
                  className="mb-2"
                  disabled={isUploading} // Disable while uploading
                />
                {selectedFiles && selectedFiles.length > 0 && (
                  <Button
                    onClick={handleUploadFiles}
                    disabled={isUploading}
                    size="sm"
                    className="mb-2"
                  >
                    {isUploading ? (
                      <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> جاري الرفع...</>
                    ) : (
                      <><Upload className="mr-2 h-4 w-4" /> رفع الملفات المختارة</>
                    )}
                  </Button>
                )}
                {uploadError && (
                  <p className="text-sm text-red-600 mt-1">{uploadError}</p>
                )}
                {/* Display Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">الملفات المرفقة:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {uploadedFiles.map((file) => (
                        <li key={file.id}>
                          <a
                            href={file.filePath} // Use the DB path directly
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            download={file.originalFilename} // Suggest original filename for download
                          >
                            {file.originalFilename}
                          </a>
                          <span className="text-xs text-gray-500 ml-2">({formatDate(file.createdAt)})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            {/* --- End File Upload Section --- */}


            {/* --- Display Manager Review (Read-Only) --- */}
            {selectedAssignment?.managerStatus && (
              <div className="grid grid-cols-4 items-center gap-4 mt-4 pt-4 border-t">
                <Label className="text-right col-span-1 font-semibold">حالة المراجعة</Label>
                <Badge variant="outline" className="col-span-3 justify-start p-2 bg-gray-100 text-gray-700 border-gray-300">
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
