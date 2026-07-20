<div align="center">
  <h1>⚡ VendorSplit</h1>
  <p><b>Payments that split themselves.</b></p>
  <p>Built for the <i>Pinch Me! Hackathon 2026</i></p>
</div>

<br/>

## 🏆 The Pitch
Running a food truck festival, pop-up market, or local event is a logistical nightmare when it comes to collecting vendor fees. Event organizers typically charge vendors a percentage (e.g., 10% of sales), which means after the event, the organizer has to chase down every single vendor, review their sales spreadsheets, and beg for bank transfers. 

**VendorSplit solves this completely.**

VendorSplit is a multi-vendor event management platform powered entirely by **Pinch Payments**. 
1. Organizers create an event and set a commission rate (e.g., 15%).
2. Vendors are onboarded in 60 seconds and instantly get a unique payment QR code.
3. Customers scan the QR code and pay via Pinch.
4. The payment is automatically split: the vendor gets their cut directly to their bank account, and the organizer's commission is routed to them instantly. 

Zero spreadsheets. Zero chasing invoices. Zero manual payouts.

---

## 🛠️ How We Leveraged the Pinch API
VendorSplit is built heavily on the Pinch API architecture to handle complex multi-party flows seamlessly:

*   **Managed Merchants (Sub-merchants):** When an organizer adds a vendor, VendorSplit automatically uses the Pinch API to create a `Managed Merchant`. This means the vendor gets their own compliant sub-account under the Organizer's master platform without needing to leave the dashboard.
*   **Payment Links & Payers:** Every vendor gets a dynamically generated Pinch Payment Link converted into a QR code. Customers just scan it, enter their details, and pay. 
*   **Application Fees:** We leverage Pinch's Application Fee parameter on every transaction to automatically deduct the Organizer's exact commission rate (e.g., 15%) before the money even hits the vendor's account.
*   **Webhooks for Real-Time UI:** We integrated Pinch Webhooks to listen for `payment.success` events. The second a customer completes a checkout on their phone, the Organizer's live dashboard instantly updates with the new gross revenue and commission totals.

---

## 💻 Tech Stack
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Styling:** Custom CSS (Modern Glassmorphism & Animations)
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Payments:** Pinch Payments API

---

## 🚀 Running it Locally

Want to test VendorSplit yourself? Here is how to spin it up:

### 1. Clone & Install
```bash
git clone https://github.com/GitSuman0699/vendorsplit.git
cd vendorsplit
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory and add your Pinch Sandbox keys:
```env
# Pinch Configuration
PINCH_MERCHANT_ID=mch_your_id
PINCH_APPLICATION_ID=app_test_your_id
PINCH_SECRET_KEY=sk_test_your_key
PINCH_PUBLISHABLE_KEY=pk_test_your_key
PINCH_API_BASE=https://api.getpinch.com.au/test
PINCH_API_VERSION=2020.1

# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://user:pass@localhost:5432/vendorsplit"
```

### 3. Database Setup
Push the schema to your database and generate the Prisma client:
```bash
npx prisma db push
npx prisma generate
```

### 4. Run the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app!

---

## 🎨 Features & UX Highlights
*   **Instant Optimistic UI:** The dashboard uses Next.js React Context transitions for 0-millisecond delay when switching tabs.
*   **Shimmer Loading:** Sleek skeleton loaders prevent layout shift while Pinch data is fetched.
*   **Simulate Settlement:** A built-in testing tool to simulate Pinch's overnight batch settlement process directly in the UI.

<br/>
<div align="center">
  <i>Built with ❤️ by Suman</i>
</div>
