import { Download, Bell, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function AssessmentPage() {
    return (<div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="w-full bg-slate-900 text-white py-3 px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and Title - Right Side */}
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-white ml-3"/>
            <div className="text-right">
            <h1 className="text-sm font-medium">أداة قياس الامتثال لضوابط الهيئة الوطنية </h1>
            <p className="text-xs">للأمن السيبراني للأنظمة الحساسة</p>
            </div>
          </div>

          {/* Navigation - Center */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            <Link href="/" className="text-white hover:text-gray-300 px-3 py-2">
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

      <div className="p-4 md:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          {/* New Assessment Section */}
          <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
            <h2 className="text-xl font-bold text-right mb-6 text-gray-800">تقييم جديد</h2>

            <div className="space-y-4">
              <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3">البدء في تقييم جديد</Button>

              <Button variant="outline" className="w-full border-gray-200 text-gray-700 py-3">
                متابعة التقييم السابق
              </Button>
            </div>
          </div>

          {/* Recent Reports Section */}
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-right mb-6 text-gray-800">التقارير الأخيرة</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-right">
                    <th className="pb-4 font-medium text-gray-700">اسم التقرير</th>
                    <th className="pb-4 font-medium text-gray-700">حالة التقرير</th>
                    <th className="pb-4 font-medium text-gray-700">التاريخ</th>
                    <th className="pb-4 font-medium text-gray-700">التحميل</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="py-4 text-gray-800">تقرير 01</td>
                    <td className="py-4">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">مكتمل</span>
                    </td>
                    <td className="py-4 text-gray-600">Jan 10, 2025</td>
                    <td className="py-4">
                      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                        <Download className="h-5 w-5"/>
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="py-4 text-gray-800">تقرير 01</td>
                    <td className="py-4">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">قيد التنفيذ</span>
                    </td>
                    <td className="py-4 text-gray-600">Jan 5, 2025</td>
                    <td className="py-4">
                      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                        <Download className="h-5 w-5"/>
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
