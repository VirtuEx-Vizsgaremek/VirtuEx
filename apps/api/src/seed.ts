import { orm } from '@/util/orm';
import { MarketDataSeeder } from '@/seeders/market_data.seeder';
import { UsersSeeder } from '@/seeders/users.seeder';

async function seed() {
  const db = await orm;

  try {
    const { ok } = await db.checkConnection();
    if (!ok) throw new Error('Database connection failed');

    await db.schema.refreshDatabase();
    await db.seeder.seed(MarketDataSeeder, UsersSeeder);

    console.log('Seed completed successfully.');
    console.log('Dev wallet ID:', '66626843268088832');
    console.log('Regular user:', 'john@example.com / SecurePassword123');
    console.log('Admin user:', 'admin@example.com / SecurePassword123');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await db.close();
  }
}

seed();
