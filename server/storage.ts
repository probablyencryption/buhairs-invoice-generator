import { type Invoice, type InsertInvoice, type Setting, type InsertSetting, invoices, settings } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getInvoice(id: string): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;
}

export class DbStorage implements IStorage {
  async getInvoice(id: string): Promise<Invoice | undefined> {
    try {
      const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw new Error('Failed to fetch invoice');
    }
  }

  async getAllInvoices(): Promise<Invoice[]> {
    try {
      return await db.select().from(invoices).orderBy(desc(invoices.invoiceNumber)).limit(100);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    try {
      const result = await db.insert(invoices).values(insertInvoice).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new Error('Failed to create invoice');
    }
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    try {
      const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching setting:', error);
      return undefined;
    }
  }

  async setSetting(insertSetting: InsertSetting): Promise<Setting> {
    try {
      const existing = await this.getSetting(insertSetting.key);
      if (existing) {
        const result = await db
          .update(settings)
          .set({ value: insertSetting.value })
          .where(eq(settings.key, insertSetting.key))
          .returning();
        return result[0];
      }
      const result = await db.insert(settings).values(insertSetting).returning();
      return result[0];
    } catch (error) {
      console.error('Error setting value:', error);
      throw new Error('Failed to update setting');
    }
  }
}

export const storage = new DbStorage();
