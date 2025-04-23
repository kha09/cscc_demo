import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Use named import
import { z } from 'zod';

// Zod schema for validation
const updateAssessmentSchema = z.object({
  assessmentName: z.string().min(1, "Assessment name cannot be empty"),
  // Add other fields that might be updatable via PATCH later
});

export async function PATCH(
  request: Request,
  { params }: { params: { assessmentId: string } }
) {
  const { assessmentId } = params;

  if (!assessmentId) {
    return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Validate request body
    const validation = updateAssessmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const { assessmentName } = validation.data;

    // Check if assessment exists
    const existingAssessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!existingAssessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Update the assessment
    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        assessmentName: assessmentName,
        // Add other fields from validation.data if they exist
      },
    });

    return NextResponse.json(updatedAssessment, { status: 200 });

  } catch (error) {
    console.error('Error updating assessment:', error);
    // Handle potential JSON parsing errors
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update assessment' }, { status: 500 });
  }
}

// Optional: Add GET handler if needed to fetch a single assessment by ID
export async function GET(
  request: Request,
  { params }: { params: { assessmentId: string } }
) {
  const { assessmentId } = params;

  if (!assessmentId) {
    return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
  }

  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      // Include related data if necessary
      // include: { sensitiveSystems: true }
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    return NextResponse.json(assessment, { status: 200 });

  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 });
  }
}

// Optional: Add DELETE handler if needed
// export async function DELETE(...) { ... }
