import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { Wallet } from '@/entities/wallet.entity';
import { Asset } from '@/entities/asset.entity';

import Status from '@/enum/status';
import { CurrencyType } from '@/enum/currency_type';

import { z } from 'zod';

export const schemas = {
  get: {
    res: z.object({
      wallet_id: z.string(),
      total_assets: z.number(),
      assets: z.array(
        z.object({
          id: z.string(),
          currency: z.string(),
          symbol: z.string(),
          amount: z.string(),
          type: z.enum(CurrencyType),
          precision: z.number(),
          price: z.number()
        })
      )
    })
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  try {
    const user = await req.getUser();
    const db = (await orm).em.fork();
    const { id } = req.params;

    // Convert string ID to BigInt for database query
    const walletId = BigInt(id);
    const wallet = await db.findOne(
      Wallet,
      { id: walletId },
      { populate: ['user'] }
    );

    if (!wallet) {
      return res.error(Status.NotFound, 'Wallet not found');
    }

    if (wallet.user.id !== user.id) {
      return res.error(Status.Forbidden, 'Access denied');
    }

    const assets = await db.find(Asset, { wallet }, { populate: ['currency'] });

    // Batch-load the latest close price for all non-fiat currencies in one query
    const nonFiatIds = assets
      .filter((a) => a.currency.type !== CurrencyType.Fiat)
      .map((a) => a.currency.id);

    const priceMap = new Map<bigint, number>();
    if (nonFiatIds.length > 0) {
      const rows = await db
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

    return res.status(Status.Ok).json({
      wallet_id: wallet.id.toString(),
      total_assets: assets.length,
      assets: formattedAssets
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return res.error(Status.Unauthorized, 'Invalid or missing token');
    }

    return res.error(
      Status.InternalServerError,
      'Failed to fetch wallet balance'
    );
  }
};
