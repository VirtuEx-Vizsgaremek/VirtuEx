/**
 * Generates random price data with realistic market movements
 *
 * Simulates daily price changes with configurable volatility.
 * Used to create mock data for testing and demo purposes.
 *
 * @param previousPrice - Starting price for this iteration
 * @param volatility - Standard deviation of price change (default 2% = 0.02)
 * @returns Next price value with random variation
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
 *
 * Creates realistic multi-asset price history with independent price movements.
 * Useful for dashboard views showing multiple assets at once.
 *
 * @param days - Number of days of historical data to generate (default 365)
 * @param startDate - Starting date for data generation (default 2024-01-01)
 * @param assets - Array of asset definitions with name, symbol, and initial price
 * @returns Array of objects with date and price for each asset
 *
 * Example:
 * const data = generateShadCnChartData(365, new Date('2024-01-01'), [
 *   { name: 'Bitcoin', symbol: 'BTC', initialPrice: 40000 },
 *   { name: 'Ethereum', symbol: 'ETH', initialPrice: 2000 }
 * ]);
 * // Returns: [{ date: '2024-01-01', BTC: 40150.25, ETH: 1998.50 }, ...]
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
 *
 * Creates area chart data with simple time/value pairs.
 * Used for mock data in TradingView component when no real API data available.
 * Data format matches market API response for seamless integration.
 *
 * @param days - Number of days of historical data (default 90)
 * @param startDate - Starting date for data generation (default 2024-01-01)
 * @param initialPrice - Starting price for simulation (default 100)
 * @returns Array of { time: string (YYYY-MM-DD), value: number } objects
 *
 * Data Flow:
 * - Used as initial state in TradingView component
 * - Replaced when user fetches real data from backend API
 * - Time format: ISO date string (YYYY-MM-DD) for TradingView compatibility
 *
 * Example:
 * const data = generateTradingViewChartData(90, new Date('2024-01-01'), 100);
 * // Returns: [{ time: '2024-01-01', value: 100.50 }, { time: '2024-01-02', value: 101.25 }, ...]
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
 *
 * Creates realistic OHLC (Open, High, Low, Close) data for candlestick charts.
 * Each candle represents one day of trading activity with daily price range.
 * Used for mock data in TradingView component when no real API data available.
 * Data format matches market API response for seamless integration.
 *
 * Algorithm:
 * 1. Start with opening price (previous day's close or initial price)
 * 2. Generate close price with volatility (±3% default)
 * 3. Set high and low with additional variation (±2% extra)
 * 4. Use close as next iteration's opening price for realistic progression
 *
 * @param days - Number of days of candlestick data (default 90)
 * @param startDate - Starting date for data generation (default 2024-01-01)
 * @param initialPrice - Starting price for first candle (default 100)
 * @returns Array of { time: string (YYYY-MM-DD), open, high, low, close: number } objects
 *
 * Data Flow:
 * - Used as initial state in TradingView component
 * - Replaced when user fetches real data from backend API
 * - Time format: ISO date string (YYYY-MM-DD) for TradingView compatibility
 * - Close price from each candle becomes open price for next candle
 *
 * Example:
 * const data = generateCandlestickData(90, new Date('2024-01-01'), 100);
 * // Returns: [{\n * //   time: '2024-01-01',\n * //   open: 100.00,\n * //   high: 102.50,\n * //   low: 99.75,\n * //   close: 101.25\n * // }, ...]\n */
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
