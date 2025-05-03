import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const assessmentId = searchParams.get('assessmentId');
    const sensitiveSystemId = searchParams.get('sensitiveSystemId');
    const securityManagerId = searchParams.get('securityManagerId');
    const departmentManagerId = searchParams.get('departmentManagerId');

    // Build the where clause based on provided parameters
    const whereClause: {
      assessmentId?: string;
      sensitiveSystemId?: string;
      securityManagerId?: string;
      departmentManagerId?: string;
    } = {};
    
    if (assessmentId) {
      whereClause.assessmentId = assessmentId;
    }
    
    if (sensitiveSystemId) {
      whereClause.sensitiveSystemId = sensitiveSystemId;
    }
    
    if (securityManagerId) {
      whereClause.securityManagerId = securityManagerId;
    }
    
    if (departmentManagerId) {
      whereClause.departmentManagerId = departmentManagerId;
    }

    // Fetch assessment statuses
    const assessmentStatuses = await prisma.assessmentStatus.findMany({
      where: whereClause,
      include: {
        assessment: {
          select: {
            id: true,
            assessmentName: true,
            companyNameEn: true,
            companyNameAr: true,
          },
        },
        sensitiveSystem: {
          select: {
            id: true,
            systemName: true,
            systemCategory: true,
          },
        },
        securityManager: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            email: true,
          },
        },
        departmentManager: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            email: true,
            department: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(assessmentStatuses);
  } catch (error: unknown) {
    console.error('Error fetching assessment statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment statuses' },
      { status: 500 }
    );
  }
}
