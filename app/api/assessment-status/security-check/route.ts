import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const sensitiveSystemId = searchParams.get('sensitiveSystemId');
    const securityManagerId = searchParams.get('securityManagerId');
    
    if (!assessmentId || !sensitiveSystemId || !securityManagerId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Find any assessment status for this assessment
    // @ts-ignore - Prisma model name issue
    const statuses = await prisma.assessmentStatus.findMany({
      where: {
        assessmentId,
      },
      select: {
        securityManagerStatus: true
      }
    });

    // If any status is FINISHED, consider the whole assessment approved
    const isApproved = statuses.some((status: any) => status.securityManagerStatus === 'FINISHED');
    
    return NextResponse.json({ 
      securityManagerStatus: isApproved ? 'FINISHED' : null 
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking security manager status:', error);
    return NextResponse.json(
      { error: 'Failed to check security manager status' },
      { status: 500 }
    );
  }
}
