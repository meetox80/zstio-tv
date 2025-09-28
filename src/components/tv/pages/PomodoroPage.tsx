"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import AnimatedDigit from "../addons/AnimatedDigit";
import {
  GetCurrentPeriodInfo,
  PeriodInfo,
  SubscribeToLessonDuration,
  InitializeLessonDuration,
  FormatTimeDisplay,
} from "@/lib/data/LessonTimes/LessonTimesUtil";

export default function PomodoroPage() {
  const [_IsLoading, SetIsLoading] = useState(true);
  const _InitialInfo = GetCurrentPeriodInfo();
  const [_PeriodInfo, SetPeriodInfo] = useState<PeriodInfo>(_InitialInfo);
  const _InitialEndMsCalc = (() => {
    if (!_InitialInfo.End) return Date.now();
    const [H, M] = _InitialInfo.End.split(":").map(Number);
    const Now = new Date();
    const End = new Date(Now.getFullYear(), Now.getMonth(), Now.getDate(), H, M, 0, 0);
    return End.getTime();
  })();
  const [_DisplayTime, SetDisplayTime] = useState(
    FormatTimeDisplay(Math.max(0, Math.floor((_InitialEndMsCalc - Date.now()) / 1000)))
  );
  const _ContainerRef = useRef<HTMLDivElement>(null);
  const _EndTimeMsRef = useRef<number>(Date.now());
  const _RafIdRef = useRef<number | null>(null);

  const _ParseEndTimeMs = (Info: PeriodInfo): number => {
    if (!Info.End) return Date.now();
    const [H, M] = Info.End.split(":").map(Number);
    const Now = new Date();
    const End = new Date(Now.getFullYear(), Now.getMonth(), Now.getDate(), H, M, 0, 0);
    return End.getTime();
  };

  useEffect(() => {
    const FetchLessonDuration = async () => {
      try {
        const Response = await fetch("/api/settings");
        if (Response.ok) {
          const Settings = await Response.json();
          if (Settings.lessonTime) {
            InitializeLessonDuration(Settings.lessonTime);
          }
        }
      } catch (Error) {
        console.error("Failed to fetch lesson duration:", Error);
      } finally {
        SetIsLoading(false);
      }
    };

    FetchLessonDuration();
  }, []);

  useEffect(() => {
    if (_IsLoading) return;

    const InitInfo = GetCurrentPeriodInfo();
    SetPeriodInfo(InitInfo);
    _EndTimeMsRef.current = _ParseEndTimeMs(InitInfo);

    const Tick = () => {
      const NowMs = Date.now();
      const RemainingSec = Math.max(0, Math.floor((_EndTimeMsRef.current - NowMs) / 1000));
      const Display = FormatTimeDisplay(RemainingSec);
      SetDisplayTime((Prev) => (Prev !== Display ? Display : Prev));
      if (RemainingSec <= 0) {
        const Info = GetCurrentPeriodInfo();
        SetPeriodInfo(Info);
        _EndTimeMsRef.current = _ParseEndTimeMs(Info);
      }
      _RafIdRef.current = requestAnimationFrame(Tick);
    };

    _RafIdRef.current = requestAnimationFrame(Tick);

    const _Unsubscribe = SubscribeToLessonDuration(() => {
      const Info = GetCurrentPeriodInfo();
      SetPeriodInfo(Info);
      _EndTimeMsRef.current = _ParseEndTimeMs(Info);
    });

    return () => {
      if (_RafIdRef.current) cancelAnimationFrame(_RafIdRef.current);
      _Unsubscribe();
    };
  }, [_IsLoading]);

  const _PeriodLabel = _PeriodInfo.IsLesson
    ? `Lekcja ${_PeriodInfo.PeriodNumber}`
    : _PeriodInfo.PeriodNumber > 0
    ? "Przerwa"
    : "Po lekcjach";

  const _SubLabel = (() => {
    if (_PeriodInfo.IsLesson) return `Lekcja ${_PeriodInfo.PeriodNumber}`;
    if (_PeriodInfo.PeriodNumber > 0) {
      const [Min] = (_PeriodInfo.End && _PeriodInfo.Start)
        ? (() => {
            const [sh, sm] = _PeriodInfo.Start.split(":").map(Number);
            const [eh, em] = _PeriodInfo.End.split(":").map(Number);
            return [eh * 60 + em - (sh * 60 + sm)];
          })()
        : [0];
      return `Przerwa ${Min} minutowa`;
    }
    return "Po lekcjach";
  })();

  return (
    <div
      ref={_ContainerRef}
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
    >
      <div className="absolute inset-0"></div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full" style={{ transform: "translateY(50px)" }}>
        <div>
          <AnimatedDigit Value={_DisplayTime} Size="xxlarge" />
        </div>
        <div
          className="mt-6 text-white/90 text-[64px] font-semibold tracking-tight"
          style={{ textShadow: "0 2px 16px rgba(255,255,255,0.06)" }}
        >
          {_SubLabel}
        </div>
      </div>
    </div>
  );
}