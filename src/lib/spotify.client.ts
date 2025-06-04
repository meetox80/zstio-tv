export async function GetSpotifyAuthUrl(): Promise<string> {
  const Response = await fetch("/api/spotify/auth-url");
  const Data = await Response.json();
  return Data.authUrl;
}

export async function GetNowPlaying() {
  try {
    const Response = await fetch("/api/spotify/now-playing", {
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    if (!Response.ok) {
      if (Response.status === 401) {
        return { isAuthenticated: false };
      }
      return null;
    }

    return await Response.json();
  } catch (error) {
    console.error("Error fetching now playing:", error);
    return null;
  }
}

export async function SearchSpotifyTracks(Query: string) {
  try {
    if (!Query.trim()) return { tracks: [] };

    const Response = await fetch(
      `/api/spotify/search?q=${encodeURIComponent(Query)}`,
      {
        credentials: "same-origin",
        cache: "no-store",
      },
    );

    if (!Response.ok) {
      if (Response.status === 401) {
        return { isAuthenticated: false, tracks: [] };
      }
      return { error: "Failed to search tracks", tracks: [] };
    }

    return await Response.json();
  } catch (error) {
    console.error("Error searching Spotify tracks:", error);
    return { error: "An error occurred", tracks: [] };
  }
}
