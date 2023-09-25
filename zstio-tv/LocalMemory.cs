using System.Windows;

namespace zstio_tv
{
    internal class LocalMemory
    {
        public static int[] Display = { (int)SystemParameters.PrimaryScreenHeight, (int)SystemParameters.PrimaryScreenWidth };

        public static string DateAPIResponse = "";
        public static string ReplacementsAPIResponse = "";
        public static string SpotifyToken = "";
        public static string SpotifyRefreshToken;

        public static bool SongPlaying = false, SongPlayingBackup = true;
    }
}
