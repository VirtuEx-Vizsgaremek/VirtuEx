import Status from '@/enum/status';
import { Request, Response } from '@/util/handler';
import { tr } from 'zod/v4/locales';

// Finnhub API service for fetching real-time stock data

interface FinnhubResponse {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  s: string; // Status ('ok' or 'no_data')
  t: number[]; // Timestamps
  v: number[]; // Volume
}

interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface AreaData {
  time: string;
  value: number;
}

interface MarketDataResponse {
  candlestick: CandlestickData[];
  area: AreaData[];
  symbol: string;
  dataPoints: number;
}

function formatToChartData(finnhubData: FinnhubResponse): CandlestickData[] {
  if (finnhubData.s !== 'ok' || !finnhubData.t) {
    return [];
  }

  return finnhubData.t.map((timestamp, index) => {
    return {
      time: new Date(timestamp * 1000).toISOString().split('T')[0],
      open: finnhubData.o[index],
      high: finnhubData.h[index],
      low: finnhubData.l[index],
      close: finnhubData.c[index]
    };
  });
}

function convertToAreaData(candlesticks: CandlestickData[]): AreaData[] {
  return candlesticks.map((candle) => ({
    time: candle.time,
    value: candle.close
  }));
}

export const get = async (
  req: Request,
  res: Response<MarketDataResponse | { error: string }>
) => {
  try {
    const symbol = (req.query.symbol as string)?.toUpperCase() || 'AAPL';
    const days = parseInt(req.query.days as string) || 365;

    if (!symbol || symbol.length === 0) {
      return res.status(Status.BadRequest).json({
        error: 'Symbol parameter is required'
      });
    }

    if (days < 1 || days > 365) {
      return res.status(Status.BadRequest).json({
        error: 'Days must be between 1 and 365'
      });
    }

    console.log(`Fetching ${days} days of data for ${symbol}`);

    const nowInMilliseconds = Date.now();
    const to = Math.floor(nowInMilliseconds / 1000);
    const from = to - days * 24 * 60 * 60;

    console.log(
      `Date range: from ${new Date(from * 1000).toISOString()} to ${new Date(to * 1000).toISOString()}`
    );

    const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

    if (!FINNHUB_API_KEY) {
      return res.status(Status.InternalServerError).json({
        error: 'Finnhub API key not configured on server'
      });
    }

    const finnhubUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;

    console.log(
      `Calling Finnhub API: ${finnhubUrl.replace(FINNHUB_API_KEY, '***')}`
    );

    const response = await fetch(finnhubUrl);

    console.log(`Finnhub response status: ${response.status}`);

    if (!response.ok) {
      return res.status(Status.BadGateway).json({
        error: `Finnhub API error: ${response.status} ${response.statusText}`
      });
    }

    const finnhubData: FinnhubResponse = await response.json();

    console.log(
      `Received ${finnhubData.t?.length || 0} data points from Finnhub`
    );

    if (finnhubData.s === 'no_data') {
      return res.status(Status.NotFound).json({
        error: `No data available for symbol: ${symbol}`
      });
    }

    const candlestickData = formatToChartData(finnhubData);
    const areaData = convertToAreaData(candlestickData);

    console.log(
      `Formatted ${candlestickData.length} candlesticks and ${areaData.length} area points`
    );

    return res.status(Status.Ok).json({
      candlestick: candlestickData,
      area: areaData,
      symbol: symbol,
      dataPoints: candlestickData.length
    });
  } catch (error) {
    console.error('Error fetching market data: ', error);

    return res.status(Status.InternalServerError).json({
      error: 'Failed to fetch market data. Please try again later.'
    });
  }
};
