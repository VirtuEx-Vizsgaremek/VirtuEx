/**
 * Trade API — Buy Order
 *
 * POST /v1/trade/buy
 *
 * Body:
 *   from_currency_id  — ID of the currency you are spending (e.g. USD asset)
 *   to_currency_id    — ID of the currency you want to buy  (e.g. AAPL asset)
 *   amount            — Amount to spend (in smallest unit / cents as string to avoid float issues)
 *
 * Logic:
 *   1. Load the user + wallet.
 *   2. Find (or create) the "from" Asset in the wallet and verify sufficient balance.
 *   3. Look up the latest price of the "to" Currency from CurrencyHistory.
 *   4. Calculate how many units the amount buys.
 *   5. Deduct the spent amount from the "from" Asset.
 *   6. Credit the bought units to the "to" Asset (create if it doesn't exist yet).
 *   7. Persist an Order (type=buy, status=filled) and two Transactions (out + in).
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
      spent: z.string(),
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

  const spendAmount = BigInt(amountStr);

  if (spendAmount <= 0n)
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

  // ── 2. Find the user's wallet asset for the "from" currency ───────────────
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

  if (fromAsset.amount < spendAmount)
    return res.error(Status.BadRequest, 'Insufficient balance.');

  // ── 3. Get latest price of the target currency (price stored in cents) ────
  const latestHistory = await db.findOne(
    CurrencyHistory,
    { currency: toCurrency },
    { orderBy: { timestamp: 'DESC' } }
  );

  if (!latestHistory || latestHistory.price <= 0n)
    return res.error(
      Status.ServiceUnavailable,
      'Price data unavailable for the target currency.'
    );

  const pricePerUnit = latestHistory.price; // e.g. 17500n = $175.00

  // ── 4. Calculate how many units the spend amount buys ────────────────────
  // Both are in "cents" — dividing gives us units in the target currency precision.
  const unitsReceived =
    (spendAmount * BigInt(10 ** toCurrency.precision)) / pricePerUnit;

  if (unitsReceived <= 0n)
    return res.error(
      Status.BadRequest,
      'Amount too small to purchase any units at the current price.'
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

  const now = new Date();

  // ── 6. Debit / credit balances ────────────────────────────────────────────
  fromAsset.amount -= spendAmount;
  toAsset.amount += unitsReceived;

  // ── 7. Create Order + Transactions ───────────────────────────────────────
  const order = new Order();
  order.user = user;
  order.from_asset = fromAsset;
  order.to_asset = toAsset;
  order.amount = spendAmount;
  order.type = OrderType.Buy;
  order.status = OrderStatus.Filled;
  db.persist(order);

  // Outgoing: amount spent from the source asset
  const txOut = new Transaction();
  txOut.asset = fromAsset;
  txOut.amount = spendAmount;
  txOut.direction = TransactionDirection.Outgoing;
  txOut.status = TransactionStatus.Completed;
  db.persist(txOut);

  // Incoming: units received into the target asset
  const txIn = new Transaction();
  txIn.asset = toAsset;
  txIn.amount = unitsReceived;
  txIn.direction = TransactionDirection.Incoming;
  txIn.status = TransactionStatus.Completed;
  db.persist(txIn);

  await db.flush();

  return res.status(Status.Created).json({
    order_id: order.id.toString(),
    status: order.status,
    spent: spendAmount.toString(),
    received: unitsReceived.toString(),
    price_per_unit: pricePerUnit.toString()
  });
};
