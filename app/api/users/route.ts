import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Corrected import

export async function GET() {
  try {
    // TODO: Add authentication and authorization check to ensure only admins can access this
    // For now, fetching all users without checks for demonstration
    const users = await prisma.user.findMany({
      // Optionally select specific fields or order them if needed
      // select: { id: true, name: true, email: true, role: true, department: true, jobTitle: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    // Avoid sending detailed error messages to the client in production
    return NextResponse.json({ message: 'Internal Server Error: Failed to fetch users' }, { status: 500 });
  }
}
