const CURRENCY_API_URL = "https://cdn.moneyconvert.net/api/latest.json";
const CACHE_TTL_MS = 10 * 60 * 1000;
const CURRENCY_CACHE_KEY = "currency_rates_cache_v1";

const EXCLUDED_CODES = new Set(["RUB"]);

const FALLBACK_SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
  "INR",
  "SEK",
  "NOK",
  "NZD",
  "MXN",
  "SGD",
  "HKD",
  "AED",
  "BRL",
  "TRY",
  "ZAR",
];

export const currencyService = {
  async getRates(signal) {
    const cached = readCache();

    if (cached) {
      return cached;
    }

    const response = await fetch(CURRENCY_API_URL, { signal });

    if (!response.ok) {
      throw new Error(`Currency API request failed: ${response.status}`);
    }

    const payload = await response.json();
    const base = payload.base || "USD";
    const rates = normalizeRates(payload.rates || {});
    const supportedCurrencies = buildSupportedCurrencies(rates, base);

    const result = {
      base,
      rates,
      supportedCurrencies,
      updatedAt: new Date().toISOString(),
    };

    writeCache(result);
    return result;
  },

  convert(amount, fromCurrency, toCurrency, rates) {
    if (!amount || !rates?.[fromCurrency] || !rates?.[toCurrency]) {
      return 0;
    }

    return (amount / rates[fromCurrency]) * rates[toCurrency];
  },

  formatValue(value) {
    const safe = Number(value || 0);
    return safe.toLocaleString(undefined, {
      minimumFractionDigits: safe >= 100 ? 2 : 4,
      maximumFractionDigits: safe >= 100 ? 2 : 4,
    });
  },

  formatRate(value) {
    const safe = Number(value || 0);

    if (safe >= 100) {
      return safe.toFixed(2);
    }

    if (safe >= 1) {
      return safe.toFixed(4);
    }

    return safe.toFixed(6);
  },
};

function normalizeRates(rates) {
  return Object.entries(rates).reduce((acc, [code, rate]) => {
    if (!EXCLUDED_CODES.has(code)) {
      acc[code] = Number(rate);
    }

    return acc;
  }, {});
}

function buildSupportedCurrencies(rates, base) {
  const majorCurrencies = FALLBACK_SUPPORTED_CURRENCIES.filter((code) => code === base || rates[code]);
  const extraCurrencies = Object.keys(rates)
    .filter((code) => !EXCLUDED_CODES.has(code) && !majorCurrencies.includes(code))
    .slice(0, 20);

  return Array.from(new Set([base, ...majorCurrencies, ...extraCurrencies]));
}

function readCache() {
  try {
    const raw = localStorage.getItem(CURRENCY_CACHE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!parsed?.expiresAt || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(CURRENCY_CACHE_KEY);
      return null;
    }

    return parsed.value;
  } catch (error) {
    return null;
  }
}

function writeCache(value) {
  try {
    localStorage.setItem(
      CURRENCY_CACHE_KEY,
      JSON.stringify({
        value,
        expiresAt: Date.now() + CACHE_TTL_MS,
      })
    );
  } catch (error) {
    // Ignore storage errors.
  }
}
