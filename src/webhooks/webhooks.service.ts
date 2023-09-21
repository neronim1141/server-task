import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import webhookConfig from './webhook.config';
import { PG_CONNECTION } from 'src/constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { SubscriptionStatus } from '../database/schema/subscription';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { addMonths } from 'date-fns';
const paymentServiceDataSchema = z.object({
  customerId: z.string(),
});

@Injectable()
export class WebhooksService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
    @Inject(webhookConfig.KEY)
    private config: ConfigType<typeof webhookConfig>,
  ) {}

  async activate(signature: string, buffer: Buffer) {
    const data = await this.decode(signature, buffer);
    const subscription = await this.getSubscription(data.customerId);
    if (!subscription) {
      await this.db.insert(schema.subscription).values({
        id: uuidv4(),
        userId: data.customerId,
        status: SubscriptionStatus.Activated,
        currentPeriodStart: new Date(),
        currentPeriodEnd: addMonths(new Date(), 1),
      });
      return;
    }
    await this.db
      .update(schema.subscription)
      .set({
        status: SubscriptionStatus.Activated,
        currentPeriodStart: new Date(),
        currentPeriodEnd: addMonths(new Date(), 1),
      })
      // Good idea would be to use also subscription id but that depends
      // on the payment service data for simple subscription-customer
      // pair this is good enough
      .where(eq(schema.subscription.userId, data.customerId));
  }
  async inactivate(signature: string, buffer: Buffer) {
    const data = await this.decode(signature, buffer);

    const subscription = await this.getSubscription(data.customerId);
    if (!subscription) {
      throw new BadRequestException(
        'Can not inactivate non existing subscription',
      );
    }
    if (
      [SubscriptionStatus.Inactivated, SubscriptionStatus.Cancelled].includes(
        subscription.status,
      )
    ) {
      throw new BadRequestException(
        'Can not inactivate already inactivated or cancelled subscription',
      );
    }
    await this.db
      .update(schema.subscription)
      .set({
        status: SubscriptionStatus.Inactivated,
        cancelAtPeriodEnd: true,
        cancelledAt: subscription.currentPeriodEnd,
      })
      // Good idea would be to use subscription id but that depends
      // on the payment service data
      .where(eq(schema.subscription.userId, data.customerId));
  }
  async cancel(signature: string, buffer: Buffer) {
    const data = await this.decode(signature, buffer);

    const subscription = await this.getSubscription(data.customerId);
    if (!subscription) {
      throw new BadRequestException('Can not cancel non existing subscription');
    }
    if (SubscriptionStatus.Cancelled === subscription.status) {
      throw new BadRequestException(
        'Can not cancel already cancelled subscription',
      );
    }
    // for keeping track when the subscription was cancelled
    // we are not deleting it
    await this.db
      .update(schema.subscription)
      .set({
        status: SubscriptionStatus.Cancelled,
        cancelledAt: new Date(),
      })
      // Good idea would be to use subscription id but that depends
      // on the payment service data for simple subscription-customer
      // pair this is good enough
      .where(eq(schema.subscription.userId, data.customerId));
  }

  private async getSubscription(userId: string) {
    return await this.db.query.subscription.findFirst({
      where: eq(schema.subscription.userId, userId),
    });
  }

  // this should be changed to decoder from payment service
  // but for now i created this mock
  private async decode(signature: string, buffer: Buffer) {
    try {
      if (signature !== this.config.WEBHOOK_SECRET)
        throw new BadRequestException('Bad signature');
      return paymentServiceDataSchema.parse(JSON.parse(buffer.toString()));
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new BadRequestException('Unable to decode data');
      }
      throw err;
    }
  }
}
