/**
 * Chart Calculations Utilities
 *
 * Core functions for calculating price changes and percentage changes in financial charts.
 * Handles multiple time value formats (string dates, unix timestamps, date objects)
 * for compatibility with TradingView data sources (real API and mock data).
 *
 * Features:
 * - Flexible time value handling with normalizeTime() for format conversion
 * - Day-to-day change calculation for both area and candlestick charts
 * - Previous value lookup in time-series data
 * - Support for both OHLC (candlestick) and simple (area) price data
 *
 * Data Types:
 * - TimeValue: Union type supporting string, unix timestamp, or {year,month,day} object
 * - Used throughout to ensure compatibility across different data sources
 */

/**
 * Parameters for calculating price/value changes
 * Used as input to calculateChange() function
 */
interface CalculateChangeParams {
  currentValue: number; // Current/new price value
  previousValue: number; // Previous/old price value for comparison
}

/**
 * Result containing change metrics
 * Returned by all calculate*Change functions
 */
interface ChangeResult {
  changeAmount: number; // Absolute difference (e.g., 5.50)
  changePercent: number; // Percentage change (e.g., 5.5%)
  isPositive: boolean; // True if increased, false if decreased
}

/**
 * Time value type - supports multiple formats from different data sources
 *
 * Formats:
 * - string: ISO date format "2024-01-01" (from API and generators)
 * - number: Unix timestamp in seconds (from TradingView's lightweight-charts)
 * - object: {year, month, day} (from some data sources)
 *
 * normalizeTime() converts any format to ISO string for comparison
 */
type TimeValue = string | number | { year: number; month: number; day: number };

/**
 * Calculate the change between two values
 * Returns absolute change, percentage change, and direction (positive/negative)
 *
 * Used by:
 * - ChartOverlay to display colored change indicators
 * - TradingView hover effects to show price movement
 *
 * @param currentValue - Current price (e.g., today's close)
 * @param previousValue - Previous price (e.g., yesterday's close)
 * @returns Object with changeAmount, changePercent, and isPositive flag
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
 * Normalize time values to ISO date string format
 *
 * Converts any TimeValue format to consistent ISO string "YYYY-MM-DD" format
 * for reliable comparison across different data sources.
 *
 * Handles:
 * - string: Passthrough (already ISO format from API/generators)
 * - number: Unix timestamp conversion (from TradingView lightweight-charts)
 * - object: {year, month, day} formatting
 *
 * @param time - TimeValue in any supported format
 * @returns ISO date string (YYYY-MM-DD)
 *
 * Used by:
 * - getPreviousValue() to find matching data point by date
 * - Any function needing time comparisons across formats
 */
const normalizeTime = (time: TimeValue): string => {
  if (typeof time === 'string') return time;
  if (typeof time === 'number') return String(time);
  return `${time.year}-${String(time.month).padStart(2, '0')}-${String(
    time.day
  ).padStart(2, '0')}`;
};

/**
 * Get the previous value from a time-series dataset
 * Generic function that works with both area and candlestick data
 *
 * Algorithm:
 * 1. Normalize current time to ISO string for comparison
 * 2. Find index of current data point in array
 * 3. Return value from previous item, or null if current is first item
 *
 * Handles multiple time formats for compatibility with different data sources
 *
 * @param data - Time-series array of data points
 * @param currentTime - Time of current data point (any TimeValue format)
 * @param valueKey - Which property to extract ('value' for area, 'close' for candlestick)
 * @returns The previous value, or null if there's no previous item
 *
 * Used by:
 * - calculateOHLCChange() to get previous close
 * - calculateAreaChange() to get previous value
 * - Fallback if previous value not found: uses current open (for OHLC) or current value (for area)
 */
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
 *
 * Data Flow:
 * - TradingView detects crosshair hover -> passes hovered candle data
 * - Calls calculateOHLCChange with full candlestick history
 * - Returns change metrics for ChartOverlay display
 *
 * Fallback Logic:
 * - If previous close found: use it (normal case, day-to-day comparison)
 * - If previous close NOT found (first candle): use current open (open-to-close comparison)
 *
 * @param currentCandle - Candle being hovered (open, close, time)
 * @param candleData - Full array of candlesticks for previous value lookup
 * @returns Change metrics (amount, percent, direction)
 *
 * Used by:
 * - TradingView.tsx for candlestick crosshair overlay
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
 *
 * Data Flow:
 * - TradingView detects crosshair hover -> passes hovered area point
 * - Calls calculateAreaChange with full price history
 * - Returns change metrics for ChartOverlay display
 *
 * Fallback Logic:
 * - If previous value found: use it (normal case, day-to-day comparison)
 * - If previous value NOT found (first point): use current value (0% change)
 *
 * @param currentData - Data point being hovered (value, time)
 * @param areaData - Full array of area data for previous value lookup
 * @returns Change metrics (amount, percent, direction)
 *
 * Used by:
 * - TradingView.tsx for area chart crosshair overlay
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
