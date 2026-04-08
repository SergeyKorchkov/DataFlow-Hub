import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export function MarketTrendChart({ labels, btc, eth, ranges, defaultRange = "1Y" }) {
  const normalizedRanges = useMemo(() => {
    if (ranges && typeof ranges === "object" && Object.keys(ranges).length > 0) {
      return ranges;
    }

    return {
      "1W": {
        labels: labels ?? [],
        btc: btc ?? [],
        eth: eth ?? [],
      },
    };
  }, [ranges, labels, btc, eth]);

  const rangeKeys = Object.keys(normalizedRanges);
  const [range, setRange] = useState(() => (rangeKeys.includes(defaultRange) ? defaultRange : rangeKeys[0]));

  useEffect(() => {
    if (!rangeKeys.includes(range)) {
      setRange(rangeKeys[0]);
    }
  }, [rangeKeys, range]);

  const current = normalizedRanges[range] ?? { labels: [], btc: [], eth: [] };

  const btcFirst = current.btc[0] ?? 0;
  const btcLast = current.btc[current.btc.length - 1] ?? 0;
  const ethFirst = current.eth[0] ?? 0;
  const ethLast = current.eth[current.eth.length - 1] ?? 0;

  const btcChange = btcFirst ? ((btcLast - btcFirst) / btcFirst) * 100 : 0;
  const ethChange = ethFirst ? ((ethLast - ethFirst) / ethFirst) * 100 : 0;

  const data = {
    labels: current.labels,
    datasets: [
      {
        label: "BTC",
        data: current.btc,
        borderColor: "#f59e0b",
        segment: {
          borderColor: (ctx) => (ctx.p1.parsed.y >= ctx.p0.parsed.y ? "#22c55e" : "#ef4444"),
        },
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return "rgba(245, 158, 11, 0.22)";
          }

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(245, 158, 11, 0.35)");
          gradient.addColorStop(1, "rgba(245, 158, 11, 0.02)");
          return gradient;
        },
        fill: true,
        tension: 0.12,
        borderWidth: 2.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
        pointHoverBackgroundColor: "#0f172a",
        pointHoverBorderColor: "#22c55e",
      },
      {
        label: "ETH",
        data: current.eth,
        borderColor: "#38bdf8",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return "rgba(56, 189, 248, 0.2)";
          }

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(56, 189, 248, 0.3)");
          gradient.addColorStop(1, "rgba(56, 189, 248, 0.02)");
          return gradient;
        },
        fill: true,
        tension: 0.12,
        borderWidth: 2.1,
        borderDash: [6, 5],
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
        pointHoverBackgroundColor: "#0f172a",
        pointHoverBorderColor: "#7dd3fc",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
      axis: "x",
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#dbeafe",
          usePointStyle: true,
          pointStyle: "line",
          boxWidth: 22,
        },
      },
      tooltip: {
        backgroundColor: "rgba(2, 6, 23, 0.92)",
        borderColor: "rgba(56, 189, 248, 0.35)",
        borderWidth: 1,
        titleColor: "#e2e8f0",
        bodyColor: "#e2e8f0",
        displayColors: true,
        padding: 10,
        callbacks: {
          title(context) {
            return `Session: ${context[0]?.label ?? ""}`;
          },
          label(context) {
            const value = Number(context.raw ?? 0);
            return `${context.dataset.label}: $${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#94a3b8",
          maxTicksLimit: 12,
        },
        grid: {
          color: "rgba(148, 163, 184, 0.08)",
          drawBorder: false,
        },
      },
      y: {
        ticks: {
          color: "#94a3b8",
          callback(value) {
            const numeric = Number(value);

            if (numeric >= 1000) {
              return `$${(numeric / 1000).toFixed(1)}k`;
            }

            return `$${numeric}`;
          },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.12)",
          drawBorder: false,
        },
      },
    },
  };

  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-slate-100">Market Trend</h3>
          <p className="mt-1 text-xs text-slate-400">{current.labels.length} points in {range} view</p>
        </div>

        <div className="flex max-w-full flex-wrap gap-1 rounded-lg border border-slate-700 bg-slate-800/80 p-1">
          {rangeKeys.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRange(item)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                range === item ? "bg-cyan-400 text-slate-950" : "text-slate-300 hover:text-cyan-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <p className="text-xs text-amber-200">BTC</p>
          <p className="mt-1 text-lg font-semibold text-amber-100">${btcLast.toLocaleString()}</p>
          <p className={`text-xs ${btcChange >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {btcChange >= 0 ? "+" : ""}
            {btcChange.toFixed(2)}% ({range})
          </p>
        </div>

        <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-3">
          <p className="text-xs text-sky-200">ETH</p>
          <p className="mt-1 text-lg font-semibold text-sky-100">${ethLast.toLocaleString()}</p>
          <p className={`text-xs ${ethChange >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {ethChange >= 0 ? "+" : ""}
            {ethChange.toFixed(2)}% ({range})
          </p>
        </div>
      </div>

      <div className="h-[220px] sm:h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
