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
import { useState, useEffect } from "react"; // Added useEffect, ChangeEvent, FormEvent
import Image from "next/image";
import ProtectedRoute from "@/lib/protected-route";
import { Bell, User, Users, FileText, Activity, Server, Search, Plus, Filter, Download, 
// Upload, // Removed unused import
Menu, // Added for sidebar toggle
 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Removed unused CardFooter
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"; // Import AlertDialog
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Role } from "@prisma/client"; // Import Role enum
import { Edit, Trash2 } from "lucide-react"; // Import icons for actions
export default function AdminDashboardPage() {
    var _this = this;
    var _a = useState(true), isSidebarOpen = _a[0], setIsSidebarOpen = _a[1]; // State for sidebar visibility
    var _b = useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = useState([]), securityManagers = _c[0], setSecurityManagers = _c[1];
    var _d = useState(''), selectedSecurityManagerId = _d[0], setSelectedSecurityManagerId = _d[1];
    var _e = useState(null), selectedSecurityManagerDetails = _e[0], setSelectedSecurityManagerDetails = _e[1];
    var _f = useState(''), companyNameAr = _f[0], setCompanyNameAr = _f[1];
    var _g = useState(''), companyNameEn = _g[0], setCompanyNameEn = _g[1];
    var _h = useState(null), logoFile = _h[0], setLogoFile = _h[1];
    var _j = useState(''), secondaryContactNameAr = _j[0], setSecondaryContactNameAr = _j[1];
    var _k = useState(''), secondaryContactNameEn = _k[0], setSecondaryContactNameEn = _k[1];
    var _l = useState(''), secondaryContactMobile = _l[0], setSecondaryContactMobile = _l[1];
    var _m = useState(''), secondaryContactPhone = _m[0], setSecondaryContactPhone = _m[1];
    var _o = useState(''), secondaryContactEmail = _o[0], setSecondaryContactEmail = _o[1];
    var _p = useState(false), isLoading = _p[0], setIsLoading = _p[1]; // Loading state for fetching managers
    var _q = useState(null), fetchError = _q[0], setFetchError = _q[1]; // Error state for fetching managers
    var _r = useState('idle'), submitStatus = _r[0], setSubmitStatus = _r[1]; // For form submission feedback
    var _s = useState(null), submitError = _s[0], setSubmitError = _s[1]; // Error state for form submission
    var _t = useState(false), isFormOpen = _t[0], setIsFormOpen = _t[1]; // State to control Dialog visibility
    // State for all users table
    var _u = useState([]), allUsers = _u[0], setAllUsers = _u[1];
    var _v = useState(true), usersLoading = _v[0], setUsersLoading = _v[1]; // Start loading initially
    var _w = useState(null), usersError = _w[0], setUsersError = _w[1];
    // State for Edit User Dialog
    var _x = useState(false), isEditDialogOpen = _x[0], setIsEditDialogOpen = _x[1];
    var _y = useState(null), editingUser = _y[0], setEditingUser = _y[1];
    // Explicitly type the state using the EditFormData interface
    var _z = useState({ name: '', nameAr: '', email: '', role: Role.USER, department: '' }), editFormData = _z[0], setEditFormData = _z[1];
    var _0 = useState('idle'), editSubmitStatus = _0[0], setEditSubmitStatus = _0[1];
    var _1 = useState(null), editSubmitError = _1[0], setEditSubmitError = _1[1];
    // State for Delete User Confirmation
    var _2 = useState(false), isDeleteDialogOpen = _2[0], setIsDeleteDialogOpen = _2[1];
    var _3 = useState(null), deletingUserId = _3[0], setDeletingUserId = _3[1];
    var _4 = useState('idle'), deleteStatus = _4[0], setDeleteStatus = _4[1];
    var _5 = useState(null), deleteError = _5[0], setDeleteError = _5[1];
    // State for Add User Dialog
    var _6 = useState(false), isAddUserDialogOpen = _6[0], setIsAddUserDialogOpen = _6[1];
    var _7 = useState({ name: '', nameAr: '', email: '', role: Role.USER, department: '', password: '' }), addFormData = _7[0], setAddFormData = _7[1];
    var _8 = useState('idle'), addSubmitStatus = _8[0], setAddSubmitStatus = _8[1];
    var _9 = useState(null), addSubmitError = _9[0], setAddSubmitError = _9[1];
    // Fetch security managers on component mount
    useEffect(function () {
        // Renamed error state to avoid conflict
        var fetchManagers = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, err_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        setFetchError(null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, fetch('/api/users/security-managers')];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to fetch security managers: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        setSecurityManagers(data);
                        return [3 /*break*/, 6];
                    case 4:
                        err_1 = _a.sent();
                        errorMessage = err_1 instanceof Error ? err_1.message : "An unknown error occurred";
                        setFetchError(errorMessage); // Use dedicated fetch error state
                        console.error("Error fetching security managers:", err_1);
                        return [3 /*break*/, 6];
                    case 5:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        fetchManagers();
    }, []); // Empty dependency array ensures this runs only once on mount
    // Fetch all users for the management table
    useEffect(function () {
        var fetchAllUsers = function () { return __awaiter(_this, void 0, void 0, function () {
            var response_1, errorData, data, err_2, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setUsersLoading(true);
                        setUsersError(null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, 7, 8]);
                        return [4 /*yield*/, fetch('/api/users')];
                    case 2:
                        response_1 = _a.sent();
                        if (!!response_1.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response_1.json().catch(function () { return ({ message: "Failed to fetch users: ".concat(response_1.statusText) }); })];
                    case 3:
                        errorData = _a.sent();
                        throw new Error(errorData.message || "HTTP error! status: ".concat(response_1.status));
                    case 4: return [4 /*yield*/, response_1.json()];
                    case 5:
                        data = _a.sent();
                        setAllUsers(data);
                        return [3 /*break*/, 8];
                    case 6:
                        err_2 = _a.sent();
                        errorMessage = err_2 instanceof Error ? err_2.message : "An unknown error occurred";
                        setUsersError(errorMessage);
                        console.error("Error fetching all users:", err_2);
                        return [3 /*break*/, 8];
                    case 7:
                        setUsersLoading(false);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        }); };
        fetchAllUsers();
    }, []); // Empty dependency array ensures this runs only once on mount
    // Function to fetch all users (can be reused for refresh)
    var fetchAllUsers = function () { return __awaiter(_this, void 0, void 0, function () {
        var response_2, errorData, data, err_3, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setUsersLoading(true);
                    setUsersError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch('/api/users')];
                case 2:
                    response_2 = _a.sent();
                    if (!!response_2.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response_2.json().catch(function () { return ({ message: "Failed to fetch users: ".concat(response_2.statusText) }); })];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.message || "HTTP error! status: ".concat(response_2.status));
                case 4: return [4 /*yield*/, response_2.json()];
                case 5:
                    data = _a.sent();
                    setAllUsers(data);
                    return [3 /*break*/, 8];
                case 6:
                    err_3 = _a.sent();
                    errorMessage = err_3 instanceof Error ? err_3.message : "An unknown error occurred";
                    setUsersError(errorMessage);
                    console.error("Error fetching all users:", err_3);
                    return [3 /*break*/, 8];
                case 7:
                    setUsersLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Handle Edit Button Click
    var handleEditClick = function (user) {
        setEditingUser(user);
        setEditFormData({
            name: user.name || '',
            nameAr: user.nameAr || '',
            email: user.email || '',
            role: user.role,
            department: user.department || '',
        });
        setEditSubmitStatus('idle');
        setEditSubmitError(null);
        setIsEditDialogOpen(true);
    };
    // Handle Edit Form Input Change
    var handleEditFormChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setEditFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    // Handle Edit Form Role Change (using Select component)
    var handleEditRoleChange = function (value) {
        setEditFormData(function (prev) { return (__assign(__assign({}, prev), { role: value })); });
    };
    // Handle Edit Form Submission
    var handleUpdateUser = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, err_4, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    if (!editingUser)
                        return [2 /*return*/];
                    setEditSubmitStatus('loading');
                    setEditSubmitError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch("/api/users/".concat(editingUser.id), {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: editFormData.name,
                                nameAr: editFormData.nameAr || null, // Send null if empty
                                email: editFormData.email,
                                role: editFormData.role,
                                department: editFormData.department || null, // Send null if empty
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json().catch(function () { return ({ message: 'Failed to update user.' }); })];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.message || "HTTP error! status: ".concat(response.status));
                case 4:
                    setEditSubmitStatus('success');
                    return [4 /*yield*/, fetchAllUsers()];
                case 5:
                    _a.sent(); // Refresh the user list
                    setTimeout(function () {
                        setIsEditDialogOpen(false);
                        setEditSubmitStatus('idle');
                    }, 1500); // Close dialog after success message
                    return [3 /*break*/, 7];
                case 6:
                    err_4 = _a.sent();
                    console.error("Update error:", err_4);
                    errorMessage = err_4 instanceof Error ? err_4.message : "An unexpected error occurred.";
                    setEditSubmitError(errorMessage);
                    setEditSubmitStatus('error');
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // --- Add User Functionality ---
    // Handle Add Form Input Change
    var handleAddFormChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setAddFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    // Handle Add Form Role Change (using Select component)
    var handleAddRoleChange = function (value) {
        setAddFormData(function (prev) { return (__assign(__assign({}, prev), { role: value })); });
    };
    // Handle Add Form Submission
    var handleAddUserSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, err_5, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    setAddSubmitStatus('loading');
                    setAddSubmitError(null);
                    // Basic validation (add more as needed)
                    if (!addFormData.email || !addFormData.name || !addFormData.role || !addFormData.password) {
                        setAddSubmitError("يرجى ملء جميع الحقول المطلوبة (الاسم الإنجليزي، البريد الإلكتروني، الدور، كلمة المرور).");
                        setAddSubmitStatus('error');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch('/api/users', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: addFormData.name,
                                nameAr: addFormData.nameAr || null,
                                email: addFormData.email,
                                password: addFormData.password, // Send password for creation
                                role: addFormData.role,
                                department: addFormData.department || null,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json().catch(function () { return ({ message: 'فشل إنشاء المستخدم.' }); })];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.message || "HTTP error! status: ".concat(response.status));
                case 4:
                    setAddSubmitStatus('success');
                    return [4 /*yield*/, fetchAllUsers()];
                case 5:
                    _a.sent(); // Refresh the user list
                    // Reset form
                    setAddFormData({ name: '', nameAr: '', email: '', role: Role.USER, department: '', password: '' });
                    setTimeout(function () {
                        setIsAddUserDialogOpen(false); // Close dialog
                        setAddSubmitStatus('idle');
                    }, 1500); // Close dialog after success message
                    return [3 /*break*/, 7];
                case 6:
                    err_5 = _a.sent();
                    console.error("Add user error:", err_5);
                    errorMessage = err_5 instanceof Error ? err_5.message : "حدث خطأ غير متوقع أثناء إنشاء المستخدم.";
                    setAddSubmitError(errorMessage);
                    setAddSubmitStatus('error');
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // --- End Add User Functionality ---
    // Handle Delete Button Click
    var handleDeleteClick = function (userId) {
        setDeletingUserId(userId);
        setDeleteStatus('idle');
        setDeleteError(null);
        setIsDeleteDialogOpen(true);
    };
    // Handle Delete Confirmation
    var handleDeleteUser = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, err_6, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!deletingUserId)
                        return [2 /*return*/];
                    setDeleteStatus('loading');
                    setDeleteError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch("/api/users/".concat(deletingUserId), {
                            method: 'DELETE',
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json().catch(function () { return ({ message: 'Failed to delete user.' }); })];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.message || "HTTP error! status: ".concat(response.status));
                case 4:
                    setDeleteStatus('success');
                    return [4 /*yield*/, fetchAllUsers()];
                case 5:
                    _a.sent(); // Refresh the user list
                    // Optionally show success message before closing
                    setTimeout(function () {
                        setIsDeleteDialogOpen(false);
                        setDeletingUserId(null);
                        setDeleteStatus('idle');
                    }, 1500);
                    return [3 /*break*/, 7];
                case 6:
                    err_6 = _a.sent();
                    console.error("Delete error:", err_6);
                    errorMessage = err_6 instanceof Error ? err_6.message : "An unexpected error occurred.";
                    setDeleteError(errorMessage);
                    setDeleteStatus('error');
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Handle security manager selection change
    var handleManagerChange = function (value) {
        setSelectedSecurityManagerId(value);
        var selectedManager = securityManagers.find(function (manager) { return manager.id === value; }) || null;
        setSelectedSecurityManagerDetails(selectedManager);
    };
    // Handle file input change
    var handleFileChange = function (event) {
        if (event.target.files && event.target.files[0]) {
            setLogoFile(event.target.files[0]);
        }
        else {
            setLogoFile(null);
        }
    };
    // Handle form submission (placeholder for now)
    var handleSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var formData, response, errorData, fileInput, err_7, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    setSubmitStatus('loading');
                    setSubmitError(null); // Use dedicated submit error state
                    // Basic validation (can be expanded)
                    if (!companyNameAr || !companyNameEn || !selectedSecurityManagerId || !secondaryContactEmail) {
                        setSubmitError("يرجى ملء جميع الحقول المطلوبة."); // Use dedicated submit error state
                        setSubmitStatus('error');
                        return [2 /*return*/];
                    }
                    console.log("Form submitted with data:", {
                        companyNameAr: companyNameAr,
                        companyNameEn: companyNameEn,
                        logoFile: logoFile === null || logoFile === void 0 ? void 0 : logoFile.name, // Log file name for now
                        selectedSecurityManagerId: selectedSecurityManagerId,
                        secondaryContactNameAr: secondaryContactNameAr,
                        secondaryContactNameEn: secondaryContactNameEn,
                        secondaryContactMobile: secondaryContactMobile,
                        secondaryContactPhone: secondaryContactPhone,
                        secondaryContactEmail: secondaryContactEmail,
                    });
                    formData = new FormData();
                    formData.append('companyNameAr', companyNameAr);
                    formData.append('companyNameEn', companyNameEn);
                    formData.append('securityManagerId', selectedSecurityManagerId);
                    formData.append('secondaryContactNameAr', secondaryContactNameAr);
                    formData.append('secondaryContactNameEn', secondaryContactNameEn);
                    formData.append('secondaryContactMobile', secondaryContactMobile);
                    formData.append('secondaryContactPhone', secondaryContactPhone);
                    formData.append('secondaryContactEmail', secondaryContactEmail);
                    if (logoFile) {
                        formData.append('logo', logoFile);
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch('/api/assessments', {
                            method: 'POST',
                            body: formData,
                            // Headers are not typically needed for FormData with fetch,
                            // the browser sets the 'Content-Type' to 'multipart/form-data' automatically.
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json().catch(function () { return ({ message: 'فشل إنشاء التقييم. حاول مرة أخرى.' }); })];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.message || "HTTP error! status: ".concat(response.status));
                case 4:
                    // Successfully created
                    setSubmitStatus('success');
                    // Reset the form
                    setCompanyNameAr('');
                    setCompanyNameEn('');
                    setLogoFile(null);
                    fileInput = document.getElementById('logo');
                    if (fileInput)
                        fileInput.value = ''; // Clear file input
                    setSelectedSecurityManagerId('');
                    setSelectedSecurityManagerDetails(null);
                    setSecondaryContactNameAr('');
                    setSecondaryContactNameEn('');
                    setSecondaryContactMobile('');
                    setSecondaryContactPhone('');
                    setSecondaryContactEmail('');
                    // Close dialog and hide success message after a delay
                    setTimeout(function () {
                        setIsFormOpen(false); // Close the dialog
                        setSubmitStatus('idle');
                    }, 2000); // Keep success message visible for 2 seconds
                    return [3 /*break*/, 6];
                case 5:
                    err_7 = _a.sent();
                    console.error("Submission error:", err_7);
                    errorMessage = err_7 instanceof Error ? err_7.message : "حدث خطأ غير متوقع أثناء إنشاء التقييم.";
                    setSubmitError(errorMessage); // Use dedicated submit error state
                    setSubmitStatus('error');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
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
            <Link href="/admin" className="text-white bg-nca-teal px-3 py-2 rounded">
              لوحة الإدارة
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
            {/* Sidebar Toggle Button */}
            <Button variant="ghost" size="icon" className="text-white md:hidden mr-4" // Show only on smaller screens initially, adjust as needed
     onClick={function () { return setIsSidebarOpen(!isSidebarOpen); }}>
              <Menu className="h-6 w-6"/>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-row"> {/* Changed to flex-row for left sidebar */}
        {/* Sidebar */}
        {/* Added transition-all and duration */}
        <aside className={"bg-slate-800 text-white p-4 sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto transition-all duration-300 ease-in-out hidden md:block ".concat(isSidebarOpen ? 'w-64' : 'w-20')}> {/* Adjust top, conditional width */}
           {/* Toggle Button inside sidebar for larger screens */}
           <div className={"flex ".concat(isSidebarOpen ? 'justify-end' : 'justify-center', " mb-4")}>
             <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={function () { return setIsSidebarOpen(!isSidebarOpen); }}>
               <Menu className="h-6 w-6"/>
             </Button>
           </div>
          <nav className="space-y-2">
            {/* Links updated for conditional rendering */}
            <Link href="/admin" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
              <Activity className="h-5 w-5 flex-shrink-0"/> {/* Example Icon */}
              <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>لوحة المعلومات</span>
            </Link>
            <Link href="/admin#user-management" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
              <Users className="h-5 w-5 flex-shrink-0"/>
              <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>إدارة المستخدمين</span>
            </Link>
            {/* TODO: Link to actual assessment management page when created */}
            <Link href="/admin#assessments" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
              <FileText className="h-5 w-5 flex-shrink-0"/>
              <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>إدارة التقييمات</span>
            </Link>
            <Link href="/admin#system-settings" className={"flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ".concat(!isSidebarOpen ? 'justify-center' : '')}>
              <Server className="h-5 w-5 flex-shrink-0"/> {/* Using Server icon for settings */}
              <span className={"".concat(!isSidebarOpen ? 'hidden' : 'block')}>إعدادات النظام</span>
            </Link>
            {/* Add more links as needed */}
          </nav>
        </aside>

        {/* Main Content Area */}
        {/* Added transition-all and conditional margin */}
        {/* Reverted margin to mr for left sidebar in RTL */}
        <main className={"flex-1 p-6 overflow-y-auto h-[calc(100vh-76px)] transition-all duration-300 ease-in-out ".concat(isSidebarOpen ? 'md:mr-0' : 'md:mr-20')}> {/* Adjust height, scrolling, and margin-right */}
          {/* Removed max-w-7xl and mx-auto from here, applied to overall container if needed */}
          {/* Original content starts */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">لوحة الإدارة</h1> {/* Title remains in main content */}
            <div className="flex items-center gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                <Input placeholder="بحث..." className="pl-4 pr-10 w-64 text-right" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
              </div>

              {/* Add User Button (Dialog Trigger) */}
              <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-nca-teal hover:bg-nca-teal-dark text-white gap-2">
                    <Plus className="h-4 w-4"/>
                    إضافة مستخدم
                  </Button>
                </DialogTrigger>
                {/* Add User Dialog Content */}
                <DialogContent className="sm:max-w-[500px]" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                    <DialogDescription>
                      أدخل تفاصيل المستخدم الجديد أدناه. الحقول المعلمة بـ <span className="text-red-500">*</span> مطلوبة.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddUserSubmit} className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="add-nameAr">الاسم (بالعربي)</Label>
                      <Input id="add-nameAr" name="nameAr" value={addFormData.nameAr} onChange={handleAddFormChange} className="text-right"/>
                    </div>
                    <div>
                      <Label htmlFor="add-name">الاسم (بالإنجليزي) <span className="text-red-500">*</span></Label>
                      <Input id="add-name" name="name" value={addFormData.name} onChange={handleAddFormChange} required className="text-left" dir="ltr"/>
                    </div>
                    <div>
                      <Label htmlFor="add-email">البريد الإلكتروني <span className="text-red-500">*</span></Label>
                      <Input id="add-email" name="email" type="email" value={addFormData.email} onChange={handleAddFormChange} required className="text-left" dir="ltr"/>
                    </div>
                     <div>
                      <Label htmlFor="add-password">كلمة المرور <span className="text-red-500">*</span></Label>
                      <Input id="add-password" name="password" type="password" value={addFormData.password || ''} onChange={handleAddFormChange} required className="text-left" dir="ltr"/>
                    </div>
                    <div>
                      <Label htmlFor="add-department">القسم</Label>
                      <Input id="add-department" name="department" value={addFormData.department} onChange={handleAddFormChange} className="text-right"/>
                    </div>
                    <div>
                      <Label htmlFor="add-role">الدور <span className="text-red-500">*</span></Label>
                      <Select name="role" onValueChange={handleAddRoleChange} value={addFormData.role} required>
                        <SelectTrigger id="add-role">
                          <SelectValue placeholder="اختر الدور..."/>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(Role).map(function (roleValue) { return (<SelectItem key={roleValue} value={roleValue}>
                              {roleValue} {/* Display role enum value */}
                            </SelectItem>); })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Add Status/Error */}
                    {addSubmitStatus === 'error' && addSubmitError && (<p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{addSubmitError}</p>)}
                    {addSubmitStatus === 'success' && (<p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">تم إضافة المستخدم بنجاح.</p>)}

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={function () { return setIsAddUserDialogOpen(false); }}>إلغاء</Button>
                      <Button type="submit" className="bg-nca-teal hover:bg-nca-teal-dark text-white" disabled={addSubmitStatus === 'loading'}>
                        {addSubmitStatus === 'loading' ? 'جاري الإضافة...' : 'إضافة مستخدم'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Create New Assessment Button (Dialog Trigger) */}
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 border-nca-teal text-nca-teal hover:bg-nca-teal hover:text-white">
                    <Plus className="h-4 w-4"/>
                    إنشاء تقييم جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>إنشاء تقييم جديد</DialogTitle>
                    <DialogDescription>
                      أدخل تفاصيل الجهة والمسؤولين لإنشاء تقييم جديد. الحقول المعلمة بـ <span className="text-red-500">*</span> مطلوبة.
                    </DialogDescription>
                  </DialogHeader>
                  {/* Form Content Starts Here */}
                  <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Basic Company Info */}
                    <fieldset className="space-y-4 border p-4 rounded-md">
                      <legend className="text-lg font-medium px-2">معلومات اساسية عن الجهة</legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="companyNameAr" className="mb-2 block"> {/* Changed mb-1 to mb-2 */}
                            الاسم الكامل للجهة (بالعربي) <span className="text-red-500">*</span>
                          </Label>
                          <Input id="companyNameAr" value={companyNameAr} onChange={function (e) { return setCompanyNameAr(e.target.value); }} required className="text-right"/>
                        </div>
                        <div>
                          <Label htmlFor="companyNameEn" className="mb-2 block"> {/* Changed mb-1 to mb-2 */}
                            الاسم الكامل للجهة (بالإنجليزي) <span className="text-red-500">*</span>
                          </Label>
                          <Input id="companyNameEn" value={companyNameEn} onChange={function (e) { return setCompanyNameEn(e.target.value); }} required className="text-left" dir="ltr"/>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="logo" className="mb-2 block"> {/* Changed mb-1 to mb-2 */}
                          شعار الجهة
                        </Label>
                        <Input id="logo" type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-nca-teal-light file:text-nca-teal hover:file:bg-nca-teal-dark hover:file:text-white cursor-pointer"/>
                        {logoFile && <p className="text-xs text-gray-500 mt-1">الملف المحدد: {logoFile.name}</p>}
                      </div>
                    </fieldset>

                    {/* Security Manager Info */}
                    <fieldset className="space-y-4 border p-4 rounded-md">
                      <legend className="text-lg font-medium px-2">معلومات المسؤول الأول عن الأمن السيبراني</legend>
                      <div>
                        <Label htmlFor="securityManager" className="mb-2 block"> {/* Changed mb-1 to mb-2 */}
                          اختيار المسؤول <span className="text-red-500">*</span>
                        </Label>
                        <Select onValueChange={handleManagerChange} value={selectedSecurityManagerId} required>
                          <SelectTrigger id="securityManager" className="w-full">
                            <SelectValue placeholder="اختر مسؤول الأمن السيبراني..."/>
                          </SelectTrigger>
                          <SelectContent>
                            {isLoading && <SelectItem value="loading" disabled>جاري تحميل المدراء...</SelectItem>}
                            {fetchError && <SelectItem value="error" disabled>خطأ في تحميل المدراء</SelectItem>}
                            {!isLoading && !fetchError && securityManagers.length === 0 && <SelectItem value="no-managers" disabled>لا يوجد مدراء أمن متاحون</SelectItem>}
                            {securityManagers.map(function (manager) { return (<SelectItem key={manager.id} value={manager.id}>
                                {manager.nameAr || manager.name} ({manager.email})
                              </SelectItem>); })}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Display Selected Manager Details */}
                      {selectedSecurityManagerDetails && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded border">
                          <div>
                            <Label className="block text-xs font-medium text-gray-500">الاسم (بالعربي)</Label>
                            <p className="text-sm text-gray-800">{selectedSecurityManagerDetails.nameAr || '-'}</p>
                          </div>
                          <div>
                            <Label className="block text-xs font-medium text-gray-500">الاسم (بالإنجليزي)</Label>
                            <p className="text-sm text-gray-800">{selectedSecurityManagerDetails.name || '-'}</p>
                          </div>
                          <div>
                            <Label className="block text-xs font-medium text-gray-500">البريد الإلكتروني</Label>
                            <p className="text-sm text-gray-800">{selectedSecurityManagerDetails.email || '-'}</p>
                          </div>
                          <div>
                            <Label className="block text-xs font-medium text-gray-500">رقم الجوال</Label>
                            <p className="text-sm text-gray-800">{selectedSecurityManagerDetails.mobile || '-'}</p>
                          </div>
                          <div>
                            <Label className="block text-xs font-medium text-gray-500">رقم الهاتف</Label>
                            <p className="text-sm text-gray-800">{selectedSecurityManagerDetails.phone || '-'}</p>
                          </div>
                        </div>)}
                    </fieldset>

                    {/* Secondary Contact Info */}
                    <fieldset className="space-y-4 border p-4 rounded-md">
                      <legend className="text-lg font-medium px-2">معلومات شخص آخر (من ينوب عن المسؤول الأول)</legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="secondaryContactNameAr" className="mb-2 block"> {/* Changed mb-1 to mb-2 */}
                            الاسم الكامل (بالعربي)
                          </Label>
                          <Input id="secondaryContactNameAr" value={secondaryContactNameAr} onChange={function (e) { return setSecondaryContactNameAr(e.target.value); }} className="text-right"/>
                        </div>
                        <div>
                          <Label htmlFor="secondaryContactNameEn" className="mb-2 block"> {/* Changed mb-1 to mb-2 */}
                            الاسم الكامل (بالإنجليزي)
                          </Label>
                          <Input id="secondaryContactNameEn" value={secondaryContactNameEn} onChange={function (e) { return setSecondaryContactNameEn(e.target.value); }} className="text-left" dir="ltr"/>
                        </div>
                        <div>
                          <Label htmlFor="secondaryContactMobile" className="mb-2 block"> {/* Changed mb-1 to mb-2 */}
                            رقم الجوال
                          </Label>
                          <Input id="secondaryContactMobile" type="tel" value={secondaryContactMobile} onChange={function (e) { return setSecondaryContactMobile(e.target.value); }} className="text-left" dir="ltr"/>
                        </div>
                        <div>
                          <Label htmlFor="secondaryContactPhone" className="mb-2 block"> {/* Changed mb-1 to mb-2 */}
                            رقم الهاتف
                          </Label>
                          <Input id="secondaryContactPhone" type="tel" value={secondaryContactPhone} onChange={function (e) { return setSecondaryContactPhone(e.target.value); }} className="text-left" dir="ltr"/>
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="secondaryContactEmail" className="mb-2 block"> {/* Changed mb-1 to mb-2 */}
                            البريد الإلكتروني <span className="text-red-500">*</span>
                          </Label>
                          <Input id="secondaryContactEmail" type="email" value={secondaryContactEmail} onChange={function (e) { return setSecondaryContactEmail(e.target.value); }} required className="text-left" dir="ltr"/>
                        </div>
                      </div>
                    </fieldset>

                    {/* Submission Status/Error */}
                    {submitStatus === 'error' && submitError && (<p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{submitError}</p>)}
                    {submitStatus === 'success' && (<p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">تم إنشاء التقييم بنجاح.</p>)}

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={function () { return setIsFormOpen(false); }}>إلغاء</Button>
                      <Button type="submit" className="bg-nca-teal hover:bg-nca-teal-dark text-white" disabled={submitStatus === 'loading'}>
                        {submitStatus === 'loading' ? 'جاري الإنشاء...' : 'إنشاء التقييم'}
                      </Button>
                    </DialogFooter>
                  </form>
                  {/* Form Content Ends Here */}
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {/* Anchor for User Management */}
          <div id="user-management"></div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card> {/* Removed p-6 to use CardHeader/Content/Footer */}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                {/* <p className="text-xs text-muted-foreground">+2 from last month</p> */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">التقييمات النشطة</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                {/* <p className="text-xs text-muted-foreground">+5 this week</p> */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط نسبة الامتثال</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">76%</div>
                {/* <p className="text-xs text-muted-foreground">Up from 72% last period</p> */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">توافر النظام</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.8%</div>
                {/* <p className="text-xs text-muted-foreground">Last 30 days</p> */}
              </CardContent>
            </Card>
          </div>

          {/* User Management Section */}
          {/* Removed p-6 mb-6, using CardHeader/Content */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-semibold">إدارة المستخدمين</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Filter className="h-3.5 w-3.5"/>
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">تصفية</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-3.5 w-3.5"/>
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">تصدير</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-right border-b border-gray-200">
                    <th className="pb-3 font-medium text-gray-700 pr-4">اسم المستخدم</th>
                    <th className="pb-3 font-medium text-gray-700">البريد الإلكتروني</th>
                    <th className="pb-3 font-medium text-gray-700">الدور</th>
                    <th className="pb-3 font-medium text-gray-700">القسم</th>
                    {/* <th className="pb-3 font-medium text-gray-700">الحالة</th> */} {/* Status column removed for now */}
                    <th className="pb-3 font-medium text-gray-700">تاريخ الإنشاء</th>
                    <th className="pb-3 font-medium text-gray-700 text-left pl-4">الإجراءات</th> {/* Align actions left */}
                  </tr>
                </thead>
                <tbody>
                  {usersLoading && (<tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">جاري تحميل المستخدمين...</td>
                    </tr>)}
                  {usersError && (<tr>
                      <td colSpan={6} className="text-center py-4 text-red-500">خطأ في تحميل المستخدمين: {usersError}</td>
                    </tr>)}
                  {!usersLoading && !usersError && allUsers.length === 0 && (<tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">لا يوجد مستخدمون لعرضهم.</td>
                    </tr>)}
                  {!usersLoading && !usersError && allUsers.map(function (user) { return (<tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 pr-4">{user.nameAr || user.name}</td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">{user.role}</td> {/* Display role directly */}
                      <td className="py-3">{user.department || '-'}</td>
                      {/* <td className="py-3">
              <span className={`px-3 py-1 rounded-full text-sm ${user.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                {user.isActive ? 'نشط' : 'غير نشط'}
              </span>
            </td> */}
                      <td className="py-3">{new Date(user.createdAt).toLocaleDateString('ar-SA')}</td> {/* Format date */}
                      <td className="py-3 pl-4 text-left"> {/* Align buttons left */}
                        <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-800 mr-1 h-8 w-8" onClick={function () { return handleEditClick(user); }} // Attach edit handler
        >
                          <Edit className="h-4 w-4"/>
                          <span className="sr-only">تعديل</span>
                        </Button>
                        <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 h-8 w-8" onClick={function () { return handleDeleteClick(user.id); }} // Pass only ID
        >
                               <Trash2 className="h-4 w-4"/>
                               <span className="sr-only">حذف</span>
                             </Button>
                           </AlertDialogTrigger>
                           {/* Keep Delete Confirmation Dialog Content separate for clarity */}
                         </AlertDialog>
                      </td>
                    </tr>); })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm" className="mx-1">السابق</Button>
              <Button variant="outline" size="sm" className="mx-1 border-nca-teal text-nca-teal bg-nca-teal-light">1</Button>
              <Button variant="outline" size="sm" className="mx-1">2</Button>
              <Button variant="outline" size="sm" className="mx-1">3</Button>
              <Button variant="outline" size="sm" className="mx-1">التالي</Button>
            </div>
            </CardContent>
          </Card>

          {/* Anchor for Assessments (Placeholder) */}
          <div id="assessments"></div>
          {/* Assessment Form is now inside the Dialog triggered above */}


          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Health */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">حالة النظام</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">خادم قاعدة البيانات</span>
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">يعمل</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <span className="text-sm text-gray-500 mr-2">70% استخدام</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">خادم التطبيقات</span>
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">يعمل</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-sm text-gray-500 mr-2">45% استخدام</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">خادم التخزين</span>
                    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm">تحذير</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm text-gray-500 mr-2">85% استخدام</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Audit Logs */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">سجلات التدقيق الأخيرة</h2>
              <div className="space-y-3">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">تسجيل دخول مستخدم</span>
                    <span className="text-xs text-gray-500">منذ 5 دقائق</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">قام أحمد محمد بتسجيل الدخول إلى النظام</p>
                </div>
                
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">تعديل مستخدم</span>
                    <span className="text-xs text-gray-500">منذ 30 دقيقة</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">تم تعديل صلاحيات المستخدم سارة عبدالله</p>
                </div>
                
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">إنشاء تقييم جديد</span>
                    <span className="text-xs text-gray-500">منذ ساعة</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">تم إنشاء تقييم جديد بواسطة نورة سعد</p>
                </div>
                
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">تحديث إعدادات النظام</span>
                    <span className="text-xs text-gray-500">منذ 3 ساعات</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">تم تحديث إعدادات النظام بواسطة المشرف</p>
                </div>
                
                <div className="pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">إضافة مستخدم جديد</span>
                    <span className="text-xs text-gray-500">منذ 5 ساعات</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">تمت إضافة مستخدم جديد: محمد علي</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4 text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                عرض جميع السجلات
              </Button>
            </Card>
          </div>

          {/* System Configuration */}
          {/* Anchor for System Settings */}
          <div id="system-settings"></div>
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">إعدادات النظام</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">إعدادات عامة</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm">تفعيل المصادقة الثنائية</span>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-green-500">
                      <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm">تفعيل الإشعارات البريدية</span>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-green-500">
                      <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm">تفعيل تسجيل الدخول التلقائي</span>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-300">
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">إعدادات الأمان</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm">قفل الحساب بعد 5 محاولات فاشلة</span>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-green-500">
                      <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm">تغيير كلمة المرور كل 90 يوم</span>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-green-500">
                      <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm">تسجيل جميع الأنشطة</span>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-green-500">
                      <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button variant="outline" className="ml-2">إعادة تعيين</Button>
              <Button className="bg-nca-teal text-white hover:bg-nca-teal-dark">حفظ التغييرات</Button>
            </div>
          </Card>
          {/* End of original content */}
        </main>
      </div> {/* End Main Layout with Sidebar */}

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
            <DialogDescription>
              قم بتحديث معلومات المستخدم أدناه.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-nameAr">الاسم (بالعربي)</Label>
              <Input id="edit-nameAr" name="nameAr" value={editFormData.nameAr} onChange={handleEditFormChange} className="text-right"/>
            </div>
            <div>
              <Label htmlFor="edit-name">الاسم (بالإنجليزي) <span className="text-red-500">*</span></Label>
              <Input id="edit-name" name="name" value={editFormData.name} onChange={handleEditFormChange} required className="text-left" dir="ltr"/>
            </div>
            <div>
              <Label htmlFor="edit-email">البريد الإلكتروني <span className="text-red-500">*</span></Label>
              <Input id="edit-email" name="email" type="email" value={editFormData.email} onChange={handleEditFormChange} required className="text-left" dir="ltr"/>
            </div>
            <div>
              <Label htmlFor="edit-department">القسم</Label>
              <Input id="edit-department" name="department" value={editFormData.department} onChange={handleEditFormChange} className="text-right"/>
            </div>
            <div>
              <Label htmlFor="edit-role">الدور <span className="text-red-500">*</span></Label>
              <Select name="role" onValueChange={handleEditRoleChange} value={editFormData.role} required>
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="اختر الدور..."/>
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Role).map(function (roleValue) { return (<SelectItem key={roleValue} value={roleValue}>
                      {roleValue} {/* Display role enum value */}
                    </SelectItem>); })}
                </SelectContent>
              </Select>
            </div>

            {/* Edit Status/Error */}
            {editSubmitStatus === 'error' && editSubmitError && (<p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{editSubmitError}</p>)}
            {editSubmitStatus === 'success' && (<p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">تم تحديث المستخدم بنجاح.</p>)}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={function () { return setIsEditDialogOpen(false); }}>إلغاء</Button>
              <Button type="submit" className="bg-nca-teal hover:bg-nca-teal-dark text-white" disabled={editSubmitStatus === 'loading'}>
                {editSubmitStatus === 'loading' ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
           {/* Delete Status/Error */}
           {deleteStatus === 'error' && deleteError && (<p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{deleteError}</p>)}
            {deleteStatus === 'success' && (<p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">تم حذف المستخدم بنجاح.</p>)}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteStatus === 'loading'}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={deleteStatus === 'loading'} className="bg-red-600 hover:bg-red-700 text-white">
              {deleteStatus === 'loading' ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
    </ProtectedRoute>);
}
