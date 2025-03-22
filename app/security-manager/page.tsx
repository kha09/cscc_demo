"use client"

import { useState } from "react"
import { 
  Bell, 
  User, 
  Shield, 
  ClipboardList, 
  BarChart, 
  FileText, 
  AlertTriangle, 
  Search,
  Plus,
  Filter,
  Download,
  Calendar,
  ChevronDown,
  Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function SecurityManagerDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="w-full bg-slate-900 text-white py-3 px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and Title - Right Side */}
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-white ml-3" />
            <div className="text-right">
              <h1 className="text-sm font-medium">أداة قياس الامتثال لضوابط الهيئة الوطنية </h1>
              <p className="text-xs">للأمن السيبراني للأنظمة الحساسة</p>
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
            <Link href="/security-manager" className="text-white bg-nca-teal px-3 py-2 rounded">
              مدير الأمن
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
            <h1 className="text-2xl font-bold text-slate-800">لوحة مدير الأمن</h1>
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
                تقييم جديد
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">18</div>
                <ClipboardList className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">التقييمات النشطة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">76%</div>
                <BarChart className="h-6 w-6 text-nca-teal" />
              </div>
              <div className="text-sm text-gray-600 mt-2">متوسط نسبة الامتثال</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">12</div>
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-sm text-gray-600 mt-2">مخاطر متوسطة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">5</div>
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="text-sm text-gray-600 mt-2">مخاطر عالية</div>
            </Card>
          </div>

          {/* Assessment Initiation Section */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">بدء تقييم جديد</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-6 hover:border-nca-teal cursor-pointer transition-all">
                <div className="flex justify-center mb-4">
                  <div className="bg-nca-teal bg-opacity-10 p-4 rounded-full">
                    <ClipboardList className="h-8 w-8 text-nca-teal" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-center mb-2">تقييم شامل</h3>
                <p className="text-sm text-gray-600 text-center">تقييم كامل لجميع ضوابط الأمن السيبراني للأنظمة الحساسة</p>
              </div>
              
              <div className="border rounded-lg p-6 hover:border-nca-teal cursor-pointer transition-all">
                <div className="flex justify-center mb-4">
                  <div className="bg-nca-teal bg-opacity-10 p-4 rounded-full">
                    <Shield className="h-8 w-8 text-nca-teal" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-center mb-2">تقييم مخصص</h3>
                <p className="text-sm text-gray-600 text-center">تقييم مخصص لمجموعة محددة من الضوابط</p>
              </div>
              
              <div className="border rounded-lg p-6 hover:border-nca-teal cursor-pointer transition-all">
                <div className="flex justify-center mb-4">
                  <div className="bg-nca-teal bg-opacity-10 p-4 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-nca-teal" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-center mb-2">تقييم المخاطر</h3>
                <p className="text-sm text-gray-600 text-center">تقييم مركز على المخاطر العالية والمتوسطة</p>
              </div>
            </div>
          </Card>

          {/* Active Assessments Section */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">التقييمات النشطة</h2>
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
                    <th className="pb-3 font-medium text-gray-700">القسم</th>
                    <th className="pb-3 font-medium text-gray-700">تاريخ البدء</th>
                    <th className="pb-3 font-medium text-gray-700">الموعد النهائي</th>
                    <th className="pb-3 font-medium text-gray-700">التقدم</th>
                    <th className="pb-3 font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 pr-4">تقييم ضوابط الأمن السيبراني - Q1</td>
                    <td className="py-4">تكنولوجيا المعلومات</td>
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
                    <td className="py-4">البنية التحتية</td>
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
                </tbody>
              </table>
            </div>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task Assignment */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">تعيين المهام</h2>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">اختر التقييم</span>
                </div>
                <div className="relative">
                  <select className="w-full p-2 border rounded-md text-right pr-10 appearance-none bg-white">
                    <option>تقييم ضوابط الأمن السيبراني - Q1</option>
                    <option>تقييم أمن الشبكات</option>
                  </select>
                  <ChevronDown className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">اختر القسم</span>
                </div>
                <div className="relative">
                  <select className="w-full p-2 border rounded-md text-right pr-10 appearance-none bg-white">
                    <option>تكنولوجيا المعلومات</option>
                    <option>البنية التحتية</option>
                  </select>
                  <ChevronDown className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">الموعد النهائي</span>
                </div>
                <div className="relative">
                  <Input type="date" className="w-full p-2 border rounded-md text-right" />
                  <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <Button className="w-full bg-nca-teal text-white hover:bg-nca-teal-dark">
                تعيين المهمة
              </Button>
            </Card>

            {/* Risk Assessment */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">تقييم المخاطر</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-red-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">عدم تطبيق التشفير للبيانات الحساسة</span>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">مخاطرة عالية</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">قد يؤدي إلى تسريب البيانات الحساسة في حالة الاختراق</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">تكنولوجيا المعلومات</span>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                      معالجة
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">ضعف في إدارة كلمات المرور</span>
                    <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm">مخاطرة متوسطة</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">عدم تطبيق سياسة قوية لكلمات المرور</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">الأمن السيبراني</span>
                    <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-600 hover:bg-yellow-50">
                      معالجة
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4 text-nca-teal border-nca-teal hover:bg-nca-teal hover:text-white">
                عرض جميع المخاطر
              </Button>
            </Card>
          </div>
          
          {/* Report Generation */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">إنشاء التقارير</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-6 hover:border-nca-teal cursor-pointer transition-all">
                <div className="flex justify-center mb-4">
                  <div className="bg-nca-teal bg-opacity-10 p-4 rounded-full">
                    <FileText className="h-8 w-8 text-nca-teal" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-center mb-2">تقرير الامتثال</h3>
                <p className="text-sm text-gray-600 text-center">تقرير شامل عن مستوى الامتثال لضوابط الأمن السيبراني</p>
              </div>
              
              <div className="border rounded-lg p-6 hover:border-nca-teal cursor-pointer transition-all">
                <div className="flex justify-center mb-4">
                  <div className="bg-nca-teal bg-opacity-10 p-4 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-nca-teal" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-center mb-2">تقرير المخاطر</h3>
                <p className="text-sm text-gray-600 text-center">تقرير مفصل عن المخاطر المكتشفة وتوصيات المعالجة</p>
              </div>
              
              <div className="border rounded-lg p-6 hover:border-nca-teal cursor-pointer transition-all">
                <div className="flex justify-center mb-4">
                  <div className="bg-nca-teal bg-opacity-10 p-4 rounded-full">
                    <BarChart className="h-8 w-8 text-nca-teal" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-center mb-2">تقرير تحليلي</h3>
                <p className="text-sm text-gray-600 text-center">تقرير تحليلي مع رسوم بيانية ومؤشرات أداء</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium mb-3">إعدادات التقرير</h3>
              <div className="flex justify-end mt-4">
                <Button className="bg-nca-teal text-white hover:bg-nca-teal-dark gap-2">
                  <Download className="h-4 w-4" />
                  إنشاء التقرير
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
