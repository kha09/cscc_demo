"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
// Import necessary types from Prisma
import type {
  User as PrismaUser,
  Task as PrismaTask,
  Control as PrismaControl,
  SensitiveSystemInfo as PrismaSensitiveSystemInfo,
  ControlAssignment as PrismaControlAssignment, // Import ControlAssignment
  TaskStatus // Import TaskStatus enum
} from "@prisma/client";
import {
  Bell,
  PlusCircle,
  User as UserIcon,
  ClipboardList,
  BarChart,
  FileText,
  AlertTriangle,
  Search,
  Filter,
  Download,
  CheckCircle,
  Users,
  UserPlus,
  RefreshCw,
  ChevronDown, // Added for expanding task details
  ChevronUp // Added for collapsing task details
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Removed Tooltip import as it seems unused and causes errors
import { Badge } from "@/components/ui/badge"; // Added Badge for status
import React from "react"; // Import React for Fragment

// Define User type for frontend use
interface FrontendUser extends Pick<PrismaUser, 'id' | 'name' | 'nameAr' | 'email' | 'role' | 'department'> {}

// Define ControlAssignment type for frontend use
interface FrontendControlAssignment extends Omit<PrismaControlAssignment, 'createdAt' | 'updatedAt' | 'control' | 'assignedUser'> {
  control: Pick<PrismaControl, 'id' | 'controlNumber' | 'controlText' | 'mainComponent' | 'subComponent' | 'controlType'>;
  assignedUser: Pick<PrismaUser, 'id' | 'name' | 'nameAr'> | null; // Make assignedUser required but nullable
}

// Define Task type for frontend use, including controlAssignments
interface FrontendTask extends Omit<PrismaTask, 'deadline' | 'createdAt' | 'updatedAt' | 'sensitiveSystem' | 'assignedTo' | 'controlAssignments'> {
  deadline: string;
  createdAt: string;
  sensitiveSystem: Pick<PrismaSensitiveSystemInfo, 'systemName'> | null;
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
  const [currentUser, setCurrentUser] = useState<FrontendUser | null>(null);
  const [assignmentStatus, setAssignmentStatus] = useState<{ [key: string]: 'loading' | 'error' | 'success' }>({}); // Track status per assignment ID
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set()); // Track expanded tasks

  // State for modals
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  // Modal now shows details of a Task, focusing on its ControlAssignments
  const [selectedTaskForDetailsModal, setSelectedTaskForDetailsModal] = useState<FrontendTask | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  // Removed state related to the old incorrect assignment modal


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

  // --- Fetch Current User (Department Manager) ---
  // (This useEffect remains largely the same)
  useEffect(() => {
    const fetchDeptManager = async () => {
      setIsLoadingUsers(true);
      setError(null);
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`);
        const users: PrismaUser[] = await response.json();
        const deptManager = users.find(user => user.role === 'DEPARTMENT_MANAGER');

        if (deptManager) {
          setCurrentUser({
            id: deptManager.id,
            name: deptManager.name,
            nameAr: deptManager.nameAr,
            email: deptManager.email,
            role: deptManager.role,
            department: deptManager.department
          });
        } else {
          setError("Logged-in user is not a Department Manager or user not found.");
        }
      } catch (err: any) {
        console.error("Error fetching current user:", err);
        setError(err.message || "Failed to get current user information.");
      }
      // Loading state handled by fetchUsers now
    };
    fetchDeptManager();
  }, []);

  // --- Fetch Team Members and Available Users ---
  // (This useCallback remains largely the same)
  const fetchUsers = useCallback(async () => {
    if (!currentUser?.department) {
        setIsLoadingUsers(false);
        return;
    }
    setIsLoadingUsers(true);
    // Don't clear main error here, let task fetching handle its errors
    // setError(null);

    try {
        const teamResponse = await fetch(`/api/users?department=${currentUser.department}&role=USER`);
        if (!teamResponse.ok) throw new Error(`Failed to fetch team members: ${teamResponse.statusText}`);
        const teamData: FrontendUser[] = await teamResponse.json();
        setTeamMembers(teamData);

        const availableResponse = await fetch(`/api/users?role=USER`);
        if (!availableResponse.ok) throw new Error(`Failed to fetch available users: ${availableResponse.statusText}`);
        const allUserData: FrontendUser[] = await availableResponse.json();
        const currentTeamMemberIds = new Set(teamData.map(member => member.id));
        const availableData = allUserData.filter(user => !currentTeamMemberIds.has(user.id));
        setAvailableUsers(availableData);

    } catch (err: any) {
        console.error("Error fetching team/available users:", err);
        if (!error) { // Only set error if no other error exists
            setError(err.message || "Failed to fetch user lists.");
        }
    } finally {
        setIsLoadingUsers(false);
    }
  }, [currentUser, error]); // Keep dependencies

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


   // --- Fetch Tasks (Assigned to Manager) ---
   // Renamed fetchAllTasks to fetchManagerTasks for clarity
   const fetchManagerTasks = useCallback(async () => {
    if (!currentUser?.id) {
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
      const response = await fetch(`/api/tasks?assignedToId=${currentUser.id}`, { cache: 'no-store' });
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

    } catch (e) {
      console.error("Failed to fetch tasks:", e);
      if (e instanceof Error) {
          setError(`فشل في جلب المهام: ${e.message}`);
      } else {
           setError("فشل في جلب المهام بسبب خطأ غير معروف.");
      }
    } finally {
      setIsLoadingTasks(false);
    }
  // Depend on currentUser.id, isLoadingUsers, and error state
  }, [currentUser, isLoadingUsers, error]); // Added error dependency

  useEffect(() => {
    fetchManagerTasks();
  }, [fetchManagerTasks]); // Run when fetchManagerTasks changes


  // --- Add User to Team ---
  // (This function remains the same)
  const handleAddUserToTeam = async (userId: string) => {
    if (!currentUser?.department) {
      setError("لا يمكن إضافة المستخدم: لم يتم تحديد قسم المدير.");
      return;
    }
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department: currentUser.department }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add user to team: ${response.statusText}`);
      }
      fetchUsers();
      setIsAddUserModalOpen(false);
    } catch (err: any) {
      console.error("Error adding user to team:", err);
      setError(err.message || "حدث خطأ أثناء إضافة المستخدم للفريق.");
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


    } catch (err: any) {
      console.error("Error assigning control:", err);
      setError(err.message || "حدث خطأ أثناء تعيين الضابط.");
      setAssignmentStatus(prev => ({ ...prev, [assignmentId]: 'error' }));
    }
  };


  // Helper function to format date
  // (This function remains the same)
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch (e) { return 'تاريخ غير صالح'; }
  };

  // Function to open the details modal (now shows Task details with assignments)
  const handleOpenDetailsModal = (task: FrontendTask) => {
    setSelectedTaskForDetailsModal(task);
    setIsDetailsModalOpen(true);
  };

  // Removed handleOpenAssignTaskModal


  // --- Render Logic ---
  // Removed duplicate function declarations from here
  const renderUserList = (users: FrontendUser[], actionButton?: (user: FrontendUser) => React.ReactNode) => {
    if (isLoadingUsers) return <p>جاري تحميل المستخدمين...</p>;
    if (!users || users.length === 0) return <p>لا يوجد مستخدمون لعرضهم.</p>;

    return users.map((user) => (
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


  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="w-full bg-slate-900 text-white py-3 px-6 sticky top-0 z-10">
        {/* ... (header content remains the same) ... */}
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
              لوحة مدير القسم {currentUser?.department ? `- ${currentUser.department}` : ''}
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
                 <div className="text-3xl font-bold">8</div> {/* Placeholder */}
                 <ClipboardList className="h-6 w-6 text-nca-teal" />
               </div>
               <div className="text-sm text-gray-600 mt-2">التقييمات النشطة</div>
             </Card>

             <Card className="p-6">
               <div className="flex justify-between items-center">
                 <div className="text-3xl font-bold">68%</div> {/* Placeholder */}
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
                 <div className="text-3xl font-bold">7</div> {/* Placeholder */}
                 <AlertTriangle className="h-6 w-6 text-yellow-500" />
               </div>
               <div className="text-sm text-gray-600 mt-2">مهام معلقة</div>
             </Card>
            {/* ... other cards ... */}
          </div>

          {/* Tasks Assigned TO MANAGER Section */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">المهام المعينة لك ({currentUser?.nameAr || currentUser?.name})</h2>
              {/* ... (filter/export buttons) ... */}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-right border-b border-gray-200">
                    <th className="pb-3 font-medium text-gray-700 pr-4">النظام</th>
                    <th className="pb-3 font-medium text-gray-700">الضوابط</th>
                    <th className="pb-3 font-medium text-gray-700">الموعد النهائي</th>
                    <th className="pb-3 font-medium text-gray-700">الحالة</th>
                    <th className="pb-3 font-medium text-gray-700">التقدم</th>
                    <th className="pb-3 font-medium text-gray-700 pl-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingTasks ? (
                    <tr><td colSpan={6} className="text-center py-4">جاري تحميل المهام...</td></tr>
                  ) : managerTasks.length === 0 ? ( // Use managerTasks
                    <tr><td colSpan={6} className="text-center py-4">لا توجد مهام معينة لك.</td></tr>
                  ) : (
                    managerTasks.map((task: FrontendTask) => ( // Use managerTasks and add type
                     <React.Fragment key={task.id}>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 pr-4">{task.sensitiveSystem?.systemName || 'غير محدد'}</td>
                        {/* Display count of controls instead of list */}
                        <td className="py-4">
                          {task.controlAssignments?.length ?? 0} ضوابط
                        </td>
                        <td className="py-4">{formatDate(task.deadline)}</td>
                        <td className="py-4">
                          {/* Use Badge component for status */}
                          <Badge variant={task.status === 'COMPLETED' ? 'default' : task.status === 'PENDING' ? 'default' : 'secondary'} className={
                            task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            task.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            task.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700' // Fallback style
                          }>
                            {task.status} {/* TODO: Map status keys to Arabic */}
                          </Badge>
                        </td>
                        <td className="py-4">
                          {/* Progress calculation might need adjustment based on controlAssignments */}
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                              {/* Placeholder progress */}
                              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `0%` }}></div>
                            </div>
                            <span className="text-sm">0%</span> {/* Placeholder */}
                          </div>
                        </td>
                        {/* Actions Column */}
                        <td className="py-4 pl-4 space-x-2">
                           {/* Expand/Collapse Button */}
                           <Button variant="ghost" size="icon" onClick={() => toggleTaskExpansion(task.id)} className="text-slate-600 hover:text-slate-900">
                             {expandedTasks.has(task.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                           </Button>
                           {/* Details Button (Optional - can be removed if details are shown inline) */}
                           {/* <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900" onClick={() => handleOpenDetailsModal(task)}>
                             عرض التفاصيل
                           </Button> */}
                         </td>
                       </tr>
                       {/* Expanded Row for Control Assignments */}
                       {expandedTasks.has(task.id) && (
                         <tr className="bg-gray-50 border-b border-gray-200">
                           <td colSpan={6} className="p-4">
                             <h4 className="font-semibold mb-2 text-sm">تعيين الضوابط:</h4>
                             <div className="space-y-3">
                               {task.controlAssignments.length > 0 ? (
                                 task.controlAssignments.map((assignment: FrontendControlAssignment) => ( // Add type
                                   <div key={assignment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-md bg-white">
                                     <div className="flex-1 mb-2 sm:mb-0 sm:mr-4">
                                       <p className="font-medium text-sm" title={assignment.control.controlText}>
                                         {assignment.control.controlNumber} - {assignment.control.controlText}
                                       </p>
                                       {/* Map Badge variants */}
                                       <Badge variant={assignment.status === 'COMPLETED' ? 'default' : assignment.status === 'PENDING' ? 'default' : 'secondary'} className={`mt-1 ${
                                           assignment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                           assignment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                           assignment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                           assignment.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                                           'bg-gray-100 text-gray-700' // Fallback style
                                       }`}>
                                         {assignment.status} {/* TODO: Translate status */}
                                       </Badge>
                                     </div>
                                     {/* Restore the Select component */}
                                     <div className="w-full sm:w-auto flex items-center space-x-2 space-x-reverse">
                                       <Select // This is the assignment dropdown
                                        // Removed key prop - rely on state update from fetchManagerTasks
                                        dir="rtl"
                                        value={assignment.assignedUserId ?? "UNASSIGNED"} // Use "UNASSIGNED" for null/undefined
                                        onValueChange={(value) => handleAssignControl(assignment.id, value === "UNASSIGNED" ? null : value)} // Check for "UNASSIGNED"
                                        disabled={assignmentStatus[assignment.id] === 'loading'}
                                      >
                                        <SelectTrigger className="w-full sm:w-[200px] text-right">
                                          <SelectValue placeholder="اختر مستخدم..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="UNASSIGNED">-- غير معين --</SelectItem> {/* Use "UNASSIGNED" value */}
                                          {teamMembers.map((user: FrontendUser) => ( // Add type
                                            <SelectItem key={user.id} value={user.id}>
                                              {user.nameAr || user.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      {/* Status indicators */}
                                      {assignmentStatus[assignment.id] === 'loading' && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
                                      {assignmentStatus[assignment.id] === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                      {assignmentStatus[assignment.id] === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500">لا توجد ضوابط محددة لهذه المهمة.</p>
                              )}
                            </div>
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


          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
                  <DialogContent className="text-right sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>إضافة عضو جديد للفريق</DialogTitle>
                      <DialogDescription>
                        اختر مستخدمًا من القائمة لإضافته إلى قسمك. سيتمكن المستخدمون المضافون من استلام المهام.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 max-h-[60vh] overflow-y-auto">
                      {renderUserList(availableUsers, (user) => (
                        <Button
                          size="sm"
                          onClick={() => handleAddUserToTeam(user.id)}
                          className="bg-nca-teal hover:bg-nca-teal-dark text-white"
                        >
                          إضافة للفريق
                        </Button>
                      ))}
                      {/* Handle case where no users are available */}
                      {!isLoadingUsers && availableUsers.length === 0 && (
                        <p className="text-center text-gray-500 py-4">لا يوجد مستخدمون متاحون للإضافة حاليًا.</p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddUserModalOpen(false)}>إلغاء</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 max-h-[400px] overflow-y-auto">
                 {/* Render Team Members */}
                 {renderUserList(teamMembers, (user) => (
                   <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                     عرض التفاصيل {/* Placeholder for future action */}
                   </Button>
                 ))}
                 {/* Handle loading and empty states */}
                 {isLoadingUsers && <p>جاري تحميل أعضاء الفريق...</p>}
                 {!isLoadingUsers && teamMembers.length === 0 && (
                   <p className="text-center text-gray-500 py-4">لا يوجد أعضاء في هذا الفريق بعد.</p>
                 )}
              </CardContent>
              {/* Optional Footer for "View All" if list is truncated */}
              {/* <CardFooter>
                <Button variant="outline" className="w-full text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                  عرض جميع أعضاء الفريق
                </Button>
              </CardFooter> */}
            </Card>


            {/* Team Tasks Card - Updated to show assigned controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">مهام أعضاء الفريق</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 max-h-[400px] overflow-y-auto">
                {isLoadingTasks || isLoadingUsers ? (
                  <p>جاري تحميل المهام والمستخدمين...</p>
                ) : (() => {
                    // Prepare data: Map assignments to include their parent task details
                    const teamAssignments = managerTasks.flatMap((task: FrontendTask) =>
                      task.controlAssignments
                        .filter((assignment: FrontendControlAssignment) => assignment.assignedUserId && assignment.assignedUserId !== currentUser?.id)
                        .map((assignment: FrontendControlAssignment) => ({ ...assignment, taskDeadline: task.deadline, taskSystemName: task.sensitiveSystem?.systemName })) // Include parent task info
                    );

                    if (teamAssignments.length === 0) {
                      return <p className="text-center text-gray-500 py-4">لا توجد ضوابط معينة لأعضاء الفريق حاليًا.</p>;
                    }

                    // Use the properties added to the assignment object
                    return teamAssignments.map(assignment => (
                      <div key={assignment.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          {/* Use assignment.taskSystemName */}
                          <span className="text-sm font-medium truncate" title={`${assignment.taskSystemName} - ${assignment.control.controlNumber}`}>
                            {assignment.taskSystemName} - {assignment.control.controlNumber}
                          </span>
                          {/* Map Badge variants correctly */}
                          <Badge variant={assignment.status === 'COMPLETED' ? 'default' : assignment.status === 'PENDING' ? 'default' : 'secondary'} className={`text-xs ${
                              assignment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              assignment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                              assignment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                              assignment.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700' // Fallback style
                          }`}>
                            {assignment.status} {/* TODO: Translate */}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 truncate" title={assignment.control.controlText}>
                          {assignment.control.controlText}
                        </p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>المسؤول: {assignment.assignedUser?.nameAr || assignment.assignedUser?.name || 'غير معروف'}</span>
                          {/* Use assignment.taskDeadline */}
                          <span>الاستحقاق: {formatDate(assignment.taskDeadline)}</span>
                        </div>
                      </div>
                    ));
                  })()}
              </CardContent>
            </Card>
          </div> {/* Close the two-column grid div */}

          {/* Compliance Status Card */}
          {/* ... */}
           <Card className="p-6 mt-6">
             <h2 className="text-xl font-semibold mb-4">حالة الامتثال للقسم</h2>
             {/* ... compliance content ... */}
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

      {/* Task Details Modal (remains the same) */}
      {/* ... */}
       {/* Task Details Modal - Updated to show Control Assignments */}
       <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
         <DialogContent className="text-right sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
           <DialogHeader className="text-right">
             <DialogTitle>تفاصيل المهمة والضوابط</DialogTitle>
             <DialogDescription>
               النظام: {selectedTaskForDetailsModal?.sensitiveSystem?.systemName ?? 'غير محدد'} {/* Use nullish coalescing */}
               <br />
               الموعد النهائي: {formatDate(selectedTaskForDetailsModal?.deadline)}
             </DialogDescription>
           </DialogHeader>
           <div className="grid gap-4 py-4 text-right">
             <h4 className="font-semibold">الضوابط المعينة:</h4>
             {/* Add null check for selectedTaskForDetailsModal */}
             {selectedTaskForDetailsModal?.controlAssignments && selectedTaskForDetailsModal.controlAssignments.length > 0 ? (
               selectedTaskForDetailsModal.controlAssignments.map((assignment: FrontendControlAssignment) => ( // Add type
                 <div key={assignment.id} className="border rounded-md p-3 space-y-1 text-right">
                   <p><span className="font-semibold">الضابط:</span> {assignment.control.controlNumber} - {assignment.control.controlText}</p>
                   <p><span className="font-semibold">الحالة:</span> {assignment.status}</p> {/* TODO: Translate */}
                   <p><span className="font-semibold">المستخدم المسؤول:</span> {assignment.assignedUser?.nameAr || assignment.assignedUser?.name || 'غير معين'}</p>
                 </div>
               ))
             ) : (
               <p>لا توجد ضوابط مرتبطة بهذه المهمة.</p>
             )}
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>إغلاق</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>

       {/* Removed the old Assign Task Modal */}

    </div>
  )
}
