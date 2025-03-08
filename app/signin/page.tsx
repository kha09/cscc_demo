"use client"

import type React from "react"

import { useState } from "react"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle sign in logic here
    console.log("Sign in with:", email, password)
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

          <Button type="submit" className="w-full bg-nca-teal hover:bg-nca-teal-dark text-white">
            دخول
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

