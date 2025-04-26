import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

// Define the structure for the summary analytics for a single system
interface SystemSummaryAnalytics {
  assigned: number; // Count of assignments with an assigned user but not completed
  finished: number; // Count of assignments with status COMPLETED
  // delayed: number; // Placeholder for future implementation if needed
}

// Define the structure for the API response: Record<systemId, SystemSummaryAnalytics>
type ApiResponse = Record<string, SystemSummaryAnalytics>;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const securityManagerId = searchParams.get('securityManagerId');

  // --- Input Validation ---
  if (!securityManagerId) {
    return NextResponse.json({ message: 'Security Manager ID query parameter is required' }, { status: 400 });
  }

  try {
    // 1. Find all assessments linked to the Security Manager
    const assessments = await prisma.assessment.findMany({
      where: { securityManagerId: securityManagerId },
      select: { id: true },
    });

    if (assessments.length === 0) {
      // No assessments means no systems to analyze for this manager
      return NextResponse.json({}); // Return empty object, not an error
    }
    const assessmentIds = assessments.map(a => a.id);

    // 2. Find all Sensitive Systems linked to these assessments
    const systems = await prisma.sensitiveSystemInfo.findMany({
      where: { assessmentId: { in: assessmentIds } },
      select: { id: true }, // Only need the IDs
    });

    if (systems.length === 0) {
      // No systems linked to the assessments
      return NextResponse.json({}); // Return empty object
    }
    const systemIds = systems.map(s => s.id);

    // 3. Find all Tasks linked to these Sensitive Systems
    const tasks = await prisma.task.findMany({
        where: { sensitiveSystemId: { in: systemIds } },
        select: { id: true, sensitiveSystemId: true } // Need task ID and the system it belongs to
    });

    if (tasks.length === 0) {
        // No tasks means no assignments to analyze
        return NextResponse.json({}); // Return empty object
    }
    const taskIds = tasks.map(t => t.id);
    // Create a map for quick lookup: taskId -> systemId
    const taskToSystemMap = new Map(tasks.map(t => [t.id, t.sensitiveSystemId]));


    // 4. Fetch all relevant Control Assignments linked to these Tasks
    const assignments = await prisma.controlAssignment.findMany({
      where: {
        taskId: { in: taskIds },
      },
      select: {
        id: true,
        status: true,
        assignedUserId: true,
        taskId: true, // Need taskId to link back to the system
      },
    });

    // 5. Calculate summary analytics for each system
    const summaryAnalytics: ApiResponse = {};

    // Initialize counts for all systems found earlier
    systemIds.forEach(systemId => {
        summaryAnalytics[systemId] = { assigned: 0, finished: 0 };
    });

    // Process assignments and update counts
    assignments.forEach(assignment => {
      const systemId = taskToSystemMap.get(assignment.taskId);
      if (!systemId || !summaryAnalytics[systemId]) {
          console.warn(`Assignment ${assignment.id} linked to unknown task/system or system not initialized.`);
          return; // Skip if the task/system mapping is broken
      }

      if (assignment.status === TaskStatus.COMPLETED) {
        summaryAnalytics[systemId].finished++;
      } else if (assignment.assignedUserId) { // If not completed, check if assigned
        summaryAnalytics[systemId].assigned++;
      }
      // Note: 'delayed' logic is not implemented here yet.
    });

    return NextResponse.json(summaryAnalytics); // Default status 200

  } catch (error) {
    console.error('Error fetching system summary analytics:', error);
    if (error instanceof Error) {
      return NextResponse.json({ message: `Failed to fetch system summary analytics: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
