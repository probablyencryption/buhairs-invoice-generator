import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull().unique(),
  date: text("date").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  preCode: text("pre_code"),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;
