import { describe, it, expect } from 'vitest';
import {
  calculateChange,
  getPreviousValue,
  calculateOHLCChange,
  calculateAreaChange
} from '@/lib/chartCalculations';

// ── calculateChange ────────────────────────────────────────────────────────────

describe('calculateChange', () => {
  it('returns positive changeAmount and isPositive=true when price rises', () => {
    const result = calculateChange({ currentValue: 110, previousValue: 100 });
    expect(result.changeAmount).toBe(10);
    expect(result.isPositive).toBe(true);
  });

  it('returns negative changeAmount and isPositive=false when price falls', () => {
    const result = calculateChange({ currentValue: 90, previousValue: 100 });
    expect(result.changeAmount).toBe(-10);
    expect(result.isPositive).toBe(false);
  });

  it('returns zero changeAmount and isPositive=true when price is unchanged', () => {
    const result = calculateChange({ currentValue: 100, previousValue: 100 });
    expect(result.changeAmount).toBe(0);
    expect(result.isPositive).toBe(true);
  });

  it('computes the correct percentage change', () => {
    const result = calculateChange({ currentValue: 110, previousValue: 100 });
    expect(result.changePercent).toBeCloseTo(10, 5);
  });

  it('computes negative percentage correctly', () => {
    const result = calculateChange({ currentValue: 75, previousValue: 100 });
    expect(result.changePercent).toBeCloseTo(-25, 5);
  });
});

// ── getPreviousValue ───────────────────────────────────────────────────────────

describe('getPreviousValue', () => {
  const areaData = [
    { time: '2024-01-01', value: 100 },
    { time: '2024-01-02', value: 110 },
    { time: '2024-01-03', value: 120 }
  ];

  it('returns null for the first item (no previous)', () => {
    expect(getPreviousValue(areaData, '2024-01-01', 'value')).toBeNull();
  });

  it('returns the previous item value for a middle entry', () => {
    expect(getPreviousValue(areaData, '2024-01-02', 'value')).toBe(100);
  });

  it('returns the previous item value for the last entry', () => {
    expect(getPreviousValue(areaData, '2024-01-03', 'value')).toBe(110);
  });

  it('returns null when the time is not found in the dataset', () => {
    expect(getPreviousValue(areaData, '2024-01-99', 'value')).toBeNull();
  });

  it('works with object time format {year, month, day}', () => {
    const objData = [
      { time: { year: 2024, month: 1, day: 1 }, value: 50 },
      { time: { year: 2024, month: 1, day: 2 }, value: 60 }
    ];
    expect(
      getPreviousValue(objData, { year: 2024, month: 1, day: 2 }, 'value')
    ).toBe(50);
  });

  it('pads single-digit month and day correctly in object format', () => {
    const objData = [
      { time: { year: 2024, month: 9, day: 5 }, value: 200 },
      { time: { year: 2024, month: 9, day: 6 }, value: 210 }
    ];
    expect(
      getPreviousValue(objData, { year: 2024, month: 9, day: 6 }, 'value')
    ).toBe(200);
  });

  it('works with OHLC (candlestick) data using "close" key', () => {
    const candleData = [
      { time: '2024-01-01', close: 150 },
      { time: '2024-01-02', close: 155 }
    ];
    expect(getPreviousValue(candleData, '2024-01-02', 'close')).toBe(150);
  });

  it('returns null for first candlestick entry', () => {
    const candleData = [
      { time: '2024-01-01', close: 150 },
      { time: '2024-01-02', close: 155 }
    ];
    expect(getPreviousValue(candleData, '2024-01-01', 'close')).toBeNull();
  });
});

// ── calculateOHLCChange ────────────────────────────────────────────────────────

describe('calculateOHLCChange', () => {
  const history = [
    { time: '2024-01-01', close: 100 },
    { time: '2024-01-02', close: 110 },
    { time: '2024-01-03', close: 105 }
  ];

  it('uses previous day close as the reference when available', () => {
    const currentCandle = { open: 109, close: 105, time: '2024-01-03' };
    const result = calculateOHLCChange(currentCandle, history);
    // 105 vs previous close 110 → -4.545...%
    expect(result.changeAmount).toBeCloseTo(105 - 110, 5);
    expect(result.isPositive).toBe(false);
  });

  it('falls back to current candle open when there is no previous candle', () => {
    const currentCandle = { open: 95, close: 100, time: '2024-01-01' };
    const result = calculateOHLCChange(currentCandle, history);
    // 100 vs open 95 → +5
    expect(result.changeAmount).toBeCloseTo(5, 5);
    expect(result.isPositive).toBe(true);
  });

  it('correctly identifies a positive day', () => {
    const currentCandle = { open: 100, close: 110, time: '2024-01-02' };
    const result = calculateOHLCChange(currentCandle, history);
    expect(result.isPositive).toBe(true);
    expect(result.changePercent).toBeCloseTo(10, 5);
  });
});

// ── calculateAreaChange ────────────────────────────────────────────────────────

describe('calculateAreaChange', () => {
  const areaData = [
    { time: '2024-01-01', value: 200 },
    { time: '2024-01-02', value: 220 },
    { time: '2024-01-03', value: 210 }
  ];

  it('uses previous value as reference when available', () => {
    const current = { value: 210, time: '2024-01-03' };
    const result = calculateAreaChange(current, areaData);
    expect(result.changeAmount).toBeCloseTo(210 - 220, 5);
    expect(result.isPositive).toBe(false);
  });

  it('returns 0% change for the very first data point (fallback to self)', () => {
    const current = { value: 200, time: '2024-01-01' };
    const result = calculateAreaChange(current, areaData);
    expect(result.changeAmount).toBe(0);
    expect(result.changePercent).toBe(0);
    expect(result.isPositive).toBe(true);
  });

  it('correctly identifies a positive change', () => {
    const current = { value: 220, time: '2024-01-02' };
    const result = calculateAreaChange(current, areaData);
    expect(result.isPositive).toBe(true);
    expect(result.changePercent).toBeCloseTo(10, 5);
  });
});
