import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertSettingSchema, insertInvoiceSchema } from "@shared/schema";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionToken = req.headers['x-app-session'];

  if (!sessionToken) {
    return res.status(401).json({ error: 'Unauthorized - no session' });
  }

  try {
    const activeSession = await storage.getSetting("active_session");

    if (activeSession && sessionToken === activeSession.value) {
      return next();
    }

    return res.status(401).json({ error: 'Unauthorized - invalid session' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}

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
          const sessionToken = `bu_session_${Date.now()}_${Math.random().toString(36)}`;
          await storage.setSetting({
            key: "active_session",
            value: sessionToken,
          });
          return res.json({ success: true, token: sessionToken });
        }
      }

      if (passwordSetting && password === passwordSetting.value) {
        const sessionToken = `bu_session_${Date.now()}_${Math.random().toString(36)}`;
        await storage.setSetting({
          key: "active_session",
          value: sessionToken,
        });
        return res.json({ success: true, token: sessionToken });
      }

      res.status(401).json({ success: false, message: "Invalid password" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/api/auth/session", requireAuth, async (req, res) => {
    res.json({ valid: true });
  });

  app.get("/api/settings/logo", async (req, res) => {
    try {
      const logoSetting = await storage.getSetting("app_logo");

      if (!logoSetting) {
        const logoPath = path.join(process.cwd(), "attached_assets", "BU-LOGO.png");
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

  app.post("/api/settings/logo", requireAuth, async (req, res) => {
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

  app.get("/api/settings/invoice-number", requireAuth, async (req, res) => {
    try {
      const setting = await storage.getSetting("last_invoice_number");

      if (!setting) {
        const newSetting = await storage.setSetting({
          key: "last_invoice_number",
          value: "3100",
        });
        return res.json({ lastInvoiceNumber: parseInt(newSetting.value) });
      }

      res.json({ lastInvoiceNumber: parseInt(setting.value) });
    } catch (error) {
      res.status(500).json({ lastInvoiceNumber: 3100 });
    }
  });

  app.post("/api/settings/invoice-number/increment", requireAuth, async (req, res) => {
    try {
      const setting = await storage.getSetting("last_invoice_number");
      const currentNumber = setting ? parseInt(setting.value) : 3100;
      const nextNumber = currentNumber + 1;

      await storage.setSetting({
        key: "last_invoice_number",
        value: nextNumber.toString(),
      });

      res.json({ invoiceNumber: `BH#${nextNumber}` });
    } catch (error) {
      res.status(500).json({ error: "Failed to increment invoice number" });
    }
  });

  app.get("/api/settings/last-invoice", requireAuth, async (req, res) => {
    try {
      const lastNumber = await storage.getLastInvoiceNumber();
      res.json({ lastInvoiceNumber: lastNumber });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch last invoice number" });
    }
  });

  app.patch("/api/settings/last-invoice", requireAuth, async (req, res) => {
    try {
      const { invoiceNumber } = req.body;

      if (!invoiceNumber || typeof invoiceNumber !== 'number') {
        return res.status(400).json({ error: "Invalid invoice number" });
      }

      await storage.updateLastInvoiceNumber(invoiceNumber);
      res.json({ lastInvoiceNumber: invoiceNumber });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update invoice number" });
    }
  });

  app.post("/api/invoices", requireAuth, async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);

      const setting = await storage.getSetting("last_invoice_number");
      const currentNumber = setting ? parseInt(setting.value) : 2799;
      const nextNumber = currentNumber + 1;

      await storage.setSetting({
        key: "last_invoice_number",
        value: nextNumber.toString(),
      });

      res.json({
        invoice,
        nextInvoiceNumber: `BH#${nextNumber}`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid invoice data",
          details: error.errors
        });
      }
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  app.get("/api/invoices", requireAuth, async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices/bulk-process", requireAuth, async (req, res) => {
    try {
      const { rawData, includePre, date, format } = req.body;

      if (!rawData || typeof rawData !== 'string') {
        return res.status(400).json({ error: "Invalid customer data" });
      }

      if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: "Invalid date" });
      }

      if (!format || (format !== 'pdf' && format !== 'jpeg')) {
        return res.status(400).json({ error: "Invalid format. Must be 'pdf' or 'jpeg'" });
      }

      // Validate maximum 20 customers and normalize raw lines
      const rawLines = rawData.trim().split('\n').filter(line => line.trim() !== '');
      if (rawLines.length > 20) {
        return res.status(400).json({ error: "Maximum 20 customers allowed per bulk upload" });
      }

      if (rawLines.length === 0) {
        return res.status(400).json({ error: "No customer data provided" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const systemPrompt = includePre
        ? `You are a data extraction assistant. Extract customer information from the provided text and return it as a JSON array. Each customer should have: name, phone, address, and preCode. For PRE codes: ALWAYS strip any "PRE" prefix and return ONLY the 7-digit number. Examples: "PRE7812344" becomes "7812344", "PRE 1234567" becomes "1234567". If you cannot find exactly 7 digits, set preCode to null. The data is separated by colons (:). Return ONLY valid JSON array, no markdown formatting.`
        : `You are a data extraction assistant. Extract customer information from the provided text and return it as a JSON array. Each customer should have: name, phone, and address. The data is separated by colons (:). Return ONLY valid JSON array, no markdown formatting.`;

      const userPrompt = includePre
        ? `Extract customer data from this text. Each line is separated by colons and contains: Name : Phone : Address : PRE Code. IMPORTANT: Strip any "PRE" prefix from codes and return only the 7 digits. Return as JSON array with fields: name, phone, address, preCode (7 digits only, no prefix).\n\n${rawData}`
        : `Extract customer data from this text. Each line is separated by colons and contains: Name : Phone : Address. Return as JSON array with fields: name, phone, address.\n\n${rawData}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
      });

      const responseText = completion.choices[0]?.message?.content?.trim() || '';

      let parsedData: Array<{
        name: string;
        phone: string;
        address: string;
        preCode?: string;
      }> = [];

      try {
        const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsedData = JSON.parse(cleanedResponse);

        if (!Array.isArray(parsedData)) {
          throw new Error('Response is not an array');
        }

        parsedData = parsedData.map((customer, index) => {
          const cleaned: any = {
            name: customer.name?.trim() || '',
            phone: customer.phone?.trim() || '',
            address: customer.address?.trim() || '',
            preCode: null, // Default to null
          };

          if (includePre) {
            let preCodeStr = '';

            // PRIMARY METHOD: Parse directly from raw data (using normalized rawLines array)
            if (rawLines[index]) {
              const parts = rawLines[index].split(':');
              if (parts.length >= 4) {
                // Extract last field (4th position) and strip all non-digits
                // This handles both "PRE7812344" and "7812344" formats
                const rawPreCode = parts[3].trim().replace(/\D/g, '');
                if (rawPreCode.length === 7) {
                  preCodeStr = rawPreCode;
                }
              }
            }

            // FALLBACK: Use OpenAI extraction if raw parsing failed
            if (!preCodeStr && customer.preCode) {
              const openaiPreCode = customer.preCode.toString().trim().replace(/\D/g, '');
              if (openaiPreCode.length === 7) {
                preCodeStr = openaiPreCode;
              }
            }

            // Only set if exactly 7 digits
            if (preCodeStr.length === 7) {
              cleaned.preCode = preCodeStr;
            }
          }

          return cleaned;
        });

      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', responseText);
        return res.status(500).json({
          error: "Failed to parse customer data from AI response",
          details: responseText
        });
      }

      const setting = await storage.getSetting("last_invoice_number");
      let currentNumber = setting ? parseInt(setting.value) : 2799;

      const invoicesCreated: Array<{
        invoiceNumber: string;
        date: string;
        customerName: string;
        customerPhone: string;
        customerAddress: string;
        preCode: string | null;
        success: boolean;
        error?: string;
      }> = [];

      for (const customer of parsedData) {
        try {
          currentNumber++;
          const invoiceNumber = `BH#${currentNumber}`;

          const invoiceData = {
            invoiceNumber,
            date,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerAddress: customer.address,
            preCode: customer.preCode || null,
          };

          const validatedData = insertInvoiceSchema.parse(invoiceData);
          await storage.createInvoice(validatedData);

          await storage.setSetting({
            key: "last_invoice_number",
            value: currentNumber.toString(),
          });

          invoicesCreated.push({
            invoiceNumber: invoiceData.invoiceNumber,
            date: invoiceData.date,
            customerName: invoiceData.customerName,
            customerPhone: invoiceData.customerPhone,
            customerAddress: invoiceData.customerAddress,
            preCode: invoiceData.preCode,
            success: true,
          });
        } catch (invoiceError: any) {
          invoicesCreated.push({
            invoiceNumber: `BH#${currentNumber}`,
            date,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerAddress: customer.address,
            preCode: customer.preCode || null,
            success: false,
            error: invoiceError.message || 'Unknown error',
          });
        }
      }

      res.json({ invoices: invoicesCreated });
    } catch (error: any) {
      console.error('Bulk processing error:', error);
      res.status(500).json({
        error: "Failed to process bulk data",
        message: error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
