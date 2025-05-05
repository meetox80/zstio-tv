import { NextResponse } from 'next/server'
import { SaveSpotifyTokens } from '@/lib/spotify.server'

export async function GET(request: Request) {
  const Url = new URL(request.url)
  const Code = Url.searchParams.get('code')
  const Error = Url.searchParams.get('error')
  
  if (Error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=${Error}`)
  }
  
  if (!Code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=missing_code`)
  }
  
  try {
    const _SpotifyClientId = process.env.SPOTIFY_ID
    const _SpotifyClientSecret = process.env.SPOTIFY_SECRET
    const _RedirectUri = process.env.SPOTIFY_REDIRECT?.replace(/%/g, '') || 'http://localhost:3000/api/spotify/auth'
    
    const TokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${_SpotifyClientId}:${_SpotifyClientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: Code,
        redirect_uri: _RedirectUri
      })
    })
    
    const TokenData = await TokenResponse.json()
    
    if (!TokenResponse.ok) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=token_error`)
    }
    
    await SaveSpotifyTokens(
      TokenData.access_token,
      TokenData.refresh_token,
      TokenData.expires_in
    )
    
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?success=true`)
  } catch (error) {
    console.error('Spotify auth error:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=server_error`)
  }
} 