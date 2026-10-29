# ForgeFlow — Mobile ERP & GST Control Tower

> **Manufacturing Procurement, Inventory & GST Operations Platform**  
> Tailored for small manufacturers operating multi-state supply chains across India.

---

## 1. Problem Statement & Architecture

### The Problem
Small manufacturers managing multi-tier supply chains face critical operational friction:
1. **Material Shortages**: Sudden stockouts halting assembly lines due to lack of automated replenishment triggers.
2. **Shortage Deliveries**: Paying vendor invoices for quantities that were never physically accepted in the warehouse.
3. **Discrepant Billing**: Invoices billed above purchase order contracts or without delivered goods receipts.
4. **Blocked Input Tax Credit (ITC)**: GSTR-2B mismatches and supplier filing failures leading to tax penalties.

### The Solution
ForgeFlow provides a clean, mobile-app-first, page-wise control tower integrating:
- **120 Manufacturers** across 10 Indian states with category, employee, and GSTIN profiles.
- **80 Approved Vendors** with reliability scores (1-5 ⭐) and payment terms.
- **2,000 Purchase Transactions** with full commercial terms, tax calculation, and payment status tracking.
- **755 Inventory Records** with live `LOW STOCK` alerts, reorder levels, and asset valuations.
- **2,000 GST Reconciliation Records** cross-referencing invoice books against GSTR-2B portal filings.

---

## 2. Key Features & Business Workflows

### A. Mobile-First Page-Wise Navigation
- **Page-wise (Not Tab-wise)**: Each workflow has a dedicated screen with clean hierarchy, breadcrumbs, and back navigation (`home`, `inventory`, `inventory-detail`, `orders`, `order-detail`, `new-order`, `gst`, `vendors`, `vendor-detail`, `manufacturers`, `matching`, `reports`, `scenarios`).
- **Device Mode Switcher**:
  - 📱 **Mobile Phone Mockup Mode**: View the app inside an iPhone chassis with Dynamic Island, status bar, and bottom gesture bar.
  - 💻 **Full View**: Expands to a clean, mobile-first responsive full-screen app.

### B. Automated Low-Stock Replenishment
- Evaluates stock: $\text{Recommended Order Qty} = \max(0, \text{Target Stock} - \text{Current Stock})$.
- 1-Tap Purchase Order generation directly from the item detail screen.

### C. Three-Way Matching (PO vs GRN vs Invoice)
- Compares PO Contract, Physical GRN Receipts, and Vendor Invoiced totals.
- Gated payment approval: Invoices with discrepancies are placed on **`DISCREPANCY_HOLD`** until resolved.

### D. Statutory GST & ITC Control Tower
- **Intra-State**: Inward supply from matching state calculates $50\%\ \text{CGST} + 50\%\ \text{SGST}$.
- **Inter-State**: Inward supply from other states calculates $100\%\ \text{IGST}$.
- Restricts claimable ITC on invoices where vendor GSTR-2B filing is missing or discrepant.

---

## 3. Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Design System**: Industrial-tech dark theme (`#0B0F19`, `#1E293B`, `#3B82F6`, `#10B981`)
- **Icons**: Lucide Icons
- **Data Engine**: Reactive state with localStorage persistence and instant 1-click dataset reset
- **Testing**: Vitest acceptance test suite

---

## 4. Setup & Running Instructions

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
http://localhost:5173

# 4. Run automated tests
npm test

# 5. Build production bundle
npm run build
```
