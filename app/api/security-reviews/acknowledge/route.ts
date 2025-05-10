import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    // Get user from request
    const user = await getCurrentUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { reviewAssignmentIds } = data;

    if (!reviewAssignmentIds?.length) {
      return NextResponse.json(
        { error: "Review assignment IDs are required" },
        { status: 400 }
      );
    }

    // Verify user owns these assignments
    const assignments = await prisma.securityReviewControlAssignment.findMany({
      where: {
        id: { in: reviewAssignmentIds },
        controlAssignment: {
          assignedUserId: user.id,
        },
        forwarded: true,
        acknowledged: false,
      },
    });

    if (assignments.length !== reviewAssignmentIds.length) {
      return NextResponse.json(
        { error: "Some review assignments are not accessible" },
        { status: 403 }
      );
    }

    // Update all specified review assignments
    await prisma.$transaction(
      reviewAssignmentIds.map((id: string) =>
        prisma.securityReviewControlAssignment.update({
          where: { id },
          data: {
            acknowledged: true,
            acknowledgedAt: new Date(),
          },
        })
      )
    );

    return NextResponse.json({
      message: "Reviews acknowledged successfully",
    });
  } catch (error) {
    console.error("Error acknowledging security reviews:", error);
    return NextResponse.json(
      { error: "Failed to acknowledge security reviews" },
      { status: 500 }
    );
  }
}
