import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic'; // Force dynamic rendering, disable caching

// GET handler to fetch control assignments for analytics, filtered by the assigning security manager
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const securityManagerId = searchParams.get('securityManagerId');

  // Validate securityManagerId
  if (!securityManagerId) {
    return NextResponse.json({ message: "Security Manager ID query parameter is required" }, { status: 400 });
  }
  if (!z.string().uuid().safeParse(securityManagerId).success) {
    return NextResponse.json({ message: "Invalid Security Manager ID format" }, { status: 400 });
  }

  try {
    const assignments = await prisma.controlAssignment.findMany({
      where: {
        // Filter based on the ID of the user who assigned the parent task
        task: {
          assignedById: securityManagerId,
        },
        // Optionally, filter out assignments that haven't been evaluated yet
        // complianceLevel: {
        //   not: null // Only include assignments with a compliance level set
        // }
      },
      select: {
        id: true, // Include assignment ID if needed later
        complianceLevel: true, // The compliance level for this specific assignment
        control: { // Include details about the control
          select: {
            id: true,
            mainComponent: true, // The main component needed for grouping
            controlNumber: true, // Potentially useful for display
          }
        },
        // Optionally include task or user details if needed for further analysis
        // task: {
        //   select: {
        //     id: true,
        //     assignedToId: true, // Who the task was assigned to
        //   }
        // }
      },
      // No specific ordering needed for aggregation, but could add if required
    });

    // Return the raw data; aggregation will happen on the client-side
    return NextResponse.json(assignments);

  } catch (error) {
    console.error("Error fetching control assignments for analytics:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma Error Code:", error.code);
    }
    return NextResponse.json({ message: "Internal Server Error fetching analytics data" }, { status: 500 });
  }
}
