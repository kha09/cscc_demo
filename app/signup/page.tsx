"use client"

import type React from "react"

import { useState } from "react"
import { Shield, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignUp() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [department, setDepartment] = useState("")
  const [role, setRole] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate form
      if (password !== confirmPassword) {
        setError("كلمات المرور غير متطابقة")
        setIsLoading(false)
        return
      }

      if (password.length < 8) {
        setError("يجب أن تكون كلمة المرور 8 أحرف على الأقل")
        setIsLoading(false)
        return
      }

      // Call the API
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          department,
          role,
          password,
          confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ أثناء إنشاء الحساب")
      }

      // Success
      setSuccess("تم إنشاء الحساب بنجاح! جاري تحويلك لصفحة تسجيل الدخول...")
      
      // Redirect to signin page after 2 seconds
      setTimeout(() => {
        router.push("/signin")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء الحساب")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-nca-dark-blue p-4" dir="rtl">
      <div className="w-full max-w-md rounded-lg border border-nca-teal bg-nca-dark-blue-light p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Shield className="h-10 w-10 text-nca-teal mb-2" />
          <h1 className="text-lg font-bold tracking-tight mb-4 max-w-[250px] text-white">
            أداة قياس الامتثال لضوابط الهيئة الوطنية للأمن السيبراني للأنظمة الحساسة
          </h1>
          <h2 className="text-2xl font-bold text-white">إنشاء حساب جديد</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium leading-none text-nca-light-blue">
                الاسم الأول
              </label>
              <Input
                id="firstName"
                placeholder="الاسم الأول"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="text-right bg-white text-nca-dark-blue"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium leading-none text-nca-light-blue">
                اسم العائلة
              </label>
              <Input
                id="lastName"
                placeholder="اسم العائلة"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="text-right bg-white text-nca-dark-blue"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none text-nca-light-blue">
              البريد الإلكتروني
            </label>
            <Input
              id="email"
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-right bg-white text-nca-dark-blue"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="department" className="text-sm font-medium leading-none text-nca-light-blue">
              القسم
            </label>
            <Select value={department} onValueChange={setDepartment} required>
              <SelectTrigger id="department" className="text-right bg-white text-nca-dark-blue">
                <SelectValue placeholder="اختر القسم" />
              </SelectTrigger>
              <SelectContent className="bg-white text-nca-dark-blue">
                <SelectItem value="it">تكنولوجيا المعلومات</SelectItem>
                <SelectItem value="security">الأمن السيبراني</SelectItem>
                
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium leading-none text-nca-light-blue">
              الدور الوظيفي
            </label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger id="role" className="text-right bg-white text-nca-dark-blue">
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent className="bg-white text-nca-dark-blue">
                <SelectItem value="manager">مدير</SelectItem>
                <SelectItem value="analyst">محلل</SelectItem>
                <SelectItem value="specialist">أخصائي</SelectItem>
                <SelectItem value="engineer">مهندس</SelectItem>
              </SelectContent>
            </Select>
          </div>

        {/*  <div className="space-y-2">
            <label htmlFor="specialization" className="text-sm font-medium leading-none text-nca-light-blue">
              التخصص
            </label>
            <Select value={specialization} onValueChange={setSpecialization} required>
              <SelectTrigger id="specialization" className="text-right bg-white text-nca-dark-blue">
                <SelectValue placeholder="اختر التخصص" />
              </SelectTrigger>
              <SelectContent className="bg-white text-nca-dark-blue">
                <SelectItem value="cybersecurity">أمن سيبراني</SelectItem>
                <SelectItem value="networking">شبكات</SelectItem>
                <SelectItem value="compliance">امتثال</SelectItem>
                <SelectItem value="risk">إدارة المخاطر</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none text-nca-light-blue">
              كلمة المرور
            </label>
            <Input
              id="password"
              type="password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-right bg-white text-nca-dark-blue"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium leading-none text-nca-light-blue">
              تأكيد كلمة المرور
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="أعد إدخال كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="text-right bg-white text-nca-dark-blue"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-100 p-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-md bg-green-100 p-3 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full mt-2 bg-nca-teal hover:bg-nca-teal-dark text-white"
            disabled={isLoading}
          >
            {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/signin" className="text-sm text-nca-teal hover:underline">
            لديك حساب بالفعل؟ تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  )
}
