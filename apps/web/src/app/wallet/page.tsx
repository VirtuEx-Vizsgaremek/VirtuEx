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

export default function WalletPage() {
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWallet() {
      try {
        // Dev: token is optional during development since backend doesn't validate it yet
        const token = localStorage.getItem('jwt') || 'dev-token';

        const response = await fetch(
          'http://localhost:3001/v1/wallet/balance',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch wallet balance: ${response.status}`);
        }

        const data = await response.json();
        setWalletData(data);
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
        <div className="text-xl text-red-600">Error: {error}</div>
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
            <Card className="w-full col-span-2 shadow-lg border-gray-200 overflow-hidden mb-10">
              <ItemGroup className="px-6">
                {
                  <Item>
                    <div className="flex items-center gap-8">
                      <ItemContent className="space-y-1">
                        <ItemTitle className="text-4xl mb-2 font-extrabold text-gray-900 tracking-tight">
                          Estimated Balance
                        </ItemTitle>
                        <div className="flex items-center gap-2">
                          <ItemDescription className="text-lg font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {formattedBalance}
                          </ItemDescription>
                        </div>
                      </ItemContent>
                    </div>
                  </Item>
                }
              </ItemGroup>
            </Card>

            <Card className="w-full shadow-lg border-gray-200 overflow-hidden my-10">
              <CardHeader className="text-left pb-2">
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Your Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="grid grid-cols-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500      uppercase tracking-wider">
                    <div className="col-span-1">Asset</div>
                    <div className="text-right">Price</div>
                    <div className="text-right">Balance</div>
                    <div className="text-right">Value (USD)</div>
                  </div>

                  <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
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
                          className="grid grid-cols-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors "
                        >
                          <div className="col-span-1 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                              {asset.symbol[0]}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                {asset.symbol}
                              </div>
                              <div className="text-xs text-gray-500 hidden sm:block">
                                {asset.currency}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {new Intl.NumberFormat('en-US').format(
                                currentPrice
                              )}{' '}
                              USD
                            </div>
                            <div
                              className={`text-xs font-medium ${change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {change24h > 0 ? '+' : ''}
                              {change24h.toFixed(2)}%
                            </div>
                          </div>

                          <div className="text-right text-gray-700 font-mono text-sm">
                            {realBalance.toLocaleString(undefined, {
                              maximumFractionDigits: asset.precision
                            })}{' '}
                            {asset.symbol}
                          </div>

                          <div className="text-right font-bold text-gray-900">
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

            <Card className="w-full shadow-lg border-gray-200 overflow-hidden">
              <CardHeader className="text-left pb-2">
                <CardTitle className="w-full text-2xl font-bold text-gray-800">
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="grid grid-cols-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500      uppercase tracking-wider">
                    <div className="col-span-1">Asset</div>
                    <div className="text-right">ID</div>
                    <div className="text-right">Target</div>
                    <div className="text-right">Amount (USD)</div>
                  </div>

                  <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
                    {dashboardAssets.map((asset: any) => {
                      return (
                        <div
                          key={asset.id}
                          className="grid grid-cols-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors "
                        >
                          <div className="col-span-1 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                              {asset.symbol[0]}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                {asset.symbol}
                              </div>
                              <div className="text-xs text-gray-500 hidden sm:block">
                                {asset.currency}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-medium text-gray-900">ID</div>
                            <div className={`text-xs font-medium`}>Date</div>
                          </div>

                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              Target ID
                            </div>
                            <div className={`text-xs font-medium`}>Name</div>
                          </div>

                          <div className="text-right font-bold text-gray-900">
                            15200.00 USD
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
