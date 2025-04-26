import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Force dynamic rendering, disable caching

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  // TODO: Add authentication check to ensure the requesting user
  // is the security manager themselves or an admin.
  const { userId } = params;

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Find all sensitive system info linked to assessments managed by this user
    const sensitiveSystems = await prisma.sensitiveSystemInfo.findMany({
      where: {
        assessment: {
          securityManagerId: userId,
        },
      },
      include: {
        assessment: { // Include assessment details if needed (e.g., company name)
          select: {
            id: true,
            companyNameAr: true,
            companyNameEn: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc', // Sort by creation date, newest first
      },
    });

    return NextResponse.json(sensitiveSystems);
  } catch (error) {
    console.error(`Error fetching sensitive systems for user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch sensitive system information' }, { status: 500 });
  }
}
