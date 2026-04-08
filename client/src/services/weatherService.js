const GEOCODE_API = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_API = "https://api.open-meteo.com/v1/forecast";

const CODE_MAP = {
  0: { label: "Clear sky", mode: "clear" },
  1: { label: "Mainly clear", mode: "clear" },
  2: { label: "Partly cloudy", mode: "cloud" },
  3: { label: "Overcast", mode: "cloud" },
  45: { label: "Fog", mode: "fog" },
  48: { label: "Depositing rime fog", mode: "fog" },
  51: { label: "Light drizzle", mode: "rain" },
  53: { label: "Drizzle", mode: "rain" },
  55: { label: "Dense drizzle", mode: "rain" },
  56: { label: "Light freezing drizzle", mode: "rain" },
  57: { label: "Freezing drizzle", mode: "rain" },
  61: { label: "Slight rain", mode: "rain" },
  63: { label: "Rain", mode: "rain" },
  65: { label: "Heavy rain", mode: "rain" },
  66: { label: "Light freezing rain", mode: "rain" },
  67: { label: "Freezing rain", mode: "rain" },
  71: { label: "Slight snow fall", mode: "snow" },
  73: { label: "Snow fall", mode: "snow" },
  75: { label: "Heavy snow fall", mode: "snow" },
  77: { label: "Snow grains", mode: "snow" },
  80: { label: "Slight rain showers", mode: "rain" },
  81: { label: "Rain showers", mode: "rain" },
  82: { label: "Violent rain showers", mode: "storm" },
  85: { label: "Slight snow showers", mode: "snow" },
  86: { label: "Heavy snow showers", mode: "snow" },
  95: { label: "Thunderstorm", mode: "storm" },
  96: { label: "Thunderstorm with hail", mode: "storm" },
  99: { label: "Thunderstorm with heavy hail", mode: "storm" },
};

export const weatherService = {
  async searchCities(name, signal) {
    const query = String(name || "").trim();

    if (!query) {
      return [];
    }

    const params = new URLSearchParams({
      name: query,
      count: "6",
      language: "en",
      format: "json",
    });

    const response = await fetch(`${GEOCODE_API}?${params.toString()}`, { signal });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const payload = await response.json();
    const results = Array.isArray(payload?.results) ? payload.results : [];

    return results.map((item) => ({
      id: item.id,
      name: item.name,
      country: item.country,
      admin1: item.admin1,
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || "auto",
    }));
  },

  async getForecast(location, signal) {
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      timezone: location.timezone || "auto",
      current_weather: "true",
      daily: "weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset",
      hourly: "temperature_2m,relativehumidity_2m,windspeed_10m,surface_pressure,visibility,uv_index,weathercode",
    });

    const response = await fetch(`${FORECAST_API}?${params.toString()}`, { signal });

    if (!response.ok) {
      throw new Error(`Forecast failed: ${response.status}`);
    }

    const payload = await response.json();
    return normalizeForecast(payload, location);
  },

  getWeatherMeta(code) {
    return CODE_MAP[Number(code)] || { label: "Unknown", mode: "cloud" };
  },
};

function normalizeForecast(payload, location) {
  const nowCode = payload?.current_weather?.weathercode;
  const meta = weatherService.getWeatherMeta(nowCode);
  const daily = payload?.daily || {};

  const hourly = buildHourly(payload);
  const currentHourIndex = findNearestHourIndex(payload);

  return {
    location,
    current: {
      temperature: round(payload?.current_weather?.temperature),
      wind: round(payload?.current_weather?.windspeed),
      condition: meta.label,
      mode: meta.mode,
      code: nowCode,
      humidity: round(valueAt(payload?.hourly?.relativehumidity_2m, currentHourIndex)),
      pressure: round(valueAt(payload?.hourly?.surface_pressure, currentHourIndex)),
      visibility: toKm(valueAt(payload?.hourly?.visibility, currentHourIndex)),
      uv: round(valueAt(payload?.hourly?.uv_index, currentHourIndex), 1),
      sunrise: toClock(valueAt(daily.sunrise, 0), location.timezone),
      sunset: toClock(valueAt(daily.sunset, 0), location.timezone),
    },
    hourly,
    week: (daily.time || []).slice(0, 7).map((day, index) => {
      const dayMeta = weatherService.getWeatherMeta(valueAt(daily.weathercode, index));
      return {
        day: toWeekday(day, location.timezone),
        high: round(valueAt(daily.temperature_2m_max, index)),
        low: round(valueAt(daily.temperature_2m_min, index)),
        condition: dayMeta.label,
        mode: dayMeta.mode,
      };
    }),
  };
}

function buildHourly(payload) {
  const times = payload?.hourly?.time || [];
  const temps = payload?.hourly?.temperature_2m || [];
  const codes = payload?.hourly?.weathercode || [];
  const currentIndex = findNearestHourIndex(payload);
  const indices = [];

  for (let i = currentIndex; i < times.length && indices.length < 8; i += 3) {
    indices.push(i);
  }

  return indices.map((index) => ({
    time: toHour(times[index]),
    temp: round(valueAt(temps, index)),
    mode: weatherService.getWeatherMeta(valueAt(codes, index)).mode,
  }));
}

function findNearestHourIndex(payload) {
  const now = payload?.current_weather?.time;
  const times = payload?.hourly?.time || [];
  const index = times.indexOf(now);

  return index >= 0 ? index : 0;
}

function round(value, precision = 0) {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return 0;
  }

  const factor = 10 ** precision;
  return Math.round(num * factor) / factor;
}

function toClock(value, timezone) {
  if (!value) {
    return "--:--";
  }

  const date = new Date(value);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone || "UTC",
  });
}

function toHour(value) {
  if (!value) {
    return "--:--";
  }

  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, "0")}:00`;
}

function toWeekday(value, timezone) {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: timezone || "UTC",
  });
}

function valueAt(list, index) {
  if (!Array.isArray(list)) {
    return undefined;
  }

  return list[index];
}

function toKm(valueMeters) {
  const value = Number(valueMeters);
  if (Number.isNaN(value)) {
    return 0;
  }

  return round(value / 1000, 1);
}