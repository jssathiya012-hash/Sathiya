# SmartSub – Unified Subscription Management System
## Brightloop Software

SmartSub is a complete, professional, production-ready full-stack subscription management platform engineered for software companies selling subscription-based services (SaaS, Cloud Storage, Video Streaming, Music Streaming, and Masterclasses).

The platform provides a centralized, role-isolated control center for **Admins**, **Staff**, and **Customers** with real-time calculated financial KPIs, multi-period subscription plans, coupon discounting, checkout simulation with 18% GST calculation, automated invoices, payment histories, audit activity logging, and an automated background billing scheduler.

---

## 🎨 Theme & Design Aesthetics
Engineered strictly with the **Light Lavender & Plum** corporate palette:
- **Main Background**: `#F3EFFF` (Light Lavender White)
- **Card Background**: `#FFFFFF` (Pure White with custom soft elevation)
- **Primary Plum**: `#673B70` (Buttons, active navigation, key highlights)
- **Deep Plum**: `#4B2455` (Headings, brand marks, primary text)
- **Light Lavender**: `#E9DDF2` (Card borders, table headers, hover highlights)
- **Soft Purple**: `#D8C2E5` (Secondary chips, accents)
- **Accent Purple**: `#A77BB8` (Badges, sub-headings)
- **Main Text**: `#34243A` (High-contrast charcoal purple)
- **Secondary Text**: `#81758A` (Muted violet-gray)
- **Border**: `#E6DDEC` (Delicate structural dividers)
- **Success**: `#2E9467` | **Warning**: `#D99A39` | **Error**: `#D85B69`

---

## 🚀 Key Features

### 1. 🛡️ Role-Based Access Control (RBAC) & Security
- **Admin**: Full access across all 12 modules, financial metrics, staff management, catalog configuration, audit logs, and company settings.
- **Staff**: Access to assigned customer records, subscriptions, invoice records, and personal profile with restricted system settings.
- **Customer**: Public discovery, interactive subscription checkout with live coupon redemption, GST calculation, subscription lifecycle management (pause, resume, renew, cancel), invoice PDF generation, and payment history.
- Secure JWT-based authentication with bcrypt password hashing and HTTP Bearer tokens.

### 2. 📊 Real-Time Admin Dashboard (12 Computed KPIs)
- 12 dynamically calculated KPIs:
  1. **Total Customers** (Active / Inactive)
  2. **Active Subscriptions**
  3. **Monthly Recurring Revenue (MRR)** in ₹ INR
  4. **Annual Recurring Revenue (ARR)** in ₹ INR
  5. **Total Revenue Collected**
  6. **Pending Payments**
  7. **Expiring Subscriptions** (Within next 7 days)
  8. **Churn Rate (%)**
  9. **Average Revenue Per User (ARPU)**
  10. **Customer Lifetime Value (LTV)**
  11. **Total Invoices Generated**
  12. **Refunded Amount**
- **Recharts Visual Analytics**: Monthly Revenue Trends, Product Subscription Distributions, and Real-time Recent Activity feed.

### 3. 📦 Products & Flexible Plan Tiers
- Multi-tier frequency options in Indian Rupees (₹):
  - **Monthly**
  - **Quarterly**
  - **Half-Yearly**
  - **Yearly**
- Product categories across Cloud Storage, Developer Tools, Video/Audio Streaming, and Online Masterclasses.

### 4. 🎟️ Discount Engine & Test Checkout
- Discount codes support percentage discounts and fixed amount reductions with expiry dates and minimum spend thresholds.
- Pre-seeded coupons: `FESTIVE50` (50% off), `SAVE10` (10% off), `WELCOME200` (₹200 flat discount).
- Automated Indian GST (18%) calculation on discounted subtotals.
- Instant test payment simulation (Credit/Debit Card, UPI, Net Banking) with automated subscription creation and GST tax invoice generation.

### 5. 📄 Tax Invoices & Reports
- Tax invoice generation with Brightloop Software GSTIN (`29AABCB1234F1Z6`), customer billing details, line-item breakdowns, and payment status tags.
- In-browser print and PDF generation (`window.print()`, `jsPDF`, `html2canvas`).
- **11 Business Analytics Reports** with instant **CSV Export**:
  - Revenue by Period
  - Subscription Growth
  - Churn Analysis
  - Plan Performance
  - Product Revenue
  - Customer Acquisition
  - Payment Gateway Success Rates
  - Outstanding Dues
  - Discount Code Utilization
  - Tax & GST Summary
  - Staff Performance

### 6. 🕒 Background Billing Lifecycle Scheduler
- Automated scheduler running every 10 minutes:
  - Scans active subscriptions for expiry.
  - Automatically marks past-due subscriptions as `Expired`.
  - Emits in-app renewal warning notifications to customers within 7 days of expiration.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `jssathiya012@gmail.com` | `Admin@12345` |
| **Staff Member** | `staff@brightloop.com` | `Staff@12345` |
| **Customer** | `demo@brightloop.com` | `Demo@12345` |

> *Login Flow:* Enter your email and password, then click "Sign In to Dashboard" to verify credentials and open your role workspace. Quick-fill buttons are provided to easily populate the form fields.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 18, Vite 6, TypeScript
- **Styling**: Tailwind CSS v4 with custom CSS design tokens
- **Routing**: React Router v6
- **State Management**: Zustand
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Forms & Notifications**: React Hook Form, React Hot Toast
- **PDF & Canvas**: jsPDF, html2canvas

### Backend
- **Server**: Node.js & Express 5
- **Dual-Mode Database Layer**:
  - Automatically connects to **MongoDB** via Mongoose if `MONGODB_URI` is provided.
  - Automatically falls back to a high-performance **JSON file database** (`backend/data/db.json`) if MongoDB is not locally running, guaranteeing zero external setup requirement.
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Scheduler**: Automated background subscription & renewal cron service

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Initial Database (Optional, already populated)
```bash
npm run seed
```

### 3. Start Backend Server (Port 5000)
```bash
npm run server
```

### 4. Start Frontend Dev Server (Port 5173)
```bash
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 📁 Project Directory Structure
```
oodo/
├── backend/
│   ├── config/
│   │   └── db.js                 # Dual-mode DB adapter (MongoDB Mongoose + JSON fallback)
│   ├── controllers/              # 13 REST controllers (Auth, Staff, Customer, Plans, etc.)
│   ├── data/
│   │   └── db.json               # Seeded JSON database store
│   ├── jobs/
│   │   └── billingScheduler.js   # Automated 10-minute subscription billing scheduler
│   ├── middleware/
│   │   └── auth.js               # JWT verification & RBAC enforcement
│   ├── models/
│   │   ├── index.js              # Universal collection accessors
│   │   └── schemas.js            # Mongoose schemas for all 12 entities
│   ├── routes/                   # Modular API route definitions
│   ├── seed.js                   # Pre-populates Brightloop initial data
│   └── server.js                 # Express server & API endpoints
├── src/
│   ├── api/
│   │   └── client.ts             # Axios HTTP client with JWT interceptor
│   ├── components/               # Navbar, Sidebar, StatCard, Badge, Modal, EmptyState
│   ├── layouts/
│   │   └── DashboardLayout.tsx   # Responsive Plum & Lavender shell
│   ├── pages/
│   │   ├── admin/                # 13 Admin management pages & reports
│   │   ├── auth/                 # Login, Signup, Forgot/Reset Password
│   │   ├── customer/             # Customer Portal: Checkout, Subscriptions, Invoices
│   │   ├── public/               # Public Product catalog & Plan comparison
│   │   └── staff/                # Staff assigned customer & invoice portal
│   ├── store/
│   │   └── authStore.ts          # Zustand authentication store
│   ├── App.tsx                   # Central router for all 27+ routes
│   └── index.css                 # Plum & Lavender CSS custom tokens
├── package.json
└── README.md
```

---
© Brightloop Software – SmartSub Subscription Management Platform. All rights reserved.