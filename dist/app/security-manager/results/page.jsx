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
var _a, _b;
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Bell, User as UserIcon, Menu, LayoutDashboard, Server, BarChart } from "lucide-react"; // Removed ShieldCheck, Building, ListChecks, FileWarning, FileText
// Dynamically import ApexCharts to avoid SSR issues
var Chart = dynamic(function () { return import('react-apexcharts'); }, { ssr: false });
// Define ComplianceLevel Enum based on Prisma schema
var ComplianceLevel;
(function (ComplianceLevel) {
    ComplianceLevel["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
    ComplianceLevel["PARTIALLY_IMPLEMENTED"] = "PARTIALLY_IMPLEMENTED";
    ComplianceLevel["IMPLEMENTED"] = "IMPLEMENTED";
    ComplianceLevel["NOT_APPLICABLE"] = "NOT_APPLICABLE";
})(ComplianceLevel || (ComplianceLevel = {}));
// Mapping for display names (Arabic)
var complianceLevelLabels = (_a = {},
    _a[ComplianceLevel.NOT_IMPLEMENTED] = "غير مطبق",
    _a[ComplianceLevel.PARTIALLY_IMPLEMENTED] = "مطبق جزئيًا",
    _a[ComplianceLevel.IMPLEMENTED] = "مطبق كليًا",
    _a[ComplianceLevel.NOT_APPLICABLE] = "لا ينطبق",
    _a);
// Define colors for consistency (adjust as needed)
var complianceLevelColors = (_b = {},
    _b[ComplianceLevel.NOT_IMPLEMENTED] = '#EF4444',
    _b[ComplianceLevel.PARTIALLY_IMPLEMENTED] = '#F59E0B',
    _b[ComplianceLevel.IMPLEMENTED] = '#10B981',
    _b[ComplianceLevel.NOT_APPLICABLE] = '#6B7280',
    _b);
// Order for displaying levels in charts/legends
var complianceLevelOrder = [
    ComplianceLevel.IMPLEMENTED,
    ComplianceLevel.PARTIALLY_IMPLEMENTED,
    ComplianceLevel.NOT_IMPLEMENTED,
    ComplianceLevel.NOT_APPLICABLE,
];
// --- Component ---
export default function SecurityManagerResultsPage() {
    var _this = this;
    // State for layout
    var _a = useState(true), isSidebarOpen = _a[0], setIsSidebarOpen = _a[1];
    // State for analytics data
    var _b = useState(null), userId = _b[0], setUserId = _b[1];
    var _c = useState(null), analyticsData = _c[0], setAnalyticsData = _c[1];
    var _d = useState(true), isLoading = _d[0], setIsLoading = _d[1];
    var _e = useState(null), error = _e[0], setError = _e[1];
    // --- User ID Fetch (Common logic) ---
    useEffect(function () {
        var fetchUserId = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, managers, err_1, errorMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Reset loading/error states related to analytics when user ID fetch starts
                        setIsLoading(true);
                        setError(null);
                        setAnalyticsData(null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch('/api/users/security-managers')];
                    case 2:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error('Failed to fetch security managers');
                        return [4 /*yield*/, response.json()];
                    case 3:
                        managers = _a.sent();
                        if (managers.length > 0) {
                            setUserId(managers[0].id);
                            // Keep setIsLoading(true) here, data fetching starts in the next effect
                        }
                        else {
                            setError("No Security Manager user found.");
                            setIsLoading(false); // Stop loading if no user found
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        console.error("Error fetching user ID:", err_1);
                        errorMsg = err_1 instanceof Error ? err_1.message : "Failed to get user ID";
                        setError(errorMsg);
                        setIsLoading(false); // Stop loading on error
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        fetchUserId();
    }, []);
    // --- End User ID Fetch ---
    // --- Analytics Data Fetch and Processing ---
    useEffect(function () {
        if (!userId) {
            // If userId is null (either initially or after failed fetch), don't attempt to fetch data
            if (!isLoading && !error) { // Only set loading false if it wasn't already set by error/no user
                // This case might not be strictly necessary if the initial state handles it
            }
            return;
        }
        var fetchAnalyticsData = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, errorData, rawAssignments, processedData_1, err_2, errorMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // setIsLoading(true); // Already set true by userId fetch or initial state
                        setError(null);
                        setAnalyticsData(null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, 7, 8]);
                        return [4 /*yield*/, fetch("/api/control-assignments/analytics?securityManagerId=".concat(userId))];
                    case 2:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.json()];
                    case 3:
                        errorData = _a.sent();
                        throw new Error(errorData.message || "Failed to fetch analytics data: ".concat(response.statusText));
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        rawAssignments = _a.sent();
                        processedData_1 = {};
                        rawAssignments.forEach(function (assignment) {
                            var _a, _b;
                            var component = assignment.control.mainComponent;
                            var level = assignment.complianceLevel;
                            if (!component)
                                return;
                            if (!processedData_1[component]) {
                                processedData_1[component] = {
                                    total: 0,
                                    levels: (_a = {}, _a[ComplianceLevel.NOT_IMPLEMENTED] = 0, _a[ComplianceLevel.PARTIALLY_IMPLEMENTED] = 0, _a[ComplianceLevel.IMPLEMENTED] = 0, _a[ComplianceLevel.NOT_APPLICABLE] = 0, _a),
                                    percentages: (_b = {}, _b[ComplianceLevel.NOT_IMPLEMENTED] = 0, _b[ComplianceLevel.PARTIALLY_IMPLEMENTED] = 0, _b[ComplianceLevel.IMPLEMENTED] = 0, _b[ComplianceLevel.NOT_APPLICABLE] = 0, _b)
                                };
                            }
                            processedData_1[component].total++;
                            if (level && complianceLevelLabels[level]) {
                                processedData_1[component].levels[level]++;
                            }
                        });
                        // Calculate percentages
                        Object.keys(processedData_1).forEach(function (component) {
                            var componentData = processedData_1[component];
                            if (componentData.total > 0) {
                                complianceLevelOrder.forEach(function (level) {
                                    componentData.percentages[level] = parseFloat(((componentData.levels[level] / componentData.total) * 100).toFixed(1));
                                });
                            }
                        });
                        setAnalyticsData(processedData_1);
                        return [3 /*break*/, 8];
                    case 6:
                        err_2 = _a.sent();
                        console.error("Error fetching or processing analytics data:", err_2);
                        errorMsg = err_2 instanceof Error ? err_2.message : "An unknown error occurred.";
                        setError(errorMsg);
                        return [3 /*break*/, 8];
                    case 7:
                        setIsLoading(false); // Stop loading after fetch attempt (success or fail)
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        }); };
        fetchAnalyticsData();
    }, [userId, error, isLoading]); // Added error and isLoading to dependencies
    // --- End Analytics Data Fetch ---
    // --- Chart Options ---
    var mainComponents = analyticsData ? Object.keys(analyticsData).sort() : [];
    var stackedBarSeries = analyticsData ? complianceLevelOrder.map(function (level) { return ({
        name: complianceLevelLabels[level],
        data: mainComponents.map(function (component) { var _a; return ((_a = analyticsData[component]) === null || _a === void 0 ? void 0 : _a.percentages[level]) || 0; })
    }); }) : [];
    var stackedBarOptions = {
        chart: { type: 'bar', stacked: true, stackType: '100%', toolbar: { show: true }, fontFamily: 'inherit' },
        plotOptions: { bar: { horizontal: false } },
        xaxis: { categories: mainComponents, labels: { style: { fontFamily: 'inherit' } } },
        yaxis: { labels: { formatter: function (val) { return "".concat(val.toFixed(0), "%"); }, style: { fontFamily: 'inherit' } } },
        colors: complianceLevelOrder.map(function (level) { return complianceLevelColors[level]; }),
        legend: { position: 'top', horizontalAlign: 'center', fontFamily: 'inherit', markers: { offsetX: 5 } },
        tooltip: { y: { formatter: function (val) { return "".concat(val.toFixed(1), "%"); } }, style: { fontFamily: 'inherit' } },
        dataLabels: { enabled: false },
        grid: { borderColor: '#e7e7e7', row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 } },
    };
    // --- End Chart Options ---
    // --- Render Logic ---
    var renderAnalyticsContent = function () {
        if (isLoading) {
            return (<div className="flex justify-center items-center h-[calc(100vh-200px)]"> {/* Adjusted height */}
          <Loader2 className="h-8 w-8 animate-spin text-nca-teal"/>
          <span className="mr-2">جاري تحميل البيانات...</span> {/* Use mr-2 for RTL */}
        </div>);
        }
        if (error) {
            return (<div className="flex justify-center items-center h-[calc(100vh-200px)] text-red-600"> {/* Adjusted height */}
          <AlertCircle className="h-6 w-6"/>
          <span className="mr-2">خطأ: {error}</span> {/* Use mr-2 for RTL */}
        </div>);
        }
        if (!analyticsData || mainComponents.length === 0) {
            return (<div className="text-center py-10 text-gray-600">
          لا توجد بيانات نتائج لعرضها.
        </div>);
        }
        // Actual chart rendering
        return (<div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">نتائج الامتثال</h1>

        {/* Overall Stacked Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">نظرة عامة على الامتثال حسب المكون الرئيسي</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart options={stackedBarOptions} series={stackedBarSeries} type="bar" height={350} width="100%"/>
          </CardContent>
        </Card>

        {/* Individual Doughnut Charts per Component */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainComponents.map(function (component) {
                var componentData = analyticsData[component];
                if (!componentData)
                    return null;
                var doughnutSeries = complianceLevelOrder.map(function (level) { return componentData.levels[level]; });
                var doughnutLabels = complianceLevelOrder.map(function (level) { return complianceLevelLabels[level]; });
                var doughnutColors = complianceLevelOrder.map(function (level) { return complianceLevelColors[level]; });
                var doughnutOptions = {
                    chart: { type: 'donut', fontFamily: 'inherit' },
                    labels: doughnutLabels,
                    colors: doughnutColors,
                    legend: { position: 'bottom', fontFamily: 'inherit' },
                    tooltip: { y: { formatter: function (val) { return "".concat(val, " (").concat(((val / componentData.total) * 100).toFixed(1), "%)"); } }, style: { fontFamily: 'inherit' } },
                    dataLabels: { enabled: true, formatter: function (val) { return "".concat(parseFloat(val).toFixed(1), "%"); }, style: { fontFamily: 'inherit' } },
                    plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, label: 'الإجمالي', formatter: function () { return componentData.total.toString(); } } } } } },
                    responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
                };
                return (<Card key={component}>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold truncate" title={component}>{component}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart options={doughnutOptions} series={doughnutSeries} type="donut" height={300} width="100%"/>
                </CardContent>
              </Card>);
            })}
        </div>
      </div>);
    };
    return (<div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="w-full bg-slate-900 text-white py-3 px-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 font-bold text-sm md:text-base lg:text-lg">
            <div className="relative h-16 w-16">
              <Image src="/static/image/logo.png" width={160} height={160} alt="Logo" className="object-contain"/>
            </div>
          </div>
          {/* Spacer */}
          <div className="flex-grow"></div>
          {/* User Icons & Toggle */}
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
            {/* Sidebar Links - Copied from dashboard */}
            <Link href="/security-manager" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
              <LayoutDashboard className="h-5 w-5 flex-shrink-0"/>
              <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>لوحة المعلومات</span>
            </Link>
            {/* <Link href="/security-manager#assessments" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
          <ShieldCheck className="h-5 w-5 flex-shrink-0" />
          <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>التقييمات المعينة</span>
        </Link> */}
             <Link href="/security-manager/system-info" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
              <Server className="h-5 w-5 flex-shrink-0"/>
              <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>معلومات الأنظمة</span>
            </Link>
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
            <Link href="/security-manager/results" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
              <BarChart className="h-5 w-5 flex-shrink-0"/>
              <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>النتائج</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className={"flex-1 p-6 overflow-y-auto h-[calc(100vh-76px)] transition-all duration-300 ease-in-out ".concat(isSidebarOpen ? 'md:mr-0' : 'md:mr-20')}>
          {/* Render the analytics content, loading, or error state */}
          {renderAnalyticsContent()}
        </main>
      </div>
    </div>);
}
