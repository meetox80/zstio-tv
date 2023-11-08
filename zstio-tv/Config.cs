namespace zstio_tv
{
    internal class Config
    {
        #region Application
        public static string Version = "0.24";
        public static bool Developer = true;
        public static string[] ImageExtensions = { ".png", ".jpg", ".jpeg" };

        public static string Warning = "Przypominamy, że obowiązuje całkowity zakaz opuszczania terenu szkoły podczas zajęć i przerw międzylekcyjnych.";
        #endregion

        #region API's
        public static string VersionAPI = "https://raw.githubusercontent.com/lemonekq/zstio-tv/main/.version";
        public static string ReplacementsAPI = "https://zastepstwa.awfulworld.space/api/getSubstitutions";

        public static string SpotifyID = "859de286484544ad859832003ac4e6b4";
        public static string SpotifyAuth = "f10212b6f8d74b058f5685edfdc92704";

        public static string WeatherAuth = "50959cb1663e428b968170326232609";
        public static string WeatherCity = "Jaroslaw";
        #endregion

        #region Timing
        public static string[] LessonTimes = {
            "8:00 - 8:45",
            "8:50 - 9:35",
            "9:40 - 10:25",
            "10:40 - 11:25",
            "11:30 - 12:15",
            "12:20 - 13:05",
            "13:10 - 13:55",
            "14:00 - 14:45",
            "14:50 - 15:35",
            "15:40 - 16:25",
            "16:35 - 17:20",
            "17:25 - 18:10",
            "18:15 - 19:00",
        };

        public static string[] BreakTimes =
        {
            "8:45 - 8:50",
            "9:35 - 9:40",
            "10:25 - 10:40",
            "11:25 - 11:30",
            "12:15 - 12:20",
            "13:05 - 13:10",
            "13:55 - 14:00",
            "14:45 - 14:50",
            "15:35 - 15:40",
            "16:25 - 16:35",
            "17:20 - 17:25",
            "18:10 - 18:15",
            "19:00 - 00:00"
        };

        // Short lesson times
        public static string[] ShortLessonTimes =
        {
            "8:00 - 8:30",
            "8:35 - 9:05",
            "9:10 - 9:40",
            "9:45 - 10:15",
            "10:30 - 11:00",
            "11:05 - 11:35",
            "11:40 - 12:10",
            "12:15 - 12:45",
            "12:50 - 13:20",
            "13:25 - 13:55",
            "14:00 - 14:30",
            "14:35 - 15:05",
            "15:10 - 15:40"
        };

        public static string[] ShortBreakTimes =
        {
            "8:30 - 8:35",
            "9:05 - 9:10",
            "9:40 - 9:45",
            "10:15 - 10:30",
            "11:00 - 11:05",
            "11:35 - 11:40",
            "12:10 - 12:15",
            "12:45 - 12:50",
            "13:20 - 13:25",
            "13:55 - 14:00",
            "14:30 - 14:35",
            "15:05 - 15:10",
            "15:40 - 00:00"
        };
        #endregion
    }
}