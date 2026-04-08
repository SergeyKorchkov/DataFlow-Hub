import { useEffect, useMemo, useState } from "react";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { currencyService } from "../services/currencyService";

const DEFAULT_BASE = "USD";

export function CurrencyPage() {
  const [ratesData, setRatesData] = useState(null);
  const [baseCurrency, setBaseCurrency] = useState(DEFAULT_BASE);
  const [amount, setAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadRates() {
      setIsLoading(true);
      setError("");

      try {
        const data = await currencyService.getRates(controller.signal);
        setRatesData(data);
        setBaseCurrency((current) => (data.supportedCurrencies.includes(current) ? current : data.base || DEFAULT_BASE));
      } catch (err) {
        if (!controller.signal.aborted) {
          setError("Failed to load live currency rates.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadRates();

    return () => controller.abort();
  }, []);

  const supportedCurrencies = ratesData?.supportedCurrencies || [DEFAULT_BASE];
  const rates = ratesData?.rates || {};

  const displayRows = useMemo(() => {
    if (!ratesData) {
      return [];
    }

    const lowerSearch = search.trim().toLowerCase();

    return supportedCurrencies
      .filter((code) => code !== "RUB")
      .filter((code) => code !== baseCurrency)
      .filter((code) => {
        if (!lowerSearch) {
          return true;
        }

        return code.toLowerCase().includes(lowerSearch);
      })
      .map((code) => {
        const converted = currencyService.convert(amount, baseCurrency, code, rates);
        const reverse = currencyService.convert(1, code, baseCurrency, rates);

        return {
          code,
          value: converted,
          reverse,
        };
      })
      .sort((left, right) => right.value - left.value);
  }, [amount, baseCurrency, rates, ratesData, search, supportedCurrencies]);

  const quickPairs = useMemo(() => {
    const pool = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "SGD", "HKD", "NZD"];

    return pool
      .filter((code) => code !== baseCurrency && rates[code])
      .slice(0, 6)
      .map((code) => ({
        code,
        value: currencyService.convert(amount, baseCurrency, code, rates),
      }));
  }, [amount, baseCurrency, rates]);

  const rateLabel = ratesData?.base || DEFAULT_BASE;
  const baseRate = rates[baseCurrency] || 1;

  return (
    <div className="space-y-8 rounded-3xl border border-slate-800 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.25),_transparent_35%),radial-gradient(circle_at_10%_80%,_rgba(168,85,247,0.16),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_68%,_#111827_100%)] p-6 md:p-8 shadow-2xl">
      <section className="rounded-3xl border border-cyan-400/25 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/30 p-8 text-white shadow-[0_18px_50px_rgba(15,23,42,0.45)]">
        <p className="mb-3 inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          MoneyConvert Live
        </p>
        <h1 className="text-4xl font-extrabold md:text-5xl">Currency Exchange</h1>
        <p className="mt-3 max-w-3xl text-base text-slate-300 md:text-lg">
          Choose your base currency and instantly see relative exchange values across major markets. No RUB shown anywhere.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Base Currency</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-100">{baseCurrency}</h2>
              <p className="mt-1 text-sm text-slate-400">Updated live from MoneyConvert</p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Rate vs USD</p>
              <p className="mt-1 text-2xl font-bold text-cyan-200">{currencyService.formatRate(baseRate)}</p>
              <p className="text-xs text-slate-400">1 USD = {currencyService.formatRate(rates[baseCurrency] || 1)} {baseCurrency}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.15em] text-slate-400">Amount</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value || 0))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-2xl font-bold text-slate-100 outline-none transition focus:border-cyan-300/60"
              />
            </label>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => setAmount(1)}
                className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200"
              >
                1
              </button>
              <button
                type="button"
                onClick={() => setAmount(10)}
                className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200"
              >
                10
              </button>
              <button
                type="button"
                onClick={() => setAmount(100)}
                className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200"
              >
                100
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {supportedCurrencies
              .filter((code) => code !== "RUB")
              .slice(0, 12)
              .map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setBaseCurrency(code)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    baseCurrency === code
                      ? "bg-cyan-300 text-slate-950"
                      : "border border-slate-700 bg-slate-800 text-slate-300 hover:border-cyan-300/50 hover:text-cyan-200"
                  }`}
                >
                  {code}
                </button>
              ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-5 shadow-lg">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Quick View</p>
          <div className="mt-4 space-y-3">
            {quickPairs.map((item) => (
              <div key={item.code} className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{item.code}</p>
                  <p className="text-xs text-slate-400">1 {baseCurrency} → {item.code}</p>
                </div>
                <p className="text-lg font-bold text-cyan-200">{currencyService.formatValue(item.value)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-100">Convert to other currencies</h3>
            <p className="mt-1 text-sm text-slate-400">Showing relative values for {amount} {baseCurrency}.</p>
          </div>

          <label className="w-full max-w-xs">
            <span className="mb-2 block text-xs uppercase tracking-[0.15em] text-slate-400">Search currency</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Try EUR, JPY, CAD..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
            />
          </label>
        </div>

        {isLoading ? (
          <LoadingSkeleton variant="currency-grid" />
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">{error}</div>
        ) : null}

        {!isLoading ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {displayRows.map((row) => (
              <article key={row.code} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/50">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{baseCurrency} → {row.code}</p>
                    <h4 className="mt-1 text-2xl font-extrabold text-slate-100">{currencyService.formatValue(row.value)}</h4>
                  </div>
                  <div className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                    {row.code}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>1 {row.code} = {currencyService.formatValue(row.reverse)} {baseCurrency}</span>
                  <span>Live</span>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-100">Supported currencies</h3>
            <p className="mt-1 text-sm text-slate-400">RUB intentionally excluded.</p>
          </div>
          <div className="text-xs uppercase tracking-[0.15em] text-slate-400">{supportedCurrencies.filter((code) => code !== "RUB").length} currencies</div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {supportedCurrencies
            .filter((code) => code !== "RUB")
            .map((code) => (
              <span key={code} className="rounded-full border border-slate-700 bg-slate-950/50 px-3 py-1 text-xs font-semibold text-slate-300">
                {code}
              </span>
            ))}
        </div>
      </section>
    </div>
  );
}
