export type WeatherData = {
  Temperature: number | null
  LastUpdated: Date
};

export const FetchWeatherData = async (): Promise<WeatherData> => {
  try {
    const Response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=50.04&longitude=22.62&hourly=temperature_2m&forecast_days=1'
    )
    const Data = await Response.json()
    
    const CurrentHour = new Date().getHours()
    const Temperature = Data.hourly.temperature_2m[CurrentHour]
    
    return {
      Temperature,
      LastUpdated: new Date()
    }
  } catch (Error) {
    console.error('Failed to fetch weather data:', Error)
    return {
      Temperature: null,
      LastUpdated: new Date()
    }
  }
};