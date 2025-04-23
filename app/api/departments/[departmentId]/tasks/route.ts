import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema to validate the departmentId from the URL parameters
const paramsSchema = z.object({
  departmentId: z.string().uuid({ message: "Invalid Department ID format in URL" }),
});

// Define the expected structure of the response, including nested relations
// This helps ensure consistency and can be useful for frontend typing
// Note: Adjust based on the actual data needed by the frontend
const taskWithDetailsSchema = z.object({
  id: z.string(),
  deadline: z.date(),
  status: z.string(), // Consider using z.nativeEnum(TaskStatus) if TaskStatus is imported
  createdAt: z.date(),
  sensitiveSystem: z.object({
    systemName: z.string(),
  }).nullable(),
  // Update to reflect ControlAssignment structure
  controlAssignments: z.array(z.object({
    id: z.string(),
    status: z.string(), // Or z.nativeEnum(TaskStatus)
    control: z.object({
      id: z.string(),
      controlNumber: z.string(),
      controlText: z.string(),
    }),
    // Add other assignment fields if needed
  })),
});

// Define expected structure for User relation (if needed later)
// const userSchema = z.object({
//   id: z.string(),
//   name: z.string(),
// });

export async function GET(
  request: Request, // The incoming request object (unused here but required by Next.js)
  { params }: { params: { departmentId: string } } // Destructure params from the second argument
) {
  try {
    // Validate the departmentId from the URL
    const validation = paramsSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { departmentId } = validation.data;

    // 1. Find the department name
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { name: true },
    });

    if (!department) {
      return NextResponse.json({ message: "Department not found" }, { status: 404 });
    }

    // 2. Find the user(s) associated with this department name (assuming department manager role)
    // Adjust role filter if needed
    const departmentUsers = await prisma.user.findMany({
      where: {
        department: department.name,
        role: 'DEPARTMENT_MANAGER', // Assuming tasks are assigned to Department Managers
      },
      select: { id: true },
    });

    if (departmentUsers.length === 0) {
      // No manager found for this department, return empty list or appropriate response
      return NextResponse.json([]);
    }

    const userIds = departmentUsers.map(user => user.id);

    // 3. Fetch tasks assigned to these users
    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: {
          in: userIds, // Filter tasks assigned to any user in this department
        },
      },
      include: {
        sensitiveSystem: {
          select: { systemName: true },
        },
        // Include ControlAssignments and the nested Control
        controlAssignments: {
          include: {
            control: {
              select: { id: true, controlNumber: true, controlText: true },
            },
          },
        },
        assignedTo: { // Optionally include who the task is assigned to
          select: { id: true, name: true }
        },
        assignedBy: { // Optionally include who assigned the task
           select: { id: true, name: true }
        }
      },
      orderBy: {
        createdAt: 'desc', // Order tasks by creation date, newest first
      },
    });

    // Validate the fetched tasks against the response schema (optional but good practice)
    // This ensures the data structure matches expectations before sending
    const validatedTasks = z.array(taskWithDetailsSchema).safeParse(tasks);
     if (!validatedTasks.success) {
       console.error("Task data validation error:", validatedTasks.error);
       // Decide how to handle: return partial data, error, or log and return original tasks
       // For now, return the original tasks but log the validation error
       // return NextResponse.json({ message: "Task data validation failed on server" }, { status: 500 });
     }

    // Return the fetched tasks
    // Use validatedTasks.data if validation is strictly enforced, otherwise use tasks
    return NextResponse.json(tasks);

  } catch (error) {
    console.error("Error fetching tasks for department:", error);
    // Handle potential Prisma errors (e.g., department not found - though findMany won't error)
    // or other unexpected errors
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
