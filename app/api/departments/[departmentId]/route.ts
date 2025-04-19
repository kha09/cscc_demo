import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/departments/[departmentId] - Delete a department
export async function DELETE(
  request: Request,
  { params }: { params: { departmentId: string } }
) {
  const { departmentId } = params;

  if (!departmentId) {
    return NextResponse.json({ message: 'Department ID is required' }, { status: 400 });
  }

  try {
    // Check if the department exists before attempting deletion
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    }

    // TODO: Add logic here to check if any users are assigned to this department
    // before allowing deletion. If users are assigned, you might want to prevent
    // deletion or reassign them first, returning a 409 Conflict or similar error.
    // Example check (requires adding a relation in User model):
    // const usersInDepartment = await prisma.user.count({ where: { departmentId: departmentId } });
    // if (usersInDepartment > 0) {
    //   return NextResponse.json({ message: 'Cannot delete department with assigned users' }, { status: 409 });
    // }

    await prisma.department.delete({
      where: { id: departmentId },
    });

    return new NextResponse(null, { status: 204 }); // 204 No Content on successful deletion
  } catch (error) {
    console.error(`Error deleting department ${departmentId}:`, error);
    // Handle potential errors, e.g., foreign key constraints if users depend on it
    return NextResponse.json({ message: 'Failed to delete department' }, { status: 500 });
  }
}
