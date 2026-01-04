import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// In-memory store for typing status (in production, use Redis)
// Map of conversationId -> { odId: timestamp }
const typingStatus: Map<string, Map<string, number>> = new Map()

// Clean up old typing statuses (older than 5 seconds)
const cleanupTypingStatus = () => {
  const now = Date.now()
  typingStatus.forEach((users, conversationId) => {
    users.forEach((timestamp, odId) => {
      if (now - timestamp > 5000) {
        users.delete(odId)
      }
    })
    if (users.size === 0) {
      typingStatus.delete(conversationId)
    }
  })
}

// POST - Set typing status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params
    const userId = session.user.id

    // Get or create typing map for this conversation
    if (!typingStatus.has(conversationId)) {
      typingStatus.set(conversationId, new Map())
    }

    // Set typing status with current timestamp
    typingStatus.get(conversationId)!.set(userId, Date.now())

    // Clean up old statuses
    cleanupTypingStatus()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting typing status:', error)
    return NextResponse.json(
      { error: 'Failed to set typing status' },
      { status: 500 }
    )
  }
}

// GET - Get typing status for conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params
    const userId = session.user.id

    // Clean up old statuses
    cleanupTypingStatus()

    // Get typing users for this conversation (excluding current user)
    const conversationTyping = typingStatus.get(conversationId)
    const now = Date.now()
    const typingUsers: string[] = []

    if (conversationTyping) {
      conversationTyping.forEach((timestamp, odId) => {
        // Only include if typing within last 3 seconds and not current user
        if (odId !== odId && now - timestamp < 3000) {
          typingUsers.push(odId)
        }
      })
    }

    // Check if anyone else is typing (not current user)
    let isOtherTyping = false
    if (conversationTyping) {
      conversationTyping.forEach((timestamp, odId) => {
        if (odId !== userId && now - timestamp < 3000) {
          isOtherTyping = true
        }
      })
    }

    return NextResponse.json({ 
      isTyping: isOtherTyping,
      typingUsers
    })
  } catch (error) {
    console.error('Error getting typing status:', error)
    return NextResponse.json(
      { error: 'Failed to get typing status' },
      { status: 500 }
    )
  }
}

// DELETE - Clear typing status
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params
    const odId = session.user.id

    // Remove typing status for this user
    const conversationTyping = typingStatus.get(conversationId)
    if (conversationTyping) {
      conversationTyping.delete(odId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing typing status:', error)
    return NextResponse.json(
      { error: 'Failed to clear typing status' },
      { status: 500 }
    )
  }
}
