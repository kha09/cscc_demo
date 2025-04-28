# Using Vercel Blob Storage for File Uploads

This document explains how to use Vercel Blob Storage for file uploads in the CSCC project.

## Overview

The project now uses Vercel Blob Storage for file uploads instead of storing files locally in the filesystem. This provides several benefits:

- Files are stored in a scalable, reliable cloud storage service
- No need to worry about local disk space or file management
- Files are served from a global CDN for fast access
- Simplified deployment process (no need to manage uploaded files in the repository)

## Configuration

The Vercel Blob Storage integration requires an environment variable:

```
BLOB_READ_WRITE_TOKEN="your_token_here"
```

This token should be set in both `.env` and `.env.development` files. For production, you'll need to add this environment variable in your Vercel project settings.

## How to Use

### Basic Usage

To upload a file to Vercel Blob Storage:

```typescript
import { put } from '@vercel/blob';

// For text content
const { url } = await put('path/to/file.txt', 'Hello World!', { 
  access: 'public' 
});

// For binary content (e.g., from a file input)
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);
const { url } = await put(`path/to/${file.name}`, buffer, { 
  access: 'public' 
});

console.log('File uploaded to:', url);
```

### Implementation in the Project

The file upload functionality has been implemented in:

- `app/api/control-assignments/[assignmentId]/files/route.ts` - Handles file uploads for control assignments
- `app/api/blob-example/route.ts` - Contains example implementations for reference

### Access Control

Files can be uploaded with different access levels:

- `public` - Anyone with the URL can access the file
- `private` - Only authenticated users with the right permissions can access the file

For this project, we're using `public` access for simplicity.

## Example Implementation

Here's a simplified example of how file uploads are handled:

```typescript
// 1. Get the file from a form submission
const formData = await request.formData();
const file = formData.get('file') as File;

// 2. Convert to buffer
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);

// 3. Upload to Vercel Blob
const { url } = await put(`control-files/${file.name}`, buffer, { 
  access: 'public' 
});

// 4. Store the URL in the database
await prisma.controlFile.create({
  data: {
    filePath: url, // Store the full URL returned by Vercel Blob
    originalFilename: file.name,
    controlAssignmentId: assignmentId,
  },
});
```

## Testing

You can test the Blob Storage implementation using the example API route:

- `POST /api/blob-example` - Uploads a simple text file
- `PUT /api/blob-example` with a file in the form data - Uploads the provided file

## Resources

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Blob API Reference](https://vercel.com/docs/storage/vercel-blob/api-reference)
