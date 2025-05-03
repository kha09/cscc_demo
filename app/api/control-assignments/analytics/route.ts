import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic'; // Force dynamic rendering, disable caching

// GET handler to fetch control assignments for analytics, filtered by the assigning security manager
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const securityManagerId = searchParams.get('securityManagerId');
  const assessmentId = searchParams.get('assessmentId');

  // Validate parameters
  if (!securityManagerId && !assessmentId) {
    return NextResponse.json({ message: "Either Security Manager ID or Assessment ID query parameter is required" }, { status: 400 });
  }
  
  if (securityManagerId && !z.string().uuid().safeParse(securityManagerId).success) {
    return NextResponse.json({ message: "Invalid Security Manager ID format" }, { status: 400 });
  }
  
  if (assessmentId && !z.string().uuid().safeParse(assessmentId).success) {
    return NextResponse.json({ message: "Invalid Assessment ID format" }, { status: 400 });
  }

  try {
    // Build the where clause based on provided parameters
    const whereClause: {
      task?: {
        assignedById?: string;
        sensitiveSystem?: {
          assessmentId?: string;
        };
      };
    } = {};
    
    if (securityManagerId) {
      whereClause.task = {
        assignedById: securityManagerId,
      };
    }
    
    if (assessmentId) {
      whereClause.task = {
        ...whereClause.task,
        sensitiveSystem: {
          assessmentId: assessmentId,
        },
      };
    }

    const assignments = await prisma.controlAssignment.findMany({
      where: whereClause,
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

  } catch (error: unknown) {
    console.error("Error fetching control assignments for analytics:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma Error Code:", error.code);
    }
    return NextResponse.json({ message: "Internal Server Error fetching analytics data" }, { status: 500 });
  }
}
