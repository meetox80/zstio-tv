"use client";

import { useEffect, useRef, useState } from "react";
import { TrackSpotifyPlay } from "@/lib/statistics.client";
import { GetNowPlaying } from "@/lib/spotify.client";

export default function StatisticsTracker() {
  const _LastTrackId = useRef<string | null>(null);
  const _CheckInterval = useRef<NodeJS.Timeout | null>(null);
  const _IsMounted = useRef(true);
  const _IsFirstCheck = useRef(true);

  useEffect(() => {
    _IsMounted.current = true;

    const CheckCurrentTrack = async () => {
      if (!_IsMounted.current) return;

      try {
        const TrackData = await GetNowPlaying();

        if (TrackData && TrackData.isPlaying) {
          const CurrentTrackId = `${TrackData.title}-${TrackData.artist}`;

          if (
            (CurrentTrackId !== _LastTrackId.current &&
              _LastTrackId.current !== null) ||
            (_IsFirstCheck.current && TrackData.isPlaying)
          ) {
            await TrackSpotifyPlay();
          }

          _LastTrackId.current = CurrentTrackId;
          _IsFirstCheck.current = false;
        }
      } catch (Error) {
        console.error("Error checking current track for statistics:", Error);
      }
    };

    CheckCurrentTrack();

    _CheckInterval.current = setInterval(CheckCurrentTrack, 30000);

    return () => {
      _IsMounted.current = false;
      if (_CheckInterval.current) {
        clearInterval(_CheckInterval.current);
      }
    };
  }, []);

  return null;
}
