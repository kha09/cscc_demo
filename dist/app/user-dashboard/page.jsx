"use client";
import { useState } from "react";
import Image from "next/image";
import { Bell, User, ClipboardList, AlertTriangle, Search, Filter, Download, CheckCircle, Clock, Send, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
export default function UserDashboardPage() {
    var _a = useState(""), searchQuery = _a[0], setSearchQuery = _a[1];
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">لوحة المستخدم - أحمد محمد</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                <Input placeholder="بحث..." className="pl-4 pr-10 w-64 text-right" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">5</div>
                <ClipboardList className="h-6 w-6 text-nca-teal"/>
              </div>
              <div className="text-sm text-gray-600 mt-2">المهام المسندة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">3</div>
                <CheckCircle className="h-6 w-6 text-green-500"/>
              </div>
              <div className="text-sm text-gray-600 mt-2">المهام المكتملة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">2</div>
                <Clock className="h-6 w-6 text-yellow-500"/>
              </div>
              <div className="text-sm text-gray-600 mt-2">المهام المعلقة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">1</div>
                <AlertTriangle className="h-6 w-6 text-red-500"/>
              </div>
              <div className="text-sm text-gray-600 mt-2">مهام متأخرة</div>
            </Card>
          </div>

          {/* My Tasks Section */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">مهامي</h2>
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
                    <th className="pb-3 font-medium text-gray-700 pr-4">اسم المهمة</th>
                    <th className="pb-3 font-medium text-gray-700">التقييم</th>
                    <th className="pb-3 font-medium text-gray-700">تاريخ الإسناد</th>
                    <th className="pb-3 font-medium text-gray-700">الموعد النهائي</th>
                    <th className="pb-3 font-medium text-gray-700">الحالة</th>
                    <th className="pb-3 font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 pr-4">3-2-3-1 تأمين واجهة برمجة التطبيقات.	</td>
                    <td className="py-4">تقييم الأنظمة الحساسة 2025	</td>
                    <td className="py-4">15 يناير 2025</td>
                    <td className="py-4">10 مارس 2025</td>
                    <td className="py-4">
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">متأخر</span>
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                        عرض
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 pr-4">1-1-3-1 إجراء اختبار التحمل (Stress Testing) للتأكد من سعة المكونات المختلفة.	</td>
                    <td className="py-4">تقييم الأنظمة الحساسة 2025	</td>
                    <td className="py-4">20 يناير 2025</td>
                    <td className="py-4">20 مارس 2025</td>
                    <td className="py-4">
                      <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm">قيد التنفيذ</span>
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                        عرض
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 pr-4">2-1-3-1 التأكد من تطبيق متطلبات استمرارية الأعمال.	</td>
                    <td className="py-4">تقييم الأنظمة الحساسة 2025	</td>
                    <td className="py-4">5 فبراير 2025</td>
                    <td className="py-4">5 أبريل 2025</td>
                    <td className="py-4">
                      <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm">قيد التنفيذ</span>
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                        عرض
                      </Button>
                    </td>
                  </tr>
                  
                  
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
    </div>);
}
