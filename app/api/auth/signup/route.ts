import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, department, role: userRole, password, confirmPassword } = body;

    // Validate input
    if (!firstName || !lastName || !email || !department || !userRole || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'صيغة البريد الإلكتروني غير صحيحة' },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'كلمات المرور غير متطابقة' },
        { status: 400 }
      );
    }

    // Map role string from form to Prisma Role enum
    let prismaRole: Role;
    if (userRole === 'DEPARTMENT_MANAGER' || userRole === 'SECURITY_MANAGER' || userRole === 'USER') {
      // Directly use the value if it's one of the valid enum strings
      prismaRole = userRole as Role; 
    } else {
      // Default or handle unexpected values if necessary
      console.warn(`Unexpected role value received: ${userRole}. Defaulting to USER.`);
      prismaRole = 'USER'; 
    }

    // Create user
    const name = `${firstName} ${lastName}`;
    const user = await createUser(email, password, name, prismaRole, department);

    if (!user) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      );
    }

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: userPassword, ...userWithoutPassword } = user;
    return NextResponse.json(
      { 
        message: 'تم إنشاء الحساب بنجاح',
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in signup API:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    );
  }
}
