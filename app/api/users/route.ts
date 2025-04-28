import { NextRequest, NextResponse } from 'next/server'; // Import NextRequest
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role, Prisma } from '@prisma/client'; // Import Role enum and Prisma for types

// Force dynamic rendering to prevent caching of users list
export const dynamic = "force-dynamic";

// GET handler to fetch users with filtering
export async function GET(request: NextRequest) { // Use NextRequest to access searchParams
  try {
    // TODO: Add authentication and authorization check

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const roleParam = searchParams.get('role');
     const unassigned = searchParams.get('unassigned');

     const whereClause: Prisma.UserWhereInput = {}; // Changed let to const

     if (department) {
      whereClause.department = department;
    }

    if (roleParam && Object.values(Role).includes(roleParam as Role)) {
      whereClause.role = roleParam as Role;
    }

    if (unassigned === 'true') {
      // If unassigned=true is requested, filter for users with department set to null
      // This overrides any specific department filter if both are present (adjust logic if needed)
      whereClause.department = null;
    } else if (department) {
        // Only apply department filter if unassigned is not 'true'
        whereClause.department = department;
    }


    const users = await prisma.user.findMany({
      where: whereClause,
      // Select only necessary fields to avoid sending sensitive data like password
      select: {
        id: true,
        name: true,
        nameAr: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
        updatedAt: true,
        // Explicitly exclude password
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to fetch users' }, { status: 500 });
  }
}

// POST handler to create a new user
export async function POST(request: Request) { // Keep Request type here for body parsing
  try {
    // TODO: Add authentication and authorization check (ensure only ADMIN can create users)

    const body = await request.json();
    const { name, nameAr, email, password, role, department } = body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields (name, email, password, role)' }, { status: 400 });
    }

    // Validate Role
    if (!Object.values(Role).includes(role)) {
        return NextResponse.json({ message: 'Invalid role specified' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 }); // 409 Conflict
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        nameAr: nameAr || null, // Handle optional field
        email,
        password: hashedPassword,
        role, // Use the validated role
        department: department || null, // Handle optional field
        // Add default values for other fields if necessary based on your schema
      },
    });

    // Don't send the password back in the response
    const { password: _, ...userWithoutPassword } = newUser;

     return NextResponse.json(userWithoutPassword, { status: 201 }); // 201 Created

   } catch (error: unknown) {
     console.error('Failed to create user:', error);
     // Handle potential Prisma errors, e.g., unique constraint violation (though checked above)
     // Add type check for PrismaClientKnownRequestError
     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002' && (error.meta?.target as string[])?.includes('email')) {
          return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
     }
    return NextResponse.json({ message: 'Internal Server Error: Failed to create user' }, { status: 500 });
  }
}
