import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { reviewId } = data;

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    // Retrieve departmentManagerId from existing review
    const reviewRecord = await prisma.securityReview.findUnique({
      where: { id: reviewId },
      select: { departmentManagerId: true }
    });
    const departmentManagerId = reviewRecord?.departmentManagerId;
    if (!departmentManagerId) {
      return NextResponse.json(
        { error: "Department Manager ID not found on review" },
        { status: 400 }
      );
    }

    // Forward all pending join records for this review
    await prisma.securityReviewControlAssignment.updateMany({
      where: {
        securityReviewId: reviewId,
        forwarded: false
      },
      data: {
        forwarded: true,
        forwardedAt: new Date()
      }
    });


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error forwarding security review:", error);
    return NextResponse.json(
      { error: "Failed to forward security review" },
      { status: 500 }
    );
  }
}
