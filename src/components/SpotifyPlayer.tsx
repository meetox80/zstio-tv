'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { GetSpotifyAuthUrl, GetNowPlaying } from '@/lib/spotify.client'

type TrackData = {
  isPlaying: boolean
  title?: string
  artist?: string
  albumArt?: string
  albumName?: string
  duration?: number
  progress?: number
  isAuthenticated?: boolean
} | null

type SpotifyPlayerProps = {
  initialTrackData: TrackData
  isAuthenticated: boolean
}

export default function SpotifyPlayer({ initialTrackData, isAuthenticated }: SpotifyPlayerProps) {
  const [TrackData, SetTrackData] = useState<TrackData>(initialTrackData)
  const [IsAuthenticated, SetIsAuthenticated] = useState(isAuthenticated)
  const [IsLoading, SetIsLoading] = useState(false)
  const [LocalProgress, SetLocalProgress] = useState<number | undefined>(initialTrackData?.progress)
  const _ProgressInterval = useRef<NodeJS.Timeout | null>(null)
  const _LastUpdateTime = useRef<number>(Date.now())

  useEffect(() => {
    const FetchCurrentTrack = async () => {
      if (!IsAuthenticated) return
      
      const Data = await GetNowPlaying()
      if (Data) {
        SetTrackData(Data)
        SetLocalProgress(Data.progress)
        _LastUpdateTime.current = Date.now()
        
        if (Data.isAuthenticated === false) {
          SetIsAuthenticated(false)
        }
      }
    }
    
    FetchCurrentTrack()
    
    const _ApiInterval = setInterval(FetchCurrentTrack, 10000)
    
    return () => {
      clearInterval(_ApiInterval)
      if (_ProgressInterval.current) {
        clearInterval(_ProgressInterval.current)
      }
    }
  }, [IsAuthenticated])
  
  useEffect(() => {
    if (_ProgressInterval.current) {
      clearInterval(_ProgressInterval.current)
    }
    
    if (TrackData?.isPlaying && TrackData?.progress !== undefined && TrackData?.duration !== undefined) {
      _ProgressInterval.current = setInterval(() => {
        const ElapsedTime = Date.now() - _LastUpdateTime.current
        const NewProgress = Math.min(TrackData.duration!, (TrackData.progress || 0) + ElapsedTime)
        
        SetLocalProgress(NewProgress)
        
        if (NewProgress >= TrackData.duration!) {
          if (_ProgressInterval.current) {
            clearInterval(_ProgressInterval.current)
          }
        }
      }, 1000)
    }
    
    return () => {
      if (_ProgressInterval.current) {
        clearInterval(_ProgressInterval.current)
      }
    }
  }, [TrackData])
  
  const HandleAuthorizeClick = async () => {
    SetIsLoading(true)
    try {
      const AuthUrl = await GetSpotifyAuthUrl()
      window.location.href = AuthUrl
    } catch (error) {
      console.error('Failed to get auth URL:', error)
      SetIsLoading(false)
    }
  }
  
  const FormatTime = (ms: number): string => {
    const TotalSeconds = Math.floor(ms / 1000)
    const Minutes = Math.floor(TotalSeconds / 60)
    const Seconds = TotalSeconds % 60
    return `${Minutes}:${Seconds.toString().padStart(2, '0')}`
  }

  if (IsAuthenticated) {
    return (
      <div className="w-full backdrop-blur-xl bg-black/40 border border-rose-500/20 shadow-2xl rounded-xl overflow-hidden transition-all duration-500 hover:shadow-rose-500/10 hover:scale-[1.02]">
        {TrackData && TrackData.isPlaying ? (
          <div className="flex flex-col md:flex-row w-full">
            {TrackData.albumArt && (
              <div className="w-full md:w-48 h-48 relative flex-shrink-0">
                <Image
                  src={TrackData.albumArt}
                  alt={TrackData.albumName || "Album Art"}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            )}
            <div className="flex flex-col justify-center p-6">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 mr-2 text-green-500 flex items-center justify-center">
                  <i className="fab fa-spotify text-sm"></i>
                </div>
                <span className="text-xs font-medium text-green-500">Now Playing on Spotify</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{TrackData.title}</h2>
              <p className="text-gray-300">{TrackData.artist}</p>
              
              {TrackData.duration && LocalProgress !== undefined && (
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full" 
                      style={{ width: `${(LocalProgress / TrackData.duration) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{FormatTime(LocalProgress)}</span>
                    <span>{FormatTime(TrackData.duration)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3 text-green-500 flex items-center justify-center">
                <i className="fab fa-spotify text-base"></i>
              </div>
              <span className="text-gray-300">No track currently playing on Spotify</span>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="w-full backdrop-blur-xl bg-black/40 border border-rose-500/20 shadow-2xl rounded-xl p-8 text-center">
      <div className="w-12 h-12 mx-auto mb-4 text-green-500 flex items-center justify-center">
        <i className="fab fa-spotify text-4xl"></i>
      </div>
      <h2 className="text-xl font-bold text-white mb-3">Connect Spotify to display your tracks</h2>
      <p className="text-gray-300 mb-6">Authorize Spotify to see your currently playing track here.</p>
      <button 
        onClick={HandleAuthorizeClick}
        disabled={IsLoading}
        className="inline-flex items-center justify-center px-5 py-2 bg-rose-600 text-white rounded-lg transition-all duration-300 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{IsLoading ? 'Connecting...' : 'Connect to Spotify'}</span>
        {!IsLoading && (
          <span className="ml-2 flex items-center justify-center w-4 h-4">
            <i className="fas fa-chevron-right text-sm"></i>
          </span>
        )}
      </button>
    </div>
  )
} 