'use client';
import Chart from '@/components/ShadCnChart';
import AssetNav from '@/components/AssetNav';
import TradingView from '@/components/TradingView';
import { useState } from 'react';

export default function Market() {
  const [selectedSymbol, setSelectedSymbol] = useState('');

  return (
    <div className="flex h-min">
      <AssetNav
        selectedSymbol={selectedSymbol}
        onSelectSymbol={setSelectedSymbol}
      />
      <div className="flex-1 min-h-[70vh] flex flex-col bg-muted/30 m-8 rounded-xl shadow-lg border border-gray h-min p-8">
        <h1 className="text-2xl font-bold mb-6">Market Page</h1>
        <TradingView
          symbol={selectedSymbol}
          onClearSelection={() => setSelectedSymbol('')}
        />
        <Chart />
      </div>
    </div>
  );
}
