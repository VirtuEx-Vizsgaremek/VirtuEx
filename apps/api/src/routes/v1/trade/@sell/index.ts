/**
 * Trade API — Sell Order
 *
 * POST /v1/trade/@sell
 *
 * Authenticated. Sells a given number of units of one currency and credits the
 * proceeds (at the latest market price) into another currency.
 *
 * Request body:
 *   from_currency_id  — ID of the currency being sold (e.g. AAPL)
 *   to_currency_id    — ID of the currency to receive (e.g. USD)
 *   amount            — Number of units to sell, as an integer string
 *
 * Response:
 *   order_id        — ID of the created Order record
 *   status          — Order status (always "filled" for market orders)
 *   sold            — Units deducted from the source asset
 *   received        — Proceeds credited to the target asset (cents string)
 *   price_per_unit  — Execution price (cents string)
 *
 * Logic:
 *   1. Verify the JWT and load the authenticated user.
 *   2. Validate and load both currencies.
 *   3. Find the user's source Asset and check for sufficient balance.
 *   4. Fetch the latest CurrencyHistory price for the source currency.
 *   5. Calculate proceeds: (sellAmount × pricePerUnit) / 10^precision.
 *   6. Find or create the target Asset in the user's wallet.
 *   7. Debit the source Asset, credit the target Asset.
 *   8. Persist an Order (sell/filled) and two Transactions (outgoing + incoming).
 *   9. Return the order summary.
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
import { AuditLog } from '@/entities/log.entity';
import { Action } from '@/enum/action';

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

  // ── 1. Validate and load both currencies ──────────────────────────────────
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

  // ── 2. Find the source Asset and verify sufficient balance ────────────────
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

  // ── 3. Fetch the latest market price for the source currency ──────────────
  const latestHistory = await db.findOne(
    CurrencyHistory,
    { currency: fromCurrency },
    { orderBy: { timestamp: 'DESC' } }
  );

  if (!latestHistory)
    return res.error(
      Status.ServiceUnavailable,
      `Price data unavailable: no historical price found for source currency ${fromCurrency.symbol}.`
    );

  if (latestHistory.close <= 0n)
    return res.error(
      Status.ServiceUnavailable,
      `Price data unavailable: latest close price is invalid (${latestHistory.close.toString()}) for source currency ${fromCurrency.symbol}.`
    );

  const pricePerUnit = latestHistory.close; // e.g. 17500n = $175.00 per unit

  // ── 4. Calculate proceeds in the target currency ──────────────────────────
  // proceeds = (sellAmount × pricePerUnit) / 10^precision
  // Converts sold units back into the target currency value (cents).
  const proceeds =
    (sellAmount * pricePerUnit) / BigInt(10 ** fromCurrency.precision);

  if (proceeds <= 0n)
    return res.error(
      Status.BadRequest,
      `Proceeds round down to zero: selling ${sellAmount.toString()} units of ${fromCurrency.symbol} at price ${pricePerUnit.toString()} yields nothing. Increase sell amount.`
    );

  // ── 5. Find or create the target Asset in the user's wallet ───────────────
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

  // ── 6. Debit source Asset, credit target Asset ────────────────────────────
  fromAsset.amount -= sellAmount;
  toAsset.amount += proceeds;

  // ── 7. Persist Order and Transactions ─────────────────────────────────────
  const order = new Order();
  order.user = user;
  order.from_asset = fromAsset;
  order.to_asset = toAsset;
  order.amount = sellAmount;
  order.type = OrderType.Sell;
  order.status = OrderStatus.Filled;
  db.persist(order);

  // Outgoing transaction: units debited from source asset
  const txOut = new Transaction();
  txOut.asset = fromAsset;
  txOut.amount = sellAmount;
  txOut.direction = TransactionDirection.Outgoing;
  txOut.status = TransactionStatus.Completed;
  db.persist(txOut);

  // Incoming transaction: proceeds credited to target asset
  const txIn = new Transaction();
  txIn.asset = toAsset;
  txIn.amount = proceeds;
  txIn.direction = TransactionDirection.Incoming;
  txIn.status = TransactionStatus.Completed;
  db.persist(txIn);

  const log = new AuditLog();
  log.user = user;
  log.data = {
    action: Action.Sell,
    currency: fromAsset.id,
    amount: sellAmount
  };
  db.persist(log);

  await db.flush();

  return res.status(Status.Created).json({
    order_id: order.id.toString(),
    status: order.status,
    sold: sellAmount.toString(),
    received: proceeds.toString(),
    price_per_unit: pricePerUnit.toString()
  });
};
