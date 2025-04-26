import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Corrected import
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // For unique filenames

// Define the upload directory relative to the project root
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'control-files');

export async function POST(request: Request, { params }: { params: { assignmentId: string } }) {
  const { assignmentId } = params;

  if (!assignmentId) {
    return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
  }

  try {
    // 1. Verify the ControlAssignment exists
    const assignment = await prisma.controlAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Control Assignment not found' }, { status: 404 });
    }

    // 2. Ensure the upload directory exists
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error: unknown) {
      console.error('Error creating upload directory:', error);
      return NextResponse.json({ error: 'Failed to prepare upload directory' }, { status: 500 });
    }

    // 3. Parse the FormData
    const formData = await request.formData();
    const files = formData.getAll('files') as File[]; // Assuming input name is 'files'

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files were uploaded' }, { status: 400 });
    }

    const createdFiles = [];

    // 4. Process each file
    for (const file of files) {
      if (!(file instanceof File)) {
        console.warn('Skipping non-file entry in FormData');
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate a unique filename to prevent collisions
      const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
      const fileExtension = path.extname(file.name);
      const uniqueFilename = `${path.basename(file.name, fileExtension)}-${uniqueSuffix}${fileExtension}`;
      const filePathDisk = path.join(UPLOAD_DIR, uniqueFilename);
      const filePathDb = `/uploads/control-files/${uniqueFilename}`; // Path for web access

      // 5. Save the file to disk
      try {
        await writeFile(filePathDisk, buffer);
        console.log(`File saved to: ${filePathDisk}`);
      } catch (error) {
        console.error('Error saving file:', error);
        // Consider cleanup logic here if needed (e.g., delete partially uploaded files)
        return NextResponse.json({ error: `Failed to save file ${file.name}` }, { status: 500 });
      }

      // 6. Create a record in the database
      try {
        const createdFile = await prisma.controlFile.create({
          data: {
            filePath: filePathDb,
            originalFilename: file.name,
            controlAssignmentId: assignmentId,
          },
        });
        createdFiles.push(createdFile);
      } catch (dbError) {
        console.error('Error saving file record to DB:', dbError);
        // Consider cleanup logic here (e.g., delete the file that was just saved to disk)
        return NextResponse.json({ error: 'Failed to save file metadata to database' }, { status: 500 });
      }
    }

    // 7. Return success response
    return NextResponse.json({
      message: `${createdFiles.length} file(s) uploaded successfully`,
      files: createdFiles,
    }, { status: 201 });

  } catch (error) {
    console.error('Error processing file upload:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during file upload' }, { status: 500 });
  }
}

// Optional: GET handler to list files for an assignment
export async function GET(request: Request, { params }: { params: { assignmentId: string } }) {
    const { assignmentId } = params;

    if (!assignmentId) {
        return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    try {
        const files = await prisma.controlFile.findMany({
            where: { controlAssignmentId: assignmentId },
            orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json(files, { status: 200 });

    } catch (error) {
        console.error('Error fetching files for assignment:', error);
        return NextResponse.json({ error: 'Failed to retrieve file list' }, { status: 500 });
    }
}
