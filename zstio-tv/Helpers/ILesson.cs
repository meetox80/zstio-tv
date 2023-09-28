using System;

namespace zstio_tv.Helpers
{
    internal class ILesson
    {
        public static int CurrentLessonIndex = -1;
        public static string[] GetLessons()
        {
            DateTime CurrentTime = DateTime.Now;

            for (int i = 0; i < Config.LessonTimes.Length; i++)
            {
                string[] LessonTimeParts = Config.LessonTimes[i].Split('-');
                DateTime LessonStartTime = DateTime.Parse(LessonTimeParts[0].Trim());
                DateTime LessonEndTime = DateTime.Parse(LessonTimeParts[1].Trim());

                if (CurrentTime >= LessonStartTime && CurrentTime <= LessonEndTime)
                {
                    CurrentLessonIndex = i;
                    TimeSpan RemainingTime = LessonEndTime - CurrentTime;
                    return new string[] { $"Czas do końca {CurrentLessonIndex + 1} lekcji: ", $"{RemainingTime.ToString(@"hh\:mm\:ss")}" };
                }
            }

            DateTime NextLessonOrBreakStartTime = DateTime.MaxValue;
            for (int i = 0; i < Config.BreakTimes.Length; i++)
            {
                string[] BreakTimeParts = Config.BreakTimes[i].Split('-');
                DateTime BreakStartTime = DateTime.Parse(BreakTimeParts[0].Trim());

                if (BreakStartTime > CurrentTime && BreakStartTime < NextLessonOrBreakStartTime)
                {
                    NextLessonOrBreakStartTime = BreakStartTime;
                }
            }

            for (int i = 0; i < Config.LessonTimes.Length; i++)
            {
                string[] LessonTimeParts = Config.LessonTimes[i].Split('-');
                DateTime LessonStartTime = DateTime.Parse(LessonTimeParts[0].Trim());

                if (LessonStartTime > CurrentTime && LessonStartTime < NextLessonOrBreakStartTime)
                {
                    NextLessonOrBreakStartTime = LessonStartTime;
                }
            }

            if (NextLessonOrBreakStartTime == DateTime.MaxValue)
            {
                return new string[] { "Brak lekcji na dziś", "" };
            }

            TimeSpan TimeToNextLessonOrBreak = NextLessonOrBreakStartTime - CurrentTime;

            if (TimeToNextLessonOrBreak.TotalMinutes <= 0)
            {
                return new string[] { "Przerwa", "00:00:00" };
            }

            return new string[] { "Przerwa", $"{TimeToNextLessonOrBreak.ToString(@"hh\:mm\:ss")}" };
        }
    }
}
