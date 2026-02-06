/**
 * Simple Asset Chart Component (Free/Premium Fallback)
 *
 * Displays a simple multi-asset price chart using Recharts library.
 * Used as fallback on /market page when premium mode is disabled.
 *
 * Features:
 * - Area chart visualization for multiple crypto assets (BTC, ETH, ADA)
 * - Time range selector (7d, 30d, 90d, 365d)
 * - Regenerate mock data button
 * - Asset selection dropdown
 * - Zoom controls with pan functionality
 * - Responsive design with legend
 *
 * Data:
 * - Uses generateShadCnChartData() from dataGenerator.ts
 * - Generates mock price history for 3 assets
 * - Updates independently from TradingView component
 *
 * Limitations:
 * - No real API data (always mock)
 * - Simpler UI compared to TradingView
 * - No crosshair hover overlays
 * - No OHLC support (area chart only)
 *
 * Used by:
 * - Market page when isPremium === false
 * - Provides basic charting for free tier users
 */

'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { generateShadCnChartData } from '@/lib/dataGenerator';

export const description = 'Asset price chart';

// Define your assets here
const ASSETS = [
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    initialPrice: 40000,
    color: 'hsl(39, 100%, 50%)'
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    initialPrice: 2000,
    color: 'hsl(206, 100%, 50%)'
  },
  {
    name: 'Cardano',
    symbol: 'ADA',
    initialPrice: 0.5,
    color: 'hsl(210, 100%, 50%)'
  }
];

export default function AssetChart() {
  const [timeRange, setTimeRange] = React.useState('365d');
  const [selectedAsset, setSelectedAsset] = React.useState('BTC');
  const [chartData, setChartData] = React.useState(() =>
    generateShadCnChartData(365, new Date('2024-01-01'), ASSETS)
  );
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [startIndex, setStartIndex] = React.useState(0);

  const handleRegenerateData = () => {
    setChartData(generateShadCnChartData(365, new Date('2024-01-01'), ASSETS));
    setZoomLevel(1);
    setStartIndex(0);
  };

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date(chartData[chartData.length - 1].date);
    let daysToSubtract = 365;
    if (timeRange === '90d') {
      daysToSubtract = 90;
    } else if (timeRange === '30d') {
      daysToSubtract = 30;
    } else if (timeRange === '7d') {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  // Calculate visible data based on zoom
  const visibleDataCount = Math.max(
    10,
    Math.floor(filteredData.length / zoomLevel)
  );
  const maxStartIndex = Math.max(0, filteredData.length - visibleDataCount);
  const adjustedStartIndex = Math.min(startIndex, maxStartIndex);
  const visibleData = filteredData.slice(
    adjustedStartIndex,
    adjustedStartIndex + visibleDataCount
  );

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 1, 10));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 1, 1));
  };

  const handleScroll = (direction: 'left' | 'right') => {
    const scrollAmount = Math.floor(visibleDataCount / 4);
    if (direction === 'left') {
      setStartIndex((prev) => Math.max(prev - scrollAmount, 0));
    } else {
      setStartIndex((prev) => Math.min(prev + scrollAmount, maxStartIndex));
    }
  };

  const currentAsset = ASSETS.find((a) => a.symbol === selectedAsset)!;

  const chartConfig = {
    [selectedAsset]: {
      label: currentAsset.name,
      color: currentAsset.color
    }
  } satisfies ChartConfig;

  return (
    <Card className="pt-0 h-full flex flex-col">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-col sm:items-start lg:flex-row lg:items-center">
        <div className="grid flex-1 gap-1">
          <CardTitle>Asset Price Chart - {currentAsset.name}</CardTitle>
          <CardDescription>
            Tracking {currentAsset.name} price over time
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-[140px] rounded-lg">
              <SelectValue placeholder="Select Asset" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {ASSETS.map((asset) => (
                <SelectItem
                  key={asset.symbol}
                  value={asset.symbol}
                  className="rounded-lg"
                >
                  {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={handleRegenerateData}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Regenerate
          </button>
          <button
            onClick={handleZoomIn}
            className="px-3 py-2 text-sm bg-gray-300 text-black rounded-lg hover:bg-gray-400"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="px-3 py-2 text-sm bg-gray-300 text-black rounded-lg hover:bg-gray-400"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={() => handleScroll('left')}
            className="px-3 py-2 text-sm bg-gray-300 text-black rounded-lg hover:bg-gray-400"
            title="Scroll Left"
          >
            ←
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="px-3 py-2 text-sm bg-gray-300 text-black rounded-lg hover:bg-gray-400"
            title="Scroll Right"
          >
            →
          </button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px] rounded-lg">
              <SelectValue placeholder="Last 12 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="365d" className="rounded-lg">
                Last 12 months
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 flex-1 min-h-0">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-full w-full"
        >
          <AreaChart
            data={visibleData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`fill-${selectedAsset}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={currentAsset.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={currentAsset.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short'
                })}
                   '${date.getFullYear().toString().slice(-2)}`;
              }}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => {
                if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
                return `$${value.toFixed(2)}`;
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                  }}
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey={selectedAsset}
              type="linear"
              fill={`url(#fill-${selectedAsset})`}
              stroke={currentAsset.color}
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
