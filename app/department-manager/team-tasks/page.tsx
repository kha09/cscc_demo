"use client"

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  User as PrismaUser,
  Task as PrismaTask,
  Control as PrismaControl,
  SensitiveSystemInfo as PrismaSensitiveSystemInfo,
  ControlAssignment as PrismaControlAssignment,
  TaskStatus,
  ComplianceLevel
} from "@prisma/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select imports
import { ControlFile as PrismaControlFile } from "@prisma/client"; // Import ControlFile only here
import { ChevronDown as _ChevronDown, ChevronUp as _ChevronUp, FileText, Loader2 } from "lucide-react"; // Added FileText, Loader2
import React from "react"; // Keep React import if needed elsewhere, though useState/useEffect cover Fragment usage

// --- Type Definitions (Copied from original page.tsx) ---
type _FrontendUser = Pick<PrismaUser, 'id' | 'name' | 'nameAr' | 'email' | 'role' | 'department'>;

// Define FrontendControlFile based on Prisma model
type FrontendControlFile = Pick<PrismaControlFile, 'id' | 'filePath' | 'originalFilename' | 'createdAt'>;

interface FrontendControlAssignment extends Omit<PrismaControlAssignment, 'createdAt' | 'updatedAt' | 'control' | 'assignedUser' | 'files'> { // Removed 'files' from Omit
  control: Pick<PrismaControl, 'id' | 'controlNumber' | 'controlText' | 'mainComponent' | 'subComponent' | 'controlType'>;
  assignedUser: Pick<PrismaUser, 'id' | 'name' | 'nameAr'> | null;
  notes: string | null; // User notes
  status: TaskStatus;
  complianceLevel: ComplianceLevel | null;
  managerStatus: string | null; // Corrected: Removed optional '?'
  managerNote: string | null;   // Corrected: Removed optional '?'
}

interface FrontendTask extends Omit<PrismaTask, 'deadline' | 'createdAt' | 'updatedAt' | 'sensitiveSystem' | 'assignedTo' | 'controlAssignments'> {
  deadline: string;
  createdAt: string;
  sensitiveSystem: (Pick<PrismaSensitiveSystemInfo, 'systemName'> & {
    assessment?: { assessmentName: string } | null;
  }) | null;
  assignedTo: Pick<PrismaUser, 'id' | 'name' | 'nameAr'> | null;
  controlAssignments: FrontendControlAssignment[];
}
// --- End Type Definitions ---


export default function TeamTasksPage() {
  const { user } = useAuth();
  const [managerTasks, setManagerTasks] = useState<FrontendTask[]>([]); // Still needed to derive team assignments
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  // Removed isLoadingUsers as it's not directly used here for now
  const [error, setError] = useState<string | null>(null);
  const [expandedTeamAssignments, setExpandedTeamAssignments] = useState<Set<string>>(new Set());
  // State to hold manager updates for each assignment
  const [assignmentUpdates, setAssignmentUpdates] = useState<{
    [key: string]: { managerStatus?: string; managerNote?: string }
  }>({});
  // State for storing fetched files per assignment
  const [assignmentFiles, setAssignmentFiles] = useState<{ [key: string]: FrontendControlFile[] }>({});
  // State to track which assignments are currently loading files
  const [filesLoadingAssignments, setFilesLoadingAssignments] = useState<Set<string>>(new Set());
  const [securityReviews, setSecurityReviews] = useState<SecurityReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  type SecurityAction = 'CONFIRM' | 'REQUEST_REVIEW';

  interface SecurityReview {
    id: string;
    mainComponent: string;
    action: SecurityAction;
    note: string | null;
    createdAt: string;
    securityManager: {
      name: string;
      nameAr: string | null;
    };
    controlAssignments: {
      id: string;
      controlAssignment: {
        control: {
          controlNumber: string;
          controlText: string;
          subComponent: string | null;
        };
      };
    }[];
  }


  // --- Helper Functions (Copied from original page.tsx) ---
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch { return 'تاريخ غير صالح'; }
  };

  const getComplianceLevelText = (level: ComplianceLevel | null | undefined): string => {
    switch (level) {
      case ComplianceLevel.NOT_IMPLEMENTED: return "غير مطبق";
      case ComplianceLevel.PARTIALLY_IMPLEMENTED: return "مطبق جزئيًا";
      case ComplianceLevel.IMPLEMENTED: return "مطبق كليًا";
      case ComplianceLevel.NOT_APPLICABLE: return "لا ينطبق";
      default: return "غير محدد";
    }
  };

  const getComplianceLevelBackgroundColorClass = (level: ComplianceLevel | null | undefined): string => {
    switch (level) {
      case ComplianceLevel.IMPLEMENTED: return "bg-green-200 text-green-800";
      case ComplianceLevel.PARTIALLY_IMPLEMENTED: return "bg-yellow-200 text-yellow-800";
      case ComplianceLevel.NOT_IMPLEMENTED: return "bg-red-200 text-red-800";
      case ComplianceLevel.NOT_APPLICABLE: return "bg-gray-200 text-gray-800";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // Custom assignment state logic
  const getAssignmentState = (level: ComplianceLevel | null | undefined, deadline: string | undefined): string => {
    if (level != null) return 'مكتمل';
    const now = new Date();
    const dl = deadline ? new Date(deadline) : null;
    if (dl && now > dl) return 'متأخر';
    return 'قيد التنفيذ';
  };

  const getAssignmentStateBadgeClass = (state: string): string => {
    switch (state) {
      case 'مكتمل': return 'bg-green-100 text-green-700';
      case 'متأخر': return 'bg-red-100 text-red-700';
      case 'قيد التنفيذ': return 'bg-blue-100 text-blue-700'; // Changed from yellow to blue for consistency
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const _getStatusBadgeClass = (status: TaskStatus | undefined | null): string => {
    switch (status) {
      case TaskStatus.COMPLETED: return 'bg-green-100 text-green-700';
      case TaskStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case TaskStatus.OVERDUE: return 'bg-red-100 text-red-700';
      // case TaskStatus.APPROVED: return 'bg-purple-100 text-purple-700';
      // case TaskStatus.REJECTED: return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const toggleTeamAssignmentExpansion = (assignmentId: string) => {
    setExpandedTeamAssignments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(assignmentId)) {
        newSet.delete(assignmentId);
      } else {
        newSet.add(assignmentId);
      }
      return newSet;
    });

    // Determine if we are expanding (i.e., the ID was *not* previously in the set)
    const isExpanding = !expandedTeamAssignments.has(assignmentId);

    // Fetch files if expanding and not already loaded/loading
    if (isExpanding && !assignmentFiles[assignmentId] && !filesLoadingAssignments.has(assignmentId)) {
      fetchAssignmentFiles(assignmentId);
    }
  };

  // Handler for updating manager status/notes locally
  const handleAssignmentUpdateChange = (
    assignmentId: string,
    field: 'managerStatus' | 'managerNote',
    value: string
  ) => {
    setAssignmentUpdates(prev => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        [field]: value,
      },
    }));
  };

  // Function to save manager updates via API
  const handleSaveChanges = async (assignmentId: string) => {
    const updateData = assignmentUpdates[assignmentId];
    if (!updateData || (!updateData.managerStatus && !updateData.managerNote)) {
      // Don't save if no data or both fields are empty/undefined
      // Consider adding a user message here if needed
      return;
    }

    // Filter out undefined values before sending
    const payload = Object.entries(updateData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key as keyof typeof updateData] = value;
      }
      return acc;
    }, {} as { managerStatus?: string; managerNote?: string });


    // Add loading state for the specific button if desired
    console.log(`Saving changes for assignment ${assignmentId}:`, payload);

    try {
      const response = await fetch(`/api/control-assignments/${assignmentId}`, {
        method: 'PATCH', // Use PATCH as we are partially updating
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        throw new Error(errorData.message || `فشل حفظ التغييرات: ${response.statusText}`);
      }

      // Optionally: Refetch data or update local state more precisely
      // For now, just show success and maybe clear the update state for this item
      alert('تم حفظ التغييرات بنجاح!');
      // Update the main tasks state to reflect the saved changes immediately
      setManagerTasks(prevTasks => prevTasks.map(task => ({
        ...task,
        controlAssignments: task.controlAssignments.map(assignment => {
          if (assignment.id === assignmentId) {
            // Update the specific assignment with the saved data
            return {
              ...assignment,
              managerStatus: payload.managerStatus ?? assignment.managerStatus, // Use saved value or keep old if undefined
              managerNote: payload.managerNote ?? assignment.managerNote,     // Use saved value or keep old if undefined
            };
          }
          return assignment;
        }),
      })));
      // No need to refetch if we update the state directly.
      // We also don't clear assignmentUpdates here anymore; the updated managerTasks
      // state will now correctly feed the value prop of the inputs.
      // assignmentUpdates is now primarily used to track unsaved changes for the button's disabled state.

    } catch (error) {
      console.error('Error saving changes:', error);
      alert(error instanceof Error ? error.message : 'فشل حفظ التغييرات.');
    } finally {
      // Remove loading state if added
    }
  };

  // --- Fetch Files for a Specific Assignment ---
  const fetchAssignmentFiles = useCallback(async (assignmentId: string) => {
    setFilesLoadingAssignments(prev => new Set(prev).add(assignmentId));
    try {
      const response = await fetch(`/api/control-assignments/${assignmentId}/files`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.statusText}`);
      }
      const filesData: FrontendControlFile[] = await response.json();
      setAssignmentFiles(prev => ({ ...prev, [assignmentId]: filesData }));
    } catch (e: unknown) {
      console.error(`Failed to fetch files for assignment ${assignmentId}:`, e);
      // Optionally set an error state per assignment if needed
      setAssignmentFiles(prev => ({ ...prev, [assignmentId]: [] })); // Set empty array on error to prevent re-fetching
    } finally {
      setFilesLoadingAssignments(prev => {
        const newSet = new Set(prev);
        newSet.delete(assignmentId);
        return newSet;
      });
    }
  }, []);
  // --- End Fetch Files ---

  // --- End Helper Functions ---


  // --- Fetch Manager's Tasks (to derive team assignments) ---
  const fetchManagerTasks = useCallback(async () => {
    if (!user?.id) {
      setIsLoadingTasks(false);
      return;
    }
    setIsLoadingTasks(true);
    setError(null);
    try {
      const response = await fetch(`/api/tasks?assignedToId=${user.id}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to fetch manager tasks: ${response.statusText}`);
      }
      const tasksData: FrontendTask[] = await response.json();
      setManagerTasks(tasksData);
    } catch (e: unknown) {
      console.error("Failed to fetch tasks:", e);
      setError(e instanceof Error ? `فشل في جلب المهام: ${e.message}` : "فشل في جلب المهام بسبب خطأ غير معروف.");
    } finally {
      setIsLoadingTasks(false);
    }
  }, [user]);

  // --- Fetch Security Reviews ---
const fetchSecurityReviews = useCallback(async () => {
    if (!user?.id) return;
    setIsLoadingReviews(true);
    try {
      const response = await fetch(`/api/security-reviews/forwarded`, { 
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${encodeURIComponent(JSON.stringify(user))}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch security reviews');
      const data = await response.json();
      // Convert grouped data to flat array and assert type
      const reviews = Object.values(data).flat() as SecurityReview[];
      setSecurityReviews(reviews);
    } catch (error) {
      console.error('Error fetching security reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [user]);

  // Forward reviews to assigned users
  const handleForwardReviews = async (reviewId: string) => {
    try {
      if (!user?.id) {
        alert('يجب تسجيل الدخول لإرسال الملاحظات');
        return;
      }
      
      const response = await fetch('/api/security-reviews/forward', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${encodeURIComponent(JSON.stringify(user))}`
        },
        body: JSON.stringify({ 
          reviewId,
          departmentManagerId: user.id 
        }),
      });

      if (!response.ok) throw new Error('Failed to forward reviews');
      
      // Refresh reviews list
      fetchSecurityReviews();
      alert('تم إرسال الملاحظات بنجاح');
    } catch (error) {
      console.error('Error forwarding reviews:', error);
      alert('فشل في إرسال الملاحظات');
    }
  };

  useEffect(() => {
    fetchManagerTasks();
    fetchSecurityReviews();
  }, [fetchManagerTasks, fetchSecurityReviews]);
  // --- End Fetch Manager's Tasks ---

  // --- Calculate Team Assignments ---
  const teamAssignments = !isLoadingTasks ? managerTasks.flatMap((task: FrontendTask) =>
    task.controlAssignments
      .filter((assignment: FrontendControlAssignment) => assignment.assignedUserId && assignment.assignedUserId !== user?.id)
      .map((assignment: FrontendControlAssignment) => ({ ...assignment, taskDeadline: task.deadline, taskSystemName: task.sensitiveSystem?.systemName }))
   ) : [];
  // --- End Calculate Team Assignments ---

  return (
    <div>
      {/* Display General Errors */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">خطأ! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <h1 className="text-2xl font-bold text-slate-800 mb-6">مهام الفريق</h1>

      {/* Security Manager Notes Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">ملاحظات مدير الأمن</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingReviews ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
              <span>جاري تحميل الملاحظات...</span>
            </div>
          ) : securityReviews.length === 0 ? (
            <p className="text-gray-500 text-center p-4">لا توجد ملاحظات جديدة من مدير الأمن</p>
          ) : (
            <div className="space-y-4">
              {securityReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{review.mainComponent}</h3>
                      <p className="text-sm text-gray-600">
                        من: {review.securityManager.nameAr || review.securityManager.name}
                      </p>
                    </div>
                    <Badge className={review.action === 'CONFIRM' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                      {review.action === 'CONFIRM' ? 'اعتماد' : 'طلب مراجعة'}
                    </Badge>
                  </div>
                  {review.note && (
                    <div className="mb-3 bg-gray-50 rounded p-3">
                      <p className="text-sm">{review.note}</p>
                    </div>
                  )}
                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-2">الضوابط المتعلقة:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {review.controlAssignments.map((ca) => (
                        <li key={ca.id} className="text-sm">
                          {ca.controlAssignment.control.controlNumber} - {' '}
                          {ca.controlAssignment.control.subComponent || ca.controlAssignment.control.controlText}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleForwardReviews(review.id)}
                      className="bg-nca-teal hover:bg-nca-teal/90"
                    >
                      إرسال للمستخدم
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Tasks Section Card */}
      <Card className="p-6 mb-6">
        {/* Removed CardHeader and Title as it's redundant with page title */}
        {/* <CardHeader>
          <CardTitle className="text-xl font-semibold">مهام الفريق</CardTitle>
        </CardHeader> */}
        <CardContent className="pt-4"> {/* Added padding top */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-right border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-700 pr-4">الضابط</th>
                  <th className="pb-3 font-medium text-gray-700">النظام</th>
                  <th className="pb-3 font-medium text-gray-700">المستخدم المعين</th>
                  <th className="pb-3 font-medium text-gray-700">الموعد النهائي للمهمة</th>
                  <th className="pb-3 font-medium text-gray-700">الحالة</th>
                  <th className="pb-3 font-medium text-gray-700">مستوى الامتثال</th>
                  <th className="pb-3 font-medium text-gray-700 pl-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingTasks ? (
                  <tr><td colSpan={7} className="text-center py-4">جاري تحميل مهام الفريق...</td></tr>
                ) : teamAssignments.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4">لا توجد مهام معينة لأعضاء الفريق.</td></tr>
                ) : (
                  teamAssignments.map((assignment: FrontendControlAssignment & { taskDeadline?: string, taskSystemName?: string }) => (
                    <React.Fragment key={assignment.id}>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 pr-4">{assignment.control.controlNumber}</td>
                        <td className="py-4">{assignment.taskSystemName || 'غير محدد'}</td>
                        <td className="py-4">{assignment.assignedUser?.nameAr || assignment.assignedUser?.name || 'غير محدد'}</td>
                        <td className="py-4">{formatDate(assignment.taskDeadline)}</td>
                        <td className="py-4">
                          {/* Use the new state logic */}
                          {(() => {
                             const state = getAssignmentState(assignment.complianceLevel, assignment.taskDeadline);
                             return (
                               <Badge variant="secondary" className={getAssignmentStateBadgeClass(state)}>
                                 {state}
                               </Badge>
                             );
                          })()}
                        </td>
                        <td className="py-4">
                          <Badge variant="secondary" className={getComplianceLevelBackgroundColorClass(assignment.complianceLevel)}>
                            {getComplianceLevelText(assignment.complianceLevel)}
                          </Badge>
                        </td>
                        <td className="py-4 pl-4">
                          <Button variant="link" size="sm" onClick={() => toggleTeamAssignmentExpansion(assignment.id)} className="text-nca-teal hover:underline">
                            {expandedTeamAssignments.has(assignment.id) ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                          </Button>
                        </td>
                      </tr>
                      {/* Expanded Row for Team Assignment Details */}
                      {expandedTeamAssignments.has(assignment.id) && (
                        <tr className="bg-gray-100">
                          <td colSpan={7} className="p-4">
                            <h4 className="font-semibold mb-2 text-sm">تفاصيل الضابط: {assignment.control.controlNumber}</h4>
                            <p className="text-sm mb-1"><strong>النص:</strong> {assignment.control.controlText}</p>
                            <p className="text-sm mb-1"><strong>المكون الرئيسي:</strong> {assignment.control.mainComponent}</p>
                            <p className="text-sm mb-1"><strong>المكون الفرعي:</strong> {assignment.control.subComponent}</p>
                            <p className="text-sm mb-3"><strong>نوع الضابط:</strong> {assignment.control.controlType}</p>
                            <Label htmlFor={`notes-${assignment.id}`}>ملاحظات المقيّم:</Label>
                            <Textarea
                              id={`notes-${assignment.id}`}
                              value={assignment.notes ?? ''}
                              readOnly
                              className="w-full mt-1 bg-white"
                              rows={3}
                            />

                            {/* Manager Review Section */}
                            <div className="mt-4 pt-4 border-t border-gray-300">
                              <h5 className="font-semibold mb-3 text-sm">مراجعة المدير</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`manager-status-${assignment.id}`} className="mb-1 block">حالة الضابط</Label>
                                  <Select
                                    // Prioritize local updates, fallback to fetched value
                                    value={assignmentUpdates[assignment.id]?.managerStatus !== undefined
                                           ? assignmentUpdates[assignment.id]?.managerStatus
                                           : assignment.managerStatus ?? ''}
                                    onValueChange={(value) => handleAssignmentUpdateChange(assignment.id, 'managerStatus', value)}
                                  >
                                    <SelectTrigger id={`manager-status-${assignment.id}`} className="w-full bg-white">
                                      <SelectValue placeholder="اختر الحالة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="معتمد">معتمد</SelectItem>
                                      <SelectItem value="طلب مراجعة">طلب مراجعة</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor={`manager-note-${assignment.id}`} className="mb-1 block">ملاحظة للمستخدم</Label>
                                  <Textarea
                                    id={`manager-note-${assignment.id}`}
                                    placeholder="أضف ملاحظة للمستخدم هنا..."
                                    // Prioritize local updates, fallback to fetched value
                                    value={assignmentUpdates[assignment.id]?.managerNote !== undefined
                                           ? assignmentUpdates[assignment.id]?.managerNote
                                           : assignment.managerNote ?? ''}
                                    onChange={(e) => handleAssignmentUpdateChange(assignment.id, 'managerNote', e.target.value)}
                                    className="w-full bg-white"
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <div className="mt-3 text-right">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveChanges(assignment.id)}
                                  disabled={!assignmentUpdates[assignment.id]?.managerStatus && !assignmentUpdates[assignment.id]?.managerNote} // Disable if no changes
                                >
                                  حفظ التغييرات
                                </Button>
                              </div>
                            </div>

                            {/* User Uploaded Files Section */}
                            <div className="mt-4 pt-4 border-t border-gray-300">
                              <h5 className="font-semibold mb-3 text-sm">ملفات المستخدم</h5>
                              {filesLoadingAssignments.has(assignment.id) ? (
                                <div className="flex items-center text-gray-500">
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  <span>جاري تحميل الملفات...</span>
                                </div>
                              ) : assignmentFiles[assignment.id] && assignmentFiles[assignment.id].length > 0 ? (
                                <ul className="list-none space-y-2">
                                  {assignmentFiles[assignment.id].map((file) => (
                                    <li key={file.id} className="text-sm">
                                      <a
                                        href={file.filePath} // Use the path stored in DB
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-nca-teal hover:underline flex items-center"
                                      >
                                        <FileText className="mr-2 h-4 w-4" />
                                        {file.originalFilename}
                                      </a>
                                      <span className="text-xs text-gray-500 ml-2">({formatDate(file.createdAt)})</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500">لم يتم رفع أي ملفات لهذا الضابط.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
