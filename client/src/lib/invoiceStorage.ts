export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  preCode?: string;
}

export interface AppSettings {
  lastInvoiceNumber: number;
  logoUrl?: string;
}

const STORAGE_KEYS = {
  INVOICES: 'bu_invoices',
  SETTINGS: 'bu_settings',
  LOGO: 'bu_logo',
};

export const invoiceStorage = {
  getSettings(): AppSettings {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : { lastInvoiceNumber: 2799 };
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getNextInvoiceNumber(): string {
    const settings = this.getSettings();
    const nextNumber = settings.lastInvoiceNumber + 1;
    return `BLH#${nextNumber}`;
  },

  incrementInvoiceNumber(): string {
    const settings = this.getSettings();
    settings.lastInvoiceNumber += 1;
    this.saveSettings(settings);
    return `BLH#${settings.lastInvoiceNumber}`;
  },

  getAllInvoices(): InvoiceData[] {
    const invoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return invoices ? JSON.parse(invoices) : [];
  },

  saveInvoice(invoice: InvoiceData): void {
    const invoices = this.getAllInvoices();
    invoices.push(invoice);
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  },

  saveLogo(dataUrl: string): void {
    localStorage.setItem(STORAGE_KEYS.LOGO, dataUrl);
  },

  getLogo(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LOGO);
  },
};
