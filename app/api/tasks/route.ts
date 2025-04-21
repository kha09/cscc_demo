import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
// Explicitly import types and Prisma namespace
import { Prisma } from '@prisma/client';
import type { Control, Task, User } from '@prisma/client';

// Zod schema for validating the POST request body
const createTaskSchema = z.object({
  sensitiveSystemId: z.string().uuid({ message: "Invalid Sensitive System ID" }),
  // departmentId: z.string().uuid({ message: "Invalid Department ID" }), // Removed
  assignedToId: z.string().uuid({ message: "Invalid Assigned To User ID (Department Manager)" }), // Added
  controlIds: z.array(z.string().uuid({ message: "Invalid Control ID in array" })).min(1, { message: "At least one control must be selected" }),
  deadline: z.string().datetime({ message: "Invalid deadline date format" }),
  assignedById: z.string().uuid({ message: "Invalid Assigned By User ID (Security Manager)" }), // Assuming this comes from authenticated session later
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = createTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // Destructure updated fields
    const { sensitiveSystemId, assignedToId, controlIds, deadline, assignedById } = validation.data;

    // TODO: In a real app, verify assignedById matches the authenticated user (Security Manager)

    // Verify existence of related entities (optional but good practice) - Updated checks
    const [systemExists, assigneeExists, controlsExist, assignerExists] = await Promise.all([
      prisma.sensitiveSystemInfo.findUnique({ where: { id: sensitiveSystemId } }),
      // prisma.department.findUnique({ where: { id: departmentId } }), // Removed department check
      prisma.user.findUnique({ where: { id: assignedToId, role: 'DEPARTMENT_MANAGER' } }), // Check if assignee is a Department Manager
      prisma.control.findMany({ where: { id: { in: controlIds } } }),
      prisma.user.findUnique({ where: { id: assignedById, role: 'SECURITY_MANAGER' } }) // Ensure assigner is a Security Manager
    ]);

    if (!systemExists) {
      return NextResponse.json({ message: "Sensitive System not found" }, { status: 404 });
    }
    // if (!departmentExists) { // Removed department check
    //   return NextResponse.json({ message: "Department not found" }, { status: 404 });
    // }
    if (!assigneeExists) { // Added assignee check
      return NextResponse.json({ message: "Assigned user (Department Manager) not found or does not have the correct role" }, { status: 404 });
    }
    if (controlsExist.length !== controlIds.length) {
        const foundIds = controlsExist.map((c: Control) => c.id);
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
        // departmentId: departmentId, // Removed
        assignedToId: assignedToId, // Added
        assignedById: assignedById,
        status: 'PENDING', // Default status
        controls: {
          connect: controlIds.map(id => ({ id: id })), // Connect controls by their IDs
        },
      },
      include: {
        sensitiveSystem: true,
        // department: true, // Removed
        controls: true,
        assignedBy: { select: { id: true, name: true } }, // Assigner (Security Manager)
        assignedTo: { select: { id: true, name: true, nameAr: true } } // Assignee (Department Manager)
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


// GET handler to fetch tasks, optionally filtered by assignedToId or assigned user's department
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const assignedToId = searchParams.get('assignedToId');
  const department = searchParams.get('department'); // Added department parameter

  try {
    let whereClause: Prisma.TaskWhereInput = {}; // Use Prisma type for where clause

    // Define the fields to include for controls
    const controlIncludeFields = {
        id: true,
        controlNumber: true,
        controlText: true,
        controlType: true,
        mainComponent: true,
        subComponent: true,
    };

    const includeOptions = {
      sensitiveSystem: { select: { systemName: true } }, // Only select needed fields
      // department: true, // Removed
      controls: { select: controlIncludeFields }, // Select specific control fields
      assignedBy: { select: { id: true, name: true } }, // Assigner (Security Manager)
      assignedTo: { select: { id: true, name: true, nameAr: true, department: true } } // Include department for filtering
    };

    // Correctly type orderByOptions
    const orderByOptions: Prisma.TaskOrderByWithRelationInput = {
      createdAt: 'desc',
    };

    // Apply filters based on query parameters
    if (assignedToId) {
      // Validate assignedToId format (UUID)
      if (!z.string().uuid().safeParse(assignedToId).success) {
        return NextResponse.json({ message: "Invalid Assigned To User ID format" }, { status: 400 });
      }
      whereClause.assignedToId = assignedToId;
    } else if (department) {
      // Filter by the department of the assigned user
      whereClause.assignedTo = {
        department: department,
      };
      // Optionally, you might want to ensure the assigned user is not null
      // whereClause.assignedToId = { not: null };
    }
    // If neither assignedToId nor department is provided, whereClause remains empty, fetching all tasks.
    // WARNING: Fetching all tasks without restriction is generally not recommended.
    // Consider adding role-based access or pagination.

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: includeOptions,
      orderBy: orderByOptions,
    });

    return NextResponse.json(tasks);

  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
