/**
 * Trade API — Order List
 *
 * GET /v1/trade
 *   Returns the authenticated user's orders.
 *   Query params (all optional):
 *     status  — filter by OrderStatus  ("pending" | "filled" | ...)
 *     type    — filter by OrderType    ("buy" | "sell")
 *     limit   — page size, default 50, max 200
 *     offset  — page offset, default 0
 */

import Status from '@/enum/status';
import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';
import { Order } from '@/entities/order.entity';
import { OrderStatus, OrderType } from '@/enum/order';
import { z } from 'zod';

export const schemas = {
  get: {
    res: z.object({
      orders: z.array(
        z.object({
          id: z.string(),
          type: z.nativeEnum(OrderType),
          status: z.nativeEnum(OrderStatus),
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
      ),
      total: z.number()
    })
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  const user = await req.getUser();
  const db = (await orm).em.fork();

  const rawStatus = req.query.status as string | undefined;
  const rawType = req.query.type as string | undefined;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const offset = parseInt(req.query.offset as string) || 0;

  const status =
    rawStatus && Object.values(OrderStatus).includes(rawStatus as OrderStatus)
      ? (rawStatus as OrderStatus)
      : undefined;

  const type =
    rawType && Object.values(OrderType).includes(rawType as OrderType)
      ? (rawType as OrderType)
      : undefined;

  const where = {
    user,
    ...(status ? { status } : {}),
    ...(type ? { type } : {})
  };

  const [orders, total] = await db.findAndCount(Order, where, {
    populate: [
      'from_asset',
      'from_asset.currency',
      'to_asset',
      'to_asset.currency'
    ],
    limit,
    offset,
    orderBy: { createdAt: 'DESC' }
  });

  return res.status(Status.Ok).json({
    total,
    orders: orders.map((o) => ({
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
    }))
  });
};
