import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod'; // For input validation
import { Role } from '@prisma/client';

// Define schema for validation
const userUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  nameAr: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional(),
  role: z.nativeEnum(Role).optional(),
  department: z.string().optional().nullable(),
  // Add other fields that can be updated, e.g., mobile, phone
  // Password updates should likely be handled separately for security
});

// PUT handler for updating a user
export async function PUT(request: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;
  // TODO: Add authentication and authorization check (ensure admin)

  try {
    const body = await request.json();
    const validation = userUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input", errors: validation.error.errors }, { status: 400 });
    }

    // Prevent updating email if it already exists for another user
    if (validation.data.email) {
        const existingUser = await prisma.user.findUnique({ where: { email: validation.data.email } });
        if (existingUser && existingUser.id !== userId) {
            return NextResponse.json({ message: 'Email already in use by another account' }, { status: 409 }); // Conflict
        }
    }


    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validation.data, // Use validated data
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error(`Failed to update user ${userId}:`, error);
    // Check for specific Prisma errors, e.g., record not found
    if (error.code === 'P2025') {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error: Failed to update user' }, { status: 500 });
  }
}

// PATCH handler specifically for updating the department (or other partial updates)
export async function PATCH(request: Request, { params }: { params: { userId: string } }) {
    const { userId } = params;
    // TODO: Add authentication and authorization check (ensure dept manager or admin)

    try {
        const body = await request.json();

        // Simple validation for this specific use case (updating department)
        if (typeof body.department !== 'string' && body.department !== null) {
             return NextResponse.json({ message: "Invalid input: 'department' must be a string or null." }, { status: 400 });
        }

        // Check if user exists
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
          return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Update only the department field
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                department: body.department, // Update the department
            },
             // Select fields to return, excluding password
            select: {
                id: true,
                name: true,
                nameAr: true,
                email: true,
                role: true,
                department: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return NextResponse.json(updatedUser);

    } catch (error: any) {
        console.error(`Failed to partially update user ${userId}:`, error);
        if (error.code === 'P2025') {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Internal Server Error: Failed to update user department' }, { status: 500 });
    }
}


// DELETE handler for deleting a user
export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;
  // TODO: Add authentication and authorization check (ensure admin)

  try {
    // Optional: Check if user exists before attempting delete
    // const userExists = await prisma.user.findUnique({ where: { id: userId } });
    // if (!userExists) {
    //   return NextResponse.json({ message: 'User not found' }, { status: 404 });
    // }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 }); // Or 204 No Content
  } catch (error: any) {
    console.error(`Failed to delete user ${userId}:`, error);
     // Check for specific Prisma errors, e.g., record not found
    if (error.code === 'P2025') {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    // Handle potential foreign key constraint errors if user is linked elsewhere
    if (error.code === 'P2003') {
       return NextResponse.json({ message: 'Cannot delete user: They are linked to other records (e.g., assessments).' }, { status: 409 }); // Conflict
    }
    return NextResponse.json({ message: 'Internal Server Error: Failed to delete user' }, { status: 500 });
  }
}
