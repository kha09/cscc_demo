import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Zod schema for validating the POST request body
const securityApproveSchema = z.object({
  assessmentId: z.string().uuid({ message: "Invalid Assessment ID" }),
  sensitiveSystemId: z.string().uuid({ message: "Invalid Sensitive System ID" }),
  securityManagerId: z.string().uuid({ message: "Invalid Security Manager ID" }),
  departmentManagerId: z.string().uuid({ message: "Invalid Department Manager ID" }),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    console.log("Received security approval request:", body);
    
    const validation = securityApproveSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("Validation error:", validation.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { assessmentId, securityManagerId } = validation.data;
    // Prefix unused variables with underscore
    const _sensitiveSystemId = validation.data.sensitiveSystemId;
    const _departmentManagerId = validation.data.departmentManagerId;

    // Verify the security manager exists
    const securityManager = await prisma.user.findUnique({
      where: { id: securityManagerId },
    });

    if (!securityManager) {
      console.error("Security manager not found:", securityManagerId);
      return NextResponse.json({ error: 'Security manager not found' }, { status: 404 });
    }

    // Find any existing assessment status record for this assessment ID
    const existingStatuses = await prisma.assessmentStatus.findMany({
      where: {
        assessmentId,
      },
    });

    console.log("Found existing statuses:", existingStatuses.length);

    if (existingStatuses.length === 0) {
      return NextResponse.json(
        { error: 'No existing assessment status records found for this assessment' },
        { status: 404 }
      );
    }

    // Update all existing records for this assessment
    const updatePromises = existingStatuses.map((status: { id: string; assessmentId: string }) => 
      prisma.assessmentStatus.update({
        where: { id: status.id },
        data: {
          securityManagerStatus: 'FINISHED',
          updatedAt: new Date(),
        },
      })
    );

    const updatedStatuses = await Promise.all(updatePromises);
    console.log(`Updated ${updatedStatuses.length} assessment status records`);

    console.log("Assessment statuses updated:", updatedStatuses);
    return NextResponse.json({ success: true, updatedCount: updatedStatuses.length }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error approving assessment by security manager:', error);
    return NextResponse.json(
      { error: 'Failed to approve assessment' },
      { status: 500 }
    );
  }
}
