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
import { Bell, User as UserIcon, 
// Search, // Removed unused import
Menu, Server, // Sidebar icon
// FileText, // Removed unused import
// FileWarning, // Removed unused import
LayoutDashboard, // Sidebar icon
// ListChecks, // Removed unused import
// ShieldCheck, // Removed unused import
BarChart // Added for Results link
 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card"; // Removed unused CardTitle
import Link from "next/link";
export default function SystemInfoPage() {
    var _this = this;
    var _a = useState(true), isSidebarOpen = _a[0], setIsSidebarOpen = _a[1]; // State for sidebar
    var _b = useState(null), userId = _b[0], setUserId = _b[1]; // SM User ID (temporary fetch)
    var _c = useState(null), userError = _c[0], setUserError = _c[1]; // Error for user fetch
    // State for System Info list
    var _d = useState([]), systemInfoList = _d[0], setSystemInfoList = _d[1];
    var _e = useState(true), systemInfoLoading = _e[0], setSystemInfoLoading = _e[1];
    var _f = useState(null), systemInfoError = _f[0], setSystemInfoError = _f[1];
    // --- Temporary User ID Fetch ---
    // In a real app, get this from auth context/session
    useEffect(function () {
        var fetchUserId = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, managers, err_1;
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
                            setUserError("No Security Manager user found.");
                            setSystemInfoLoading(false); // Stop loading if no user
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.error("Error fetching user ID:", err_1);
                        setUserError(err_1.message || "Failed to get user ID");
                        setSystemInfoLoading(false); // Stop loading on error
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        fetchUserId();
    }, []);
    // --- End Temporary User ID Fetch ---
    // Fetch sensitive system info when userId is available
    useEffect(function () {
        if (!userId)
            return;
        var fetchSystemInfo = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setSystemInfoLoading(true);
                        setSystemInfoError(null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, fetch("/api/users/".concat(userId, "/sensitive-systems"))];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to fetch system info: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        setSystemInfoList(data);
                        return [3 /*break*/, 6];
                    case 4:
                        err_2 = _a.sent();
                        console.error("Error fetching system info:", err_2);
                        setSystemInfoError(err_2.message || "An unknown error occurred");
                        return [3 /*break*/, 6];
                    case 5:
                        setSystemInfoLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        fetchSystemInfo();
    }, [userId]);
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
    return (<div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="w-full bg-slate-900 text-white py-3 px-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm md:text-base lg:text-lg">
            <div className="relative h-16 w-16">
              <Image src="/static/image/logo.png" width={160} height={160} alt="Logo" className="object-contain"/>
            </div>
          </div>
          <div className="flex-grow"></div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
              <Bell className="h-5 w-5"/>
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
              <UserIcon className="h-5 w-5"/>
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700 md:hidden" onClick={function () { return setIsSidebarOpen(!isSidebarOpen); }}>
              <Menu className="h-6 w-6"/>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-row">
        {/* Sidebar */}
        <aside className={"bg-slate-800 text-white p-4 sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto transition-all duration-300 ease-in-out hidden md:block ".concat(isSidebarOpen ? 'w-64' : 'w-20')}>
           <div className={"flex ".concat(isSidebarOpen ? 'justify-end' : 'justify-center', " mb-4")}>
             <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={function () { return setIsSidebarOpen(!isSidebarOpen); }}>
               <Menu className="h-6 w-6"/>
             </Button>
           </div>
          <nav className="space-y-2">
            {/* Sidebar Links - Copied from main dashboard, adjust active state if needed */}
            <Link href="/security-manager" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
              <LayoutDashboard className="h-5 w-5 flex-shrink-0"/>
              <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>لوحة المعلومات</span>
            </Link>
            {/* <Link href="/security-manager#assessments" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
          <ShieldCheck className="h-5 w-5 flex-shrink-0" />
          <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>التقييمات المعينة</span>
        </Link> */}
             {/* Highlight the current page */}
             <Link href="/security-manager/system-info" className={"flex items-center gap-3 px-3 py-2 rounded bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
              <Server className="h-5 w-5 flex-shrink-0"/>
              <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>معلومات الأنظمة</span>
            </Link>
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
            {/* Link to Results/Analytics Page - Added */}
            <Link href="/security-manager/results" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
              <BarChart className="h-5 w-5 flex-shrink-0"/> {/* Using BarChart icon for analytics */}
              <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>النتائج</span>
            </Link>
            {/* Add missing Departments link (commented out) for consistency, though it wasn't here before */}
            {/* <Link href="/security-manager/departments" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
          <Building className="h-5 w-5 flex-shrink-0" />
          <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>إدارة الأقسام</span>
        </Link> */}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className={"flex-1 p-6 overflow-y-auto h-[calc(100vh-76px)] transition-all duration-300 ease-in-out ".concat(isSidebarOpen ? 'md:mr-0' : 'md:mr-20')}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">معلومات الأنظمة المقدمة</h1>
            {/* Add search or filter if needed */}
          </div>

          {/* System Information Section */}
           <Card className="mb-6">
            <CardHeader>
              {/* Optional: Add filter/export buttons here if needed */}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-right border-b border-gray-200">
                      <th className="pb-3 font-medium text-gray-700 pr-4">اسم النظام</th>
                      <th className="pb-3 font-medium text-gray-700">فئة النظام</th>
                      <th className="pb-3 font-medium text-gray-700">الشركة</th>
                      <th className="pb-3 font-medium text-gray-700">تاريخ الإدخال</th>
                      <th className="pb-3 font-medium text-gray-700">إجمالي الأصول</th>
                      {/* <th className="pb-3 font-medium text-gray-700">الإجراءات</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {userError ? ( // Display error if user ID couldn't be fetched
        <tr><td colSpan={5} className="text-center py-4 text-red-600">{userError}</td></tr>) : systemInfoLoading ? (<tr><td colSpan={5} className="text-center py-4">جاري تحميل معلومات الأنظمة...</td></tr>) : systemInfoError ? (<tr><td colSpan={5} className="text-center py-4 text-red-600">{systemInfoError}</td></tr>) : systemInfoList.length === 0 ? (<tr><td colSpan={5} className="text-center py-4">لم يتم إدخال معلومات أنظمة بعد.</td></tr>) : (systemInfoList.map(function (info) {
            var _a;
            return (<tr key={info.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 pr-4">{info.systemName}</td>
                          <td className="py-4">{info.systemCategory}</td>
                          <td className="py-4">{((_a = info.assessment) === null || _a === void 0 ? void 0 : _a.companyNameAr) || 'N/A'}</td>
                          <td className="py-4">{formatDate(info.createdAt)}</td>
                          <td className="py-4">{info.totalAssetCount}</td>
                          {/* Add actions like 'View Details' button if needed */}
                          {/* <td className="py-4">
                  <Button variant="ghost" size="sm">عرض</Button>
                </td> */}
                        </tr>);
        }))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>);
}
