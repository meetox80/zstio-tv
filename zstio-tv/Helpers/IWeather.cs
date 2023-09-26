using System.Diagnostics;
using System.Net.Http;
using System;

namespace zstio_tv.Helpers
{
    internal class IWeather
    {
        public static string GetWeatherData()
        {
            string ServerResponse = "";
            using (HttpClient Client = new HttpClient())
            {
                try
                {
                    ServerResponse = Client.GetStringAsync($"http://api.weatherapi.com/v1/current.json?key={Config.WeatherAuth}&q={Config.WeatherCity}&aqi=no").Result;
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
