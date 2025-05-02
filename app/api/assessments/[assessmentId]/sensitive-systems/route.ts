import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Removed next-auth imports as authentication is not yet implemented server-side

export async function GET(
  request: Request,
  { params }: { params: { assessmentId: string } }
) {
  const { assessmentId } = params;
  if (!assessmentId) {
    return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
  }

  try {
    // Fetch all sensitive systems for this assessment
    const sensitiveSystems = await prisma.sensitiveSystemInfo.findMany({
      where: {
        assessmentId: assessmentId,
      },
      include: {
        assessment: {
          select: {
            id: true,
            companyNameAr: true,
            companyNameEn: true,
            logoPath: true,
            assessmentName: true,
          }
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc', // Sort by creation date, newest first
      },
    });

    return NextResponse.json(sensitiveSystems);
  } catch (error) {
    console.error('Error fetching sensitive systems:', error);
    return NextResponse.json({ error: 'Failed to fetch sensitive systems' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { assessmentId: string } }
) {
  // TODO: Implement proper server-side authentication check here
  // For now, proceeding without authentication based on current project structure

  const { assessmentId } = params;
  if (!assessmentId) {
    return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      systemName,
      systemCategory,
      systemDescription,
      assetRouterCount,
      assetSwitchCount,
      assetGatewayCount,
      assetFirewallCount,
      assetIPSIDSCount,
      assetAPTCount,
      assetDatabaseCount,
      assetStorageCount,
      assetMiddlewareCount,
      assetServerOSCount,
      assetApplicationCount,
      assetEncryptionDeviceCount,
      assetPeripheralCount,
      assetSupportStaffCount,
      assetDocumentationCount,
      otherAssetType,
      otherAssetCount,
      totalAssetCount, // Ensure this is calculated correctly or passed from frontend
    } = body;

    // Basic validation (can be expanded)
    if (!systemName || !systemCategory || !systemDescription || totalAssetCount === undefined) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the assessment exists (without checking ownership for now)
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
        // TODO: Add check for securityManagerId once authentication is implemented
        // securityManagerId: session.user.id,
      },
    });

    if (!assessment) {
      // Changed error message slightly as we are not checking ownership yet
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Create the Sensitive System Info record
    const sensitiveSystemInfo = await prisma.sensitiveSystemInfo.create({
      data: {
        systemName,
        systemCategory,
        systemDescription,
        assetRouterCount: parseInt(assetRouterCount) || 0,
        assetSwitchCount: parseInt(assetSwitchCount) || 0,
        assetGatewayCount: parseInt(assetGatewayCount) || 0,
        assetFirewallCount: parseInt(assetFirewallCount) || 0,
        assetIPSIDSCount: parseInt(assetIPSIDSCount) || 0,
        assetAPTCount: parseInt(assetAPTCount) || 0,
        assetDatabaseCount: parseInt(assetDatabaseCount) || 0,
        assetStorageCount: parseInt(assetStorageCount) || 0,
        assetMiddlewareCount: parseInt(assetMiddlewareCount) || 0,
        assetServerOSCount: parseInt(assetServerOSCount) || 0,
        assetApplicationCount: parseInt(assetApplicationCount) || 0,
        assetEncryptionDeviceCount: parseInt(assetEncryptionDeviceCount) || 0,
        assetPeripheralCount: parseInt(assetPeripheralCount) || 0,
        assetSupportStaffCount: parseInt(assetSupportStaffCount) || 0,
        assetDocumentationCount: parseInt(assetDocumentationCount) || 0,
        otherAssetType: otherAssetType || null,
        otherAssetCount: otherAssetCount ? parseInt(otherAssetCount) : null,
        totalAssetCount: parseInt(totalAssetCount) || 0,
        assessmentId: assessmentId,
      },
    });

    return NextResponse.json(sensitiveSystemInfo, { status: 201 });
  } catch (error) {
    console.error('Error creating sensitive system info:', error);
    // Check for specific Prisma errors if needed
    return NextResponse.json({ error: 'Failed to create sensitive system info' }, { status: 500 });
  }
}
