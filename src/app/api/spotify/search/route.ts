import { NextRequest, NextResponse } from 'next/server'
import { GetValidAccessToken } from '@/lib/spotify.server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const SearchParams = request.nextUrl.searchParams
    const Query = SearchParams.get('q')
    
    if (!Query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }
    
    const AccessToken = await GetValidAccessToken()
    
    if (!AccessToken) {
      return NextResponse.json({ error: 'Not authenticated with Spotify' }, { status: 401 })
    }
    
    const Response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(Query)}&type=track&limit=8`, {
      headers: {
        'Authorization': `Bearer ${AccessToken}`
      }
    })
    
    if (!Response.ok) {
      if (Response.status === 401) {
        return NextResponse.json({ error: 'Spotify authentication expired' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Failed to search Spotify' }, { status: Response.status })
    }
    
    const Data = await Response.json()
    
    const Tracks = Data.tracks.items.map((track: any) => ({
      Id: track.id,
      Title: track.name,
      Artist: track.artists.map((artist: any) => artist.name).join(', '),
      Album: track.album.name,
      AlbumArt: track.album.images[0]?.url,
      Duration: track.duration_ms,
      Uri: track.uri
    }))
    
    return NextResponse.json({ tracks: Tracks })
  } catch (error) {
    console.error('Error searching Spotify:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 