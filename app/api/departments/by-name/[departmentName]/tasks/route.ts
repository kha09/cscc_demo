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
  controls: z.array(z.object({
    id: z.string(),
    controlText: z.string(),
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

    // 2. Find the Department by its name
    const department = await prisma.department.findUnique({
      where: {
        name: departmentName, // Ensure the 'name' field is marked as @unique in your schema
      },
      select: { // Only select the ID, as that's all we need
        id: true,
      }
    });

    // 3. Handle case where department is not found
    if (!department) {
      // It's important that the department name in the User table exactly matches a name in the Department table
      return NextResponse.json({ message: `Department with name '${departmentName}' not found. Check if the name exists in the Department table and matches the name in the User table.` }, { status: 404 });
    }

    // 4. Fetch tasks using the found departmentId
    const tasks = await prisma.task.findMany({
      where: {
        departmentId: department.id, // Use the ID found from the name lookup
      },
      include: {
        sensitiveSystem: {
          select: { systemName: true },
        },
        controls: {
          select: { id: true, controlText: true },
        },
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
