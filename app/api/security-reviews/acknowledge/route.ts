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


    // Get the review and verify it's forwarded to this manager
    const review = await prisma.securityReview.findFirst({
      where: {
        id: reviewId,
        controlAssignments: {
          some: {
            forwarded: true,
            acknowledged: false,
          controlAssignment: {
            assignedUserId: user.id
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

    // Mark all forwarded join records as acknowledged
    await prisma.securityReviewControlAssignment.updateMany({
      where: {
        securityReviewId: reviewId,
        forwarded: true,
        acknowledged: false,
        controlAssignment: {
          assignedUserId: user.id
        }
      },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date()
      }
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
