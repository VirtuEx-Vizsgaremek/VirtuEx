import fs from 'node:fs/promises';
import path from 'node:path';

import dotenv from 'dotenv';
import { Client } from 'pg';

const envPath = path.resolve(__dirname, '..', '.env');

dotenv.config({ path: envPath });

const SUBSCRIPTION_COLUMNS = [
  'billing_period',
  'pending_plan_id',
  'pending_billing_period',
  'pending_effective_at'
];

const PLAN_COLUMNS = ['monthly_price', 'yearly_price'];

const MIGRATIONS = [
  {
    name: '20260408_add_subscription_pending',
    table: 'subscription',
    filePath: path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'packages',
      'database',
      'migrations',
      '20260408_add_subscription_pending.sql'
    ),
    columns: SUBSCRIPTION_COLUMNS
  },
  {
    name: '20260410_add_subscription_plan_prices',
    table: 'subscription_plan',
    filePath: path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'packages',
      'database',
      'migrations',
      '20260410_add_subscription_plan_prices.sql'
    ),
    columns: PLAN_COLUMNS
  }
];

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing ${key} in ${envPath}.`);
  }
  return value;
};

const truncateBody = (value: string, maxLength = 10000) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...[truncated ${
    value.length - maxLength
  } chars]`;
};

const logDbTarget = (config: {
  host: string;
  port: number;
  database: string;
  user: string;
}) => {
  console.log('[db:migrate] Target database', config);
};

const fetchColumnNames = async (client: Client, table: string) => {
  const columns = await client.query<{ column_name: string }>(
    `select column_name
     from information_schema.columns
     where table_schema = 'public' and table_name = $1`,
    [table]
  );
  return columns.rows.map((row) => row.column_name);
};

const tableExists = async (client: Client, table: string) => {
  const result = await client.query(
    `select 1
     from information_schema.tables
     where table_schema = 'public' and table_name = $1
     limit 1`,
    [table]
  );
  return result.rowCount > 0;
};

const run = async () => {
  const host = getRequiredEnv('DB_HOST');
  const port = Number(getRequiredEnv('DB_PORT'));
  const database = getRequiredEnv('DB_NAME');
  const user = getRequiredEnv('DB_USER');
  const password = getRequiredEnv('DB_PASS');

  if (Number.isNaN(port)) {
    throw new Error('DB_PORT must be a valid number.');
  }

  logDbTarget({ host, port, database, user });

  const client = new Client({ host, port, database, user, password });

  try {
    await client.connect();

    const tableRequirements = [
      { table: 'subscription', columns: SUBSCRIPTION_COLUMNS },
      { table: 'subscription_plan', columns: PLAN_COLUMNS }
    ];

    const missingByTable = new Map<string, string[]>();

    for (const { table, columns } of tableRequirements) {
      const exists = await tableExists(client, table);
      if (!exists) {
        throw new Error(
          `Table "${table}" not found. Run schema setup before migrations.`
        );
      }

      const existingColumns = new Set(await fetchColumnNames(client, table));
      const missingColumns = columns.filter(
        (column) => !existingColumns.has(column)
      );

      missingByTable.set(table, missingColumns);
      if (missingColumns.length > 0) {
        console.log(
          `[db:migrate] Missing columns in ${table}: ${missingColumns.join(', ')}`
        );
      }
    }

    const hasMissing = Array.from(missingByTable.values()).some(
      (columns) => columns.length > 0
    );

    if (!hasMissing) {
      console.log('[db:migrate] Subscription schema is up to date.');
      return;
    }

    for (const migration of MIGRATIONS) {
      const missingColumns = missingByTable.get(migration.table) ?? [];
      const shouldRun = migration.columns.some((column) =>
        missingColumns.includes(column)
      );
      if (!shouldRun) continue;

      console.log(`[db:migrate] Running ${migration.name}...`);
      const sql = await fs.readFile(migration.filePath, 'utf8');
      await client.query(sql);
      console.log(`[db:migrate] Completed ${migration.name}.`);
    }

    for (const { table, columns } of tableRequirements) {
      const updatedColumns = new Set(await fetchColumnNames(client, table));
      const stillMissing = columns.filter(
        (column) => !updatedColumns.has(column)
      );

      if (stillMissing.length > 0) {
        throw new Error(
          `Migration finished but columns are still missing in ${table}: ${stillMissing.join(', ')}`
        );
      }
    }

    console.log('[db:migrate] Subscription migrations applied successfully.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[db:migrate] Failed:', truncateBody(message));
    throw error;
  } finally {
    await client.end().catch(() => undefined);
  }
};

run().catch(() => {
  process.exitCode = 1;
});
