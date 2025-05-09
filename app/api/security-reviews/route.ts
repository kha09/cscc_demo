import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/api-auth";

type SecurityAction = "CONFIRM" | "REQUEST_REVIEW";

export async function POST(req: NextRequest) {
  try {
    // Get user from request
    const user = await getCurrentUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { systemId, mainComponent, action, note, controlAssignmentIds } = data;

    // Validate required fields
    if (!systemId || !mainComponent || !action || !controlAssignmentIds?.length) {
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

    // Create the security review
    const review = await prisma.securityReview.create({
      data: {
        systemId,
        mainComponent,
        securityManagerId: user.id,
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

    // Fetch the created review with its relationships
    const securityReview = await prisma.securityReview.findUnique({
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
        system: {
          select: {
            id: true,
            systemName: true,
            systemDescription: true,
          },
        },
      },
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
    // Get user from request
    const user = await getCurrentUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const systemId = searchParams.get("systemId");
    const mainComponent = searchParams.get("mainComponent");

    if (!systemId) {
      return NextResponse.json(
        { error: "systemId is required" },
        { status: 400 }
      );
    }

    const where = {
      systemId,
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
          system: {
            select: {
              id: true,
              systemName: true,
              systemDescription: true,
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
