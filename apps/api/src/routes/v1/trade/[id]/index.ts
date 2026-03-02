/**
 * Trade API — Single Order
 *
 * GET    /v1/trade/:id
 * DELETE /v1/trade/:id
 *
 * Authenticated. Operates on a single Order that belongs to the authenticated user.
 *
 * GET response:
 *   id            — Order ID
 *   type          — "buy" | "sell"
 *   status        — "pending" | "filled" | "cancelled"
 *   from_asset    — Source asset with nested currency info
 *   to_asset      — Target asset with nested currency info
 *   amount        — Amount involved in the order (integer string)
 *   createdAt     — Unix timestamp (ms)
 *   updatedAt     — Unix timestamp (ms)
 *
 * DELETE behaviour:
 *   Only pending orders can be cancelled. Returns 409 Conflict for any other status.
 *   Returns 204 No Content on success.
 */

import Status from '@/enum/status';
import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';
import { Order } from '@/entities/order.entity';
import { OrderStatus } from '@/enum/order';
import { z } from 'zod';

export const schemas = {
  get: {
    res: z.object({
      id: z.string(),
      type: z.string(),
      status: z.string(),
      from_asset: z.object({
        id: z.string(),
        currency: z.object({
          id: z.string(),
          symbol: z.string(),
          name: z.string()
        })
      }),
      to_asset: z.object({
        id: z.string(),
        currency: z.object({
          id: z.string(),
          symbol: z.string(),
          name: z.string()
        })
      }),
      amount: z.string(),
      createdAt: z.number(),
      updatedAt: z.number()
    })
  }
};

/** Converts an Order entity into the wire format returned by GET /v1/trade/:id. */
const serializeOrder = (o: Order) => ({
  id: o.id.toString(),
  type: o.type,
  status: o.status,
  from_asset: {
    id: o.from_asset.id.toString(),
    currency: {
      id: o.from_asset.currency.id.toString(),
      symbol: o.from_asset.currency.symbol,
      name: o.from_asset.currency.name
    }
  },
  to_asset: {
    id: o.to_asset.id.toString(),
    currency: {
      id: o.to_asset.currency.id.toString(),
      symbol: o.to_asset.currency.symbol,
      name: o.to_asset.currency.name
    }
  },
  amount: o.amount.toString(),
  createdAt: o.createdAt.getTime(),
  updatedAt: o.updatedAt.getTime()
});

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  const user = await req.getUser();
  const db = (await orm).em.fork();

  // ── Load the order, scoped to the authenticated user ──────────────────────
  const id = req.getParam('id') as string;

  const order = await db.findOne(
    Order,
    { id: BigInt(id), user },
    {
      populate: [
        'from_asset',
        'from_asset.currency',
        'to_asset',
        'to_asset.currency'
      ]
    }
  );

  if (!order) return res.error(Status.NotFound, 'Order not found.');

  return res.status(Status.Ok).json(serializeOrder(order));
};

export const del = async (req: Request, res: Response<void>) => {
  const user = await req.getUser();
  const db = (await orm).em.fork();

  // ── Load the order, scoped to the authenticated user ──────────────────────
  const id = req.getParam('id') as string;

  const order = await db.findOne(Order, { id: BigInt(id), user });

  if (!order) return res.error(Status.NotFound, 'Order not found.');

  // ── Only pending orders may be cancelled ──────────────────────────────────
  if (order.status !== OrderStatus.Pending)
    return res.error(
      Status.Conflict,
      `Cannot cancel an order with status "${order.status}". Only pending orders can be cancelled.`
    );

  // ── Mark as cancelled and persist ─────────────────────────────────────────
  order.status = OrderStatus.Cancelled;
  await db.flush();

  return res.status(Status.NoContent).end();
};
