import StockLogo from './StockLogo';

interface ChartOverlayProps {
  type: 'ohlc' | 'simple';
  data: {
    symbol: string;
    assetName: string;
    time?: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    value?: number;
  };
  interval: number;
  changeAmount: number;
  changePercent: number;
  isPositive: boolean;
  upColor: string;
  downColor: string;
  onIntervalClick: () => void;
}

const ChartOverlay = ({
  type,
  data,
  changeAmount,
  changePercent,
  isPositive,
  upColor,
  downColor,
  interval,
  onIntervalClick
}: ChartOverlayProps) => {
  const indicatorColor = isPositive ? upColor : downColor;

  console.log(data.assetName);
  return (
    <div className="absolute top-2 left-2 flex gap-4 items-center text-sm font-mono bg-card/95 backdrop-blur-sm border border-border p-3 rounded-lg shadow-lg pointer-events-none z-10">
      {data.assetName === 'generated' ? (
        <span className="text-muted-foreground h-min">Generated</span>
      ) : (
        <>
          <StockLogo ticker={data.symbol} />
          <span className="text-muted-foreground">{data.assetName}</span>
        </>
      )}
      {data.time && <span className="text-muted-foreground">{data.time}</span>}
      <button
        className="pointer-events-auto text-foreground hover:font-bold"
        onClick={onIntervalClick}
      >
        {interval}D
      </button>
      {type === 'ohlc' && (
        <>
          <span className="text-muted-foreground">
            O{' '}
            <span className="text-foreground font-semibold">
              {data.open?.toFixed(2)}
            </span>
          </span>
          <span className="text-muted-foreground">
            H{' '}
            <span className="text-foreground font-semibold">
              {data.high?.toFixed(2)}
            </span>
          </span>
          <span className="text-muted-foreground">
            L{' '}
            <span className="text-foreground font-semibold">
              {data.low?.toFixed(2)}
            </span>
          </span>
          <span className="text-muted-foreground">
            C{' '}
            <span className="text-foreground font-semibold">
              {data.close?.toFixed(2)}
            </span>
          </span>
        </>
      )}

      {type === 'simple' && (
        <span className="text-foreground font-bold">
          {data.value?.toFixed(2)}
        </span>
      )}

      <span style={{ color: indicatorColor }} className="font-semibold">
        {isPositive ? '▲' : '▼'} {Math.abs(changeAmount).toFixed(2)} (
        {isPositive ? '+' : ''}
        {changePercent.toFixed(2)}%)
      </span>
    </div>
  );
};

export default ChartOverlay;
