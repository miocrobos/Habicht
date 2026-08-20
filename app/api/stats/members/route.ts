import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Public: total number of registered community members
export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ count: 0 })
    }

    const count = await prisma.user.count()
    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error counting members:', error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}
