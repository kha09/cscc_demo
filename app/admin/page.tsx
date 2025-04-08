"use client"

import { useState } from "react"
import Image from "next/image"
import ProtectedRoute from "@/lib/protected-route"
import { 
  Bell, 
  User, 
  Shield, 
  Users, 
  FileText, 
  Activity, 
  Server, 
  Search,
  Plus,
  Filter,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function AdminDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
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
                إضافة مستخدم
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">42</div>
                <Users className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">إجمالي المستخدمين</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">18</div>
                <FileText className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">التقييمات النشطة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">76%</div>
                <Activity className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">متوسط نسبة الامتثال</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">99.8%</div>
                <Server className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">توافر النظام</div>
            </Card>
          </div>

          {/* User Management Section */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">إدارة المستخدمين</h2>
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
            </div>
            
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
            
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm" className="mx-1">السابق</Button>
              <Button variant="outline" size="sm" className="mx-1 bg-nca-teal text-white">1</Button>
              <Button variant="outline" size="sm" className="mx-1">2</Button>
              <Button variant="outline" size="sm" className="mx-1">3</Button>
              <Button variant="outline" size="sm" className="mx-1">التالي</Button>
            </div>
          </Card>

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
