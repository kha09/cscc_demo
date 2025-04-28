import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Corrected import
import { v4 as uuidv4 } from 'uuid'; // For unique filenames
import { put } from '@vercel/blob';
import path from 'path';

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

    // 2. Parse the FormData
    const formData = await request.formData();
    const files = formData.getAll('files') as File[]; // Assuming input name is 'files'

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files were uploaded' }, { status: 400 });
    }

    const createdFiles = [];

    // 3. Process each file
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
      
      // 4. Upload to Vercel Blob Storage
      try {
        const { url } = await put(`control-files/${uniqueFilename}`, buffer, { 
          access: 'public' 
        });
        console.log(`File uploaded to Vercel Blob: ${url}`);
        
        // 5. Create a record in the database
        const createdFile = await prisma.controlFile.create({
          data: {
            filePath: url, // Store the full URL returned by Vercel Blob
            originalFilename: file.name,
            controlAssignmentId: assignmentId,
          },
        });
        createdFiles.push(createdFile);
      } catch (error) {
        console.error('Error uploading file to Vercel Blob:', error);
        return NextResponse.json({ error: `Failed to upload file ${file.name}` }, { status: 500 });
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
