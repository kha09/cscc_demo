"use client"

"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from 'next/navigation'; // Import useRouter
import { useAuth } from "@/lib/auth-context"; // Import useAuth
// Explicitly import types from the generated client
import type { Assessment, User, SensitiveSystemInfo, Control } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Bell,
  User as UserIcon, // Aliased the User icon
  LogOut, // Import LogOut icon
  // ClipboardList, // Removed unused import
  BarChart,
  FileText,
  AlertTriangle,
  Search,
  // Plus, // Removed unused import
  Filter,
  Download,
  // Calendar, // Original Calendar icon, now aliased below
  ChevronDown,
  Menu, // Added for sidebar toggle
  // Activity, // Removed unused import
  Server, // Added for sidebar icon
  // ListChecks, // Removed unused import
  ShieldCheck, // Added for sidebar icon
  // FileWarning, // Removed unused import
  LayoutDashboard,
  // Building, // Removed unused import
  // Check, // Removed unused import
  X // Added for badge removal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Added Select components
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover" // Added Popover
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command" // Added Command components
import { Checkbox } from "@/components/ui/checkbox" // Added Checkbox
import { Badge } from "@/components/ui/badge" // Added Badge
import { Calendar as CalendarIcon } from "lucide-react" // Renamed original Calendar icon import
import { Calendar } from "@/components/ui/calendar" // Added Calendar component
import { cn } from "@/lib/utils" // Added cn utility
import { format } from "date-fns" // Added date-fns format
// Import the form component
import { Label } from "@/components/ui/label"; // Added Label
import SensitiveSystemForm from "@/components/sensitive-system-form";

// Define the type for the fetched sensitive system data (id and name)
type SimpleSensitiveSystemInfo = Pick<SensitiveSystemInfo, 'id' | 'systemName'>;

// Define type for Assessment including the new name field
type AssessmentWithName = Assessment & { assessmentName?: string | null }; // Make optional for initial state

// Define type for fetched control data (id, number, text)
type SimpleControl = Pick<Control, 'id' | 'controlNumber' | 'controlText'>;

// Define type for Department Manager user data
type DepartmentManager = Pick<User, 'id' | 'name' | 'nameAr'>; // Add other fields if needed

// Type for task assignment feedback
type TaskAssignmentMessage = {
  type: 'success' | 'error';
  text: string;
} | null;

export default function SecurityManagerDashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [sensitiveSystems, setSensitiveSystems] = useState<SimpleSensitiveSystemInfo[]>([]); // State for sensitive systems
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(true);
  const [isLoadingSystems, setIsLoadingSystems] = useState(true); // Loading state for systems
  const [userId, setUserId] = useState<string | null>(null);
  const [assessmentsError, setAssessmentsError] = useState<string | null>(null); // Specific error for assessments
  const [systemsError, setSystemsError] = useState<string | null>(null); // Specific error for systems
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [currentAssessmentName, setCurrentAssessmentName] = useState<string>(""); // State for the new input
  const [assessmentNameError, setAssessmentNameError] = useState<string | null>(null); // Error state for name update

  // State variables for controls
  const [controls, setControls] = useState<SimpleControl[]>([]);
  const [isLoadingControls, setIsLoadingControls] = useState(true);
  const [controlsError, setControlsError] = useState<string | null>(null);
  const [selectedControls, setSelectedControls] = useState<SimpleControl[]>([]); // State for selected controls
  const [isControlPopoverOpen, setIsControlPopoverOpen] = useState(false); // State for popover visibility
  const controlInputRef = useRef<HTMLInputElement>(null); // Ref for command input

  // State variables for departments (Removed unused state)
  // const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  // const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  // const [departmentsError, setDepartmentsError] = useState<string | null>(null);

  // State for Department Managers
  const [departmentManagers, setDepartmentManagers] = useState<DepartmentManager[]>([]);
  const [isLoadingDeptManagers, setIsLoadingDeptManagers] = useState(true);
  const [deptManagersError, setDeptManagersError] = useState<string | null>(null);


  // State for the deadline date picker
  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(undefined);

  // State for Task Assignment Form
  const [selectedSystemId, setSelectedSystemId] = useState<string | undefined>(undefined);
  // const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>(undefined); // Remove old state
  const [selectedDepartmentManagerId, setSelectedDepartmentManagerId] = useState<string | undefined>(undefined); // Add new state
  const [isAssigningTask, setIsAssigningTask] = useState(false);
  const [taskAssignmentMessage, setTaskAssignmentMessage] = useState<TaskAssignmentMessage>(null);

  // Auth and Routing
  const { logout } = useAuth();
  const router = useRouter();

  // Handle Logout
  const handleLogout = () => {
    logout();
    router.push('/signin'); // Redirect to signin page after logout
  };

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
          setAssessmentsError("No Security Manager user found."); // Set specific error
          setSystemsError("No Security Manager user found."); // Set specific error
          setIsLoadingAssessments(false);
          setIsLoadingSystems(false);
        }
      } catch (err: unknown) {
        console.error("Error fetching user ID:", err);
        const errorMsg = err instanceof Error ? err.message : "Failed to get user ID";
        setAssessmentsError(errorMsg); // Set specific error
        setSystemsError(errorMsg); // Set specific error
        setIsLoadingAssessments(false);
        setIsLoadingSystems(false);
      }
    };
    fetchUserId();
  }, []);
  // --- End Temporary User ID Fetch ---

  // Fetch assessments, systems, controls, managers when userId is available
  useEffect(() => {
    if (!userId) return;

    // Fetch Assessments
    const fetchAssessments = async () => {
      setIsLoadingAssessments(true);
      setAssessmentsError(null);
      try {
        const response = await fetch(`/api/users/${userId}/assessments`);
        if (!response.ok) {
          throw new Error(`Failed to fetch assessments: ${response.statusText}`);
        }
        const data: AssessmentWithName[] = await response.json(); // Use updated type
        setAssessments(data);
      } catch (err: unknown) {
        console.error("Error fetching assessments:", err);
        setAssessmentsError(err instanceof Error ? err.message : "An unknown error occurred fetching assessments");
      } finally {
        setIsLoadingAssessments(false);
      }
    };

    // Fetch Sensitive Systems
    const fetchSensitiveSystems = async () => {
      setIsLoadingSystems(true);
      setSystemsError(null);
      try {
        const response = await fetch(`/api/users/${userId}/sensitive-systems`);
        if (!response.ok) {
          throw new Error(`Failed to fetch sensitive systems: ${response.statusText}`);
        }
        // Assuming the API returns the full SensitiveSystemInfo, but we only need id and name
        const data: SensitiveSystemInfo[] = await response.json();
        // Map to the simpler type
        setSensitiveSystems(data.map(system => ({ id: system.id, systemName: system.systemName })));
      } catch (err: unknown) {
        console.error("Error fetching sensitive systems:", err);
        setSystemsError(err instanceof Error ? err.message : "An unknown error occurred fetching systems");
      } finally {
        setIsLoadingSystems(false);
      }
    };

    fetchAssessments();
    fetchSensitiveSystems();
  }, [userId]);

  // Fetch Controls, Dept Managers on component mount
  useEffect(() => {
    const fetchControls = async () => {
      setIsLoadingControls(true);
      setControlsError(null);
      try {
        const response = await fetch('/api/controls');
        if (!response.ok) {
          throw new Error(`Failed to fetch controls: ${response.statusText}`);
        }
        const data: SimpleControl[] = await response.json();
        setControls(data);
      } catch (err: unknown) {
        console.error("Error fetching controls:", err);
        setControlsError(err instanceof Error ? err.message : "An unknown error occurred fetching controls");
      } finally {
        setIsLoadingControls(false);
      }
    };

    // Fetch Department Managers function
    const fetchDepartmentManagers = async () => {
      setIsLoadingDeptManagers(true);
      setDeptManagersError(null);
      try {
        // Assuming a general /api/users endpoint can filter by role, or create a specific one
        // For now, let's assume /api/users returns all and we filter client-side
        // TODO: Ideally, create a dedicated API endpoint like /api/users/department-managers
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }
        const allUsers: User[] = await response.json();
        const managers = allUsers
          .filter(user => user.role === 'DEPARTMENT_MANAGER')
          .map(user => ({ id: user.id, name: user.name, nameAr: user.nameAr })); // Map to simpler type
        setDepartmentManagers(managers);
      } catch (err: unknown) {
        console.error("Error fetching department managers:", err);
        setDeptManagersError(err instanceof Error ? err.message : "An unknown error occurred fetching department managers");
      } finally {
        setIsLoadingDeptManagers(false);
      }
    };


    fetchControls();
    // fetchDepartments(); // Remove call to the deleted function
    fetchDepartmentManagers(); // Fetch department managers
  }, []); // Empty dependency array means run once on mount


  // Updated to fetch current assessment name when opening
  const handleOpenForm = async (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    setCurrentAssessmentName(""); // Reset name state
    setAssessmentNameError(null); // Reset error state
    setIsModalOpen(true);

    // Fetch the current assessment details to get the name
    try {
      const response = await fetch(`/api/assessments/${assessmentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch assessment details');
      }
      const assessmentData: AssessmentWithName = await response.json();
      setCurrentAssessmentName(assessmentData.assessmentName || ""); // Set current name or empty string
    } catch (error: unknown) {
      console.error("Error fetching assessment name:", error);
      // Optionally set an error state to display in the modal
      setAssessmentNameError(error instanceof Error ? error.message : "Failed to load current assessment name.");
    }
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
    } catch { // Removed unused variable _e
      return 'Invalid Date';
    }
  };

  // Handler for selecting/deselecting a control
  const handleControlSelect = (control: SimpleControl) => {
    setSelectedControls((prevSelected) => {
      const isSelected = prevSelected.some((c) => c.id === control.id);
      if (isSelected) {
        return prevSelected.filter((c) => c.id !== control.id);
      } else {
        return [...prevSelected, control];
      }
    });
    // Keep focus on input after selection
    controlInputRef.current?.focus();
  };

  // Handler for removing a selected control via the badge
  const handleControlRemove = (controlId: string) => {
    setSelectedControls((prevSelected) =>
      prevSelected.filter((c) => c.id !== controlId)
    );
  };

  // Handler for Assign Task button click
  const handleAssignTask = async () => {
    setTaskAssignmentMessage(null); // Clear previous messages

    // --- Input Validation ---
    if (!selectedSystemId) {
      setTaskAssignmentMessage({ type: 'error', text: 'الرجاء اختيار النظام.' });
      return;
    }
    if (selectedControls.length === 0) {
      setTaskAssignmentMessage({ type: 'error', text: 'الرجاء اختيار ضابط واحد على الأقل.' });
      return;
    }
    // if (!selectedDepartmentId) { // Remove old check
    //   setTaskAssignmentMessage({ type: 'error', text: 'الرجاء اختيار القسم.' });
    //   return;
    // }
    if (!selectedDepartmentManagerId) { // Add new check
      setTaskAssignmentMessage({ type: 'error', text: 'الرجاء اختيار مدير القسم.' });
      return;
    }
    if (!deadlineDate) {
      setTaskAssignmentMessage({ type: 'error', text: 'الرجاء اختيار الموعد النهائي.' });
      return;
    }
    if (!userId) {
      // This should ideally not happen if the page loads correctly, but good to check
      setTaskAssignmentMessage({ type: 'error', text: 'خطأ: لم يتم العثور على معرّف المستخدم.' });
      return;
    }
    // --- End Input Validation ---

    setIsAssigningTask(true);

    const taskData = {
      sensitiveSystemId: selectedSystemId,
      // departmentId: selectedDepartmentId, // Remove old field
      assignedToId: selectedDepartmentManagerId, // Add new field for the assigned manager
      controlIds: selectedControls.map(c => c.id),
      deadline: deadlineDate.toISOString(), // Send as ISO string
      assignedById: userId, // The Security Manager assigning the task
    };

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Task assignment error:", errorData);
        // Try to provide a more specific error message
        const message = errorData.message || (errorData.errors ? JSON.stringify(errorData.errors) : 'فشل تعيين المهمة.');
        throw new Error(message);
      }

      // Success
      setTaskAssignmentMessage({ type: 'success', text: 'تم تعيين المهمة بنجاح!' });
      // Optionally reset form fields
      setSelectedSystemId(undefined);
      // setSelectedDepartmentId(undefined); // Remove old reset
      setSelectedDepartmentManagerId(undefined); // Reset new field
      setSelectedControls([]);
      setDeadlineDate(undefined);

    } catch (error: unknown) {
      console.error("Error assigning task:", error);
      setTaskAssignmentMessage({ type: 'error', text: error instanceof Error ? error.message : 'حدث خطأ غير متوقع.' });
    } finally {
      setIsAssigningTask(false);
    }
  };


  return (
    // Removed ProtectedRoute for now as auth isn't fully implemented server-side
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="w-full bg-slate-900 text-white py-3 px-6 sticky top-0 z-10">
        {/* Using max-w-full for header content to span width */}
        <div className="flex items-center justify-between">
          {/* Logo and Title - Right Side */}
          <div className="flex items-center gap-2 font-bold text-sm md:text-base lg:text-lg">
            <div className="relative h-16 w-16"> {/* Adjusted size */}
              <Image
                src="/static/image/logo.png" width={160} height={160}
                alt="Logo"
                className="object-contain"
              />
            </div>
            {/* Optional: Add Title next to logo if needed */}
            {/* <span className="text-lg">منصة تقييم الأمن السيبراني</span> */}
          </div>

          {/* Center Spacer */}
          <div className="flex-grow"></div>

          {/* User Profile, Bell, Sidebar Toggle - Left Side */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
              <UserIcon className="h-5 w-5" />
            </Button>
            {/* Logout Button */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
            {/* Sidebar Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-slate-700 md:hidden" // Show only on smaller screens
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-row"> {/* Flex container for sidebar and main */}
        {/* Sidebar */}
        <aside className={`bg-slate-800 text-white p-4 sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto transition-all duration-300 ease-in-out hidden md:block ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
           {/* Toggle Button inside sidebar for larger screens */}
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
            {/* Links updated for Security Manager */}
            <Link href="/security-manager" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>لوحة المعلومات</span>
            </Link>
            {/* <Link href="/security-manager#assessments" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <ShieldCheck className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>التقييمات المعينة</span>
            </Link> */}
             <Link href="/security-manager/system-info" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}> {/* Updated href */}
              <Server className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>معلومات الأنظمة</span>
            </Link>
            {/* Link to Manage Departments */}
            {/* <Link href="/security-manager/departments" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <Building className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>إدارة الأقسام</span>
            </Link> */}
            {/* <Link href="/security-manager#tasks" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <ListChecks className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>المهام</span>
            </Link> */}
            {/* <Link href="/security-manager#risks" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <FileWarning className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>المخاطر</span>
            </Link> */}
            {/* <Link href="/security-manager#reports" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <FileText className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>التقارير</span>
            </Link> */}
            {/* Link to Results/Analytics Page */}
            <Link href="/security-manager/results" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <BarChart className="h-5 w-5 flex-shrink-0" /> {/* Using BarChart icon for analytics */}
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>النتائج</span>
            </Link>
            {/* Add more relevant links */}
          </nav>
        </aside>

        {/* Main Content Area */}
        {/* Adjusted margin-right based on sidebar state */}
        <main className={`flex-1 p-6 overflow-y-auto h-[calc(100vh-76px)] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:mr-0' : 'md:mr-20'}`}>
          {/* Removed max-w-7xl and mx-auto from here */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">لوحة مدير الأمن</h1> {/* Title */}
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
             {/*} <Button className="bg-nca-teal hover:bg-nca-teal-dark text-white gap-2">
                <Plus className="h-4 w-4" />
                تقييم جديد
              </Button> 8 */}
            </div>
          </div>

          {/* Stats Cards - Using CardHeader/Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">التقييمات النشطة والمنجزة </CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assessments.length}</div>
                {/* <p className="text-xs text-muted-foreground">+2 pending</p> */}
              </CardContent>
            </Card>

             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط نسبة الامتثال</CardTitle>
                 <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">76%</div> {/* Placeholder */}
                {/* <p className="text-xs text-muted-foreground">Up from 72%</p> */}
              </CardContent>
            </Card>

             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مخاطر متوسطة</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div> {/* Placeholder */}
                {/* <p className="text-xs text-muted-foreground">Requires attention</p> */}
              </CardContent>
            </Card>

             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مخاطر عالية</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div> {/* Placeholder */}
                {/* <p className="text-xs text-muted-foreground">Immediate action needed</p> */}
              </CardContent>
            </Card>
          </div>

          {/* Anchor for Assessments */}
          <div id="assessments"></div>

          {/* Active Assessments Section - Using CardHeader/Content */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-semibold"> التقييمات المعينة</CardTitle>
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
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
                  <tr className="text-right border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-700">اسم التقييم</th> {/* Added Assessment Name Header */}

                    <th className="pb-3 font-medium text-gray-700">حالة التقييم</th>
                    <th className="pb-3 font-medium text-gray-700">تاريخ الإنشاء</th>
                    {/* <th className="pb-3 font-medium text-gray-700">الموعد النهائي</th> */}
                    {/* <th className="pb-3 font-medium text-gray-700">التقدم</th> */}
                    <th className="pb-3 font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingAssessments ? ( // Corrected variable name
                    <tr>
                      <td colSpan={4} className="text-center py-4">جاري تحميل التقييمات...</td> {/* Adjusted colspan */}
                    </tr>
                  ) : assessmentsError ? ( // Corrected variable name
                     <tr>
                      <td colSpan={4} className="text-center py-4 text-red-600">{assessmentsError}</td> {/* Corrected variable name, Adjusted colspan */}
                    </tr>
                  ) : filteredAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4">لا توجد تقييمات معينة لك.</td> {/* Adjusted colspan */}
                    </tr>
                  ) : (
                    filteredAssessments.map((assessment) => (
                      <tr key={assessment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4">{(assessment as AssessmentWithName).assessmentName || '-'}</td> {/* Added Assessment Name Data */}

                        <td className="py-4">-</td> {/* Placeholder for Assessment Status */}
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
            </CardContent> {/* Add missing closing tag */}
          </Card>

          {/* Modal for Sensitive System Form */}
          {/* Modal for Sensitive System Form - Updated */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>معلومات اساسية عن الأنظمة الحساسة</DialogTitle>
              </DialogHeader>
              {selectedAssessmentId ? (
                <div className="space-y-4 py-4">
                  {/* Assessment Name Input */}
                  <div className="space-y-1 text-right">
                    <Label htmlFor="assessmentName">اسم التقييم <span className="text-red-500">*</span></Label>
                    <Input
                      id="assessmentName"
                      name="assessmentName"
                      value={currentAssessmentName}
                      onChange={(e) => setCurrentAssessmentName(e.target.value)}
                      required
                      className="text-right"
                      placeholder="أدخل اسم التقييم هنا"
                    />
                    {assessmentNameError && <p className="text-sm text-red-600">{assessmentNameError}</p>}
                  </div>

                  {/* Separator or spacing */}
                  <hr className="my-4" />

                  {/* Existing Sensitive System Form */}
                  <SensitiveSystemForm
                    assessmentId={selectedAssessmentId}
                    // Pass assessmentName and update logic if needed inside the form,
                    // OR handle the PATCH before calling onFormSubmit here.
                    // For simplicity, let's handle PATCH here before closing.
                    onFormSubmit={async () => {
                      // --- PATCH Assessment Name before closing ---
                      setAssessmentNameError(null); // Clear previous errors
                      if (!currentAssessmentName.trim()) {
                        setAssessmentNameError("اسم التقييم مطلوب.");
                        return; // Prevent closing if name is empty
                      }
                      try {
                        const patchResponse = await fetch(`/api/assessments/${selectedAssessmentId}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ assessmentName: currentAssessmentName }),
                        });
                        if (!patchResponse.ok) {
                          const errorData = await patchResponse.json();
                          throw new Error(errorData.error || 'Failed to update assessment name');
                        }
                        // Update local assessment state if needed
                        setAssessments(prev => prev.map(a =>
                          a.id === selectedAssessmentId ? { ...a, assessmentName: currentAssessmentName } : a
                        ));
                        setIsModalOpen(false); // Close modal on successful submit of BOTH
                      } catch (error: unknown) {
                        console.error("Error updating assessment name:", error);
                        // Added instanceof Error check here as well
                        setAssessmentNameError(error instanceof Error ? error.message : "فشل تحديث اسم التقييم.");
                        // Do not close the modal if the PATCH fails
                      }
                      // --- End PATCH ---
                    }}
                  />
                </div>
              ) : (
                <div className="p-4 text-center">لم يتم تحديد تقييم.</div>
              )}
            </DialogContent>
          </Dialog>

          {/* Anchor for System Info (Link target) */}
          <div id="system-info"></div>
          {/* Removed System Information Section Card */}


          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task Assignment */}
            <Card> {/* Removed p-6 */}
              <CardHeader>
                <CardTitle className="text-xl font-semibold">تعيين المهام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              {/* Select System Dropdown */}
              <div className="mb-4">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">اختر النظام</span>
                  </div>
                  <Select
                    dir="rtl"
                    value={selectedSystemId}
                    onValueChange={setSelectedSystemId} // Update state on change
                  >
                    <SelectTrigger className="w-full text-right">
                      <SelectValue placeholder="اختر نظاماً..." />
                    </SelectTrigger>
                   <SelectContent>
                     {isLoadingSystems ? (
                       <SelectItem value="loading" disabled>جاري تحميل الأنظمة...</SelectItem>
                     ) : systemsError ? (
                       <SelectItem value="error" disabled>خطأ: {systemsError}</SelectItem>
                     ) : sensitiveSystems.length === 0 ? (
                       <SelectItem value="no-systems" disabled>لا توجد أنظمة مدخلة.</SelectItem>
                     ) : (
                       sensitiveSystems.map((system) => (
                         <SelectItem key={system.id} value={system.id}>
                           {system.systemName}
                         </SelectItem>
                       ))
                     )}
                   </SelectContent>
                 </Select>
               </div>

              {/* Select Control Dropdown - Updated */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">اختر الضوابط</span> {/* Changed label */}
                </div>
                <Popover open={isControlPopoverOpen} onOpenChange={setIsControlPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isControlPopoverOpen}
                      className="w-full justify-between text-right font-normal"
                    >
                      <span className="truncate">
                        {selectedControls.length > 0
                          ? selectedControls.map((c) => c.controlNumber).join(', ')
                          : "اختر ضابطاً أو أكثر..."}
                      </span>
                      <ChevronDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command shouldFilter={true}> {/* Enable default filtering */}
                      <CommandInput
                        ref={controlInputRef}
                        placeholder="ابحث عن ضابط..."
                        className="text-right" // Ensure placeholder is right-aligned
                      />
                      <CommandList>
                        <CommandEmpty>لم يتم العثور على ضوابط.</CommandEmpty>
                        <CommandGroup>
                          {isLoadingControls ? (
                            <CommandItem disabled>جاري تحميل الضوابط...</CommandItem>
                          ) : controlsError ? (
                            <CommandItem disabled>خطأ: {controlsError}</CommandItem>
                          ) : controls.length === 0 ? (
                            <CommandItem disabled>لا توجد ضوابط.</CommandItem>
                          ) : (
                            controls.map((control) => {
                              const isSelected = selectedControls.some((c) => c.id === control.id);
                              return (
                                <CommandItem
                                  key={control.id}
                                  value={`${control.controlNumber} ${control.controlText}`} // Value used for searching
                                  onSelect={() => handleControlSelect(control)}
                                  className="flex items-center justify-between cursor-pointer"
                                >
                                  <span className="flex-1 text-right truncate" title={`${control.controlNumber} - ${control.controlText}`}>
                                    {control.controlNumber} - {control.controlText}
                                  </span>
                                  <Checkbox
                                    checked={isSelected}
                                    className="ml-2" // Margin left for RTL
                                    aria-hidden="true" // Hide from screen readers, handled by CommandItem selection
                                  />
                                </CommandItem>
                              );
                            })
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {/* Display selected controls as badges */}
                {selectedControls.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedControls.map((control) => (
                      <Badge
                        key={control.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <span>{control.controlNumber}</span>
                        <button
                          onClick={() => handleControlRemove(control.id)}
                          className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                          aria-label={`إزالة ${control.controlNumber}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Select Department Manager Dropdown */}
              <div className="mb-4">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-sm font-medium">اختر مدير القسم</span> {/* Changed Label */}
                 </div>
                  <Select
                    dir="rtl"
                    value={selectedDepartmentManagerId} // Use new state variable
                    onValueChange={setSelectedDepartmentManagerId} // Update new state variable
                  >
                    <SelectTrigger className="w-full text-right">
                      <SelectValue placeholder="اختر مدير القسم..." /> {/* Changed Placeholder */}
                    </SelectTrigger>
                   <SelectContent>
                     {isLoadingDeptManagers ? (
                       <SelectItem value="loading" disabled>جاري تحميل المدراء...</SelectItem>
                     ) : deptManagersError ? (
                       <SelectItem value="error" disabled>خطأ: {deptManagersError}</SelectItem>
                     ) : departmentManagers.length === 0 ? (
                       <SelectItem value="no-managers" disabled>لا يوجد مدراء أقسام.</SelectItem>
                     ) : (
                       departmentManagers.map((manager) => (
                         <SelectItem key={manager.id} value={manager.id}>
                           {/* Display Arabic name if available, otherwise fallback to English name */}
                           {manager.nameAr || manager.name}
                         </SelectItem>
                       ))
                     )}
                   </SelectContent>
                 </Select>
              </div>

              {/* Deadline Date Picker */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">الموعد النهائي</span>
                </div>
                {/* Replaced native date input with Shadcn Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-right font-normal", // Use text-right for RTL placeholder alignment
                        !deadlineDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" /> {/* Icon on the left */}
                      {deadlineDate ? format(deadlineDate, "PPP") : <span>اختر تاريخاً</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadlineDate}
                      onSelect={setDeadlineDate}
                      initialFocus
                    />
                  </PopoverContent>
                 </Popover>
               </div>

                 <Button
                   className="w-full bg-nca-teal text-white hover:bg-nca-teal-dark disabled:opacity-50"
                   onClick={handleAssignTask}
                   disabled={isAssigningTask} // Disable button while loading
                 >
                   {isAssigningTask ? 'جاري التعيين...' : 'تعيين المهمة'}
                 </Button>

                 {/* Task Assignment Feedback */}
                 {taskAssignmentMessage && (
                   <div className={`mt-3 text-sm ${taskAssignmentMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                     {taskAssignmentMessage.text}
                   </div>
                 )}
               </CardContent>
             </Card>

            {/* Risk Assessment */}
            <Card> {/* Removed p-6 */}
               <CardHeader>
                 <CardTitle className="text-xl font-semibold">تقييم المخاطر</CardTitle>
               </CardHeader>
               <CardContent> {/* Added CardContent */}
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
               </CardContent>
            </Card>
          </div>

          {/* Anchor for Reports */}
          <div id="reports"></div>
          {/* Report Generation */}
          <Card className="mt-6"> {/* Removed p-6 */}
            <CardHeader>
              <CardTitle className="text-xl font-semibold">إنشاء التقارير</CardTitle>
            </CardHeader>
            <CardContent> {/* Added CardContent */}
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
            </CardContent>
          </Card>
          {/* End of main content sections */}
        </main>
      </div> {/* End Flex container */}
    </div>
    // </ProtectedRoute>
  )
}
