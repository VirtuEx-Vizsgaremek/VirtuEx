import express from 'express';
import cors from 'cors';
import multer from 'multer';
import expressWs from 'express-ws';

import path from 'node:path';

import Logger from '@/util/logger';
import version from '@/util/version';

const app = expressWs(express()).app;

const logger = new Logger('virtuex::api::main');
const webLogger = new Logger('virtuex::api::req');

const PORT = parseInt(process.env.PORT!) || 3001;

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

  app.listen(PORT, () => {
    logger.info('○ Port:', PORT);
    logger.info('○ Startup:', Date.now() - startTimestamp, '(ms)');
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
