import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all forwarded but not acknowledged reviews for this department manager
    const reviews = await prisma.securityReview.findMany({
      where: {
        departmentManagerId: user.id
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
            forwarded: true,
            acknowledged: false,
          },
          select: {
            id: true,
            controlAssignment: {
              select: {
                id: true,
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
    console.error("Error fetching forwarded security reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch forwarded security reviews" },
      { status: 500 }
    );
  }
}
