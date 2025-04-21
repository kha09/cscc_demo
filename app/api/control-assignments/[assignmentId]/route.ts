import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma, TaskStatus } from '@prisma/client'; // Import Prisma namespace AND TaskStatus enum

// Zod schema for validating the PATCH request body
const updateControlAssignmentSchema = z.object({
  assignedUserId: z.string().uuid({ message: "Invalid Assigned User ID" }).nullable(), // Allow assigning or unassigning
  status: z.nativeEnum(TaskStatus).optional(), // Allow updating status as well - Use imported TaskStatus
  // Add other fields like evidenceNotes, evidenceFilePath if needed later
});

// PATCH handler to update a specific ControlAssignment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const assignmentId = params.assignmentId;

    // Validate assignmentId format
    if (!z.string().uuid().safeParse(assignmentId).success) {
      return NextResponse.json({ message: "Invalid Control Assignment ID format" }, { status: 400 });
    }

    const body = await request.json();

    // Validate request body
    const validation = updateControlAssignmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { assignedUserId, status } = validation.data;

    // TODO: Add authorization check: Ensure the user making the request is the Department Manager
    // responsible for the parent Task, or an Admin/Security Manager.

    // Check if the assignment exists
    const existingAssignment = await prisma.controlAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        task: { // Include task to potentially check the responsible manager
          select: { assignedToId: true }
        }
      }
    });

    if (!existingAssignment) {
      return NextResponse.json({ message: "Control Assignment not found" }, { status: 404 });
    }

    // Optional: Check if the assignedUserId exists and belongs to the correct department
    if (assignedUserId) {
      const userExists = await prisma.user.findUnique({
        where: { id: assignedUserId },
        select: { department: true } // Select department to potentially check against manager's department
      });
      if (!userExists) {
        return NextResponse.json({ message: "Assigned user not found" }, { status: 404 });
      }
      // Optional: Add logic here to verify user is in the manager's department if needed
      // if (userExists.department !== managerDepartment) { ... }
    }

    // Prepare data for update
    const updateData: Prisma.ControlAssignmentUpdateInput = {};
    if (assignedUserId !== undefined) { // Check if the key exists (even if null)
      if (assignedUserId === null) {
        // Disconnect the user if null is explicitly passed
        updateData.assignedUser = { disconnect: true };
      } else {
        // Connect the user if a valid ID is passed
        updateData.assignedUser = { connect: { id: assignedUserId } };
      }
    }
    if (status) {
        updateData.status = status;
        // If assigning a user, maybe default status to IN_PROGRESS?
        // if (assignedUserId && !status) {
        //     updateData.status = 'IN_PROGRESS';
        // }
    }


    // Update the ControlAssignment
    const updatedAssignment = await prisma.controlAssignment.update({
      where: { id: assignmentId },
      data: updateData,
      include: { // Include related data in the response
        control: true,
        assignedUser: { select: { id: true, name: true, nameAr: true } }
      }
    });

    return NextResponse.json(updatedAssignment, { status: 200 });

  } catch (error) {
    console.error("Error updating control assignment:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation failed", errors: error.errors }, { status: 400 });
    }
    // Handle potential Prisma errors (e.g., foreign key constraint if user doesn't exist)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Example: Foreign key constraint failed
        if (error.code === 'P2003') {
             return NextResponse.json({ message: "Invalid assigned user ID provided." }, { status: 400 });
        }
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
