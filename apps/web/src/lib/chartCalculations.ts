// Parameters for calculating price/value changes
interface CalculateChangeParams {
  currentValue: number;
  previousValue: number;
}

// Result containing change metrics
interface ChangeResult {
  changeAmount: number; // Absolute difference (e.g., 5.50)
  changePercent: number; // Percentage change (e.g., 5.5%)
  isPositive: boolean; // True if increased, false if decreased
}

// Time value can be string, unix timestamp, or date object
type TimeValue = string | number | { year: number; month: number; day: number };

/**
 * Calculate the change between two values
 * Returns absolute change, percentage change, and direction
 */
export function calculateChange({
  currentValue,
  previousValue
}: CalculateChangeParams): ChangeResult {
  const changeAmount = currentValue - previousValue;
  const changePercent = (changeAmount / previousValue) * 100;
  const isPositive = changeAmount >= 0;

  return {
    changeAmount,
    changePercent,
    isPositive
  };
}

/**
 * Get the previous value from a time-series dataset
 * Generic function that works with both area and candlestick data
 * @returns The previous value, or null if there's no previous item
 */
const normalizeTime = (time: TimeValue): string => {
  if (typeof time === 'string') return time;
  if (typeof time === 'number') return String(time);
  return `${time.year}-${String(time.month).padStart(2, '0')}-${String(
    time.day
  ).padStart(2, '0')}`;
};

export function getPreviousValue<
  T extends { time: TimeValue; value?: number; close?: number }
>(
  data: T[],
  currentTime: TimeValue,
  valueKey: 'value' | 'close'
): number | null {
  const normalizedCurrent = normalizeTime(currentTime);
  const currentIndex = data.findIndex(
    (d) => normalizeTime(d.time) === normalizedCurrent
  );
  // No previous value if current is first item or not found
  if (currentIndex <= 0) {
    return null;
  }
  const previousItem = data[currentIndex - 1];
  return previousItem[valueKey] ?? null;
}

/**
 * Calculate day-to-day change for candlestick charts (OHLC)
 * Compares current close vs previous day's close
 * Falls back to current open if no previous data exists
 */
export function calculateOHLCChange(
  currentCandle: { open: number; close: number; time: TimeValue },
  candleData: Array<{ time: TimeValue; close: number }>
): ChangeResult {
  const previousClose = getPreviousValue(
    candleData,
    currentCandle.time,
    'close'
  );
  // Use previous close, or fall back to current open if it's the first candle
  const referenceValue = previousClose ?? currentCandle.open;

  return calculateChange({
    currentValue: currentCandle.close,
    previousValue: referenceValue
  });
}

/**
 * Calculate day-to-day change for area charts
 * Compares current value vs previous day's value
 * Falls back to current value if no previous data exists
 */
export function calculateAreaChange(
  currentData: { value: number; time: TimeValue },
  areaData: Array<{ time: TimeValue; value: number }>
): ChangeResult {
  const previousValue = getPreviousValue(areaData, currentData.time, 'value');
  // Use previous value, or fall back to current value if it's the first data point
  const referenceValue = previousValue ?? currentData.value;

  return calculateChange({
    currentValue: currentData.value,
    previousValue: referenceValue
  });
}

/*
 * USAGE EXAMPLES - General Purpose Utilities:
 *
 * These functions can be used in any component or page that needs to:
 * - Calculate changes between values (prices, metrics, statistics)
 * - Compare time-series data (day-over-day, period-over-period)
 * - Display percentage changes with direction indicators
 *
 * Example Use Cases:
 *
 * 1. Trading Dashboard - Stock/Crypto Price Changes:
 *    import { calculateChange } from '@/lib/chartCalculations';
 *    const { changePercent, isPositive } = calculateChange({
 *      currentValue: stockPrice,
 *      previousValue: yesterdayPrice
 *    });
 *
 * 2. Portfolio Tracker - Asset Value Changes:
 *    import { calculateOHLCChange } from '@/lib/chartCalculations';
 *    const currentAsset = { open: 1000, close: 1050, time: "2024-01-15" };
 *    const history = [{ time: "2024-01-14", close: 980 }, ...];
 *    const change = calculateOHLCChange(currentAsset, history);
 *
 * 3. Analytics Page - User Growth Metrics:
 *    import { calculateAreaChange } from '@/lib/chartCalculations';
 *    const today = { value: 15000, time: "2024-01-15" };
 *    const userHistory = [{ time: "2024-01-14", value: 14500 }, ...];
 *    const growth = calculateAreaChange(today, userHistory);
 *
 * 4. Sales Dashboard - Revenue Comparison:
 *    const { changeAmount, changePercent } = calculateChange({
 *      currentValue: todaysRevenue,
 *      previousValue: lastWeekRevenue
 *    });
 *
 * 5. Any Time-Series Data - Find Previous Value:
 *    import { getPreviousValue } from '@/lib/chartCalculations';
 *    const prevTemp = getPreviousValue(
 *      temperatureData,
 *      currentTime,
 *      'value'
 *    );
 */
