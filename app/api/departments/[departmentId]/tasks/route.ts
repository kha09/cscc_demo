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
  }).nullable(), // Allow null if the relation might not exist or isn't included
  controls: z.array(z.object({
    id: z.string(),
    controlText: z.string(),
    // Add other control fields if needed
  })),
  // Add other task fields if needed
});

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

    // Fetch tasks for the given departmentId
    const tasks = await prisma.task.findMany({
      where: {
        departmentId: departmentId,
      },
      include: {
        sensitiveSystem: { // Include the related sensitive system
          select: { systemName: true }, // Only select the systemName
        },
        controls: { // Include the related controls
          select: { id: true, controlText: true }, // Select specific fields from controls
        },
        // Add other relations if needed, e.g., assignedBy
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
