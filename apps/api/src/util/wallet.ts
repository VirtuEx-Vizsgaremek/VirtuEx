import { EntityManager } from '@mikro-orm/core';

import { Wallet } from '@/entities/wallet.entity';
import { Asset } from '@/entities/asset.entity';
import { Transaction } from '@/entities/transaction.entity';

import { CurrencyType } from '@/enum/currency_type';
import { TransactionDirection, TransactionStatus } from '@/enum/transaction';

type KnexEntityManager = EntityManager & {
  getKnex(): {
    raw<T>(query: string, bindings?: unknown[]): Promise<T>;
  };
};

export type WalletAssetsResponse = {
  wallet_id: string;
  total_assets: number;
  assets: Array<{
    id: string;
    currency: string;
    symbol: string;
    amount: string;
    type: CurrencyType;
    precision: number;
    price: number;
  }>;
};

export type WalletHistoryResponse = {
  wallet_id: string;
  total_transactions: number;
  transactions: Array<{
    id: string;
    asset_id: string;
    currency: string;
    symbol: string;
    amount: string;
    direction: TransactionDirection;
    status: TransactionStatus;
    created_at: Date;
    updated_at: Date;
  }>;
};

export const getWalletAssetsWithPrices = async (
  db: EntityManager,
  wallet: Wallet
): Promise<WalletAssetsResponse> => {
  const assets: Asset[] = await db.find(
    Asset,
    { wallet },
    {
      populate: ['currency']
    }
  );

  // Batch-load the latest close price for all non-fiat currencies in one query
  const nonFiatIds = assets
    .filter((asset) => asset.currency.type !== CurrencyType.Fiat)
    .map((asset) => asset.currency.id);

  const priceMap = new Map<bigint, number>();
  if (nonFiatIds.length > 0) {
    const rows = await (db as KnexEntityManager)
      .getKnex()
      .raw<{ rows: { currency_id: string; close: string }[] }>(
        `SELECT DISTINCT ON (currency_id) currency_id, close
         FROM currency_history
         WHERE currency_id = ANY(?)
           AND close > 0
         ORDER BY currency_id, timestamp DESC`,
        [nonFiatIds.map(String)]
      );

    for (const row of rows.rows) {
      priceMap.set(BigInt(row.currency_id), Number(row.close) / 100);
    }
  }

  const formattedAssets = assets.map((asset) => {
    const price =
      asset.currency.type === CurrencyType.Fiat
        ? 1
        : (priceMap.get(asset.currency.id) ?? 0);

    return {
      id: asset.id.toString(),
      currency: asset.currency.name,
      symbol: asset.currency.symbol,
      amount: asset.amount.toString(),
      type: asset.currency.type,
      precision: asset.currency.precision,
      price
    };
  });

  return {
    wallet_id: wallet.id.toString(),
    total_assets: assets.length,
    assets: formattedAssets
  };
};

export const getWalletHistory = async (
  db: EntityManager,
  wallet: Wallet
): Promise<WalletHistoryResponse> => {
  const transactions: Transaction[] = await db.find(
    Transaction,
    { asset: { wallet } },
    {
      populate: ['asset', 'asset.currency'],
      orderBy: { createdAt: 'DESC' }
    }
  );

  const formattedTransactions = transactions.map((tx) => ({
    id: tx.id.toString(),
    asset_id: tx.asset.id.toString(),
    currency: tx.asset.currency.name,
    symbol: tx.asset.currency.symbol,
    amount: tx.amount.toString(),
    direction: tx.direction,
    status: tx.status,
    created_at: tx.createdAt,
    updated_at: tx.updatedAt
  }));

  return {
    wallet_id: wallet.id.toString(),
    total_transactions: transactions.length,
    transactions: formattedTransactions
  };
};
