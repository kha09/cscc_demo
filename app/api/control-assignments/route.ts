import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// GET handler to fetch control assignments, filtered by assignedUserId
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  // Validate userId
  if (!userId) {
    return NextResponse.json({ message: "User ID query parameter is required" }, { status: 400 });
  }
  if (!z.string().uuid().safeParse(userId).success) {
    return NextResponse.json({ message: "Invalid User ID format" }, { status: 400 });
  }

  try {
    const assignments = await prisma.controlAssignment.findMany({
      where: {
        assignedUserId: userId,
      },
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
            status: true, // Include task status if needed, though assignment status might be more relevant
            sensitiveSystem: { // Include the name of the sensitive system
              select: {
                systemName: true,
              }
            }
          }
        }
        // We don't need to include assignedUser here as it's implicitly the user making the request
      },
      orderBy: {
        // Optional: Order by task deadline or control number
        task: {
          deadline: 'asc',
        }
      }
    });

    return NextResponse.json(assignments);

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
