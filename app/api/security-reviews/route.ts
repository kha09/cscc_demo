import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getToken } from "next-auth/jwt";

type SecurityAction = "CONFIRM" | "REQUEST_REVIEW";

export async function POST(req: NextRequest) {
  try {
    // Get token from request
    const token = await getToken({ req });
    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { taskId, mainComponent, action, note, controlAssignmentIds } = data;

    // Validate required fields
    if (!taskId || !mainComponent || !action || !controlAssignmentIds?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate action is a valid SecurityAction
    if (!["CONFIRM", "REQUEST_REVIEW"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action value" },
        { status: 400 }
      );
    }

    // Create the security review with control assignments in a transaction
    const securityReview = await prisma.$transaction(async (prisma) => {
      // Create the security review
      const review = await prisma.securityReview.create({
        data: {
          taskId,
          mainComponent,
          securityManagerId: token.sub,
          action: action as SecurityAction,
          note,
        },
      });

      // Create the control assignment links
      await prisma.securityReviewControlAssignment.createMany({
        data: controlAssignmentIds.map((controlAssignmentId: string) => ({
          securityReviewId: review.id,
          controlAssignmentId,
        })),
      });

      // Return the created review with its relationships
      return prisma.securityReview.findUnique({
        where: { id: review.id },
        include: {
          controlAssignments: {
            include: {
              controlAssignment: {
                include: {
                  control: true,
                },
              },
            },
          },
          securityManager: {
            select: {
              id: true,
              name: true,
              nameAr: true,
            },
          },
          task: {
            include: {
              assignedBy: {
                select: {
                  id: true,
                  name: true,
                  nameAr: true,
                  department: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(securityReview, { status: 201 });
  } catch (error) {
    console.error("Error creating security review:", error);
    return NextResponse.json(
      { error: "Failed to create security review" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get token from request
    const token = await getToken({ req });
    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");
    const mainComponent = searchParams.get("mainComponent");

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    const where = {
      taskId,
      ...(mainComponent && { mainComponent }),
    };

    const reviews = await prisma.securityReview.findMany({
      where,
      include: {
        controlAssignments: {
          include: {
            controlAssignment: {
              include: {
                control: true,
              },
            },
          },
        },
        securityManager: {
          select: {
            id: true,
            name: true,
            nameAr: true,
          },
        },
        task: {
          include: {
            assignedBy: {
              select: {
                id: true,
                name: true,
                nameAr: true,
                department: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
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
