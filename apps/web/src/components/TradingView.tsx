'use client';
import { useTheme } from '@/contexts/ThemeContext';
import {
  generateCandlestickData,
  generateTradingViewChartData
} from '@/lib/dataGenerator';
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  createChart
} from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import ChartOverlay from './ChartOverlay';
import {
  calculateOHLCChange,
  calculateAreaChange
} from '@/lib/chartCalculations';

type chartType = 'area' | 'candle';
type OHLCData = {
  open: number;
  high: number;
  low: number;
  close: number;
  time: string;
} | null;
type AreaData = {
  value: number;
  time: string;
} | null;

export default function TradingView() {
  const { theme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [areaData, setAreaData] = useState(() =>
    generateTradingViewChartData(365, new Date('2024-01-01'), 100)
  );
  const [candleData, setCandleData] = useState(() =>
    generateCandlestickData(365, new Date('2024-01-01'), 100)
  );
  const [chartType, setChartType] = useState<chartType>('area');
  const [ohlcData, setOhlcData] = useState<OHLCData>(null);
  const [areaDisplayData, setAreaDisplayData] = useState<AreaData>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Regenerate data
  const handleRegenerateData = () => {
    setAreaData(
      generateTradingViewChartData(365, new Date('2024-01-01'), 10000)
    );
    setCandleData(generateCandlestickData(365, new Date('2024-01-01'), 10000));
  };

  const handleToggleChartType = () => {
    setChartType((prev) => (prev === 'area' ? 'candle' : 'area'));
  };

  useEffect(() => {
    if (!chartContainerRef.current || !isClient) return;

    // Prevent double initialization in React Strict Mode
    if (chartRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        textColor: theme === 'dark' ? '#D1D5DB' : '#1F2937',
        background: {
          type: ColorType.Solid,
          color: theme === 'dark' ? '#1F2937' : '#FFFFFF'
        }
      },
      grid: {
        vertLines: {
          color: theme === 'dark' ? '#374151' : '#E5E7EB'
        },
        horzLines: {
          color: theme === 'dark' ? '#374151' : '#E5E7EB'
        }
      }
    });

    chartRef.current = chart;

    chart.subscribeCrosshairMove((param: any) => {
      if (!param.time || !param.seriesData || !seriesRef.current) {
        return;
      }

      const data = param.seriesData.get(seriesRef.current);
      if (!data) {
        return;
      }

      // Always update, let the JSX decide whether to show it
      if (data.open !== undefined) {
        // Candlestick data
        setOhlcData({
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          time: param.time
        });
      } else if (data.value !== undefined) {
        setAreaDisplayData({
          value: data.value,
          time: param.time
        });
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [isClient, theme]);

  useEffect(() => {
    if (!chartRef.current || !isClient) return;

    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    if (chartType === 'area') {
      setOhlcData(null);

      const areaSeries = chartRef.current.addSeries(AreaSeries, {
        lineColor: '#2962FF',
        topColor: '#2962FF',
        bottomColor: 'rgba(41, 98, 255, 0.28)'
      });
      seriesRef.current = areaSeries;
      areaSeries.setData(areaData);
      if (areaData.length > 0) {
        const lastData = areaData[areaData.length - 1];
        setAreaDisplayData({
          value: lastData.value,
          time: lastData.time
        });
      }
    } else {
      setAreaDisplayData(null);

      const candleSeries = chartRef.current.addSeries(CandlestickSeries, {
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350'
      });
      seriesRef.current = candleSeries;
      candleSeries.setData(candleData);

      if (candleData.length > 0) {
        const lastCandle = candleData[candleData.length - 1];
        setOhlcData({
          open: lastCandle.open,
          high: lastCandle.high,
          low: lastCandle.low,
          close: lastCandle.close,
          time: lastCandle.time
        });
      }
    }

    chartRef.current.timeScale().fitContent();
  }, [chartType, isClient, areaData, candleData, theme]);

  // Update chart theme when theme changes (WITHOUT recreating chart)
  useEffect(() => {
    if (chartRef.current && isClient) {
      chartRef.current.applyOptions({
        layout: {
          textColor: theme === 'dark' ? '#D1D5DB' : '#1F2937',
          background: {
            type: ColorType.Solid,
            color: theme === 'dark' ? '#1F2937' : '#FFFFFF'
          }
        },
        grid: {
          vertLines: {
            color: theme === 'dark' ? '#374151' : '#E5E7EB'
          },
          horzLines: {
            color: theme === 'dark' ? '#374151' : '#E5E7EB'
          }
        }
      });
    }
  }, [theme, isClient]);

  if (!isClient) {
    return (
      <div className="w-full h-[400px] bg-white dark:bg-gray-800 rounded-lg" />
    );
  }

  return (
    <div className="m-5">
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleRegenerateData}
          className=" px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Regenerate Chart Data
        </button>
        <button
          onClick={handleToggleChartType}
          className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Switch to {chartType === 'area' ? 'Candlestick' : 'Area'} Chart
        </button>
      </div>

      <div className="relative w-full h-[400px]">
        {/* The chart - always rendered */}
        <div ref={chartContainerRef} className="w-full h-[400px]" />

        {/* OHLC overlay - only when data exists and on candle chart */}
        {ohlcData &&
          chartType === 'candle' &&
          (() => {
            const { changeAmount, changePercent, isPositive } =
              calculateOHLCChange(ohlcData, candleData);

            return (
              <ChartOverlay
                type="ohlc"
                data={{
                  open: ohlcData.open,
                  high: ohlcData.high,
                  low: ohlcData.low,
                  close: ohlcData.close
                }}
                changeAmount={changeAmount}
                changePercent={changePercent}
                isPositive={isPositive}
              />
            );
          })()}

        {areaDisplayData &&
          chartType === 'area' &&
          (() => {
            const { changeAmount, changePercent, isPositive } =
              calculateAreaChange(areaDisplayData, areaData);

            return (
              <ChartOverlay
                type="simple"
                data={{ value: areaDisplayData.value }}
                changeAmount={changeAmount}
                changePercent={changePercent}
                isPositive={isPositive}
              />
            );
          })()}
      </div>
    </div>
  );
}
