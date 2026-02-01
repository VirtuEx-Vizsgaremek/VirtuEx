/**
 * Market Data API Endpoint
 *
 * This module provides a RESTful endpoint to fetch historical stock market data
 * from Yahoo Finance. It returns data in two formats: candlestick (OHLC) and area chart.
 *
 * Endpoint: GET /market?symbol=AAPL&days=30
 * Data Provider: Yahoo Finance (free, no API key required)
 */

import Status from '@/enum/status';
import { Request, Response } from '@/util/handler';
import YahooFinance from 'yahoo-finance2';

// Create YahooFinance instance for making API calls
// Note: yahoo-finance2 v3+ requires instantiation
const yahooFinance = new YahooFinance();

/**
 * Candlestick data format for OHLC charts
 * Each data point represents a full trading day with open, high, low, close prices
 */
interface CandlestickData {
  time: string; // Date in YYYY-MM-DD format
  open: number; // Opening price
  high: number; // Highest price during the day
  low: number; // Lowest price during the day
  close: number; // Closing price
}

/**
 * Area chart data format
 * Simplified format using only closing prices
 */
interface AreaData {
  time: string; // Date in YYYY-MM-DD format
  value: number; // Closing price for the day
}

/**
 * API response structure
 * Returns both candlestick and area formats for flexibility
 */
interface MarketDataResponse {
  candlestick: CandlestickData[]; // Full OHLC data for candlestick charts
  area: AreaData[]; // Close prices only for area charts
  symbol: string; // Stock symbol that was requested
  dataPoints: number; // Number of data points returned
}

/**
 * Yahoo Finance historical data item type
 * Raw format received from yahoo-finance2 library
 */
interface YahooHistoricalData {
  date: Date; // Trading date as Date object
  open: number; // Opening price
  high: number; // High price
  low: number; // Low price
  close: number; // Closing price
  volume: number; // Trading volume
  adjClose?: number; // Adjusted close price (optional)
}

/**
 * Format Yahoo Finance data to chart-compatible format
 *
 * Converts raw Yahoo Finance data to the standardized format expected by chart libraries.
 * Key transformations:
 * - Converts Date objects to YYYY-MM-DD string format
 * - Extracts only OHLC values (discards volume and adjClose)
 * - Sorts data chronologically (oldest to newest)
 *
 * @param data - Array of raw historical data from Yahoo Finance
 * @returns Array of formatted candlestick data points, sorted by date
 */
function formatYahooFinanceData(
  data: YahooHistoricalData[]
): CandlestickData[] {
  return (
    data
      .map((item) => ({
        // Convert Date to string format (YYYY-MM-DD) required by chart libraries
        time: item.date.toISOString().split('T')[0],
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close
      }))
      // Sort by date in ascending order (oldest first)
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
  );
}

/**
 * Convert candlestick data to area chart format
 *
 * Simplifies OHLC data to a single value (close price) for area charts.
 * Area charts only need one price point per time period, so we use the close price
 * as it represents the final settled price for each trading day.
 *
 * @param candlesticks - Array of formatted candlestick data
 * @returns Array of simplified data points with only time and close value
 */
function convertToAreaData(candlesticks: CandlestickData[]): AreaData[] {
  return candlesticks.map((candle) => ({
    time: candle.time,
    value: candle.close // Use close price as the area chart value
  }));
}

/**
 * GET /market - Fetch historical stock market data
 *
 * Query Parameters:
 * - symbol (string): Stock ticker symbol (e.g., "AAPL", "TSLA", "MSFT")
 *   - Defaults to "AAPL" if not provided
 *   - Automatically converted to uppercase
 * - days (number): Number of historical days to fetch (1-365)
 *   - Defaults to 365 if not provided
 *   - Must be within 1-365 range
 *
 * Response Format:
 * - Success (200): { candlestick: [], area: [], symbol: string, dataPoints: number }
 * - Bad Request (400): { error: string } - Invalid parameters
 * - Not Found (404): { error: string } - Symbol doesn't exist
 * - Internal Error (500): { error: string } - Server or API error
 *
 * Examples:
 * - /market?symbol=AAPL&days=30 - Last 30 days of Apple stock
 * - /market?symbol=TSLA - Last 365 days of Tesla stock
 * - /market - Last 365 days of Apple stock (default)
 */
export const get = async (
  req: Request,
  res: Response<MarketDataResponse | { error: string }>
) => {
  try {
    // Extract and validate query parameters
    const symbol = (req.query.symbol as string)?.toUpperCase() || 'AAPL';
    const days = parseInt(req.query.days as string) || 365;

    // Validate symbol parameter
    if (!symbol || symbol.length === 0) {
      return res.status(Status.BadRequest).json({
        error: 'Symbol parameter is required'
      });
    }

    // Validate days parameter (enforce reasonable limits to prevent excessive API calls)
    if (days < 1 || days > 365) {
      return res.status(Status.BadRequest).json({
        error: 'Days must be between 1 and 365'
      });
    }

    console.log(`Fetching ${days} days of data for ${symbol}`);

    // Calculate date range for the API request
    const endDate = new Date(); // Today
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days); // X days ago

    // Fetch historical data from Yahoo Finance
    // interval: '1d' means daily data (one data point per day)
    const result = (await yahooFinance.historical(symbol, {
      period1: startDate, // Start date
      period2: endDate, // End date
      interval: '1d' // Daily interval
    })) as YahooHistoricalData[];

    // Check if we received any data
    if (!result || result.length === 0) {
      return res.status(Status.NotFound).json({
        error: `No data available for symbol: ${symbol}`
      });
    }

    console.log(`Received ${result.length} data points`);

    // Transform Yahoo Finance data to chart-compatible formats
    const candlestickData = formatYahooFinanceData(result); // Full OHLC data
    const areaData = convertToAreaData(candlestickData); // Close prices only

    // Return both formats for maximum frontend flexibility
    return res.status(Status.Ok).json({
      candlestick: candlestickData,
      area: areaData,
      symbol: symbol,
      dataPoints: candlestickData.length
    });
  } catch (error: unknown) {
    console.error('Error fetching market data:', error);

    // Handle specific error cases
    if (error instanceof Error && error.message?.includes('Not Found')) {
      // Symbol doesn't exist (e.g., "INVALIDSTOCKSYMBOL")
      return res.status(Status.NotFound).json({
        error: `Symbol ${req.query.symbol} not found`
      });
    }

    // Generic error for unexpected issues (network problems, API outages, etc.)
    return res.status(Status.InternalServerError).json({
      error: 'Failed to fetch market data'
    });
  }
};
