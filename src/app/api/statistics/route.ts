import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function GetFormattedDate() {
  const Today = new Date()
  const Day = String(Today.getDate()).padStart(2, '0')
  const Month = String(Today.getMonth() + 1).padStart(2, '0')
  const Year = Today.getFullYear()
  
  return `${Day}-${Month}-${Year}`
}

async function GetOrCreateDailyStats() {
  const TodayFormatted = GetFormattedDate()
  
  let DailyStats = await Prisma.statistics.findUnique({
    where: { Date: TodayFormatted }
  })
  
  if (!DailyStats) {
    DailyStats = await Prisma.statistics.create({
      data: {
        Date: TodayFormatted,
        SpotifyPlays: 0,
        SongRequests: 0
      }
    })
  }
  
  return DailyStats
}

export async function GET() {
  try {
    const Stats = await GetOrCreateDailyStats()
    
    return NextResponse.json({
      success: true,
      data: Stats
    })
  } catch (Error) {
    console.error('Error fetching statistics:', Error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch statistics' 
    }, { status: 500 })
  }
}

export async function POST(Request: NextRequest) {
  try {
    const Body = await Request.json()
    const { Type } = Body
    
    if (!Type || (Type !== 'spotify' && Type !== 'request')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid statistic type' 
      }, { status: 400 })
    }
    
    const TodayFormatted = GetFormattedDate()
    
    await GetOrCreateDailyStats()
    
    let UpdateData = {}
    
    if (Type === 'spotify') {
      UpdateData = { SpotifyPlays: { increment: 1 } }
    } else if (Type === 'request') {
      UpdateData = { SongRequests: { increment: 1 } }
    }
    
    const UpdatedStats = await Prisma.statistics.update({
      where: { Date: TodayFormatted },
      data: UpdateData
    })
    
    return NextResponse.json({
      success: true,
      data: UpdatedStats
    })
  } catch (Error) {
    console.error('Error updating statistics:', Error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update statistics' 
    }, { status: 500 })
  }
} 