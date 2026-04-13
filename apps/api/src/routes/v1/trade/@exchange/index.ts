/**
 * Trade API — Exchange Order
 *
 * POST /v1/trade/@exchange
 *
 * Authenticated. Exchanges a given number of units of one currency directly
 * into units of another currency, bridging through USD internally.
 *
 * Request body:
 *   from_currency_id  — ID of the currency being exchanged away (e.g. AAPL)
 *   to_currency_id    — ID of the currency being received (e.g. GOOGL)
 *   amount            — Units of from_currency to exchange, as a precision-scaled
 *                       integer string (same convention as @sell)
 *                       e.g. precision=2, 1 share → "100"
 *
 * Response:
 *   order_id              — ID of the created Order record
 *   status                — Order status ("filled")
 *   sold                  — Units deducted from from_asset (integer string)
 *   sold_exact            — Full decimal string of sold units
 *   received              — Units credited to to_asset (integer string)
 *   received_exact        — Full decimal string of received units
 *   from_price_per_unit   — Execution price of from_currency in USD cents
 *   to_price_per_unit     — Execution price of to_currency in USD cents
 *
 * Logic:
 *   1. Verify the JWT and load the authenticated user.
 *   2. Validate and load both currencies (must differ).
 *   3. Find the user's from_asset and check sufficient balance.
 *   4. Fetch the latest CurrencyHistory price for from_currency (USD cents/unit).
 *   5. Fetch the latest CurrencyHistory price for to_currency (USD cents/unit).
 *   6. Calculate USD value of sold units: usd_cents = (amount × price_from) / 10^precision_from
 *   7. Calculate to_units received: to_units = (usd_cents × 10^precision_to) / price_to
 *   8. Validate usd_cents > 0 and to_units > 0.
 *   9. Find or create to_asset in the user's wallet.
 *  10. Debit from_asset, credit to_asset.
 *  11. Persist Order (Buy/Filled), two Transactions, and an AuditLog entry.
 *  12. Return the exchange summary.
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
import { AuditLog } from '@/entities/log.entity';
import { Action } from '@/enum/action';
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
      sold_exact: z.string(),
      received: z.string(),
      received_exact: z.string(),
      from_price_per_unit: z.string(),
      to_price_per_unit: z.string()
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

  // ── 3. Fetch the latest market price for from_currency ────────────────────
  const fromHistory = await db.findOne(
    CurrencyHistory,
    { currency: fromCurrency },
    { orderBy: { timestamp: 'DESC' } }
  );

  if (!fromHistory || fromHistory.close <= 0n)
    return res.error(
      Status.ServiceUnavailable,
      `Price data unavailable for ${fromCurrency.symbol}.`
    );

  // ── 4. Fetch the latest market price for to_currency ──────────────────────
  const toHistory = await db.findOne(
    CurrencyHistory,
    { currency: toCurrency },
    { orderBy: { timestamp: 'DESC' } }
  );

  if (!toHistory || toHistory.close <= 0n)
    return res.error(
      Status.ServiceUnavailable,
      `Price data unavailable for ${toCurrency.symbol}.`
    );

  const priceFrom = fromHistory.close; // USD cents per unit of from_currency
  const priceTo = toHistory.close; // USD cents per unit of to_currency

  const fromPrecisionFactor = BigInt(10 ** fromCurrency.precision);
  const toPrecisionFactor = BigInt(10 ** toCurrency.precision);

  // ── 5. Calculate USD value of sold units ──────────────────────────────────
  // usd_cents = (sellAmount × price_from) / 10^precision_from
  const usdCents = (sellAmount * priceFrom) / fromPrecisionFactor;

  if (usdCents <= 0n)
    return res.error(
      Status.BadRequest,
      `Exchange value rounds to zero. Sell more ${fromCurrency.symbol}.`
    );

  // ── 6. Calculate units of to_currency received ────────────────────────────
  // to_units = (usd_cents × 10^precision_to) / price_to
  const toUnits = (usdCents * toPrecisionFactor) / priceTo;

  if (toUnits <= 0n)
    return res.error(
      Status.BadRequest,
      `Exchange yields zero ${toCurrency.symbol}. Increase the amount.`
    );

  // ── 7. Find or create the target Asset in the user's wallet ───────────────
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

  // ── 8. Debit source Asset, credit target Asset ────────────────────────────
  fromAsset.amount -= sellAmount;
  toAsset.amount += toUnits;

  // ── 9. Persist Order and Transactions ─────────────────────────────────────
  const order = new Order();
  order.user = user;
  order.from_asset = fromAsset;
  order.to_asset = toAsset;
  order.amount = sellAmount;
  order.type = OrderType.Buy;
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
  txIn.amount = toUnits;
  txIn.direction = TransactionDirection.Incoming;
  txIn.status = TransactionStatus.Completed;
  db.persist(txIn);

  const log = new AuditLog();
  log.user = user;
  log.data = {
    action: Action.Buy,
    currency: toAsset.id,
    amount: toUnits
  };
  db.persist(log);

  await db.flush();

  const soldExact = (Number(sellAmount) / Number(fromPrecisionFactor)).toFixed(
    fromCurrency.precision
  );

  const receivedExact = (Number(toUnits) / Number(toPrecisionFactor)).toFixed(
    toCurrency.precision
  );

  return res.status(Status.Created).json({
    order_id: order.id.toString(),
    status: order.status,
    sold: sellAmount.toString(),
    sold_exact: soldExact,
    received: toUnits.toString(),
    received_exact: receivedExact,
    from_price_per_unit: priceFrom.toString(),
    to_price_per_unit: priceTo.toString()
  });
};
