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
import { fetchWalletData } from '@/lib/api/wallet';

export default function WalletPage() {
  const [walletData, setWalletData] = useState<any>(null);
  const [transactionsData, setTransactionsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWallet() {
      try {
        const { wallet, transactions } = await fetchWalletData();
        setWalletData(wallet);
        setTransactionsData(transactions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadWallet();
  }, []);

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
    return sum + normalizedAmount;
  }, 0);

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(totalBalance);

  return (
    <div>
      <div className="max-w-[80vw] mx-auto my-10 px-4">
        <div className="grid grid-cols-[250px_1fr] gap-6">
          <SideNav />

          <main className="text-lg">
            <Card className="w-full col-span-2 shadow-lg border-border bg-card overflow-hidden mb-10">
              <ItemGroup className="px-6">
                {
                  <Item>
                    <div className="flex items-center gap-8">
                      <ItemContent className="space-y-1">
                        <ItemTitle className="text-4xl mb-2 font-extrabold text-foreground tracking-tight">
                          Estimated Balance
                        </ItemTitle>
                        <div className="flex items-center gap-2">
                          <ItemDescription className="text-lg font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
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
            <Card className="w-full shadow-lg border-border bg-card overflow-hidden my-10">
              <CardHeader className="text-left pb-2">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Your Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="grid grid-cols-4 px-6 py-3 bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                      const currentPrice = 1; // TODO: Get real price data
                      const change24h = 0; // TODO: Get real change data
                      const totalValue = realBalance * currentPrice;

                      return (
                        <div
                          key={asset.id}
                          className="grid grid-cols-4 items-center px-6 py-4 hover:bg-muted transition-colors "
                        >
                          <div className="col-span-1 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {/*TODO: real symbol of currency*/}
                              {asset.symbol[0]}
                            </div>
                            <div>
                              <div className="font-bold text-foreground">
                                {asset.symbol}
                              </div>
                              <div className="text-xs text-muted-foreground hidden sm:block">
                                {asset.currency}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-medium text-foreground">
                              {new Intl.NumberFormat('en-US').format(
                                currentPrice
                              )}{' '}
                              USD
                            </div>
                            <div
                              className={`text-xs font-medium ${change24h >= 0 ? 'text-primary' : 'text-destructive'}`}
                            >
                              {change24h > 0 ? '+' : ''}
                              {change24h.toFixed(2)}%
                            </div>
                          </div>

                          <div className="text-right text-muted-foreground font-mono text-sm">
                            {realBalance.toLocaleString(undefined, {
                              maximumFractionDigits: asset.precision
                            })}{' '}
                            {asset.symbol}
                          </div>

                          <div className="text-right font-bold text-foreground">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD'
                            }).format(totalValue)}
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
              <CardHeader className="text-left pb-2">
                <CardTitle className="w-full text-2xl font-bold text-foreground">
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions yet
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="grid grid-cols-5 px-6 py-3 bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                            className="grid grid-cols-5 items-center px-6 py-4 hover:bg-muted transition-colors"
                          >
                            <div className="col-span-1 flex items-center gap-3">
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
                                <div className="font-bold text-foreground">
                                  {tx.symbol}
                                </div>
                                <div className="text-xs text-muted-foreground hidden sm:block">
                                  {tx.currency}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div
                                className={`font-medium ${isIncoming ? 'text-primary' : 'text-destructive'}`}
                              >
                                {isIncoming ? '↓ IN' : '↑ OUT'}
                              </div>
                            </div>

                            <div className="text-right font-mono text-sm text-muted-foreground">
                              {isIncoming ? '+' : '-'}
                              {realAmount.toLocaleString(undefined, {
                                maximumFractionDigits: precision
                              })}{' '}
                              {tx.symbol}
                            </div>

                            <div className="text-right">
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded ${statusClasses}`}
                              >
                                {tx.status.toUpperCase()}
                              </span>
                            </div>

                            <div className="text-right text-xs text-muted-foreground">
                              {new Date(tx.created_at).toLocaleDateString()}
                              <br />
                              {new Date(tx.created_at).toLocaleTimeString()}
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
