export async function GetSpotifyAuthUrl(): Promise<string> {
  const Response = await fetch('/api/spotify/auth-url')
  const Data = await Response.json()
  return Data.authUrl
}

export async function GetNowPlaying() {
  try {
    const Response = await fetch('/api/spotify/now-playing')
    
    if (!Response.ok) {
      if (Response.status === 401) {
        return { isAuthenticated: false }
      }
      throw new Error('Failed to fetch currently playing track')
    }
    
    return await Response.json()
  } catch (error) {
    console.error('Error fetching now playing:', error)
    return null
  }
} 