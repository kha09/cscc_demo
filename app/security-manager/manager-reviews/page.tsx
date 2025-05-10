"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw } from "lucide-react";
import { SecurityAction } from "@prisma/client";

interface SecurityReview {
  id: string;
  mainComponent: string;
  action: 'CONFIRM' | 'REQUEST_REVIEW';
  note: string | null;
  createdAt: string;
  controlAssignments: {
    id: string;
    acknowledgedAt: string;
    controlAssignment: {
      id: string;
      managerStatus: string;
      managerNote: string | null;
      control: {
        controlNumber: string;
        controlText: string;
      };
    };
  }[];
}

type GroupedReviews = Record<string, SecurityReview[]>;

export default function SecurityManagerReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<GroupedReviews>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<SecurityReview | null>(null);
  const [formData, setFormData] = useState({
    action: "",
    note: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user from localStorage for auth header
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/security-reviews/manager-reviews', {
        headers: {
          'Authorization': `Bearer ${encodeURIComponent(storedUser)}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleActionClick = (review: SecurityReview) => {
    setSelectedReview(review);
    setFormData({
      action: "",
      note: "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedReview || !formData.action) return;

    setIsSaving(true);
    try {
      // Get user from localStorage for auth header
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/security-reviews/review-back', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${encodeURIComponent(storedUser)}`
        },
        body: JSON.stringify({
          reviewId: selectedReview.id,
          finalAction: formData.action,
          note: formData.note,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit response');
      }

      // Remove the handled review from the state
      setReviews(prev => {
        const newReviews = { ...prev };
        newReviews[selectedReview.mainComponent] = newReviews[selectedReview.mainComponent]
          .filter(r => r.id !== selectedReview.id);
        
        // If no more reviews for this mainComponent, remove the key
        if (newReviews[selectedReview.mainComponent].length === 0) {
          delete newReviews[selectedReview.mainComponent];
        }
        
        return newReviews;
      });

      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error submitting response:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit response');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">ملاحظات مدير القسم</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {Object.keys(reviews).length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            لا توجد مراجعات جديدة من مدراء الأقسام
          </Card>
        ) : (
          Object.entries(reviews).map(([mainComponent, componentReviews]) => (
            <Card key={mainComponent} className="mb-6 p-6">
              <h2 className="text-xl font-semibold mb-4">{mainComponent}</h2>
              <div className="space-y-4">
                {componentReviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Badge variant="outline" className={review.action === 'CONFIRM' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {review.action === 'CONFIRM' ? 'اعتماد' : 'طلب مراجعة'}
                        </Badge>
                        <span className="text-sm text-gray-500 mr-2">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActionClick(review)}
                      >
                        الإجراء
                      </Button>
                    </div>
                    {review.note && (
                      <p className="text-gray-600 mb-2">ملاحظاتي: {review.note}</p>
                    )}
                    {review.controlAssignments.some(ca => ca.controlAssignment.managerNote) && (
                      <div className="bg-gray-50 p-3 rounded mb-2">
                        <p className="font-medium mb-1">ملاحظات مدير القسم:</p>
                        {review.controlAssignments.map(ca => 
                          ca.controlAssignment.managerNote && (
                            <p key={ca.id} className="text-gray-600">{ca.controlAssignment.managerNote}</p>
                          )
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {review.controlAssignments.map((ca) => (
                        <Badge key={ca.id} variant="outline">
                          {ca.controlAssignment.control.controlNumber}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>الرد على مراجعة مدير القسم</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Select
                value={formData.action}
                onValueChange={(value) => setFormData(prev => ({ ...prev, action: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الإجراء" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SecurityAction.CONFIRM}>اعتماد نهائي</SelectItem>
                  <SelectItem value={SecurityAction.REQUEST_REVIEW}>إرسال إعادة مراجعة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.action === SecurityAction.REQUEST_REVIEW && (
              <div className="grid gap-2">
                <Textarea
                  placeholder="اكتب ملاحظاتك هنا..."
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving || !formData.action || (formData.action === SecurityAction.REQUEST_REVIEW && !formData.note)}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
