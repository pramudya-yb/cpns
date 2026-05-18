import { relations } from "drizzle-orm";
import { pgTable, text, integer, timestamp, jsonb, uuid, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const userCredit = pgTable(
  "user_credit",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    tokenBalance: integer("token_balance").default(0).notNull(),
    lifetimeTokensUsed: integer("lifetime_tokens_used").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("userCredit_userId_idx").on(table.userId)],
);

export const creditTransaction = pgTable(
  "credit_transaction",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    type: text("type").notNull(),
    description: text("description"),
    tokensUsed: integer("tokens_used"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("creditTransaction_userId_idx").on(table.userId)],
);

export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminUserId: text("admin_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    targetUserId: text("target_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    details: jsonb("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("adminAuditLog_adminUserId_idx").on(table.adminUserId),
    index("adminAuditLog_action_idx").on(table.action),
  ],
);

export const userCreditRelations = relations(userCredit, ({ one }) => ({
  user: one(user, {
    fields: [userCredit.userId],
    references: [user.id],
  }),
}));

export const creditTransactionRelations = relations(creditTransaction, ({ one }) => ({
  user: one(user, {
    fields: [creditTransaction.userId],
    references: [user.id],
  }),
}));

export const adminAuditLogRelations = relations(adminAuditLog, ({ one }) => ({
  admin: one(user, {
    fields: [adminAuditLog.adminUserId],
    references: [user.id],
    relationName: "adminAuditLog_adminUser",
  }),
  target: one(user, {
    fields: [adminAuditLog.targetUserId],
    references: [user.id],
    relationName: "adminAuditLog_targetUser",
  }),
}));

export const platformConfig = pgTable("platform_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
