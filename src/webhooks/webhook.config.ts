import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const configSchema = z.object({
  WEBHOOK_SECRET: z.string(),
});
export default registerAs('webhook', async () => {
  return configSchema.parse(process.env);
});
