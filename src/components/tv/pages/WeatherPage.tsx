'use client'

import { useEffect, useState } from "react"

type WeatherData = {
  Current: {
    Temperature: number
    Condition: string
    Icon: string
    FeelsLike: number
    Humidity: number
    WindSpeed: number
  }
  Forecast: Array<{
    Day: string
    High: number
    Low: number
    Condition: string
    Icon: string
  }>
}

export default function WeatherPage() {
  const [_WeatherData, SetWeatherData] = useState<WeatherData>({
    Current: {
      Temperature: 18,
      Condition: "Słonecznie",
      Icon: "sun",
      FeelsLike: 17,
      Humidity: 65,
      WindSpeed: 12
    },
    Forecast: [
      {
        Day: "Poniedziałek",
        High: 19,
        Low: 12,
        Condition: "Słonecznie",
        Icon: "sun"
      },
      {
        Day: "Wtorek",
        High: 17,
        Low: 11,
        Condition: "Pochmurno",
        Icon: "cloud"
      },
      {
        Day: "Środa",
        High: 15,
        Low: 9,
        Condition: "Deszczowo",
        Icon: "rain"
      },
      {
        Day: "Czwartek",
        High: 16,
        Low: 10,
        Condition: "Częściowe zachmurzenie",
        Icon: "cloud-sun"
      },
      {
        Day: "Piątek",
        High: 18,
        Low: 12,
        Condition: "Słonecznie",
        Icon: "sun"
      }
    ]
  })
  
  const [_CurrentTime, SetCurrentTime] = useState(new Date())
  const [_Loading, SetLoading] = useState(false)

  useEffect(() => {
    const _Timer = setInterval(() => {
      SetCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(_Timer)
  }, [])

  const _FormattedTime = _CurrentTime.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const _FormattedDate = _CurrentTime.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const GetWeatherIcon = (Icon: string) => {
    switch(Icon) {
      case "sun":
        return "☀️"
      case "cloud":
        return "☁️"
      case "rain":
        return "🌧️"
      case "cloud-sun":
        return "⛅"
      case "snow":
        return "❄️"
      case "storm":
        return "⚡"
      default:
        return "☀️"
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-white mb-4">Pogoda</h1>
      
      <div className="text-3xl text-white mb-2">{_FormattedDate}</div>
      <div className="text-4xl text-white mb-8">{_FormattedTime}</div>
      
      <div className="w-4/5 p-8 bg-[#151515]/80 backdrop-blur-md rounded-lg border border-[#2F2F2F] shadow-lg">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex-1 mb-8 md:mb-0">
            <h2 className="text-4xl font-bold text-white mb-4">Aktualna pogoda</h2>
            <div className="flex items-center">
              <span className="text-8xl mr-6">{GetWeatherIcon(_WeatherData.Current.Icon)}</span>
              <div>
                <div className="text-7xl font-bold text-white mb-2">{_WeatherData.Current.Temperature}°C</div>
                <div className="text-3xl text-white">{_WeatherData.Current.Condition}</div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-xl text-white">Odczuwalna: <span className="font-bold">{_WeatherData.Current.FeelsLike}°C</span></div>
              <div className="text-xl text-white">Wilgotność: <span className="font-bold">{_WeatherData.Current.Humidity}%</span></div>
              <div className="text-xl text-white">Wiatr: <span className="font-bold">{_WeatherData.Current.WindSpeed} km/h</span></div>
            </div>
          </div>
          
          <div className="h-full w-px bg-[#2F2F2F] mx-6 hidden md:block"></div>
          
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-6">Prognoza 5-dniowa</h2>
            <div className="grid grid-cols-1 gap-4">
              {_WeatherData.Forecast.map((Day, Index) => (
                <div key={Index} className="flex items-center justify-between p-3 border border-[#2F2F2F] rounded-lg">
                  <div className="w-32 text-xl font-bold text-white">{Day.Day}</div>
                  <div className="text-3xl">{GetWeatherIcon(Day.Icon)}</div>
                  <div className="text-lg text-white">{Day.Condition}</div>
                  <div className="text-xl text-white">
                    <span className="font-bold">{Day.High}°</span> / {Day.Low}°
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-white/60 mt-6">Ostatnia aktualizacja: 10:30</div>
    </div>
  )
} 