using System.Windows;

namespace zstio_tv
{
    internal class LocalMemory
    {
        public static string DateAPIResponse = "";
        public static string ReplacementsAPIResponse = "";
        public static string WeatherAPIResponse = "";

        public static string SpotifyToken = "";
        public static string SpotifyRefreshToken = "";

        public static bool SongPlaying = false, SongPlayingBackup = true;
    }
}
