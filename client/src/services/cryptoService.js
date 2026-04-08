const dashboardMock = {
  summary: {
    marketCap: "$2.41T",
    marketCapChange24h: "+2.8%",
    volume24h: "$98.4B",
    volumeChange24h: "+6.2%",
    btcDominance: "53.4%",
    fearGreed: 64,
  },
  trend: {
    defaultRange: "1Y",
    ranges: {
      "1W": {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        btc: [68120, 71260, 68940, 72480, 70110, 73620, 70950],
        eth: [3402, 3655, 3470, 3710, 3525, 3788, 3590],
      },
      "1M": {
        labels: [
          "Mar 01", "Mar 02", "Mar 03", "Mar 04", "Mar 05", "Mar 06", "Mar 07", "Mar 08", "Mar 09", "Mar 10",
          "Mar 11", "Mar 12", "Mar 13", "Mar 14", "Mar 15", "Mar 16", "Mar 17", "Mar 18", "Mar 19", "Mar 20",
          "Mar 21", "Mar 22", "Mar 23", "Mar 24", "Mar 25", "Mar 26", "Mar 27", "Mar 28", "Mar 29", "Mar 30",
        ],
        btc: [
          64820, 66190, 64210, 67380, 65140, 68820, 66250, 69790, 66980, 70540,
          68120, 71260, 68940, 72480, 70110, 73620, 70950, 74210, 71880, 74860,
          72340, 75690, 73120, 76420, 73980, 77240, 74510, 78190, 75280, 78950,
        ],
        eth: [
          3180, 3295, 3145, 3360, 3210, 3440, 3285, 3515, 3340, 3588,
          3402, 3655, 3470, 3710, 3525, 3788, 3590, 3842, 3635, 3920,
          3690, 3995, 3740, 4068, 3805, 4125, 3860, 4208, 3925, 4280,
        ],
      },
      "1Y": {
        labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        btc: [63820, 65190, 64410, 67280, 66140, 68890, 67950, 70120, 71500, 72480, 74210, 75640],
        eth: [3110, 3205, 3160, 3340, 3265, 3410, 3370, 3520, 3610, 3690, 3820, 3940],
      },
      "5Y": {
        labels: ["2021", "2022", "2023", "2024", "2025", "2026"],
        btc: [29374, 16527, 42240, 61120, 71840, 75640],
        eth: [738, 1192, 2281, 3124, 3620, 3940],
      },
    },
  },
  allocation: {
    labels: ["BTC", "ETH", "SOL", "LINK", "USDT"],
    values: [46, 28, 11, 8, 7],
  },
  movers: [
    { symbol: "BTC", name: "Bitcoin", price: "$72,540", change24h: "+3.1%", volume: "$38.1B" },
    { symbol: "ETH", name: "Ethereum", price: "$3,660", change24h: "+2.4%", volume: "$16.8B" },
    { symbol: "SOL", name: "Solana", price: "$182.14", change24h: "+5.8%", volume: "$4.9B" },
    { symbol: "LINK", name: "Chainlink", price: "$18.92", change24h: "+4.2%", volume: "$1.7B" },
    { symbol: "XRP", name: "XRP", price: "$0.68", change24h: "-1.3%", volume: "$2.2B" },
  ],
};

const BINANCE_BASE_URL = "https://api.binance.com/api/v3/klines";
const H1_INTERVAL = "1h";
const D1_INTERVAL = "1d";
const M1_INTERVAL = "1M";

export const cryptoService = {
  async getDashboard() {
    try {
      const [btcH1, ethH1, btcD1, ethD1, btcM1, ethM1] = await Promise.all([
        fetchKlines("BTCUSDT", H1_INTERVAL, 168),
        fetchKlines("ETHUSDT", H1_INTERVAL, 168),
        fetchKlines("BTCUSDT", D1_INTERVAL, 365),
        fetchKlines("ETHUSDT", D1_INTERVAL, 365),
        fetchKlines("BTCUSDT", M1_INTERVAL, 120),
        fetchKlines("ETHUSDT", M1_INTERVAL, 120),
      ]);

      return buildDashboardFromKlines({ btcH1, ethH1, btcD1, ethD1, btcM1, ethM1 });
    } catch (error) {
      return dashboardMock;
    }
  },
};

async function fetchKlines(symbol, interval, limit) {
  const url = `${BINANCE_BASE_URL}?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Binance request failed for ${symbol}: ${response.status}`);
  }

  const rows = await response.json();

  return rows.map((item) => ({
    openTime: Number(item[0]),
    close: Number(item[4]),
    quoteVolume: Number(item[7]),
  }));
}

function buildDashboardFromKlines({ btcH1, ethH1, btcD1, ethD1, btcM1, ethM1 }) {
  const weekRange = {
    labels: btcH1.map((item) => formatHourLabel(item.openTime)),
    btc: btcH1.map((item) => Number(item.close.toFixed(2))),
    eth: ethH1.map((item) => Number(item.close.toFixed(2))),
  };

  const monthRange = {
    labels: btcD1.slice(-30).map((item) => formatDayLabel(item.openTime)),
    btc: btcD1.slice(-30).map((item) => Number(item.close.toFixed(2))),
    eth: ethD1.slice(-30).map((item) => Number(item.close.toFixed(2))),
  };

  const yearRange = toMonthlyRange({ btcRows: btcD1, ethRows: ethD1 });
  const multiYearRange = toYearlyRange({ btcRows: btcM1, ethRows: ethM1, years: 5 });

  const btc = weekRange.btc;
  const eth = weekRange.eth;

  const btcLast = btc[btc.length - 1] ?? 0;
  const btcPrev24 = btc[Math.max(0, btc.length - 25)] ?? btcLast;
  const btcChange24h = calculatePercentChange(btcPrev24, btcLast);

  const ethLast = eth[eth.length - 1] ?? 0;
  const ethPrev24 = eth[Math.max(0, eth.length - 25)] ?? ethLast;
  const ethChange24h = calculatePercentChange(ethPrev24, ethLast);

  const btcQuoteVolume24h = btcH1.slice(-24).reduce((sum, item) => sum + item.quoteVolume, 0);
  const circulatingBtc = 19_700_000;
  const marketCap = btcLast * circulatingBtc;

  return {
    summary: {
      marketCap: formatLargeCurrency(marketCap),
      marketCapChange24h: formatSignedPercent(btcChange24h),
      volume24h: formatLargeCurrency(btcQuoteVolume24h),
      volumeChange24h: formatSignedPercent(btcChange24h / 2),
      btcDominance: "52.8%",
      fearGreed: btcChange24h >= 0 ? 67 : 43,
    },
    trend: {
      defaultRange: "1Y",
      ranges: {
        "1W": weekRange,
        "1M": monthRange,
        "1Y": yearRange,
        "5Y": multiYearRange,
      },
    },
    allocation: dashboardMock.allocation,
    movers: [
      {
        symbol: "BTC",
        name: "Bitcoin",
        price: formatPrice(btcLast),
        change24h: formatSignedPercent(btcChange24h),
        volume: formatLargeCurrency(btcQuoteVolume24h),
      },
      {
        symbol: "ETH",
        name: "Ethereum",
        price: formatPrice(ethLast),
        change24h: formatSignedPercent(ethChange24h),
        volume: formatLargeCurrency(ethH1.slice(-24).reduce((sum, item) => sum + item.quoteVolume, 0)),
      },
      ...dashboardMock.movers.slice(2),
    ],
  };
}

function toMonthlyRange({ btcRows, ethRows }) {
  const monthMap = new Map();

  btcRows.forEach((btcRow, index) => {
    const ethRow = ethRows[index];
    const date = new Date(btcRow.openTime);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    monthMap.set(key, {
      label: date.toLocaleString("en-US", { month: "short" }),
      btc: Number(btcRow.close.toFixed(2)),
      eth: Number((ethRow?.close ?? 0).toFixed(2)),
    });
  });

  const values = Array.from(monthMap.values());

  return {
    labels: values.map((item) => item.label),
    btc: values.map((item) => item.btc),
    eth: values.map((item) => item.eth),
  };
}

function toYearlyRange({ btcRows, ethRows, years }) {
  const yearMap = new Map();

  btcRows.forEach((btcRow, index) => {
    const ethRow = ethRows[index];
    const year = String(new Date(btcRow.openTime).getFullYear());

    yearMap.set(year, {
      year,
      btc: Number(btcRow.close.toFixed(2)),
      eth: Number((ethRow?.close ?? 0).toFixed(2)),
    });
  });

  const values = Array.from(yearMap.values()).slice(-years);

  return {
    labels: values.map((item) => item.year),
    btc: values.map((item) => item.btc),
    eth: values.map((item) => item.eth),
  };
}

function calculatePercentChange(fromValue, toValue) {
  if (!fromValue) {
    return 0;
  }

  return ((toValue - fromValue) / fromValue) * 100;
}

function formatHourLabel(timestamp) {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  return `${day} ${hour}:00`;
}

function formatDayLabel(timestamp) {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  return `${day} ${month}`;
}

function formatLargeCurrency(value) {
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  }

  if (abs >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }

  if (abs >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }

  return `$${value.toFixed(2)}`;
}

function formatSignedPercent(value) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatPrice(value) {
  if (value >= 1000) {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }

  return `$${value.toFixed(4)}`;
}
