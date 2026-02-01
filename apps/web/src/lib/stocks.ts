// Map stock tickers to their corporate domains for the Logo API
export const tickerToDomain: Record<string, string> = {
  // Big Tech
  AAPL: 'apple.com',
  MSFT: 'microsoft.com',
  GOOGL: 'abc.xyz', // Parent company of Google
  AMZN: 'amazon.com',
  TSLA: 'tesla.com',
  NVDA: 'nvidia.com',
  META: 'meta.com',
  NFLX: 'netflix.com',
  AMD: 'amd.com',
  INTC: 'intel.com',
  UBER: 'uber.com',
  ABNB: 'airbnb.com',

  // Blue Chip & Traditional Industries
  KO: 'coca-colacompany.com',
  MCD: 'mcdonalds.com',
  DIS: 'thewaltdisneycompany.com',
  NKE: 'nike.com',
  JPM: 'jpmorganchase.com',
  V: 'visa.com',
  XOM: 'exxonmobil.com',
  PFE: 'pfizer.com',

  // ETFs (Using issuers as fallback or placeholders)
  VOO: 'vanguard.com',
  QQQ: 'invesco.com',

  // Crypto (Requires specific mapping)
  'BINANCE:BTCUSDT': 'bitcoin.org',
  'BINANCE:ETHUSDT': 'ethereum.org'
};

// Map stock tickers to their full company/asset names
export const tickerToName: Record<string, string> = {
  // Big Tech
  AAPL: 'Apple Inc.',
  MSFT: 'Microsoft Corporation',
  GOOGL: 'Alphabet Inc.',
  AMZN: 'Amazon.com, Inc.',
  TSLA: 'Tesla, Inc.',
  NVDA: 'NVIDIA Corporation',
  META: 'Meta Platforms, Inc.',
  NFLX: 'Netflix, Inc.',
  AMD: 'Advanced Micro Devices, Inc.',
  INTC: 'Intel Corporation',
  UBER: 'Uber Technologies, Inc.',
  ABNB: 'Airbnb, Inc.',

  // Blue Chip & Traditional Industries
  KO: 'The Coca-Cola Company',
  MCD: "McDonald's Corporation",
  DIS: 'The Walt Disney Company',
  NKE: 'Nike, Inc.',
  JPM: 'JPMorgan Chase & Co.',
  V: 'Visa Inc.',
  XOM: 'Exxon Mobil Corporation',
  PFE: 'Pfizer Inc.',

  // ETFs
  VOO: 'Vanguard S&P 500 ETF',
  QQQ: 'Invesco QQQ Trust',

  // Crypto
  'BINANCE:BTCUSDT': 'Bitcoin (BTC/USDT)',
  'BINANCE:ETHUSDT': 'Ethereum (ETH/USDT)'
};

export default tickerToDomain;
