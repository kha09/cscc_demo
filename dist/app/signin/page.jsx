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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
export default function SignIn() {
    var _this = this;
    var router = useRouter();
    var _a = useAuth(), login = _a.login, getDashboardUrl = _a.getDashboardUrl;
    var _b = useState(""), email = _b[0], setEmail = _b[1];
    var _c = useState(""), password = _c[0], setPassword = _c[1];
    var _d = useState(false), isLoading = _d[0], setIsLoading = _d[1];
    var _e = useState(null), error = _e[0], setError = _e[1];
    var _f = useState(null), success = _f[0], setSuccess = _f[1];
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setIsLoading(true);
                    setError(null);
                    setSuccess(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, login(email, password)];
                case 2:
                    result = _a.sent();
                    if (!result.success) {
                        throw new Error(result.error || "حدث خطأ أثناء تسجيل الدخول");
                    }
                    // Success
                    setSuccess("تم تسجيل الدخول بنجاح! جاري تحويلك...");
                    // Redirect to the appropriate dashboard
                    setTimeout(function () {
                        router.refresh(); // Force a refresh to update the auth state
                        router.push(getDashboardUrl()); // Redirect to the appropriate dashboard based on user role
                    }, 1500);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError(err_1 instanceof Error ? err_1.message : "حدث خطأ أثناء تسجيل الدخول");
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-nca-light-blue">
              البريد الإلكتروني
            </label>
            <Input id="email" type="email" placeholder="أدخل بريدك الإلكتروني" value={email} onChange={function (e) { return setEmail(e.target.value); }} required className="text-right bg-white text-nca-dark-blue"/>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-nca-light-blue">
              كلمة المرور
            </label>
            <Input id="password" type="password" placeholder="أدخل كلمة المرور" value={password} onChange={function (e) { return setPassword(e.target.value); }} required className="text-right bg-white text-nca-dark-blue"/>
          </div>

          {error && (<div className="flex items-center gap-2 rounded-md bg-red-100 p-3 text-red-700">
              <AlertCircle className="h-5 w-5"/>
              <p className="text-sm">{error}</p>
            </div>)}

          {success && (<div className="flex items-center gap-2 rounded-md bg-green-100 p-3 text-green-700">
              <CheckCircle className="h-5 w-5"/>
              <p className="text-sm">{success}</p>
            </div>)}

          <Button type="submit" className="w-full bg-nca-teal hover:bg-nca-teal-dark text-white" disabled={isLoading}>
            {isLoading ? "جاري تسجيل الدخول..." : "دخول"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/signup" className="text-sm text-nca-teal hover:underline">
            إنشاء حساب جديد
          </Link>
        </div>
      </div>
    </div>);
}
