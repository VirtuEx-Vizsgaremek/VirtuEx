'use client';

import { useState, useEffect } from 'react';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle
} from '@/components/ui/item';
import SideNav from '@/components/sidenav';
import { useRouter } from 'next/navigation';
import { getMyWallet, getMyWalletHistory } from '@/lib/actions';

export default function WalletPage() {
  const [walletData, setWalletData] = useState<any>(null);
  const [transactionsData, setTransactionsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadWallet() {
      try {
        const [wallet, transactions] = await Promise.all([
          getMyWallet(),
          getMyWalletHistory()
        ]);
        setWalletData(wallet);
        setTransactionsData(transactions);
      } catch (err: any) {
        if (err.message === 'Not authenticated') {
          router.push('/auth/login');
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadWallet();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading wallet data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-destructive">Error: {error}</div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">No wallet data available</div>
      </div>
    );
  }

  const dashboardAssets = walletData.assets || [];
  const transactions = transactionsData?.transactions || [];

  const totalBalance = dashboardAssets.reduce((sum: number, asset: any) => {
    const rawAmount = BigInt(asset.amount);
    const divisor = Math.pow(10, asset.precision);
    const normalizedAmount = Number(rawAmount) / divisor;
    return sum + normalizedAmount * (asset.price ?? 0);
  }, 0);

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(totalBalance);

  return (
    <div>
      <div className="max-w-[95vw] lg:max-w-[80vw] mx-auto my-4 md:my-10 px-2 md:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-4 lg:gap-6 items-stretch">
          <div className="lg:self-stretch">
            <SideNav />
          </div>

          <main className="text-base md:text-lg">
            <Card className="w-full col-span-2 shadow-lg border-border bg-card overflow-hidden mb-6 md:mb-10">
              <ItemGroup className="px-4 md:px-6">
                {
                  <Item>
                    <div className="flex items-center gap-4 md:gap-8">
                      <ItemContent className="space-y-1">
                        <ItemTitle className="text-2xl md:text-3xl lg:text-4xl mb-1 md:mb-2 font-extrabold text-foreground tracking-tight">
                          Estimated Balance
                        </ItemTitle>
                        <div className="flex items-center gap-2">
                          <ItemDescription className="text-base md:text-lg font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {formattedBalance}
                          </ItemDescription>
                        </div>
                      </ItemContent>
                    </div>
                  </Item>
                }
              </ItemGroup>
            </Card>

            {/*Assets now*/}
            <Card className="w-full shadow-lg border-border bg-card overflow-hidden my-6 md:my-10">
              <CardHeader className="text-left pb-2 px-4 md:px-6">
                <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
                  Your Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="flex flex-col">
                  {/* Desktop header */}
                  <div className="hidden md:grid grid-cols-4 px-4 md:px-6 py-3 bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-1">Asset</div>
                    <div className="text-right">Price</div>
                    <div className="text-right">Balance</div>
                    <div className="text-right">Value (USD)</div>
                  </div>

                  <div className="divide-y divide-border max-h-[350px] overflow-y-auto">
                    {dashboardAssets.map((asset: any) => {
                      const rawAmount = BigInt(asset.amount);
                      const divisor = Math.pow(10, asset.precision);
                      const realBalance = Number(rawAmount) / divisor;
                      const currentPrice = asset.price ?? 0;
                      const totalValue = realBalance * currentPrice;

                      return (
                        <div
                          key={asset.id}
                          className="md:grid md:grid-cols-4 items-center px-4 md:px-6 py-4 hover:bg-muted transition-colors"
                        >
                          {/* Mobile layout */}
                          <div className="md:col-span-1 flex items-center justify-between md:justify-start gap-3 mb-3 md:mb-0">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {/*TODO: real symbol of currency*/}
                                {asset.symbol[0]}
                              </div>
                              <div>
                                <div className="font-bold text-foreground">
                                  {asset.symbol}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {asset.currency}
                                </div>
                              </div>
                            </div>
                            <div className="md:hidden text-right font-bold text-foreground">
                              {currentPrice > 0
                                ? new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                  }).format(totalValue)
                                : '—'}
                            </div>
                          </div>

                          {/* Desktop price */}
                          <div className="hidden md:block text-right">
                            <div className="font-medium text-foreground text-sm">
                              {currentPrice > 0
                                ? new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits:
                                      currentPrice < 1 ? 6 : 2
                                  }).format(currentPrice)
                                : '—'}
                            </div>
                          </div>

                          {/* Mobile/Desktop balance */}
                          <div className="md:text-right text-muted-foreground font-mono text-sm flex justify-between md:block">
                            <span className="md:hidden text-xs text-muted-foreground">
                              Balance:
                            </span>
                            <span>
                              {new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: asset.precision
                              }).format(realBalance)}{' '}
                              {asset.symbol}
                            </span>
                          </div>

                          {/* Desktop value */}
                          <div className="hidden md:block text-right font-bold text-foreground">
                            {currentPrice > 0
                              ? new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD'
                                }).format(totalValue)
                              : '—'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/*Transaction history*/}
            <Card className="w-full shadow-lg border-border bg-card overflow-hidden">
              <CardHeader className="text-left pb-2 px-4 md:px-6">
                <CardTitle className="w-full text-xl md:text-2xl font-bold text-foreground">
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions yet
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {/* Desktop header */}
                    <div className="hidden md:grid grid-cols-5 px-4 md:px-6 py-3 bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <div className="col-span-1">Asset</div>
                      <div className="text-right">Type</div>
                      <div className="text-right">Amount</div>
                      <div className="text-right">Status</div>
                      <div className="text-right">Date</div>
                    </div>

                    <div className="divide-y divide-border max-h-[350px] overflow-y-auto">
                      {transactions.map((tx: any) => {
                        // Find the asset details for precision
                        const asset = dashboardAssets.find(
                          (a: any) => a.id === tx.asset_id
                        );
                        const precision = asset?.precision || 8;

                        const rawAmount = BigInt(tx.amount);
                        const divisor = Math.pow(10, precision);
                        const realAmount = Number(rawAmount) / divisor;

                        const isIncoming = tx.direction === 'in';
                        const statusClasses =
                          tx.status === 'completed'
                            ? 'text-primary bg-primary/10'
                            : tx.status === 'failed'
                              ? 'text-destructive bg-destructive/10'
                              : 'text-muted-foreground bg-muted';

                        return (
                          <div
                            key={tx.id}
                            className="md:grid md:grid-cols-5 items-start md:items-center px-4 md:px-6 py-4 hover:bg-muted transition-colors"
                          >
                            {/* Mobile: Asset and Status row */}
                            <div className="md:col-span-1 flex items-center justify-between md:justify-start gap-3 mb-2 md:mb-0">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                    isIncoming
                                      ? 'bg-primary/10 text-primary'
                                      : 'bg-destructive/10 text-destructive'
                                  }`}
                                >
                                  {tx.symbol[0]}
                                </div>
                                <div>
                                  <div className="font-bold text-foreground text-sm md:text-base">
                                    {tx.symbol}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {tx.currency}
                                  </div>
                                </div>
                              </div>
                              <div className="md:hidden">
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded ${statusClasses}`}
                                >
                                  {tx.status.toUpperCase()}
                                </span>
                              </div>
                            </div>

                            {/* Desktop: Type */}
                            <div className="hidden md:block text-right">
                              <div
                                className={`font-medium ${isIncoming ? 'text-primary' : 'text-destructive'}`}
                              >
                                {isIncoming ? '↓ IN' : '↑ OUT'}
                              </div>
                            </div>

                            {/* Mobile/Desktop: Amount and Type */}
                            <div className="md:text-right flex justify-between md:block mb-1 md:mb-0">
                              <div className="md:hidden flex items-center gap-2">
                                <span
                                  className={`font-medium text-sm ${isIncoming ? 'text-primary' : 'text-destructive'}`}
                                >
                                  {isIncoming ? '↓ IN' : '↑ OUT'}
                                </span>
                              </div>
                              <div className="font-mono text-sm text-muted-foreground">
                                {isIncoming ? '+' : '-'}
                                {realAmount.toLocaleString(undefined, {
                                  maximumFractionDigits: precision
                                })}{' '}
                                {tx.symbol}
                              </div>
                            </div>

                            {/* Desktop: Status */}
                            <div className="hidden md:block text-right">
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded ${statusClasses}`}
                              >
                                {tx.status.toUpperCase()}
                              </span>
                            </div>

                            {/* Mobile/Desktop: Date */}
                            <div className="md:text-right text-xs text-muted-foreground">
                              {new Date(tx.created_at).toLocaleDateString()}
                              <span className="hidden md:inline">
                                <br />
                                {new Date(tx.created_at).toLocaleTimeString()}
                              </span>
                              <span className="md:hidden ml-2">
                                {new Date(tx.created_at).toLocaleTimeString(
                                  [],
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
