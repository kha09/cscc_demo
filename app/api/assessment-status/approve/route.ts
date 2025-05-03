import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
// Removed unused import: getServerSession

// Zod schema for validating the POST request body
const approveAssessmentSchema = z.object({
  assessmentId: z.string().uuid({ message: "Invalid Assessment ID" }),
  sensitiveSystemId: z.string().uuid({ message: "Invalid Sensitive System ID" }),
  securityManagerId: z.string().uuid({ message: "Invalid Security Manager ID" }),
  departmentManagerId: z.string().uuid({ message: "Invalid Department Manager ID" }),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    console.log("Received approval request:", body);
    
    const validation = approveAssessmentSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("Validation error:", validation.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { assessmentId, sensitiveSystemId, securityManagerId, departmentManagerId } = validation.data;

    // Verify the department manager exists
    const departmentManager = await prisma.user.findUnique({
      where: { id: departmentManagerId },
    });

    if (!departmentManager) {
      console.error("Department manager not found:", departmentManagerId);
      return NextResponse.json({ error: 'Department manager not found' }, { status: 404 });
    }

    // Check if an assessment status record already exists
    const existingStatus = await prisma.assessmentStatus.findFirst({
      where: {
        assessmentId,
        sensitiveSystemId,
        securityManagerId,
        departmentManagerId,
      },
    });

    console.log("Existing status:", existingStatus);

    let assessmentStatus;

    if (existingStatus) {
      // Update existing record
      assessmentStatus = await prisma.assessmentStatus.update({
        where: { id: existingStatus.id },
        data: {
          departmentManagerStatus: 'FINISHED',
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new record
      assessmentStatus = await prisma.assessmentStatus.create({
        data: {
          assessmentId,
          sensitiveSystemId,
          securityManagerId,
          departmentManagerId,
          departmentManagerStatus: 'FINISHED',
        },
      });
    }

    console.log("Assessment status updated/created:", assessmentStatus);
    return NextResponse.json(assessmentStatus, { status: 200 });
  } catch (error) {
    console.error('Error approving assessment:', error);
    return NextResponse.json(
      { error: 'Failed to approve assessment' },
      { status: 500 }
    );
  }
}
