"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react"; // Added useEffect, ChangeEvent, FormEvent
import Image from "next/image";
import { useRouter } from 'next/navigation'; // Import useRouter
import ProtectedRoute from "@/lib/protected-route";
import { useAuth } from "@/lib/auth-context"; // Import useAuth
import {
  Bell,
  LogOut, // Import LogOut icon
  User, 
  Users, 
  FileText, 
  Activity, 
  Server, 
  Search,
  Plus,
  Filter,
  Download,
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

// Define types for User data (matching Prisma schema)
interface UserData {
  id: string;
  email: string;
  name: string;
  role: Role; // Use the imported Role enum
  department?: string | null;
  nameAr?: string | null;
  // Add other fields if needed from your Prisma schema, e.g., mobile, phone, createdAt
  createdAt: Date; // Assuming createdAt is available
}

// Define type for the Edit Form data
interface EditFormData {
  name: string;
  nameAr: string;
  email: string;
  role: Role; // Use the Role enum type
  department: string;
}

// Define type for the Add User Form data
interface AddFormData {
  name: string;
  nameAr: string;
  email: string;
  role: Role; // Use the Role enum type
  department: string;
  password?: string; // Optional password field for creation
}

// Define types for Security Manager data (subset of UserData)
interface SecurityManager {
  id: string;
  name: string;
  nameAr?: string | null;
  email: string;
  mobile?: string | null;
  phone?: string | null;
}

export default function AdminDashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar visibility
  const [searchQuery, setSearchQuery] = useState("");
  const [securityManagers, setSecurityManagers] = useState<SecurityManager[]>([]);
  const [selectedSecurityManagerId, setSelectedSecurityManagerId] = useState<string>('');
  const [selectedSecurityManagerDetails, setSelectedSecurityManagerDetails] = useState<SecurityManager | null>(null);
  const [companyNameAr, setCompanyNameAr] = useState('');
  const [companyNameEn, setCompanyNameEn] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [secondaryContactNameAr, setSecondaryContactNameAr] = useState('');
  const [secondaryContactNameEn, setSecondaryContactNameEn] = useState('');
  const [secondaryContactMobile, setSecondaryContactMobile] = useState('');
  const [secondaryContactPhone, setSecondaryContactPhone] = useState('');
  const [secondaryContactEmail, setSecondaryContactEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state for fetching managers
  const [fetchError, setFetchError] = useState<string | null>(null); // Error state for fetching managers
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle'); // For form submission feedback
  const [submitError, setSubmitError] = useState<string | null>(null); // Error state for form submission
  const [isFormOpen, setIsFormOpen] = useState(false); // State to control Dialog visibility

  // State for all users table
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(true); // Start loading initially
  const [usersError, setUsersError] = useState<string | null>(null);

  // State for Edit User Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  // Explicitly type the state using the EditFormData interface
  const [editFormData, setEditFormData] = useState<EditFormData>({ name: '', nameAr: '', email: '', role: Role.USER, department: '' });
  const [editSubmitStatus, setEditSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);

  // State for Delete User Confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // State for Add User Dialog
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [addFormData, setAddFormData] = useState<AddFormData>({ name: '', nameAr: '', email: '', role: Role.USER, department: '', password: '' });
  const [addSubmitStatus, setAddSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [addSubmitError, setAddSubmitError] = useState<string | null>(null);

  // Auth and Routing
  const { logout } = useAuth();
  const router = useRouter();

  // Fetch security managers on component mount
  useEffect(() => {
    // Renamed error state to avoid conflict
    const fetchManagers = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch('/api/users/security-managers');
        if (!response.ok) {
          throw new Error(`Failed to fetch security managers: ${response.statusText}`);
        }
        const data: SecurityManager[] = await response.json();
        setSecurityManagers(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setFetchError(errorMessage); // Use dedicated fetch error state
        console.error("Error fetching security managers:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchManagers();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Fetch all users for the management table
  useEffect(() => {
    const fetchAllUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const response = await fetch('/api/users'); // Fetch from the new endpoint
        if (!response.ok) {
          // Try to parse error message from response body
          const errorData = await response.json().catch(() => ({ message: `Failed to fetch users: ${response.statusText}` }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data: UserData[] = await response.json();
        setAllUsers(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setUsersError(errorMessage);
        console.error("Error fetching all users:", err);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchAllUsers();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to fetch all users (can be reused for refresh)
  const fetchAllUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await fetch('/api/users'); // Fetch from the new endpoint
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch users: ${response.statusText}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: UserData[] = await response.json();
      setAllUsers(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setUsersError(errorMessage);
      console.error("Error fetching all users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    logout();
    router.push('/signin'); // Redirect to signin page after logout
  };

  // Handle Edit Button Click
  const handleEditClick = (user: UserData) => {
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
  const handleEditFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

   // Handle Edit Form Role Change (using Select component)
   const handleEditRoleChange = (value: Role) => {
    setEditFormData(prev => ({ ...prev, role: value }));
  };

  // Handle Edit Form Submission
  const handleUpdateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser) return;

    setEditSubmitStatus('loading');
    setEditSubmitError(null);

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: editFormData.name,
            nameAr: editFormData.nameAr || null, // Send null if empty
            email: editFormData.email,
            role: editFormData.role,
            department: editFormData.department || null, // Send null if empty
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update user.' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setEditSubmitStatus('success');
      await fetchAllUsers(); // Refresh the user list
      setTimeout(() => {
        setIsEditDialogOpen(false);
        setEditSubmitStatus('idle');
      }, 1500); // Close dialog after success message

    } catch (err: unknown) {
      console.error("Update error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setEditSubmitError(errorMessage);
      setEditSubmitStatus('error');
    }
  };

  // --- Add User Functionality ---

  // Handle Add Form Input Change
  const handleAddFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Add Form Role Change (using Select component)
  const handleAddRoleChange = (value: Role) => {
    setAddFormData(prev => ({ ...prev, role: value }));
  };

  // Handle Add Form Submission
  const handleAddUserSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddSubmitStatus('loading');
    setAddSubmitError(null);

    // Basic validation (add more as needed)
    if (!addFormData.email || !addFormData.name || !addFormData.role || !addFormData.password) {
        setAddSubmitError("يرجى ملء جميع الحقول المطلوبة (الاسم الإنجليزي، البريد الإلكتروني، الدور، كلمة المرور).");
        setAddSubmitStatus('error');
        return;
    }

    try {
        const response = await fetch('/api/users', {
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
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'فشل إنشاء المستخدم.' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        setAddSubmitStatus('success');
        await fetchAllUsers(); // Refresh the user list
        // Reset form
        setAddFormData({ name: '', nameAr: '', email: '', role: Role.USER, department: '', password: '' });

        setTimeout(() => {
            setIsAddUserDialogOpen(false); // Close dialog
            setAddSubmitStatus('idle');
        }, 1500); // Close dialog after success message

    } catch (err: unknown) {
        console.error("Add user error:", err);
        const errorMessage = err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء إنشاء المستخدم.";
        setAddSubmitError(errorMessage);
        setAddSubmitStatus('error');
    }
  };

  // --- End Add User Functionality ---


  // Handle Delete Button Click
  const handleDeleteClick = (userId: string) => {
    setDeletingUserId(userId);
    setDeleteStatus('idle');
    setDeleteError(null);
    setIsDeleteDialogOpen(true);
  };

  // Handle Delete Confirmation
  const handleDeleteUser = async () => {
    if (!deletingUserId) return;

    setDeleteStatus('loading');
    setDeleteError(null);

    try {
      const response = await fetch(`/api/users/${deletingUserId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete user.' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setDeleteStatus('success');
      await fetchAllUsers(); // Refresh the user list
      // Optionally show success message before closing
      setTimeout(() => {
         setIsDeleteDialogOpen(false);
         setDeletingUserId(null);
         setDeleteStatus('idle');
      }, 1500);


    } catch (err: unknown) {
      console.error("Delete error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setDeleteError(errorMessage);
      setDeleteStatus('error');
      // Keep dialog open on error to show message
    }
  };


  // Handle security manager selection change
  const handleManagerChange = (value: string) => {
    setSelectedSecurityManagerId(value);
    const selectedManager = securityManagers.find(manager => manager.id === value) || null;
    setSelectedSecurityManagerDetails(selectedManager);
  };

  // Handle file input change
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setLogoFile(event.target.files[0]);
    } else {
      setLogoFile(null);
    }
  };

  // Handle form submission (placeholder for now)
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus('loading');
    setSubmitError(null); // Use dedicated submit error state

    // Basic validation (can be expanded)
    if (!companyNameAr || !companyNameEn || !selectedSecurityManagerId || !secondaryContactEmail) {
        setSubmitError("يرجى ملء جميع الحقول المطلوبة."); // Use dedicated submit error state
        setSubmitStatus('error');
        return;
    }

    console.log("Form submitted with data:", {
      companyNameAr,
      companyNameEn,
      logoFile: logoFile?.name, // Log file name for now
      selectedSecurityManagerId,
      secondaryContactNameAr,
      secondaryContactNameEn,
      secondaryContactMobile,
      secondaryContactPhone,
      secondaryContactEmail,
    });

    const formData = new FormData();
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

    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        body: formData,
        // Headers are not typically needed for FormData with fetch,
        // the browser sets the 'Content-Type' to 'multipart/form-data' automatically.
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'فشل إنشاء التقييم. حاول مرة أخرى.' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Successfully created
      setSubmitStatus('success');
      // Reset the form
      setCompanyNameAr('');
      setCompanyNameEn('');
      setLogoFile(null);
      const fileInput = document.getElementById('logo') as HTMLInputElement;
      if (fileInput) fileInput.value = ''; // Clear file input

      setSelectedSecurityManagerId('');
      setSelectedSecurityManagerDetails(null);
      setSecondaryContactNameAr('');
      setSecondaryContactNameEn('');
      setSecondaryContactMobile('');
      setSecondaryContactPhone('');
      setSecondaryContactEmail('');

      // Close dialog and hide success message after a delay
      setTimeout(() => {
        setIsFormOpen(false); // Close the dialog
        setSubmitStatus('idle');
      }, 2000); // Keep success message visible for 2 seconds

    } catch (err: unknown) {
      console.error("Submission error:", err);
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء إنشاء التقييم.";
      setSubmitError(errorMessage); // Use dedicated submit error state
      setSubmitStatus('error');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="w-full bg-slate-900 text-white py-3 px-6 sticky top-0 z-10">
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
            <Link href="/admin" className="text-white bg-nca-teal px-3 py-2 rounded">
              لوحة الإدارة
            </Link>
          </nav>

          {/* User Profile and Bell - Left Side */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="icon" className="text-white">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <User className="h-5 w-5" />
            </Button>
            {/* Logout Button */}
            <Button variant="ghost" size="icon" className="text-white" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
            {/* Sidebar Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white md:hidden mr-4" // Show only on smaller screens initially, adjust as needed
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-row"> {/* Changed to flex-row for left sidebar */}
        {/* Sidebar */}
        {/* Added transition-all and duration */}
        <aside className={`bg-slate-800 text-white p-4 sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto transition-all duration-300 ease-in-out hidden md:block ${isSidebarOpen ? 'w-64' : 'w-20'}`}> {/* Adjust top, conditional width */}
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
            {/* Links updated for conditional rendering */}
            <Link href="/admin" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <Activity className="h-5 w-5 flex-shrink-0" /> {/* Example Icon */}
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>لوحة المعلومات</span>
            </Link>
            <Link href="/admin#user-management" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <Users className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>إدارة المستخدمين</span>
            </Link>
            {/* TODO: Link to actual assessment management page when created */}
            <Link href="/admin#assessments" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <FileText className="h-5 w-5 flex-shrink-0" />
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>إدارة التقييمات</span>
            </Link>
            <Link href="/admin#system-settings" className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <Server className="h-5 w-5 flex-shrink-0" /> {/* Using Server icon for settings */}
              <span className={`${!isSidebarOpen ? 'hidden' : 'block'}`}>إعدادات النظام</span>
            </Link>
            {/* Add more links as needed */}
          </nav>
        </aside>

        {/* Main Content Area */}
        {/* Added transition-all and conditional margin */}
        {/* Reverted margin to mr for left sidebar in RTL */}
        <main className={`flex-1 p-6 overflow-y-auto h-[calc(100vh-76px)] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:mr-0' : 'md:mr-20'}`}> {/* Adjust height, scrolling, and margin-right */}
          {/* Removed max-w-7xl and mx-auto from here, applied to overall container if needed */}
          {/* Original content starts */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">لوحة الإدارة</h1> {/* Title remains in main content */}
            <div className="flex items-center gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="بحث..."
                  className="pl-4 pr-10 w-64 text-right"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Add User Button (Dialog Trigger) */}
              <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-nca-teal hover:bg-nca-teal-dark text-white gap-2">
                    <Plus className="h-4 w-4" />
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
                      <Input
                        id="add-nameAr"
                        name="nameAr"
                        value={addFormData.nameAr}
                        onChange={handleAddFormChange}
                        className="text-right"
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-name">الاسم (بالإنجليزي) <span className="text-red-500">*</span></Label>
                      <Input
                        id="add-name"
                        name="name"
                        value={addFormData.name}
                        onChange={handleAddFormChange}
                        required
                        className="text-left" dir="ltr"
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-email">البريد الإلكتروني <span className="text-red-500">*</span></Label>
                      <Input
                        id="add-email"
                        name="email"
                        type="email"
                        value={addFormData.email}
                        onChange={handleAddFormChange}
                        required
                        className="text-left" dir="ltr"
                      />
                    </div>
                     <div>
                      <Label htmlFor="add-password">كلمة المرور <span className="text-red-500">*</span></Label>
                      <Input
                        id="add-password"
                        name="password"
                        type="password"
                        value={addFormData.password || ''}
                        onChange={handleAddFormChange}
                        required
                        className="text-left" dir="ltr"
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-department">القسم</Label>
                      <Input
                        id="add-department"
                        name="department"
                        value={addFormData.department}
                        onChange={handleAddFormChange}
                        className="text-right"
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-role">الدور <span className="text-red-500">*</span></Label>
                      <Select name="role" onValueChange={handleAddRoleChange} value={addFormData.role} required>
                        <SelectTrigger id="add-role">
                          <SelectValue placeholder="اختر الدور..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(Role).map((roleValue) => (
                            <SelectItem key={roleValue} value={roleValue}>
                              {roleValue} {/* Display role enum value */}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Add Status/Error */}
                    {addSubmitStatus === 'error' && addSubmitError && (
                      <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{addSubmitError}</p>
                    )}
                    {addSubmitStatus === 'success' && (
                      <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">تم إضافة المستخدم بنجاح.</p>
                    )}

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>إلغاء</Button>
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
                    <Plus className="h-4 w-4" />
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
                          <Input
                            id="companyNameAr"
                            value={companyNameAr}
                            onChange={(e) => setCompanyNameAr(e.target.value)}
                            required
                            className="text-right"
                          />
                        </div>
                        <div>
                          <Label htmlFor="companyNameEn" className="mb-2 block"> {/* Changed mb-1 to mb-2 */}
                            الاسم الكامل للجهة (بالإنجليزي) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="companyNameEn"
                            value={companyNameEn}
                            onChange={(e) => setCompanyNameEn(e.target.value)}
                            required
                            className="text-left"
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="logo" className="mb-2 block"> {/* Changed mb-1 to mb-2 */}
                          شعار الجهة
                        </Label>
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-nca-teal-light file:text-nca-teal hover:file:bg-nca-teal-dark hover:file:text-white cursor-pointer"
                        />
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
                            <SelectValue placeholder="اختر مسؤول الأمن السيبراني..." />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoading && <SelectItem value="loading" disabled>جاري تحميل المدراء...</SelectItem>}
                            {fetchError && <SelectItem value="error" disabled>خطأ في تحميل المدراء</SelectItem>}
                            {!isLoading && !fetchError && securityManagers.length === 0 && <SelectItem value="no-managers" disabled>لا يوجد مدراء أمن متاحون</SelectItem>}
                            {securityManagers.map((manager) => (
                              <SelectItem key={manager.id} value={manager.id}>
                                {manager.nameAr || manager.name} ({manager.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Display Selected Manager Details */}
                      {selectedSecurityManagerDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded border">
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
                        </div>
                      )}
                    </fieldset>

                    {/* Secondary Contact Info */}
                    <fieldset className="space-y-4 border p-4 rounded-md">
                      <legend className="text-lg font-medium px-2">معلومات شخص آخر (من ينوب عن المسؤول الأول)</legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="secondaryContactNameAr" className="mb-2 block"> {/* Changed mb-1 to mb-2 */}
                            الاسم الكامل (بالعربي)
                          </Label>
                          <Input
                            id="secondaryContactNameAr"
                            value={secondaryContactNameAr}
                            onChange={(e) => setSecondaryContactNameAr(e.target.value)}
                            className="text-right"
                          />
                        </div>
                        <div>
                          <Label htmlFor="secondaryContactNameEn" className="mb-2 block"> {/* Changed mb-1 to mb-2 */}
                            الاسم الكامل (بالإنجليزي)
                          </Label>
                          <Input
                            id="secondaryContactNameEn"
                            value={secondaryContactNameEn}
                            onChange={(e) => setSecondaryContactNameEn(e.target.value)}
                            className="text-left"
                            dir="ltr"
                          />
                        </div>
                        <div>
                          <Label htmlFor="secondaryContactMobile" className="mb-2 block"> {/* Changed mb-1 to mb-2 */}
                            رقم الجوال
                          </Label>
                          <Input
                            id="secondaryContactMobile"
                            type="tel"
                            value={secondaryContactMobile}
                            onChange={(e) => setSecondaryContactMobile(e.target.value)}
                            className="text-left"
                            dir="ltr"
                          />
                        </div>
                        <div>
                          <Label htmlFor="secondaryContactPhone" className="mb-2 block"> {/* Changed mb-1 to mb-2 */}
                            رقم الهاتف
                          </Label>
                          <Input
                            id="secondaryContactPhone"
                            type="tel"
                            value={secondaryContactPhone}
                            onChange={(e) => setSecondaryContactPhone(e.target.value)}
                            className="text-left"
                            dir="ltr"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="secondaryContactEmail" className="mb-2 block"> {/* Changed mb-1 to mb-2 */}
                            البريد الإلكتروني <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="secondaryContactEmail"
                            type="email"
                            value={secondaryContactEmail}
                            onChange={(e) => setSecondaryContactEmail(e.target.value)}
                            required
                            className="text-left"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </fieldset>

                    {/* Submission Status/Error */}
                    {submitStatus === 'error' && submitError && (
                      <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{submitError}</p>
                    )}
                    {submitStatus === 'success' && (
                      <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">تم إنشاء التقييم بنجاح.</p>
                    )}

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>إلغاء</Button>
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
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                {/* <p className="text-xs text-muted-foreground">+2 from last month</p> */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">التقييمات النشطة</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                {/* <p className="text-xs text-muted-foreground">+5 this week</p> */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط نسبة الامتثال</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">76%</div>
                {/* <p className="text-xs text-muted-foreground">Up from 72% last period</p> */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">توافر النظام</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
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
                  <Filter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">تصفية</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
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
                  {usersLoading && (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">جاري تحميل المستخدمين...</td>
                    </tr>
                  )}
                  {usersError && (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-red-500">خطأ في تحميل المستخدمين: {usersError}</td>
                    </tr>
                  )}
                  {!usersLoading && !usersError && allUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">لا يوجد مستخدمون لعرضهم.</td>
                    </tr>
                  )}
                  {!usersLoading && !usersError && allUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:text-blue-800 mr-1 h-8 w-8"
                          onClick={() => handleEditClick(user)} // Attach edit handler
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">تعديل</span>
                        </Button>
                        <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="text-red-600 hover:text-red-800 h-8 w-8"
                               onClick={() => handleDeleteClick(user.id)} // Pass only ID
                             >
                               <Trash2 className="h-4 w-4" />
                               <span className="sr-only">حذف</span>
                             </Button>
                           </AlertDialogTrigger>
                           {/* Keep Delete Confirmation Dialog Content separate for clarity */}
                         </AlertDialog>
                      </td>
                    </tr>
                  ))}
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
              <Input
                id="edit-nameAr"
                name="nameAr"
                value={editFormData.nameAr}
                onChange={handleEditFormChange}
                className="text-right"
              />
            </div>
            <div>
              <Label htmlFor="edit-name">الاسم (بالإنجليزي) <span className="text-red-500">*</span></Label>
              <Input
                id="edit-name"
                name="name"
                value={editFormData.name}
                onChange={handleEditFormChange}
                required
                className="text-left" dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">البريد الإلكتروني <span className="text-red-500">*</span></Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={editFormData.email}
                onChange={handleEditFormChange}
                required
                className="text-left" dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="edit-department">القسم</Label>
              <Input
                id="edit-department"
                name="department"
                value={editFormData.department}
                onChange={handleEditFormChange}
                className="text-right"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">الدور <span className="text-red-500">*</span></Label>
              <Select name="role" onValueChange={handleEditRoleChange} value={editFormData.role} required>
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="اختر الدور..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Role).map((roleValue) => (
                    <SelectItem key={roleValue} value={roleValue}>
                      {roleValue} {/* Display role enum value */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Edit Status/Error */}
            {editSubmitStatus === 'error' && editSubmitError && (
              <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{editSubmitError}</p>
            )}
            {editSubmitStatus === 'success' && (
              <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">تم تحديث المستخدم بنجاح.</p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>إلغاء</Button>
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
           {deleteStatus === 'error' && deleteError && (
              <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{deleteError}</p>
            )}
            {deleteStatus === 'success' && (
              <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">تم حذف المستخدم بنجاح.</p>
            )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteStatus === 'loading'}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleteStatus === 'loading'}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteStatus === 'loading' ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
    </ProtectedRoute>
  )
}
