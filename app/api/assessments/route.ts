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
    const assessmentName = formData.get('assessmentName') as string; // Get assessmentName
    const logoFile = formData.get('logo') as File | null;

    // --- Get Admin User ID (Temporary Fix) ---
    // Fetch the first admin user to associate with the assessment creation
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }, // Assuming Role enum is imported or use 'ADMIN' string
      select: { id: true },
    });

    if (!adminUser) {
      console.error('No ADMIN user found in the database.');
      return NextResponse.json({ message: 'Admin user not found to create assessment' }, { status: 500 });
    }
    const adminUserId = adminUser.id;
    // --- End Temporary Fix ---


    // Basic Validation
    if (!companyNameAr || !companyNameEn || !securityManagerId || !secondaryContactEmail || !assessmentName) { // Added assessmentName check
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Removed check for duplicate assessment names to allow duplicates

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
        assessmentName, // Add assessmentName here
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
