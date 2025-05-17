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

export const ParseTimeRange = (timeString: string): TimeRange => {
  const [Start, End] = timeString.split(" - ");
  return { Start, End };
};

export const GetLessonTimesData = (): LessonTimesData => {
  return _LessonTimesData as LessonTimesData;
};

export const GetStandardLessonTimes = (): string[] => {
  return _LessonTimesData.StandardTimes.LessonTimes;
};

export const GetStandardBreakTimes = (): string[] => {
  return _LessonTimesData.StandardTimes.BreakTimes;
};

export const GetShortLessonTimes = (): string[] => {
  return _LessonTimesData.ShortTimes.LessonTimes;
};

export const GetShortBreakTimes = (): string[] => {
  return _LessonTimesData.ShortTimes.BreakTimes;
}; 