import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// Example API route demonstrating Vercel Blob usage
export async function POST(request: Request) {
  try {
    // This is a simple example showing how to upload a text file to Vercel Blob
    // In a real application, you would typically get the content from a form submission
    const { url } = await put('articles/blob.txt', 'Hello World!', { 
      access: 'public' 
    });

    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded successfully',
      url 
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload file' 
    }, { status: 500 });
  }
}

// Example of how to handle file uploads from a form
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Vercel Blob with a path based on the file name
    const { url } = await put(`articles/${file.name}`, buffer, { 
      access: 'public' 
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded successfully',
      url 
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload file' 
    }, { status: 500 });
  }
}
