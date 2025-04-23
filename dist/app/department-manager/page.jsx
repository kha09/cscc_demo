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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
// Import necessary types AND values from Prisma
import { TaskStatus // Ensure this is a value import
 } from "@prisma/client";
// Keep other type imports if needed using 'import type'
// Example: import type { SomeOtherType } from "@prisma/client";
import { Bell, 
// PlusCircle, // Removed unused import
User as UserIcon, ClipboardList, BarChart, FileText, AlertTriangle, Search, 
// Filter, // Removed unused import
// Download, // Removed unused import
CheckCircle, Users, UserPlus, RefreshCw, ChevronDown, // Added for expanding task details
ChevronUp // Added for collapsing task details
 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Removed unused CardFooter
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Removed Tooltip import as it seems unused and causes errors
import { Badge } from "@/components/ui/badge"; // Added Badge for status
import { Textarea } from "@/components/ui/textarea"; // Added Textarea for notes
import { Label } from "@/components/ui/label"; // Added Label import
import React from "react"; // Import React for Fragment and ChangeEvent
export default function DepartmentManagerDashboardPage() {
    var _this = this;
    var _a, _b;
    var _c = useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    // State now holds tasks assigned to the manager, which contain control assignments
    var _d = useState([]), managerTasks = _d[0], setManagerTasks = _d[1];
    // Separate state for assignments specifically for team members might be useful for the "Team Tasks" view
    // Or we can filter managerTasks.flatMap(t => t.controlAssignments)
    var _e = useState([]), teamMembers = _e[0], setTeamMembers = _e[1];
    var _f = useState([]), availableUsers = _f[0], setAvailableUsers = _f[1];
    var _g = useState(true), isLoadingTasks = _g[0], setIsLoadingTasks = _g[1];
    var _h = useState(true), isLoadingUsers = _h[0], setIsLoadingUsers = _h[1];
    var _j = useState(null), error = _j[0], setError = _j[1];
    var _k = useState(null), currentUser = _k[0], setCurrentUser = _k[1];
    // Ensure all statuses used in handleSaveNotesAndStatus are included here
    var _l = useState({}), assignmentStatus = _l[0], setAssignmentStatus = _l[1];
    var _m = useState(new Set()), expandedTasks = _m[0], setExpandedTasks = _m[1]; // Track expanded tasks
    // State for managing notes and status edits within expanded rows
    var _o = useState({}), editState = _o[0], setEditState = _o[1]; // Allow null notes
    // State for modals
    var _p = useState(false), isDetailsModalOpen = _p[0], setIsDetailsModalOpen = _p[1];
    // Modal now shows details of a Task, focusing on its ControlAssignments
    var selectedTaskForDetailsModal = useState(null)[0]; // Removed unused setter
    var _q = useState(false), isAddUserModalOpen = _q[0], setIsAddUserModalOpen = _q[1];
    // Removed state related to the old incorrect assignment modal
    // --- Toggle Task Expansion ---
    var toggleTaskExpansion = function (taskId) {
        setExpandedTasks(function (prev) {
            var newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            }
            else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };
    // --- Handle Edits in Expanded Row ---
    var handleEditChange = function (assignmentId, field, value) {
        setEditState(function (prev) {
            var _a, _b;
            var _c;
            return (__assign(__assign({}, prev), (_a = {}, _a[assignmentId] = __assign(__assign({}, ((_c = prev[assignmentId]) !== null && _c !== void 0 ? _c : { notes: null, status: TaskStatus.PENDING })), (_b = {}, _b[field] = value, _b)), _a)));
        });
    };
    // --- Save Notes and Status ---
    var handleSaveNotesAndStatus = function (assignmentId) { return __awaiter(_this, void 0, void 0, function () {
        var stateToSave, originalAssignment, notesToSave, statusToSave, response, errorData, updatedAssignment_1, err_1, errorMessage;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    stateToSave = editState[assignmentId];
                    originalAssignment = managerTasks
                        .flatMap(function (task) { return task.controlAssignments; })
                        .find(function (a) { return a.id === assignmentId; });
                    // Only proceed if there's actually a change
                    if (!stateToSave && (!originalAssignment || originalAssignment.notes === null && originalAssignment.status === TaskStatus.PENDING)) {
                        // If nothing in edit state and original is default/null, do nothing
                        return [2 /*return*/];
                    }
                    if (stateToSave && originalAssignment && stateToSave.notes === ((_a = originalAssignment.notes) !== null && _a !== void 0 ? _a : '') && stateToSave.status === originalAssignment.status) {
                        // If edit state matches original state, do nothing
                        return [2 /*return*/];
                    }
                    notesToSave = (_c = (_b = stateToSave === null || stateToSave === void 0 ? void 0 : stateToSave.notes) !== null && _b !== void 0 ? _b : originalAssignment === null || originalAssignment === void 0 ? void 0 : originalAssignment.notes) !== null && _c !== void 0 ? _c : null;
                    statusToSave = (_e = (_d = stateToSave === null || stateToSave === void 0 ? void 0 : stateToSave.status) !== null && _d !== void 0 ? _d : originalAssignment === null || originalAssignment === void 0 ? void 0 : originalAssignment.status) !== null && _e !== void 0 ? _e : TaskStatus.PENDING;
                    setAssignmentStatus(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[assignmentId] = 'saving', _a)));
                    });
                    setError(null);
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch("/api/control-assignments/".concat(assignmentId), {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                notes: notesToSave, // Use potentially updated notes
                                status: statusToSave, // Use potentially updated status
                            }),
                        })];
                case 2:
                    response = _f.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _f.sent();
                    throw new Error(errorData.message || "Failed to save notes/status: ".concat(response.statusText));
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    updatedAssignment_1 = _f.sent();
                    // Update local state (managerTasks)
                    setManagerTasks(function (currentTasks) {
                        return currentTasks.map(function (task) { return (__assign(__assign({}, task), { controlAssignments: task.controlAssignments.map(function (a) {
                                return a.id === assignmentId ? __assign(__assign({}, a), { notes: updatedAssignment_1.notes, status: updatedAssignment_1.status }) : a;
                            }) })); });
                    });
                    // Clear edit state for this assignment
                    setEditState(function (prev) {
                        var newState = __assign({}, prev);
                        delete newState[assignmentId];
                        return newState;
                    });
                    setAssignmentStatus(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[assignmentId] = 'saving-success', _a)));
                    }); // Use specific success status
                    setTimeout(function () { return setAssignmentStatus(function (prev) {
                        var newStatus = __assign({}, prev);
                        delete newStatus[assignmentId];
                        return newStatus;
                    }); }, 3000);
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _f.sent();
                    console.error("Error saving notes/status:", err_1);
                    errorMessage = err_1 instanceof Error ? err_1.message : "An unknown error occurred";
                    setError(errorMessage || "حدث خطأ أثناء حفظ الملاحظات والحالة.");
                    setAssignmentStatus(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[assignmentId] = 'saving-error', _a)));
                    }); // Use specific error status
                    setTimeout(function () { return setAssignmentStatus(function (prev) {
                        var newStatus = __assign({}, prev);
                        delete newStatus[assignmentId];
                        return newStatus;
                    }); }, 5000); // Keep error message longer
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // --- Fetch Current User (Department Manager) ---
    // (This useEffect remains largely the same)
    useEffect(function () {
        var fetchDeptManager = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, users, deptManager, err_2, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoadingUsers(true);
                        setError(null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch('/api/users')];
                    case 2:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch users: ".concat(response.statusText));
                        return [4 /*yield*/, response.json()];
                    case 3:
                        users = _a.sent();
                        deptManager = users.find(function (user) { return user.role === 'DEPARTMENT_MANAGER'; });
                        if (deptManager) {
                            setCurrentUser({
                                id: deptManager.id,
                                name: deptManager.name,
                                nameAr: deptManager.nameAr,
                                email: deptManager.email,
                                role: deptManager.role,
                                department: deptManager.department
                            });
                        }
                        else {
                            setError("Logged-in user is not a Department Manager or user not found.");
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_2 = _a.sent();
                        console.error("Error fetching current user:", err_2);
                        errorMessage = err_2 instanceof Error ? err_2.message : "An unknown error occurred";
                        setError(errorMessage || "Failed to get current user information.");
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        fetchDeptManager();
    }, []);
    // --- Fetch Team Members and Available Users ---
    // (This useCallback remains largely the same)
    var fetchUsers = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var teamResponse, teamData, availableResponse, allUserData, currentTeamMemberIds_1, availableData, err_3, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(currentUser === null || currentUser === void 0 ? void 0 : currentUser.department)) {
                        setIsLoadingUsers(false);
                        return [2 /*return*/];
                    }
                    setIsLoadingUsers(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch("/api/users?department=".concat(currentUser.department, "&role=USER"))];
                case 2:
                    teamResponse = _a.sent();
                    if (!teamResponse.ok)
                        throw new Error("Failed to fetch team members: ".concat(teamResponse.statusText));
                    return [4 /*yield*/, teamResponse.json()];
                case 3:
                    teamData = _a.sent();
                    setTeamMembers(teamData);
                    return [4 /*yield*/, fetch("/api/users?role=USER")];
                case 4:
                    availableResponse = _a.sent();
                    if (!availableResponse.ok)
                        throw new Error("Failed to fetch available users: ".concat(availableResponse.statusText));
                    return [4 /*yield*/, availableResponse.json()];
                case 5:
                    allUserData = _a.sent();
                    currentTeamMemberIds_1 = new Set(teamData.map(function (member) { return member.id; }));
                    availableData = allUserData.filter(function (user) { return !currentTeamMemberIds_1.has(user.id); });
                    setAvailableUsers(availableData);
                    return [3 /*break*/, 8];
                case 6:
                    err_3 = _a.sent();
                    console.error("Error fetching team/available users:", err_3);
                    if (!error) { // Only set error if no other error exists
                        errorMessage = err_3 instanceof Error ? err_3.message : "An unknown error occurred";
                        setError(errorMessage || "Failed to fetch user lists.");
                    }
                    return [3 /*break*/, 8];
                case 7:
                    setIsLoadingUsers(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); }, [currentUser, error]); // Keep dependencies
    useEffect(function () {
        fetchUsers();
    }, [fetchUsers]);
    // --- Fetch Tasks (Assigned to Manager) ---
    // Renamed fetchAllTasks to fetchManagerTasks for clarity
    var fetchManagerTasks = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, tasksData, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(currentUser === null || currentUser === void 0 ? void 0 : currentUser.id)) {
                        if (!isLoadingUsers && !error) {
                            setIsLoadingTasks(false);
                        }
                        return [2 /*return*/];
                    }
                    setIsLoadingTasks(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch("/api/tasks?assignedToId=".concat(currentUser.id), { cache: 'no-store' })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch manager tasks: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    tasksData = _a.sent();
                    // Log the fetched data structure for debugging
                    console.log("Fetched Manager Tasks Data:", JSON.stringify(tasksData, null, 2));
                    setManagerTasks(tasksData);
                    // Clear general error if task fetch succeeds
                    setError(null);
                    return [3 /*break*/, 6];
                case 4:
                    e_1 = _a.sent();
                    console.error("Failed to fetch tasks:", e_1);
                    if (e_1 instanceof Error) {
                        setError("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0645\u0647\u0627\u0645: ".concat(e_1.message));
                    }
                    else {
                        setError("فشل في جلب المهام بسبب خطأ غير معروف.");
                    }
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoadingTasks(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [currentUser, isLoadingUsers, error]); // Added error dependency
    useEffect(function () {
        fetchManagerTasks();
    }, [fetchManagerTasks]); // Run when fetchManagerTasks changes
    // --- Add User to Team ---
    // (This function remains the same)
    var handleAddUserToTeam = function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, err_4, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(currentUser === null || currentUser === void 0 ? void 0 : currentUser.department)) {
                        setError("لا يمكن إضافة المستخدم: لم يتم تحديد قسم المدير.");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch("/api/users/".concat(userId), {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ department: currentUser.department }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.message || "Failed to add user to team: ".concat(response.statusText));
                case 4:
                    fetchUsers();
                    setIsAddUserModalOpen(false);
                    return [3 /*break*/, 6];
                case 5:
                    err_4 = _a.sent();
                    console.error("Error adding user to team:", err_4);
                    errorMessage = err_4 instanceof Error ? err_4.message : "An unknown error occurred";
                    setError(errorMessage || "حدث خطأ أثناء إضافة المستخدم للفريق.");
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // --- Assign Control to User ---
    var handleAssignControl = function (assignmentId, userId) { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, err_5, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setAssignmentStatus(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[assignmentId] = 'loading', _a)));
                    });
                    setError(null); // Clear general errors when attempting assignment
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch("/api/control-assignments/".concat(assignmentId), {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ assignedUserId: userId }), // Send null to unassign
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    // Set the main error state to display the issue
                    setError(errorData.message || "Failed to assign control: ".concat(response.statusText));
                    setAssignmentStatus(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[assignmentId] = 'error', _a)));
                    }); // Also set specific assignment status to error
                    return [2 /*return*/]; // Stop execution if the API call failed
                case 4:
                    // If response is OK (status 2xx)
                    // --- START: Local State Update ---
                    // Update the local state optimistically instead of refetching
                    setManagerTasks(function (currentTasks) {
                        return currentTasks.map(function (task) {
                            var _a;
                            // Find the task containing the assignment
                            var assignmentIndex = task.controlAssignments.findIndex(function (a) { return a.id === assignmentId; });
                            if (assignmentIndex === -1) {
                                return task; // Not the task we're looking for
                            }
                            // Create a new assignment object with the updated user ID
                            var updatedAssignment = __assign(__assign({}, task.controlAssignments[assignmentIndex]), { assignedUserId: userId, 
                                // Find the user object from teamMembers to update assignedUser (important for display)
                                assignedUser: userId ? (_a = teamMembers.find(function (u) { return u.id === userId; })) !== null && _a !== void 0 ? _a : null : null });
                            // Create a new assignments array for the task
                            var newAssignments = __spreadArray(__spreadArray(__spreadArray([], task.controlAssignments.slice(0, assignmentIndex), true), [
                                updatedAssignment
                            ], false), task.controlAssignments.slice(assignmentIndex + 1), true);
                            // Return a new task object with the updated assignments
                            return __assign(__assign({}, task), { controlAssignments: newAssignments });
                        });
                    });
                    // --- END: Local State Update ---
                    setAssignmentStatus(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[assignmentId] = 'success', _a)));
                    });
                    // Optional: Clear success status after a few seconds
                    setTimeout(function () { return setAssignmentStatus(function (prev) {
                        var newStatus = __assign({}, prev);
                        delete newStatus[assignmentId]; // Remove the status entry
                        return newStatus;
                    }); }, 3000);
                    return [3 /*break*/, 6];
                case 5:
                    err_5 = _a.sent();
                    console.error("Error assigning control:", err_5);
                    errorMessage = err_5 instanceof Error ? err_5.message : "An unknown error occurred";
                    setError(errorMessage || "حدث خطأ أثناء تعيين الضابط.");
                    setAssignmentStatus(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[assignmentId] = 'error', _a)));
                    });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Helper function to format date
    // (This function remains the same)
    var formatDate = function (dateString) {
        if (!dateString)
            return 'غير محدد';
        try {
            return new Date(dateString).toLocaleDateString('ar-SA', {
                year: 'numeric', month: 'long', day: 'numeric',
            });
        }
        catch (_a) {
            return 'تاريخ غير صالح';
        } // Removed unused _e variable
    };
    // Function to open the details modal (now shows Task details with assignments)
    // const handleOpenDetailsModal = (task: FrontendTask) => {
    //   setSelectedTaskForDetailsModal(task);
    //   setIsDetailsModalOpen(true);
    // };
    // Removed handleOpenAssignTaskModal
    // --- Render Logic ---
    // Removed duplicate function declarations from here
    var renderUserList = function (users, actionButton) {
        if (isLoadingUsers)
            return <p>جاري تحميل المستخدمين...</p>;
        if (!users || users.length === 0)
            return <p>لا يوجد مستخدمون لعرضهم.</p>;
        return users.map(function (user) {
            var _a, _b;
            return ( // Renamed parameter to avoid conflict with outer scope if needed, though '_' prefix handles linting
            <div key={user.id} className="flex justify-between items-center p-3 border rounded-lg mb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-nca-teal text-white flex items-center justify-center mr-3 ml-3">
            {/* Simple initials placeholder */}
            <span>{((_a = user.nameAr) === null || _a === void 0 ? void 0 : _a.substring(0, 2)) || ((_b = user.name) === null || _b === void 0 ? void 0 : _b.substring(0, 2)) || '؟'}</span>
          </div>
          <div>
            <p className="font-medium">{user.nameAr || user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        {actionButton && actionButton(user)}
      </div>);
        });
    };
    return (<div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="w-full bg-slate-900 text-white py-3 px-6 sticky top-0 z-10">
        {/* ... (header content remains the same) ... */}
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
             <Link href="/department-manager" className="text-white bg-nca-teal px-3 py-2 rounded">
               مدير القسم
             </Link>
           </nav>

           {/* User Profile and Bell - Left Side */}
           <div className="flex items-center space-x-4 space-x-reverse">
             <Button variant="ghost" size="icon" className="text-white">
               <Bell className="h-5 w-5"/>
             </Button>
             <Button variant="ghost" size="icon" className="text-white">
               <UserIcon className="h-5 w-5"/> {/* Use the aliased icon */}
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
            {/* Dynamically display department name */}
            <h1 className="text-2xl font-bold text-slate-800">
              لوحة مدير القسم {(currentUser === null || currentUser === void 0 ? void 0 : currentUser.department) ? "- ".concat(currentUser.department) : ''}
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                <Input placeholder="بحث..." className="pl-4 pr-10 w-64 text-right" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
              </div>
            </div>
          </div>

          {/* Stats Cards - Update Team Members count */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* ... other cards ... */}
             <Card className="p-6">
               <div className="flex justify-between items-center">
                 <div className="text-3xl font-bold">8</div> {/* Placeholder */}
                 <ClipboardList className="h-6 w-6 text-nca-teal"/>
               </div>
               <div className="text-sm text-gray-600 mt-2">التقييمات النشطة</div>
             </Card>

             <Card className="p-6">
               <div className="flex justify-between items-center">
                 <div className="text-3xl font-bold">68%</div> {/* Placeholder */}
                 <BarChart className="h-6 w-6 text-nca-teal"/>
               </div>
               <div className="text-sm text-gray-600 mt-2">متوسط نسبة الامتثال</div>
             </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{isLoadingUsers ? '...' : teamMembers.length}</div>
                <Users className="h-6 w-6 text-nca-teal"/>
              </div>
              <div className="text-sm text-gray-600 mt-2">أعضاء الفريق</div>
            </Card>

             <Card className="p-6">
               <div className="flex justify-between items-center">
                 <div className="text-3xl font-bold">7</div> {/* Placeholder */}
                 <AlertTriangle className="h-6 w-6 text-yellow-500"/>
               </div>
               <div className="text-sm text-gray-600 mt-2">مهام معلقة</div>
             </Card>
            {/* ... other cards ... */}
          </div>

          {/* Tasks Assigned TO MANAGER Section */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">المهام المعينة لك ({(currentUser === null || currentUser === void 0 ? void 0 : currentUser.nameAr) || (currentUser === null || currentUser === void 0 ? void 0 : currentUser.name)})</h2>
              {/* ... (filter/export buttons) ... */}
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
                    <th className="pb-3 font-medium text-gray-700 pl-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingTasks ? (<tr><td colSpan={7} className="text-center py-4">جاري تحميل المهام...</td></tr> // Updated colSpan
        ) : managerTasks.length === 0 ? ( // Use managerTasks
        <tr><td colSpan={7} className="text-center py-4">لا توجد مهام معينة لك.</td></tr> // Updated colSpan
        ) : (managerTasks.map(function (task) {
            var _a, _b, _c, _d, _e;
            return ( // Use managerTasks and add type
            <React.Fragment key={task.id}>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 pr-4">{((_b = (_a = task.sensitiveSystem) === null || _a === void 0 ? void 0 : _a.assessment) === null || _b === void 0 ? void 0 : _b.assessmentName) || 'غير محدد'}</td> {/* Added Cell */}
                        <td className="py-4">{((_c = task.sensitiveSystem) === null || _c === void 0 ? void 0 : _c.systemName) || 'غير محدد'}</td>
                        {/* Display count of controls instead of list */}
                        <td className="py-4">
                          {(_e = (_d = task.controlAssignments) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0} ضوابط
                        </td>
                        <td className="py-4">{formatDate(task.deadline)}</td>
                        <td className="py-4">
                          {/* Use Badge component for status */}
                          <Badge variant={task.status === 'COMPLETED' ? 'default' : task.status === 'PENDING' ? 'default' : 'secondary'} className={task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
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
                              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "0%" }}></div>
                            </div>
                            <span className="text-sm">0%</span> {/* Placeholder */}
                          </div>
                        </td>
                        {/* Actions Column */}
                        <td className="py-4 pl-4 space-x-2">
                           {/* Expand/Collapse Button */}
                           <Button variant="ghost" size="icon" onClick={function () { return toggleTaskExpansion(task.id); }} className="text-slate-600 hover:text-slate-900">
                             {expandedTasks.has(task.id) ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
                           </Button>
                           {/* Details Button (Optional - can be removed if details are shown inline) */}
                           {/* <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900" onClick={() => handleOpenDetailsModal(task)}>
                  عرض التفاصيل
                </Button> */}
                         </td>
                       </tr>
                       {/* Expanded Row for Control Assignments */}
                       {expandedTasks.has(task.id) && (<tr className="bg-gray-50 border-b border-gray-200">
                           <td colSpan={7} className="p-4"> {/* Updated colSpan */}
                             <h4 className="font-semibold mb-2 text-sm">تعيين الضوابط:</h4>
                             <div className="space-y-3">
                               {task.controlAssignments.length > 0 ? (task.controlAssignments.map(function (assignment) {
                        var _a, _b, _c, _d, _e, _f;
                        return ( // Add type
                        <div key={assignment.id} className="p-3 border rounded-md bg-white"> {/* Main container for each assignment */}
                                     {/* Top section: Info and User Assignment */}
                                     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                                       <div className="flex-1 mb-2 sm:mb-0 sm:mr-4">
                                         <p className="font-medium text-sm" title={assignment.control.controlText}>
                                           {assignment.control.controlNumber} - {assignment.control.controlText}
                                         </p>
                                         <Badge variant={assignment.status === 'COMPLETED' ? 'default' : assignment.status === 'PENDING' ? 'default' : 'secondary'} className={"mt-1 ".concat(assignment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                assignment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    assignment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                        assignment.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-700')}>
                                           {assignment.status} {/* TODO: Translate status */}
                                         </Badge>
                                       </div>
                                       <div className="w-full sm:w-auto flex items-center space-x-2 space-x-reverse">
                                         <Select dir="rtl" value={(_a = assignment.assignedUserId) !== null && _a !== void 0 ? _a : "UNASSIGNED"} onValueChange={function (value) { return handleAssignControl(assignment.id, value === "UNASSIGNED" ? null : value); }} disabled={assignmentStatus[assignment.id] === 'loading'}>
                                          <SelectTrigger className="w-full sm:w-[200px] text-right">
                                            <SelectValue placeholder="اختر مستخدم..."/>
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="UNASSIGNED">-- غير معين --</SelectItem>
                                            {teamMembers.map(function (user) { return (<SelectItem key={user.id} value={user.id}>
                                                {user.nameAr || user.name}
                                              </SelectItem>); })}
                                          </SelectContent>
                                        </Select>
                                        {assignmentStatus[assignment.id] === 'loading' && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground"/>}
                                        {assignmentStatus[assignment.id] === 'success' && <CheckCircle className="h-4 w-4 text-green-500"/>}
                                        {assignmentStatus[assignment.id] === 'error' && <AlertTriangle className="h-4 w-4 text-red-500"/>}
                                      </div>
                                    </div>
                                    {/* Bottom section: Notes and Status Update */}
                                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                                      <Label htmlFor={"notes-".concat(assignment.id)} className="text-xs font-medium text-gray-600">الملاحظات:</Label>
                                      <Textarea id={"notes-".concat(assignment.id)} value={(_d = (_c = (_b = editState[assignment.id]) === null || _b === void 0 ? void 0 : _b.notes) !== null && _c !== void 0 ? _c : assignment.notes) !== null && _d !== void 0 ? _d : ''} onChange={function (e) { return handleEditChange(assignment.id, 'notes', e.target.value); }} placeholder="أضف ملاحظات للمستخدم هنا..." className="text-sm min-h-[60px]" dir="rtl"/>
                                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                        <div className="w-full sm:w-auto flex-grow">
                                          <Label htmlFor={"status-".concat(assignment.id)} className="text-xs font-medium text-gray-600">تغيير الحالة:</Label>
                                          <Select dir="rtl" value={(_f = (_e = editState[assignment.id]) === null || _e === void 0 ? void 0 : _e.status) !== null && _f !== void 0 ? _f : assignment.status} onValueChange={function (value) { return handleEditChange(assignment.id, 'status', value); }}>
                                            <SelectTrigger id={"status-".concat(assignment.id)} className="w-full text-right text-sm">
                                              <SelectValue placeholder="اختر الحالة..."/>
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value={TaskStatus.PENDING}>قيد الانتظار</SelectItem>
                                              <SelectItem value={TaskStatus.IN_PROGRESS}>قيد التنفيذ</SelectItem>
                                              <SelectItem value={TaskStatus.COMPLETED}>مكتمل (للمراجعة)</SelectItem>
                                              <SelectItem value={TaskStatus.APPROVED}>مقبول</SelectItem>
                                              <SelectItem value={TaskStatus.REJECTED}>مرفوض</SelectItem>
                                              <SelectItem value={TaskStatus.OVERDUE}>متأخر</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <Button size="sm" onClick={function () { return handleSaveNotesAndStatus(assignment.id); }} disabled={assignmentStatus[assignment.id] === 'saving'} className="mt-2 sm:mt-0 sm:self-end bg-nca-teal hover:bg-nca-teal-dark text-white">
                                          {assignmentStatus[assignment.id] === 'saving' ? <RefreshCw className="h-4 w-4 animate-spin mr-2"/> : null}
                                          حفظ الملاحظة والحالة
                                        </Button>
                                      </div>
                                      {/* Save Status indicators */}
                                      <div className="h-4 mt-1"> {/* Placeholder for spacing */}
                                        {assignmentStatus[assignment.id] === 'saving-success' && <p className="text-xs text-green-600 flex items-center"><CheckCircle className="h-3 w-3 mr-1"/> تم الحفظ بنجاح.</p>}
                                        {assignmentStatus[assignment.id] === 'saving-error' && <p className="text-xs text-red-600 flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/> فشل الحفظ.</p>}
                                      </div>
                                    </div>
                                  </div> // Closing div for the entire assignment block
                        );
                    })) : (<p className="text-sm text-gray-500">لا توجد ضوابط محددة لهذه المهمة.</p>)}
                            </div>
                          </td>
                        </tr>)}
                     </React.Fragment>);
        }))}
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
                      <UserPlus className="h-4 w-4"/>
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
                      {renderUserList(availableUsers, function (user) { return (<Button size="sm" onClick={function () { return handleAddUserToTeam(user.id); }} className="bg-nca-teal hover:bg-nca-teal-dark text-white">
                          إضافة للفريق
                        </Button>); })}
                      {/* Handle case where no users are available */}
                      {!isLoadingUsers && availableUsers.length === 0 && (<p className="text-center text-gray-500 py-4">لا يوجد مستخدمون متاحون للإضافة حاليًا.</p>)}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={function () { return setIsAddUserModalOpen(false); }}>إلغاء</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 max-h-[400px] overflow-y-auto">
                 {/* Render Team Members */}
                 {renderUserList(teamMembers, function (_user) { return ( // Prefixed unused 'user' with '_'
        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                     عرض التفاصيل {/* Placeholder for future action */}
                   </Button>); })}
                 {/* Handle loading and empty states */}
                 {isLoadingUsers && <p>جاري تحميل أعضاء الفريق...</p>}
                 {!isLoadingUsers && teamMembers.length === 0 && (<p className="text-center text-gray-500 py-4">لا يوجد أعضاء في هذا الفريق بعد.</p>)}
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
                {isLoadingTasks || isLoadingUsers ? (<p>جاري تحميل المهام والمستخدمين...</p>) : (function () {
            // Prepare data: Map assignments to include their parent task details
            var teamAssignments = managerTasks.flatMap(function (task) {
                return task.controlAssignments
                    .filter(function (assignment) { return assignment.assignedUserId && assignment.assignedUserId !== (currentUser === null || currentUser === void 0 ? void 0 : currentUser.id); })
                    .map(function (assignment) { var _a; return (__assign(__assign({}, assignment), { taskDeadline: task.deadline, taskSystemName: (_a = task.sensitiveSystem) === null || _a === void 0 ? void 0 : _a.systemName })); });
            } // Include parent task info
            );
            if (teamAssignments.length === 0) {
                return <p className="text-center text-gray-500 py-4">لا توجد ضوابط معينة لأعضاء الفريق حاليًا.</p>;
            }
            // Use the properties added to the assignment object
            return teamAssignments.map(function (assignment) {
                var _a, _b;
                return (<div key={assignment.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          {/* Use assignment.taskSystemName */}
                          <span className="text-sm font-medium truncate" title={"".concat(assignment.taskSystemName, " - ").concat(assignment.control.controlNumber)}>
                            {assignment.taskSystemName} - {assignment.control.controlNumber}
                          </span>
                          {/* Map Badge variants correctly */}
                          <Badge variant={assignment.status === 'COMPLETED' ? 'default' : assignment.status === 'PENDING' ? 'default' : 'secondary'} className={"text-xs ".concat(assignment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        assignment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            assignment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                assignment.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700' // Fallback style
                    )}>
                            {assignment.status} {/* TODO: Translate */}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 truncate" title={assignment.control.controlText}>
                          {assignment.control.controlText}
                        </p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>المسؤول: {((_a = assignment.assignedUser) === null || _a === void 0 ? void 0 : _a.nameAr) || ((_b = assignment.assignedUser) === null || _b === void 0 ? void 0 : _b.name) || 'غير معروف'}</span>
                          {/* Use assignment.taskDeadline */}
                          <span>الاستحقاق: {formatDate(assignment.taskDeadline)}</span>
                        </div>
                      </div>);
            });
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
                   <CheckCircle className="h-6 w-6 text-green-500"/>
                 </div>
                 <p className="text-sm font-medium">15 ضابط ممتثل</p>
               </div>

               <div className="border rounded-lg p-4 text-center">
                 <div className="flex justify-center mb-2">
                   <AlertTriangle className="h-6 w-6 text-yellow-500"/>
                 </div>
                 <p className="text-sm font-medium">8 ضوابط جزئية</p>
               </div>

               <div className="border rounded-lg p-4 text-center">
                 <div className="flex justify-center mb-2">
                   <AlertTriangle className="h-6 w-6 text-red-500"/>
                 </div>
                 <p className="text-sm font-medium">5 ضوابط غير ممتثلة</p>
               </div>

               <div className="border rounded-lg p-4 text-center">
                 <div className="flex justify-center mb-2">
                   <FileText className="h-6 w-6 text-nca-teal"/>
                 </div>
                 <p className="text-sm font-medium">4 ضوابط معلقة</p>
               </div>
             </div>

             <div className="flex justify-end mt-6">
               <Button className="bg-nca-teal text-white hover:bg-nca-teal-dark gap-2">
                 <FileText className="h-4 w-4"/>
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
               النظام: {(_b = (_a = selectedTaskForDetailsModal === null || selectedTaskForDetailsModal === void 0 ? void 0 : selectedTaskForDetailsModal.sensitiveSystem) === null || _a === void 0 ? void 0 : _a.systemName) !== null && _b !== void 0 ? _b : 'غير محدد'} {/* Use nullish coalescing */}
               <br />
               الموعد النهائي: {formatDate(selectedTaskForDetailsModal === null || selectedTaskForDetailsModal === void 0 ? void 0 : selectedTaskForDetailsModal.deadline)}
             </DialogDescription>
           </DialogHeader>
           <div className="grid gap-4 py-4 text-right">
             <h4 className="font-semibold">الضوابط المعينة:</h4>
             {/* Add null check for selectedTaskForDetailsModal */}
             {(selectedTaskForDetailsModal === null || selectedTaskForDetailsModal === void 0 ? void 0 : selectedTaskForDetailsModal.controlAssignments) && selectedTaskForDetailsModal.controlAssignments.length > 0 ? (selectedTaskForDetailsModal.controlAssignments.map(function (assignment) {
            var _a, _b;
            return ( // Add type
            <div key={assignment.id} className="border rounded-md p-3 space-y-1 text-right">
                   <p><span className="font-semibold">الضابط:</span> {assignment.control.controlNumber} - {assignment.control.controlText}</p>
                   <p><span className="font-semibold">الحالة:</span> {assignment.status}</p> {/* TODO: Translate */}
                   <p><span className="font-semibold">المستخدم المسؤول:</span> {((_a = assignment.assignedUser) === null || _a === void 0 ? void 0 : _a.nameAr) || ((_b = assignment.assignedUser) === null || _b === void 0 ? void 0 : _b.name) || 'غير معين'}</p>
                 </div>);
        })) : (<p>لا توجد ضوابط مرتبطة بهذه المهمة.</p>)}
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={function () { return setIsDetailsModalOpen(false); }}>إغلاق</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>

       {/* Removed the old Assign Task Modal */}

    </div>);
}
