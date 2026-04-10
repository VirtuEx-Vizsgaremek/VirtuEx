import express from 'express';
import cors from 'cors';
import multer from 'multer';
import chalk from 'chalk';
import expressWs from 'express-ws';
import cron from 'node-cron';

import path from 'node:path';

import { Request, Response } from '@/util/handler';
import { ValidationError } from '@/util/errors';
import Logger from '@/util/logger';
import getRoutes from '@/util/get_routes';
import pathParser from '@/util/path_parser';
import version from '@/util/version';
import { orm } from '@/util/orm';

import Method from '@/enum/method';
import MarketData from '@/util/market_data';

import { MarketDataSeeder } from '@/seeders/market_data.seeder';
import { UsersSeeder } from '@/seeders/users.seeder';

const app = expressWs(express()).app;

const logger = new Logger('virtuex::api::main');
const webLogger = new Logger('virtuex::api::req');

const PORT = parseInt(process.env.PORT!) || 3001;

type OrmInstance = Awaited<typeof orm>;

const SUBSCRIPTION_COLUMNS = [
  'billing_period',
  'pending_plan_id',
  'pending_billing_period',
  'pending_effective_at'
];

const warnIfMissingSubscriptionColumns = async (db: OrmInstance) => {
  try {
    const tableRows = (await db.em
      .getConnection()
      .execute(
        "select 1 as exists from information_schema.tables where table_schema = 'public' and table_name = 'subscription' limit 1"
      )) as Array<{ exists?: number }>;

    if (!Array.isArray(tableRows) || tableRows.length === 0) {
      logger.warn(
        'DB schema missing: subscription table not found — run pnpm db:migrate'
      );
      return;
    }

    const columnRows = (await db.em
      .getConnection()
      .execute(
        "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'subscription'"
      )) as Array<{ column_name: string }>;

    const existing = new Set(columnRows.map((row) => row.column_name));
    const missing = SUBSCRIPTION_COLUMNS.filter(
      (column) => !existing.has(column)
    );

    if (missing.length > 0) {
      logger.warn(
        `DB schema missing: ${missing
          .map((column) => `subscription.${column}`)
          .join(', ')} — run pnpm db:migrate`
      );
    }
  } catch (error) {
    logger.warn('Subscription schema check failed:', error);
  }
};

app.use(async (req, res, next) => {
  res.setHeader('X-Powered-By', `VirtuEx/${version}`);
  await next();

  const ip = req.headers['x-forwarded-for'] || req.ip;
  webLogger.info(
    `${ip} "${req.method} ${req.path} HTTP/${req.httpVersion}" ${res.statusCode} ${res.getHeader('Content-Length') ? res.getHeader('Content-Length') : '0'} "${req.get('Referer') ? req.get('Referer') : '-'}" "${req.get('User-Agent')}"`
  );
});

app.use(
  cors({
    maxAge: 86400
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(multer().any());

(async () => {
  const startTimestamp = Date.now();

  console.log('[startup] boot begin', new Date().toISOString());
  console.log(
    `[startup] env PORT=${process.env.PORT ?? ''} NODE_ENV=${process.env.NODE_ENV ?? ''} DB_HOST=${process.env.DB_HOST ?? ''} DB_NAME=${process.env.DB_NAME ?? ''}`
  );

  // Check if db is alive otherwise throw an error.
  console.log('[startup] db connect begin');
  let db: OrmInstance;
  try {
    db = await orm;
    const { ok } = await db.checkConnection();
    if (!ok) throw new Error('Database connection check failed');
    console.log('[startup] db connect ok');
  } catch (err) {
    console.error('[startup] db connect failed', err);
    process.exit(1);
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    // TEMPORARILY DISABLED FOR FASTER STARTUP
    // await db.schema.refreshDatabase();

    // Just ensure the schema exists without dropping everything
    console.log('[startup] schema update begin');
    await db.schema.ensureDatabase();
    await db.schema.updateSchema();
    console.log('[startup] schema update ok');
    await warnIfMissingSubscriptionColumns(db);
    console.log('[startup] seeder begin');
    db.seeder
      .seed(MarketDataSeeder, UsersSeeder)
      .then(() => console.log('[startup] seeder ok'))
      .catch((err) => console.error('[startup] seeder failed', err));
  }

  const routes: string[] = await getRoutes(path.join(__dirname, 'routes'));

  logger.info('○ Routes:', routes.length);
  for (const route of routes) {
    const routePath = pathParser(
      route.replace(__dirname, '').replace(/\\/g, '/')
    );
    const routeHandler = await import(route);

    const methods = Object.keys(routeHandler)
      .filter((key) => key !== 'default')
      .map((m) => {
        if (m === 'get') return Method.Get;
        if (m === 'post') return Method.Post;
        if (m === 'put') return Method.Put;
        if (m === 'del') return Method.Delete;
        if (m === 'patch') return Method.Patch;
        if (m === 'options') return Method.Options;
        if (m === 'head') return Method.Head;
        if (m === 'ws') return Method.WebSocket;
      })
      .filter((key) => typeof key != 'undefined');
    const isValid = methods.length > 0;

    if (isValid) {
      logger.info(
        chalk.green('⦿'),
        `\`${routePath}\``,
        '(' + methods.join(', ') + ')'
      );

      if (methods.includes(Method.WebSocket)) {
        app.ws(routePath, (ws, req) => {
          const request = new Request(req, undefined);
          routeHandler.ws(ws, request);
        });
      }

      app.all(routePath, (req, res) => {
        try {
          const response = new Response(res, req);
          const request = new Request(req, response);

          if (!response.allow(methods)) return;
          switch (req.method) {
            case Method.Get:
              return routeHandler.get(request, response);
            case Method.Post:
              return routeHandler.post(request, response);
            case Method.Put:
              return routeHandler.put(request, response);
            case Method.Delete:
              return routeHandler.del(request, response);
            case Method.Patch:
              return routeHandler.patch(request, response);
            case Method.Options:
              return routeHandler.options(request, response);
            case Method.Head:
              return routeHandler.head(request, response);
            default:
              return routeHandler.get(request, response);
          }
        } catch (err: any) {
          webLogger.error(err.message);

          if (err.name === 'ValidationError') {
            const e = err as ValidationError;
            const i = e.issues.flatMap((i) => i.path);

            return res.status(400).json({
              error: 400,
              message: 'The request body was malformed.',
              fields: i
            });
          }

          if (err.message === 'Unauthorized')
            return res.status(401).json({
              error: 401,
              message: "You're not authorized to view this resource."
            });

          res.status(500).json({
            error: 500,
            message: 'Internal Server Error'
          });
        }
      });
    } else logger.info(chalk.red('⦿'), `\`${routePath}\``);
  }

  app.use((err: any, req: any, res: any, next: any) => {
    webLogger.error(err);
    if (res.headersSent) return next(err);

    if (err.name === 'ValidationError') {
      const e = err as ValidationError;
      const i = e.issues.flatMap((i) => i.path);

      return res.status(400).json({
        error: 400,
        message: 'The request body was malformed.',
        fields: i
      });
    }

    if (err.message === 'Unauthorized')
      return res.status(401).json({
        error: 401,
        message: "You're not authorized to view this resource."
      });

    res.status(500).json({
      error: 500,
      message: 'Internal Server Error'
    });
  });

  app.use((req, res) => {
    res.status(404).json({
      error: 404,
      message: 'Not Found'
    });
  });

  console.log(`[startup] starting http server on port ${PORT}`);
  app.listen(PORT, () => {
    console.log('[startup] listening', { PORT });
    logger.info('○ Port:', PORT);
    logger.info('○ Startup:', Date.now() - startTimestamp, '(ms)');

    // Market Data Updater (non-blocking)
    setImmediate(() => {
      MarketData.updateData().catch((err) =>
        logger.error('Market data update failed:', err)
      );
    });

    cron.schedule('* * * * *', async () => {
      logger.info('Updating market data...');
      await MarketData.updateData();
    });
  });
})().catch((err) => {
  if (!err['errors']) logger.error(err);
  else
    err['errors'].forEach((e: any) => {
      logger.error(e);
    });
});

// :3
// Override default toString()s to return stuff in a 'better' way.
(Date.prototype as any).toJSON = function () {
  return this.getTime();
};

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
