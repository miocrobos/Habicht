import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPlayerRequestNotification } from '@/lib/email'

// GET - Fetch all open player requests (for players to view)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'OPEN'
    const position = searchParams.get('position')
    const canton = searchParams.get('canton')
    const contractType = searchParams.get('contractType')
    const gender = searchParams.get('gender')
    const myRequests = searchParams.get('myRequests') === 'true'

    const where: any = {}

    // Filter by status
    if (status) {
      where.status = status
    }

    // Filter by position
    if (position) {
      where.positionNeeded = position
    }

    // Filter by canton
    if (canton) {
      where.canton = canton
    }

    // Filter by contract type
    if (contractType) {
      where.contractType = contractType
    }

    // Filter by gender
    if (gender) {
      where.gender = gender
    }

    // For recruiters/hybrids viewing their own requests
    if (myRequests && (session.user.role === 'RECRUITER' || session.user.role === 'HYBRID')) {
      where.creatorId = session.user.id
    }

    const requests = await prisma.playerRequest.findMany({
      where,
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
            website: true,
            canton: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching player requests:', error)
    return NextResponse.json({ error: 'Failed to fetch player requests' }, { status: 500 })
  }
}

// POST - Create a new player request (recruiters and hybrids only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only recruiters and hybrids can create player requests
    if (session.user.role !== 'RECRUITER' && session.user.role !== 'HYBRID') {
      return NextResponse.json({ error: 'Only recruiters and hybrid users can create player requests' }, { status: 403 })
    }

    const body = await request.json()
    const {
      clubId,
      title,
      description,
      positionNeeded,
      contractType,
      gender,
      league,
      salary,
      startDate,
      requirements
    } = body

    // Validate required fields
    if (!clubId || !title || !description || !positionNeeded || !contractType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the club exists in the database
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, name: true, canton: true }
    })

    if (!club) {
      return NextResponse.json({ error: 'Club not found in database. Please select a valid club.' }, { status: 400 })
    }

    // Get creator info
    let creatorName = session.user.name || 'Unknown'
    
    if (session.user.role === 'RECRUITER') {
      const recruiter = await prisma.recruiter.findUnique({
        where: { userId: session.user.id },
        select: { firstName: true, lastName: true }
      })
      if (recruiter) {
        creatorName = `${recruiter.firstName} ${recruiter.lastName}`
      }
    } else if (session.user.role === 'HYBRID') {
      const hybrid = await prisma.hybrid.findUnique({
        where: { userId: session.user.id },
        select: { firstName: true, lastName: true }
      })
      if (hybrid) {
        creatorName = `${hybrid.firstName} ${hybrid.lastName}`
      }
    }

    // Create the player request
    const playerRequest = await prisma.playerRequest.create({
      data: {
        creatorId: session.user.id,
        creatorType: session.user.role as 'RECRUITER' | 'HYBRID',
        creatorName,
        clubId: club.id,
        clubName: club.name,
        canton: club.canton,
        title,
        description,
        positionNeeded,
        contractType,
        gender: gender || null,
        league: league || null,
        salary: salary || null,
        startDate: startDate ? new Date(startDate) : null,
        requirements: requirements || null,
        status: 'OPEN'
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
            canton: true,
          }
        }
      }
    })

    // Get all players to notify
    const players = await prisma.player.findMany({
      where: {
        user: {
          notifyRecruiterSearching: true
        },
        // Optionally filter by gender if specified
        ...(gender ? { gender } : {})
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    // Get all hybrid users with player profiles to notify
    const hybrids = await prisma.hybrid.findMany({
      where: {
        user: {
          notifyRecruiterSearching: true,
          role: 'HYBRID'
        },
        // Optionally filter by gender if specified for hybrids
        ...(gender ? { gender } : {})
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    // Create notifications for all matching players
    const playerNotificationPromises = players.map(player => 
      prisma.notification.create({
        data: {
          userId: player.user.id,
          type: 'PLAYER_REQUEST',
          title: 'notifications.newPlayerRequest',
          message: JSON.stringify({
            clubName: club.name,
            position: positionNeeded,
            canton: club.canton,
            contractType,
            creatorName
          }),
          senderId: session.user.id,
          senderName: creatorName,
          actionUrl: `/player-requests/${playerRequest.id}`
        }
      })
    )

    // Create notifications for all matching hybrid users
    const hybridNotificationPromises = hybrids.map(hybrid => 
      prisma.notification.create({
        data: {
          userId: hybrid.user.id,
          type: 'PLAYER_REQUEST',
          title: 'notifications.newPlayerRequest',
          message: JSON.stringify({
            clubName: club.name,
            position: positionNeeded,
            canton: club.canton,
            contractType,
            creatorName
          }),
          senderId: session.user.id,
          senderName: creatorName,
          actionUrl: `/player-requests/${playerRequest.id}`
        }
      })
    )

    // Send email notifications to all players (in batches to avoid overwhelming the email service)
    const playerEmailPromises = players.map(async player => {
      try {
        await sendPlayerRequestNotification({
          recipientEmail: player.user.email,
          recipientName: `${player.firstName} ${player.lastName}`,
          creatorName,
          clubName: club.name,
          canton: club.canton,
          position: positionNeeded,
          contractType,
          title,
          description,
          requestUrl: `/player-requests/${playerRequest.id}`
        })
      } catch (emailError) {
        console.error(`Failed to send email to ${player.user.email}:`, emailError)
      }
    })

    // Send email notifications to all hybrid users
    const hybridEmailPromises = hybrids.map(async hybrid => {
      try {
        await sendPlayerRequestNotification({
          recipientEmail: hybrid.user.email,
          recipientName: `${hybrid.firstName} ${hybrid.lastName}`,
          creatorName,
          clubName: club.name,
          canton: club.canton,
          position: positionNeeded,
          contractType,
          title,
          description,
          requestUrl: `/player-requests/${playerRequest.id}`
        })
      } catch (emailError) {
        console.error(`Failed to send email to ${hybrid.user.email}:`, emailError)
      }
    })

    // Execute all notifications and emails
    await Promise.all([
      ...playerNotificationPromises,
      ...hybridNotificationPromises,
      ...playerEmailPromises,
      ...hybridEmailPromises
    ])

    const totalNotified = players.length + hybrids.length
    console.log(`Player request created and ${totalNotified} users notified (${players.length} players, ${hybrids.length} hybrids)`)

    return NextResponse.json({ 
      success: true, 
      request: playerRequest,
      notifiedCount: totalNotified
    })
  } catch (error) {
    console.error('Error creating player request:', error)
    return NextResponse.json({ error: 'Failed to create player request' }, { status: 500 })
  }
}
