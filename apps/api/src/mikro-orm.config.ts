import {
  Options,
  PostgreSqlDriver,
  DefaultLogger,
  LoggerNamespace,
  LogContext
} from '@mikro-orm/postgresql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

import Logger from '@/util/logger';

class CustomLogger extends DefaultLogger {
  log(namespace: LoggerNamespace, message: string, context?: LogContext) {
    const logger = new Logger(`virtuex::api::orm::${namespace}`);
    // Create your own implementation for output:

    switch ((context || { level: 'info' }).level) {
      case 'info':
        logger.info(message);
        break;
      case 'error':
        logger.error(message);
        break;
      case 'warning':
        logger.warn(message);
        break;
    }
  }
}

const config: Options = {
  driver: PostgreSqlDriver,
  dbName: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  entities: ['build/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  debug: true,
  loggerFactory: (options) => new CustomLogger(options),
  highlighter: new SqlHighlighter()
};

export default config;
