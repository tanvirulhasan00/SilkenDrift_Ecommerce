# Changelog — SilkenDrift E-Commerce

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-23

### Added
- **Core Architecture**:
  - Full-stack React 19 application running with React Router v7 framework mode.
  - Multi-stage production `Dockerfile` and `docker-compose.yml` for 1-command deployment.
  - Complete TypeScript 5.7 domain models covering 18 e-commerce entities.
  - Dual data layer: In-memory reactive mock store with LocalStorage persistence and Firebase 11 SDK integration.

- **Storefront Features**:
  - Full bilingual i18n support for English and Bengali (বাংলা) with native typography (`Hind Siliguri`).
  - Dark mode, light mode, and system preference theme switching with luxury silk and gold palettes.
  - Catalog filtering with faceted search, price sliders, category tags, and real-time sorting.
  - High-res product detail view with multi-image gallery zoom, variant selector (size, color, material), and live inventory counter.
  - Customer review submission with 1-5 star ratings and interactive product Q&A forum.
  - Persistent wishlist management with quick "Move to Cart" workflow.
  - Slide-out cart drawer with free shipping progress bar and subtotal calculator.
  - Multi-step checkout with cascading Bangladesh administrative hierarchy (Division ➔ District ➔ Upazila).
  - Public order tracking (`/track`) by Order Number or Phone without authentication required.
  - Dedicated order confirmation page with print-ready A4 PDF tax invoice formatting (`@media print`).

- **Logistics & Payment Integrations**:
  - Payment adapter scaffolding for **bKash Tokenized Checkout**, **SSLCOMMERZ Gateway** (Cards, MFS, Net Banking), and **Cash on Delivery** with safety ceiling limit.
  - Logistics courier adapters for **Pathao Courier** (Express), **Steadfast Courier** (Nationwide 64 districts), and **RedX Logistics**.
  - Dynamic delivery charge calculation based on Inside Dhaka vs. Outside Dhaka zones.
  - Physical Click & Collect pickup hubs (Dhanmondi, Gulshan).

- **Administrative Vault & Security**:
  - Obfuscated administrative vault prefix (`/sd-hq-vault-88`) configured via `adminConfig.ts`.
  - Realistic 404 Not Found decoy route (`/admin/*`) to neutralize automated vulnerability scanners and brute-force bot attacks.
  - Executive KPI dashboard with gross revenue (BDT), order counts, active customers, and stock alerts.
  - Product catalog studio with bilingual text editing, multi-variant matrix generator, and image management.
  - Order fulfillment pipeline with status workflow engine and tracking code assignment.
  - Warehouse inventory ledger tracking movements across sourcing, orders, returns, and damages.
  - Sourcing and weaver directory for artisan guild procurement.
  - Customer CRM with lifetime spending, order counts, and loyalty tiers (Bronze, Silver, Gold, Platinum).
  - Coupon management engine with percentage and fixed BDT discounts.
  - Customer support helpdesk ticket system with threaded staff replies.
  - Review moderation panel for approving user ratings.
  - Business settings panel with VAT rates, contact information, branding logos, and 1-click database seeding.

- **Database & Auditing**:
  - Full relational ANSI SQL schema in `database/schema.sql` with foreign keys, constraints, and performance indexes.
  - Complete demo seed script in `database/seed.sql` pre-loaded with authentic Rajshahi silk products and categories.
  - Role-based Firestore security rules (`firebase/firestore.rules`) with data isolation for users and role gates for admin areas.

- **Documentation**:
  - Comprehensive `README.md` with target audience, features, and screenshots.
  - Step-by-step `HowToSetup.md` for clean-machine, VPS, and Docker deployments.
  - Developer & AI coding guide in `CLAUDE.md` and `AGENTS.md`.
  - Commercial license terms in `LICENSE-NOTE.md`.
