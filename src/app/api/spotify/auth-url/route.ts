import { NextResponse } from 'next/server'
import { GetAuthUrl } from '@/lib/spotify.server'

export async function GET() {
  try {
    const AuthUrl = GetAuthUrl()
    return NextResponse.json({ authUrl: AuthUrl })
  } catch (error) {
    console.error('Error generating auth URL:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 