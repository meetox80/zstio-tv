import { cache } from "react";
import { Prisma } from "./prisma";

const _SpotifyClientId = process.env.SPOTIFY_ID;
const _SpotifyClientSecret = process.env.SPOTIFY_SECRET;
const _RedirectUri =
  process.env.SPOTIFY_REDIRECT?.replace(/%/g, "") ||
  "http://localhost:3000/api/spotify/auth";

export async function SaveSpotifyTokens(
  AccessToken: string,
  RefreshToken: string,
  ExpiresIn: number,
) {
  const ExpiresAt = Date.now() + ExpiresIn * 1000;
  await Prisma.spotify.upsert({
    where: { id: 1 },
    update: {
      accessToken: AccessToken,
      refreshToken: RefreshToken,
      expiresAt: BigInt(ExpiresAt),
    },
    create: {
      id: 1,
      accessToken: AccessToken,
      refreshToken: RefreshToken,
      expiresAt: BigInt(ExpiresAt),
    },
  });
}

export async function GetSpotifyTokens() {
  const Result = await Prisma.spotify.findUnique({
    where: { id: 1 },
  });

  if (!Result) return undefined;

  return {
    access_token: Result.accessToken,
    refresh_token: Result.refreshToken,
    expires_at: Number(Result.expiresAt),
  };
}

export async function ClearSpotifyTokens() {
  await Prisma.spotify
    .delete({
      where: { id: 1 },
    })
    .catch(() => {});
}

export async function RefreshAccessToken() {
  const Tokens = await GetSpotifyTokens();

  if (!Tokens) {
    return null;
  }

  const Response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${_SpotifyClientId}:${_SpotifyClientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: Tokens.refresh_token,
    }),
  });

  const Data = await Response.json();

  if (!Response.ok) {
    console.error("Failed to refresh token:", Data);
    return null;
  }

  await SaveSpotifyTokens(
    Data.access_token,
    Data.refresh_token || Tokens.refresh_token,
    Data.expires_in,
  );

  return Data.access_token;
}

export async function GetValidAccessToken() {
  const Tokens = await GetSpotifyTokens();

  if (!Tokens) {
    return null;
  }

  if (Date.now() > Tokens.expires_at) {
    return RefreshAccessToken();
  }

  return Tokens.access_token;
}

export function GetAuthUrl() {
  const Scopes = ["user-read-currently-playing", "user-read-playback-state"];

  const Params = new URLSearchParams({
    client_id: _SpotifyClientId as string,
    response_type: "code",
    redirect_uri: _RedirectUri,
    scope: Scopes.join(" "),
  });

  return `https://accounts.spotify.com/authorize?${Params.toString()}`;
}

type TrackData = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  albumArt?: string;
  albumName?: string;
  duration?: number;
  progress?: number;
} | null;

export const GetCurrentTrack = cache(async (): Promise<TrackData> => {
  const AccessToken = await GetValidAccessToken();

  if (!AccessToken) {
    return { isPlaying: false };
  }

  const Response = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: `Bearer ${AccessToken}`,
      },
      cache: "no-store",
    },
  );

  if (Response.status === 204) {
    return { isPlaying: false };
  }

  if (!Response.ok) {
    if (Response.status === 401) {
      const NewToken = await RefreshAccessToken();
      if (NewToken) {
        return GetCurrentTrack();
      }
    }
    return { isPlaying: false };
  }

  const Data = await Response.json();

  return {
    isPlaying: Data.is_playing,
    title: Data.item?.name,
    artist: Data.item?.artists
      ?.map((artist: { name: string }) => artist.name)
      .join(", "),
    albumArt: Data.item?.album?.images?.[0]?.url,
    albumName: Data.item?.album?.name,
    duration: Data.item?.duration_ms,
    progress: Data.progress_ms,
  };
});
