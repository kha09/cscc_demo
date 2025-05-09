"use client"

import { useState, useEffect, useCallback } from "react"
import { default as _Image } from "next/image"
import { useRouter } from 'next/navigation'; // Import useRouter
import { useAuth } from "@/lib/auth-context"; // Import useAuth
// Import necessary types AND values from Prisma
import {
  User as PrismaUser,
  Task as PrismaTask,
  Control as PrismaControl,
  SensitiveSystemInfo as PrismaSensitiveSystemInfo,
  ControlAssignment as PrismaControlAssignment,
  TaskStatus, // Ensure this is a value import
  ComplianceLevel // Import ComplianceLevel enum
} from "@prisma/client";
// Keep other type imports if needed using 'import type'
 // Example: import type { SomeOtherType } from "@prisma/client";
 import {
   Bell as _Bell,
   // PlusCircle, // Removed unused import
   User as _UserIcon,
   LogOut as _LogOut, // Import LogOut icon
   ClipboardList,
   BarChart,
   FileText as _FileText,
   AlertTriangle,
   Search,
   // Filter, // Removed unused import
   // Download, // Removed unused import
   CheckCircle,
   Users,
   UserPlus,
  RefreshCw as _RefreshCw,
  ChevronDown as _ChevronDown, // Added for expanding task details
  ChevronUp as _ChevronUp // Added for collapsing task details
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card" // Removed unused CardFooter
import { Input } from "@/components/ui/input"
import { default as _Link } from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Removed Tooltip import as it seems unused and causes errors
import { Badge } from "@/components/ui/badge"; // Added Badge for status
import { Textarea as _Textarea } from "@/components/ui/textarea"; // Added Textarea for notes
import { Label as _Label } from "@/components/ui/label"; // Added Label import
import React, { ChangeEvent as _ChangeEvent } from "react"; // Import React for Fragment and ChangeEvent

// Define User type for frontend use
type FrontendUser = Pick<PrismaUser, 'id' | 'name' | 'nameAr' | 'email' | 'role' | 'department'>;

// Define ControlAssignment type for frontend use, including notes
interface FrontendControlAssignment extends Omit<PrismaControlAssignment, 'createdAt' | 'updatedAt' | 'control' | 'assignedUser'> {
  control: Pick<PrismaControl, 'id' | 'controlNumber' | 'controlText' | 'mainComponent' | 'subComponent' | 'controlType'>;
  assignedUser: Pick<PrismaUser, 'id' | 'name' | 'nameAr'> | null; // Make assignedUser required but nullable
  notes: string | null; // Ensure notes is included
  status: TaskStatus; // Ensure status is included
  complianceLevel: ComplianceLevel | null; // Add complianceLevel
}

// Define Task type for frontend use, including controlAssignments and assessmentName
interface FrontendTask extends Omit<PrismaTask, 'deadline' | 'createdAt' | 'updatedAt' | 'sensitiveSystem' | 'assignedTo' | 'controlAssignments'> {
  deadline: string;
  createdAt: string;
  sensitiveSystem: (Pick<PrismaSensitiveSystemInfo, 'systemName'> & {
    assessment?: { id: string; assessmentName: string } | null; // Include nested assessment id and name
  }) | null;
  assignedTo: Pick<PrismaUser, 'id' | 'name' | 'nameAr'> | null; // Manager responsible for the task
  controlAssignments: FrontendControlAssignment[]; // Use the new interface
  // progress?: number | null; // Progress might be calculated or fetched differently now
}


export default function DepartmentManagerDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  // State now holds tasks assigned to the manager, which contain control assignments
  const [managerTasks, setManagerTasks] = useState<FrontendTask[]>([]);
  // Separate state for assignments specifically for team members might be useful for the "Team Tasks" view
  // Or we can filter managerTasks.flatMap(t => t.controlAssignments)
  const [teamMembers, setTeamMembers] = useState<FrontendUser[]>([]);
  const [availableUsers, setAvailableUsers] = useState<FrontendUser[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Ensure all statuses used in handleSaveNotesAndStatus are included here
  const [assignmentStatus, setAssignmentStatus] = useState<{ [key: string]: 'loading' | 'error' | 'success' | 'saving' | 'saving-success' | 'saving-error' }>({});
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set()); // Track expanded tasks for manager's view
  // Removed expandedTeamAssignments state

  // State for latest assessment and approval status
  const [latestAssessment, setLatestAssessment] = useState<{
    assessmentId: string;
    sensitiveSystemId: string;
    securityManagerId: string;
  } | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isApprovingAssessment, setIsApprovingAssessment] = useState(false);

  // State for modals
  const [_isDetailsModalOpen, _setIsDetailsModalOpen] = useState(false);
  // Modal now shows details of a Task, focusing on its ControlAssignments
  const [_selectedTaskForDetailsModal] = useState<FrontendTask | null>(null); // Removed unused setter
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  // Removed state related to the old incorrect assignment modal

  // Auth and Routing
  const { user, logout } = useAuth(); // Get user from auth context
  const router = useRouter();

  // Function to find the latest assessment from tasks
  const findLatestAssessment = useCallback((tasks: FrontendTask[]) => {
    if (!tasks || tasks.length === 0) return null;

    // Sort tasks by createdAt in descending order (newest first)
    const sortedTasks = [...tasks].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Find the first task with a valid assessment
    for (const task of sortedTasks) {
      if (task.sensitiveSystem?.assessment) {
        return {
          assessmentId: task.sensitiveSystem.assessment.id,
          sensitiveSystemId: task.sensitiveSystemId,
          securityManagerId: task.assignedById, // Security manager is the one who assigned the task
        };
      }
    }

    return null;
  }, []);

  // Check if the latest assessment is approved
  const checkAssessmentApproval = useCallback(async (assessmentData: {
    assessmentId: string;
    sensitiveSystemId: string;
    securityManagerId: string;
  } | null) => {
    if (!assessmentData || !user?.id) return;

    try {
      console.log("Checking assessment approval with data:", {
        assessmentId: assessmentData.assessmentId,
        departmentManagerId: user.id
      });

      // Default to not approved if we can't check
      setIsApproved(false);

      // Try to fetch the approval status
      const response = await fetch(
        `/api/assessment-status/check?assessmentId=${assessmentData.assessmentId}&departmentManagerId=${user.id}`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        // Don't throw an error, just log it and continue with default (not approved)
        console.error(`Failed to check assessment status: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      console.log("Assessment approval check result:", data);
      setIsApproved(data.approved);
      // Clear any previous errors if the check was successful
      setError(null);
    } catch (err) {
      console.error("Error checking assessment approval:", err);
      // Don't show the error if we're still loading tasks
      // And don't set an error at all - just default to not approved
      // if (!isLoadingTasks) {
      //   setError("فشل في التحقق من حالة الاعتماد");
      // }
    }
  }, [user?.id]);

  // Open the confirmation dialog
  const openApproveConfirmation = () => {
    if (!latestAssessment || !user?.id || isApproved || isApprovingAssessment) return;
    setIsApproveConfirmOpen(true);
  };

  // Handle approving the latest assessment
  const handleApproveLatest = async () => {
    if (!latestAssessment || !user?.id || isApproved || isApprovingAssessment) return;

    setIsApprovingAssessment(true);
    setError(null);
    // Close the confirmation dialog
    setIsApproveConfirmOpen(false);

    try {
      console.log("Approving assessment with data:", {
        ...latestAssessment,
        departmentManagerId: user.id
      });

      // Try to approve the assessment
      // Try to approve the assessment
      const response = await fetch('/api/assessment-status/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: latestAssessment.assessmentId,
          sensitiveSystemId: latestAssessment.sensitiveSystemId,
          securityManagerId: latestAssessment.securityManagerId,
          departmentManagerId: user.id
        }),
      });

      // Log the raw response for debugging
      const responseText = await response.text();
      console.log("Raw API response:", responseText);

      // Try to parse the response as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing response as JSON:", parseError);
        throw new Error("Invalid response format from server");
      }

      // Check if the response was successful
      if (!response.ok) {
        throw new Error(result.error || result.message || `Failed to approve assessment: ${response.statusText}`);
      }

      console.log("Assessment approval result:", result);
      setIsApproved(true);
      
      // Show success message
      alert("تم اعتماد التقييم بنجاح");
    } catch (err: unknown) {
      console.error("Error approving assessment:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage || "فشل في اعتماد التقييم");
      
      // Show error message
      alert("فشل في اعتماد التقييم: " + errorMessage);
    } finally {
      setIsApprovingAssessment(false);
    }
  };

  // --- Toggle Task Expansion ---
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // --- Toggle Team Assignment Expansion (REMOVED) ---

  // --- Handle Edits in Expanded Row (REMOVED) ---
  // const handleEditChange = ... (Removed)

  // --- Save Notes and Compliance Level (REMOVED) ---
  // const handleSaveNotesAndStatus = ... (Removed)

  // Handle Logout
  const _handleLogout = () => {
    logout();
    router.push('/signin'); // Redirect to signin page after logout
  };


  // --- Fetch Team Members and Available Users ---
  const fetchUsers = useCallback(async () => {
    if (!user?.department) { // Use user from useAuth
        setIsLoadingUsers(false);
        return;
    }
    setIsLoadingUsers(true);
    // Don't clear main error here, let task fetching handle its errors
    // setError(null);

    try {
        const teamResponse = await fetch(`/api/users?department=${user.department}&role=USER`); // Use user.department
        if (!teamResponse.ok) throw new Error(`Failed to fetch team members: ${teamResponse.statusText}`);
        const teamData: FrontendUser[] = await teamResponse.json();
        setTeamMembers(teamData);

        const availableResponse = await fetch(`/api/users?role=USER`);
        if (!availableResponse.ok) throw new Error(`Failed to fetch available users: ${availableResponse.statusText}`);
        const allUserData: FrontendUser[] = await availableResponse.json();
        const currentTeamMemberIds = new Set(teamData.map(member => member.id));
        const availableData = allUserData.filter(availableUser => !currentTeamMemberIds.has(availableUser.id)); // Renamed parameter
        setAvailableUsers(availableData);

    } catch (err: unknown) { // Changed any to unknown
        console.error("Error fetching team/available users:", err);
        if (!error) { // Only set error if no other error exists
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
            setError(errorMessage || "Failed to fetch user lists.");
        }
    } finally {
        setIsLoadingUsers(false);
    }
  }, [user, error]); // Depend on user

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


   // --- Fetch Tasks (Assigned to Manager) ---
   // Renamed fetchAllTasks to fetchManagerTasks for clarity
   const fetchManagerTasks = useCallback(async () => {
    if (!user?.id) { // Use user from useAuth
      if (!isLoadingUsers && !error) {
           setIsLoadingTasks(false);
      }
      return;
    }

    setIsLoadingTasks(true);
    // Clear previous task-specific errors, but not user errors
    // setError(null); // Maybe introduce a taskError state? For now, let's overwrite.

    try {
      // Fetch tasks assigned directly TO the current manager, including control assignments
      // Add cache: 'no-store' to prevent caching
      const response = await fetch(`/api/tasks?assignedToId=${user.id}`, { cache: 'no-store' }); // Use user.id
      if (!response.ok) {
        throw new Error(`Failed to fetch manager tasks: ${response.statusText}`);
      }
      // Ensure the fetched data matches the updated FrontendTask interface
      const tasksData: FrontendTask[] = await response.json();

      // Log the fetched data structure for debugging
      console.log("Fetched Manager Tasks Data:", JSON.stringify(tasksData, null, 2));

      setManagerTasks(tasksData);
      // Clear general error if task fetch succeeds
      setError(null);

    } catch (e: unknown) { // Changed catch variable type
      console.error("Failed to fetch tasks:", e);
      if (e instanceof Error) {
          setError(`فشل في جلب المهام: ${e.message}`);
      } else {
           setError("فشل في جلب المهام بسبب خطأ غير معروف.");
      }
    } finally {
      setIsLoadingTasks(false);
    }
  // Depend on user.id, isLoadingUsers, and error state
  }, [user, isLoadingUsers, error]); // Depend on user

  useEffect(() => {
    fetchManagerTasks();
  }, [fetchManagerTasks]); // Run when fetchManagerTasks changes

  // Set latest assessment when manager tasks change
  useEffect(() => {
    if (!isLoadingTasks && managerTasks.length > 0) {
      const latest = findLatestAssessment(managerTasks);
      console.log("Found latest assessment:", latest);
      setLatestAssessment(latest);
    }
  }, [managerTasks, isLoadingTasks, findLatestAssessment]);

  // Check approval status when latest assessment changes
  useEffect(() => {
    if (latestAssessment) {
      checkAssessmentApproval(latestAssessment);
    } else {
      // Reset approval status when there's no latest assessment
      setIsApproved(false);
    }
  }, [latestAssessment, checkAssessmentApproval]);


  // --- Add User to Team ---
  const handleAddUserToTeam = async (userId: string) => {
    if (!user?.department) { // Use user from useAuth
      setError("لا يمكن إضافة المستخدم: لم يتم تحديد قسم المدير.");
      return;
    }
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department: user.department }), // Use user.department
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add user to team: ${response.statusText}`);
      }
      fetchUsers();
      setIsAddUserModalOpen(false);
    } catch (err: unknown) { // Changed any to unknown
      console.error("Error adding user to team:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage || "حدث خطأ أثناء إضافة المستخدم للفريق.");
    }
  };

  // --- Assign Control to User ---
  const handleAssignControl = async (assignmentId: string, userId: string | null) => {
    setAssignmentStatus(prev => ({ ...prev, [assignmentId]: 'loading' }));
    setError(null); // Clear general errors when attempting assignment

    try {
      const response = await fetch(`/api/control-assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedUserId: userId }), // Send null to unassign
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Set the main error state to display the issue
        setError(errorData.message || `Failed to assign control: ${response.statusText}`);
        setAssignmentStatus(prev => ({ ...prev, [assignmentId]: 'error' })); // Also set specific assignment status to error
        return; // Stop execution if the API call failed
      }

      // If response is OK (status 2xx)

      // --- START: Local State Update ---
      // Update the local state optimistically instead of refetching
      setManagerTasks(currentTasks => {
        return currentTasks.map(task => {
          // Find the task containing the assignment
          const assignmentIndex = task.controlAssignments.findIndex(a => a.id === assignmentId);
          if (assignmentIndex === -1) {
            return task; // Not the task we're looking for
          }

          // Create a new assignment object with the updated user ID
          const updatedAssignment = {
            ...task.controlAssignments[assignmentIndex],
            assignedUserId: userId,
            // Find the user object from teamMembers to update assignedUser (important for display)
            assignedUser: userId ? teamMembers.find(u => u.id === userId) ?? null : null
          };

          // Create a new assignments array for the task
          const newAssignments = [
            ...task.controlAssignments.slice(0, assignmentIndex),
            updatedAssignment,
            ...task.controlAssignments.slice(assignmentIndex + 1),
          ];

          // Return a new task object with the updated assignments
          return { ...task, controlAssignments: newAssignments };
        });
      });
      // --- END: Local State Update ---


      setAssignmentStatus(prev => ({ ...prev, [assignmentId]: 'success' }));

      // Optional: Clear success status after a few seconds
      setTimeout(() => setAssignmentStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[assignmentId]; // Remove the status entry
          return newStatus;
      }), 3000);


    } catch (err: unknown) { // Changed any to unknown
      console.error("Error assigning control:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage || "حدث خطأ أثناء تعيين الضابط.");
      setAssignmentStatus(prev => ({ ...prev, [assignmentId]: 'error' }));
    }
  };

  // --- Helper function to calculate task progress ---
  const calculateProgress = (task: FrontendTask): number => {
    if (!task.controlAssignments || task.controlAssignments.length === 0) {
      return 0; // No controls, no progress
    }
    const evaluated = task.controlAssignments.filter(a => a.complianceLevel !== null).length;
    const total = 105; // Fixed total number of controls as per requirement
    // Removed unnecessary check: if (total === 0) return 0;
    return Math.round((evaluated / total) * 100);
  };

  // --- Helper function to determine Department Manager Task Status ---
  const getDMTaskStatus = (task: FrontendTask): { text: string; className: string } => {
    // Check if controlAssignments exist and are not empty
    if (!task.controlAssignments || task.controlAssignments.length === 0) {
      // If no controls, default to 'In Progress'
      return { text: 'قيد التنفيذ', className: 'bg-blue-100 text-blue-700' };
    }

    const totalControls = task.controlAssignments.length;
    const evaluatedControls = task.controlAssignments.filter(
      (assignment) => assignment.complianceLevel !== null
    ).length;

    // Condition: All controls have been evaluated (complianceLevel is set)
    if (evaluatedControls === totalControls) {
      return { text: 'مكتمل للمراجعة والاعتماد', className: 'bg-green-100 text-green-700' };
    }

    // Otherwise, it's still in progress
    return { text: 'قيد التنفيذ', className: 'bg-blue-100 text-blue-700' };

    // Deferred 'معتمد' logic (See معتمد.mdc):
    // Check assessment status
    // if (assessmentIsApproved) {
    //   return { text: 'معتمد', className: 'bg-purple-100 text-purple-700' };
    // }
  };


  // Helper function to format date
  // (This function remains the same)
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch { return 'تاريخ غير صالح'; } // Removed unused _e variable
  };


  // Helper to translate ComplianceLevel enum to Arabic text
  const getComplianceLevelText = (level: ComplianceLevel | null | undefined): string => {
    switch (level) {
      case ComplianceLevel.NOT_IMPLEMENTED: return "غير مطبق";
      case ComplianceLevel.PARTIALLY_IMPLEMENTED: return "مطبق جزئيًا";
      case ComplianceLevel.IMPLEMENTED: return "مطبق كليًا";
      case ComplianceLevel.NOT_APPLICABLE: return "لا ينطبق";
      default: return "غير محدد";
    }
  };

  // Helper to get background color class for ComplianceLevel
  const getComplianceLevelBackgroundColorClass = (level: ComplianceLevel | null | undefined): string => {
    switch (level) {
      case ComplianceLevel.IMPLEMENTED: return "bg-green-200 text-green-800";
      case ComplianceLevel.PARTIALLY_IMPLEMENTED: return "bg-yellow-200 text-yellow-800";
      case ComplianceLevel.NOT_IMPLEMENTED: return "bg-red-200 text-red-800";
      case ComplianceLevel.NOT_APPLICABLE: return "bg-gray-200 text-gray-800";
      default: return "bg-gray-100 text-gray-700";
    }
  };


  // Function to open the details modal (now shows Task details with assignments)
  // const handleOpenDetailsModal = (task: FrontendTask) => {
  //   setSelectedTaskForDetailsModal(task);
  //   setIsDetailsModalOpen(true);
  // };

  // Removed handleOpenAssignTaskModal


  // --- Render Logic ---
  // Removed duplicate function declarations from here
  const renderUserList = (users: FrontendUser[], actionButton?: (_user: FrontendUser) => React.ReactNode) => { // Prefixed unused 'user' with '_'
    if (isLoadingUsers) return <p>جاري تحميل المستخدمين...</p>;
    if (!users || users.length === 0) return <p>لا يوجد مستخدمون لعرضهم.</p>;

    return users.map((user) => ( // Renamed parameter to avoid conflict with outer scope if needed, though '_' prefix handles linting
      <div key={user.id} className="flex justify-between items-center p-3 border rounded-lg mb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-nca-teal text-white flex items-center justify-center mr-3 ml-3">
            {/* Simple initials placeholder */}
            <span>{user.nameAr?.substring(0, 2) || user.name?.substring(0, 2) || '؟'}</span>
          </div>
          <div>
            <p className="font-medium">{user.nameAr || user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        {actionButton && actionButton(user)}
      </div>
    ));
  };

  // --- Calculate Team Assignments Before Return ---
  const teamAssignments = !isLoadingTasks && !isLoadingUsers ? managerTasks.flatMap((task: FrontendTask) =>
    task.controlAssignments
      .filter((assignment: FrontendControlAssignment) => assignment.assignedUserId && assignment.assignedUserId !== user?.id) // Use user.id
      .map((assignment: FrontendControlAssignment) => ({ ...assignment, taskDeadline: task.deadline, taskSystemName: task.sensitiveSystem?.systemName })) // Include parent task info
   ) : []; // Keep explicit semicolon


  // Helper function to determine badge class based on status (Restored)
  const _getStatusBadgeClass = (status: TaskStatus | undefined | null): string => {
    switch (status) {
      case TaskStatus.COMPLETED: return 'bg-green-100 text-green-700';
      case TaskStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case TaskStatus.OVERDUE: return 'bg-red-100 text-red-700';
      // Temporarily comment out problematic cases to isolate TS/JSX errors
      // case TaskStatus.APPROVED: return 'bg-purple-100 text-purple-700';
      // case TaskStatus.REJECTED: return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700'; // Fallback style
     }
   };
 
   // --- Calculate Average Compliance Before Return ---
   const averageCompliance = isLoadingTasks || managerTasks.length === 0
     ? 0 // Default to 0 if loading or no tasks
     : Math.round(
          managerTasks.reduce((sum, task) => sum + calculateProgress(task), 0) / managerTasks.length
        );
  
    // --- Calculate Pending Controls Count Before Return ---
    const pendingControlsCount = isLoadingTasks
      ? 0 // Default to 0 if loading
      : managerTasks.flatMap(task => task.controlAssignments)
                    .filter(assignment => assignment.complianceLevel === null)
                    .length;
  
    // Return statement now only includes the main content for the page,
    // as the header and sidebar are handled by layout.tsx
  return (
    // Removed outer div and header
    // <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      // {/* Header Removed */}
      // <main className="p-6"> // Main tag is handled by layout
        // <div className="max-w-7xl mx-auto"> // Removed max-width container, layout handles structure
        <> {/* Use Fragment to return multiple top-level elements */}
          {/* Display General Errors */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">خطأ! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            {/* Dynamically display department name */}
            <h1 className="text-2xl font-bold text-slate-800">
              لوحة مدير القسم {user?.department ? `- ${user.department}` : ''} {/* Use user.department */}
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

          {/* Stats Cards - Update Team Members count */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* ... other cards ... */}
             <Card className="p-6">
               <div className="flex justify-between items-center">
                 {/* Display the count of manager's tasks */}
                 <div className="text-3xl font-bold">
                   {isLoadingTasks ? '...' : managerTasks.length}
                 </div>
                 <ClipboardList className="h-6 w-6 text-nca-teal" />
               </div>
               <div className="text-sm text-gray-600 mt-2">التقييمات النشطة والمنجزة</div>
             </Card>
 
              <Card className="p-6">
                <div className="flex justify-between items-center">
                  {/* Display calculated average compliance */}
                  <div className="text-3xl font-bold">
                    {isLoadingTasks ? '...' : `${averageCompliance}%`}
                  </div>
                  <BarChart className="h-6 w-6 text-nca-teal" />
                </div>
                <div className="text-sm text-gray-600 mt-2">متوسط نسبة الامتثال</div>
             </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{isLoadingUsers ? '...' : teamMembers.length}</div>
                <Users className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">أعضاء الفريق</div>
            </Card>

              <Card className="p-6">
                <div className="flex justify-between items-center">
                  {/* Display the count of pending controls */}
                  <div className="text-3xl font-bold">
                    {isLoadingTasks ? '...' : pendingControlsCount}
                  </div>
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="text-sm text-gray-600 mt-2">ضوابط معلقة</div> {/* Updated text to reflect controls */}
             </Card>
            {/* ... other cards ... */}
          </div>

            {/* Tasks Assigned TO MANAGER Section - Now in its own row */}
            <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">المهام المعينة لك ({user?.nameAr || user?.name})</h2> {/* Use user.nameAr or user.name */}
              <Button 
                onClick={openApproveConfirmation} 
                disabled={isApproved || !latestAssessment || isApprovingAssessment || (() => {
                  const latestTask = managerTasks.find(
                    (t) => t.sensitiveSystem?.assessment?.id === latestAssessment?.assessmentId
                  );
                  const { text: latestStatusText } = getDMTaskStatus(latestTask!);
                  return latestStatusText !== 'مكتمل للمراجعة والاعتماد';
                })()}
                className={`${isApproved ? 'bg-gray-500' : 'bg-blue-800 hover:bg-blue-900'} text-white`}
              >
                {isApprovingAssessment ? 'جاري الاعتماد...' : isApproved ? 'تم الاعتماد' : 'اعتماد'}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-right border-b border-gray-200">
                    <th className="pb-3 font-medium text-gray-700 pr-4">اسم التقييم</th> {/* Added Column */}
                    <th className="pb-3 font-medium text-gray-700">النظام</th>
                    <th className="pb-3 font-medium text-gray-700">الضوابط</th>
                    <th className="pb-3 font-medium text-gray-700">الموعد النهائي</th>
                    <th className="pb-3 font-medium text-gray-700">الحالة</th>
                    <th className="pb-3 font-medium text-gray-700">التقدم</th>
                    <th className="pb-3 font-medium text-gray-700 pl-4">الإجراءات</th> {/* Added Actions Header */}
                  </tr>
                </thead>
                <tbody>
                  {isLoadingTasks ? (
                    <tr><td colSpan={7} className="text-center py-4">جاري تحميل المهام...</td></tr> // Updated colSpan
                  ) : managerTasks.length === 0 ? ( // Use managerTasks
                    <tr><td colSpan={7} className="text-center py-4">لا توجد مهام معينة لك.</td></tr> // Updated colSpan
                  ) : (
                    managerTasks.map((task: FrontendTask) => ( // Use managerTasks and add type
                     <React.Fragment key={task.id}>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 pr-4">{task.sensitiveSystem?.assessment?.assessmentName || 'غير محدد'}</td> {/* Added Cell */}
                        <td className="py-4">{task.sensitiveSystem?.systemName || 'غير محدد'}</td>
                        {/* Display count of controls instead of list */}
                        <td className="py-4">
                          {task.controlAssignments?.length ?? 0} ضوابط
                        </td>
                        <td className="py-4">{formatDate(task.deadline)}</td>
                        <td className="py-4">
                          {/* Use new helper function for DM-specific status */}
                          {(() => {
                            const { text, className } = getDMTaskStatus(task);
                            return (
                              <Badge variant="secondary" className={className}>
                                {text}
                              </Badge>
                            );
                          })()}
                        </td>
                        <td className="py-4">
                          {/* Use calculateProgress function */}
                          {(() => {
                            const progress = calculateProgress(task);
                            return (
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                                  <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm">{progress}%</span>
                              </div>
                            );
                          })()}
                        </td>
                        {/* Actions Column - Using flex, w-full, and ml-auto to push approve button to the end */}
                        <td className="py-4 pl-4 flex items-center w-full"> {/* Added w-full back */}
                           {/* Button to show/hide details */}
                           <Button variant="link" size="sm" onClick={() => toggleTaskExpansion(task.id)} className="text-nca-teal hover:underline">
                             {expandedTasks.has(task.id) ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                           </Button>
                        </td>
                      </tr>
                      {/* Expanded Row for Control Assignments */}
                      {expandedTasks.has(task.id) && (
                        <tr className="bg-gray-100">
                          <td colSpan={7} className="p-4"> {/* Updated colSpan */}
                            <h4 className="font-semibold mb-2 text-sm">الضوابط :</h4>
                            {task.controlAssignments && task.controlAssignments.length > 0 ? (
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="pb-2 font-medium text-gray-600 text-right pr-2">الضابط</th>
                                    <th className="pb-2 font-medium text-gray-600 text-right">النص</th>
                                    <th className="pb-2 font-medium text-gray-600 text-right">المستخدم المعين</th>
                                    {/* Removed الحالة Header */}
                                    <th className="pb-2 font-medium text-gray-600 text-right">مستوى الامتثال</th>
                                    {/*<th className="pb-2 font-medium text-gray-600 text-right pl-2">الإجراء</th>*/}
                                  </tr>
                                </thead>
                                <tbody>
                                  {task.controlAssignments.map(assignment => (
                                    <tr key={assignment.id} className="border-b border-gray-200">
                                      <td className="py-2 pr-2">{assignment.control.controlNumber}</td>
                                      <td className="py-2">{assignment.control.controlText}</td>
                                      <td className="py-2">
                                        <Select
                                          value={assignment.assignedUserId ?? 'unassigned'} // Default to 'unassigned' if null
                                          onValueChange={(value) => handleAssignControl(assignment.id, value === 'unassigned' ? null : value)}
                                          disabled={assignmentStatus[assignment.id] === 'loading'}
                                        >
                                          <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="اختر مستخدم..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="unassigned">غير معين</SelectItem>
                                            {teamMembers.map(member => (
                                              <SelectItem key={member.id} value={member.id}>
                                                {member.nameAr || member.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        {assignmentStatus[assignment.id] === 'loading' && <span className="text-xs ml-2">جاري الحفظ...</span>}
                                        {assignmentStatus[assignment.id] === 'success' && <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />}
                                        {assignmentStatus[assignment.id] === 'error' && <AlertTriangle className="h-4 w-4 text-red-500 inline ml-2" />}
                                      </td>
                                      {/* Removed الحالة Cell */}
                                      <td className="py-2">
                                        <Badge variant="secondary" className={getComplianceLevelBackgroundColorClass(assignment.complianceLevel)}>
                                          {getComplianceLevelText(assignment.complianceLevel)}
                                        </Badge>
                                      </td>
                                      <td className="py-2 pl-2">
                                        {/* Maybe add a button to view assignment details if needed */}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-sm text-gray-500">لا توجد ضوابط معينة لهذه المهمة.</p>
                            )}
                          </td>
                        </tr>
                      )}
                     </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Two Column Layout for Team Members and Team Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Team Members Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-semibold">أعضاء الفريق</CardTitle>
                {/* Add User Button/Modal Trigger */}
                <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                      <UserPlus className="h-4 w-4" />
                      إضافة عضو
                    </Button>
                  </DialogTrigger>
                  {/* Modal Content is defined later, only trigger is here */}
                </Dialog>
              </CardHeader>
               <CardContent className="pt-4 space-y-4 max-h-[400px] overflow-y-auto">
                  {/* Render Team Members - Removed action button */}
                  {renderUserList(teamMembers)}
                  {/* Handle loading and empty states */}
                  {isLoadingUsers && <p>جاري تحميل أعضاء الفريق...</p>}
                 {!isLoadingUsers && teamMembers.length === 0 && (
                   <p className="text-center text-gray-500 py-4">لا يوجد أعضاء في هذا الفريق بعد.</p>
                 )}
              </CardContent>
            </Card>

            {/* Team Tasks Card - Restored */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">مهام أعضاء الفريق</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 max-h-[400px] overflow-y-auto">
                {isLoadingTasks || isLoadingUsers ? (
                  <p>جاري تحميل المهام والمستخدمين...</p>
                ) : teamAssignments.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">لا توجد ضوابط معينة لأعضاء الفريق حاليًا.</p>
                ) : (
                  teamAssignments.map(assignment => (
                    <div key={assignment.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium truncate" title={`${assignment.taskSystemName} - ${assignment.control.controlNumber}`}>
                          {assignment.taskSystemName || 'غير محدد'} - {assignment.control.controlNumber}
                        </span>
                        {/* Replace TaskStatus badge with ComplianceLevel badge */}
                        <Badge variant="secondary" className={`text-xs ${getComplianceLevelBackgroundColorClass(assignment.complianceLevel)}`}>
                          {getComplianceLevelText(assignment.complianceLevel)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 truncate" title={assignment.control.controlText}>
                        {assignment.control.controlText}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>المسؤول: {assignment.assignedUser?.nameAr || assignment.assignedUser?.name || 'غير معروف'}</span>
                        <span>الاستحقاق: {formatDate(assignment.taskDeadline)}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div> {/* Close the two-column grid div */}


          {/* Approval Confirmation Dialog */}
          <Dialog open={isApproveConfirmOpen} onOpenChange={setIsApproveConfirmOpen}>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
              <DialogHeader>
                <DialogTitle>تأكيد الاعتماد</DialogTitle>
                <DialogDescription>
                  هل أنت متأكد من إجراء الاعتماد؟
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => setIsApproveConfirmOpen(false)}>
                  لا
                </Button>
                <Button 
                  onClick={handleApproveLatest}
                  className="bg-blue-800 hover:bg-blue-900 text-white"
                >
                  نعم
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add User Modal */}
          {/* Trigger is now inside the Team Members Card Header */}
          <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
            {/* NO TRIGGER HERE */}
            <DialogContent className="sm:max-w-[600px]" dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة مستخدم إلى فريقك ({user?.department})</DialogTitle> {/* Use user.department */}
                <DialogDescription>
                  اختر مستخدمًا من القائمة لإضافته إلى قسمك الحالي.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 max-h-[400px] overflow-y-auto">
                {isLoadingUsers ? (
                  <p>جاري تحميل المستخدمين المتاحين...</p>
                ) : availableUsers.length > 0 ? (
                  renderUserList(availableUsers, (userToAdd) => ( // Renamed parameter
                    <Button onClick={() => handleAddUserToTeam(userToAdd.id)}>إضافة للفريق</Button>
                  ))
                ) : (
                  <p>لا يوجد مستخدمون متاحون للإضافة.</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUserModalOpen(false)}>إغلاق</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Removed Details Modal as it wasn't fully implemented/used */}

        {/* </div> // Removed max-width container div */}
      {/* </main> // Main tag is handled by layout */}
    {/* </div> // Removed outer div */}
    </> // Close Fragment
  );
}
