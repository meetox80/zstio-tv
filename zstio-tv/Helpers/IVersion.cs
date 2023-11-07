using System.Diagnostics;
using System.Net.Http;
using System;

namespace zstio_tv.Helpers
{
    internal class IVersion
    {
        public static string GetVersion()
        {
            string ServerResponse = "";
            using (HttpClient Client = new HttpClient())
            {
                try
                {
                    ServerResponse = Client.GetStringAsync(Config.VersionAPI).Result;
                }
                catch (Exception ex)
                {
                    Debug.WriteLine(ex);
                }
            }

            return ServerResponse;
        }
    }
}
