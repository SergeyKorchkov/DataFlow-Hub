import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/weather", label: "Weather" },
  { to: "/currency", label: "Currency" },
  { to: "/movies", label: "Movies" },
  { to: "/crypto", label: "Crypto" },
  { to: "/settings", label: "Settings" },
];

export function Header() {
  const user = { email: "demo@infoportal.com" };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-base font-semibold tracking-wide sm:text-lg">InfoPortal Pro</h1>
          <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-cyan-200 sm:hidden">
            Live
          </span>
        </div>

        <div className="flex w-full flex-col gap-3 sm:items-end">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="max-w-[45vw] truncate text-xs text-slate-400 sm:max-w-none sm:text-sm">{user.email}</span>
            <span className="hidden rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-emerald-200 sm:inline-flex">
              Portfolio mode
            </span>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1 xl:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    isActive
                      ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100"
                      : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-cyan-300/40 hover:text-cyan-200",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
