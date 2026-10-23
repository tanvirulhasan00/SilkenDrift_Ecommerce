# SilkenDrift — Installation & Setup Guide
### *Enterprise Bilingual E-Commerce Platform for Bangladesh & South Asia*

This guide provides step-by-step instructions to install, configure, and run **SilkenDrift** on a clean machine for development, Docker containers, and production Linux VPS environments.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Target 1: Local Development & Clean Machine Setup](#2-target-1-local-development--clean-machine-setup)
3. [Target 2: Docker & Docker Compose Deployment](#3-target-2-docker--docker-compose-deployment)
4. [Target 3: Production Linux VPS Deployment (Ubuntu / Debian + Nginx + PM2)](#4-target-3-production-linux-vps-deployment-ubuntu--debian--nginx--pm2)
5. [Database Setup & Data Initialization](#5-database-setup--data-initialization)
6. [First Administrator Login & Vault Access](#6-first-administrator-login--vault-access)
7. [Branding & Customization Guide](#7-branding--customization-guide)
8. [Troubleshooting & Verification](#8-troubleshooting--verification)

---

## 1. Prerequisites

Before installing, ensure your host machine satisfies:
- **Node.js**: `v20.x` LTS or higher (verified on Node.js `v22` and `v24`)
- **Package Manager**: `npm` `v10.x` or higher
- **Git**: `v2.30+`
- **Docker** (Optional, for containerized target): Docker Engine `v24+` and Docker Compose `v2+`

---

## 2. Target 1: Local Development & Clean Machine Setup

### Step 1: Clone or Extract the Project
Extract the clean source archive or clone the repository to your workspace:
```bash
cd SilkenDrift_Ecommerce
```

### Step 2: Install Project Dependencies
Install all pinned production and development dependencies:
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the pre-configured `.env.example` template to `.env`:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

> **Note on Zero-Config Offline Mode:**
> SilkenDrift includes an offline-first **Reactive Mock Repository** pre-seeded with luxury silk products, categories, suppliers, promo codes, and sample orders. If you leave the placeholder values in `.env`, the entire application runs in full interactive mode with zero external cloud dependencies.

### Step 4: Run the Development Server
```bash
npm run dev
```
Open your browser at **[http://localhost:3000](http://localhost:3000)** (or the port indicated in terminal).

### Step 5: Verify Build & Types
Verify the application compiles without errors:
```bash
npm run typecheck
npm run build
```

---

## 3. Target 2: Docker & Docker Compose Deployment

SilkenDrift includes a multi-stage production `Dockerfile` and `docker-compose.yml`.

### Step 1: Build & Start Container
From the project root, run:
```bash
docker compose up -d --build
```

### Step 2: Access Application
- Web Storefront & Management: **[http://localhost:3000](http://localhost:3000)**
- Check container status:
  ```bash
  docker compose ps
  ```
- Inspect container logs:
  ```bash
  docker compose logs -f
  ```

### Step 3: Stopping the Container
```bash
docker compose down
```

---

## 4. Target 3: Production Linux VPS Deployment (Ubuntu / Debian + Nginx + PM2)

### Step 1: System Package Update & Node.js 20 Setup
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx

# Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### Step 2: Clone and Build Application
```bash
# Clone to web root
cd /var/www
git clone https://github.com/tanvirulhasan00/SilkenDrift_Ecommerce.git silkendrift
cd silkendrift

# Install dependencies and build
npm ci
cp .env.example .env
# Edit .env with your production domain and Firebase keys
nano .env

# Build optimized production bundle
npm run build
```

### Step 3: Run with PM2 Process Manager
```bash
pm2 start npm --name "silkendrift-app" -- run start
pm2 save
pm2 startup
```

### Step 4: Configure Nginx Reverse Proxy
Create an Nginx server configuration:
```bash
sudo nano /etc/nginx/sites-available/silkendrift
```

Paste the following block:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/silkendrift /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

*(Optional: Enable free Let's Encrypt SSL via `sudo apt install -y certbot python3-certbot-nginx && sudo certbot --nginx -d yourdomain.com`)*.

---

## 5. Database Setup & Data Initialization

SilkenDrift provides three flexible database strategies:

### Option A: Zero-Config In-Memory & LocalStorage Mode (Default)
- No setup required.
- Pre-loaded with authentic Rajshahi Mulberry silk sarees, royal Endi panjabis, Dhakai Jamdani dupattas, weavers guild records, coupons (`SILKFIRST10`), and demo orders.
- Ideal for instant evaluation, staging demos, and client presentations.

### Option B: Cloud Firestore (Firebase)
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project (e.g. `my-silkendrift`).
2. Enable **Firestore Database** (in production or test mode).
3. Enable **Firebase Authentication** with **Email/Password** provider.
4. Copy your Web App config credentials into `.env`:
   ```ini
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=my-silkendrift.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=my-silkendrift
   VITE_FIREBASE_STORAGE_BUCKET=my-silkendrift.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
5. Deploy security rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules,storage:rules
   ```
6. **Seed Firestore Database**:
   - **CLI Method**: Run the automated seeder script from terminal:
     ```bash
     npm run seed:firestore
     ```
     This reads `database/firestore-seed.json` and commits all collections to your live Cloud Firestore.
   - **Admin UI Method**: Log in to the Admin Dashboard (`/sd-hq-vault-88/settings`), scroll down to the **Database & Firestore Sync** panel, and click **"Seed Cloud Firestore Database"**.
   - **Schema Reference**: Consult [database/firestore-schema.json](database/firestore-schema.json) for the complete collection, document, and field specification.

### Option C: Enterprise Relational SQL (PostgreSQL / MySQL)
If you are deploying SilkenDrift with a relational backend or SQL data lake, use the scripts in `/database`:
```bash
# PostgreSQL example
createdb silkendrift_db
psql -d silkendrift_db -f database/schema.sql
psql -d silkendrift_db -f database/seed.sql

# MySQL example
mysql -u root -p -e "CREATE DATABASE silkendrift_db;"
mysql -u root -p silkendrift_db < database/schema.sql
mysql -u root -p silkendrift_db < database/seed.sql
```

---

## 6. First Administrator Login & Vault Access

### 🔐 Security Notice: Obfuscated Admin Vault
To defend against automated bot probes and brute-force scans, the administrator panel does **NOT** live at `/admin`. Visiting `/admin` or `/wp-admin` renders an authentic 404 Not Found decoy page.

### Admin Access URLs:
- **Secret Vault URL:** `http://localhost:3000/sd-hq-vault-88`
- **Staff Gateway:** `http://localhost:3000/deshboard` or `http://localhost:3000/dashboard`

*(The secret path prefix can be customized anytime in `app/config/adminConfig.ts`).*

### Pre-Configured Administrator Credentials:
| Account | Email | Password | Role Permissions |
|---|---|---|---|
| **Super Admin** | `admin@silkendrift.com` | `admin123` | Full access, settings, payments, sourcing, inventory |
| **Store Manager** | `manager@silkendrift.com` | `manager123` | Catalog, order fulfillment, customer support |
| **Customer** | `customer@example.com` | `customer123` | Storefront buyer account |

*Alternatively, click any persona in the **Demo Role Switcher** at the top header to instantly switch between Admin, Manager, and Customer roles.*

---

## 7. Branding & Customization Guide

### 1. Store Name, Contact Details & Currency via Admin UI
Navigate to **Admin Dashboard ➔ Settings (`/sd-hq-vault-88/settings`)**:
- **Store Name**: Change to your company name (e.g. *Royal Bengal Silks*).
- **Taglines**: Update bilingual slogan in English & Bengali.
- **Contact Info**: Phone (`+880 1711-XXXXXX`), Support Email, Physical showroom address.
- **Taxes & VAT**: Set standard VAT percentage (default 5.00%).
- **Delivery Charges**: Configure Inside Dhaka (৳60), Outside Dhaka (৳120), and Free Delivery minimum order threshold (৳2,500).
- Click **Save Business Settings**.

### 2. Changing the Logo & Favicon
In **Admin Settings (`/sd-hq-vault-88/settings`)**:
- Select one of the high-res **Preset Brand Logos** or paste an external image URL / upload a new image.
- Select or input a custom **Favicon URL**.

### 3. Customizing the Color Palette & Fonts
All design tokens are defined cleanly in `tailwind.config.ts`:
- **Silk Palette**: Change `#FAF7F2` (cream primary background) and brown neutrals in `theme.extend.colors.silk`.
- **Gold Accent**: Change `#D4AF37` in `theme.extend.colors.gold`.
- **Crimson Accent**: Change `#9E1B32` in `theme.extend.colors.crimson`.
- **Typography**: Change Google font imports in `app/styles/app.css` and font family declarations in `tailwind.config.ts`.

---

## 8. Troubleshooting & Verification

### Run Type & Build Checks
```bash
# Verify TypeScript strict types and route manifest
npm run typecheck

# Verify Vite production bundle
npm run build
```

### Common Questions
1. **Port 3000 is already in use?**
   Run on another port: `PORT=3001 npm run dev`
2. **Cannot see changes in admin?**
   If running in Demo Mode, data changes persist in browser memory and LocalStorage. To reset to original sample catalog, visit Admin Settings and click "Reset to Factory Seed Data".
3. **Print button does not show print layout?**
   The invoice screen (`/order/success/:id`) uses CSS print media rules (`@media print`). Click "Print Invoice" or press `Ctrl + P` to preview the clean black-and-white A4 tax invoice without header/navigation bars.
