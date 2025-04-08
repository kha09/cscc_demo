import { Bell, User, Send, ClipboardList, BarChart, ListTodo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"
export default function DashboardPage() {
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
            <a href="#" className="text-white hover:text-gray-300 px-3 py-2">
              الرئيسية
            </a>
            <a href="#" className="text-white hover:text-gray-300 px-3 py-2">
              التقارير
            </a>
            <a href="#" className="text-white hover:text-gray-300 px-3 py-2">
              التقييم
            </a>
            <a href="#" className="text-white hover:text-gray-300 px-3 py-2">
              الدعم
            </a>
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">12</div>
                <ClipboardList className="h-6 w-6 text-slate-600" />
              </div>
              <div className="text-sm text-gray-600 mt-2">التقييمات النشطة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">87%</div>
                <BarChart className="h-6 w-6 text-slate-600" />
              </div>
              <div className="text-sm text-gray-600 mt-2">نسبة المهام المنجزة</div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">5</div>
                <ListTodo className="h-6 w-6 text-slate-600" />
              </div>
              <div className="text-sm text-gray-600 mt-2">مهام قيد التنفيذ</div>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Assessments */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">التقييمات الأخيرة</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">التقييمات الأخيرة</span>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">منتهية</span>
                  </div>
                  <div className="text-sm text-gray-500">اخر تحديث Jan 15, 2025</div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">التقييمات الأخيرة</span>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">قيد التنفيذ</span>
                  </div>
                  <div className="text-sm text-gray-500">اخر تحديث Jan 15, 2025</div>
                </div>
              </div>
            </Card>

            {/* Compliance Assistant */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">مساعد الامتثال</h2>
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">كيف يمكنني مساعدتك في الامتثال اليوم؟</h3>
              </div>
              <div className="flex gap-2">
                <Input placeholder="اكتب سؤالك..." className="text-right" />
                <Button size="icon" className="bg-slate-900 hover:bg-slate-800">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

