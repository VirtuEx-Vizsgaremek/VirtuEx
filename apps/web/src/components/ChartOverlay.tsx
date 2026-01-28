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
}

const ChartOverlay = ({
  type,
  data,
  changeAmount,
  changePercent,
  isPositive
}: ChartOverlayProps) => {
  return (
    <div className="absolute top-2 left-2 flex gap-4 text-sm font-mono bg-white dark:bg-gray-800 p-2 rounded shadow-sm pointer-events-none z-10">
      {type === 'ohlc' && (
        <>
          <span className="text-gray-600 dark:text-gray-400">
            O{' '}
            <span className="text-gray-900 dark:text-gray-100">
              {data.open?.toFixed(2)}
            </span>
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            H{' '}
            <span className="text-gray-900 dark:text-gray-100">
              {data.high?.toFixed(2)}
            </span>
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            L{' '}
            <span className="text-gray-900 dark:text-gray-100">
              {data.low?.toFixed(2)}
            </span>
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            C{' '}
            <span className="text-gray-900 dark:text-gray-100">
              {data.close?.toFixed(2)}
            </span>
          </span>
        </>
      )}

      {type === 'simple' && (
        <span className="text-gray-900 dark:text-gray-100 font-bold">
          {data.value?.toFixed(2)}
        </span>
      )}

      <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
        {isPositive ? '▲' : '▼'} {Math.abs(changeAmount).toFixed(2)} (
        {isPositive ? '+' : ''}
        {changePercent.toFixed(2)}%)
      </span>
    </div>
  );
};

export default ChartOverlay;
