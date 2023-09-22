using System;

namespace zstio_tv.Helpers
{
    internal class ILesson
    {
        public static int CurrentLessonIndex = -1;
        public static string[] GetLessons()
        {
            // Fetch the current time each time the method is called
            DateTime CurrentTime = DateTime.Now;

            for (int i = 0; i < Config.LessonTimes.Length; i++)
            {
                string[] LessonTimeParts = Config.LessonTimes[i].Split('-');
                DateTime LessonStartTime = DateTime.Parse(LessonTimeParts[0].Trim());
                DateTime LessonEndTime = DateTime.Parse(LessonTimeParts[1].Trim());

                if (CurrentTime >= LessonStartTime && CurrentTime <= LessonEndTime)
                {
                    CurrentLessonIndex = i;
                    break;
                }
            }

            if (CurrentLessonIndex >= 0)
            {
                // Aktualnie trwa lekcja
                DateTime CurrentLessonEndTime = DateTime.Parse(Config.LessonTimes[CurrentLessonIndex].Split('-')[1].Trim());
                TimeSpan RemainingTime = CurrentLessonEndTime - CurrentTime;

                return new string[] { $"Czas do konca {CurrentLessonIndex + 1} lekcji: ", $"{RemainingTime.ToString(@"hh\:mm\:ss")}" };
            }
            else
            {
                // Aktualnie trwa przerwa - znajdz czas do najblizszej lekcji lub przerwy
                DateTime NextLessonStartTime = DateTime.MaxValue;
                for (int i = 0; i < Config.LessonTimes.Length; i++)
                {
                    string[] LessonTimeParts = Config.LessonTimes[i].Split('-');
                    DateTime LessonStartTime = DateTime.Parse(LessonTimeParts[0].Trim());

                    if (LessonStartTime > CurrentTime && LessonStartTime < NextLessonStartTime)
                    {
                        NextLessonStartTime = LessonStartTime;
                    }
                }

                TimeSpan TimeToNextLesson = NextLessonStartTime - CurrentTime;

                return new string[] { "Aktualnie nie ma lekcji.", $"{TimeToNextLesson.ToString(@"hh\:mm\:ss")}" };
            }
        }

    }
}
