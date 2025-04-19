'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Trash2 } from 'lucide-react'; // Icon for delete button
import { useAuth } from '@/lib/auth-context'; // Assuming you have auth context
import { useRouter } from 'next/navigation';

interface Department {
    id: string;
    name: string;
    createdAt: string; // Or Date if you parse it
    updatedAt: string; // Or Date
}

export default function ManageDepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addError, setAddError] = useState<string | null>(null);

    const { user } = useAuth(); // Get user info for role checks if needed
    const router = useRouter();

    // Redirect if not a security manager (or admin)
    // useEffect(() => {
    //     if (user && user.role !== 'SECURITY_MANAGER' && user.role !== 'ADMIN') {
    //         router.push('/unauthorized'); // Or your login/home page
    //     }
    // }, [user, router]);

    // Fetch departments on component mount
    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/departments');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: Department[] = await response.json();
            setDepartments(data);
        } catch (err) {
            console.error("Failed to fetch departments:", err);
            setError('فشل في تحميل قائمة الأقسام.');
            if (err instanceof Error) {
                setError(`فشل في تحميل قائمة الأقسام: ${err.message}`);
            } else {
                setError('فشل في تحميل قائمة الأقسام.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddDepartment = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAddError(null);
        if (!newDepartmentName.trim()) {
            setAddError('اسم القسم مطلوب.');
            return;
        }

        try {
            const response = await fetch('/api/departments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newDepartmentName.trim() }),
            });

            const result = await response.json();

            if (!response.ok) {
                 // Use message from API if available, otherwise generic error
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            setNewDepartmentName(''); // Clear input
            fetchDepartments(); // Refresh the list
        } catch (err) {
             console.error("Failed to add department:", err);
             if (err instanceof Error) {
                setAddError(`فشل في إضافة القسم: ${err.message}`);
            } else {
                setAddError('فشل في إضافة القسم.');
            }
        }
    };

    const handleDeleteDepartment = async (departmentId: string) => {
        // Optional: Add a confirmation dialog here
        if (!confirm(`هل أنت متأكد من رغبتك في حذف هذا القسم؟ لا يمكن التراجع عن هذا الإجراء.`)) {
             return;
        }

        try {
            const response = await fetch(`/api/departments/${departmentId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                // Try to get error message from response body if available
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const result = await response.json();
                    errorMsg = result.message || errorMsg;
                } catch (_) {
                    // Ignore if response body is not JSON or empty
                }
                 throw new Error(errorMsg);
            }

            fetchDepartments(); // Refresh the list
        } catch (err) {
            console.error("Failed to delete department:", err);
             if (err instanceof Error) {
                alert(`فشل في حذف القسم: ${err.message}`); // Use alert for delete errors
            } else {
                alert('فشل في حذف القسم.');
            }
        }
    };

    // Optional: Add loading state check for user role if implementing redirection
    // if (!user) return <div>Loading user data...</div>;

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">إدارة الأقسام</h1>

            {/* Add Department Form */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>إضافة قسم جديد</CardTitle>
                </CardHeader>
                <form onSubmit={handleAddDepartment}>
                    <CardContent>
                        <Input
                            type="text"
                            placeholder="أدخل اسم القسم الجديد"
                            value={newDepartmentName}
                            onChange={(e) => setNewDepartmentName(e.target.value)}
                            required
                            className="mb-2"
                        />
                        {addError && <p className="text-red-500 text-sm">{addError}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">إضافة القسم</Button>
                    </CardFooter>
                </form>
            </Card>

            {/* Departments List */}
            <Card>
                <CardHeader>
                    <CardTitle>الأقسام الحالية</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && <p>جاري تحميل الأقسام...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!isLoading && !error && departments.length === 0 && (
                        <p>لا توجد أقسام مضافة حالياً.</p>
                    )}
                    {!isLoading && !error && departments.length > 0 && (
                        <ul className="space-y-3">
                            {departments.map((dept) => (
                                <li key={dept.id} className="flex justify-between items-center p-3 border rounded-md bg-gray-50">
                                    <span className="font-medium">{dept.name}</span>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteDepartment(dept.id)}
                                        aria-label={`حذف قسم ${dept.name}`}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        حذف
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
