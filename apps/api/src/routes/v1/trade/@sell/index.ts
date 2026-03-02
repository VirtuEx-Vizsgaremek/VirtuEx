/**
 * Trade API — Sell Order
 *
 * POST /v1/trade/sell
 *
 * Body:
 *   from_currency_id  — ID of the currency you are selling (e.g. AAPL)
 *   to_currency_id    — ID of the currency you want to receive (e.g. USD)
 *   amount            — Amount of "from" currency units to sell (as string)
 *
 * Logic:
 *   1. Load the user + wallet.
 *   2. Find the "from" Asset and verify sufficient balance.
 *   3. Look up the latest price of the "from" Currency.
 *   4. Calculate the proceeds in the "to" currency.
 *   5. Deduct sold units from the "from" Asset.
 *   6. Credit proceeds to the "to" Asset (create if needed).
 *   7. Persist an Order (type=sell, status=filled) and two Transactions.
 *   8. Return the created order.
 */

import Status from '@/enum/status';
import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';
import { Asset } from '@/entities/asset.entity';
import { Order } from '@/entities/order.entity';
import { Transaction } from '@/entities/transaction.entity';
import { CurrencyHistory } from '@/entities/currency_history.entity';
import { Currency } from '@/entities/currency.entity';
import { OrderStatus, OrderType } from '@/enum/order';
import { TransactionDirection, TransactionStatus } from '@/enum/transaction';
import { z } from 'zod';

export const schemas = {
  post: {
    req: z.object({
      from_currency_id: z.string(),
      to_currency_id: z.string(),
      amount: z
        .string()
        .regex(/^\d+$/, 'Amount must be a positive integer string')
    }),
    res: z.object({
      order_id: z.string(),
      status: z.string(),
      sold: z.string(),
      received: z.string(),
      price_per_unit: z.string()
    })
  }
};

export const post = async (
  req: Request,
  res: Response<z.infer<typeof schemas.post.res>>
) => {
  const user = await req.getUser();
  const db = (await orm).em.fork();

  const {
    from_currency_id,
    to_currency_id,
    amount: amountStr
  } = req.validateBody(schemas.post.req);

  const sellAmount = BigInt(amountStr);

  if (sellAmount <= 0n)
    return res.error(Status.BadRequest, 'Amount must be greater than zero.');

  // ── 1. Load currencies ────────────────────────────────────────────────────
  const fromCurrency = await db.findOne(Currency, {
    id: BigInt(from_currency_id)
  });
  if (!fromCurrency)
    return res.error(Status.NotFound, 'Source currency not found.');

  const toCurrency = await db.findOne(Currency, { id: BigInt(to_currency_id) });
  if (!toCurrency)
    return res.error(Status.NotFound, 'Target currency not found.');

  if (from_currency_id === to_currency_id)
    return res.error(
      Status.BadRequest,
      'Source and target currency must differ.'
    );

  // ── 2. Find the user's asset for the currency being sold ─────────────────
  const fromAsset = await db.findOne(
    Asset,
    { wallet: user.wallet, currency: fromCurrency },
    { populate: ['wallet', 'currency'] }
  );

  if (!fromAsset)
    return res.error(
      Status.BadRequest,
      'You do not hold any balance in the source currency.'
    );

  if (fromAsset.amount < sellAmount)
    return res.error(Status.BadRequest, 'Insufficient balance.');

  // ── 3. Get latest price of the "from" currency ───────────────────────────
  const latestHistory = await db.findOne(
    CurrencyHistory,
    { currency: fromCurrency },
    { orderBy: { timestamp: 'DESC' } }
  );

  if (!latestHistory || latestHistory.price <= 0n)
    return res.error(
      Status.ServiceUnavailable,
      'Price data unavailable for the source currency.'
    );

  const pricePerUnit = latestHistory.price; // e.g. 17500n = $175.00 per unit

  // ── 4. Calculate proceeds in the "to" currency ───────────────────────────
  // proceeds = sellAmount * pricePerUnit / 10^fromPrecision
  // This converts the sold units back into the target currency value (cents).
  const proceeds =
    (sellAmount * pricePerUnit) / BigInt(10 ** fromCurrency.precision);

  if (proceeds <= 0n)
    return res.error(
      Status.BadRequest,
      'Proceeds amount rounds down to zero — increase sell amount.'
    );

  // ── 5. Find or create the "to" asset ─────────────────────────────────────
  let toAsset = await db.findOne(
    Asset,
    { wallet: user.wallet, currency: toCurrency },
    { populate: ['wallet', 'currency'] }
  );

  if (!toAsset) {
    toAsset = new Asset();
    toAsset.wallet = user.wallet;
    toAsset.currency = toCurrency;
    toAsset.amount = 0n;
    db.persist(toAsset);
  }

  // ── 6. Debit / credit balances ────────────────────────────────────────────
  fromAsset.amount -= sellAmount;
  toAsset.amount += proceeds;

  // ── 7. Create Order + Transactions ───────────────────────────────────────
  const order = new Order();
  order.user = user;
  order.from_asset = fromAsset;
  order.to_asset = toAsset;
  order.amount = sellAmount;
  order.type = OrderType.Sell;
  order.status = OrderStatus.Filled;
  db.persist(order);

  const txOut = new Transaction();
  txOut.asset = fromAsset;
  txOut.amount = sellAmount;
  txOut.direction = TransactionDirection.Outgoing;
  txOut.status = TransactionStatus.Completed;
  db.persist(txOut);

  const txIn = new Transaction();
  txIn.asset = toAsset;
  txIn.amount = proceeds;
  txIn.direction = TransactionDirection.Incoming;
  txIn.status = TransactionStatus.Completed;
  db.persist(txIn);

  await db.flush();

  return res.status(Status.Created).json({
    order_id: order.id.toString(),
    status: order.status,
    sold: sellAmount.toString(),
    received: proceeds.toString(),
    price_per_unit: pricePerUnit.toString()
  });
};
