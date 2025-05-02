import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const assessmentId = searchParams.get('assessmentId');
    const departmentManagerId = searchParams.get('departmentManagerId');

    console.log("Checking assessment status with params:", { assessmentId, departmentManagerId });

    if (!assessmentId || !departmentManagerId) {
      console.error("Missing required parameters:", { assessmentId, departmentManagerId });
      return NextResponse.json(
        { error: 'Missing required parameters: assessmentId and departmentManagerId' },
        { status: 400 }
      );
    }

    // Find the user to verify they are a department manager
    const user = await prisma.user.findUnique({
      where: { id: departmentManagerId },
    });

    if (!user) {
      console.error("Department manager not found:", departmentManagerId);
      return NextResponse.json({ error: 'Department manager not found' }, { status: 404 });
    }

    // Check if there's an existing AssessmentStatus record
    const existingStatus = await prisma.assessmentStatus.findFirst({
      where: {
        assessmentId,
        departmentManagerId,
        departmentManagerStatus: 'FINISHED',
      },
    });

    console.log("Assessment status check result:", { 
      assessmentId, 
      departmentManagerId, 
      approved: !!existingStatus,
      existingStatusId: existingStatus?.id
    });

    return NextResponse.json({ approved: !!existingStatus });
  } catch (error) {
    console.error('Error checking assessment status:', error);
    return NextResponse.json(
      { error: 'Failed to check assessment status' },
      { status: 500 }
    );
  }
}
