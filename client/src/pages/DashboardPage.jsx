import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { cryptoService } from "../services/cryptoService";
import { currencyService } from "../services/currencyService";
import { moviesService } from "../services/moviesService";

export function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setIsLoading(true);
      setError("");

      try {
        const [crypto, currency, movies] = await Promise.all([
          cryptoService.getDashboard(),
          currencyService.getRates(controller.signal),
          moviesService.getPopularMovies({ page: 1, signal: controller.signal }),
        ]);

        setSnapshot({ crypto, currency, movies });
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError("Live dashboard is temporarily unavailable.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => controller.abort();
  }, []);

  const weatherSnapshot = {
    city: "San Francisco",
    temperature: "24°",
    condition: "Clear with ocean breeze",
    humidity: "65%",
    wind: "12 km/h",
  };
  const latestMovie = snapshot?.movies?.results?.[0] || null;
  const topMovers = useMemo(() => snapshot?.crypto?.movers?.slice(0, 3) || [], [snapshot]);
  const fxPairs = useMemo(() => {
    if (!snapshot?.currency?.rates) {
      return [];
    }

    const rates = snapshot.currency.rates;
    const base = snapshot.currency.base || "USD";
    const pool = ["EUR", "GBP", "JPY", "CAD", "AUD", "CHF"];

    return pool
      .filter((code) => rates[code])
      .slice(0, 4)
      .map((code) => ({
        code,
        value: currencyService.convert(1, base, code, rates),
      }));
  }, [snapshot]);

  const stats = [
    {
      label: "Market Cap",
      value: snapshot?.crypto?.summary?.marketCap || "$0",
      hint: snapshot?.crypto?.summary?.marketCapChange24h || "0%",
    },
    {
      label: "24h Volume",
      value: snapshot?.crypto?.summary?.volume24h || "$0",
      hint: snapshot?.crypto?.summary?.volumeChange24h || "0%",
    },
    {
      label: "BTC Dominance",
      value: snapshot?.crypto?.summary?.btcDominance || "0%",
      hint: `Fear/Greed ${snapshot?.crypto?.summary?.fearGreed ?? 0}`,
    },
    {
      label: "Forecast Horizon",
      value: "7 Days",
      hint: "Live Weather Module",
    },
  ];

  return (
    <div className="space-y-6 rounded-3xl border border-slate-800 bg-[radial-gradient(circle_at_8%_15%,_rgba(56,189,248,0.2),_transparent_30%),radial-gradient(circle_at_95%_18%,_rgba(251,113,133,0.17),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_70%,_#111827_100%)] p-5 md:p-8 shadow-2xl">
      {isLoading ? <LoadingSkeleton variant="dashboard" /> : null}
      <section className="overflow-hidden rounded-[2rem] border border-cyan-400/25 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30 p-7 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="inline-flex rounded-full border border-cyan-300/35 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Control Room
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-6xl">
              InfoPortal Dashboard
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              One-screen briefing with market pulse, top headlines, currencies, and entertainment trends. Built for a portfolio-grade first impression.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <DashboardLink to="/crypto" label="Open Crypto" />
              <DashboardLink to="/weather" label="Open Weather" />
              <DashboardLink to="/currency" label="Open Currency" />
              <DashboardLink to="/movies" label="Open Movies" />
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-700 bg-slate-950/45 p-4">
            <MiniStatus label="System" value={isLoading ? "Syncing" : "Live"} />
            <MiniStatus label="Region" value="US" />
            <MiniStatus label="Source" value="Portfolio Live APIs" />
            <MiniStatus label="Updated" value={new Date().toLocaleTimeString()} />
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-200">{error}</section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <article key={item.label} className="rounded-2xl border border-slate-700 bg-slate-900/65 p-4 shadow-lg">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-100">{item.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-cyan-200">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <article className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/70">
          <div className="relative h-60 overflow-hidden bg-slate-950">
            <div className="h-full w-full bg-[linear-gradient(120deg,_rgba(3,105,161,0.9),_rgba(2,6,23,0.9)),radial-gradient(circle_at_20%_20%,_rgba(125,211,252,0.35),_transparent_25%),radial-gradient(circle_at_82%_70%,_rgba(251,191,36,0.28),_transparent_28%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">Weather Spotlight</p>
              <h2 className="mt-2 line-clamp-2 text-2xl font-extrabold text-white">{weatherSnapshot.city} {weatherSnapshot.temperature}</h2>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Conditions</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {weatherSnapshot.condition}. Humidity {weatherSnapshot.humidity}, wind {weatherSnapshot.wind}. Open the weather module for the full 7-day city board.
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Market Pulse</p>
              <div className="mt-3 space-y-2">
                {topMovers.length > 0 ? (
                  topMovers.map((mover) => (
                    <div key={mover.symbol} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                      <span className="text-sm font-semibold text-slate-200">{mover.symbol}</span>
                      <span className="text-sm text-slate-300">{mover.price}</span>
                      <span className={`text-xs font-semibold ${String(mover.change24h).startsWith("-") ? "text-rose-300" : "text-emerald-300"}`}>
                        {mover.change24h}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Syncing market movers...</p>
                )}
              </div>
            </div>
          </div>
        </article>

        <div className="grid gap-4">
          <article className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">FX Snapshot</h3>
            <div className="mt-3 grid gap-2">
              {fxPairs.length > 0 ? (
                fxPairs.map((pair) => (
                  <div key={pair.code} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2">
                    <span className="text-sm text-slate-300">USD/{pair.code}</span>
                    <span className="text-sm font-semibold text-slate-100">{currencyService.formatRate(pair.value)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Currency rates syncing...</p>
              )}
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70">
            <div className="h-40 bg-slate-950">
              {latestMovie?.backdrop_path ? (
                <img
                  src={moviesService.getBackdropUrl(latestMovie.backdrop_path)}
                  alt={latestMovie.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(130deg,_rgba(30,41,59,0.95),_rgba(88,28,135,0.6))]" />
              )}
            </div>
            <div className="p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-200">Trending Movie</p>
              <p className="mt-2 text-lg font-bold text-slate-100">{latestMovie?.title || "Loading movie chart..."}</p>
              <p className="mt-1 text-sm text-slate-300">{latestMovie?.release_date ? `Release: ${latestMovie.release_date}` : "TMDB live signal"}</p>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function DashboardLink({ to, label }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center rounded-full border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-300/20"
    >
      {label}
    </Link>
  );
}

function MiniStatus({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2">
      <span className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">{value}</span>
    </div>
  );
}
