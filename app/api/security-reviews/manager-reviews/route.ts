import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user?.id || user.role !== 'SECURITY_MANAGER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all reviews created by this security manager that have been acknowledged by department managers
    const reviews = await prisma.securityReview.findMany({
      where: {
        securityManagerId: user.id,
        controlAssignments: {
          some: {
            acknowledged: true
          }
        }
      },
      select: {
        id: true,
        mainComponent: true,
        action: true,
        note: true,
        createdAt: true,
        controlAssignments: {
          where: {
            acknowledged: true,
          },
          select: {
            id: true,
            acknowledgedAt: true,
            controlAssignment: {
              select: {
                id: true,
                managerStatus: true,
                managerNote: true,
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

    // Group by mainComponent
    const groupedReviews = reviews.reduce((acc, review) => {
      const mainComponent = review.mainComponent;
      if (!acc[mainComponent]) {
        acc[mainComponent] = [];
      }
      acc[mainComponent].push(review);
      return acc;
    }, {} as Record<string, typeof reviews>);

    return NextResponse.json(groupedReviews);
  } catch (error) {
    console.error("Error fetching manager reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch manager reviews" },
      { status: 500 }
    );
  }
}
