import { GetCurrentTrack, GetSpotifyTokens } from "@/lib/spotify.server";
import BottomBar from "@/components/tv/BottomBar";
import TopBar from "@/components/tv/TopBar";
import { TrackData } from "@/types/spotify";
import { Inter } from "next/font/google";

const InterFont = Inter({ subsets: ["latin"], weight: ["700"] });

export default async function Home() {
  const _RawTrackData = await GetCurrentTrack();
  const _IsAuthenticated = !!GetSpotifyTokens();
  
  // Convert property names to match our expected format
  const _TrackData: TrackData = _RawTrackData ? {
    IsPlaying: _RawTrackData.isPlaying,
    Title: _RawTrackData.title,
    Artist: _RawTrackData.artist,
    AlbumArt: _RawTrackData.albumArt,
    AlbumName: _RawTrackData.albumName,
    Duration: _RawTrackData.duration,
    Progress: _RawTrackData.progress,
    IsAuthenticated: _IsAuthenticated
  } : null;
  
  return (
    <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#101010] overflow-hidden ${InterFont.className}`} style={{ width: "1920px", height: "1080px" }}>      
      <TopBar />
      <BottomBar TrackData={_TrackData} IsAuthenticated={_IsAuthenticated} />
    </div>
  );
}
