/**
 * Weather API Utility
 * Uses OpenWeatherMap API (free tier: 1000 calls/day)
 * Falls back to mock data if API is not available
 */

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  description: string;
}

/**
 * Get weather data for a location
 * Note: Requires NEXT_PUBLIC_OPENWEATHER_API_KEY in .env
 */
export async function getWeatherData(
  lat: number,
  lng: number,
  apiKey?: string
): Promise<WeatherData | null> {
  if (!apiKey) {
    return getMockWeatherData();
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=imperial`
    );

    if (!response.ok) {
      return getMockWeatherData();
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      description: data.weather[0].description,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return getMockWeatherData();
  }
}

function getMockWeatherData(): WeatherData {
  const conditions = ['Clear', 'Clouds', 'Rain', 'Sunny'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    temperature: Math.floor(Math.random() * 30) + 60, // 60-90°F
    condition: randomCondition,
    icon: `https://openweathermap.org/img/wn/01d@2x.png`,
    humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
    windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 mph
    description: `${randomCondition.toLowerCase()} skies`,
  };
}

