import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Corrected: Use named import

export async function GET() {
  try {
    const controls = await prisma.control.findMany({
      select: {
        id: true,
        controlText: true, // Select only id and the text
        controlNumber: true // Also fetch control number for potentially better display
      },
      orderBy: {
        // Optional: Order controls logically if needed, e.g., by controlNumber
        controlNumber: 'asc', 
      },
    });
    return NextResponse.json(controls);
  } catch (error) {
    console.error("Failed to fetch controls:", error);
    return NextResponse.json({ message: "Failed to fetch controls" }, { status: 500 });
  }
}
