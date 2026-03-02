/**
 * Trade API — Single Order
 *
 * GET    /v1/trade/:id   — Returns a single order (must belong to the authenticated user)
 * DELETE /v1/trade/:id   — Cancels a pending order (only allowed while status = pending)
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

  const id = req.getParam('id') as string;

  const order = await db.findOne(Order, { id: BigInt(id), user });

  if (!order) return res.error(Status.NotFound, 'Order not found.');

  if (order.status !== OrderStatus.Pending)
    return res.error(
      Status.Conflict,
      `Cannot cancel an order with status "${order.status}". Only pending orders can be cancelled.`
    );

  order.status = OrderStatus.Cancelled;
  await db.flush();

  return res.status(Status.NoContent).end();
};
