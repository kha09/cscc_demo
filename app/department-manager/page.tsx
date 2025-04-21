"use client"

import { useState, useEffect, useCallback } from "react" // Added useCallback
import Image from "next/image"
import type { User as PrismaUser, Task as PrismaTask, Control as PrismaControl, SensitiveSystemInfo as PrismaSensitiveSystemInfo, Department as PrismaDepartment } from "@prisma/client"; // Use type imports, added Department
// No longer need Zod here
import {
  Bell,
  PlusCircle, // Added for Add button
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
  UserPlus // Added for Add User icon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card" // Added more Card components
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"; // Import Dialog components, added DialogTrigger
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components for assigning tasks

// Define User type for frontend use - Use 'department' (string) instead of 'departmentId'
interface FrontendUser extends Pick<PrismaUser, 'id' | 'name' | 'nameAr' | 'email' | 'role' | 'department'> {
  // Add any other fields needed for display
}

// Define a more specific Task type for the frontend, including nested data
// This uses Prisma's generated types for better type safety
interface FrontendTask extends Omit<PrismaTask, 'deadline' | 'createdAt' | 'updatedAt' | 'sensitiveSystem' | 'controls' | 'assignedTo'> {
  deadline: string; // Keep as string if API returns it this way
  createdAt: string; // Keep as string
  sensitiveSystem: Pick<PrismaSensitiveSystemInfo, 'systemName'> | null;
  controls: PrismaControl[];
  assignedTo?: Pick<PrismaUser, 'id' | 'name' | 'nameAr'> | null; // Include assignedTo details
  progress?: number | null; // Added missing progress field
}


export default function DepartmentManagerDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<FrontendTask[]>([]); // Tasks assigned TO the manager
  const [teamTasks, setTeamTasks] = useState<FrontendTask[]>([]); // Tasks assigned to team members
  const [teamMembers, setTeamMembers] = useState<FrontendUser[]>([]); // Users in the manager's department
  const [availableUsers, setAvailableUsers] = useState<FrontendUser[]>([]); // Users with role USER not in this dept
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FrontendUser | null>(null); // Store full user object

  // State for modals
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<FrontendTask | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [selectedTaskToAssign, setSelectedTaskToAssign] = useState<FrontendTask | null>(null);
  const [selectedUserToAssign, setSelectedUserToAssign] = useState<string>(""); // Store user ID


  // --- Fetch Current User (Department Manager) ---
  // TODO: Replace placeholder fetch with actual auth context logic
  useEffect(() => {
    const fetchDeptManager = async () => {
      setIsLoadingUsers(true); // Start loading user data
      setError(null);
      try {
        // **PLACEHOLDER LOGIC - REPLACE WITH AUTH**
        // Fetch all users and find the first DEPARTMENT_MANAGER
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`);
        const users: PrismaUser[] = await response.json();
        const deptManager = users.find(user => user.role === 'DEPARTMENT_MANAGER');
        // **END PLACEHOLDER**

        if (deptManager) {
          // Correctly map PrismaUser to FrontendUser
          setCurrentUser({
            id: deptManager.id,
            name: deptManager.name,
            nameAr: deptManager.nameAr,
            email: deptManager.email,
            role: deptManager.role,
            department: deptManager.department // Use department (string | null)
          });
        } else {
          setError("Logged-in user is not a Department Manager or user not found.");
        }
      } catch (err: any) {
        console.error("Error fetching current user:", err);
        setError(err.message || "Failed to get current user information.");
      } finally {
         // We set loading false after fetching team/available users
      }
    };
    fetchDeptManager();
  }, []); // Run once on mount

  // --- Fetch Team Members and Available Users ---
  const fetchUsers = useCallback(async () => {
    // Use currentUser.department (string) for fetching
    if (!currentUser?.department) {
        // Don't fetch if we don't have the manager or their department name yet
        // If there was an error fetching the manager, the error state is already set.
        setIsLoadingUsers(false); // Stop user loading if we can't proceed
        return;
    }

    setIsLoadingUsers(true);
    setError(null); // Clear previous errors specific to user fetching

    try {
        // Fetch Team Members (Users in the same department) - Use 'department' query param
        const teamResponse = await fetch(`/api/users?department=${currentUser.department}&role=USER`);
        if (!teamResponse.ok) throw new Error(`Failed to fetch team members: ${teamResponse.statusText}`);
        const teamData: FrontendUser[] = await teamResponse.json();
        setTeamMembers(teamData);

        // Fetch Available Users (ALL users with role USER)
        const availableResponse = await fetch(`/api/users?role=USER`); // Removed unassigned=true
        if (!availableResponse.ok) throw new Error(`Failed to fetch available users: ${availableResponse.statusText}`);
        const allUserData: FrontendUser[] = await availableResponse.json();
        // Filter out users already in the current team from the "available" list shown in the modal
        const currentTeamMemberIds = new Set(teamData.map(member => member.id));
        const availableData = allUserData.filter(user => !currentTeamMemberIds.has(user.id));
        setAvailableUsers(availableData);

    } catch (err: any) {
        console.error("Error fetching team/available users:", err);
        // Keep existing error if it was from fetching the manager, otherwise set new error
        if (!error) {
            setError(err.message || "Failed to fetch user lists.");
        }
    } finally {
        setIsLoadingUsers(false); // Finish loading user data
    }
  }, [currentUser, error]); // Depend on currentUser and the error state

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Run fetchUsers when it changes (i.e., when currentUser is set)


   // --- Fetch Tasks (Assigned to Manager and Team) ---
   useEffect(() => {
    const fetchAllTasks = async () => {
      // Only fetch if currentUser and department are available
      if (!currentUser?.id || !currentUser.department) {
        if (!isLoadingUsers && !error) { // Only set loading false if user loading finished without errors
             setIsLoadingTasks(false);
        }
        return;
      }

      setIsLoadingTasks(true);
      // Don't reset the main error state here, as user fetching might have failed
      // setError(null); // Let's manage task-specific errors separately if needed

      try {
        // 1. Fetch tasks assigned directly TO the current manager
        const managerTasksResponse = await fetch(`/api/tasks?assignedToId=${currentUser.id}`);
        if (!managerTasksResponse.ok) {
          throw new Error(`Failed to fetch manager tasks: ${managerTasksResponse.statusText}`);
        }
        const managerTasksData: FrontendTask[] = await managerTasksResponse.json();
        setTasks(managerTasksData); // Tasks for the manager themselves

        // 2. Fetch tasks assigned to ANYONE in the manager's department
        //    (This might include the manager again, filter if needed, or adjust API)
        //    Requires an API endpoint like /api/tasks?department=... (or adjust API if it expects ID)
        //    Assuming /api/tasks needs adjustment to accept department name string
        const teamTasksResponse = await fetch(`/api/tasks?department=${currentUser.department}`); // Use department string
         if (!teamTasksResponse.ok) {
           throw new Error(`Failed to fetch team tasks: ${teamTasksResponse.statusText}`);
         }
         const teamTasksData: FrontendTask[] = await teamTasksResponse.json();
         // Filter out tasks assigned to the manager if you only want team member tasks
         setTeamTasks(teamTasksData.filter(task => task.assignedTo?.id !== currentUser.id));


      } catch (e) {
        console.error("Failed to fetch tasks:", e);
        // Set error only if there wasn't a more critical user fetch error
        if (!error && e instanceof Error) {
            setError(`فشل في جلب المهام: ${e.message}`);
        } else if (!error) {
             setError("فشل في جلب المهام بسبب خطأ غير معروف.");
        }
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchAllTasks();
  // Depend on currentUser.id, currentUser.department, isLoadingUsers, and error state
  }, [currentUser, isLoadingUsers, error]);


  // --- Add User to Team ---
  const handleAddUserToTeam = async (userId: string) => {
    // Use currentUser.department (string)
    if (!currentUser?.department) {
      setError("لا يمكن إضافة المستخدم: لم يتم تحديد قسم المدير.");
      return;
    }

    try {
      // Send 'department' (string) in the body
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department: currentUser.department }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add user to team: ${response.statusText}`);
      }

      // Refresh user lists after successful addition
      fetchUsers(); // Re-run the user fetching logic
      setIsAddUserModalOpen(false); // Close modal on success

    } catch (err: any) {
      console.error("Error adding user to team:", err);
      setError(err.message || "حدث خطأ أثناء إضافة المستخدم للفريق.");
      // Optionally keep the modal open on error: // setIsAddUserModalOpen(false);
    }
  };

  // --- Assign Task to User ---
  const handleAssignTask = async () => {
    if (!selectedTaskToAssign || !selectedUserToAssign) {
        setError("الرجاء تحديد مهمة ومستخدم لتعيينها.");
        return;
    }

    try {
        const response = await fetch(`/api/tasks/${selectedTaskToAssign.id}`, { // Assuming PATCH /api/tasks/:taskId
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assignedToId: selectedUserToAssign }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to assign task: ${response.statusText}`);
        }

        // Refresh tasks (both manager's and team's)
        // Consider a more targeted refresh if possible
         const managerTasksResponse = await fetch(`/api/tasks?assignedToId=${currentUser?.id}`);
         const managerTasksData: FrontendTask[] = await managerTasksResponse.json();
         setTasks(managerTasksData);

         // Assuming /api/tasks is updated to accept department name string
         const teamTasksResponse = await fetch(`/api/tasks?department=${currentUser?.department}`);
         const teamTasksData: FrontendTask[] = await teamTasksResponse.json();
         setTeamTasks(teamTasksData.filter(task => task.assignedTo?.id !== currentUser?.id));


        setIsAssignTaskModalOpen(false); // Close modal
        setSelectedTaskToAssign(null);
        setSelectedUserToAssign("");

    } catch (err: any) {
        console.error("Error assigning task:", err);
        setError(err.message || "حدث خطأ أثناء تعيين المهمة.");
    }
};


  // Helper function to format date
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch (e) { return 'تاريخ غير صالح'; }
  };

  // Function to open the details modal
  const handleOpenDetailsModal = (task: FrontendTask) => {
    setSelectedTaskForModal(task);
    setIsDetailsModalOpen(true);
  };

  // Function to open assign task modal
  const handleOpenAssignTaskModal = (task: FrontendTask) => {
    setSelectedTaskToAssign(task);
    setSelectedUserToAssign(task.assignedTo?.id || ""); // Pre-select current assignee if any
    setIsAssignTaskModalOpen(true);
  };


  // --- Render Logic ---
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
                  ) : tasks.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4">لا توجد مهام معينة لك.</td></tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 pr-4">{task.sensitiveSystem?.systemName || 'غير محدد'}</td>
                        <td className="py-4 max-w-xs truncate" title={task.controls?.map(c => `${c.controlNumber}: ${c.controlText}`).join(', ') || ''}>
                          {task.controls?.map(c => c.controlNumber).join(', ') || 'لا توجد'}
                        </td>
                        <td className="py-4">{formatDate(task.deadline)}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            task.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            task.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'}`}>
                            {task.status} {/* TODO: Map status keys to Arabic */}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${task.progress || 0}%` }}></div>
                            </div>
                            <span className="text-sm">{task.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="py-4 pl-4">
                          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900" onClick={() => handleOpenDetailsModal(task)}>
                            عرض
                          </Button>
                          {/* Add Assign Button */}
                           <Button variant="ghost" size="sm" className="text-nca-teal hover:text-nca-teal-dark mr-2" onClick={() => handleOpenAssignTaskModal(task)}>
                             تعيين
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


            {/* Team Tasks Card */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">مهام الفريق</h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {isLoadingTasks ? (
                  <p>جاري تحميل مهام الفريق...</p>
                ) : teamTasks.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">لا توجد مهام معينة لأعضاء الفريق حاليًا.</p>
                ) : (
                  teamTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium max-w-[70%] truncate" title={task.sensitiveSystem?.systemName || 'مهمة عامة'}>
                           {task.sensitiveSystem?.systemName || 'مهمة عامة'} ({task.controls?.map(c => c.controlNumber).join(', ') || 'ضوابط غير محددة'})
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          task.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                          task.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'}`}>
                          {task.status} {/* TODO: Map status */}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        المسؤول: {task.assignedTo?.nameAr || task.assignedTo?.name || <span className="text-red-500">غير معين</span>}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">تاريخ الاستحقاق: {formatDate(task.deadline)}</span>
                        <div>
                          <Button variant="outline" size="sm" className="text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white ml-2" onClick={() => handleOpenDetailsModal(task)}>
                            تفاصيل
                          </Button>
                           <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white" onClick={() => handleOpenAssignTaskModal(task)}>
                             إعادة تعيين
                           </Button>
                        </div>
                      </div>
                       {/* Progress Bar */}
                       <div className="mt-2">
                         <div className="flex justify-between items-center mb-1">
                           <span className="text-xs text-gray-500">التقدم</span>
                           <span className="text-xs font-medium">{task.progress || 0}%</span>
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-1.5">
                           <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${task.progress || 0}%` }}></div>
                         </div>
                       </div>
                    </div>
                  ))
                )}
              </div>
              {/* Optional Footer */}
              {/* <Button variant="outline" className="w-full mt-4 text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                عرض جميع مهام الفريق
              </Button> */}
            </Card>
          </div>

          {/* Compliance Status (remains the same) */}
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
       <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
         <DialogContent className="text-right sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
           {/* Add text-right to header and content */}
           <DialogHeader className="text-right">
             <DialogTitle>تفاصيل ضوابط المهمة</DialogTitle>
             <DialogDescription>
               النظام: {selectedTaskForModal?.sensitiveSystem?.systemName || 'غير محدد'}
             </DialogDescription>
           </DialogHeader>
           <div className="grid gap-4 py-4 text-right">
             {selectedTaskForModal?.controls && selectedTaskForModal.controls.length > 0 ? (
               selectedTaskForModal.controls.map((control) => (
                 <div key={control.id} className="border rounded-md p-3 space-y-1 text-right">
                   <p><span className="font-semibold">رقم الضابط:</span> {control.controlNumber}</p>
                   <p><span className="font-semibold">نص الضابط:</span> {control.controlText}</p>
                   <p><span className="font-semibold">نوع الضابط:</span> {control.controlType}</p>
                   <p><span className="font-semibold">المكون الرئيسي:</span> {control.mainComponent}</p>
                   {control.subComponent && (
                     <p><span className="font-semibold">المكون الفرعي:</span> {control.subComponent}</p>
                   )}
                 </div>
               ))
             ) : (
               <p>لا توجد ضوابط مرتبطة بهذه المهمة.</p>
             )}
           </div>
           <DialogFooter>
             <Button onClick={() => setIsDetailsModalOpen(false)}>إغلاق</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>

       {/* Assign Task Modal */}
       <Dialog open={isAssignTaskModalOpen} onOpenChange={setIsAssignTaskModalOpen}>
         <DialogContent className="text-right sm:max-w-[450px]">
           <DialogHeader>
             <DialogTitle>تعيين مهمة لمستخدم</DialogTitle>
             <DialogDescription>
               اختر مستخدمًا من فريقك لتعيين هذه المهمة إليه.
               <br />
               <span className="font-semibold">المهمة:</span> {selectedTaskToAssign?.sensitiveSystem?.systemName || 'مهمة عامة'} ({selectedTaskToAssign?.controls?.map(c => c.controlNumber).join(', ')})
             </DialogDescription>
           </DialogHeader>
           <div className="py-4">
             <Select dir="rtl" value={selectedUserToAssign} onValueChange={setSelectedUserToAssign}>
               <SelectTrigger>
                 <SelectValue placeholder="اختر مستخدم..." />
               </SelectTrigger>
               <SelectContent>
                 {teamMembers.length > 0 ? (
                   teamMembers.map((user) => (
                     <SelectItem key={user.id} value={user.id}>
                       {user.nameAr || user.name} ({user.email})
                     </SelectItem>
                   ))
                 ) : (
                   <SelectItem value="-" disabled>لا يوجد أعضاء فريق متاحون</SelectItem>
                 )}
               </SelectContent>
             </Select>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsAssignTaskModalOpen(false)}>إلغاء</Button>
             <Button
                onClick={handleAssignTask}
                disabled={!selectedUserToAssign || isLoadingTasks} // Disable if no user selected or tasks are loading
                className="bg-nca-teal hover:bg-nca-teal-dark text-white"
             >
                {isLoadingTasks ? 'جاري التعيين...' : 'تعيين المهمة'}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>

    </div>
  )
}
