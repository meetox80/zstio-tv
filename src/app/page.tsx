import { GetCurrentTrack, GetSpotifyTokens } from "@/lib/spotify.server";
import BottomBar from "@/components/tv/BottomBar";
import TopBar from "@/components/tv/TopBar";
import { TrackData } from "@/types/spotify";
import { Inter } from "next/font/google";
import FullscreenHandler from "@/components/tv/addons/FullscreenHandler";
import PageSwitcher from "@/components/tv/addons/PageSwitcher";
import PageProgressBar from "@/components/tv/addons/PageProgressBar";

const InterFont = Inter({ subsets: ["latin"], weight: ["700"] });

export default async function Home() {
  const _RawTrackData = await GetCurrentTrack();
  const _IsAuthenticated = !!GetSpotifyTokens();
  
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
      <FullscreenHandler />
      <TopBar />
      
      <div className="absolute inset-0 pt-[120px] pb-[200px]">
        <PageSwitcher />
      </div>
      
      <BottomBar TrackData={_TrackData} IsAuthenticated={_IsAuthenticated} />
      <PageProgressBar />
    </div>
  );
}
