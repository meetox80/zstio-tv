"use client";

import { useState, useEffect } from "react";
import { WeatherData, FetchWeatherData } from "@/lib/data/Weather/Weather";

const PolishDays = [
  "Niedziela",
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
];

const PolishMonths = [
  "stycznia",
  "lutego",
  "marca",
  "kwietnia",
  "maja",
  "czerwca",
  "lipca",
  "sierpnia",
  "września",
  "października",
  "listopada",
  "grudnia",
];

export default function TimeDisplay() {
  const [CurrentTime, SetCurrentTime] = useState<Date>(new Date());
  const [WeatherData, SetWeatherData] = useState<WeatherData>({
    Temperature: null,
    LastUpdated: new Date(),
  });
  const [IsMounted, SetIsMounted] = useState(false);

  const UpdateWeatherData = async () => {
    const Data = await FetchWeatherData();
    SetWeatherData(Data);
  };

  useEffect(() => {
    SetIsMounted(true);
    SetCurrentTime(new Date());

    const _TimeInterval = setInterval(() => {
      SetCurrentTime(new Date());
    }, 1000);

    UpdateWeatherData();

    const _WeatherInterval = setInterval(
      () => {
        UpdateWeatherData();
      },
      30 * 60 * 1000,
    );

    return () => {
      clearInterval(_TimeInterval);
      clearInterval(_WeatherInterval);
    };
  }, []);

  const FormatTime = (Time: Date): string => {
    const Hours = Time.getHours().toString().padStart(2, "0");
    const Minutes = Time.getMinutes().toString().padStart(2, "0");
    return `${Hours}:${Minutes}`;
  };

  const FormatDate = (Time: Date): string => {
    const DayName = PolishDays[Time.getDay()];
    const Day = Time.getDate();
    const Month = PolishMonths[Time.getMonth()];

    return `${DayName}, ${Day} ${Month}`;
  };

  if (!IsMounted) {
    return (
      <>
        <span className="text-[72px] font-bold text-white leading-none">
          --:--
        </span>
        <span className="text-[24px] text-gray-300 mt-1 ml-1">...</span>
      </>
    );
  }

  return (
    <>
      <span className="text-[72px] font-bold text-white leading-none">
        {FormatTime(CurrentTime)}
      </span>
      <span className="text-[24px] text-gray-300 mt-1 ml-1">
        {WeatherData.Temperature !== null ? (
          <>
            <span className="temperature">
              {Math.round(WeatherData.Temperature)}°C
            </span>
            <span className="mx-2">•</span>
          </>
        ) : null}
        {FormatDate(CurrentTime)}
      </span>
    </>
  );
}
