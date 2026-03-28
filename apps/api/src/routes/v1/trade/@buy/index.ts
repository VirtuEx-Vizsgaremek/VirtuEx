/**
 * Trade API — Buy Order
 *
 * POST /v1/trade/@buy
 *
 * Authenticated. Spends a given amount of one currency to purchase units of another
 * at the latest market price recorded in CurrencyHistory.
 *
 * Request body:
 *   from_currency_id  — ID of the currency being spent (e.g. USD)
 *   to_currency_id    — ID of the currency being bought (e.g. AAPL)
 *   amount            — Amount to spend in the smallest unit (cents), as an integer string
 *
 * Response:
 *   order_id        — ID of the created Order record
 *   status          — Order status (always "filled" for market orders)
 *   spent           — Amount deducted from the source asset (cents string)
 *   received        — Units credited to the target asset
 *   price_per_unit  — Execution price (cents string)
 *
 * Logic:
 *   1. Verify the JWT and load the authenticated user.
 *   2. Validate and load both currencies.
 *   3. Find the user's source Asset and check for sufficient balance.
 *   4. Fetch the latest CurrencyHistory price for the target currency.
 *   5. Calculate units received: (amount × 10^precision) / pricePerUnit.
 *   6. Find or create the target Asset in the user's wallet.
 *   7. Debit the source Asset, credit the target Asset.
 *   8. Persist an Order (buy/filled) and two Transactions (outgoing + incoming).
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
      spent: z.string(),
      received: z.string(),
      price_per_unit: z.string(),
      received_exact: z.string()
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

  if (fromAsset.amount < spendAmount)
    return res.error(Status.BadRequest, 'Insufficient balance.');

  // ── 3. Fetch the latest market price for the target currency ──────────────
  const latestHistory = await db.findOne(
    CurrencyHistory,
    { currency: toCurrency },
    { orderBy: { timestamp: 'DESC' } }
  );

  if (!latestHistory)
    return res.error(
      Status.ServiceUnavailable,
      `Price data unavailable: no historical price found for target currency ${toCurrency.symbol}.`
    );

  if (latestHistory.close <= 0n)
    return res.error(
      Status.ServiceUnavailable,
      `Price data unavailable: latest close price is invalid (${latestHistory.close.toString()}) for target currency ${toCurrency.symbol}.`
    );

  const pricePerUnit = latestHistory.close; // e.g. 17500n = $175.00

  // ── 4. Calculate units received ───────────────────────────────────────────
  // units = (spendAmount × 10^precision) / pricePerUnit
  // Both amounts are in cents; scaling by precision gives fractional units.
  const unitsReceived =
    (spendAmount * BigInt(10 ** toCurrency.precision)) / pricePerUnit;

  // Minimum spend = pricePerUnit / 10^precision  (i.e. cost of one smallest unit)
  const precisionFactor = BigInt(10 ** toCurrency.precision);
  // Minimum spend in cents to receive at least 1 smallest unit
  const minSpendCents =
    pricePerUnit / precisionFactor +
    (pricePerUnit % precisionFactor > 0n ? 1n : 0n);
  const minSpendDollars = (Number(minSpendCents) / 100).toFixed(2);

  if (unitsReceived <= 0n)
    return res.error(
      Status.BadRequest,
      `Amount too small to buy any ${toCurrency.symbol}. Minimum spend: $${minSpendDollars} USD (price per unit: $${(Number(pricePerUnit) / 100).toFixed(2)} USD, precision: ${toCurrency.precision} decimals).`
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
  fromAsset.amount -= spendAmount;
  toAsset.amount += unitsReceived;

  // ── 7. Persist Order and Transactions ─────────────────────────────────────
  const order = new Order();
  order.user = user;
  order.from_asset = fromAsset;
  order.to_asset = toAsset;
  order.amount = spendAmount;
  order.type = OrderType.Buy;
  order.status = OrderStatus.Filled;
  db.persist(order);

  // Outgoing transaction: amount debited from source asset
  const txOut = new Transaction();
  txOut.asset = fromAsset;
  txOut.amount = spendAmount;
  txOut.direction = TransactionDirection.Outgoing;
  txOut.status = TransactionStatus.Completed;
  db.persist(txOut);

  // Incoming transaction: units credited to target asset
  const txIn = new Transaction();
  txIn.asset = toAsset;
  txIn.amount = unitsReceived;
  txIn.direction = TransactionDirection.Incoming;
  txIn.status = TransactionStatus.Completed;
  db.persist(txIn);

  const log = new AuditLog();
  log.user = user;
  log.data = {
    action: Action.Buy,
    currency: toAsset.id,
    amount: unitsReceived
  };
  db.persist(log);

  await db.flush();

  // received_exact: full precision decimal string, e.g. "0.10000000" for 8 decimals
  const receivedExact = (
    Number(unitsReceived) / Number(precisionFactor)
  ).toFixed(toCurrency.precision);

  return res.status(Status.Created).json({
    order_id: order.id.toString(),
    status: order.status,
    spent: spendAmount.toString(),
    received: unitsReceived.toString(),
    price_per_unit: pricePerUnit.toString(),
    received_exact: receivedExact
  });
};
