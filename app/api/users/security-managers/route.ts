import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client'; // Import Role enum

export async function GET() {
  try {
    const securityManagers = await prisma.user.findMany({
      where: {
        role: Role.SECURITY_MANAGER, // Filter by role
      },
      select: { // Select only necessary fields for the dropdown
        id: true,
        name: true, // English name
        nameAr: true, // Arabic name
        email: true,
        mobile: true,
        phone: true,
      },
      orderBy: {
        name: 'asc', // Optional: order by name
      },
    });

    return NextResponse.json(securityManagers);
  } catch (error) {
    console.error('Error fetching security managers:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
