'use client';
import { generateTradingViewChartData } from '@/lib/dataGenerator';
import { AreaSeries, ColorType, createChart } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function TradingView() {
  const { theme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState(() =>
    generateTradingViewChartData(365, new Date('2024-01-01'), 100)
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Regenerate data
  const handleRegenerateData = () => {
    setData(generateTradingViewChartData(365, new Date('2024-01-01'), 100));
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

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#2962FF',
      topColor: '#2962FF',
      bottomColor: 'rgba(41, 98, 255, 0.28)'
    });

    seriesRef.current = areaSeries;
    areaSeries.setData(data);
    chart.timeScale().fitContent();

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
  }, [isClient]);

  // Update data when it changes
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data);
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [data]);

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
      <button
        onClick={handleRegenerateData}
        className="mb-4 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Regenerate Chart Data
      </button>
      <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }} />
    </div>
  );
}
