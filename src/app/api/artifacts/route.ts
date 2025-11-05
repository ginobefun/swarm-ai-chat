/**
 * Artifacts API
 *
 * GET /api/artifacts?sessionId={id}
 * - Retrieve artifacts for a specific session
 * - Supports pagination
 * - Returns artifacts with related message info
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'

/**
 * GET handler - Retrieve artifacts for a session
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const sessionId = searchParams.get('sessionId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    // Query artifacts with message info
    const artifacts = await prisma.swarmArtifact.findMany({
      where: { sessionId },
      include: {
        message: {
          select: {
            id: true,
            senderId: true,
            senderType: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' }, // Pinned artifacts first
        { createdAt: 'desc' }, // Then by creation date
      ],
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count for pagination
    const total = await prisma.swarmArtifact.count({
      where: { sessionId },
    })

    return NextResponse.json({
      artifacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching artifacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artifacts' },
      { status: 500 }
    )
  }
}

/**
 * PATCH handler - Update artifact (pin/unpin, publish)
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { artifactId, isPinned, isPublished } = body

    if (!artifactId) {
      return NextResponse.json(
        { error: 'artifactId is required' },
        { status: 400 }
      )
    }

    const updated = await prisma.swarmArtifact.update({
      where: { id: artifactId },
      data: {
        ...(isPinned !== undefined && { isPinned }),
        ...(isPublished !== undefined && { isPublished }),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ artifact: updated })
  } catch (error) {
    console.error('Error updating artifact:', error)
    return NextResponse.json(
      { error: 'Failed to update artifact' },
      { status: 500 }
    )
  }
}
