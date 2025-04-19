import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Corrected import

// GET /api/departments - Fetch all departments
export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        createdAt: 'asc', // Or 'name' if you prefer alphabetical order
      },
    });
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ message: 'Failed to fetch departments' }, { status: 500 });
  }
}

// POST /api/departments - Add a new department
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ message: 'Department name is required' }, { status: 400 });
    }

    // Check if department already exists (case-insensitive check might be good)
    const existingDepartment = await prisma.department.findUnique({
      where: { name: name.trim() },
    });

    if (existingDepartment) {
      return NextResponse.json({ message: 'Department already exists' }, { status: 409 }); // 409 Conflict
    }

    const newDepartment = await prisma.department.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(newDepartment, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Error creating department:', error);
    // Handle potential Prisma unique constraint errors more gracefully if needed
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
         return NextResponse.json({ message: 'Department already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create department' }, { status: 500 });
  }
}
