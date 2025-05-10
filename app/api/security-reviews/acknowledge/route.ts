import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user?.id || user.role !== 'DEPARTMENT_MANAGER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { reviewId, action, note } = data;

    if (!reviewId || !action) {
      return NextResponse.json(
        { error: "Review ID and action are required" },
        { status: 400 }
      );
    }

    // Note is optional but should be required for REQUEST_REVIEW action
    if (action === 'REQUEST_REVIEW' && !note) {
      return NextResponse.json(
        { error: "Note is required when requesting review" },
        { status: 400 }
      );
    }

    // Get the review and verify it's forwarded
    const review = await prisma.securityReview.findUnique({
      where: { id: reviewId },
      include: {
        controlAssignments: true
      }
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    // Verify all control assignments are forwarded
    const allForwarded = review.controlAssignments.every(ca => ca.forwarded);
    if (!allForwarded) {
      return NextResponse.json(
        { error: "Review must be forwarded before acknowledgement" },
        { status: 400 }
      );
    }

    // Start a transaction to update both SecurityReviewControlAssignment and ControlAssignment
    await prisma.$transaction(async (tx) => {
      // Update SecurityReviewControlAssignment records
      await tx.securityReviewControlAssignment.updateMany({
        where: {
          securityReviewId: reviewId
        },
        data: {
          acknowledged: true,
          acknowledgedAt: new Date()
        }
      });

      // Get all control assignment IDs from the review
      const controlAssignmentIds = review.controlAssignments.map(ca => ca.controlAssignmentId);

      // Update ControlAssignment records with the appropriate status
      await tx.controlAssignment.updateMany({
        where: {
          id: {
            in: controlAssignmentIds
          }
        },
        data: {
          managerStatus: action === 'CONFIRM' ? 'معتمد' : 'طلب مراجعة',
          managerNote: note || null
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error acknowledging security review:", error);
    return NextResponse.json(
      { error: "Failed to acknowledge security review" },
      { status: 500 }
    );
  }
}
