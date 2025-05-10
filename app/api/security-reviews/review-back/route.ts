import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/api-auth";
import { SecurityAction } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user?.id || user.role !== 'SECURITY_MANAGER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { reviewId, finalAction, note } = data;

    if (!reviewId || !finalAction || (finalAction === SecurityAction.REQUEST_REVIEW && !note)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the review and verify it belongs to this security manager
    const review = await prisma.securityReview.findFirst({
      where: {
        id: reviewId,
        securityManagerId: user.id,
        controlAssignments: {
          some: {
            acknowledged: true
          }
        }
      },
      include: {
        controlAssignments: {
          where: {
            acknowledged: true,
          },
          include: {
            controlAssignment: true
          }
        }
      }
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found or not acknowledged" },
        { status: 404 }
      );
    }

    // Update the review and control assignments in a transaction
    await prisma.$transaction([
      // Update the security review with final action and note
      prisma.securityReview.update({
        where: { id: reviewId },
        data: {
          action: finalAction,
          note: note || null
        }
      }),
      // If requesting review, un-acknowledge the assignments to send back to user
      ...(finalAction === SecurityAction.REQUEST_REVIEW ? [
        prisma.securityReviewControlAssignment.updateMany({
          where: {
            securityReviewId: reviewId,
            acknowledged: true
          },
          data: {
            acknowledged: false,
            acknowledgedAt: null
          }
        })
      ] : []),
      // Update all related control assignments with the final status
      prisma.controlAssignment.updateMany({
        where: {
          id: {
            in: review.controlAssignments.map(ca => ca.controlAssignmentId)
          }
        },
        data: {
          managerStatus: finalAction === SecurityAction.CONFIRM ? 'FINISHED' : 'REVIEW_REQUESTED',
          managerNote: note || null
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending review back:", error);
    return NextResponse.json(
      { error: "Failed to send review back" },
      { status: 500 }
    );
  }
}
