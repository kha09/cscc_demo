import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/api-auth";

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

    // Get all forwarded but not yet acknowledged reviews for this user
    const reviews = await prisma.securityReview.findMany({
      where: {
        controlAssignments: {
          some: {
            forwarded: true,
            acknowledged: false,
            controlAssignment: {
              assignedUserId: userId
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
        select: {
          id: true,
          forwarded: true,
          acknowledged: true,
          controlAssignment: {
            select: {
              control: {
                select: {
                  controlNumber: true,
                  controlText: true,
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

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user?.id || user.role !== 'SECURITY_MANAGER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { systemId, mainComponent, action, note, controlAssignmentIds } = data;

    if (!systemId || !mainComponent || !action || !controlAssignmentIds?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the security review
    const review = await prisma.securityReview.create({
      data: {
        systemId,
        mainComponent,
        securityManagerId: user.id,
        action,
        note,
        controlAssignments: {
          create: controlAssignmentIds.map((id: string) => ({
            controlAssignmentId: id
          })),
        },
      },
      include: {
        controlAssignments: true,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error creating security review:", error);
    return NextResponse.json(
      { error: "Failed to create security review" },
      { status: 500 }
    );
  }
}
