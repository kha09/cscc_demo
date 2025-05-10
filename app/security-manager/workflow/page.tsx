"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Activity, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface WorkflowStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
}

export default function SecurityManagerWorkflow() {
  const { user } = useAuth();
  const [stats, setStats] = useState<WorkflowStats>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflowStats = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Get user from localStorage for auth header
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          throw new Error('User not authenticated');
        }

        const response = await fetch('/api/control-assignments/analytics', {
          headers: {
            'Authorization': `Bearer ${encodeURIComponent(storedUser)}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch workflow statistics');
        }

        const data = await response.json();
        setStats({
          totalTasks: data.total || 0,
          completedTasks: data.completed || 0,
          inProgressTasks: data.inProgress || 0,
          pendingTasks: data.pending || 0
        });
      } catch (err) {
        console.error('Error fetching workflow stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load workflow statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflowStats();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>حدث خطأ: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">سير العمل</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المهام</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              جميع المهام المسندة
            </p>
          </CardContent>
        </Card>

        {/* Completed Tasks Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المهام المكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        {/* In Progress Tasks Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد التنفيذ</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.inProgressTasks / stats.totalTasks) * 100).toFixed(1)}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        {/* Pending Tasks Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في الانتظار</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.pendingTasks / stats.totalTasks) * 100).toFixed(1)}% من الإجمالي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>التقدم الكلي</span>
              <span>{((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 rounded-full transition-all duration-500"
                style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
