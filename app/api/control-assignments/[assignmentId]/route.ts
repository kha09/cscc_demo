import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma, TaskStatus, ComplianceLevel } from '@prisma/client'; // Import ComplianceLevel enum

// Zod schema for validating the PATCH request body
const updateControlAssignmentSchema = z.object({
  assignedUserId: z.string().uuid({ message: "Invalid Assigned User ID" }).nullable().optional(), // Allow assigning/unassigning, make optional
  status: z.nativeEnum(TaskStatus).optional(), // Allow updating status
  notes: z.string().optional().nullable(), // الملاحظات
  correctiveActions: z.string().optional().nullable(), // إجراءات التصحيح
  expectedComplianceDate: z.string().datetime({ message: "Invalid date format for expected compliance date" }).optional().nullable(), // تاريخ الالتزام المتوقع (string from client)
  complianceLevel: z.nativeEnum(ComplianceLevel).optional().nullable(), // مستوى الالتزام
  // --- Added Manager Review Fields ---
  managerStatus: z.string().optional().nullable(), // حالة مراجعة المدير
  managerNote: z.string().optional().nullable(),   // ملاحظة المدير للمستخدم
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

    // Destructure all potential fields from validated data
    const {
        assignedUserId,
        status,
        notes,
        correctiveActions,
        expectedComplianceDate,
        complianceLevel,
        managerStatus, // Added
        managerNote    // Added
    } = validation.data;

    // TODO: Add authorization check: Ensure the user making the request is the assigned user for this assignment,
    // or their manager, or an Admin/Security Manager.
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

    // Prepare data for update - only include fields that are present in the request body
    const updateData: Prisma.ControlAssignmentUpdateInput = {};

    // Handle assignedUserId update
    if ('assignedUserId' in body) { // Check if the key exists in the original body
      if (assignedUserId === null) {
        updateData.assignedUser = { disconnect: true };
      } else if (assignedUserId) {
        // Connect the user if a valid ID is passed
        updateData.assignedUser = { connect: { id: assignedUserId } };
      }
      // If assignedUserId is undefined in validation.data but was in body, it means it wasn't provided or was invalid - do nothing
    }

    // Handle other fields
    if (status !== undefined) {
        updateData.status = status;
    }
    if (notes !== undefined) {
        updateData.notes = notes;
    }
    if (correctiveActions !== undefined) {
        updateData.correctiveActions = correctiveActions;
    }
    if (expectedComplianceDate !== undefined) {
        // Convert string date to Date object, or null if null was passed
        updateData.expectedComplianceDate = expectedComplianceDate ? new Date(expectedComplianceDate) : null;
    }
    if (complianceLevel !== undefined) {
        updateData.complianceLevel = complianceLevel;
    }
    // --- Handle Manager Review Fields ---
    if (managerStatus !== undefined) {
        updateData.managerStatus = managerStatus;
    }
    if (managerNote !== undefined) {
        updateData.managerNote = managerNote;
    }
    // --- End Handle Manager Review Fields ---

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: "No valid fields provided for update" }, { status: 400 });
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
