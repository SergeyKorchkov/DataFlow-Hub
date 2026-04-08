import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/weather", label: "Weather" },
  { to: "/currency", label: "Currency" },
  { to: "/movies", label: "Movies" },
  { to: "/crypto", label: "Crypto" },
  { to: "/settings", label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 border-r border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl xl:block">
      <div className="mb-8 rounded-2xl border border-slate-700 bg-slate-950/55 px-4 py-4">
        <div className="text-lg font-bold tracking-wide text-slate-100">InfoPortal Pro</div>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-200">Control center</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "block rounded-xl px-3 py-2.5 text-sm transition",
                isActive
                  ? "bg-cyan-300 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.18)]"
                  : "border border-transparent text-slate-300 hover:border-cyan-300/30 hover:bg-slate-800/70 hover:text-white",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
