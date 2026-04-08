import { useEffect, useMemo, useState } from "react";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { weatherService } from "../services/weatherService";

export function WeatherPage() {
  const [query, setQuery] = useState("Kyiv");
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function bootstrap() {
      try {
        const cities = await weatherService.searchCities("Kyiv", controller.signal);
        const first = cities[0];

        if (!first) {
          throw new Error("City not found");
        }

        setLocationOptions(cities);
        setSelectedLocation(first);

        const weather = await weatherService.getForecast(first, controller.signal);
        setForecast(weather);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError("Failed to load weather data.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    bootstrap();

    return () => controller.abort();
  }, []);

  const mode = forecast?.current?.mode || "cloud";
  const current = forecast?.current;
  const maxHourly = Math.max(...(forecast?.hourly?.map((item) => item.temp) || [1]));

  async function handleSearch(event) {
    event.preventDefault();

    const controller = new AbortController();

    try {
      setIsSearching(true);
      setError("");

      const cities = await weatherService.searchCities(query, controller.signal);

      if (cities.length === 0) {
        setError("City not found. Try another name.");
        setLocationOptions([]);
        return;
      }

      setLocationOptions(cities);
      await selectLocation(cities[0], controller.signal);
    } catch (searchError) {
      setError("Failed to find the city right now.");
    } finally {
      setIsSearching(false);
    }
  }

  async function selectLocation(location, signal) {
    setIsLoading(true);
    setSelectedLocation(location);

    try {
      const weather = await weatherService.getForecast(location, signal);
      setForecast(weather);
    } catch (loadError) {
      setError("Failed to load weather forecast.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-800 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.25),_transparent_35%),radial-gradient(circle_at_10%_85%,_rgba(14,165,233,0.2),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_68%,_#111827_100%)] p-6 md:p-8 shadow-2xl">
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan-300/25 bg-gradient-to-br from-sky-900/70 via-blue-900/70 to-slate-950/85 p-8 text-white shadow-[0_20px_55px_rgba(2,6,23,0.55)]">
        <WeatherAnimation mode={mode} />
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-cyan-200/40 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
              Atmosphere Board
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">Weather Center</h1>
            <p className="mt-3 text-sm leading-7 text-slate-200 md:text-base">
              Search any city and get live data from Open-Meteo with animated weather states, hourly trend, and 7-day forecast.
            </p>

            <form onSubmit={handleSearch} className="mt-4 flex flex-wrap gap-2">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Enter city, e.g. Kyiv"
                className="w-full min-w-[220px] flex-1 rounded-xl border border-slate-500 bg-slate-950/55 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="rounded-xl border border-cyan-300/45 bg-cyan-300/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-100 transition hover:bg-cyan-300/25 disabled:opacity-60"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-600 bg-slate-950/45 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-300">
              Now in {selectedLocation ? formatLocation(selectedLocation) : "--"}
            </p>
            <p className="mt-1 text-4xl font-extrabold text-cyan-100">{current ? `${current.temperature}°` : "--"}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-cyan-200">{current?.condition || "Syncing"}</p>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">{error}</section>
      ) : null}

      {isLoading ? <LoadingSkeleton variant="weather" /> : null}

      <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
        <p className="mb-3 text-xs uppercase tracking-[0.16em] text-slate-400">Search Results</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {locationOptions.length === 0 ? (
            <p className="text-sm text-slate-400">Search a city to see location options.</p>
          ) : locationOptions.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => selectLocation(city)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                selectedLocation?.id === city.id
                  ? "bg-cyan-300 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.35)]"
                  : "border border-slate-700 bg-slate-950/50 text-slate-300 hover:border-cyan-300/50 hover:text-cyan-200"
              }`}
            >
              {formatLocation(city)}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-3xl border border-slate-700 bg-slate-900/65 p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">Current Conditions</p>
              <p className="mt-2 text-5xl font-extrabold text-slate-100 md:text-6xl">{current ? `${current.temperature}°` : "--"}</p>
              <p className="mt-1 text-sm uppercase tracking-[0.14em] text-slate-300">{current?.condition || "Syncing"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Sunrise / Sunset</p>
              <p className="mt-1 text-sm font-semibold text-cyan-200">{current?.sunrise || "--:--"} / {current?.sunset || "--:--"}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Humidity" value={`${current?.humidity ?? 0}%`} />
            <MetricCard label="Wind" value={`${current?.wind ?? 0} km/h`} />
            <MetricCard label="Visibility" value={`${current?.visibility ?? 0} km`} />
            <MetricCard label="UV Index" value={String(current?.uv ?? 0)} />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Hourly Temperature</p>
            <div className="mt-4 flex items-end justify-between gap-2">
              {(forecast?.hourly || []).map((item, idx) => (
                <div key={`${selectedLocation?.id || "city"}-${idx}`} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500 via-sky-400 to-blue-300"
                    style={{ height: `${Math.max(24, Math.round(((item.temp || 0) / maxHourly) * 120))}px` }}
                  />
                  <p className="text-[0.62rem] uppercase tracking-[0.15em] text-slate-400">{item.time}</p>
                  <p className="text-xs font-semibold text-cyan-200">{item.temp}°</p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <aside className="rounded-3xl border border-slate-700 bg-slate-900/65 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">Air & Pressure</p>
          <div className="mt-4 space-y-3">
            <StatRow label="Pressure" value={`${current?.pressure ?? 0} hPa`} />
            <StatRow label="Humidity" value={`${current?.humidity ?? 0}%`} />
            <StatRow label="Wind" value={`${current?.wind ?? 0} km/h`} />
            <StatRow label="Visibility" value={`${current?.visibility ?? 0} km`} />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/50 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Comfort Index</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-300">{calculateComfort(current)} / 100</p>
            <p className="mt-1 text-sm text-slate-300">Balanced conditions for outdoor activities.</p>
          </div>
        </aside>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-100">7-Day Forecast</h2>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{selectedLocation ? formatLocation(selectedLocation) : "--"}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
          {(forecast?.week || []).map((day) => (
            <article key={`${selectedLocation?.id || "city"}-${day.day}`} className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/45">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{day.day}</p>
              <p className="mt-2 text-lg font-bold text-slate-100">{day.high}°</p>
              <p className="text-sm text-slate-400">Low {day.low}°</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-200">{day.condition}</p>
            </article>
          ))}
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300">Updating weather feed...</section>
      ) : null}
    </div>
  );
}

function WeatherAnimation({ mode }) {
  if (mode === "rain" || mode === "storm") {
    return (
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 16 }).map((_, index) => (
          <span
            key={`rain-${index}`}
            className="weather-rain absolute top-0 h-14 w-[2px] rounded-full bg-cyan-100/65"
            style={{
              left: `${index * 6 + 2}%`,
              animationDelay: `${(index % 6) * 0.24}s`,
              animationDuration: `${1.1 + (index % 3) * 0.3}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (mode === "snow") {
    return (
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 14 }).map((_, index) => (
          <span
            key={`snow-${index}`}
            className="weather-snow absolute top-0 h-2 w-2 rounded-full bg-white/80"
            style={{
              left: `${index * 7 + 3}%`,
              animationDelay: `${(index % 7) * 0.28}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (mode === "fog") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="weather-fog absolute left-0 right-0 top-1/3 h-10 bg-slate-200/15 blur-md" />
        <span className="weather-fog absolute left-0 right-0 top-1/2 h-12 bg-slate-100/10 blur-md" style={{ animationDelay: "1.3s" }} />
      </div>
    );
  }

  if (mode === "clear") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="weather-glow absolute -right-6 -top-6 h-28 w-28 rounded-full bg-yellow-300/45 blur-2xl" />
        <span className="weather-glow absolute right-20 top-8 h-10 w-10 rounded-full bg-amber-200/65 blur-lg" style={{ animationDelay: "0.8s" }} />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="weather-cloud absolute left-6 top-8 h-10 w-28 rounded-full bg-slate-200/18 blur-sm" />
      <span className="weather-cloud absolute right-12 top-16 h-12 w-32 rounded-full bg-slate-100/12 blur-sm" style={{ animationDelay: "1.1s" }} />
    </div>
  );
}

function formatLocation(location) {
  const adminPart = location.admin1 ? `${location.admin1}, ` : "";
  return `${location.name}, ${adminPart}${location.country}`;
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-100">{value}</p>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/45 px-3 py-2">
      <span className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-200">{value}</span>
    </div>
  );
}

function calculateComfort(weather) {
  const snapshot = weather || { humidity: 55, wind: 10, uv: 5 };
  const humidityPenalty = Math.abs(55 - snapshot.humidity) * 0.6;
  const windPenalty = Math.abs(10 - snapshot.wind) * 0.7;
  const uvPenalty = snapshot.uv > 7 ? (snapshot.uv - 7) * 2 : 0;
  const raw = 100 - humidityPenalty - windPenalty - uvPenalty;

  return Math.max(48, Math.min(98, Math.round(raw)));
}
