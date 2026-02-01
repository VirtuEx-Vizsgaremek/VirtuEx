// Map stock tickers to their corporate domains for the Logo API
export const tickerToDomain: Record<string, string> = {
  // Big Tech
  AAPL: 'apple.com',
  MSFT: 'microsoft.com',
  GOOGL: 'abc.xyz',
  AMZN: 'amazon.com',
  TSLA: 'tesla.com',
  NVDA: 'nvidia.com',
  META: 'meta.com',
  NFLX: 'netflix.com',
  AMD: 'amd.com',
  INTC: 'intel.com',
  UBER: 'uber.com',
  ABNB: 'airbnb.com',
  ADBE: 'adobe.com',
  CRM: 'salesforce.com',
  ORCL: 'oracle.com',
  CSCO: 'cisco.com',
  IBM: 'ibm.com',
  QCOM: 'qualcomm.com',
  TXN: 'ti.com',
  AVGO: 'broadcom.com',
  SHOP: 'shopify.com',
  SQ: 'squareup.com',
  PYPL: 'paypal.com',
  SPOT: 'spotify.com',
  SNAP: 'snap.com',
  TWTR: 'twitter.com',
  RBLX: 'roblox.com',
  ROKU: 'roku.com',

  // Financial Services
  JPM: 'jpmorganchase.com',
  BAC: 'bankofamerica.com',
  WFC: 'wellsfargo.com',
  GS: 'goldmansachs.com',
  MS: 'morganstanley.com',
  C: 'citigroup.com',
  BLK: 'blackrock.com',
  SCHW: 'schwab.com',
  AXP: 'americanexpress.com',
  V: 'visa.com',
  MA: 'mastercard.com',
  COF: 'capitalone.com',

  // Healthcare & Pharma
  JNJ: 'jnj.com',
  UNH: 'unitedhealthgroup.com',
  PFE: 'pfizer.com',
  ABBV: 'abbvie.com',
  TMO: 'thermofisher.com',
  ABT: 'abbott.com',
  MRK: 'merck.com',
  LLY: 'lilly.com',
  BMY: 'bms.com',
  AMGN: 'amgen.com',
  GILD: 'gilead.com',
  CVS: 'cvshealth.com',

  // Consumer Goods & Retail
  WMT: 'walmart.com',
  HD: 'homedepot.com',
  PG: 'pg.com',
  KO: 'coca-colacompany.com',
  PEP: 'pepsico.com',
  COST: 'costco.com',
  NKE: 'nike.com',
  MCD: 'mcdonalds.com',
  SBUX: 'starbucks.com',
  TGT: 'target.com',
  LOW: 'lowes.com',
  TJX: 'tjx.com',
  DIS: 'thewaltdisneycompany.com',

  // Energy
  XOM: 'exxonmobil.com',
  CVX: 'chevron.com',
  COP: 'conocophillips.com',
  SLB: 'slb.com',
  EOG: 'eogresources.com',

  // Automotive
  F: 'ford.com',
  GM: 'gm.com',
  RIVN: 'rivian.com',
  LCID: 'lucidmotors.com',

  // Industrial & Manufacturing
  BA: 'boeing.com',
  CAT: 'caterpillar.com',
  GE: 'ge.com',
  MMM: '3m.com',
  HON: 'honeywell.com',
  UPS: 'ups.com',
  RTX: 'rtx.com',

  // Telecom
  T: 'att.com',
  VZ: 'verizon.com',
  TMUS: 't-mobile.com',

  // Real Estate & Construction
  AMT: 'americantower.com',
  PLD: 'prologis.com',

  // Consumer Discretionary
  BKNG: 'booking.com',
  EXPE: 'expediagroup.com',

  // Materials & Chemicals
  LIN: 'linde.com',
  APD: 'airproducts.com',

  // ETFs
  VOO: 'vanguard.com',
  QQQ: 'invesco.com',
  SPY: 'ssga.com',

  // Crypto
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
  ADBE: 'Adobe Inc.',
  CRM: 'Salesforce, Inc.',
  ORCL: 'Oracle Corporation',
  CSCO: 'Cisco Systems, Inc.',
  IBM: 'International Business Machines',
  QCOM: 'Qualcomm Incorporated',
  TXN: 'Texas Instruments',
  AVGO: 'Broadcom Inc.',
  SHOP: 'Shopify Inc.',
  SQ: 'Block, Inc.',
  PYPL: 'PayPal Holdings, Inc.',
  SPOT: 'Spotify Technology S.A.',
  SNAP: 'Snap Inc.',
  TWTR: 'Twitter, Inc.',
  RBLX: 'Roblox Corporation',
  ROKU: 'Roku, Inc.',

  // Financial Services
  JPM: 'JPMorgan Chase & Co.',
  BAC: 'Bank of America Corporation',
  WFC: 'Wells Fargo & Company',
  GS: 'The Goldman Sachs Group',
  MS: 'Morgan Stanley',
  C: 'Citigroup Inc.',
  BLK: 'BlackRock, Inc.',
  SCHW: 'The Charles Schwab Corporation',
  AXP: 'American Express Company',
  V: 'Visa Inc.',
  MA: 'Mastercard Incorporated',
  COF: 'Capital One Financial Corp.',

  // Healthcare & Pharma
  JNJ: 'Johnson & Johnson',
  UNH: 'UnitedHealth Group Inc.',
  PFE: 'Pfizer Inc.',
  ABBV: 'AbbVie Inc.',
  TMO: 'Thermo Fisher Scientific',
  ABT: 'Abbott Laboratories',
  MRK: 'Merck & Co., Inc.',
  LLY: 'Eli Lilly and Company',
  BMY: 'Bristol Myers Squibb',
  AMGN: 'Amgen Inc.',
  GILD: 'Gilead Sciences, Inc.',
  CVS: 'CVS Health Corporation',

  // Consumer Goods & Retail
  WMT: 'Walmart Inc.',
  HD: 'The Home Depot, Inc.',
  PG: 'The Procter & Gamble Company',
  KO: 'The Coca-Cola Company',
  PEP: 'PepsiCo, Inc.',
  COST: 'Costco Wholesale Corporation',
  NKE: 'Nike, Inc.',
  MCD: "McDonald's Corporation",
  SBUX: 'Starbucks Corporation',
  TGT: 'Target Corporation',
  LOW: "Lowe's Companies, Inc.",
  TJX: 'The TJX Companies, Inc.',
  DIS: 'The Walt Disney Company',

  // Energy
  XOM: 'Exxon Mobil Corporation',
  CVX: 'Chevron Corporation',
  COP: 'ConocoPhillips',
  SLB: 'Schlumberger Limited',
  EOG: 'EOG Resources, Inc.',

  // Automotive
  F: 'Ford Motor Company',
  GM: 'General Motors Company',
  RIVN: 'Rivian Automotive, Inc.',
  LCID: 'Lucid Group, Inc.',

  // Industrial & Manufacturing
  BA: 'The Boeing Company',
  CAT: 'Caterpillar Inc.',
  GE: 'General Electric Company',
  MMM: '3M Company',
  HON: 'Honeywell International Inc.',
  UPS: 'United Parcel Service',
  RTX: 'RTX Corporation',

  // Telecom
  T: 'AT&T Inc.',
  VZ: 'Verizon Communications Inc.',
  TMUS: 'T-Mobile US, Inc.',

  // Real Estate & Construction
  AMT: 'American Tower Corporation',
  PLD: 'Prologis, Inc.',

  // Consumer Discretionary
  BKNG: 'Booking Holdings Inc.',
  EXPE: 'Expedia Group, Inc.',

  // Materials & Chemicals
  LIN: 'Linde plc',
  APD: 'Air Products and Chemicals',

  // ETFs
  VOO: 'Vanguard S&P 500 ETF',
  QQQ: 'Invesco QQQ Trust',
  SPY: 'SPDR S&P 500 ETF Trust',

  // Crypto
  'BINANCE:BTCUSDT': 'Bitcoin (BTC/USDT)',
  'BINANCE:ETHUSDT': 'Ethereum (ETH/USDT)'
};

export default tickerToDomain;
