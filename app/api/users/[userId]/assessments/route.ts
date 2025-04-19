import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const assessments = await prisma.assessment.findMany({
      where: {
        securityManagerId: userId,
      },
      orderBy: {
        createdAt: 'desc', // Sort by creation date, newest first
      },
      // Optionally include related data if needed later
      // include: { sensitiveSystems: true }
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error(`Error fetching assessments for user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
  }
}
