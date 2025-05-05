import { NextResponse } from 'next/server'
import { GetCurrentTrack } from '@/lib/spotify.server'

export async function GET() {
  try {
    const TrackData = await GetCurrentTrack()
    
    if (!TrackData) {
      return NextResponse.json({ isAuthenticated: false }, { status: 401 })
    }
    
    return NextResponse.json(TrackData)
  } catch (error) {
    console.error('Error fetching current track:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 