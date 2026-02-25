/**
 * Market API Service
 *
 * Frontend service layer for fetching stock market data from the backend API.
 * This service abstracts the API communication and provides type-safe data fetching.
 *
 * Features:
 * - Type-safe API calls with TypeScript interfaces
 * - Environment-based API URL configuration
 * - Comprehensive error handling
 * - Reusable across multiple components
 *
 * Configuration:
 * - Set NEXT_PUBLIC_API_URL in .env.local (e.g., http://localhost:3001)
 * - Falls back to http://localhost:3001 if not set
 */

/**
 * Candlestick data structure for OHLC charts
 */
interface CandlestickData {
  time: string; // Date string (YYYY-MM-DD)
  open: number; // Opening price
  high: number; // Highest price
  low: number; // Lowest price
  close: number; // Closing price
}

/**
 * Area chart data structure (simplified format)
 */
interface AreaData {
  time: string; // Date string (YYYY-MM-DD)
  value: number; // Price value (typically close price)
}

/**
 * Complete API response structure
 */
interface MarketDataResponse {
  candlestick: CandlestickData[]; // Full OHLC data array
  area: AreaData[]; // Simplified close price array
  symbol: string; // Stock symbol (e.g., "AAPL")
  dataPoints: number; // Number of data points returned
}

/**
 * Fetch stock market data from the backend API
 *
 * Makes an HTTP GET request to the backend /market endpoint to retrieve
 * historical stock data for charting and analysis.
 *
 * @param symbol - Stock ticker symbol (e.g., "AAPL", "TSLA", "MSFT")
 *                 Should be a valid stock symbol; invalid symbols will cause 404 error
 * @param days - Number of historical days to fetch (default: 365)
 *               Valid range: 1-365 days
 *
 * @returns Promise resolving to MarketDataResponse with both candlestick and area data
 *
 * @throws Error with user-friendly message if:
 *         - Network request fails
 *         - Backend returns error status (400, 404, 500)
 *         - Symbol doesn't exist
 *         - Response parsing fails
 *
 * Example Usage:
 * ```typescript
 * try {
 *   const data = await fetchMarketData('AAPL', 30);
 *   console.log(data.candlestick); // 30 days of OHLC data
 * } catch (error) {
 *   console.error('Failed to load data:', error.message);
 * }
 * ```
 */
export async function fetchMarketData(
  symbol: string,
  days: number = 365
): Promise<MarketDataResponse> {
  // Get API URL from environment variable or use localhost default
  // NEXT_PUBLIC_ prefix makes it accessible in browser
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  try {
    // Build query string and make HTTP GET request
    const response = await fetch(
      `${apiUrl}/market?symbol=${symbol}&days=${days}`
    );

    // Check if response status indicates success (200-299)
    if (!response.ok) {
      // Try to extract error message from response body
      const errorData = await response
        .json()
        .catch(() => ({ error: 'Unknown error' })); // Fallback if JSON parsing fails

      // Throw error with backend's error message or generic HTTP status
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    // Parse successful response as JSON
    const data: MarketDataResponse = await response.json();
    return data;
  } catch (error) {
    // Log error for debugging (visible in browser console)
    console.error('Error fetching market data:', error);

    // Re-throw error so calling code can handle it
    // This allows components to show user-friendly error messages
    throw error;
  }
}
