'use client'

import Image from "next/image"
import { TrackData } from "@/types/spotify"

type SpotifyPlayerProps = {
  TrackData: TrackData
  IsAuthenticated: boolean
}

export default function SpotifyPlayer({ TrackData, IsAuthenticated }: SpotifyPlayerProps) {
  return (
    <>
      {TrackData?.AlbumArt && (
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center blur-xl opacity-10" 
            style={{ backgroundImage: `url(${TrackData.AlbumArt})` }}
          />
        </div>
      )}
      
      {TrackData?.AlbumArt && TrackData.IsPlaying && (
        <div className="absolute bottom-0 right-0 w-1/2 h-[50vh] overflow-hidden z-0">
          <div 
            className="absolute inset-0 bg-cover bg-right-bottom opacity-25" 
            style={{ 
              backgroundImage: `url(${TrackData.AlbumArt})`,
              maskImage: 'radial-gradient(ellipse at calc(100% + 150px) bottom, rgba(0,0,0,1) 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at calc(100% + 150px) bottom, rgba(0,0,0,1) 20%, transparent 70%)'
            }}
          />
        </div>
      )}
      
      <div className="absolute bottom-0 right-0 h-[200px] flex items-center px-12 z-10">
        {TrackData?.IsPlaying ? (
          <div className="flex items-center">
            <div className="flex flex-col items-end mr-4">
              <h2 className="text-[36px] font-bold text-white leading-tight">{TrackData.Title || "Unknown Track"}</h2>
              <p className="text-[24px] text-gray-300 -mt-1 opacity-75">{TrackData.Artist || "Unknown Artist"}</p>
            </div>
            <div className="h-[72px] flex items-center ml-2">
              <Image 
                src="/fm-512.png" 
                alt="FM Logo" 
                width={72} 
                height={72} 
                className="object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="flex flex-col items-end mr-4">
              <h2 className="text-[36px] font-bold text-white/50 leading-tight">Not Playing</h2>
              <p className="text-[24px] text-gray-400 mt-1 opacity-75">Connect Spotify to see current track</p>
            </div>
            <div className="h-[70px] flex items-center">
              <Image 
                src="/fm-512.png" 
                alt="FM Logo" 
                width={70} 
                height={70} 
                className="object-contain opacity-50"
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
} 