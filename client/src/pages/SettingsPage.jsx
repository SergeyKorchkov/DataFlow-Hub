import { useState } from "react";

export function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: "dark",
    language: "en",
    notifications: true,
    emailUpdates: false,
    twoFactor: true,
  });

  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const exchangeRates = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5 };
  const currencySymbols = { USD: "$", EUR: "EUR", GBP: "GBP", JPY: "JPY" };
  const testAmount = 100;
  const convertedAmount = (testAmount * exchangeRates[selectedCurrency]).toFixed(2);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-800 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.2),_transparent_35%),radial-gradient(circle_at_10%_85%,_rgba(251,191,36,0.14),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_70%,_#111827_100%)] p-6 md:p-8 shadow-2xl">
      <div className="rounded-[2rem] border border-cyan-300/25 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/30 p-8 text-white shadow-[0_18px_50px_rgba(2,8,23,0.5)]">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Settings</h1>
        <p className="mt-2 text-sm text-slate-300 md:text-base">Tune your profile, appearance, notifications, and account security.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/65 p-6 shadow-lg">
          <h2 className="text-lg font-bold uppercase tracking-[0.15em] text-cyan-200">Account</h2>
          <div className="mt-4 space-y-4">
            <Field label="Email Address" value="demo@infoportal.com" disabled />
            <Field label="Display Name" placeholder="Demo User" />
            <button className="w-full rounded-xl border border-cyan-300/45 bg-cyan-400/10 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-100 transition hover:bg-cyan-300/20">
              Update Profile
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/65 p-6 shadow-lg">
          <h2 className="text-lg font-bold uppercase tracking-[0.15em] text-emerald-200">Currency Preview</h2>
          <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-emerald-100">Conversion Snapshot</p>
            <div className="mt-3 flex items-center justify-between text-center">
              <div>
                <p className="text-xs text-emerald-100">USD</p>
                <p className="text-2xl font-extrabold text-white">${testAmount}</p>
              </div>
              <div className="text-xl text-emerald-100">-&gt;</div>
              <div>
                <p className="text-xs text-emerald-100">{selectedCurrency}</p>
                <p className="text-2xl font-extrabold text-white">{currencySymbols[selectedCurrency]} {convertedAmount}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-400">Currency</label>
            <select
              value={selectedCurrency}
              onChange={(event) => setSelectedCurrency(event.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-emerald-300"
            >
              <option value="USD">US Dollar</option>
              <option value="EUR">Euro</option>
              <option value="GBP">British Pound</option>
              <option value="JPY">Japanese Yen</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/65 p-6 shadow-lg">
          <h2 className="text-lg font-bold uppercase tracking-[0.15em] text-violet-200">Preferences</h2>
          <div className="mt-4 space-y-4">
            <SelectField
              label="Theme"
              value={settings.theme}
              onChange={(value) => handleChange("theme", value)}
              options={[
                { value: "dark", label: "Dark" },
                { value: "light", label: "Light" },
                { value: "auto", label: "Auto" },
              ]}
            />
            <SelectField
              label="Language"
              value={settings.language}
              onChange={(value) => handleChange("language", value)}
              options={[
                { value: "en", label: "English" },
                { value: "ru", label: "Russian" },
                { value: "es", label: "Spanish" },
                { value: "de", label: "German" },
                { value: "fr", label: "French" },
              ]}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/65 p-6 shadow-lg">
          <h2 className="text-lg font-bold uppercase tracking-[0.15em] text-amber-200">Notifications</h2>
          <div className="mt-4 space-y-3">
            <ToggleRow
              label="Push Notifications"
              checked={settings.notifications}
              onChange={(value) => handleChange("notifications", value)}
            />
            <ToggleRow
              label="Email Updates"
              checked={settings.emailUpdates}
              onChange={(value) => handleChange("emailUpdates", value)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/65 p-6 shadow-lg">
          <h2 className="text-lg font-bold uppercase tracking-[0.15em] text-rose-200">Security</h2>
          <div className="mt-4 space-y-3">
            <ToggleRow
              label="Two-Factor Authentication"
              checked={settings.twoFactor}
              onChange={(value) => handleChange("twoFactor", value)}
            />
            <button className="rounded-xl border border-slate-600 bg-slate-950/70 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/45 hover:text-cyan-200">
              Change Password
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-500/35 bg-rose-500/10 p-6 shadow-lg">
          <h2 className="text-lg font-bold uppercase tracking-[0.15em] text-rose-200">Danger Zone</h2>
          <p className="mt-3 text-sm text-rose-100">These actions are permanent.</p>
          <button className="mt-5 w-full rounded-xl border border-rose-300/40 bg-rose-500/20 px-4 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-rose-100 transition hover:bg-rose-500/30">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, placeholder, disabled = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <input
        type="text"
        value={value ?? ""}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={disabled}
        className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-300 disabled:cursor-not-allowed disabled:text-slate-400"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-300"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/55 px-4 py-3">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-cyan-400" : "bg-slate-600"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? "right-0.5" : "left-0.5"}`} />
      </button>
    </label>
  );
}
