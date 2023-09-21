import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const configSchema = z.object({
  DATABASE_URL: z.string(),
});
export default registerAs('database', async () => {
  return configSchema.parse(process.env);
});
