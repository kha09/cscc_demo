"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react"; // Added useEffect, ChangeEvent, FormEvent
import Image from "next/image";
import ProtectedRoute from "@/lib/protected-route";
import {
  Bell,
  User, 
  Users, 
  FileText, 
  Activity, 
  Server, 
  Search,
  Plus,
  Filter,
  Download,
  Upload, // Added for logo input styling
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"; // Added Dialog components
import { Label } from "@/components/ui/label"; // Added Label component
import Link from "next/link";

// Define types for Security Manager data
interface SecurityManager {
  id: string;
  name: string;
  nameAr?: string | null;
  email: string;
  mobile?: string | null;
  phone?: string | null;
}

export default function AdminDashboardPage() {
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
      } catch (err: any) {
        setFetchError(err.message); // Use dedicated fetch error state
        console.error("Error fetching security managers:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchManagers();
  }, []);

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

    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmitError(err.message || "حدث خطأ غير متوقع أثناء إنشاء التقييم."); // Use dedicated submit error state
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">لوحة الإدارة</h1>
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

              {/* Add User Button (Example) */}
              <Button className="bg-nca-teal hover:bg-nca-teal-dark text-white gap-2">
                <Plus className="h-4 w-4" />
                إضافة مستخدم
              </Button>

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
                    <th className="pb-3 font-medium text-gray-700">الحالة</th>
                    <th className="pb-3 font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 pr-4">أحمد محمد</td>
                    <td className="py-4">ahmed@example.com</td>
                    <td className="py-4">مدير أمن</td>
                    <td className="py-4">تكنولوجيا المعلومات</td>
                    <td className="py-4">
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">نشط</span>
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                        تعديل
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 pr-4">سارة عبدالله</td>
                    <td className="py-4">sara@example.com</td>
                    <td className="py-4">مدير قسم</td>
                    <td className="py-4">الموارد البشرية</td>
                    <td className="py-4">
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">نشط</span>
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                        تعديل
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 pr-4">محمد علي</td>
                    <td className="py-4">mohammed@example.com</td>
                    <td className="py-4">مستخدم</td>
                    <td className="py-4">المالية</td>
                    <td className="py-4">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">غير نشط</span>
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                        تعديل
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 pr-4">نورة سعد</td>
                    <td className="py-4">noura@example.com</td>
                    <td className="py-4">مدير أمن</td>
                    <td className="py-4">الأمن السيبراني</td>
                    <td className="py-4">
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">نشط</span>
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                        تعديل
                      </Button>
                    </td>
                  </tr>
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
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}
