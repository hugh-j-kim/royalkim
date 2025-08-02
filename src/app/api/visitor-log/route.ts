import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, postId, referrer, userAgent, ipAddress, country, city } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const visitorLog = await prisma.visitorLog.create({
      data: {
        userId,
        postId,
        referrer,
        userAgent,
        ipAddress,
        country,
        city
      }
    })

    return NextResponse.json(visitorLog)
  } catch (error) {
    console.error('Visitor log API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 