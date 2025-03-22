"use client"

import type React from "react"

import { useState } from "react"
import { Shield, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function SignIn() {
  const router = useRouter()
  const { login, getDashboardUrl } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Use the auth context login function
      const result = await login(email, password)

      if (!result.success) {
        throw new Error(result.error || "حدث خطأ أثناء تسجيل الدخول")
      }

      // Success
      setSuccess("تم تسجيل الدخول بنجاح! جاري تحويلك...")
      
      // Redirect to the appropriate dashboard
      setTimeout(() => {
        router.refresh() // Force a refresh to update the auth state
        router.push(getDashboardUrl()) // Redirect to the appropriate dashboard based on user role
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول")
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
          <h2 className="text-2xl font-bold text-white">تسجيل الدخول</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-nca-light-blue"
            >
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
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-nca-light-blue"
            >
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
            className="w-full bg-nca-teal hover:bg-nca-teal-dark text-white"
            disabled={isLoading}
          >
            {isLoading ? "جاري تسجيل الدخول..." : "دخول"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/signup" className="text-sm text-nca-teal hover:underline">
            إنشاء حساب جديد
          </Link>
        </div>
      </div>
    </div>
  )
}
