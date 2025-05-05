import Database from 'better-sqlite3'
import { cache } from 'react'

const _SpotifyClientId = process.env.SPOTIFY_ID
const _SpotifyClientSecret = process.env.SPOTIFY_SECRET
const _RedirectUri = process.env.SPOTIFY_REDIRECT?.replace(/%/g, '') || 'http://localhost:3000/api/spotify/auth'

const _Db = new Database('cache.db')

_Db.exec(`
  CREATE TABLE IF NOT EXISTS spotify_auth (
    id INTEGER PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  )
`)

const _SaveTokens = _Db.prepare('INSERT OR REPLACE INTO spotify_auth (id, access_token, refresh_token, expires_at) VALUES (1, ?, ?, ?)')
const _GetTokens = _Db.prepare('SELECT * FROM spotify_auth WHERE id = 1')
const _ClearTokens = _Db.prepare('DELETE FROM spotify_auth WHERE id = 1')

export function SaveSpotifyTokens(AccessToken: string, RefreshToken: string, ExpiresIn: number) {
  const ExpiresAt = Date.now() + ExpiresIn * 1000
  _SaveTokens.run(AccessToken, RefreshToken, ExpiresAt)
}

export function GetSpotifyTokens() {
  const Result = _GetTokens.get() as { access_token: string; refresh_token: string; expires_at: number } | undefined
  return Result
}

export function ClearSpotifyTokens() {
  _ClearTokens.run()
}

export async function RefreshAccessToken() {
  const Tokens = GetSpotifyTokens()
  
  if (!Tokens) {
    return null
  }
  
  const Response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${_SpotifyClientId}:${_SpotifyClientSecret}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: Tokens.refresh_token
    })
  })
  
  const Data = await Response.json()
  
  if (!Response.ok) {
    console.error('Failed to refresh token:', Data)
    return null
  }
  
  SaveSpotifyTokens(
    Data.access_token,
    Data.refresh_token || Tokens.refresh_token,
    Data.expires_in
  )
  
  return Data.access_token
}

export async function GetValidAccessToken() {
  const Tokens = GetSpotifyTokens()
  
  if (!Tokens) {
    return null
  }
  
  if (Date.now() > Tokens.expires_at) {
    return RefreshAccessToken()
  }
  
  return Tokens.access_token
}

export function GetAuthUrl() {
  const Scopes = [
    'user-read-currently-playing',
    'user-read-playback-state'
  ]
  
  const Params = new URLSearchParams({
    client_id: _SpotifyClientId as string,
    response_type: 'code',
    redirect_uri: _RedirectUri,
    scope: Scopes.join(' ')
  })
  
  return `https://accounts.spotify.com/authorize?${Params.toString()}`
}

type TrackData = {
  isPlaying: boolean
  title?: string
  artist?: string
  albumArt?: string
  albumName?: string
  duration?: number
  progress?: number
} | null

export const GetCurrentTrack = cache(async (): Promise<TrackData> => {
  const AccessToken = await GetValidAccessToken()
  
  if (!AccessToken) {
    return null
  }
  
  const Response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      'Authorization': `Bearer ${AccessToken}`
    },
    cache: 'no-store'
  })
  
  if (Response.status === 204) {
    return { isPlaying: false }
  }
  
  if (!Response.ok) {
    if (Response.status === 401) {
      const NewToken = await RefreshAccessToken()
      if (NewToken) {
        return GetCurrentTrack()
      }
    }
    return null
  }
  
  const Data = await Response.json()
  
  return {
    isPlaying: Data.is_playing,
    title: Data.item?.name,
    artist: Data.item?.artists?.map((artist: { name: string }) => artist.name).join(', '),
    albumArt: Data.item?.album?.images?.[0]?.url,
    albumName: Data.item?.album?.name,
    duration: Data.item?.duration_ms,
    progress: Data.progress_ms
  }
}) 