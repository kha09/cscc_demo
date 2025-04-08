"use client"

import { useState } from "react"
import Image from "next/image"
import { 
  Bell, 
  User, 
  ClipboardList, 
  BarChart, 
  FileText, 
  AlertTriangle, 
  Search,
  Filter,
  Download,
  CheckCircle,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function DepartmentManagerDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  return (
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
            <Link href="/department-manager" className="text-white bg-nca-teal px-3 py-2 rounded">
              مدير القسم
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
            <h1 className="text-2xl font-bold text-slate-800">لوحة مدير القسم - تكنولوجيا المعلومات</h1>
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
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">8</div>
                <ClipboardList className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">التقييمات النشطة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">68%</div>
                <BarChart className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">متوسط نسبة الامتثال</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">15</div>
                <Users className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">أعضاء الفريق</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">7</div>
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-sm text-gray-600 mt-2">مهام معلقة</div>
            </Card>
          </div>

          {/* Active Assessments Section */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">التقييمات النشطة للقسم</h2>
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
                    <th className="pb-3 font-medium text-gray-700 pr-4">اسم التقييم</th>
                    <th className="pb-3 font-medium text-gray-700">المسؤول</th>
                    <th className="pb-3 font-medium text-gray-700">تاريخ البدء</th>
                    <th className="pb-3 font-medium text-gray-700">الموعد النهائي</th>
                    <th className="pb-3 font-medium text-gray-700">التقدم</th>
                    <th className="pb-3 font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 pr-4">تقييم ضوابط الأمن السيبراني - Q1</td>
                    <td className="py-4">أحمد محمد</td>
                    <td className="py-4">15 يناير 2025</td>
                    <td className="py-4">15 مارس 2025</td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <span className="text-sm">75%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                        عرض
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 pr-4">تقييم أمن الشبكات</td>
                    <td className="py-4">سارة عبدالله</td>
                    <td className="py-4">1 فبراير 2025</td>
                    <td className="py-4">1 أبريل 2025</td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <span className="text-sm">45%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                        عرض
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 pr-4">تقييم أمن التطبيقات</td>
                    <td className="py-4">محمد علي</td>
                    <td className="py-4">10 فبراير 2025</td>
                    <td className="py-4">10 أبريل 2025</td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                        <span className="text-sm">30%</span>
                      </div>
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
            {/* Team Members */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">أعضاء الفريق</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-nca-teal text-white flex items-center justify-center mr-3">
                      <span>أم</span>
                    </div>
                    <div>
                      <p className="font-medium">أحمد محمد</p>
                      <p className="text-sm text-gray-500">مهندس أمن سيبراني</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm ml-2">3 مهام</span>
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                      عرض
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-nca-teal text-white flex items-center justify-center mr-3">
                      <span>سع</span>
                    </div>
                    <div>
                      <p className="font-medium">سارة عبدالله</p>
                      <p className="text-sm text-gray-500">محلل أمن سيبراني</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm ml-2">2 مهام</span>
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                      عرض
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-nca-teal text-white flex items-center justify-center mr-3">
                      <span>مع</span>
                    </div>
                    <div>
                      <p className="font-medium">محمد علي</p>
                      <p className="text-sm text-gray-500">مطور برمجيات</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm ml-2">1 مهمة</span>
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                      عرض
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4 text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                عرض جميع أعضاء الفريق
              </Button>
            </Card>

            {/* Pending Tasks */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">المهام المعلقة</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">تقديم أدلة الامتثال لضوابط التشفير</span>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">متأخر</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">المسؤول: أحمد محمد</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">تاريخ الاستحقاق: 10 مارس 2025</span>
                    <Button variant="outline" size="sm" className="text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                      متابعة
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">مراجعة سياسات كلمات المرور</span>
                    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm">قريب</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">المسؤول: سارة عبدالله</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">تاريخ الاستحقاق: 20 مارس 2025</span>
                    <Button variant="outline" size="sm" className="text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                      متابعة
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">تحديث نظام التشغيل للخوادم</span>
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">في الوقت</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">المسؤول: محمد علي</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">تاريخ الاستحقاق: 5 أبريل 2025</span>
                    <Button variant="outline" size="sm" className="text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                      متابعة
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4 text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                عرض جميع المهام
              </Button>
            </Card>
          </div>
          
          {/* Compliance Status */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">حالة الامتثال للقسم</h2>
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
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-sm font-medium">15 ضابط ممتثل</p>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
                <p className="text-sm font-medium">8 ضوابط جزئية</p>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-sm font-medium">5 ضوابط غير ممتثلة</p>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <FileText className="h-6 w-6 text-nca-teal" />
                </div>
                <p className="text-sm font-medium">4 ضوابط معلقة</p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button className="bg-nca-teal text-white hover:bg-nca-teal-dark gap-2">
                <FileText className="h-4 w-4" />
                عرض التقرير التفصيلي
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
