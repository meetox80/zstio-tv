import { NextResponse } from 'next/server'
import { GetCurrentTrack } from '@/lib/spotify.server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const TrackData = await GetCurrentTrack()
    
    if (!TrackData) {
      return NextResponse.json({ isAuthenticated: false }, { 
        status: 401,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }
    
    return NextResponse.json(TrackData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching current track:', error)
    return NextResponse.json({ error: 'Internal Server Error', isAuthenticated: true }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
} 