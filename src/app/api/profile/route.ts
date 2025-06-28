import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { prisma } from '@/lib/database/prisma'
import { Prisma } from '@prisma/client'

// 预留关键词列表
const RESERVED_KEYWORDS = [
    'admin', 'administrator', 'root', 'moderator', 'mod', 'support', 'help',
    'system', 'api', 'bot', 'null', 'undefined', 'swarm', 'swarmchat',
    'user', 'guest', 'anonymous', 'official', 'staff', 'team', 'service',
    'test', 'demo', 'example', 'sample', 'default', 'reserved', 'config',
    'settings', 'profile', 'account', 'login', 'logout', 'register', 'signup',
    'signin', 'auth', 'oauth', 'www', 'ftp', 'mail', 'email', 'http', 'https',
    'about', 'contact', 'privacy', 'terms', 'legal', 'blog', 'news', 'forum'
]

/**
 * Validate username against format rules and reserved keywords
 */
function validateUsername(username: string): string | null {
    const trimmed = username.trim().toLowerCase()

    if (trimmed.length < 6 || trimmed.length > 50) {
        return 'Username must be between 6 and 50 characters'
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        return 'Username can only contain letters, numbers, underscores, and hyphens'
    }

    if (RESERVED_KEYWORDS.includes(trimmed)) {
        return 'This username is reserved and cannot be used'
    }

    return null
}

/**
 * Get user profile information
 */
export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const swarmUser = await prisma.swarmUser.findUnique({
            where: { userId: session.user.id },
            select: {
                id: true,
                username: true,
                avatarUrl: true,
                role: true,
                subscriptionStatus: true,
                preferences: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        })

        if (!swarmUser) {
            return NextResponse.json(
                { error: 'User profile not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ data: swarmUser })
    } catch (error) {
        console.error('Failed to get user profile:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * Update user profile information
 */
export async function PUT(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { username, preferences } = body

        // Validate username if provided
        if (username !== undefined) {
            if (typeof username !== 'string') {
                return NextResponse.json(
                    { error: 'Username must be a string' },
                    { status: 400 }
                )
            }

            // Enhanced validation with reserved keywords
            const validationError = validateUsername(username)
            if (validationError) {
                return NextResponse.json(
                    { error: validationError },
                    { status: 400 }
                )
            }

            // Check username uniqueness
            const existingUser = await prisma.swarmUser.findFirst({
                where: {
                    username: username.trim(),
                    userId: { not: session.user.id }
                }
            })

            if (existingUser) {
                return NextResponse.json(
                    { error: 'Username already taken' },
                    { status: 400 }
                )
            }
        }

        // Validate preferences if provided
        if (preferences !== undefined && typeof preferences !== 'object') {
            return NextResponse.json(
                { error: 'Preferences must be an object' },
                { status: 400 }
            )
        }

        // Prepare update data
        const updateData: Prisma.SwarmUserUpdateInput = {}

        if (username !== undefined) {
            updateData.username = username.trim() || null
        }

        if (preferences !== undefined) {
            updateData.preferences = preferences as Prisma.InputJsonValue
        }

        // Update user profile
        const updatedProfile = await prisma.swarmUser.update({
            where: { userId: session.user.id },
            data: updateData,
            select: {
                id: true,
                username: true,
                avatarUrl: true,
                role: true,
                subscriptionStatus: true,
                preferences: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: updatedProfile
        })
    } catch (error) {
        console.error('Failed to update user profile:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 