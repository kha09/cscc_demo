import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma, ControlAssignment } from '@prisma/client'; // Import ControlAssignment type

// GET handler to fetch control assignments, filtered by assignedUserId OR securityManagerId
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const securityManagerId = searchParams.get('securityManagerId');

  // Validate IDs - At least one must be provided and valid
  let filter: Prisma.ControlAssignmentWhereInput = {};

  if (userId) {
    if (!z.string().uuid().safeParse(userId).success) {
      return NextResponse.json({ message: "Invalid User ID format" }, { status: 400 });
    }
    filter = { assignedUserId: userId };
  } else if (securityManagerId) {
    if (!z.string().uuid().safeParse(securityManagerId).success) {
      return NextResponse.json({ message: "Invalid Security Manager ID format" }, { status: 400 });
    }
    // Filter by the ID of the user who assigned the parent task
    filter = { task: { assignedById: securityManagerId } };
  } else {
    return NextResponse.json({ message: "Either userId or securityManagerId query parameter is required" }, { status: 400 });
  }

  try {
    const assignments = await prisma.controlAssignment.findMany({
      where: filter,
      include: {
        control: { // Include details about the control
          select: {
            id: true,
            controlNumber: true,
            controlText: true,
            mainComponent: true,
            subComponent: true,
            controlType: true,
          }
        },
        task: { // Include details about the parent task
          select: {
            id: true,
            deadline: true,
            status: true,
            assignedById: true, // Include the assigner ID
            sensitiveSystem: { // Include the name of the sensitive system
              select: {
                systemName: true,
              }
            },
            assignedTo: { // Include the assigned department manager's name
              select: {
                name: true,
                nameAr: true,
              }
            }
          }
        },
        assignedUser: { // Include assigned user details if filtering by securityManagerId
          select: {
            id: true,
            name: true,
            nameAr: true,
          }
        },
        // Ensure manager review fields are included implicitly by the model type
      },
      orderBy: {
        // Optional: Order by task deadline or control number, or creation date
        createdAt: 'desc', // Example: order by creation date descending
        // task: {
        //   deadline: 'asc',
        // }
      }
    });

    // Explicitly type the response to ensure all fields are included
    const typedAssignments: ControlAssignment[] = assignments;

    return NextResponse.json(typedAssignments);

  } catch (error) {
    console.error("Error fetching control assignments:", error);
    // Handle potential Prisma errors or other unexpected errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors if necessary
        console.error("Prisma Error Code:", error.code);
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
