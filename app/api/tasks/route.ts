import { NextRequest, NextResponse } from 'next/server'; // Import NextRequest
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Control, Task } from '@prisma/client'; // Added Task type import

// Zod schema for validating the request body
const createTaskSchema = z.object({
  sensitiveSystemId: z.string().uuid({ message: "Invalid Sensitive System ID" }),
  departmentId: z.string().uuid({ message: "Invalid Department ID" }),
  controlIds: z.array(z.string().uuid({ message: "Invalid Control ID in array" })).min(1, { message: "At least one control must be selected" }),
  deadline: z.string().datetime({ message: "Invalid deadline date format" }),
  assignedById: z.string().uuid({ message: "Invalid Assigned By User ID" }), // Assuming this comes from authenticated session later
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = createTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { sensitiveSystemId, departmentId, controlIds, deadline, assignedById } = validation.data;

    // TODO: In a real app, verify assignedById matches the authenticated user (Security Manager)

    // Verify existence of related entities (optional but good practice)
    const [systemExists, departmentExists, controlsExist, assignerExists] = await Promise.all([
      prisma.sensitiveSystemInfo.findUnique({ where: { id: sensitiveSystemId } }),
      prisma.department.findUnique({ where: { id: departmentId } }),
      prisma.control.findMany({ where: { id: { in: controlIds } } }),
      prisma.user.findUnique({ where: { id: assignedById, role: 'SECURITY_MANAGER' } }) // Ensure assigner is a Security Manager
    ]);

    if (!systemExists) {
      return NextResponse.json({ message: "Sensitive System not found" }, { status: 404 });
    }
    if (!departmentExists) {
      return NextResponse.json({ message: "Department not found" }, { status: 404 });
    }
    if (controlsExist.length !== controlIds.length) {
        const foundIds = controlsExist.map((c: Control) => c.id); // Added type for 'c'
        const missingIds = controlIds.filter(id => !foundIds.includes(id));
      return NextResponse.json({ message: `One or more Controls not found: ${missingIds.join(', ')}` }, { status: 404 });
    }
     if (!assignerExists) {
      return NextResponse.json({ message: "Assigning user not found or is not a Security Manager" }, { status: 404 });
    }


    // Create the task and connect controls
    const newTask = await prisma.task.create({
      data: {
        deadline: new Date(deadline), // Convert string to Date object
        sensitiveSystemId: sensitiveSystemId,
        departmentId: departmentId,
        assignedById: assignedById,
        status: 'PENDING', // Default status
        controls: {
          connect: controlIds.map(id => ({ id: id })), // Connect controls by their IDs
        },
      },
      include: {
        sensitiveSystem: true, // Include related data if needed in the response
        department: true,
        controls: true,
        assignedBy: { select: { id: true, name: true } } // Select specific user fields
      }
    });

    return NextResponse.json(newTask, { status: 201 });

  } catch (error) {
    console.error("Error creating task:", error);
    if (error instanceof z.ZodError) {
        // This case should ideally be caught by safeParse, but as a fallback
         return NextResponse.json({ message: "Validation failed", errors: error.errors }, { status: 400 });
    }
    // Handle potential Prisma errors or other unexpected errors
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}


// GET handler to fetch tasks, optionally filtered by departmentId
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get('departmentId');

  try {
    let tasks: Task[]; // Define tasks with Task[] type

    if (departmentId) {
      // Validate departmentId format (optional but good practice)
      if (!z.string().uuid().safeParse(departmentId).success) {
        return NextResponse.json({ message: "Invalid Department ID format" }, { status: 400 });
      }

      // Fetch tasks for a specific department
      tasks = await prisma.task.findMany({
        where: { departmentId: departmentId },
        include: {
          sensitiveSystem: true,
          department: true,
          controls: true,
          assignedBy: { select: { id: true, name: true } },
        },
        orderBy: {
          createdAt: 'desc', // Optional: order by creation date
        },
      });
    } else {
      // Fetch all tasks if no departmentId is provided
      // Consider adding pagination or limiting results in a real application
      tasks = await prisma.task.findMany({
        include: {
          sensitiveSystem: true,
          department: true,
          controls: true,
          assignedBy: { select: { id: true, name: true } },
        },
         orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json(tasks);

  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
