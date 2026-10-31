# Brightloop Customer Portal

A complete frontend demo for a subscription business. It uses React, Vite, TypeScript, Tailwind CSS, React Router, Zustand, React Hook Form, Zod, Recharts, date-fns, react-hot-toast, html2canvas and jsPDF.

## Setup

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Demo accounts

| Account | Email | Password |
|---|---|---|
| Demo customer | `demo@brightloop.com` | `Demo@12345` |
| Other customer | `other@brightloop.com` | `Other@12345` |

The demo customer has subscriptions, invoices, payments, notifications and support history. The second account is useful for testing that direct invoice and subscription URLs never expose another customer's data.

## Build

```bash
npm run build
npm run preview
```

## Main features

- Email sign up, login, forgot-password demo flow, reset-password flow and protected routes
- Unique-email checks and live password strength requirements
- Three product catalogues with multiple plans, variants and monthly/yearly prices
- Live transparent pricing, quantity limits and discount codes
- Subscription pause, resume, cancel, renew, change-plan and proration views
- Invoice search, filters, sorting, pagination, PDF download and print
- Mock card, UPI and net-banking payments with demo outcome controls
- Payment retries, receipts and accessible confirmation states
- Profile editing, notification center, support tickets and automatic renewal reminders
- Responsive desktop sidebar, mobile navigation, and remembered light/dark mode

## 2-minute judge demo

1. **Sign up:** Create a new account and watch the password checklist update. You can also select "Use demo account" on login.
2. **Browse:** Open Plans, switch between Monthly and Yearly, and choose Brightloop CRM.
3. **Subscribe:** Select Growth, add the Odoo brand, increase quantity to 5, and apply `SAVE10`.
4. **View invoice:** Subscribe, open My subscriptions, then open Invoices and select the newest invoice. Print or download the PDF.
5. **Pay:** Open Payments, force success in the demo selector, and pay the first unpaid invoice.
6. **Manage renewal:** Open Subscriptions, select the CRM plan, pause or renew it and preview a plan change.

All data is stored locally. Logout clears the mock app cache and session. Clearing browser storage restores all seed data.