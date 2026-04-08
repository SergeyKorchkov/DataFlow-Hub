import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const chartColors = ["#f59e0b", "#38bdf8", "#34d399", "#a78bfa", "#64748b"];

export function PortfolioAllocationChart({ labels, values }) {
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: chartColors,
        borderColor: "#0f172a",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#cbd5e1",
          padding: 16,
        },
      },
    },
    cutout: "64%",
  };

  return (
    <div className="min-w-0 h-[240px] rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:h-80">
      <h3 className="mb-4 text-sm font-semibold tracking-wide text-slate-200">Portfolio Allocation</h3>
      <Doughnut data={data} options={options} />
    </div>
  );
}
