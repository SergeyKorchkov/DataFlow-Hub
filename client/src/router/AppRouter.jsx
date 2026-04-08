import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { WeatherPage } from "../pages/WeatherPage";
import { CurrencyPage } from "../pages/CurrencyPage";
import { CryptoPage } from "../pages/CryptoPage";
import { SettingsPage } from "../pages/SettingsPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";

const MoviesPage = lazy(() => import("../pages/MoviesPage").then((module) => ({ default: module.MoviesPage })));

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/currency" element={<CurrencyPage />} />
          <Route
            path="/movies"
            element={(
              <Suspense
                fallback={(
                  <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-slate-300">
                    Loading movies experience...
                  </section>
                )}
              >
                <MoviesPage />
              </Suspense>
            )}
          />
          <Route path="/crypto" element={<CryptoPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
