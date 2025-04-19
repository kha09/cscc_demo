"use client";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Using Textarea for description
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For error messages
import { AlertTriangle } from "lucide-react"; // Import the icon
var initialFormData = {
    systemName: "",
    systemCategory: "", // Consider using a Select component here if categories are predefined
    systemDescription: "",
    assetRouterCount: 0,
    assetSwitchCount: 0,
    assetGatewayCount: 0,
    assetFirewallCount: 0,
    assetIPSIDSCount: 0,
    assetAPTCount: 0,
    assetDatabaseCount: 0,
    assetStorageCount: 0,
    assetMiddlewareCount: 0,
    assetServerOSCount: 0,
    assetApplicationCount: 0,
    assetEncryptionDeviceCount: 0,
    assetPeripheralCount: 0,
    assetSupportStaffCount: 0,
    assetDocumentationCount: 0,
    otherAssetType: "",
    otherAssetCount: 0,
    totalAssetCount: 0, // Will be calculated
};
// Helper to create input fields for assets
var AssetInput = function (_a) {
    var label = _a.label, name = _a.name, value = _a.value, onChange = _a.onChange;
    return (<div className="space-y-1">
    <Label htmlFor={name} className="text-sm">{label}</Label>
    <Input id={name} name={name} type="number" min="0" value={value} onChange={onChange} className="text-right" placeholder="0"/>
  </div>);
};
export default function SensitiveSystemForm(_a) {
    var _this = this;
    var assessmentId = _a.assessmentId, onFormSubmit = _a.onFormSubmit;
    var _b = useState(initialFormData), formData = _b[0], setFormData = _b[1];
    var _c = useState(false), isLoading = _c[0], setIsLoading = _c[1];
    var _d = useState(null), error = _d[0], setError = _d[1];
    // Calculate total assets whenever counts change
    useEffect(function () {
        var calculateTotal = function () {
            var counts = [
                formData.assetRouterCount,
                formData.assetSwitchCount,
                formData.assetGatewayCount,
                formData.assetFirewallCount,
                formData.assetIPSIDSCount,
                formData.assetAPTCount,
                formData.assetDatabaseCount,
                formData.assetStorageCount,
                formData.assetMiddlewareCount,
                formData.assetServerOSCount,
                formData.assetApplicationCount,
                formData.assetEncryptionDeviceCount,
                formData.assetPeripheralCount,
                formData.assetSupportStaffCount,
                formData.assetDocumentationCount,
                formData.otherAssetCount,
            ];
            var total = counts.reduce(function (sum, count) { return sum + (Number(count) || 0); }, 0);
            setFormData(function (prev) { return (__assign(__assign({}, prev), { totalAssetCount: total })); });
        };
        calculateTotal();
    }, [
        formData.assetRouterCount, formData.assetSwitchCount, formData.assetGatewayCount,
        formData.assetFirewallCount, formData.assetIPSIDSCount, formData.assetAPTCount,
        formData.assetDatabaseCount, formData.assetStorageCount, formData.assetMiddlewareCount,
        formData.assetServerOSCount, formData.assetApplicationCount, formData.assetEncryptionDeviceCount,
        formData.assetPeripheralCount, formData.assetSupportStaffCount, formData.assetDocumentationCount,
        formData.otherAssetCount
    ]);
    var handleChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value, type = _a.type;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = type === 'number' ? (value === '' ? 0 : parseInt(value, 10)) : value, _a)));
        });
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setIsLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, fetch("/api/assessments/".concat(assessmentId, "/sensitive-systems"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(formData),
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.error || "HTTP error! status: ".concat(response.status));
                case 4:
                    // Reset form and call callback on success
                    setFormData(initialFormData);
                    onFormSubmit();
                    return [3 /*break*/, 7];
                case 5:
                    err_1 = _a.sent();
                    console.error("Form submission error:", err_1);
                    setError(err_1.message || "فشل إرسال النموذج. يرجى المحاولة مرة أخرى.");
                    return [3 /*break*/, 7];
                case 6:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    return (<form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {error && (<Alert variant="destructive">
          <AlertTriangle className="h-4 w-4"/> {/* Assuming AlertTriangle is imported */}
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>)}

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="systemName">اسم النظام <span className="text-red-500">*</span></Label>
          <Input id="systemName" name="systemName" value={formData.systemName} onChange={handleChange} required className="text-right"/>
        </div>
        <div className="space-y-1">
          <Label htmlFor="systemCategory">فئة النظام <span className="text-red-500">*</span></Label>
          {/* TODO: Replace with Select component if categories are predefined */}
          <Input id="systemCategory" name="systemCategory" value={formData.systemCategory} onChange={handleChange} required className="text-right" placeholder="مثال: خدمة إلكترونية"/>
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="systemDescription">وصف مختصر عن طبيعة عمل النظام <span className="text-red-500">*</span></Label>
        <Textarea id="systemDescription" name="systemDescription" value={formData.systemDescription} onChange={handleChange} required className="text-right"/>
      </div>

      {/* Asset Counts */}
      <h3 className="text-lg font-semibold border-b pb-2 mb-4">عدد الأصول المكونة للنظام</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AssetInput label="الموجّه (Router)" name="assetRouterCount" value={formData.assetRouterCount} onChange={handleChange}/>
        <AssetInput label="المبدلات (Switches)" name="assetSwitchCount" value={formData.assetSwitchCount} onChange={handleChange}/>
        <AssetInput label="البوابات (Gateway)" name="assetGatewayCount" value={formData.assetGatewayCount} onChange={handleChange}/>
        <AssetInput label="جدار الحماية (Firewall)" name="assetFirewallCount" value={formData.assetFirewallCount} onChange={handleChange}/>
        <AssetInput label="كشف/منع التسلل (IPS/IDS)" name="assetIPSIDSCount" value={formData.assetIPSIDSCount} onChange={handleChange}/>
        <AssetInput label="حماية APT" name="assetAPTCount" value={formData.assetAPTCount} onChange={handleChange}/>
        <AssetInput label="قواعد البيانات (Database)" name="assetDatabaseCount" value={formData.assetDatabaseCount} onChange={handleChange}/>
        <AssetInput label="وحدات التخزين (Storage)" name="assetStorageCount" value={formData.assetStorageCount} onChange={handleChange}/>
        <AssetInput label="البرمجيات الوسيطة (Middleware)" name="assetMiddlewareCount" value={formData.assetMiddlewareCount} onChange={handleChange}/>
        <AssetInput label="الخوادم وأنظمة التشغيل" name="assetServerOSCount" value={formData.assetServerOSCount} onChange={handleChange}/>
        <AssetInput label="التطبيقات" name="assetApplicationCount" value={formData.assetApplicationCount} onChange={handleChange}/>
        <AssetInput label="أجهزة التشفير" name="assetEncryptionDeviceCount" value={formData.assetEncryptionDeviceCount} onChange={handleChange}/>
        <AssetInput label="الأجهزة الملحقة" name="assetPeripheralCount" value={formData.assetPeripheralCount} onChange={handleChange}/>
        <AssetInput label="العاملون بالدعم" name="assetSupportStaffCount" value={formData.assetSupportStaffCount} onChange={handleChange}/>
        <AssetInput label="الوثائق" name="assetDocumentationCount" value={formData.assetDocumentationCount} onChange={handleChange}/>
      </div>

      {/* Other Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
         <div className="space-y-1">
          <Label htmlFor="otherAssetType">أخرى - نوع الأصل</Label>
          <Input id="otherAssetType" name="otherAssetType" value={formData.otherAssetType} onChange={handleChange} className="text-right"/>
        </div>
         <div className="space-y-1">
          <Label htmlFor="otherAssetCount">أخرى - العدد</Label>
          <Input id="otherAssetCount" name="otherAssetCount" type="number" min="0" value={formData.otherAssetCount} onChange={handleChange} className="text-right" placeholder="0"/>
        </div>
      </div>

       {/* Total Assets (Readonly) */}
      <div className="border-t pt-4 mt-4">
        <Label>إجمالي عدد الأصول المكونة للنظام</Label>
        <Input value={formData.totalAssetCount} readOnly className="mt-1 text-right bg-gray-100"/>
      </div>


      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading} className="bg-nca-teal hover:bg-nca-teal-dark text-white">
          {isLoading ? "جاري الحفظ..." : "حفظ المعلومات"}
        </Button>
      </div>
    </form>);
}
