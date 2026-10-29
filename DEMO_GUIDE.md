# ForgeFlow Mobile ERP — Presentation & Submission Guide

> **Production-Grade Mobile ERP: Procurement, Inventory & GST Control Tower**  
> Built for small manufacturers across India, featuring 120 manufacturers, 80 vendors, 2,000 purchase transactions, 755 stock items, and 2,000 GST reconciliation records.

---

## 1. Quick Overview

ForgeFlow has been transformed into a **page-wise, mobile-app-first web application** ("mobile app like page wise not tab wise, simple and elegant"):
- **Page-wise Navigation**: Replaced cluttered nested desktop tabs with clean, dedicated mobile screens (`home`, `inventory`, `inventory-detail`, `orders`, `order-detail`, `new-order`, `gst`, `vendors`, `vendor-detail`, `manufacturers`, `matching`, `reports`, `scenarios`).
- **Interactive Device Mode Switcher**:
  - 📱 **Mobile Phone Frame**: Renders inside a realistic smartphone mockup (iPhone titanium chassis, Dynamic Island, status bar, and bottom home bar). Perfect for demonstrating native mobile ergonomics!
  - 💻 **Full View**: Expands to a clean, mobile-first responsive full-screen app.
- **Full Synthetic Dataset Integrated**:
  - **120 Manufacturers** (`MFG001` to `MFG120`) across 10+ states (Textiles, Packaging, Furniture, Food, Plastics, Auto, Electrical, Metals).
  - **80 Approved Vendors** (`VEN001` to `VEN080`) with reliability ratings (1-5 ⭐) and payment terms.
  - **2,000 Purchase Orders & Invoices** (`PO00001` to `PO02000`) with commercial terms, tax calculation, and payment tracking.
  - **755 Inventory Records** (`STK00001` to `STK00755`) with real-time `LOW STOCK` alerts and reorder thresholds.
  - **2,000 GST Reconciliation Records** cross-referencing invoice books against GSTR-2B portal filings.

---

## 2. Walkthrough & Evaluation Steps

### Step 1: Home Dashboard & Active Manufacturer
1. Open the app (`http://localhost:5173`).
2. Notice the **Manufacturer Hero Card** displaying active facility details (`MFG001 · Aarav Products 001`, Chennai, Tamil Nadu, 36 staff, GSTIN).
3. Tap **"Switch"** or navigate to **"Mfg (120)"** to browse all 120 manufacturers across Karnataka, Tamil Nadu, Maharashtra, Gujarat, etc., or tap **"Consolidated View (All 120)"**.
4. Check the **Urgent Attention Banner** highlighting low stock items, overdue bills, and 3-way match discrepancies.

### Step 2: Inventory & Stock Replenishment (Scenario A)
1. Tap **"Stock"** in the bottom navigation dock.
2. Filter by **"Low Stock"** to inspect materials whose closing stock is below reorder level.
3. Tap on any item (e.g. `RM005 · Cotton Fabric` or `RM007 · Wooden Board`) to open the **Material Details Page**.
4. Review the **Automated Replenishment Formula**:
   $$\text{Recommended Order Qty} = \text{Target Stock (2x Buffer)} - \text{Current Closing Stock}$$
5. Tap **"Generate Purchase Order"** to instantly generate an approved purchase order and jump to its detail!

### Step 3: Purchases, Invoicing & 3-Way Matching (Scenarios B & C)
1. Tap **"Orders"** in the bottom navigation dock.
2. Filter by **"Overdue"**, **"Mismatch"**, or **"Pending GRN"**.
3. Tap on any order to open the **Invoice & 3-Way Match Page**:
   - Compares:
     1. **PO Contract**: Contracted quantity and unit price.
     2. **Physical GRN**: Verified received units.
     3. **Vendor Invoice**: Claimed billed count and taxes.
   - If mismatched, the invoice is locked on **`DISCREPANCY_HOLD`**.
4. Tap **"Clear & Approve Match"** to resolve discrepancies, or tap **"Mark as Paid"** to update disbursement.

### Step 4: Statutory GST & Input Tax Credit (Scenario D)
1. Tap **"GST & ITC"** in the bottom navigation dock.
2. View the intra-state vs inter-state tax engine:
   - **Intra-State**: Inward supply from matching state calculates $50\%\ \text{CGST} + 50\%\ \text{SGST}$.
   - **Inter-State**: Inward supply from other states calculates $100\%\ \text{IGST}$.
3. Review GSTR-2B filing status (`Yes`, `No / Different Details`, `Pending Check`).
4. Invoices with variance are flagged on **`Hold - Verify Documents`** to prevent wrongful tax deductions.
5. Tap **"Approve"** on any record to clear the ITC claim!

### Step 5: Vendor Directory & History
1. Tap **"More"** $\rightarrow$ **"Vendors"**.
2. Browse 80 vendors with category filters (Chemicals, Packaging, Electronics, Metals, etc.).
3. View reliability ratings, payment terms, and historical spend.
4. Tap on any vendor to see all transactions placed with that supplier.

### Step 6: 1-Click CSV Data Exports
1. Tap **"Reports"**.
2. Tap **"Purchases & Invoices"**, **"Inventory Balances"**, or **"GSTR-2B Reconciliation"** to instantly download full CSV sheets.

---

## 3. Running & Testing

```bash
# 1. Run development server
npm run dev

# 2. Run automated test suite
npm test

# 3. Build production bundle
npm run build
```
