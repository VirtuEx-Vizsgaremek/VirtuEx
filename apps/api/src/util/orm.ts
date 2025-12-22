import { MikroORM } from '@mikro-orm/postgresql';

import config from '@/mikro-orm.config';

const orm = (async () => await MikroORM.init(config))();

export { orm };
