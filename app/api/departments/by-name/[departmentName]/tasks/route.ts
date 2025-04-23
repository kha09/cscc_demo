import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema to validate the departmentName from the URL parameters
// We expect it to be a non-empty string after URL decoding.
const paramsSchema = z.object({
  departmentName: z.string().min(1, { message: "Department name cannot be empty" }),
});

// Define the expected structure of the response (same as the ID-based route)
const taskWithDetailsSchema = z.object({
  id: z.string(),
  deadline: z.date(),
  status: z.string(), // Consider z.nativeEnum(TaskStatus)
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
  })),
});

export async function GET(
  request: Request,
  { params }: { params: { departmentName: string } }
) {
  try {
    // 1. Decode and Validate the departmentName from the URL
    const decodedName = decodeURIComponent(params.departmentName);
    const validation = paramsSchema.safeParse({ departmentName: decodedName });

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { departmentName } = validation.data;

    // 2. Find the user(s) associated with this department name (assuming department manager role)
    const departmentUsers = await prisma.user.findMany({
      where: {
        department: departmentName,
        role: 'DEPARTMENT_MANAGER', // Assuming tasks are assigned to Department Managers
      },
      select: { id: true },
    });

    // 3. Handle case where no users are found for this department
    if (departmentUsers.length === 0) {
      // No manager found for this department, return empty list
      console.log(`No DEPARTMENT_MANAGER users found for department: ${departmentName}`);
      return NextResponse.json([]);
    }

    const userIds = departmentUsers.map(user => user.id);

    // 4. Fetch tasks assigned to these users
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
        createdAt: 'desc',
      },
    });

    // 5. Optional: Validate response data (good practice)
    const validatedTasks = z.array(taskWithDetailsSchema).safeParse(tasks);
    if (!validatedTasks.success) {
      console.error("Task data validation error (by name):", validatedTasks.error);
      // Log error but return original tasks for now
    }

    // 6. Return the fetched tasks
    return NextResponse.json(tasks);

  } catch (error) {
    console.error(`Error fetching tasks for department name '${params.departmentName}':`, error);
    // Add more specific error handling if needed (e.g., Prisma errors)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
