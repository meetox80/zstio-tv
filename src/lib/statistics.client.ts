export async function TrackSpotifyPlay() {
  try {
    await fetch('/api/statistics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ Type: 'spotify' })
    })
  } catch (Error) {
    console.error('Failed to track Spotify play:', Error)
  }
}

export async function GetStatistics() {
  try {
    const Response = await fetch('/api/statistics', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    
    if (!Response.ok) {
      throw new Error(`Failed to fetch statistics: ${Response.status}`)
    }
    
    const Data = await Response.json()
    return Data.data
  } catch (Error) {
    console.error('Failed to get statistics:', Error)
    return null
  }
}

export async function GetStatisticsHistory() {
  try {
    const Response = await fetch('/api/statistics/history', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    
    if (!Response.ok) {
      throw new Error(`Failed to fetch statistics history: ${Response.status}`)
    }
    
    const Data = await Response.json()
    return Data.data
  } catch (Error) {
    console.error('Failed to get statistics history:', Error)
    return {
      labels: [],
      spotifyPlays: [],
      songRequests: []
    }
  }
} 