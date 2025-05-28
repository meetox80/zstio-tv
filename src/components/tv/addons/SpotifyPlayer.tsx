'use client'

import Image from 'next/image'
import { TrackData } from '@/types/spotify'
import { useState, useEffect, useRef } from 'react'

type SpotifyPlayerProps = {
  TrackData: TrackData
  IsAuthenticated: boolean
}

export default function SpotifyPlayer({ TrackData, IsAuthenticated }: SpotifyPlayerProps) {
  const [_PreviousTrack, SetPreviousTrack] = useState<TrackData | null>(null)
  const [_IsTransitioning, SetIsTransitioning] = useState(false)
  const _TimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const _PreloadImageRef = useRef<HTMLImageElement | null>(null)
  const _IsFirstRender = useRef<boolean>(true)

  useEffect(() => {
    if (_IsFirstRender.current && TrackData) {
      SetPreviousTrack(TrackData)
      _IsFirstRender.current = false
      return
    }

    if (TrackData?.AlbumArt && (!_PreviousTrack || TrackData.Title !== _PreviousTrack.Title)) {
      if (_TimeoutRef.current) {
        clearTimeout(_TimeoutRef.current)
      }
      
      if (TrackData.AlbumArt) {
        const PreloadImage = document.createElement('img') as HTMLImageElement
        PreloadImage.src = TrackData.AlbumArt
        _PreloadImageRef.current = PreloadImage
      }
      
      SetIsTransitioning(true)
      
      _TimeoutRef.current = setTimeout(() => {
        SetPreviousTrack(TrackData)
        SetIsTransitioning(false)
      }, 600)
    }
    
    return () => {
      if (_TimeoutRef.current) {
        clearTimeout(_TimeoutRef.current)
      }
    }
  }, [TrackData])

  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
        {_PreviousTrack?.AlbumArt && (
          <div 
            className={`absolute inset-0 bg-cover bg-center blur-xl transition-opacity duration-1000 ease-in-out ${_IsTransitioning ? 'opacity-0' : 'opacity-5'}`} 
            style={{ backgroundImage: `url(${_PreviousTrack.AlbumArt})` }}
          />
        )}
        {TrackData?.AlbumArt && (
          <div 
            className={`absolute inset-0 bg-cover bg-center blur-xl transition-opacity duration-1000 ease-in-out ${_IsTransitioning ? 'opacity-5' : 'opacity-0'}`} 
            style={{ backgroundImage: `url(${TrackData.AlbumArt})` }}
          />
        )}
      </div>
      
      <div className="absolute bottom-0 right-0 w-1/2 h-[50vh] overflow-hidden z-0">
        {_PreviousTrack?.AlbumArt && _PreviousTrack.IsPlaying && (
          <div 
            className={`absolute inset-0 bg-cover bg-right-bottom transition-opacity duration-1000 ease-in-out ${_IsTransitioning ? 'opacity-0' : 'opacity-25'}`} 
            style={{ 
              backgroundImage: `url(${_PreviousTrack.AlbumArt})`,
              maskImage: 'radial-gradient(ellipse at calc(100% + 1500px) bottom, rgba(0,0,0,1) 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at calc(100% + 1500px) bottom, rgba(0,0,0,1) 20%, transparent 70%)'
            }}
          />
        )}
        {TrackData?.AlbumArt && TrackData.IsPlaying && (
          <div 
            className={`absolute inset-0 bg-cover bg-right-bottom transition-opacity duration-1000 ease-in-out ${_IsTransitioning ? 'opacity-25' : 'opacity-0'}`} 
            style={{ 
              backgroundImage: `url(${TrackData.AlbumArt})`,
              maskImage: 'radial-gradient(ellipse at calc(100% + 1500px) bottom, rgba(0,0,0,1) 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at calc(100% + 1500px) bottom, rgba(0,0,0,1) 20%, transparent 70%)'
            }}
          />
        )}
      </div>
      
      <div className="absolute bottom-0 right-0 h-[200px] flex items-center px-12 z-10">
        {TrackData?.IsPlaying ? (
          <div className="flex items-center">
            <div className="flex flex-col items-end mr-4">
              {_IsTransitioning ? (
                <>
                  <div className="h-[45px] relative overflow-hidden">
                    <h2 className="text-[36px] font-bold text-white leading-tight text-right animate-slide-up">
                      {_PreviousTrack?.Title || "Unknown Track"}
                    </h2>
                    <h2 className="text-[36px] font-bold text-white leading-tight text-right animate-slide-up-in">
                      {TrackData.Title || "Unknown Track"}
                    </h2>
                  </div>
                  <div className="h-[30px] relative overflow-hidden">
                    <p className="text-[24px] text-gray-300 opacity-75 text-right animate-slide-up">
                      {_PreviousTrack?.Artist || "Unknown Artist"}
                    </p>
                    <p className="text-[24px] text-gray-300 opacity-75 text-right animate-slide-up-in">
                      {TrackData.Artist || "Unknown Artist"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-[36px] font-bold text-white leading-tight text-right">
                    {_PreviousTrack?.Title || TrackData.Title || "Unknown Track"}
                  </h2>
                  <p className="text-[24px] text-gray-300 opacity-75 text-right">
                    {_PreviousTrack?.Artist || TrackData.Artist || "Unknown Artist"}
                  </p>
                </>
              )}
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

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(0); }
          to { transform: translateY(-100%); }
        }
        @keyframes slideUpIn {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.5s forwards;
        }
        .animate-slide-up-in {
          animation: slideUpIn 0.5s forwards;
        }
      `}</style>
    </>
  )
} 