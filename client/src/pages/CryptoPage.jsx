import { useEffect, useState } from "react";
import { MarketTrendChart } from "../components/crypto/MarketTrendChart";
import { PortfolioAllocationChart } from "../components/crypto/PortfolioAllocationChart";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { cryptoService } from "../services/cryptoService";

export function CryptoPage() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      const data = await cryptoService.getDashboard();
      setDashboard(data);
    }

    loadDashboard();
  }, []);

  if (!dashboard) {
    return <LoadingSkeleton variant="crypto" />;
  }

  const { summary, trend, allocation, movers } = dashboard;

  return (
    <div className="w-full min-w-0 space-y-6 overflow-hidden rounded-3xl border border-slate-800 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.2),_transparent_35%),radial-gradient(circle_at_10%_85%,_rgba(168,85,247,0.14),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_68%,_#111827_100%)] p-4 shadow-2xl sm:p-5 md:p-6 lg:p-8">
      <section className="rounded-[2rem] border border-cyan-300/25 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30 p-5 text-white shadow-[0_18px_50px_rgba(2,8,23,0.5)] sm:p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <p className="inline-flex rounded-full border border-cyan-300/35 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Crypto Control
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">Crypto Dashboard</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Live-ready market board with Chart.js, allocation mix, and movers tuned for desktop, iPad, and mobile.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 rounded-2xl border border-slate-700 bg-slate-950/45 p-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-4 lg:self-end">
            <MiniStat label="Market Cap" value={summary.marketCap} />
            <MiniStat label="24h Volume" value={summary.volume24h} />
            <MiniStat label="BTC Dom." value={summary.btcDominance} />
            <MiniStat label="Fear/Greed" value={`${summary.fearGreed}/100`} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <MarketTrendChart
            labels={trend.labels}
            btc={trend.btc}
            eth={trend.eth}
            ranges={trend.ranges}
            defaultRange={trend.defaultRange}
          />
        </div>
        <div className="min-w-0">
        <PortfolioAllocationChart labels={allocation.labels} values={allocation.values} />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold tracking-wide text-slate-200">Top Movers</h3>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Swipe horizontally on tablet/mobile</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[640px] text-sm sm:min-w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-400">
                <th className="px-3 py-2 font-medium">Asset</th>
                <th className="px-3 py-2 font-medium">Price</th>
                <th className="px-3 py-2 font-medium">24h</th>
                <th className="px-3 py-2 font-medium">Volume</th>
              </tr>
            </thead>
            <tbody>
              {movers.map((item) => {
                const isPositive = item.change24h.startsWith("+");

                return (
                  <tr key={item.symbol} className="border-b border-slate-800/70 text-slate-200">
                    <td className="px-3 py-3">
                      <div className="font-medium">{item.symbol}</div>
                      <div className="text-xs text-slate-400">{item.name}</div>
                    </td>
                    <td className="px-3 py-3">{item.price}</td>
                    <td className={`px-3 py-3 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                      {item.change24h}
                    </td>
                    <td className="px-3 py-3 text-slate-300">{item.volume}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-3">
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-100 sm:text-xl">{value}</p>
    </div>
  );
}
