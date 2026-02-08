# BU Hairs Invoice Generator

A powerful, modern invoice generation system built for BU Luxury Hairs. This application streamlines the process of creating professional invoices for both single orders and bulk transactions, featuring AI-powered data extraction and a flexible hybrid numbering system.

![BU Invoice Generator](./attached_assets/BU-LOGO.png)

## 🚀 Features

### 🌟 Hybrid Invoice Numbering
- **Auto-Increment Mode**: Automatically generates unique invoice numbers with the **`BHS#`** prefix (e.g., `BHS#3101`).
- **Manual Mode**: Allows manual entry of invoice numbers, expecting the **`BH#`** prefix (e.g., `BH#Manual-001`).
- **Fallback Protection**: In bulk manual mode, if an invoice number is missing, the system intelligently defaults to `BH#XXXX` to preserve data integrity.

### 🤖 AI-Powered Bulk Processing
- Paste raw customer data (e.g., from WhatsApp or spreadsheets).
- **OpenAI integration** automatically extracts Name, Phone, Address, PRE Codes, and Invoice Numbers.
- Supports processing up to 20 invoices simultaneously.

### 📄 Flexible Output
- Generate invoices in **PDF** or **JPEG** formats.
- Instant preview of invoices before generation.
- History tracking of all generated invoices.

### ⚙️ Customizable Settings
- Toggle between Auto and Hybrid/Manual modes.
- Adjust the "Last Invoice Number" counter freely.
- Upload and manage brand logo.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-4o-mini
- **PDF Generation**: jsPDF, html2canvas

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/probablyencryption/buhairs-invoice-generator.git
    cd buhairs-invoice-generator
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory and populate it with your database and API keys:
    ```env
    DATABASE_URL=postgresql://user:password@host:port/dbname
    OPENAI_API_KEY=sk-...
    ```

4.  **Run the application**
    ```bash
    npm run dev
    ```

## 📖 Usage Guide

### Single Invoice
1.  Navigate to the "Single" tab.
2.  Fill in customer details.
3.  (Optional) Enable "Manual Mode" via the toggle in the header to enter a custom invoice number.
4.  Click "Download PDF" or "Download JPEG".

### Bulk Invoice
1.  Navigate to the "Bulk" tab.
2.  Enable "Manual Mode" if you have pre-assigned invoice numbers.
3.  Paste customer data.
    - **Auto Mode Format**: `Name : Phone : Address`
    - **Manual Mode Format**: `Name : Phone : Address : Invoice Number`
4.  Click "Process & Generate".

## 🔒 Authentication
The system uses a simple session-based authentication with a configured app password to secure access.

---

Built with ❤️ for BU Luxury Hairs.
