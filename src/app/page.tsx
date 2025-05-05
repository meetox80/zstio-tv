import { GetCurrentTrack, GetSpotifyTokens } from "@/lib/spotify.server";
import SpotifyPlayer from "../components/SpotifyPlayer";

export default async function Home() {
  const _TrackData = await GetCurrentTrack();
  const _IsAuthenticated = !!GetSpotifyTokens();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md px-4">
        <SpotifyPlayer initialTrackData={_TrackData} isAuthenticated={_IsAuthenticated} />
      </div>
    </div>
  );
}
