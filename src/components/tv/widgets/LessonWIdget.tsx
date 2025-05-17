import React, { useState, useEffect } from "react";
import { 
  GetStandardLessonTimes, 
  GetStandardBreakTimes, 
  ParseTimeRange 
} from "../../../lib/data/LessonTimes/LessonTimesUtil";

export default function LessonWidget() {
  const _CircleSize = 28;
  const _StrokeWidth = 5.5;

  const [CurrentTime, setCurrentTime] = useState(new Date());
  const [Progress, setProgress] = useState(0);
  const [IsLesson, setIsLesson] = useState(true);
  const [PeriodNumber, setPeriodNumber] = useState(1);
  const [TimeDisplay, setTimeDisplay] = useState("00:00");

  const CalculateStrokeDashoffset = (Progress: number) => {
    const Circumference = 2 * Math.PI * ((_CircleSize - _StrokeWidth) / 2);
    return Circumference - (Progress / 100) * Circumference;
  };

  const CircleStyles = {
    strokeDasharray: 2 * Math.PI * ((_CircleSize - _StrokeWidth) / 2),
    strokeDashoffset: CalculateStrokeDashoffset(Progress),
  };

  const FormatTimeDisplay = (RemainingSeconds: number) => {
    const Minutes = Math.floor(RemainingSeconds / 60);
    const Seconds = Math.floor(RemainingSeconds % 60);
    return `${String(Minutes).padStart(2, "0")}:${String(Seconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    const UpdateTimeAndStatus = () => {
      const Now = new Date();
      setCurrentTime(Now);

      const CurrentHours = Now.getHours();
      const CurrentMinutes = Now.getMinutes();
      const CurrentSeconds = Now.getSeconds();
      const CurrentTimeInMinutes = CurrentHours * 60 + CurrentMinutes + CurrentSeconds / 60;

      const LessonTimes = GetStandardLessonTimes();
      const BreakTimes = GetStandardBreakTimes();

      let FoundPeriod = false;

      for (let i = 0; i < LessonTimes.length; i++) {
        const LessonTime = ParseTimeRange(LessonTimes[i]);
        const [LessonStartHour, LessonStartMinute] = LessonTime.Start.split(":").map(Number);
        const [LessonEndHour, LessonEndMinute] = LessonTime.End.split(":").map(Number);

        const LessonStartInMinutes = LessonStartHour * 60 + LessonStartMinute;
        const LessonEndInMinutes = LessonEndHour * 60 + LessonEndMinute;

        if (CurrentTimeInMinutes >= LessonStartInMinutes && CurrentTimeInMinutes < LessonEndInMinutes) {
          setIsLesson(true);
          setPeriodNumber(i + 1);
          
          const TotalLessonMinutes = LessonEndInMinutes - LessonStartInMinutes;
          const ElapsedMinutes = CurrentTimeInMinutes - LessonStartInMinutes;
          const ProgressPercentage = (ElapsedMinutes / TotalLessonMinutes) * 100;
          setProgress(ProgressPercentage);
          
          const RemainingSeconds = (LessonEndInMinutes - CurrentTimeInMinutes) * 60;
          setTimeDisplay(FormatTimeDisplay(RemainingSeconds));
          
          FoundPeriod = true;
          break;
        }
      }

      if (!FoundPeriod) {
        for (let i = 0; i < BreakTimes.length; i++) {
          const BreakTime = ParseTimeRange(BreakTimes[i]);
          const [BreakStartHour, BreakStartMinute] = BreakTime.Start.split(":").map(Number);
          const [BreakEndHour, BreakEndMinute] = BreakTime.End.split(":").map(Number);

          const BreakStartInMinutes = BreakStartHour * 60 + BreakStartMinute;
          const BreakEndInMinutes = BreakEndHour * 60 + BreakEndMinute;

          if (CurrentTimeInMinutes >= BreakStartInMinutes && CurrentTimeInMinutes < BreakEndInMinutes) {
            setIsLesson(false);
            setPeriodNumber(i + 1);
            
            const TotalBreakMinutes = BreakEndInMinutes - BreakStartInMinutes;
            const ElapsedMinutes = CurrentTimeInMinutes - BreakStartInMinutes;
            const ProgressPercentage = (ElapsedMinutes / TotalBreakMinutes) * 100;
            setProgress(ProgressPercentage);
            
            const RemainingSeconds = (BreakEndInMinutes - CurrentTimeInMinutes) * 60;
            setTimeDisplay(FormatTimeDisplay(RemainingSeconds));
            
            FoundPeriod = true;
            break;
          }
        }
      }

      if (!FoundPeriod) {
        setIsLesson(false);
        setPeriodNumber(0);
        setProgress(0);
        setTimeDisplay("00:00");
      }
    };

    UpdateTimeAndStatus();
    const IntervalId = setInterval(UpdateTimeAndStatus, 1000);

    return () => clearInterval(IntervalId);
  }, []);

  return (
    <div className="w-full h-full rounded-[7px] flex items-center">
      <div className="relative w-full h-[60px] flex">
        <div className="w-1/2 h-full bg-[#1C1919]/50 border border-[#282626] rounded-l-[7px] flex items-center">
          <div className="flex items-center justify-between w-full px-4">
            <div className="relative flex items-center">
              <svg width={_CircleSize} height={_CircleSize} viewBox={`0 0 ${_CircleSize} ${_CircleSize}`}>
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
            <div className="text-white text-lg font-medium flex-1 text-center ml-3">{TimeDisplay}</div>
          </div>
        </div>
        <div className="w-1/2 h-full bg-[#1C1919]/50 border border-[#2B2828] rounded-r-[7px] flex items-center justify-center">
          <span className="text-white text-lg font-medium">
            {IsLesson ? `Lekcja ${PeriodNumber}` : "Przerwa"}
          </span>
        </div>
      </div>
    </div>
  );
} 