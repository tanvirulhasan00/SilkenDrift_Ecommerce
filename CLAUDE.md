# SilkenDrift — Developer & AI Agent Guide (`CLAUDE.md`)

This guide provides technical context, architecture boundaries, folder organization, coding standards, and verification commands for AI coding assistants and developers maintaining **SilkenDrift**.

---

## 🏗️ 1. Architecture & Tech Stack Overview

- **Core Framework**: React 19 (SPA mode with Vite 6 & React Router v7).
- **Routing**: React Router v7 configured via `app/routes.ts` with explicit route IDs.
- **Styling**: Tailwind CSS v3 with semantic color palettes (`silk`, `gold`, `crimson`, `dark`) and Google Fonts (`Hind Siliguri`, `Playfair Display`).
- **State Management**:
  - **Redux Toolkit**: Persistent cross-view UI state (`cartSlice`, `checkoutSlice`, `uiSlice`).
  - **React Router Loaders**: Server and client data loading boundaries (`clientLoader`).
- **Database & Services**:
  - Dual Mode: In-Memory & LocalStorage Mock Store (`app/services/mock/mockStore.ts`) + Firebase 11 Client SDK (`app/services/firebase/firestoreService.ts`).
  - Cloud Functions: Server-side inventory transactions & payment webhooks (`firebase/functions/src/index.ts`).
- **Internationalization (i18n)**: Native React context dictionary (`app/locales/index.tsx`) supporting English and Bengali (বাংলা).

---

## 📁 2. Repository Folder Map

```
SilkenDrift_Ecommerce/
├── app/
│   ├── components/            # Reusable UI primitives, feedback, and layout headers
│   │   ├── common/            # LanguageSwitcher, ThemeSwitcher, RoleSwitcher
│   │   ├── feedback/          # ToastContext, Skeleton, EmptyState
│   │   ├── layout/            # Navbar, Footer, MegaMenu, Admin Nav
│   │   └── ui/                # Button, Input, Modal, Drawer, Badge, Card
│   ├── config/
│   │   └── adminConfig.ts     # Secret admin path obfuscation (/sd-hq-vault-88)
│   ├── features/              # Feature modules: Cart drawer, catalog filters, checkout
│   ├── hooks/                 # Custom hooks: useAuth, useSettings, useTheme, useWishlist
│   ├── lib/                   # Utilities: bd-geo.ts (BD hierarchy), formatters.ts (BDT ৳)
│   ├── locales/               # en.ts, bn.ts, and LanguageProvider
│   ├── routes/                # Storefront & Admin page components
│   │   ├── _storefront.*.tsx  # Customer shop, product, checkout, order tracking, account
│   │   ├── admin.*.tsx        # Management: products, orders, sourcing, inventory, CRM
│   │   ├── decoy.admin.tsx    # 404 decoy handler for /admin scanner traps
│   │   └── staff.portal.tsx   # Staff login portal (/deshboard)
│   ├── services/
│   │   ├── delivery/          # Pathao, Steadfast & RedX courier adapters
│   │   ├── firebase/          # Firebase config, Auth, and Firestore service
│   │   ├── mock/              # In-memory reactive repository and seed data
│   │   └── payments/          # bKash, SSLCOMMERZ & COD adapters
│   ├── store/                 # Redux Toolkit store and slices
│   ├── styles/                # app.css with @media print and glassmorphism
│   ├── types/                 # Strict TypeScript domain interfaces
│   ├── root.tsx               # Root document layout with providers
│   └── routes.ts              # Route manifest definitions
├── database/
│   ├── firestore-schema.json  # Complete Firestore Collections & Fields specification
│   ├── firestore-seed.json    # Complete Firestore JSON seed data
│   ├── seed-firestore.mjs     # Standalone CLI seeder script (npm run seed:firestore)
│   ├── schema.sql             # Complete ANSI SQL schema for all 18 tables
│   └── seed.sql               # Authentic Rajshahi silk demo seed data
├── firebase/
│   ├── firestore.rules        # Role-based Firestore security rules
│   ├── storage.rules          # Firebase Storage rules
│   └── functions/             # Firebase Cloud Functions (bKash, SSL, atomic orders)
├── .env.example               # Environment variables template
├── Dockerfile                 # Multi-stage production container
├── docker-compose.yml         # Container orchestration
├── HowToSetup.md              # Installation guide for VPS, Docker, and local
├── CHANGELOG.md               # Version history
└── README.md                  # Product overview
```

---

## ⚙️ 3. Verification & Build Commands

Always run these commands to verify code changes before committing:

```bash
# 1. Typecheck and Route Manifest Validation
npm run typecheck

# 2. Production Vite & React Router Build
npm run build

# 3. Start Local Development Server (Port 3000)
npm run dev

# 4. Dependency Vulnerability Audit
npm audit
```

---

## 📏 4. Code & Architecture Conventions

1. **Route IDs**: In `app/routes.ts`, every route pointing to a shared component file MUST specify a unique `id` in options (e.g. `route("order/success/:id", "...", { id: "routes/_storefront.order.success.$id" })`).
2. **Strict Typing**: Never use unconstrained `any`. All domain entities must use interfaces defined in `app/types/index.ts`.
3. **Dual Persistence**: When adding a new database method, implement it in both `app/services/mock/mockStore.ts` and `app/services/firebase/firestoreService.ts` to preserve zero-config offline mode.
4. **Currency & Localization**:
   - Always display monetary amounts using `formatPriceBDT(amount, language)` from `app/lib/formatters.ts`.
   - Always provide corresponding English and Bengali translation keys in `app/locales/en.ts` and `app/locales/bn.ts`.
5. **Security & Obfuscation**:
   - Never expose raw admin paths at `/admin`. Always use `getAdminPath(subpath)` from `app/config/adminConfig.ts`.
   - Never store private API secrets (e.g. `BKASH_APP_SECRET`, `SSL_STORE_PASSWORD`) in client-side code or `VITE_` variables.
