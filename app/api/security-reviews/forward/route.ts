import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    // Get user from request
    const user = await getCurrentUser(req);
    if (!user?.id || user.role !== 'DEPARTMENT_MANAGER') {
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

    // Update all specified review assignments
    const updatedAssignments = await prisma.$transaction(
      reviewAssignmentIds.map((id: string) =>
        prisma.securityReviewControlAssignment.update({
          where: { id },
          data: {
            forwarded: true,
            forwardedAt: new Date(),
          },
          include: {
            controlAssignment: {
              select: {
                assignedUserId: true,
              },
            },
          },
        })
      )
    );

    // Extract assigned user IDs
    const assignedUserIds = Array.from(new Set(
      updatedAssignments
        .map(assignment => assignment.controlAssignment.assignedUserId)
        .filter((id): id is string => id !== null)
    ));

    return NextResponse.json({
      message: "Reviews forwarded successfully",
      assignedUserIds,
    });
  } catch (error) {
    console.error("Error forwarding security reviews:", error);
    return NextResponse.json(
      { error: "Failed to forward security reviews" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get all unforwarded reviews for the department manager's team
    const reviews = await prisma.securityReview.findMany({
      where: {
        controlAssignments: {
          some: {
            forwarded: false,
            controlAssignment: {
              task: {
                assignedToId: userId
              }
            }
          }
        }
      },
      select: {
        id: true,
        mainComponent: true,
        action: true,
        note: true,
        createdAt: true,
        securityManager: {
          select: {
            name: true,
            nameAr: true,
          },
        },
        controlAssignments: {
          where: {
            forwarded: false,
          },
          select: {
            id: true,
            controlAssignment: {
              select: {
                control: {
                  select: {
                    controlNumber: true,
                    controlText: true,
                    subComponent: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching security reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch security reviews" },
      { status: 500 }
    );
  }
}
