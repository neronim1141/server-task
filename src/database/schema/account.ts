import { pgTable, text, primaryKey, uuid } from "drizzle-orm/pg-core";
import { user } from ".";

export const account = pgTable(
  "accounts",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").$type<"oauth" | "oidc" | "email">(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    //TODO: refesh tokens etc.
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  })
);
