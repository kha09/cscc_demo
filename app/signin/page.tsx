"use client"

import type React from "react"

import { useState } from "react"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"
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

      // Success - result.user should contain the logged-in user object
      if (result.user) {
        setSuccess("تم تسجيل الدخول بنجاح! جاري تحويلك...")
        const dashboardUrl = getDashboardUrl(result.user) // Calculate URL immediately
        router.replace(dashboardUrl) // Use replace for cleaner history
      } else {
        // Handle unexpected case where login succeeded but user object is missing
        setError("حدث خطأ غير متوقع بعد تسجيل الدخول.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-nca-dark-blue p-4" dir="rtl">
      <div className="w-full max-w-md rounded-lg border border-nca-teal bg-nca-dark-blue-light p-8 shadow-sm">
      <div className="flex items-center justify-center">
            <div className="relative h-21 w-21">
              <Image
                src="/static/image/logo.png" width={140} height={160}
                alt="Logo"
                
                className="object-contain"
              />
            </div>
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
