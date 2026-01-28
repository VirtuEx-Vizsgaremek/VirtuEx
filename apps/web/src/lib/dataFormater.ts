// Helper function to transform Finnhub data for Lightweight Charts
interface FinnhubResponse {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  s: string; // Status ('ok' or 'no_data')
  t: number[]; // Timestamps
  v: number[]; // Volume
}

interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export const formatDataForChart = (
  finnhubData: FinnhubResponse
): ChartData[] => {
  if (finnhubData.s !== 'ok') return [];

  return finnhubData.t.map((timestamp, index) => ({
    time: timestamp,
    open: finnhubData.o[index],
    high: finnhubData.h[index],
    low: finnhubData.l[index],
    close: finnhubData.c[index]
  }));
};
