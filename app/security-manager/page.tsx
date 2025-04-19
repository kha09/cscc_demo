"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Assessment, User, SensitiveSystemInfo, Control } from "@prisma/client"; // Added Control
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Removed DialogTrigger as it's not used directly here
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
  ChevronDown,
  Menu, // Added for sidebar toggle
  Activity, // Added for sidebar icon
  Server, // Added for sidebar icon
  ListChecks, // Added for sidebar icon
  ShieldCheck, // Added for sidebar icon
  FileWarning, // Added for sidebar icon
  LayoutDashboard,
  Building // Added for Departments icon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Added Select components
// Import the form component
import SensitiveSystemForm from "@/components/sensitive-system-form";

// Define the type for the fetched sensitive system data (id and name)
type SimpleSensitiveSystemInfo = Pick<SensitiveSystemInfo, 'id' | 'systemName'>;

// Define type for fetched control data (id, number, text)
type SimpleControl = Pick<Control, 'id' | 'controlNumber' | 'controlText'>;


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

  // State variables for controls
  const [controls, setControls] = useState<SimpleControl[]>([]);
  const [isLoadingControls, setIsLoadingControls] = useState(true);
  const [controlsError, setControlsError] = useState<string | null>(null);

  // State variables for departments
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);


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
      } catch (err: any) {
        console.error("Error fetching user ID:", err);
        const errorMsg = err.message || "Failed to get user ID";
        setAssessmentsError(errorMsg); // Set specific error
        setSystemsError(errorMsg); // Set specific error
        setIsLoadingAssessments(false);
        setIsLoadingSystems(false);
      }
    };
    fetchUserId();
  }, []);
  // --- End Temporary User ID Fetch ---

  // Fetch assessments and systems when userId is available
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
        const data: Assessment[] = await response.json();
        setAssessments(data);
      } catch (err: any) {
        console.error("Error fetching assessments:", err);
        setAssessmentsError(err.message || "An unknown error occurred fetching assessments");
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
      } catch (err: any) {
        console.error("Error fetching sensitive systems:", err);
        setSystemsError(err.message || "An unknown error occurred fetching systems");
      } finally {
        setIsLoadingSystems(false);
      }
    };

    fetchAssessments();
    fetchSensitiveSystems(); // Fetch systems as well
  }, [userId]);

  // Fetch Controls on component mount
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
      } catch (err: any) {
        console.error("Error fetching controls:", err);
        setControlsError(err.message || "An unknown error occurred fetching controls");
      } finally {
        setIsLoadingControls(false);
      }
    };

    // Fetch Departments function
    const fetchDepartments = async () => {
      setIsLoadingDepartments(true);
      setDepartmentsError(null);
      try {
        const response = await fetch('/api/departments');
        if (!response.ok) {
          throw new Error(`Failed to fetch departments: ${response.statusText}`);
        }
        const data: { id: string; name: string }[] = await response.json();
        setDepartments(data);
      } catch (err: any) {
        console.error("Error fetching departments:", err);
        setDepartmentsError(err.message || "An unknown error occurred fetching departments");
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchControls();
    fetchDepartments(); // Fetch departments on mount as well
  }, []); // Empty dependency array means run once on mount


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
            <Link href="/security-manager#assessments" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <ShieldCheck className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>التقييمات المعينة</span>
            </Link>
             <Link href="/security-manager/system-info" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}> {/* Updated href */}
              <Server className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>معلومات الأنظمة</span>
            </Link>
            {/* Link to Manage Departments */}
            <Link href="/security-manager/departments" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
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
              <Button className="bg-nca-teal hover:bg-nca-teal-dark text-white gap-2">
                <Plus className="h-4 w-4" />
                تقييم جديد
              </Button>
            </div>
          </div>

          {/* Stats Cards - Using CardHeader/Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">التقييمات المعينة</CardTitle>
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
                    <th className="pb-3 font-medium text-gray-700 pr-4">اسم الشركة (عربي)</th>
                    <th className="pb-3 font-medium text-gray-700">اسم الشركة (انجليزي)</th>
                    <th className="pb-3 font-medium text-gray-700">تاريخ الإنشاء</th>
                    {/* <th className="pb-3 font-medium text-gray-700">الموعد النهائي</th> */}
                    {/* <th className="pb-3 font-medium text-gray-700">التقدم</th> */}
                    <th className="pb-3 font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingAssessments ? ( // Corrected variable name
                    <tr>
                      <td colSpan={5} className="text-center py-4">جاري تحميل التقييمات...</td>
                    </tr>
                  ) : assessmentsError ? ( // Corrected variable name
                     <tr>
                      <td colSpan={5} className="text-center py-4 text-red-600">{assessmentsError}</td> {/* Corrected variable name */}
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
            </CardContent> {/* Add missing closing tag */}
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
            </DialogContent> {/* Correct closing tag */}
          </Dialog> {/* Correct closing tag */}

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
                 <Select dir="rtl">
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
                  <span className="text-sm font-medium">اختر الضابط</span> {/* Keep label as is, but it means Control */}
                </div>
                 <Select dir="rtl">
                   <SelectTrigger className="w-full text-right">
                     <SelectValue placeholder="اختر ضابطاً..." />
                   </SelectTrigger>
                   <SelectContent>
                     {isLoadingControls ? (
                       <SelectItem value="loading" disabled>جاري تحميل الضوابط...</SelectItem>
                     ) : controlsError ? (
                       <SelectItem value="error" disabled>خطأ: {controlsError}</SelectItem>
                     ) : controls.length === 0 ? (
                       <SelectItem value="no-controls" disabled>لا توجد ضوابط.</SelectItem>
                     ) : (
                       controls.map((control) => (
                         <SelectItem key={control.id} value={control.id}>
                           {/* Display control number and text */}
                           {control.controlNumber} - {control.controlText}
                         </SelectItem>
                       ))
                     )}
                   </SelectContent>
                 </Select>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">اختر القسم</span>
                </div>
                 <Select dir="rtl">
                   <SelectTrigger className="w-full text-right">
                     <SelectValue placeholder="اختر قسماً..." />
                   </SelectTrigger>
                   <SelectContent>
                     {isLoadingDepartments ? (
                       <SelectItem value="loading" disabled>جاري تحميل الأقسام...</SelectItem>
                     ) : departmentsError ? (
                       <SelectItem value="error" disabled>خطأ: {departmentsError}</SelectItem>
                     ) : departments.length === 0 ? (
                       <SelectItem value="no-departments" disabled>لا توجد أقسام.</SelectItem>
                     ) : (
                       departments.map((dept) => (
                         <SelectItem key={dept.id} value={dept.id}>
                           {dept.name}
                         </SelectItem>
                       ))
                     )}
                   </SelectContent>
                 </Select>
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
