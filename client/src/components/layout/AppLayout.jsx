import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppLayout() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-[1600px] min-w-0">
        <Sidebar />
        <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 w-full min-w-0 p-3 sm:p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
