import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertSettingSchema, insertInvoiceSchema } from "@shared/schema";
import fs from "fs";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { password } = req.body;
      const passwordSetting = await storage.getSetting("app_password");
      
      if (!passwordSetting) {
        const defaultPassword = await storage.setSetting({
          key: "app_password",
          value: "bu2025",
        });
        
        if (password === defaultPassword.value) {
          return res.json({ success: true });
        }
      }
      
      if (passwordSetting && password === passwordSetting.value) {
        return res.json({ success: true });
      }
      
      res.status(401).json({ success: false, message: "Invalid password" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/api/settings/logo", async (req, res) => {
    try {
      const logoSetting = await storage.getSetting("app_logo");
      
      if (!logoSetting) {
        const logoPath = path.join(process.cwd(), "attached_assets", "Logo png_1763664358506.PNG");
        if (fs.existsSync(logoPath)) {
          const logoBuffer = fs.readFileSync(logoPath);
          const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
          
          const newLogo = await storage.setSetting({
            key: "app_logo",
            value: logoBase64,
          });
          
          return res.json({ logo: newLogo.value });
        }
      }
      
      res.json({ logo: logoSetting?.value || null });
    } catch (error) {
      res.status(500).json({ logo: null });
    }
  });

  app.post("/api/settings/logo", async (req, res) => {
    try {
      const { logo } = req.body;
      const logoSetting = await storage.setSetting({
        key: "app_logo",
        value: logo,
      });
      res.json({ logo: logoSetting.value });
    } catch (error) {
      res.status(500).json({ error: "Failed to save logo" });
    }
  });

  app.get("/api/settings/invoice-number", async (req, res) => {
    try {
      const setting = await storage.getSetting("last_invoice_number");
      
      if (!setting) {
        const newSetting = await storage.setSetting({
          key: "last_invoice_number",
          value: "2799",
        });
        return res.json({ lastInvoiceNumber: parseInt(newSetting.value) });
      }
      
      res.json({ lastInvoiceNumber: parseInt(setting.value) });
    } catch (error) {
      res.status(500).json({ lastInvoiceNumber: 2799 });
    }
  });

  app.post("/api/settings/invoice-number/increment", async (req, res) => {
    try {
      const setting = await storage.getSetting("last_invoice_number");
      const currentNumber = setting ? parseInt(setting.value) : 2799;
      const nextNumber = currentNumber + 1;
      
      await storage.setSetting({
        key: "last_invoice_number",
        value: nextNumber.toString(),
      });
      
      res.json({ invoiceNumber: `BLH#${nextNumber}` });
    } catch (error) {
      res.status(500).json({ error: "Failed to increment invoice number" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.json(invoice);
    } catch (error) {
      res.status(400).json({ error: "Invalid invoice data" });
    }
  });

  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
