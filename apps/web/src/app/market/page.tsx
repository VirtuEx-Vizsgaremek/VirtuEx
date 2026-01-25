import SideNav from '@/components/Sidenav';
import TradingView from '@/components/TradingView';
import Chart from '@/components/ShadCnChart';

export default function Market() {
  return (
    <div className="flex h-min">
      <SideNav />
      <div className="flex-1 min-h-[70vh] flex flex-col bg-muted/30 m-8 rounded-xl shadow-lg border border-gray h-min p-8">
        <h1 className="text-2xl font-bold mb-6">Market Page</h1>
        <TradingView />
        <Chart />
      </div>
    </div>
  );
}
