using Newtonsoft.Json;
using System;
using System.Diagnostics;
using System.Globalization;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Windows;

namespace zstio_tv.Helpers
{
    internal class IDateTime
    {
        public static dynamic ProcessDynamic() { return JsonConvert.DeserializeObject(LocalMemory.DateAPIResponse); }

        public static void ReloadDateAPI()
        {
            using (HttpClient Client = new HttpClient())
            {
                try
                {
                    LocalMemory.DateAPIResponse = Client.GetStringAsync(Config.TimeAPI).Result;
                } catch (Exception ex)
                {
                    Debug.WriteLine(ex);
                }
            }
        }

        public static string CalculateClock()
        {
            dynamic Data = ProcessDynamic();
            string DateResult = Data.datetime;

            Match RegexMatch = Regex.Match(DateResult, @"\b(\d{2}:\d{2})\b");
            if (RegexMatch.Success)
                return RegexMatch.Groups[1].Value;
            return "--:--";
        }

        public static string CalculateDate()
        {
            dynamic Data = ProcessDynamic();
            string DateResult = Data.datetime;

            // Debug - i had many problems with parsing :/ Console.WriteLine(DateResult);
            string Day = DateResult.Split('/')[1].Split('/')[0];
            string ProcessMonth = DateResult.Split('/')[0];
            string ProcessWeekDay = Data.day_of_week;

            string WeekDay = "", Month = "";

            switch (ProcessWeekDay)
            {
                case "1":
                    WeekDay = "Poniedzialek";
                    break;
                case "2":
                    WeekDay = "Wtorek";
                    break;
                case "3":
                    WeekDay = "Środa";
                    break;
                case "4":
                    WeekDay = "Czwartek";
                    break;
                case "5":
                    WeekDay = "Piątek";
                    break;
                case "6":
                    WeekDay = "Sobota";
                    break;
                case "7":
                    WeekDay = "Niedziela";
                    break;
            }
            switch (ProcessMonth)
            {
                case "01":
                    Month = "Stycznia";
                    break;
                case "02":
                    Month = "Lutego";
                    break;
                case "03":
                    Month = "Marca";
                    break;
                case "04":
                    Month = "Kwietnia";
                    break;
                case "05":
                    Month = "Maja";
                    break;
                case "06":
                    Month = "Czerwca";
                    break;
                case "07":
                    Month = "Lipca";
                    break;
                case "08":
                    Month = "Sierpnia";
                    break;
                case "09":
                    Month = "Września";
                    break;
                case "10":
                    Month = "Października";
                    break;
                case "11":
                    Month = "Listopada";
                    break;
                case "12":
                    Month = "Grudnia";
                    break;
            }

            return $"{Day} {Month} - {WeekDay}";
        }
    }
}
