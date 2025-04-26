import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ComplianceLevel, TaskStatus } from '@prisma/client';

export const dynamic = 'force-dynamic'; // Force dynamic rendering, disable caching

// Define the structure for the chart data points
interface ChartDataPoint {
  name: string; // Main control name
  totalControls: number;
  withCompliance: number; // Count of assignments with a non-null complianceLevel
  withoutCompliance: number; // Count of assignments with a null complianceLevel
}

// Define the structure for the detailed assignment data we want to return
interface DetailedAssignmentData {
  id: string;
  status: TaskStatus;
  complianceLevel: ComplianceLevel | null;
  assignedUserId: string | null; // To check if assigned
  control: {
    id: string;
    mainComponent: string;
    subComponent: string | null;
    controlNumber: string;
    controlText: string;
  };
  // Add other fields if needed for display, e.g., notes, expected date
}

// Define the structure for the API response
interface ApiResponse {
  systemName: string;
  assignments: DetailedAssignmentData[];
  chartData: ChartDataPoint[]; // Add chart data to the response
}

// GET function to handle requests for detailed analytics of a specific system
export async function GET(
  request: Request,
  { params }: { params: { systemId: string } } // Get systemId from route parameters
) {
  const { searchParams } = new URL(request.url);
  const securityManagerId = searchParams.get('securityManagerId');
  const systemId = params.systemId; // Get systemId from the route

  // --- Input Validation ---
  if (!securityManagerId) {
    return NextResponse.json({ message: 'Security Manager ID query parameter is required' }, { status: 400 });
  }
  if (!systemId) {
    return NextResponse.json({ message: 'System ID route parameter is required' }, { status: 400 });
  }

  try {
    // 1. Fetch the Sensitive System Info to get its name (optional but good for context)
    const sensitiveSystem = await prisma.sensitiveSystemInfo.findUnique({
      where: { id: systemId },
      select: { systemName: true },
    });

    if (!sensitiveSystem) {
      return NextResponse.json({ message: `Sensitive System with ID ${systemId} not found` }, { status: 404 });
    }

    // 2. Fetch Control Assignments filtered by BOTH Security Manager and System ID
    const assignments = await prisma.controlAssignment.findMany({
      where: {
        // Filter by the specific systemId via the Task relationship
        taskId: {
          in: await prisma.task.findMany({
            where: { sensitiveSystemId: systemId },
            select: { id: true },
          }).then(tasks => tasks.map(t => t.id)), // Get task IDs for the system
        },
        // Ensure these assignments belong to the correct Security Manager
        // Traverse: ControlAssignment -> Task -> SensitiveSystem -> Assessment -> SecurityManager
        task: {
          sensitiveSystem: {
            assessment: {
              securityManagerId: securityManagerId,
            },
          },
        },
      },
      select: {
        id: true,
        status: true,
        complianceLevel: true,
        assignedUserId: true, // Needed to determine if assigned
        control: { // Include related control details
          select: {
            id: true,
            mainComponent: true,
            subComponent: true,
            controlNumber: true,
            controlText: true,
          },
        },
        // Select other fields if needed later (e.g., notes, dates)
      },
      orderBy: [ // Optional: Order for consistent display
        { control: { mainComponent: 'asc' } },
        { control: { controlNumber: 'asc' } },
      ]
    });

    // 3. Process assignments to generate chart data
    const chartDataMap: Record<string, ChartDataPoint> = {};

    assignments.forEach(assignment => {
      const mainComponent = assignment.control.mainComponent;
      if (!chartDataMap[mainComponent]) {
        chartDataMap[mainComponent] = {
          name: mainComponent,
          totalControls: 0,
          withCompliance: 0,
          withoutCompliance: 0,
        };
      }

      chartDataMap[mainComponent].totalControls++;
      if (assignment.complianceLevel) {
        chartDataMap[mainComponent].withCompliance++;
      } else {
        // Count as 'withoutCompliance' if complianceLevel is null or undefined
        chartDataMap[mainComponent].withoutCompliance++;
      }
    });

    const chartDataResult: ChartDataPoint[] = Object.values(chartDataMap);

    // 4. Format the response including chart data
    const responseData: ApiResponse = {
      systemName: sensitiveSystem.systemName,
      assignments: assignments as DetailedAssignmentData[],
      chartData: chartDataResult,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`Error fetching detailed analytics for system ${systemId}:`, error);
    if (error instanceof Error) {
      return NextResponse.json({ message: `Failed to fetch detailed system analytics: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
