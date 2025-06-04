import _LessonTimesData from "./LessonTimes.json";

export type TimeRange = {
  Start: string;
  End: string;
};

export type LessonTimesData = {
  StandardTimes: {
    LessonTimes: string[];
    BreakTimes: string[];
  };
  ShortTimes: {
    LessonTimes: string[];
    BreakTimes: string[];
  };
};

export type PeriodInfo = {
  IsLesson: boolean;
  PeriodNumber: number;
  RemainingTime: string;
  ProgressPercent: number;
  Start?: string;
  End?: string;
  NextPeriodStart?: string;
};

let _CurrentLessonDuration = 45;
let _Subscribers: Array<() => void> = [];

export const SubscribeToLessonDuration = (
  Callback: () => void,
): (() => void) => {
  _Subscribers.push(Callback);
  return () => {
    _Subscribers = _Subscribers.filter((Sub) => Sub !== Callback);
  };
};

const _NotifySubscribers = (): void => {
  _Subscribers.forEach((Callback) => Callback());
};

export const SetLessonDuration = async (Duration: 30 | 45): Promise<void> => {
  try {
    const Response = await fetch("/api/settings/lessontime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonTime: Duration }),
    });

    if (!Response.ok) {
      const ErrorData = await Response.json().catch(() => ({}));
      throw new Error(ErrorData.error || "Failed to save lesson time");
    }

    _CurrentLessonDuration = Duration;
    _NotifySubscribers();
  } catch (Error) {
    throw Error;
  }
};

export const GetCurrentLessonDuration = (): number => {
  return _CurrentLessonDuration;
};

export const InitializeLessonDuration = (Duration: number): void => {
  if (_CurrentLessonDuration !== Duration) {
    _CurrentLessonDuration = Duration;
    _NotifySubscribers();
  }
};

export const ParseTimeRange = (TimeString: string): TimeRange => {
  const [Start, End] = TimeString.split(" - ");
  return { Start, End };
};

export const GetLessonTimesData = (): LessonTimesData => {
  return _LessonTimesData as LessonTimesData;
};

export const GetStandardLessonTimes = (): string[] => {
  return _CurrentLessonDuration === 45
    ? _LessonTimesData.StandardTimes.LessonTimes
    : _LessonTimesData.ShortTimes.LessonTimes;
};

export const GetStandardBreakTimes = (): string[] => {
  return _CurrentLessonDuration === 45
    ? _LessonTimesData.StandardTimes.BreakTimes
    : _LessonTimesData.ShortTimes.BreakTimes;
};

export const GetShortLessonTimes = (): string[] => {
  return _LessonTimesData.ShortTimes.LessonTimes;
};

export const GetShortBreakTimes = (): string[] => {
  return _LessonTimesData.ShortTimes.BreakTimes;
};

export const FormatTimeDisplay = (RemainingSeconds: number): string => {
  const Minutes = Math.floor(RemainingSeconds / 60);
  const Seconds = Math.floor(RemainingSeconds % 60);
  return `${String(Minutes).padStart(2, "0")}:${String(Seconds).padStart(2, "0")}`;
};

export const GetCurrentPeriodInfo = (): PeriodInfo => {
  const Now = new Date();
  const CurrentHours = Now.getHours();
  const CurrentMinutes = Now.getMinutes();
  const CurrentSeconds = Now.getSeconds();
  const CurrentTimeInMinutes =
    CurrentHours * 60 + CurrentMinutes + CurrentSeconds / 60;

  const LessonTimes = GetStandardLessonTimes();
  const BreakTimes = GetStandardBreakTimes();

  for (let i = 0; i < LessonTimes.length; i++) {
    const LessonTime = ParseTimeRange(LessonTimes[i]);
    const [LessonStartHour, LessonStartMinute] =
      LessonTime.Start.split(":").map(Number);
    const [LessonEndHour, LessonEndMinute] =
      LessonTime.End.split(":").map(Number);

    const LessonStartInMinutes = LessonStartHour * 60 + LessonStartMinute;
    const LessonEndInMinutes = LessonEndHour * 60 + LessonEndMinute;

    if (
      CurrentTimeInMinutes >= LessonStartInMinutes &&
      CurrentTimeInMinutes < LessonEndInMinutes
    ) {
      const TotalLessonMinutes = LessonEndInMinutes - LessonStartInMinutes;
      const ElapsedMinutes = CurrentTimeInMinutes - LessonStartInMinutes;
      const ProgressPercent = (ElapsedMinutes / TotalLessonMinutes) * 100;
      const RemainingSeconds = (LessonEndInMinutes - CurrentTimeInMinutes) * 60;

      const NextPeriodStart =
        i < BreakTimes.length
          ? ParseTimeRange(BreakTimes[i]).Start
          : i + 1 < LessonTimes.length
            ? ParseTimeRange(LessonTimes[i + 1]).Start
            : undefined;

      return {
        IsLesson: true,
        PeriodNumber: i + 1,
        RemainingTime: FormatTimeDisplay(RemainingSeconds),
        ProgressPercent,
        Start: LessonTime.Start,
        End: LessonTime.End,
        NextPeriodStart,
      };
    }
  }

  for (let i = 0; i < BreakTimes.length; i++) {
    const BreakTime = ParseTimeRange(BreakTimes[i]);
    const [BreakStartHour, BreakStartMinute] =
      BreakTime.Start.split(":").map(Number);
    const [BreakEndHour, BreakEndMinute] = BreakTime.End.split(":").map(Number);

    const BreakStartInMinutes = BreakStartHour * 60 + BreakStartMinute;
    const BreakEndInMinutes = BreakEndHour * 60 + BreakEndMinute;

    if (
      CurrentTimeInMinutes >= BreakStartInMinutes &&
      CurrentTimeInMinutes < BreakEndInMinutes
    ) {
      const TotalBreakMinutes = BreakEndInMinutes - BreakStartInMinutes;
      const ElapsedMinutes = CurrentTimeInMinutes - BreakStartInMinutes;
      const ProgressPercent = (ElapsedMinutes / TotalBreakMinutes) * 100;
      const RemainingSeconds = (BreakEndInMinutes - CurrentTimeInMinutes) * 60;

      const NextPeriodStart =
        i + 1 < LessonTimes.length
          ? ParseTimeRange(LessonTimes[i + 1]).Start
          : undefined;

      return {
        IsLesson: false,
        PeriodNumber: i + 1,
        RemainingTime: FormatTimeDisplay(RemainingSeconds),
        ProgressPercent,
        Start: BreakTime.Start,
        End: BreakTime.End,
        NextPeriodStart,
      };
    }
  }

  return {
    IsLesson: false,
    PeriodNumber: 0,
    RemainingTime: "00:00",
    ProgressPercent: 0,
  };
};
