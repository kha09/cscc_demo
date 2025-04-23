"use client";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { useState, useEffect, useCallback } from "react"; // Added useEffect, useCallback
import Image from "next/image";
import { Bell, User, ClipboardList, AlertTriangle, Search, Filter, Download, CheckCircle, Clock, Send, Upload, RefreshCw, // Added for loading indicator
CalendarIcon // Added for date picker
 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"; // Added Card components
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Badge } from "@/components/ui/badge"; // Added BadgeProps type
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; // Added Dialog
import { Label } from "@/components/ui/label"; // Added Label
import { Textarea } from "@/components/ui/textarea"; // Added Textarea
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Added Popover for Calendar
import { Calendar } from "@/components/ui/calendar"; // Added Calendar
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select
import { cn } from "@/lib/utils"; // Added cn utility
import { format } from "date-fns"; // Added date-fns for formatting
import { ComplianceLevel } from "@prisma/client"; // Import ComplianceLevel enum
export default function UserDashboardPage() {
    var _this = this;
    var _a, _b;
    var _c = useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = useState(null), currentUser = _d[0], setCurrentUser = _d[1];
    var _e = useState([]), assignedControls = _e[0], setAssignedControls = _e[1];
    var _f = useState(true), isLoadingUser = _f[0], setIsLoadingUser = _f[1];
    var _g = useState(true), isLoadingControls = _g[0], setIsLoadingControls = _g[1];
    var _h = useState(null), error = _h[0], setError = _h[1];
    var _j = useState(false), isDetailsModalOpen = _j[0], setIsDetailsModalOpen = _j[1];
    var _k = useState(null), selectedAssignment = _k[0], setSelectedAssignment = _k[1];
    // Initialize modal form data state
    var _l = useState({
        notes: "",
        correctiveActions: "",
        expectedComplianceDate: undefined,
        complianceLevel: "",
    }), modalFormData = _l[0], setModalFormData = _l[1];
    var _m = useState(false), isSaving = _m[0], setIsSaving = _m[1]; // State for save button loading
    var _o = useState(false), isDatePickerOpen = _o[0], setIsDatePickerOpen = _o[1]; // State for date picker popover
    // --- Fetch Current User ---
    // Placeholder: Fetch all users and find the first 'USER'. Replace with actual auth logic.
    useEffect(function () {
        var fetchCurrentUser = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, users, user, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoadingUser(true);
                        setError(null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, fetch('/api/users?role=USER')];
                    case 2:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch users: ".concat(response.statusText));
                        return [4 /*yield*/, response.json()];
                    case 3:
                        users = _a.sent();
                        user = users.length > 0 ? users[0] : null;
                        if (user) {
                            setCurrentUser(user);
                        }
                        else {
                            setError("User not found or not logged in."); // Adjust error message
                        }
                        return [3 /*break*/, 6];
                    case 4:
                        err_1 = _a.sent();
                        console.error("Error fetching current user:", err_1);
                        setError(err_1.message || "Failed to get current user information.");
                        return [3 /*break*/, 6];
                    case 5:
                        setIsLoadingUser(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        fetchCurrentUser();
    }, []);
    // --- Fetch Assigned Controls for Current User ---
    var fetchAssignedControls = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, controlsData, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(currentUser === null || currentUser === void 0 ? void 0 : currentUser.id)) {
                        if (!isLoadingUser)
                            setIsLoadingControls(false); // Stop loading if user fetch failed
                        return [2 /*return*/];
                    }
                    setIsLoadingControls(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch("/api/control-assignments?userId=".concat(currentUser.id), { cache: 'no-store' })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch assigned controls: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    controlsData = _a.sent();
                    setAssignedControls(controlsData);
                    if (!error)
                        setError(null); // Clear error only if controls fetch succeeds and no user error exists
                    return [3 /*break*/, 6];
                case 4:
                    e_1 = _a.sent();
                    console.error("Failed to fetch assigned controls:", e_1);
                    if (e_1 instanceof Error) {
                        setError("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0636\u0648\u0627\u0628\u0637 \u0627\u0644\u0645\u0639\u064A\u0646\u0629: ".concat(e_1.message));
                    }
                    else {
                        setError("فشل في جلب الضوابط المعينة بسبب خطأ غير معروف.");
                    }
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoadingControls(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [currentUser, isLoadingUser, error]); // Depend on user, loading status, and error
    useEffect(function () {
        fetchAssignedControls();
    }, [fetchAssignedControls]); // Run when fetchAssignedControls changes
    // Helper function to format date (copied from department-manager)
    var formatDate = function (dateString) {
        if (!dateString)
            return 'غير محدد';
        try {
            return new Date(dateString).toLocaleDateString('ar-SA', {
                year: 'numeric', month: 'long', day: 'numeric',
            });
        }
        catch (e) {
            return 'تاريخ غير صالح';
        }
    };
    // Helper to map status to Badge variant and style (copied from department-manager)
    // Explicitly type the return value
    var getStatusBadgeProps = function (status) {
        switch (status) {
            case 'COMPLETED': return { variant: 'default', className: 'bg-green-100 text-green-700' };
            case 'PENDING': return { variant: 'default', className: 'bg-yellow-100 text-yellow-700' };
            case 'IN_PROGRESS': return { variant: 'default', className: 'bg-blue-100 text-blue-700' };
            case 'OVERDUE': return { variant: 'default', className: 'bg-red-100 text-red-700' };
            default: return { variant: 'secondary', className: 'bg-gray-100 text-gray-700' };
        }
    };
    // --- Modal Handling ---
    // Function to open the details modal and populate form data
    var handleOpenDetailsModal = function (assignment) {
        var _a, _b, _c;
        setSelectedAssignment(assignment);
        // Populate form state from the selected assignment's data
        setModalFormData({
            notes: (_a = assignment.notes) !== null && _a !== void 0 ? _a : "",
            correctiveActions: (_b = assignment.correctiveActions) !== null && _b !== void 0 ? _b : "",
            // Ensure expectedComplianceDate is a Date object or undefined
            expectedComplianceDate: assignment.expectedComplianceDate ? new Date(assignment.expectedComplianceDate) : undefined,
            complianceLevel: (_c = assignment.complianceLevel) !== null && _c !== void 0 ? _c : "",
        });
        setIsDetailsModalOpen(true);
    };
    // Generic handler for text input changes in the modal
    var handleModalInputChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setModalFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    // Handler for date changes
    var handleModalDateChange = function (date) {
        setModalFormData(function (prev) { return (__assign(__assign({}, prev), { expectedComplianceDate: date })); });
    };
    // Handler for select changes (Compliance Level)
    var handleModalSelectChange = function (value) {
        // Ensure the value is a valid ComplianceLevel or reset to ""
        var level = Object.values(ComplianceLevel).includes(value)
            ? value
            : "";
        setModalFormData(function (prev) { return (__assign(__assign({}, prev), { complianceLevel: level })); });
    };
    // Placeholder for saving data
    var handleSaveDetails = function () { return __awaiter(_this, void 0, void 0, function () {
        var payload, response, errorData, err_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!selectedAssignment)
                        return [2 /*return*/];
                    setIsSaving(true);
                    setError(null); // Clear previous errors
                    console.log("Saving data for assignment:", selectedAssignment.id);
                    console.log("Form data:", modalFormData);
                    payload = __assign(__assign({}, modalFormData), { 
                        // Send date as ISO string if it exists, otherwise null
                        expectedComplianceDate: (_b = (_a = modalFormData.expectedComplianceDate) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null, 
                        // Send complianceLevel or null if it's an empty string
                        complianceLevel: modalFormData.complianceLevel === "" ? null : modalFormData.complianceLevel });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, fetch("/api/control-assignments/".concat(selectedAssignment.id), {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                        })];
                case 2:
                    response = _c.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _c.sent();
                    throw new Error(errorData.message || "Failed to save details: ".concat(response.statusText));
                case 4:
                    // --- Optimistic Update ---
                    // Update the local state immediately on success
                    setAssignedControls(function (prevControls) {
                        return prevControls.map(function (control) {
                            return control.id === selectedAssignment.id
                                ? __assign(__assign(__assign({}, control), payload), { expectedComplianceDate: modalFormData.expectedComplianceDate }) : control;
                        });
                    });
                    // --- End Optimistic Update ---
                    setIsDetailsModalOpen(false); // Close modal on success
                    return [3 /*break*/, 7];
                case 5:
                    err_2 = _c.sent();
                    console.error("Error saving details:", err_2);
                    setError(err_2.message || "Failed to save compliance details.");
                    return [3 /*break*/, 7];
                case 6:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="w-full bg-slate-900 text-white py-3 px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and Title - Right Side */}
          <div className="flex items-center gap-2 font-bold text-sm md:text-base lg:text-lg">
            <div className="relative h-16 w-16">
              <Image src="/static/image/logo.png" width={160} height={160} alt="Logo" className="object-contain"/>
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
            <Link href="/user-dashboard" className="text-white bg-nca-teal px-3 py-2 rounded">
              لوحة المستخدم
            </Link>
          </nav>

          {/* User Profile and Bell - Left Side */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="icon" className="text-white">
              <Bell className="h-5 w-5"/>
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <User className="h-5 w-5"/>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Display General Errors */}
          {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">خطأ! </strong>
              <span className="block sm:inline">{error}</span>
            </div>)}

          <div className="flex justify-between items-center mb-6">
            {/* Dynamically display user name */}
            <h1 className="text-2xl font-bold text-slate-800">
              لوحة المستخدم {currentUser ? "- ".concat(currentUser.nameAr || currentUser.name) : ''}
              {isLoadingUser && ' (جاري التحميل...)'}
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                <Input placeholder="بحث..." className="pl-4 pr-10 w-64 text-right" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
              </div>
            </div>
          </div>

          {/* Stats Cards - Updated counts based on fetched assignedControls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{isLoadingControls ? '...' : assignedControls.length}</div>
                <ClipboardList className="h-6 w-6 text-nca-teal"/>
              </div>
              <div className="text-sm text-gray-600 mt-2">الضوابط المعينة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                {/* Calculated completed count */}
                <div className="text-3xl font-bold">{isLoadingControls ? '...' : assignedControls.filter(function (c) { return c.status === 'COMPLETED'; }).length}</div>
                <CheckCircle className="h-6 w-6 text-green-500"/>
              </div>
              <div className="text-sm text-gray-600 mt-2">الضوابط المكتملة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                 {/* Calculated pending/in-progress count */}
                <div className="text-3xl font-bold">{isLoadingControls ? '...' : assignedControls.filter(function (c) { return c.status === 'PENDING' || c.status === 'IN_PROGRESS'; }).length}</div>
                <Clock className="h-6 w-6 text-yellow-500"/>
              </div>
              <div className="text-sm text-gray-600 mt-2">الضوابط المعلقة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                 {/* Calculated overdue count */}
                <div className="text-3xl font-bold">{isLoadingControls ? '...' : assignedControls.filter(function (c) { return c.status === 'OVERDUE'; }).length}</div>
                <AlertTriangle className="h-6 w-6 text-red-500"/>
              </div>
              <div className="text-sm text-gray-600 mt-2">ضوابط متأخرة</div>
            </Card>
          </div>

          {/* My Tasks Section - Updated to show assigned controls */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">الضوابط المعينة لي</h2>
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
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-right border-b border-gray-200">
                    {/* Updated Headers */}
                    <th className="pb-3 font-medium text-gray-700 pr-4">الضابط</th>
                    <th className="pb-3 font-medium text-gray-700">النظام</th>
                    <th className="pb-3 font-medium text-gray-700">الموعد النهائي للمهمة</th>
                    <th className="pb-3 font-medium text-gray-700">حالة الضابط</th>
                    <th className="pb-3 font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingControls ? (<tr><td colSpan={5} className="text-center py-4"><RefreshCw className="h-6 w-6 animate-spin inline-block mr-2"/> جاري تحميل الضوابط...</td></tr>) : assignedControls.length === 0 ? (<tr><td colSpan={5} className="text-center py-4">لا توجد ضوابط معينة لك حاليًا.</td></tr>) : (assignedControls.map(function (assignment) {
            var _a;
            return (<tr key={assignment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 pr-4" title={assignment.control.controlText}>
                          {assignment.control.controlNumber}
                        </td>
                        <td className="py-4">{((_a = assignment.task.sensitiveSystem) === null || _a === void 0 ? void 0 : _a.systemName) || 'غير محدد'}</td>
                        <td className="py-4">{formatDate(assignment.task.deadline)}</td>
                        <td className="py-4">
                          <Badge {...getStatusBadgeProps(assignment.status)}>
                            {assignment.status} {/* TODO: Translate status */}
                          </Badge>
                        </td>
                        <td className="py-4">
                          {/* Updated button to open modal */}
                          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900" onClick={function () { return handleOpenDetailsModal(assignment); }} // Pass assignment data
            >
                            عرض التفاصيل
                          </Button>
                        </td>
                      </tr>);
        }))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Task */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">المهمة الحالية</h2>
              <div className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">تقديم أدلة الامتثال لضوابط التشفير</h3>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">متأخر</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  يجب تقديم الأدلة التي تثبت تطبيق ضوابط التشفير على البيانات الحساسة أثناء النقل والتخزين وفقاً للضابط 2-7-1 من ضوابط الأمن السيبراني للأنظمة الحساسة.
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">التقييم: تقييم ضوابط الأمن السيبراني - Q1</span>
                  <span className="text-sm text-gray-500">الموعد النهائي: 10 مارس 2025</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">المتطلبات:</h4>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>تقديم سياسة التشفير المعتمدة</li>
                    <li>تقديم إثبات تطبيق التشفير للبيانات أثناء النقل</li>
                    <li>تقديم إثبات تطبيق التشفير للبيانات أثناء التخزين</li>
                    <li>تقديم قائمة بخوارزميات التشفير المستخدمة</li>
                  </ul>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">رفع الأدلة</h3>
                <div className="space-y-3">
                  <div className="border border-dashed rounded-lg p-6 text-center">
                    <div className="flex justify-center mb-2">
                      <Upload className="h-8 w-8 text-gray-400"/>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">اسحب الملفات هنا أو انقر للاختيار</p>
                    <Button variant="outline" size="sm" className="text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                      اختيار الملفات
                    </Button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">ملاحظات</label>
                    <textarea className="w-full p-2 border rounded-md text-right h-24 resize-none"></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button className="bg-nca-teal text-white hover:bg-nca-teal-dark">
                      تقديم المهمة
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Upcoming Tasks */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">المهام القادمة</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">تحديث سياسات كلمات المرور</span>
                    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm">قيد التنفيذ</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">تحديث سياسات كلمات المرور وفقاً للضوابط الجديدة</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">تقييم ضوابط الأمن السيبراني - Q1</span>
                    <span className="text-xs text-gray-500">الموعد النهائي: 20 مارس 2025</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">مراجعة إعدادات جدار الحماية</span>
                    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm">قيد التنفيذ</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">مراجعة وتحديث إعدادات جدار الحماية وفقاً للضوابط</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">تقييم أمن الشبكات</span>
                    <span className="text-xs text-gray-500">الموعد النهائي: 5 أبريل 2025</span>
                  </div>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold mb-4 mt-6">المهام المكتملة</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">تحديث خطة التعافي من الكوارث</span>
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">مكتمل</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">تحديث وتوثيق خطة التعافي من الكوارث</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">تقييم ضوابط الأمن السيبراني - Q1</span>
                    <span className="text-xs text-gray-500">تاريخ الإكمال: 8 فبراير 2025</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">تنفيذ اختبار الاختراق</span>
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">مكتمل</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">تنفيذ اختبار اختراق للأنظمة وتوثيق النتائج</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">تقييم أمن التطبيقات</span>
                    <span className="text-xs text-gray-500">تاريخ الإكمال: 12 فبراير 2025</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Compliance Assistant */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">مساعد الامتثال</h2>
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-700">كيف يمكنني مساعدتك في مهامك اليوم؟</h3>
            </div>
            <div className="flex gap-2">
              <Input placeholder="اكتب سؤالك..." className="text-right"/>
              <Button size="icon" className="bg-nca-teal hover:bg-nca-teal-dark">
                <Send className="h-4 w-4"/>
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">ما هي متطلبات ضوابط التشفير للبيانات الحساسة؟</p>
              </div>
              <div className="p-3 bg-nca-teal bg-opacity-10 rounded-lg">
                <p className="text-sm text-gray-700">
                  وفقاً للضابط 2-7-1 من ضوابط الأمن السيبراني للأنظمة الحساسة، يجب تشفير جميع البيانات الحساسة أثناء النقل والتخزين. يتطلب ذلك استخدام خوارزميات تشفير قوية ومعتمدة، وإدارة آمنة لمفاتيح التشفير، وتوثيق سياسات وإجراءات التشفير.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Details Modal */}
      {/* Pass isDatePickerOpen state to inert attribute */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px] text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الضابط: {(_a = selectedAssignment === null || selectedAssignment === void 0 ? void 0 : selectedAssignment.control) === null || _a === void 0 ? void 0 : _a.controlNumber}</DialogTitle>
            <DialogDescription>
              {(_b = selectedAssignment === null || selectedAssignment === void 0 ? void 0 : selectedAssignment.control) === null || _b === void 0 ? void 0 : _b.controlText}
            </DialogDescription>
          </DialogHeader>
          {/* Display Error within Modal */}
          {error && isDetailsModalOpen && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
               <strong className="font-bold">خطأ! </strong>
               <span className="block sm:inline">{error}</span>
             </div>)}
          <div className="grid gap-4 py-4">
            {/* Notes */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right col-span-1">
                الملاحظات
              </Label>
              <Textarea id="notes" name="notes" value={modalFormData.notes} onChange={handleModalInputChange} className="col-span-3 h-24" placeholder="أضف ملاحظاتك هنا..."/>
            </div>
            {/* Corrective Actions */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="correctiveActions" className="text-right col-span-1">
                إجراءات التصحيح
              </Label>
              <Textarea id="correctiveActions" name="correctiveActions" value={modalFormData.correctiveActions} onChange={handleModalInputChange} className="col-span-3 h-24" placeholder="صف الإجراءات التصحيحية المتخذة أو المخطط لها..."/>
            </div>
            {/* Expected Compliance Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expectedComplianceDate" className="text-right col-span-1">
                تاريخ الالتزام المتوقع
               </Label>
               {/* Control the Popover open state */}
               <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen} modal={false}>
                 <PopoverTrigger asChild>
                   <Button variant={"outline"} className={cn("col-span-3 justify-start text-right font-normal", !modalFormData.expectedComplianceDate && "text-muted-foreground")}>
                    <CalendarIcon className="ml-2 h-4 w-4"/>
                    {modalFormData.expectedComplianceDate ? (format(modalFormData.expectedComplianceDate, "PPP")) : (<span>اختر تاريخًا</span>)}
                  </Button>
                </PopoverTrigger>
                {/* Stop propagation inside PopoverContent - Removed stopPropagation */}
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={modalFormData.expectedComplianceDate} onSelect={handleModalDateChange} initialFocus/>
                </PopoverContent>
              </Popover>
            </div>
            {/* Compliance Level */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="complianceLevel" className="text-right col-span-1">
                مستوى الالتزام
              </Label>
              <Select value={modalFormData.complianceLevel} onValueChange={handleModalSelectChange} dir="rtl">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر مستوى..."/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ComplianceLevel.NOT_IMPLEMENTED}>غير مطبق - Not Implemented</SelectItem>
                  <SelectItem value={ComplianceLevel.PARTIALLY_IMPLEMENTED}>مطبق جزئيًا - Partially Implemented</SelectItem>
                  <SelectItem value={ComplianceLevel.IMPLEMENTED}>مطبق كليًا - Implemented</SelectItem>
                  <SelectItem value={ComplianceLevel.NOT_APPLICABLE}>لا ينطبق - Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={function () { return setIsDetailsModalOpen(false); }} disabled={isSaving}>
              إلغاء
            </Button>
            <Button onClick={handleSaveDetails} disabled={isSaving}>
              {isSaving ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin"/> جاري الحفظ...</> : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);
}
