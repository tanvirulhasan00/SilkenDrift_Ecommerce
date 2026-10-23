-- ==============================================================================
-- SILKEN DRIFT — ENTERPRISE E-COMMERCE DATABASE SCHEMA
-- Compatible with PostgreSQL 13+, MySQL 8.0+, SQLite 3.35+, and Cloud SQL
-- ==============================================================================

-- 1. USERS & ROLES
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(32),
    photo_url TEXT,
    role VARCHAR(32) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'manager', 'customer')),
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. CUSTOMER PROFILES & CRM
CREATE TABLE IF NOT EXISTS customer_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_spend_bdt NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    loyalty_tier VARCHAR(32) NOT NULL DEFAULT 'Bronze' CHECK (loyalty_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    notes TEXT,
    tags TEXT[],
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. ADDRESS BOOK
CREATE TABLE IF NOT EXISTS addresses (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    division VARCHAR(64) NOT NULL,
    district VARCHAR(64) NOT NULL,
    upazila VARCHAR(64) NOT NULL,
    area_address TEXT NOT NULL,
    postal_code VARCHAR(32) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    label VARCHAR(32) NOT NULL DEFAULT 'Home' CHECK (label IN ('Home', 'Office', 'Other')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- 4. CATEGORIES & BRANDS
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description_en TEXT,
    description_bn TEXT,
    icon VARCHAR(64),
    image_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    featured_on_home BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

CREATE TABLE IF NOT EXISTS subcategories (
    id VARCHAR(64) PRIMARY KEY,
    category_id VARCHAR(64) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brands (
    id VARCHAR(64) PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT,
    description_en TEXT,
    description_bn TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. PRODUCTS & VARIANTS
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sku VARCHAR(64) NOT NULL UNIQUE,
    description_en TEXT NOT NULL,
    description_bn TEXT NOT NULL,
    specifications_en JSONB,
    specifications_bn JSONB,
    category_id VARCHAR(64) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    subcategory_id VARCHAR(64) REFERENCES subcategories(id) ON DELETE SET NULL,
    brand_id VARCHAR(64) REFERENCES brands(id) ON DELETE SET NULL,
    base_price_bdt NUMERIC(12, 2) NOT NULL,
    sale_price_bdt NUMERIC(12, 2),
    stock_total INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    images TEXT[] NOT NULL DEFAULT '{}',
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
    is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
    is_flash_deal BOOLEAN NOT NULL DEFAULT FALSE,
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    review_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published);

CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(64) NOT NULL UNIQUE,
    title_en VARCHAR(255) NOT NULL,
    title_bn VARCHAR(255) NOT NULL,
    size VARCHAR(64),
    color VARCHAR(64),
    material VARCHAR(64),
    price_bdt NUMERIC(12, 2) NOT NULL,
    sale_price_bdt NUMERIC(12, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

-- 6. SUPPLIERS & SOURCING
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    category_specialty VARCHAR(255) NOT NULL,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    division VARCHAR(64),
    district VARCHAR(64),
    payment_terms VARCHAR(255),
    lead_time_days INTEGER DEFAULT 7,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sourcing_records (
    id VARCHAR(64) PRIMARY KEY,
    supplier_id VARCHAR(64) NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    supplier_name VARCHAR(255) NOT NULL,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    variant_id VARCHAR(64) REFERENCES product_variants(id) ON DELETE SET NULL,
    sku VARCHAR(64) NOT NULL,
    quantity_received INTEGER NOT NULL,
    purchase_cost_bdt NUMERIC(12, 2) NOT NULL,
    batch_number VARCHAR(64) NOT NULL,
    received_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. INVENTORY MOVEMENTS LEDGER
CREATE TABLE IF NOT EXISTS inventory_movements (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    variant_id VARCHAR(64) REFERENCES product_variants(id) ON DELETE SET NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('sourcing', 'order', 'adjustment', 'return', 'damaged')),
    quantity_delta INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_id VARCHAR(64) NOT NULL,
    reason TEXT NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_type ON inventory_movements(type);

-- 8. ORDERS & FULFILLMENT
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(64) NOT NULL UNIQUE,
    customer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(32) NOT NULL,
    customer_email VARCHAR(255),
    shipping_address JSONB NOT NULL,
    delivery_method VARCHAR(32) NOT NULL CHECK (delivery_method IN ('home_delivery', 'pickup_point', 'courier')),
    pickup_point_id VARCHAR(64),
    pickup_point_name VARCHAR(255),
    subtotal_bdt NUMERIC(12, 2) NOT NULL,
    discount_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    delivery_charge_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    vat_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_bdt NUMERIC(12, 2) NOT NULL,
    order_status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (order_status IN (
        'pending', 'confirmed', 'processing', 'packed', 'shipped',
        'out_for_delivery', 'delivered', 'cancelled', 'failed_delivery', 'returned', 'refunded'
    )),
    payment_status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'initiated', 'paid', 'failed', 'cancelled',
        'refunded', 'partially_refunded', 'cod_pending', 'cod_collected'
    )),
    payment_method VARCHAR(32) NOT NULL CHECK (payment_method IN ('bkash', 'sslcommerz', 'cod')),
    payment_id VARCHAR(255),
    courier_provider VARCHAR(32) CHECK (courier_provider IN ('pathao', 'steadfast', 'redx', 'internal')),
    courier_tracking_id VARCHAR(128),
    coupon_code VARCHAR(64),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id VARCHAR(64) REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name_en VARCHAR(255) NOT NULL,
    product_name_bn VARCHAR(255) NOT NULL,
    image TEXT NOT NULL,
    price_bdt NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal_bdt NUMERIC(12, 2) NOT NULL,
    size VARCHAR(64),
    color VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS order_timeline_events (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL,
    label_en VARCHAR(255) NOT NULL,
    label_bn VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT
);

CREATE INDEX IF NOT EXISTS idx_timeline_order ON order_timeline_events(order_id);

-- 9. LOGISTICS: DELIVERY ZONES & PICKUP POINTS
CREATE TABLE IF NOT EXISTS delivery_zones (
    id VARCHAR(64) PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    division VARCHAR(64) NOT NULL,
    districts TEXT[] NOT NULL,
    standard_charge_bdt NUMERIC(8, 2) NOT NULL,
    free_shipping_threshold_bdt NUMERIC(10, 2) NOT NULL,
    estimated_days VARCHAR(64) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS pickup_points (
    id VARCHAR(64) PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    division VARCHAR(64) NOT NULL,
    district VARCHAR(64) NOT NULL,
    address_en TEXT NOT NULL,
    address_bn TEXT NOT NULL,
    phone VARCHAR(32) NOT NULL,
    operating_hours VARCHAR(128) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 10. MARKETING: COUPONS & BANNERS
CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    description_en TEXT NOT NULL,
    description_bn TEXT NOT NULL,
    discount_type VARCHAR(32) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_bdt NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_discount_bdt NUMERIC(10, 2),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_limit INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS banners (
    id VARCHAR(64) PRIMARY KEY,
    title_en VARCHAR(255) NOT NULL,
    title_bn VARCHAR(255) NOT NULL,
    subtitle_en TEXT,
    subtitle_bn TEXT,
    cta_text_en VARCHAR(128),
    cta_text_bn VARCHAR(128),
    link_url TEXT NOT NULL,
    image_url TEXT NOT NULL,
    placement VARCHAR(32) NOT NULL CHECK (placement IN ('hero', 'mid_banner', 'promo_sidebar', 'popup')),
    priority INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 11. REVIEWS & CUSTOMER QUESTIONS
CREATE TABLE IF NOT EXISTS product_reviews (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);

CREATE TABLE IF NOT EXISTS product_questions (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    answered_by VARCHAR(255),
    is_answered BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP WITH TIME ZONE
);

-- 12. SUPPORT TICKETS & MESSAGES
CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(64) PRIMARY KEY,
    ticket_number VARCHAR(64) NOT NULL UNIQUE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(32),
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(32) NOT NULL CHECK (category IN ('order', 'delivery', 'payment', 'return', 'general')),
    priority VARCHAR(32) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(32) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id VARCHAR(64) PRIMARY KEY,
    ticket_id VARCHAR(64) NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id VARCHAR(64) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(32) NOT NULL CHECK (sender_role IN ('customer', 'staff')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    reply TEXT,
    replied_at TIMESTAMP WITH TIME ZONE,
    replied_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. BUSINESS SETTINGS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS business_settings (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'default',
    store_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    logo_dark_url TEXT,
    favicon_url TEXT,
    tagline_en VARCHAR(255),
    tagline_bn VARCHAR(255),
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address_en TEXT NOT NULL,
    address_bn TEXT NOT NULL,
    vat_number VARCHAR(64),
    vat_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    default_currency VARCHAR(8) NOT NULL DEFAULT 'BDT',
    cod_max_amount_bdt NUMERIC(10, 2) NOT NULL DEFAULT 15000.00,
    free_shipping_min_bdt NUMERIC(10, 2) NOT NULL DEFAULT 2500.00,
    inside_dhaka_charge_bdt NUMERIC(8, 2) NOT NULL DEFAULT 60.00,
    outside_dhaka_charge_bdt NUMERIC(8, 2) NOT NULL DEFAULT 120.00,
    default_language VARCHAR(8) NOT NULL DEFAULT 'bn',
    default_theme VARCHAR(16) NOT NULL DEFAULT 'light',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor_id VARCHAR(64) NOT NULL,
    actor_email VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    module VARCHAR(128) NOT NULL,
    target_id VARCHAR(64),
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
