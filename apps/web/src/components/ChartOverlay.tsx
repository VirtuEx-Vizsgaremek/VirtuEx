interface ChartOverlayProps {
  type: 'ohlc' | 'simple';
  data: {
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    value?: number;
  };
  changeAmount: number;
  changePercent: number;
  isPositive: boolean;
  upColor: string;
  downColor: string;
}

const ChartOverlay = ({
  type,
  data,
  changeAmount,
  changePercent,
  isPositive,
  upColor,
  downColor
}: ChartOverlayProps) => {
  const indicatorColor = isPositive ? upColor : downColor;

  return (
    <div className="absolute top-2 left-2 flex gap-4 text-sm font-mono bg-card/95 backdrop-blur-sm border border-border p-3 rounded-lg shadow-lg pointer-events-none z-10">
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
