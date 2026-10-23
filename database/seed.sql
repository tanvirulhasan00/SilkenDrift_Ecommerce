-- ==============================================================================
-- SILKEN DRIFT — ENTERPRISE DEMO SEED DATA
-- Populates the complete database with authentic Bangladeshi silk products,
-- categories, suppliers, promo coupons, sample orders, and settings.
-- ==============================================================================

-- 1. USERS & STAFF
INSERT INTO users (id, email, display_name, phone_number, role, status, is_demo) VALUES
('usr_admin_001', 'admin@silkendrift.com', 'Super Admin Mustafizur Rahman', '+8801711998877', 'admin', 'active', FALSE),
('usr_manager_002', 'manager@silkendrift.com', 'Store Manager Nushrat Jahan', '+8801712334455', 'manager', 'active', FALSE),
('usr_customer_003', 'customer@example.com', 'Tanvirul Hasan', '+8801819554433', 'customer', 'active', FALSE)
ON CONFLICT (id) DO NOTHING;

-- 2. CATEGORIES
INSERT INTO categories (id, name_en, name_bn, slug, description_en, description_bn, icon, sort_order, is_active, featured_on_home) VALUES
('cat_saree', 'Silk Sarees', 'সিল্ক শাড়ি', 'silk-sarees', 'Authentic Mulberry, Baluchari, and Katan sarees woven by master artisans in Rajshahi and Tangail.', 'রাজশাহী ও টাঙ্গাইলের মাস্টার কারিগরদের বোনা আসল মালবেরি, বালুচরি ও কাতান শাড়ি।', 'Sparkles', 1, TRUE, TRUE),
('cat_panjabi', 'Royal Silk Panjabis', 'রয়্যাল সিল্ক পাঞ্জাবি', 'royal-silk-panjabis', 'Handwoven pure Endi and Mulberry silk panjabis for festive occasions, Eid, and bridal ceremonies.', 'উৎসব, ঈদ ও বিয়ের অনুষ্ঠানের জন্য খাঁটি এন্ডি ও মালবেরি সিল্কের পাঞ্জাবি।', 'Crown', 2, TRUE, TRUE),
('cat_dupatta', 'Jamdani & Silk Dupattas', 'জামদানি ও সিল্ক ওড়না', 'silk-dupattas', 'Featherlight silk scarves and Dhakai Jamdani dupattas featuring antique zari and metallic borders.', 'আন্টিক জরি ও মেটালিক পাড়যুক্ত ঢাকাই জামদানি ও সিল্কের ওড়না।', 'Feather', 3, TRUE, TRUE),
('cat_shawl', 'Winter Silk Shawls', 'শীতের সিল্ক শাল', 'silk-shawls', 'Hand-loomed Pashmina and heavy Matka silk shawls offering warmth and royal elegance.', 'হাতে বোনা পশমিনা এবং ভারী মটকা সিল্কের বিলাসবহুল শাল।', 'Shield', 4, TRUE, TRUE),
('cat_fabrics', 'Unstitched Silk Fabrics', 'আনস্টিচড সিল্ক ফেব্রিক', 'silk-fabrics', 'Raw mulberry silk and unstitched fabric yards for bespoke fashion designers and tailoring.', 'ব্যাসপোক ডিজাইনার ও দর্জির কাজের জন্য আনস্টিচড র সিল্ক ও গজ কাপড়।', 'Layers', 5, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- 3. BRANDS
INSERT INTO brands (id, name_en, name_bn, slug, logo_url, description_en, is_featured) VALUES
('br_rajshahi', 'Rajshahi Silk Heritage', 'রাজশাহী সিল্ক হেরিটেজ', 'rajshahi-silk-heritage', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80', 'The iconic epicenter of Bengal mulberry sericulture since the 17th century.', TRUE),
('br_dhakai', 'Dhakai Jamdani Gharana', 'ঢাকাই জামদানি ঘরানা', 'dhakai-jamdani-gharana', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80', 'UNESCO Intangible Cultural Heritage geometric weaving from the banks of the Shitalakhya.', TRUE),
('br_tangail', 'Tangail Loom Guild', 'টাঙ্গাইল তাঁত গিল্ড', 'tangail-loom-guild', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80', 'Legendary jacquard and handloom cotton-silk artisans of Pathrail, Tangail.', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. PRODUCTS
INSERT INTO products (
    id, name_en, name_bn, slug, sku, description_en, description_bn,
    category_id, brand_id, base_price_bdt, sale_price_bdt, stock_total,
    low_stock_threshold, images, tags, is_published, is_featured, is_new_arrival,
    is_best_seller, is_flash_deal, discount_percentage, rating, review_count
) VALUES
(
    'prod_001',
    'Rajshahi Mulberry Silk Bridal Saree — Crimson & Antique Gold Zari',
    'রাজশাহী মালবেরি সিল্ক ব্রাইডাল শাড়ি — ক্রিমসন ও অ্যান্টিক গোল্ড জরি',
    'rajshahi-mulberry-silk-bridal-saree-crimson',
    'SD-SAR-001',
    'Crafted from 100% pure Mulberry silk cultivated in the sericulture nurseries of Rajshahi. Hand-woven on traditional pit looms over 45 days, this heirloom masterpiece features real metallic gold zari weaving across the aanchal and temple borders.',
    'রাজশাহীর সেরিকালচার নার্সারিতে উৎপাদিত ১০০% খাঁটি মালবেরি রেশম সিল্ক দিয়ে তৈরি। ৪৫ দিনের নিবিড় শ্রমে ঐতিহ্যবাহী পিট-লুমে বোনা এই শাড়ির আঁচল ও পাড়ে রয়েছে খাঁটি ধাতব সোনালি জরির অনুপম কারুকাজ।',
    'cat_saree', 'br_rajshahi', 28500.00, 24900.00, 8, 3,
    ARRAY['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85'],
    ARRAY['Bridal', 'Rajshahi Silk', 'Pure Mulberry', 'Heirloom', 'Zari Border'],
    TRUE, TRUE, TRUE, TRUE, TRUE, 12.63, 4.95, 28
),
(
    'prod_002',
    'Royal Endi Silk Embroidered Panjabi — Ivory & Muted Gold',
    'রয়্যাল এন্ডি সিল্ক এমব্রয়ডারি পাঞ্জাবি — আইভরি ও মিউটেড গোল্ড',
    'royal-endi-silk-embroidered-panjabi-ivory',
    'SD-PAN-002',
    'Tailored from organic Endi (Eri) non-violent peace silk, known for its cooling breathability in summer and gentle thermal insulation in winter. Embellished with subtle tone-on-tone silk thread aari embroidery on the mandarin collar and hidden placket.',
    'অর্গানিক এন্ডি (অহিংস রেশম) সিল্কের তৈরি রাজকীয় পাঞ্জাবি। গরমের দিনে চমৎকার শীতল এবং শীতে কোমল উষ্ণতা প্রদানে সক্ষম। কলার ও বোতাম-পট্টিতে রয়েছে নিখুঁত সুতার কাজ।',
    'cat_panjabi', 'br_rajshahi', 9200.00, 8400.00, 14, 4,
    ARRAY['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85'],
    ARRAY['Menswear', 'Panjabi', 'Endi Silk', 'Festive', 'Eid Collection'],
    TRUE, TRUE, TRUE, TRUE, FALSE, 8.70, 4.88, 19
),
(
    'prod_003',
    'Heritage Dhakai Jamdani Silk Dupatta — Midnight Onyx & Copper',
    'হেরিটেজ ঢাকাই জামদানি সিল্ক ওড়না — মিডনাইট ওনিক্স ও কপার',
    'heritage-dhakai-jamdani-silk-dupatta-onyx',
    'SD-DUP-003',
    'A masterwork of supplementary weft geometric weaving from the banks of the Shitalakhya river. Combines fine 100-count silk warp with antique copper zari floral motifs (panna hajar) across a sheer 2.5-meter expanse.',
    'শীতলক্ষ্যা নদীর তীরের প্রাচীন তাঁতিদের বোনা সম্পূরক ওয়েফট জ্যামিতিক নকশার মাস্টারপিস। ১০০ কাউন্ট মিহি সিল্কের জমিনে পান্না হাজার বুটি ও আন্টিক কপার জরির জমকালো ওড়না।',
    'cat_dupatta', 'br_dhakai', 6800.00, 5950.00, 11, 3,
    ARRAY['https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85'],
    ARRAY['Dupatta', 'Jamdani', 'UNESCO Heritage', 'Handloom', 'Evening Wear'],
    TRUE, TRUE, FALSE, FALSE, FALSE, 12.50, 4.90, 14
)
ON CONFLICT (id) DO NOTHING;

-- 5. PRODUCT VARIANTS
INSERT INTO product_variants (id, product_id, sku, title_en, title_bn, size, color, price_bdt, sale_price_bdt, stock, is_default) VALUES
('var_001_standard', 'prod_001', 'SD-SAR-001-STD', 'Standard 12 Haath + 1m Blouse', '১২ হাত স্ট্যান্ডার্ড + ১মি ব্লাউজ পিস', 'Standard (12 Haath)', 'Crimson Gold', 28500.00, 24900.00, 8, TRUE),
('var_002_38', 'prod_002', 'SD-PAN-002-38', 'Size 38 (Small)', 'সাইজ ৩৮ (স্মল)', '38', 'Ivory', 9200.00, 8400.00, 3, FALSE),
('var_002_40', 'prod_002', 'SD-PAN-002-40', 'Size 40 (Medium)', 'সাইজ ৪০ (মিডিয়াম)', '40', 'Ivory', 9200.00, 8400.00, 5, TRUE),
('var_002_42', 'prod_002', 'SD-PAN-002-42', 'Size 42 (Large)', 'সাইজ ৪২ (লার্জ)', '42', 'Ivory', 9200.00, 8400.00, 4, FALSE),
('var_002_44', 'prod_002', 'SD-PAN-002-44', 'Size 44 (Extra Large)', 'সাইজ ৪৪ (এক্সট্রা লার্জ)', '44', 'Ivory', 9200.00, 8400.00, 2, FALSE),
('var_003_standard', 'prod_003', 'SD-DUP-003-STD', 'Standard 2.5 Meter Length', '২.৫ মিটার স্ট্যান্ডার্ড দৈর্ঘ্য', '2.5 Meters', 'Midnight Onyx', 6800.00, 5950.00, 11, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. SUPPLIERS
INSERT INTO suppliers (id, name, contact_person, phone, email, address, category_specialty, rating, status, division, district) VALUES
('sup_rajshahi', 'Rajshahi Sericulture Co-operative Guild', 'Al-Haj Rafiqul Islam', '+8801711223344', 'rafiq.silk@rajshahisilk.org', 'Sericulture Board Complex, Sopura, Rajshahi', 'Pure Mulberry Cocoon Reeling & Zari Sarees', 4.95, 'active', 'Rajshahi', 'Rajshahi'),
('sup_tangail', 'Pathrail Master Weavers Foundation', 'Govinda Chandra Basak', '+8801715887766', 'basak.tangail@handloom.bd', 'Loom Road, Pathrail, Delduar, Tangail', 'Handloom Jacquard Cotton-Silk & Jamdani', 4.88, 'active', 'Dhaka', 'Tangail')
ON CONFLICT (id) DO NOTHING;

-- 7. COUPONS
INSERT INTO coupons (id, code, description_en, description_bn, discount_type, discount_value, min_order_bdt, start_date, end_date, usage_limit, used_count, is_active) VALUES
('cpn_silk10', 'SILKFIRST10', '10% discount on first luxury silk purchase', 'প্রথম অর্ডারে ১০% বিশেষ ছাড়', 'percentage', 10.00, 3000.00, '2026-01-01', '2026-12-31', 500, 84, TRUE),
('cpn_eid500', 'EIDROYAL', 'Flat ৳500 instant discount on orders above ৳5,000', '৫,০০০ টাকার অর্ডারে ৫০০ টাকা নগদ ছাড়', 'fixed', 500.00, 5000.00, '2026-01-01', '2026-12-31', 200, 32, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 8. DELIVERY ZONES
INSERT INTO delivery_zones (id, name_en, name_bn, division, districts, standard_charge_bdt, free_shipping_threshold_bdt, estimated_days, is_active) VALUES
('zone_dhaka', 'Inside Dhaka Metropolitan City', 'ঢাকা মেট্রোপলিটন এলাকা', 'Dhaka', ARRAY['Dhaka', 'Gazipur', 'Narayanganj'], 60.00, 2500.00, '24-48 Hours', TRUE),
('zone_outside', 'All Districts Outside Dhaka', 'ঢাকার বাইরে সকল জেলা (সারাদেশ)', 'All Divisions', ARRAY['Chittagong', 'Rajshahi', 'Sylhet', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'], 120.00, 4000.00, '2-4 Business Days', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 9. PICKUP POINTS
INSERT INTO pickup_points (id, name_en, name_bn, division, district, address_en, address_bn, phone, operating_hours, is_active) VALUES
('hub_dhanmondi', 'SilkenDrift Experience Lounge — Dhanmondi', 'সিল্কেনড্রিফট এক্সপেরিয়েন্স লাউঞ্জ — ধানমন্ডি', 'Dhaka', 'Dhaka', 'House 42, Road 27 (Old), Dhanmondi R/A, Dhaka-1209', 'বাড়ি ৪২, রোড ২৭ (পুরাতন), ধানমন্ডি আ/এ, ঢাকা-১২০৯', '+8801711001122', '10:00 AM – 9:00 PM (Daily)', TRUE),
('hub_gulshan', 'SilkenDrift Vault & Flagship — Gulshan 2', 'সিল্কেনড্রিফট ফ্ল্যাগশিপ শপ — গুলশান ২', 'Dhaka', 'Dhaka', 'Level 3, Avenue Tower, Plot 14, Gulshan Avenue, Dhaka-1212', 'লেভেল ৩, এভিনিউ টাওয়ার, প্লট ১৪, গুলশান এভিনিউ, ঢাকা-১২১২', '+8801711001133', '10:00 AM – 10:00 PM (Daily)', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 10. BUSINESS SETTINGS
INSERT INTO business_settings (
    id, store_name, tagline_en, tagline_bn, phone, email,
    address_en, address_bn, vat_rate_percent, default_currency,
    cod_max_amount_bdt, free_shipping_min_bdt, inside_dhaka_charge_bdt, outside_dhaka_charge_bdt,
    default_language, default_theme
) VALUES (
    'default',
    'SilkenDrift — Pure Heritage Silk & Looms',
    'Finest Mulberry Silk, Heirloom Jamdani & Royal Endi Apparel',
    'খাঁটি রাজশাহী রেশম, ঐতিহ্যবাহী জামদানি ও রয়্যাল এন্ডি কালেকশন',
    '+880 1711-998877',
    'concierge@silkendrift.com',
    'Level 4, Silken Tower, Road 27, Dhanmondi, Dhaka-1209, Bangladesh',
    'লেভেল ৪, সিল্কেন টাওয়ার, রোড ২৭, ধানমন্ডি, ঢাকা-১২০৯, বাংলাদেশ',
    5.00, 'BDT', 15000.00, 2500.00, 60.00, 120.00, 'bn', 'light'
)
ON CONFLICT (id) DO NOTHING;
