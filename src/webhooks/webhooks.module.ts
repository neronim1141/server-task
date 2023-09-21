import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { ConfigModule } from '@nestjs/config';
import webhookConfig from './webhook.config';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [ConfigModule.forFeature(webhookConfig), DatabaseModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
