import type { Config } from 'drizzle-kit';
import 'dotenv/config';
export default {
  schema: './src/database/schema',
  out: './src/database/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL ?? '',
  },
} satisfies Config;
