/**
 * Generates random price data with realistic market movements
 */
function generateRandomPrice(
  previousPrice: number,
  volatility: number = 0.02
): number {
  const change = previousPrice * volatility * (Math.random() - 0.5) * 2;
  return Math.max(previousPrice + change, 0.01);
}

/**
 * Generates data for asset price tracking (single or multiple assets)
 */
export function generateShadCnChartData(
  days: number = 365,
  startDate: Date = new Date('2024-01-01'),
  assets: { name: string; initialPrice: number; symbol: string }[] = [
    { name: 'Bitcoin', symbol: 'BTC', initialPrice: 40000 },
    { name: 'Ethereum', symbol: 'ETH', initialPrice: 2000 },
    { name: 'Cardano', symbol: 'ADA', initialPrice: 0.5 }
  ]
) {
  const data = [];

  // Initialize price tracking for each asset separately
  const assetPrices: Record<string, number> = {};
  assets.forEach((asset) => {
    assetPrices[asset.symbol] = asset.initialPrice;
  });

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dataPoint: any = {
      date: currentDate.toISOString().split('T')[0]
    };

    // Generate price for each asset independently
    assets.forEach((asset) => {
      // Update price for this asset based on its previous price
      assetPrices[asset.symbol] = generateRandomPrice(
        assetPrices[asset.symbol],
        0.08 // Higher volatility for more dramatic changes
      );
      dataPoint[asset.symbol] = Number(assetPrices[asset.symbol].toFixed(2));
    });

    data.push(dataPoint);
  }

  return data;
}

/**
 * Generates data for TradingView chart (time/value format)
 */
export function generateTradingViewChartData(
  days: number = 90,
  startDate: Date = new Date('2024-01-01'),
  initialPrice: number = 100
) {
  const data = [];
  let currentPrice = initialPrice;

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);

    // Generate realistic price movements
    currentPrice = generateRandomPrice(currentPrice, 0.03);

    data.push({
      time: currentDate.toISOString().split('T')[0],
      value: Number(currentPrice.toFixed(2))
    });
  }

  return data;
}

/**
 * Generates candlestick data for TradingView chart (OHLC format)
 */
export function generateCandlestickData(
  days: number = 90,
  startDate: Date = new Date('2024-01-01'),
  initialPrice: number = 100
) {
  const data = [];
  let currentPrice = initialPrice;

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);

    const open = currentPrice;
    const close = generateRandomPrice(open, 0.03);
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);

    data.push({
      time: currentDate.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2))
    });

    currentPrice = close;
  }

  return data;
}
