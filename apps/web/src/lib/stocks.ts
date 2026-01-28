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
  SPY: 'state street',
  QQQ: 'invesco',

  // Crypto (Requires specific mapping)
  'BINANCE:BTCUSDT': 'bitcoin.org',
  'BINANCE:ETHUSDT': 'ethereum.org'
};

export default tickerToDomain;
