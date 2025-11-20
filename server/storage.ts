import { type Invoice, type InsertInvoice, type Setting, type InsertSetting } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getInvoice(id: string): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;
}

export class MemStorage implements IStorage {
  private invoices: Map<string, Invoice>;
  private settings: Map<string, Setting>;

  constructor() {
    this.invoices = new Map();
    this.settings = new Map();
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values());
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = randomUUID();
    const invoice: Invoice = { ...insertInvoice, id };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    return Array.from(this.settings.values()).find(
      (setting) => setting.key === key,
    );
  }

  async setSetting(insertSetting: InsertSetting): Promise<Setting> {
    const existing = await this.getSetting(insertSetting.key);
    if (existing) {
      const updated: Setting = { ...existing, value: insertSetting.value };
      this.settings.set(existing.id, updated);
      return updated;
    }
    const id = randomUUID();
    const setting: Setting = { ...insertSetting, id };
    this.settings.set(id, setting);
    return setting;
  }
}

export const storage = new MemStorage();
