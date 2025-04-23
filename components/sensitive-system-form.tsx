"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Using Textarea for description
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For error messages
import { AlertTriangle } from "lucide-react"; // Import the icon

interface SensitiveSystemFormProps {
  assessmentId: string;
  onFormSubmit: () => void; // Callback after successful submission
}

interface FormData {
  systemName: string;
  systemCategory: string;
  systemDescription: string;
  assetRouterCount: number;
  assetSwitchCount: number;
  assetGatewayCount: number;
  assetFirewallCount: number;
  assetIPSIDSCount: number;
  assetAPTCount: number;
  assetDatabaseCount: number;
  assetStorageCount: number;
  assetMiddlewareCount: number;
  assetServerOSCount: number;
  assetApplicationCount: number;
  assetEncryptionDeviceCount: number;
  assetPeripheralCount: number;
  assetSupportStaffCount: number;
  assetDocumentationCount: number;
  otherAssetType: string;
  otherAssetCount: number;
  totalAssetCount: number;
}

const initialFormData: FormData = {
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
const AssetInput = ({ label, name, value, onChange }: { label: string; name: keyof FormData; value: number; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="space-y-1">
    <Label htmlFor={name} className="text-sm">{label}</Label>
    <Input
      id={name}
      name={name}
      type="number"
      min="0"
      value={value}
      onChange={onChange}
      className="text-right"
      placeholder="0"
    />
  </div>
);

export default function SensitiveSystemForm({ assessmentId, onFormSubmit }: SensitiveSystemFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate total assets whenever counts change
  useEffect(() => {
    const calculateTotal = () => {
      const counts = [
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
      const total = counts.reduce((sum, count) => sum + (Number(count) || 0), 0);
      setFormData(prev => ({ ...prev, totalAssetCount: total }));
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


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseInt(value, 10)) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/assessments/${assessmentId}/sensitive-systems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Reset form and call callback on success
      setFormData(initialFormData);
      onFormSubmit();

    } catch (err: unknown) { // Changed any to unknown
      console.error("Form submission error:", err);
      // Added instanceof Error check
      setError(err instanceof Error ? err.message : "فشل إرسال النموذج. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" /> {/* Assuming AlertTriangle is imported */}
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="systemName">اسم النظام <span className="text-red-500">*</span></Label>
          <Input id="systemName" name="systemName" value={formData.systemName} onChange={handleChange} required className="text-right" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="systemCategory">فئة النظام <span className="text-red-500">*</span></Label>
          {/* TODO: Replace with Select component if categories are predefined */}
          <Input id="systemCategory" name="systemCategory" value={formData.systemCategory} onChange={handleChange} required className="text-right" placeholder="مثال: خدمة إلكترونية"/>
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="systemDescription">وصف مختصر عن طبيعة عمل النظام <span className="text-red-500">*</span></Label>
        <Textarea id="systemDescription" name="systemDescription" value={formData.systemDescription} onChange={handleChange} required className="text-right" />
      </div>

      {/* Asset Counts */}
      <h3 className="text-lg font-semibold border-b pb-2 mb-4">عدد الأصول المكونة للنظام</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AssetInput label="الموجّه (Router)" name="assetRouterCount" value={formData.assetRouterCount} onChange={handleChange} />
        <AssetInput label="المبدلات (Switches)" name="assetSwitchCount" value={formData.assetSwitchCount} onChange={handleChange} />
        <AssetInput label="البوابات (Gateway)" name="assetGatewayCount" value={formData.assetGatewayCount} onChange={handleChange} />
        <AssetInput label="جدار الحماية (Firewall)" name="assetFirewallCount" value={formData.assetFirewallCount} onChange={handleChange} />
        <AssetInput label="كشف/منع التسلل (IPS/IDS)" name="assetIPSIDSCount" value={formData.assetIPSIDSCount} onChange={handleChange} />
        <AssetInput label="حماية APT" name="assetAPTCount" value={formData.assetAPTCount} onChange={handleChange} />
        <AssetInput label="قواعد البيانات (Database)" name="assetDatabaseCount" value={formData.assetDatabaseCount} onChange={handleChange} />
        <AssetInput label="وحدات التخزين (Storage)" name="assetStorageCount" value={formData.assetStorageCount} onChange={handleChange} />
        <AssetInput label="البرمجيات الوسيطة (Middleware)" name="assetMiddlewareCount" value={formData.assetMiddlewareCount} onChange={handleChange} />
        <AssetInput label="الخوادم وأنظمة التشغيل" name="assetServerOSCount" value={formData.assetServerOSCount} onChange={handleChange} />
        <AssetInput label="التطبيقات" name="assetApplicationCount" value={formData.assetApplicationCount} onChange={handleChange} />
        <AssetInput label="أجهزة التشفير" name="assetEncryptionDeviceCount" value={formData.assetEncryptionDeviceCount} onChange={handleChange} />
        <AssetInput label="الأجهزة الملحقة" name="assetPeripheralCount" value={formData.assetPeripheralCount} onChange={handleChange} />
        <AssetInput label="العاملون بالدعم" name="assetSupportStaffCount" value={formData.assetSupportStaffCount} onChange={handleChange} />
        <AssetInput label="الوثائق" name="assetDocumentationCount" value={formData.assetDocumentationCount} onChange={handleChange} />
      </div>

      {/* Other Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
         <div className="space-y-1">
          <Label htmlFor="otherAssetType">أخرى - نوع الأصل</Label>
          <Input id="otherAssetType" name="otherAssetType" value={formData.otherAssetType} onChange={handleChange} className="text-right" />
        </div>
         <div className="space-y-1">
          <Label htmlFor="otherAssetCount">أخرى - العدد</Label>
          <Input id="otherAssetCount" name="otherAssetCount" type="number" min="0" value={formData.otherAssetCount} onChange={handleChange} className="text-right" placeholder="0" />
        </div>
      </div>

       {/* Total Assets (Readonly) */}
      <div className="border-t pt-4 mt-4">
        <Label>إجمالي عدد الأصول المكونة للنظام</Label>
        <Input value={formData.totalAssetCount} readOnly className="mt-1 text-right bg-gray-100" />
      </div>


      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading} className="bg-nca-teal hover:bg-nca-teal-dark text-white">
          {isLoading ? "جاري الحفظ..." : "حفظ المعلومات"}
        </Button>
      </div>
    </form>
  );
}
