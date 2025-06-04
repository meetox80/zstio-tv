import React, { useState, useEffect } from "react";
import {
  GetCurrentPeriodInfo,
  PeriodInfo,
  SubscribeToLessonDuration,
  InitializeLessonDuration,
} from "@/lib/data/LessonTimes/LessonTimesUtil";

export default function LessonWidget() {
  const _CircleSize = 28;
  const _StrokeWidth = 5.5;
  const [IsLoading, setIsLoading] = useState(true);

  const [PeriodInfo, setPeriodInfo] = useState<PeriodInfo>({
    IsLesson: false,
    PeriodNumber: 0,
    RemainingTime: "00:00",
    ProgressPercent: 0,
  });

  const CalculateStrokeDashoffset = (Progress: number) => {
    const Circumference = 2 * Math.PI * ((_CircleSize - _StrokeWidth) / 2);
    return Circumference - (Progress / 100) * Circumference;
  };

  const CircleStyles = {
    strokeDasharray: 2 * Math.PI * ((_CircleSize - _StrokeWidth) / 2),
    strokeDashoffset: CalculateStrokeDashoffset(PeriodInfo.ProgressPercent),
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
        setIsLoading(false);
      }
    };

    FetchLessonDuration();
  }, []);

  useEffect(() => {
    if (IsLoading) return;

    const UpdateTimeAndStatus = () => {
      const CurrentInfo = GetCurrentPeriodInfo();
      setPeriodInfo(CurrentInfo);
    };

    UpdateTimeAndStatus();

    const IntervalId = setInterval(UpdateTimeAndStatus, 1000);

    const Unsubscribe = SubscribeToLessonDuration(() => {
      UpdateTimeAndStatus();
    });

    return () => {
      clearInterval(IntervalId);
      Unsubscribe();
    };
  }, [IsLoading]);

  return (
    <div className="w-full h-full rounded-[7px] flex items-center">
      <div className="relative w-full h-[60px] flex">
        <div className="w-1/2 h-full bg-[#1C1919]/50 border border-[#282626] rounded-l-[7px] flex items-center">
          <div className="flex items-center justify-between w-full px-4">
            <div className="relative flex items-center">
              <svg
                width={_CircleSize}
                height={_CircleSize}
                viewBox={`0 0 ${_CircleSize} ${_CircleSize}`}
              >
                <circle
                  cx={_CircleSize / 2}
                  cy={_CircleSize / 2}
                  r={(_CircleSize - _StrokeWidth) / 2}
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.25"
                  strokeWidth={_StrokeWidth}
                  strokeLinecap="round"
                />
                <circle
                  cx={_CircleSize / 2}
                  cy={_CircleSize / 2}
                  r={(_CircleSize - _StrokeWidth) / 2}
                  fill="none"
                  stroke="white"
                  strokeWidth={_StrokeWidth}
                  strokeLinecap="round"
                  style={CircleStyles}
                  transform={`rotate(-90 ${_CircleSize / 2} ${_CircleSize / 2})`}
                />
              </svg>
            </div>
            <div className="text-white text-lg font-medium flex-1 text-center ml-3">
              {PeriodInfo.RemainingTime}
            </div>
          </div>
        </div>
        <div className="w-1/2 h-full bg-[#1C1919]/50 border border-[#2B2828] rounded-r-[7px] flex items-center justify-center">
          <span className="text-white text-lg font-medium">
            {PeriodInfo.IsLesson
              ? `Lekcja ${PeriodInfo.PeriodNumber}`
              : PeriodInfo.PeriodNumber > 0
                ? "Przerwa"
                : "Po lekcjach"}
          </span>
        </div>
      </div>
    </div>
  );
}
