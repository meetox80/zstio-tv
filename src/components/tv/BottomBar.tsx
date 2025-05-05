'use client'

import { useState, useEffect } from "react"
import TimeDisplay from "./TimeDisplay"
import SpotifyPlayer from "./SpotifyPlayer"
import { TrackData } from "@/types/spotify"
import { GetNowPlaying } from "@/lib/spotify.client"

type BottomBarProps = {
  TrackData: TrackData
  IsAuthenticated: boolean
}

export default function BottomBar({ TrackData: initialTrackData, IsAuthenticated: initialIsAuthenticated }: BottomBarProps) {
  const [TrackData, SetTrackData] = useState<TrackData>(initialTrackData)
  const [IsAuthenticated, SetIsAuthenticated] = useState(initialIsAuthenticated)
  
  useEffect(() => {
    const FetchCurrentTrack = async () => {
      if (!IsAuthenticated) return
      
      try {
        const Data = await GetNowPlaying()
        if (Data) {
          const MappedData: TrackData = {
            IsPlaying: Data.isPlaying || false,
            Title: Data.title,
            Artist: Data.artist,
            AlbumArt: Data.albumArt,
            AlbumName: Data.albumName,
            Duration: Data.duration,
            Progress: Data.progress,
            IsAuthenticated: Data.isAuthenticated
          }
          
          SetTrackData(MappedData)
          
          if (Data.isAuthenticated === false) {
            SetIsAuthenticated(false)
          }
        }
      } catch (Error) {
        console.error("Error fetching track:", Error)
      }
    }
    
    FetchCurrentTrack()
    
    const _UpdateInterval = setInterval(FetchCurrentTrack, 5000)
    
    return () => clearInterval(_UpdateInterval)
  }, [IsAuthenticated])
  
  useEffect(() => {
    SetTrackData(initialTrackData)
  }, [initialTrackData])
  
  useEffect(() => {
    SetIsAuthenticated(initialIsAuthenticated)
  }, [initialIsAuthenticated])
  
  return (
    <>
      <SpotifyPlayer 
        TrackData={TrackData}
        IsAuthenticated={IsAuthenticated}
      />
      
      <div className="absolute bottom-0 left-0 h-[200px] flex items-center px-12 z-10">
        <div className="flex flex-col">
          <TimeDisplay />
        </div>
      </div>
    </>
  )
} 