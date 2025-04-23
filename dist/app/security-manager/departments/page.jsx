'use client';
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
import React, { useState, useEffect } from 'react';
import Image from "next/image"; // Added for header logo
import Link from "next/link"; // Added for sidebar links
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Trash2, // Icon for delete button
Bell, // Header icon
User as UserIcon, // Header icon
Menu, // Sidebar toggle icon
Server, // Sidebar icon
FileText, // Sidebar icon
FileWarning, // Sidebar icon
LayoutDashboard, // Sidebar icon
ListChecks, // Sidebar icon
ShieldCheck, // Sidebar icon
Building // Sidebar icon (current page)
 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context'; // Assuming you have auth context
import { useRouter } from 'next/navigation';
export default function ManageDepartmentsPage() {
    var _this = this;
    var _a = useState([]), departments = _a[0], setDepartments = _a[1];
    var _b = useState(''), newDepartmentName = _b[0], setNewDepartmentName = _b[1];
    var _c = useState(true), isLoading = _c[0], setIsLoading = _c[1];
    var _d = useState(null), error = _d[0], setError = _d[1];
    var _e = useState(null), addError = _e[0], setAddError = _e[1];
    var _f = useState(true), isSidebarOpen = _f[0], setIsSidebarOpen = _f[1]; // State for sidebar
    var _user = useAuth().user; // Prefixed unused user
    var _router = useRouter(); // Prefixed unused router
    // Optional: Redirect if not a security manager (or admin)
    // useEffect(() => {
    //     if (_user && _user.role !== 'SECURITY_MANAGER' && _user.role !== 'ADMIN') { // Use _user
    //         _router.push('/unauthorized'); // Or your login/home page // Use _router
    //     }
    // }, [_user, _router]); // Use _user, _router
    // Fetch departments on component mount
    useEffect(function () {
        fetchDepartments();
    }, []);
    var fetchDepartments = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/departments')];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    setDepartments(data);
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    console.error("Failed to fetch departments:", err_1);
                    if (err_1 instanceof Error) {
                        setError("\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u0645\u064A\u0644 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0642\u0633\u0627\u0645: ".concat(err_1.message));
                    }
                    else {
                        setError('فشل في تحميل قائمة الأقسام.');
                    }
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleAddDepartment = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setAddError(null);
                    if (!newDepartmentName.trim()) {
                        setAddError('اسم القسم مطلوب.');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/departments', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: newDepartmentName.trim() }),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (!response.ok) {
                        // Use message from API if available, otherwise generic error
                        throw new Error(result.message || "HTTP error! status: ".concat(response.status));
                    }
                    setNewDepartmentName(''); // Clear input
                    fetchDepartments(); // Refresh the list
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _a.sent();
                    console.error("Failed to add department:", err_2);
                    if (err_2 instanceof Error) {
                        setAddError("\u0641\u0634\u0644 \u0641\u064A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0642\u0633\u0645: ".concat(err_2.message));
                    }
                    else {
                        setAddError('فشل في إضافة القسم.');
                    }
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteDepartment = function (departmentId) { return __awaiter(_this, void 0, void 0, function () {
        var response, errorMsg, result, _a, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Optional: Add a confirmation dialog here
                    if (!confirm("\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u0631\u063A\u0628\u062A\u0643 \u0641\u064A \u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645\u061F \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621.")) {
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, fetch("/api/departments/".concat(departmentId), {
                            method: 'DELETE',
                        })];
                case 2:
                    response = _b.sent();
                    if (!!response.ok) return [3 /*break*/, 7];
                    errorMsg = "HTTP error! status: ".concat(response.status);
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, response.json()];
                case 4:
                    result = _b.sent();
                    errorMsg = result.message || errorMsg;
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 6: throw new Error(errorMsg);
                case 7:
                    fetchDepartments(); // Refresh the list
                    return [3 /*break*/, 9];
                case 8:
                    err_3 = _b.sent();
                    console.error("Failed to delete department:", err_3);
                    if (err_3 instanceof Error) {
                        alert("\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0642\u0633\u0645: ".concat(err_3.message)); // Use alert for delete errors
                    }
                    else {
                        alert('فشل في حذف القسم.');
                    }
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    // Optional: Add loading state check for user role if implementing redirection
    // if (!_user) return <div>Loading user data...</div>; // Use _user
    return (<div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
            {/* Header - Copied from system-info */}
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

            {/* Main Layout with Sidebar - Copied from system-info */}
            <div className="flex flex-row">
                {/* Sidebar */}
                <aside className={"bg-slate-800 text-white p-4 sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto transition-all duration-300 ease-in-out hidden md:block ".concat(isSidebarOpen ? 'w-64' : 'w-20')}>
                    <div className={"flex ".concat(isSidebarOpen ? 'justify-end' : 'justify-center', " mb-4")}>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={function () { return setIsSidebarOpen(!isSidebarOpen); }}>
                            <Menu className="h-6 w-6"/>
                        </Button>
                    </div>
                    <nav className="space-y-2">
                        {/* Sidebar Links - Copied from main dashboard */}
                        <Link href="/security-manager" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
                            <LayoutDashboard className="h-5 w-5 flex-shrink-0"/>
                            <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>لوحة المعلومات</span>
                        </Link>
                        <Link href="/security-manager#assessments" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
                            <ShieldCheck className="h-5 w-5 flex-shrink-0"/>
                            <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>التقييمات المعينة</span>
                        </Link>
                        <Link href="/security-manager/system-info" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
                            <Server className="h-5 w-5 flex-shrink-0"/>
                            <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>معلومات الأنظمة</span>
                        </Link>
                        {/* Highlight the current page */}
                        <Link href="/security-manager/departments" className={"flex items-center gap-3 px-3 py-2 rounded bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
                            <Building className="h-5 w-5 flex-shrink-0"/>
                            <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>إدارة الأقسام</span>
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
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className={"flex-1 p-6 overflow-y-auto h-[calc(100vh-76px)] transition-all duration-300 ease-in-out ".concat(isSidebarOpen ? 'md:mr-0' : 'md:mr-20')}>
                    {/* Original Page Content Starts Here */}
                    <div className="flex justify-between items-center mb-6">
                         <h1 className="text-2xl font-bold text-slate-800">إدارة الأقسام</h1>
                         {/* Optional: Add search or other controls if needed */}
                    </div>


                    {/* Add Department Form */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>إضافة قسم جديد</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleAddDepartment}>
                            <CardContent>
                                <Input type="text" placeholder="أدخل اسم القسم الجديد" value={newDepartmentName} onChange={function (e) { return setNewDepartmentName(e.target.value); }} required className="mb-2"/>
                                {addError && <p className="text-red-500 text-sm">{addError}</p>}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit">إضافة القسم</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* Departments List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>الأقسام الحالية</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading && <p>جاري تحميل الأقسام...</p>}
                            {error && <p className="text-red-500">{error}</p>}
                            {!isLoading && !error && departments.length === 0 && (<p>لا توجد أقسام مضافة حالياً.</p>)}
                            {!isLoading && !error && departments.length > 0 && (<ul className="space-y-3">
                                    {departments.map(function (dept) { return (<li key={dept.id} className="flex justify-between items-center p-3 border rounded-md bg-gray-50 hover:bg-gray-100">
                                            <span className="font-medium">{dept.name}</span>
                                            <Button variant="destructive" size="sm" onClick={function () { return handleDeleteDepartment(dept.id); }} aria-label={"\u062D\u0630\u0641 \u0642\u0633\u0645 ".concat(dept.name)}>
                                                <Trash2 className="h-4 w-4 mr-1"/>
                                                حذف
                                            </Button>
                                        </li>); })}
                                </ul>)}
                        </CardContent>
                    </Card>
                    {/* Original Page Content Ends Here */}
                </main>
            </div>
        </div>);
}
