"use client";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Removed DialogTrigger as it's not used directly here
import { Bell, User as UserIcon, BarChart, FileText, AlertTriangle, Search, Plus, Filter, Download, Calendar, ChevronDown, Menu, // Added for sidebar icon
Server, // Added for sidebar icon
ListChecks, // Added for sidebar icon
ShieldCheck, // Added for sidebar icon
FileWarning, // Added for sidebar icon
LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select components
// Import the form component
import SensitiveSystemForm from "@/components/sensitive-system-form";
export default function SecurityManagerDashboardPage() {
    var _this = this;
    var _a = useState(true), isSidebarOpen = _a[0], setIsSidebarOpen = _a[1];
    var _b = useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = useState([]), assessments = _c[0], setAssessments = _c[1];
    var _d = useState([]), sensitiveSystems = _d[0], setSensitiveSystems = _d[1]; // State for sensitive systems
    var _e = useState(true), isLoadingAssessments = _e[0], setIsLoadingAssessments = _e[1];
    var _f = useState(true), isLoadingSystems = _f[0], setIsLoadingSystems = _f[1]; // Loading state for systems
    var _g = useState(null), userId = _g[0], setUserId = _g[1];
    var _h = useState(null), assessmentsError = _h[0], setAssessmentsError = _h[1]; // Specific error for assessments
    var _j = useState(null), systemsError = _j[0], setSystemsError = _j[1]; // Specific error for systems
    var _k = useState(false), isModalOpen = _k[0], setIsModalOpen = _k[1];
    var _l = useState(null), selectedAssessmentId = _l[0], setSelectedAssessmentId = _l[1];
    // --- Temporary User ID Fetch ---
    // In a real app, get this from auth context/session
    useEffect(function () {
        var fetchUserId = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, managers, err_1, errorMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch('/api/users/security-managers')];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error('Failed to fetch security managers');
                        return [4 /*yield*/, response.json()];
                    case 2:
                        managers = _a.sent();
                        if (managers.length > 0) {
                            setUserId(managers[0].id);
                        }
                        else {
                            setAssessmentsError("No Security Manager user found."); // Set specific error
                            setSystemsError("No Security Manager user found."); // Set specific error
                            setIsLoadingAssessments(false);
                            setIsLoadingSystems(false);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.error("Error fetching user ID:", err_1);
                        errorMsg = err_1.message || "Failed to get user ID";
                        setAssessmentsError(errorMsg); // Set specific error
                        setSystemsError(errorMsg); // Set specific error
                        setIsLoadingAssessments(false);
                        setIsLoadingSystems(false);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        fetchUserId();
    }, []);
    // --- End Temporary User ID Fetch ---
    // Fetch assessments when userId is available
    useEffect(function () {
        if (!userId)
            return;
        // Fetch Assessments
        var fetchAssessments = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoadingAssessments(true);
                        setAssessmentsError(null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, fetch("/api/users/".concat(userId, "/assessments"))];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to fetch assessments: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        setAssessments(data);
                        return [3 /*break*/, 6];
                    case 4:
                        err_2 = _a.sent();
                        console.error("Error fetching assessments:", err_2);
                        setAssessmentsError(err_2.message || "An unknown error occurred fetching assessments");
                        return [3 /*break*/, 6];
                    case 5:
                        setIsLoadingAssessments(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        // Fetch Sensitive Systems
        var fetchSensitiveSystems = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoadingSystems(true);
                        setSystemsError(null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, fetch("/api/users/".concat(userId, "/sensitive-systems"))];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to fetch sensitive systems: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        // Map to the simpler type
                        setSensitiveSystems(data.map(function (system) { return ({ id: system.id, systemName: system.systemName }); }));
                        return [3 /*break*/, 6];
                    case 4:
                        err_3 = _a.sent();
                        console.error("Error fetching sensitive systems:", err_3);
                        setSystemsError(err_3.message || "An unknown error occurred fetching systems");
                        return [3 /*break*/, 6];
                    case 5:
                        setIsLoadingSystems(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        fetchAssessments();
        fetchSensitiveSystems(); // Fetch systems as well
    }, [userId]);
    var handleOpenForm = function (assessmentId) {
        setSelectedAssessmentId(assessmentId);
        setIsModalOpen(true);
    };
    // Filter assessments based on search query (simple example)
    var filteredAssessments = assessments.filter(function (assessment) {
        return assessment.companyNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assessment.companyNameEn.toLowerCase().includes(searchQuery.toLowerCase());
    });
    // Format date helper
    var formatDate = function (dateString) {
        if (!dateString)
            return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
        catch (e) {
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
              <Image src="/static/image/logo.png" width={160} height={160} alt="Logo" className="object-contain"/>
            </div>
            {/* Optional: Add Title next to logo if needed */}
            {/* <span className="text-lg">منصة تقييم الأمن السيبراني</span> */}
          </div>

          {/* Center Spacer */}
          <div className="flex-grow"></div>

          {/* User Profile, Bell, Sidebar Toggle - Left Side */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
              <Bell className="h-5 w-5"/>
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
              <UserIcon className="h-5 w-5"/>
            </Button>
            {/* Sidebar Toggle Button */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700 md:hidden" // Show only on smaller screens
     onClick={function () { return setIsSidebarOpen(!isSidebarOpen); }}>
              <Menu className="h-6 w-6"/>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-row"> {/* Flex container for sidebar and main */}
        {/* Sidebar */}
        <aside className={"bg-slate-800 text-white p-4 sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto transition-all duration-300 ease-in-out hidden md:block ".concat(isSidebarOpen ? 'w-64' : 'w-20')}>
           {/* Toggle Button inside sidebar for larger screens */}
           <div className={"flex ".concat(isSidebarOpen ? 'justify-end' : 'justify-center', " mb-4")}>
             <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={function () { return setIsSidebarOpen(!isSidebarOpen); }}>
               <Menu className="h-6 w-6"/>
             </Button>
           </div>
          <nav className="space-y-2">
            {/* Links updated for Security Manager */}
            <Link href="/security-manager" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
              <LayoutDashboard className="h-5 w-5 flex-shrink-0"/>
              <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>لوحة المعلومات</span>
            </Link>
            <Link href="/security-manager#assessments" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
              <ShieldCheck className="h-5 w-5 flex-shrink-0"/>
              <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>التقييمات المعينة</span>
            </Link>
             <Link href="/security-manager/system-info" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}> {/* Updated href */}
              <Server className="h-5 w-5 flex-shrink-0"/>
              <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>معلومات الأنظمة</span>
            </Link>
            <Link href="/security-manager#tasks" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
              <ListChecks className="h-5 w-5 flex-shrink-0"/>
              <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>المهام</span>
            </Link>
            <Link href="/security-manager#risks" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
              <FileWarning className="h-5 w-5 flex-shrink-0"/>
              <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>المخاطر</span>
            </Link>
            <Link href="/security-manager#reports" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
              <FileText className="h-5 w-5 flex-shrink-0"/>
              <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>التقارير</span>
            </Link>
            {/* Add more relevant links */}
          </nav>
        </aside>

        {/* Main Content Area */}
        {/* Adjusted margin-right based on sidebar state */}
        <main className={"flex-1 p-6 overflow-y-auto h-[calc(100vh-76px)] transition-all duration-300 ease-in-out ".concat(isSidebarOpen ? 'md:mr-0' : 'md:mr-20')}>
          {/* Removed max-w-7xl and mx-auto from here */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">لوحة مدير الأمن</h1> {/* Title */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                <Input placeholder="بحث..." className="pl-4 pr-10 w-64 text-right" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
              </div>
              <Button className="bg-nca-teal hover:bg-nca-teal-dark text-white gap-2">
                <Plus className="h-4 w-4"/>
                تقييم جديد
              </Button>
            </div>
          </div>
          
          {/* Stats Cards - Using CardHeader/Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">التقييمات المعينة</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assessments.length}</div>
                {/* <p className="text-xs text-muted-foreground">+2 pending</p> */}
              </CardContent>
            </Card>

             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط نسبة الامتثال</CardTitle>
                 <BarChart className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">76%</div> {/* Placeholder */}
                {/* <p className="text-xs text-muted-foreground">Up from 72%</p> */}
              </CardContent>
            </Card>

             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مخاطر متوسطة</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div> {/* Placeholder */}
                {/* <p className="text-xs text-muted-foreground">Requires attention</p> */}
              </CardContent>
            </Card>

             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مخاطر عالية</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500"/>
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
                  <Filter className="h-4 w-4"/>
                  تصفية
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4"/>
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
                    </tr>) : assessmentsError ? ( // Corrected variable name
        <tr>
                      <td colSpan={5} className="text-center py-4 text-red-600">{assessmentsError}</td> {/* Corrected variable name */}
                    </tr>) : filteredAssessments.length === 0 ? (<tr>
                      <td colSpan={5} className="text-center py-4">لا توجد تقييمات معينة لك.</td>
                    </tr>) : (filteredAssessments.map(function (assessment) { return (<tr key={assessment.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                          <Button variant="outline" size="sm" className="text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white" onClick={function () { return handleOpenForm(assessment.id); }}>
                            إضافة معلومات النظام
                          </Button>
                          {/* Add other actions like 'View Details' if needed */}
                        </td>
                      </tr>); }))}
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
              {selectedAssessmentId ? (<SensitiveSystemForm assessmentId={selectedAssessmentId} onFormSubmit={function () { return setIsModalOpen(false); }} // Close modal on successful submit
        />) : (<div className="p-4 text-center">لم يتم تحديد تقييم.</div>)}
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
                     <SelectValue placeholder="اختر نظاماً..."/>
                   </SelectTrigger>
                   <SelectContent>
                     {isLoadingSystems ? (<SelectItem value="loading" disabled>جاري تحميل الأنظمة...</SelectItem>) : systemsError ? (<SelectItem value="error" disabled>خطأ: {systemsError}</SelectItem>) : sensitiveSystems.length === 0 ? (<SelectItem value="no-systems" disabled>لا توجد أنظمة مدخلة.</SelectItem>) : (sensitiveSystems.map(function (system) { return (<SelectItem key={system.id} value={system.id}>
                           {system.systemName}
                         </SelectItem>); }))}
                   </SelectContent>
                 </Select>
               </div>

              {/* Select Control Dropdown */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">اختر الضابط</span> {/* Keep label as is, but it means Control */}
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
                  <ChevronDown className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
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
                  <ChevronDown className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">الموعد النهائي</span>
                </div>
                <div className="relative">
                  <Input type="date" className="w-full p-2 border rounded-md text-right"/>
                  <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
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
                    <FileText className="h-8 w-8 text-nca-teal"/>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-center mb-2">تقرير الامتثال</h3>
                <p className="text-sm text-gray-600 text-center">تقرير شامل عن مستوى الامتثال لضوابط الأمن السيبراني</p>
              </div>
              
              <div className="border rounded-lg p-6 hover:border-nca-teal cursor-pointer transition-all">
                <div className="flex justify-center mb-4">
                  <div className="bg-nca-teal bg-opacity-10 p-4 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-nca-teal"/>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-center mb-2">تقرير المخاطر</h3>
                <p className="text-sm text-gray-600 text-center">تقرير مفصل عن المخاطر المكتشفة وتوصيات المعالجة</p>
              </div>
              
              <div className="border rounded-lg p-6 hover:border-nca-teal cursor-pointer transition-all">
                <div className="flex justify-center mb-4">
                  <div className="bg-nca-teal bg-opacity-10 p-4 rounded-full">
                    <BarChart className="h-8 w-8 text-nca-teal"/>
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
                    <Download className="h-4 w-4"/>
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
    );
}
