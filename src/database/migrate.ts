import 'dotenv/config';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

async function runMigrations() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not defined');
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client);

  console.log('⌛ Running migrations....');

  const start = Date.now();

  await migrate(db, { migrationsFolder: 'src/database/migrations' });

  const end = Date.now();
  console.log('✅ Migrations completed in', end - start, 'ms');
  process.exit(1);
}
runMigrations().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
