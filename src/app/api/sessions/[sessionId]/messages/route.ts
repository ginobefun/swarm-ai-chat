import { NextRequest, NextResponse } from 'next/server'
import { getSessionMessages } from '@/lib/database/sessions-prisma'
import { z } from 'zod'

// Query parameters validation schema
const MessagesQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  before: z.string().optional(),
  after: z.string().optional()
})

/**
 * GET /api/sessions/[sessionId]/messages
 * Retrieve messages for a specific session
 * 
 * Features:
 * - Paginated message retrieval
 * - Date range filtering
 * - Formatted response for frontend consumption
 * - Error handling and validation
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    
    // Validate sessionId is a UUID
    if (!sessionId || !sessionId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid session ID format' 
        },
        { status: 400 }
      )
    }

    // Parse query parameters
    const url = new URL(req.url)
    const queryParams = MessagesQuerySchema.parse({
      limit: url.searchParams.get('limit'),
      offset: url.searchParams.get('offset'),
      before: url.searchParams.get('before'),
      after: url.searchParams.get('after')
    })

    // Retrieve messages from database
    const messages = await getSessionMessages(sessionId)

    // Apply date filtering if specified
    let filteredMessages = messages
    if (queryParams.before) {
      const beforeDate = new Date(queryParams.before)
      filteredMessages = filteredMessages.filter(msg => msg.createdAt < beforeDate)
    }
    if (queryParams.after) {
      const afterDate = new Date(queryParams.after)
      filteredMessages = filteredMessages.filter(msg => msg.createdAt > afterDate)
    }

    // Sort by creation time (oldest first for chat display)
    filteredMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    // Apply pagination
    const paginatedMessages = filteredMessages
      .slice(queryParams.offset, queryParams.offset + queryParams.limit)

    // Format messages for frontend consumption
    const formattedMessages = paginatedMessages.map(message => ({
      id: message.id,
      sessionId: message.sessionId,
      senderType: message.senderType.toLowerCase(), // Convert ENUM to lowercase
      senderId: message.senderId,
      content: message.content,
      contentType: message.contentType.toLowerCase(),
      status: message.status.toLowerCase(),
      metadata: message.metadata,
      tokenCount: message.tokenCount,
      processingTime: message.processingTime,
      cost: Number(message.cost), // Convert Decimal to number
      createdAt: message.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: formattedMessages,
      pagination: {
        limit: queryParams.limit,
        offset: queryParams.offset,
        total: filteredMessages.length,
        hasMore: queryParams.offset + queryParams.limit < filteredMessages.length
      }
    })

  } catch (error) {
    console.error('❌ Error fetching session messages:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}