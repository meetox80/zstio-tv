using System;

namespace zstio_tv.Helpers
{
    internal class IDateTime
    {
        public static string CalculateClock()
        {
            return DateTime.Now.ToString("HH:mm");
        }

        public static string CalculateReplacementsDate()
        {
            return $"Zastępstwa na dzień {DateTime.Now.ToString("dd.MM.yyyy")}";
        }

        public static string CalculateDate()
        {
            string Day = DateTime.Now.ToString("%d");
            string ProcessMonth = DateTime.Now.ToString("MM");
            string ProcessWeekDay = DateTime.Now.DayOfWeek.ToString();

            string WeekDay = "", Month = "";

            switch (ProcessWeekDay)
            {
                case "Monday":
                    WeekDay = "Poniedzialek";
                    break;
                case "Tuesday":
                    WeekDay = "Wtorek";
                    break;
                case "Wednesday":
                    WeekDay = "Środa";
                    break;
                case "Thursday":
                    WeekDay = "Czwartek";
                    break;
                case "Friday":
                    WeekDay = "Piątek";
                    break;
                case "Saturday":
                    WeekDay = "Sobota";
                    break;
                case "Sunday":
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
