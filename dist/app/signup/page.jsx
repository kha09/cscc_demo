"use client";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
export default function SignUp() {
    var _this = this;
    var router = useRouter();
    var _a = useState(""), firstName = _a[0], setFirstName = _a[1];
    var _b = useState(""), lastName = _b[0], setLastName = _b[1];
    var _c = useState(""), email = _c[0], setEmail = _c[1];
    var _d = useState(""), department = _d[0], setDepartment = _d[1];
    var _e = useState(""), role = _e[0], setRole = _e[1];
    var _f = useState(""), password = _f[0], setPassword = _f[1];
    var _g = useState(""), confirmPassword = _g[0], setConfirmPassword = _g[1];
    var _h = useState(false), isLoading = _h[0], setIsLoading = _h[1];
    var _j = useState(null), error = _j[0], setError = _j[1];
    var _k = useState(null), success = _k[0], setSuccess = _k[1];
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setIsLoading(true);
                    setError(null);
                    setSuccess(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    // Validate form
                    if (password !== confirmPassword) {
                        setError("كلمات المرور غير متطابقة");
                        setIsLoading(false);
                        return [2 /*return*/];
                    }
                    if (password.length < 8) {
                        setError("يجب أن تكون كلمة المرور 8 أحرف على الأقل");
                        setIsLoading(false);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetch("/api/auth/signup", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                firstName: firstName,
                                lastName: lastName,
                                email: email,
                                department: department,
                                role: role,
                                password: password,
                                confirmPassword: confirmPassword,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (!response.ok) {
                        throw new Error(data.error || "حدث خطأ أثناء إنشاء الحساب");
                    }
                    // Success
                    setSuccess("تم إنشاء الحساب بنجاح! جاري تحويلك لصفحة تسجيل الدخول...");
                    // Redirect to signin page after 2 seconds
                    setTimeout(function () {
                        router.push("/signin");
                    }, 2000);
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    setError(err_1 instanceof Error ? err_1.message : "حدث خطأ أثناء إنشاء الحساب");
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="flex min-h-screen flex-col items-center justify-center bg-nca-dark-blue p-4" dir="rtl">
      <div className="w-full max-w-md rounded-lg border border-nca-teal bg-nca-dark-blue-light p-8 shadow-sm">
      <div className="flex items-center justify-center">
            <div className="relative h-21 w-21">
              <Image src="/static/image/logo.png" width={140} height={160} alt="Logo" className="object-contain"/>
            </div>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium leading-none text-nca-light-blue">
                الاسم الأول
              </label>
              <Input id="firstName" placeholder="الاسم الأول" value={firstName} onChange={function (e) { return setFirstName(e.target.value); }} required className="text-right bg-white text-nca-dark-blue"/>
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium leading-none text-nca-light-blue">
                اسم العائلة
              </label>
              <Input id="lastName" placeholder="اسم العائلة" value={lastName} onChange={function (e) { return setLastName(e.target.value); }} required className="text-right bg-white text-nca-dark-blue"/>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none text-nca-light-blue">
              البريد الإلكتروني
            </label>
            <Input id="email" type="email" placeholder="أدخل بريدك الإلكتروني" value={email} onChange={function (e) { return setEmail(e.target.value); }} required className="text-right bg-white text-nca-dark-blue"/>
          </div>

          <div className="space-y-2">
            <label htmlFor="department" className="text-sm font-medium leading-none text-nca-light-blue">
              القسم
            </label>
            <Select value={department} onValueChange={setDepartment} required>
              <SelectTrigger id="department" className="text-right bg-white text-nca-dark-blue">
                <SelectValue placeholder="اختر القسم"/>
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
                <SelectValue placeholder="اختر الدور"/>
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
            <Input id="password" type="password" placeholder="أدخل كلمة المرور" value={password} onChange={function (e) { return setPassword(e.target.value); }} required className="text-right bg-white text-nca-dark-blue"/>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium leading-none text-nca-light-blue">
              تأكيد كلمة المرور
            </label>
            <Input id="confirmPassword" type="password" placeholder="أعد إدخال كلمة المرور" value={confirmPassword} onChange={function (e) { return setConfirmPassword(e.target.value); }} required className="text-right bg-white text-nca-dark-blue"/>
          </div>

          {error && (<div className="flex items-center gap-2 rounded-md bg-red-100 p-3 text-red-700">
              <AlertCircle className="h-5 w-5"/>
              <p className="text-sm">{error}</p>
            </div>)}

          {success && (<div className="flex items-center gap-2 rounded-md bg-green-100 p-3 text-green-700">
              <CheckCircle className="h-5 w-5"/>
              <p className="text-sm">{success}</p>
            </div>)}

          <Button type="submit" className="w-full mt-2 bg-nca-teal hover:bg-nca-teal-dark text-white" disabled={isLoading}>
            {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/signin" className="text-sm text-nca-teal hover:underline">
            لديك حساب بالفعل؟ تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>);
}
