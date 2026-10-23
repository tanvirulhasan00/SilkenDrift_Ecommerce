# SilkenDrift — Production-Ready Bangladesh eCommerce Platform

[![React Router v7](https://img.shields.io/badge/React%20Router-v7.2-blue.svg)](https://reactrouter.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203.4-38B2AC.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Functions-orange.svg)](https://firebase.google.com/)
[![Localization](https://img.shields.io/badge/i18n-Bangla%20(Default)%20%2B%20English-gold.svg)]()

**SilkenDrift** is a premier, bilingual (Bangla & English) eCommerce platform engineered specifically for Bangladesh. Specializing in authentic Rajshahi mulberry silk, UNESCO heritage Dhakai Jamdani, Men's Royal Endi Panjabis, and Tangail handlooms.

The platform provides a luxurious customer-facing storefront and a protected, role-based administrative vault (`/sd-hq-vault-88` with `/admin` decoy protection).

---

## 🎯 Target Audience & Who It's For
- **Luxury Apparel & Fashion Retailers**: Boutiques and high-end fashion brands selling sarees, panjabis, bridal lehengas, and formal wear.
- **Artisan Cooperatives & Handloom Guilds**: Silk factories, weaver societies in Rajshahi, Tangail, and Narayanganj expanding direct-to-consumer (D2C).
- **E-Commerce Startups & Agencies**: Developers and entrepreneurs needing an enterprise-grade Bangladeshi e-commerce suite with pre-built bKash, SSLCOMMERZ, and courier adapters.
- **Wholesale & Sourcing Hubs**: Businesses managing supplier ledgers, artisan purchase costs, and multi-variant stock movements.

---

## 🌟 Key Features

### 1. Customer Storefront
- **Bilingual Interface**: Full Bangla (বাংলা) default with instant English toggle across all pages, forms, badges, and invoice receipts.
- **Bangla Typography & Localization**: High-readability Bengali typefaces (Hind Siliguri), Bengali numerals (`০-৯`), and authentic Bangladeshi Taka (`৳` / BDT) currency formatting.
- **Luxurious Silk Theme System**: Light Mode, Dark Mode, and System Preference modes styled with a bespoke silk cream, warm gold, and rich dark palette.
- **Product Discovery & Filters**: Filter by Bangladesh Categories, Artisan Brands, Price Ranges (BDT), Availability, and Flash Deals; multi-level sorting.
- **Product Details Showcase**: Multi-angle image gallery with zoom, variant selector (size/color), real-time stock availability, customer reviews with star ratings, and related products.
- **Slide-out Cart Drawer**: Redux Toolkit-backed persistent cart, real-time BDT calculation, interactive free delivery progress bar (`Add ৳X more for free shipping!`), and coupon engine.
- **Multi-Step Bangladesh Checkout**:
  - Step 1: Customer Contact details with Bangladesh 11-digit mobile validation (`01XXXXXXXXX`).
  - Step 2: Cascading Bangladesh Administrative Hierarchy: **Division → District → Upazila / Thana → Area / Street Address**.
  - Step 3: Delivery Mode: Standard Home Delivery, Express Courier Dispatch, or Physical Pickup Hub selection (Dhanmondi, Gulshan, Agrabad).
  - Step 4: Payment Gateway Selection (bKash, SSLCOMMERZ, Cash on Delivery with configurable eligibility limits).
- **Printable Invoices & Tracking Timeline**: Official invoice view formatted for thermal and standard printing with shipment event tracking.
- **Customer Account Portal**: Order histories, live shipment tracking search, saved wishlist items, and customer support ticket thread.

### 2. Protected Role-Based Admin Dashboard (`/admin`)
- **Role-Based Access Control (RBAC)**:
  - **Super Admin**: Full unrestricted access, user role assignments, gateway credential management, and business settings.
  - **Store Manager**: Operational access for products, catalog, inventory, order processing, and support. Protected from altering payment keys or user permissions.
- **KPI Metrics & Charts**: Gross revenue, order velocity, active customers, low-stock alerts, and dynamic weekly revenue visualizer.
- **Product & SKU Catalog Manager**: Product creation, SKU assignment, pricing, image management, and category assignments.
- **Inventory & Movement Ledger**: Real-time stock counts, minimum threshold alerts, manual stock adjustments (+/- delta), and an immutable audit log of inventory movements.
- **Sourcing & Supplier Directory**: Artisan guild records (Rajshahi Weavers Coop, Shitalakhya Looms), purchase cost tracking, received batch numbers, and automatic stock incrementation.
- **Order Fulfillment & Courier Dispatch**: Status lifecycle (`pending` → `confirmed` → `processing` → `packed` → `shipped` → `delivered`), courier assignment (Pathao, Steadfast, RedX), tracking code generation, and invoice printing.
- **Logistics & Delivery Zones**: Configurable shipping fees (Inside Dhaka ৳60, Outside Dhaka ৳120), free shipping threshold (৳2,500), and pickup hub management.
- **Payment Reconciliation Ledger**: Realtime transaction log across bKash, SSLCOMMERZ, and Cash on Delivery cash in transit.
- **Marketing & Promotions**: Discount coupon creator (`%` or fixed `৳`), usage counters, and homepage hero banner priorities.
- **Support Ticket Inbox**: Real-time customer support messaging with official staff reply thread.
- **Review Moderation**: Product review approval/rejection and rating filters.
- **System Settings**: Corporate metadata, VAT rates, Cash on Delivery eligibility limits, and Cloud Function API credential scaffolding.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | [React Router v7](https://reactrouter.com/) (Framework Mode with Vite) |
| **Language** | TypeScript (Strict typing for all entities and states) |
| **Styling** | Tailwind CSS v3 with semantic custom properties, Google Fonts (Hind Siliguri, Inter, Playfair Display) |
| **Client State** | Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) strictly for persistent cross-page UI state (Cart Drawer, Checkout draft, Wishlist, Theme) |
| **Server State** | React Router Loaders & Actions |
| **Backend & Cloud** | Firebase Authentication, Cloud Firestore, Firebase Storage, Firebase Cloud Functions |
| **Icons** | Lucide React |

---

## 📁 Project Architecture

```
SilkenDrift_Ecommerce/
├── app/
│   ├── root.tsx                          # Root layout, theme injector, i18n provider, Redux provider
│   ├── routes.ts                         # React Router v7 route definitions
│   ├── components/
│   │   ├── ui/                           # Design System: Button, Input, Modal, Badge, Drawer, Card
│   │   ├── layout/                       # Header, Footer, Admin Navigation
│   │   ├── feedback/                     # Toast notifications, Skeletons, EmptyState
│   │   └── common/                       # LanguageSwitcher, ThemeSwitcher, RoleSwitcher
│   ├── features/
│   │   ├── catalog/                      # ProductCard, ProductGrid, ProductFilters
│   │   ├── cart/                         # CartDrawer, Cart calculations
│   │   ├── checkout/                     # Multi-step checkout, Bangladesh address cascading
│   │   ├── orders/                       # Order timeline, printable invoices
│   │   └── admin/                        # Admin metrics and modals
│   ├── routes/
│   │   ├── _storefront.tsx               # Storefront layout wrapper
│   │   ├── _storefront._index.tsx        # Homepage (Hero, deals, categories, trust, newsletter)
│   │   ├── _storefront.shop.tsx          # Catalog with filters, search, sort
│   │   ├── _storefront.product.$slug.tsx # Product details, variants, zoom, reviews
│   │   ├── _storefront.checkout.tsx      # Multi-step checkout
│   │   ├── _storefront.order.$id.tsx     # Order success & printable invoice
│   │   ├── _storefront.account.tsx       # Account orders, tracking, wishlist, tickets
│   │   ├── _storefront.static.$page.tsx  # About, Contact, FAQ, Policies
│   │   ├── admin.tsx                     # Protected Admin Layout & Role Guard
│   │   ├── admin._index.tsx              # Admin overview dashboard
│   │   ├── admin.products.tsx            # Product catalog & stock
│   │   ├── admin.orders.tsx              # Order fulfillment & courier dispatch
│   │   ├── admin.inventory.tsx           # Warehouse stock balance & movements
│   │   ├── admin.sourcing.tsx            # Suppliers & raw goods procurement
│   │   ├── admin.customers.tsx           # Customer directory & loyalty
│   │   ├── admin.delivery.tsx            # Couriers & delivery zones
│   │   ├── admin.payments.tsx            # Transaction settlement ledger
│   │   ├── admin.marketing.tsx           # Coupons & promo banners
│   │   ├── admin.support.tsx             # Support ticket inbox & replies
│   │   ├── admin.reviews.tsx             # Review moderation
│   │   ├── admin.reports.tsx             # Financial & regional analytics
│   │   └── admin.settings.tsx            # Store settings & API placeholders
│   ├── services/
│   │   ├── firebase/                     # Firebase SDK client initialization
│   │   ├── mock/                         # In-memory & LocalStorage reactive repository
│   │   ├── payments/                     # bKash & SSLCOMMERZ client adapters
│   │   └── delivery/                     # Pathao, Steadfast & RedX courier adapters
│   ├── store/
│   │   ├── index.ts                      # Redux store configuration
│   │   └── slices/                       # cartSlice, checkoutSlice, uiSlice
│   ├── lib/
│   │   ├── bd-geo.ts                     # Bangladesh 8 Divisions, 64 Districts, Upazilas
│   │   ├── formatters.ts                 # ৳ BDT, Bengali numerals, +880 phone regex
│   │   └── utils.ts                      # Class merger (cn), order ID generator
│   ├── types/
│   │   └── index.ts                      # Strict TypeScript domain interfaces
│   └── locales/
│       ├── bn.ts                         # Complete Bangla dictionary
│       ├── en.ts                         # Complete English dictionary
│       └── index.tsx                     # i18n context provider & interpolate helper
├── firebase/
│   ├── firestore.rules                   # Strict Firestore security rules (RBAC)
│   ├── storage.rules                     # Firebase Storage security rules
│   ├── firestore.indexes.json            # Compound query indexes
│   └── functions/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/index.ts                  # Cloud Functions (bKash, SSLCOMMERZ, Atomic orders)
├── .env.example
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

---

## 🚀 Quickstart & Local Development

### 1. Prerequisites
- Node.js `v20` or higher (`v24` verified)
- npm `v10` or higher

### 2. Installation
```bash
# Clone or navigate to the project directory
cd SilkenDrift_Ecommerce

# Install dependencies
npm install
```

### 3. Environment Setup
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Fill in your Firebase project keys if connecting to a live Firebase project.
*Note: SilkenDrift includes an instant reactive Mock Repository fallback layer out of the box, allowing full local evaluation of all storefront and admin features without any external cloud credentials.*

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
```
This runs Vite & React Router v7 bundling, producing an optimized SPA deployment bundle in `build/client`.

---

## 🔒 Security & Authorization Architecture

### 1. Role-Based Access Control (RBAC)
Roles are managed via Firebase Auth custom user claims:
- `auth.token.role === 'admin'`: Full system access, staff management, payment credentials.
- `auth.token.role === 'manager'`: Product editing, order fulfillment, stock adjustment, support.
- `auth.token.role === 'customer'`: Personal orders, reviews, address book, tickets.

### 2. Cloud Functions as Secure Backend Boundary
Private payment credentials (bKash App Secret, SSLCOMMERZ Store Password) are **NEVER** bundled into frontend client code. All payment creation, IPN verification, and atomic order stock decrements execute exclusively within Firebase Cloud Functions:
- `createOrderWithInventoryLock`: Executes a Firestore transaction verifying live stock before deducting inventory and writing order records.
- `createBkashPayment`: Handles token grants and payment initiation.
- `sslCommerzIpnWebhook`: Validates gateway IPN payloads and updates payment states.
- `setUserRole`: Protected Admin-only endpoint using `firebase-admin` to set custom user claims.

---

## 💳 Payment Gateway Setup Scaffolding

### bKash Tokenized Checkout
1. Obtain merchant credentials from the [bKash Developer Portal](https://developer.bka.sh/).
2. Set Cloud Functions environment secrets:
   ```bash
   firebase functions:secrets:set BKASH_APP_KEY
   firebase functions:secrets:set BKASH_APP_SECRET
   firebase functions:secrets:set BKASH_USERNAME
   firebase functions:secrets:set BKASH_PASSWORD
   ```
3. Deploy functions using `firebase deploy --only functions`.

### SSLCOMMERZ
1. Obtain Store ID and Store Password from [SSLCOMMERZ Merchant Panel](https://sslcommerz.com/).
2. Set Cloud Functions environment secrets:
   ```bash
   firebase functions:secrets:set SSL_STORE_ID
   firebase functions:secrets:set SSL_STORE_PASSWORD
   ```
3. Configure IPN Webhook URL in SSLCOMMERZ panel to:
   `https://[YOUR_REGION]-[YOUR_PROJECT_ID].cloudfunctions.net/sslCommerzIpnWebhook`

---

## 🚚 Bangladesh Courier Partner Scaffolding

SilkenDrift includes pre-built delivery adapters for:
- **Pathao Courier** (`PathaoCourierAdapter`): Express Dhaka City & regional hub delivery.
- **Steadfast Courier** (`SteadfastCourierAdapter`): Nationwide 64-district delivery with Cash on Delivery remittance.
- **RedX Logistics** (`RedXCourierAdapter`): Enterprise dispatching.

---

## 🧪 Testing Roles in Demo Mode
The top header includes a **Demo Role Switcher** (`RoleSwitcher`):
- Click **Admin** to evaluate full dashboard management and sensitive settings.
- Click **Manager** to verify operational features with sensitive setting restrictions.
- Click **Customer** to test the storefront, cart drawer, and checkout.

---

---

## 📸 User Interface Walkthrough & Screenshots

| Storefront & Catalog | Administrative Vault |
| :---: | :---: |
| **Bilingual Silk Storefront**<br>Bengali typography, warm gold accents, hero banner carousel, flash sales with live timers. | **Executive KPI Overview**<br>Gross revenue (BDT), order volume, low stock alerts, weekly velocity charts. |
| **Product Detail & Variant Matrix**<br>High-resolution image zoom, sizes (38–44), fabric selections, verified reviews. | **Product & Stock Matrix Studio**<br>Bilingual descriptions, multi-variant SKU generator, image manager. |
| **Bangladesh Cascading Checkout**<br>Division ➔ District ➔ Upazila autocomplete, bKash & SSLCOMMERZ gateway selectors. | **Order Fulfillment & Logistics**<br>Order lifecycle tracking, courier integration (Pathao / Steadfast), invoice printing. |
| **Printable Tax Invoice & Public Tracker**<br>Clean A4 receipt printing (`@media print`) and live shipment timeline. | **Sourcing & Supplier Ledger**<br>Artisan weaver directory, batch numbers, unit costs, and inventory audit trail. |

---

## 📖 Complete Documentation Suite

Detailed guides are provided in the repository root:
- **[HowToSetup.md](HowToSetup.md)**: Complete step-by-step installation for clean machines, Docker (`docker compose up`), and production Linux VPS with Nginx and PM2.
- **[CLAUDE.md](CLAUDE.md)** / **[AGENTS.md](AGENTS.md)**: Developer architecture guide, coding conventions, and check commands.
- **[CHANGELOG.md](CHANGELOG.md)**: Detailed release history starting at v1.0.0.
- **[database/schema.sql](database/schema.sql)**: Production ANSI SQL schema creating all 18 tables from scratch.
- **[database/seed.sql](database/seed.sql)**: Demo seed data pre-populating silk products, categories, suppliers, and orders.
- **[LICENSE-NOTE.md](LICENSE-NOTE.md)**: Commercial license terms and permissions.

---

## 📄 License Note

SilkenDrift is distributed under a commercial digital license on Vibe96. Buyers receive full source code access for commercial and personal deployments. Please consult [LICENSE-NOTE.md](LICENSE-NOTE.md) for full terms, permissions, and warranty details.
