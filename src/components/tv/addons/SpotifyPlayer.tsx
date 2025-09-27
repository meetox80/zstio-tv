"use client";

import Image from "next/image";
import { TrackData } from "@/types/spotify";
import { useState, useEffect, useRef } from "react";

type SpotifyPlayerProps = {
  TrackData: TrackData;
  IsAuthenticated: boolean;
};

type TransitionState = "idle" | "transitioning" | "completed";

type MatrixTextProps = {
  Text: string;
  IsTransitioning: boolean;
  MaxLength: number;
};

const MatrixText: React.FC<MatrixTextProps> = ({ Text, IsTransitioning, MaxLength }) => {
  const [DisplayText, SetDisplayText] = useState(Text);
  const _PreviousText = useRef(Text);
  const _AnimFrame = useRef<number | null>(null);
  const _StartTime = useRef<number | null>(null);
  const _CharSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

  useEffect(() => {
    if (Text === _PreviousText.current) return;
    
    if (_AnimFrame.current) {
      cancelAnimationFrame(_AnimFrame.current);
    }
    
    const _FromText = _PreviousText.current;
    const _ToText = Text;
    const _Duration = IsTransitioning ? 800 : 600;
    const _Delay = 20;
    
    const _GetRandom = () => _CharSet[~~(Math.random() * _CharSet.length)];
    
    const _RunFrame = (Timestamp: number) => {
      if (!_StartTime.current) _StartTime.current = Timestamp;
      
      // whatever this shit is
      const _ElapsedTime = Timestamp - _StartTime.current;
      const _Progress = Math.min(1, _ElapsedTime / _Duration);
      const _Smooth = _Progress < 0.5 ? 2 * _Progress * _Progress : 1 - Math.pow(-2 * _Progress + 2, 2) / 2;
      
      const _CurrentLength = Math.round(_FromText.length + (_ToText.length - _FromText.length) * _Smooth);
      
      let _Result = "";
      for (let i = 0; i < _CurrentLength; i++) {
        const _CharDelay = i * _Delay;
        const _CharProgress = (_ElapsedTime - _CharDelay) / (_Duration - Math.min(_CharDelay, _Duration * 0.7));
        const _NormalizedProgress = Math.max(0, Math.min(1, _CharProgress));
        
        const _FromChar = i < _FromText.length ? _FromText[i] : "";
        const _ToChar = i < _ToText.length ? _ToText[i] : "";
        
        if (_FromChar === _ToChar && _ToChar !== "") {
          _Result += _ToChar;
        } else if (_NormalizedProgress > 0.85) {
          _Result += _ToChar;
        } else if (_NormalizedProgress < 0.25 && _FromChar !== "") {
          _Result += _FromChar;
        } else {
          _Result += _GetRandom();
        }
      }
      
      SetDisplayText(_Result);
      
      if (_Progress < 1) {
        _AnimFrame.current = requestAnimationFrame(_RunFrame);
      } else {
        SetDisplayText(_ToText);
        _PreviousText.current = _ToText;
        _AnimFrame.current = null;
        _StartTime.current = null;
      }
    };
    
    _AnimFrame.current = requestAnimationFrame(_RunFrame);
    
    return () => {
      if (_AnimFrame.current) {
        cancelAnimationFrame(_AnimFrame.current);
        _AnimFrame.current = null;
      }
    };
  }, [Text, IsTransitioning, MaxLength]);
  
  const _FinalText = DisplayText.length > MaxLength 
    ? DisplayText.substring(0, MaxLength) + "..." 
    : DisplayText;

  return (
    <span>
      {_FinalText}
    </span>
  );
};

export default function SpotifyPlayer({
  TrackData,
  IsAuthenticated,
}: SpotifyPlayerProps) {
  const [CurrentTrack, SetCurrentTrack] = useState<TrackData | null>(null);
  const [PreviousTrack, SetPreviousTrack] = useState<TrackData | null>(null);
  const [TransitionState, SetTransitionState] = useState<TransitionState>("idle");
  const _TimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const _PreloadImageRef = useRef<HTMLImageElement | null>(null);
  const _IsFirstRender = useRef<boolean>(true);

  useEffect(() => {
    if (_IsFirstRender.current && TrackData) {
      SetCurrentTrack(TrackData);
      SetPreviousTrack(TrackData);
      _IsFirstRender.current = false;
      return;
    }

    if (!TrackData || !TrackData.AlbumArt) {
      return;
    }

    const _IsNewTrack = !CurrentTrack || TrackData.Title !== CurrentTrack.Title;
    
    if (_IsNewTrack) {
      if (_TimeoutRef.current) {
        clearTimeout(_TimeoutRef.current);
      }

      SetPreviousTrack(CurrentTrack);
      SetTransitionState("transitioning");

      const _PreloadImage = document.createElement("img") as HTMLImageElement;
      _PreloadImage.src = TrackData.AlbumArt;
      _PreloadImageRef.current = _PreloadImage;

      _PreloadImage.onload = () => {
        _TimeoutRef.current = setTimeout(() => {
          SetCurrentTrack(TrackData);
          
          setTimeout(() => {
            SetTransitionState("completed");
            
            setTimeout(() => {
              SetTransitionState("idle");
            }, 1000);
          }, 700);
        }, 100);
      };

      _PreloadImage.onerror = () => {
        _TimeoutRef.current = setTimeout(() => {
          SetCurrentTrack(TrackData);
          SetTransitionState("idle");
        }, 100);
      };
    }

    return () => {
      if (_TimeoutRef.current) {
        clearTimeout(_TimeoutRef.current);
      }
    };
  }, [TrackData, CurrentTrack]);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          {PreviousTrack?.AlbumArt && (
            <Image
              src={PreviousTrack.AlbumArt}
              alt=""
              fill
              sizes="100vw"
              className={`object-cover blur-xl transition-opacity duration-1000 ease-linear ${
                TransitionState === "transitioning" ? "opacity-20" : "opacity-0"
              }`}
              priority={false}
            />
          )}
        </div>
        <div className="absolute inset-0">
          {CurrentTrack?.AlbumArt && (
            <Image
              src={CurrentTrack.AlbumArt}
              alt=""
              fill
              sizes="100vw"
              className={`object-cover blur-xl transition-opacity duration-1000 ease-linear ${
                TransitionState === "transitioning" ? "opacity-0" : "opacity-20"
              }`}
              priority={false}
            />
          )}
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-1/2 h-[50vh] overflow-hidden z-0">
        <div className="absolute inset-0">
          {PreviousTrack?.AlbumArt && CurrentTrack?.IsPlaying && (
            <Image
              src={PreviousTrack.AlbumArt}
              alt=""
              fill
              sizes="50vw"
              className={`object-cover object-[right_bottom] tv-mask-radial transition-opacity duration-700 ease-linear ${
                TransitionState === "transitioning" ? "opacity-25" : "opacity-0"
              }`}
              priority={false}
            />
          )}
        </div>
        <div className="absolute inset-0">
          {CurrentTrack?.AlbumArt && CurrentTrack.IsPlaying && (
            <Image
              src={CurrentTrack.AlbumArt}
              alt=""
              fill
              sizes="50vw"
              className={`object-cover object-[right_bottom] tv-mask-radial transition-opacity duration-700 ease-linear ${
                TransitionState === "transitioning" ? "opacity-0" : "opacity-25"
              }`}
              priority={false}
            />
          )}
        </div>
      </div>

      <div className="absolute bottom-0 right-0 h-[200px] flex items-center px-12 z-10">
        {TrackData?.IsPlaying ? (
          <div className="flex items-center">
            <div className="flex flex-col items-end mr-4">
              <div className="h-[45px] relative overflow-hidden">
                <h2 className="text-[36px] font-bold text-white leading-tight text-right">
                  <MatrixText 
                    Text={TrackData.Title || "Unknown Track"}
                    IsTransitioning={TransitionState === "transitioning"}
                    MaxLength={64}
                  />
                </h2>
              </div>
              <div className="h-[30px] relative overflow-hidden">
                <p className="text-[24px] text-gray-300 opacity-75 text-right">
                  <MatrixText 
                    Text={TrackData.Artist || "Unknown Artist"}
                    IsTransitioning={TransitionState === "transitioning"}
                    MaxLength={64}
                  />
                </p>
              </div>
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
              <h2 className="text-[36px] font-bold text-white/50 leading-tight">
                {(CurrentTrack?.Title || "Brak utworu").length > 64 
                  ? (CurrentTrack?.Title || "Brak utworu").substring(0, 64) + "..."
                  : (CurrentTrack?.Title || "Brak utworu")}
              </h2>
              <p className="text-[24px] text-gray-400 mt-1 opacity-75">
                {(CurrentTrack?.Artist || "Podepnij spotify").length > 64 
                  ? (CurrentTrack?.Artist || "Podepnij spotify").substring(0, 64) + "..."
                  : (CurrentTrack?.Artist || "Podepnij spotify")}
              </p>
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
  );
}
