import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Corrected import
import bcrypt from 'bcryptjs'; // Import bcrypt
import { Role } from '@prisma/client'; // Import Role enum for validation

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

// POST handler to create a new user
export async function POST(request: Request) {
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

  } catch (error: any) {
    console.error('Failed to create user:', error);
    // Handle potential Prisma errors, e.g., unique constraint violation (though checked above)
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
         return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal Server Error: Failed to create user' }, { status: 500 });
  }
}
