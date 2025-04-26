import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ComplianceLevel, ControlAssignment as _ControlAssignment, Task as _Task, SensitiveSystemInfo as _SensitiveSystemInfo } from '@prisma/client';

// Define the type for the data structure returned by the query
// We need the assignment's compliance level and the system ID from the related task
interface _AssignmentWithSystemId {
  id: string;
  complianceLevel: ComplianceLevel | null;
  task: {
    sensitiveSystemId: string; // Task has the direct link to the system
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const securityManagerId = searchParams.get('securityManagerId');

  if (!securityManagerId) {
    return NextResponse.json({ message: 'Security Manager ID is required' }, { status: 400 });
  }

  try {
    // Fetch assignments by traversing the relationships:
    // ControlAssignment -> Task -> SensitiveSystemInfo -> Assessment -> User (Security Manager)
    const assignments = await prisma.controlAssignment.findMany({
      where: {
        task: { // Filter based on the related Task
          sensitiveSystem: { // Filter based on the Task's related SensitiveSystemInfo
            assessment: { // Filter based on the SensitiveSystemInfo's related Assessment
              securityManagerId: securityManagerId, // Match the Security Manager ID
            },
          },
          // No need for explicit sensitiveSystemId check here, the relation path implies it exists
        },
      },
      select: {
        id: true,
        complianceLevel: true,
        task: { // Include the related task
          select: {
            sensitiveSystemId: true, // Select the sensitiveSystemId from the task
          },
        },
      },
    });

    // Process the assignments to get counts per system
    const analyticsBySystem: Record<string, { assigned: number; finished: number }> = {};

    // Let TypeScript infer the type from the 'select' clause
    assignments.forEach((assignment) => {
      // Get the systemId from the nested task object
      // The query ensures 'task' and 'sensitiveSystemId' exist if assignments are found
      const systemId = assignment.task.sensitiveSystemId;

      // Check if systemId is valid (it should be due to schema and query)
      if (!systemId) {
        console.warn(`Assignment ${assignment.id} is linked to a task without a sensitiveSystemId`);
        return;
      }

      // Initialize system entry if it doesn't exist
      if (!analyticsBySystem[systemId]) {
        analyticsBySystem[systemId] = { assigned: 0, finished: 0 };
      }

      // Increment assigned count for the system
      analyticsBySystem[systemId].assigned++;

      // Increment finished count if compliance level is IMPLEMENTED
      if (assignment.complianceLevel === ComplianceLevel.IMPLEMENTED) {
        analyticsBySystem[systemId].finished++;
      }
    });

    return NextResponse.json(analyticsBySystem); // Default status 200

  } catch (error) {
    console.error("Error fetching system analytics:", error);
    // Check for specific Prisma errors or return a generic message
    if (error instanceof Error) {
        // e.g., check for PrismaClientKnownRequestError, PrismaClientValidationError etc.
        return NextResponse.json({ message: `Failed to fetch system analytics: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
