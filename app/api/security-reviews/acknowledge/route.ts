import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/api-auth";
import { ReviewStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user?.id || user.role !== 'DEPARTMENT_MANAGER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { reviewId, action, note } = data;

    if (!reviewId || !action || (action === ReviewStatus.REVIEW_REQUESTED && !note)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the review and verify it's forwarded to this manager
    const review = await prisma.securityReview.findFirst({
      where: {
        id: reviewId,
        controlAssignments: {
          some: {
            forwarded: true,
            acknowledged: false,
            controlAssignment: {
              task: {
                assignedToId: user.id
              }
            }
          }
        }
      },
      include: {
        controlAssignments: {
          where: {
            forwarded: true,
            acknowledged: false,
          },
          include: {
            controlAssignment: true
          }
        }
      }
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found or not forwarded to you" },
        { status: 404 }
      );
    }

    // Update all control assignments with manager's response
    await prisma.$transaction([
      // Mark the join records as acknowledged
      prisma.securityReviewControlAssignment.updateMany({
        where: {
          securityReviewId: reviewId,
          forwarded: true,
          acknowledged: false,
          controlAssignment: {
            task: {
              assignedToId: user.id
            }
          }
        },
        data: {
          acknowledged: true,
          acknowledgedAt: new Date()
        }
      }),
      // Update the control assignments with manager's status and note
      prisma.controlAssignment.updateMany({
        where: {
          id: {
            in: review.controlAssignments.map(ca => ca.controlAssignmentId)
          }
        },
        data: {
          managerStatus: action,
          managerNote: note || null
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error acknowledging security review:", error);
    return NextResponse.json(
      { error: "Failed to acknowledge security review" },
      { status: 500 }
    );
  }
}
