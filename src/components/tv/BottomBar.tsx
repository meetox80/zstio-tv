'use client'

import { useState, useEffect, useRef } from "react"
import TimeDisplay from "./addons/TimeDisplay"
import SpotifyPlayer from "./addons/SpotifyPlayer"
import { TrackData } from "@/types/spotify"
import { GetNowPlaying } from "@/lib/spotify.client"
import { motion } from "framer-motion"

type BottomBarProps = {
  TrackData: TrackData
  IsAuthenticated: boolean
}

export default function BottomBar({ TrackData: initialTrackData, IsAuthenticated: initialIsAuthenticated }: BottomBarProps) {
  const [_TrackData, SetTrackData] = useState<TrackData>(initialTrackData);
  const [_IsAuthenticated, SetIsAuthenticated] = useState(initialIsAuthenticated);
  const _RetryCount = useRef(0);
  const _MaxRetries = 3;
  const _RetryDelay = 5000;
  const _IsMounted = useRef(true);
  
  useEffect(() => {
    _IsMounted.current = true
    return () => { _IsMounted.current = false }
  }, [])
  
  useEffect(() => {
    const FetchCurrentTrack = async () => {
      if (!_IsAuthenticated || !_IsMounted.current) return
      
      try {
        const Data = await GetNowPlaying()
        
        if (Data) {
          _RetryCount.current = 0
          
          if (_IsMounted.current) {
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
        } else if (_RetryCount.current < _MaxRetries) {
          _RetryCount.current++
        }
      } catch (Error) {
        if (_IsMounted.current && _RetryCount.current < _MaxRetries) {
          _RetryCount.current++
        }
      }
    }
    
    FetchCurrentTrack()
    
    const _UpdateInterval = setInterval(FetchCurrentTrack, _RetryDelay)
    
    return () => clearInterval(_UpdateInterval)
  }, [_IsAuthenticated])
  
  useEffect(() => {
    SetTrackData(initialTrackData)
  }, [initialTrackData])
  
  useEffect(() => {
    SetIsAuthenticated(initialIsAuthenticated)
  }, [initialIsAuthenticated])
  
  return (
    <>
      <SpotifyPlayer 
        TrackData={_TrackData}
        IsAuthenticated={_IsAuthenticated}
      />
      
      <motion.div 
        className="absolute bottom-0 left-0 h-[200px] flex items-center px-12 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
      >
        <motion.div 
          className="flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
        >
          <TimeDisplay />
        </motion.div>
      </motion.div>
    </>
  )
} 