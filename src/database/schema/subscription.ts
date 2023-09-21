import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { user } from './user';

export enum SubscriptionStatus {
  Activated = 'activated',
  Inactivated = 'inactivated',
  Cancelled = 'cancelled',
}
export const subscription = pgTable('subscriptions', {
  id: uuid('id').primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  status: text('status')
    .notNull()
    .$type<SubscriptionStatus>()
    .default(SubscriptionStatus.Activated),
  currentPeriodStart: timestamp('current_period_start', { mode: 'date' }),
  currentPeriodEnd: timestamp('current_period_end', { mode: 'date' }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  cancelledAt: timestamp('cancelled_at', { mode: 'date' }),
});
