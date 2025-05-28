import { GetCurrentTrack, GetSpotifyTokens } from "@/lib/spotify.server";
import BottomBar from "@/components/tv/BottomBar";
import TopBar from "@/components/tv/TopBar";
import { TrackData } from "@/types/spotify";
import { Inter } from "next/font/google";
import FullscreenHandler from "@/components/tv/addons/FullscreenHandler";
import PageSwitcher from "@/components/tv/addons/PageSwitcher";
import PageProgressBar from "@/components/tv/addons/PageProgressBar";
import SettingsRefresher from "@/components/tv/addons/SettingsRefresher";
import StatisticsTracker from "@/components/tv/addons/StatisticsTracker";

const _InterFont = Inter({ subsets: ["latin"], weight: ["700"] });

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
    <div 
      className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#101010] overflow-hidden ${_InterFont.className}`} 
      style={{ 
        width: "1920px", 
        height: "1080px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)"
      }}
    >      
      <div className="absolute inset-0 bg-gradient-to-b from-[#151515] to-[#101010] opacity-60"></div>
      
      <FullscreenHandler />
      <TopBar />
      <SettingsRefresher />
      <StatisticsTracker />
      
      <div className="absolute inset-0 pt-[120px] pb-[200px] z-10">
        <PageSwitcher />
      </div>
      
      <BottomBar TrackData={_TrackData} IsAuthenticated={_IsAuthenticated} />
      <PageProgressBar />
    </div>
  );
}
