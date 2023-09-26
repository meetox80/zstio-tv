namespace zstio_tv
{
    internal class Config
    {
        public static bool Developer = false;
        public static string TimeAPI = "http://worldtimeapi.org/api/timezone/Europe/Warsaw";
        public static string ReplacementsAPI = "https://zastepstwa-zstio.netlify.app/api/getSubstitutions";

        public static string SpotifyID = "859de286484544ad859832003ac4e6b4";
        public static string SpotifyAuth = "f10212b6f8d74b058f5685edfdc92704";

        public static string WeatherAuth = "50959cb1663e428b968170326232609";
        public static string WeatherCity = "Jaroslaw";

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

        public static string Warning = "Przypominamy, że obowiązuje całkowity zakaz opuszczania terenu szkoły podczas zajęć i przerw międzylekcyjnych.";
    }
}
