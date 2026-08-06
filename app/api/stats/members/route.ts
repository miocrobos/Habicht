import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public: total number of registered community members
export async function GET() {
  try {
    const count = await prisma.user.count()
    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error counting members:', error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}
