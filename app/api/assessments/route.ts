import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Corrected import
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdirSync, existsSync } from 'fs'; // For creating directory if needed

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), 'public/uploads/logos');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const companyNameAr = formData.get('companyNameAr') as string;
    const companyNameEn = formData.get('companyNameEn') as string;
    const securityManagerId = formData.get('securityManagerId') as string;
    const secondaryContactNameAr = formData.get('secondaryContactNameAr') as string;
    const secondaryContactNameEn = formData.get('secondaryContactNameEn') as string;
    const secondaryContactMobile = formData.get('secondaryContactMobile') as string;
    const secondaryContactPhone = formData.get('secondaryContactPhone') as string;
    const secondaryContactEmail = formData.get('secondaryContactEmail') as string;
    const logoFile = formData.get('logo') as File | null;

    // --- Authentication Placeholder ---
    // In a real app, get the admin user's ID from the session/token
    const adminUserId = "placeholder-admin-user-id"; // Replace with actual auth logic
    // --- End Authentication Placeholder ---


    // Basic Validation
    if (!companyNameAr || !companyNameEn || !securityManagerId || !secondaryContactEmail || !adminUserId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    let logoPath: string | null = null;

    // Handle logo upload
    if (logoFile) {
      try {
        const bytes = await logoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create a unique filename (e.g., timestamp-originalname)
        const filename = `${Date.now()}-${logoFile.name.replace(/\s+/g, '_')}`;
        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, buffer);
        logoPath = `/uploads/logos/${filename}`; // Store the relative path accessible via web server
        console.log(`Logo uploaded to: ${filePath}`);
      } catch (uploadError) {
        console.error('Logo upload failed:', uploadError);
        // Decide if upload failure should prevent assessment creation
        // return NextResponse.json({ message: 'Logo upload failed' }, { status: 500 });
      }
    }

    // Create assessment in database
    const newAssessment = await prisma.assessment.create({
      data: {
        companyNameAr,
        companyNameEn,
        logoPath: logoPath, // Use the saved path or null
        securityManagerId,
        secondaryContactNameAr,
        secondaryContactNameEn,
        secondaryContactMobile,
        secondaryContactPhone,
        secondaryContactEmail,
        createdById: adminUserId, // Link to the admin who created it
      },
    });

    return NextResponse.json(newAssessment, { status: 201 });

  } catch (error) {
    console.error('Error creating assessment:', error);
    // Check for specific Prisma errors if needed
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
