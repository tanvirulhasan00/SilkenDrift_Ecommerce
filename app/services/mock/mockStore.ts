import {
  Product,
  Category,
  Brand,
  Order,
  Supplier,
  SourcingRecord,
  InventoryMovement,
  SupportTicket,
  ContactMessage,
  BusinessSettings,
  OrderStatus,
  PaymentStatus,
  DeliveryZone,
  PickupPoint,
  Coupon,
  Banner,
} from "~/types";
import {
  SEED_PRODUCTS,
  SEED_CATEGORIES,
  SEED_BRANDS,
  SEED_ORDERS,
  SEED_SUPPLIERS,
  SEED_SOURCING_RECORDS,
  SEED_SUPPORT_TICKETS,
  SEED_SETTINGS,
  SEED_DELIVERY_ZONES,
  SEED_PICKUP_POINTS,
  SEED_COUPONS,
  SEED_BANNERS,
} from "./seedData";
import { generateOrderNumber, generateId } from "~/lib/utils";

const SEED_CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: "msg_seed_1",
    name: "Dr. Farzana Yasmin",
    phone: "01711223344",
    email: "farzana.dr@gmail.com",
    subject: "Rajshahi Silk Bridal Customization Query",
    message: "I am looking for a customized Rajshahi Mulberry Silk Saree in deep crimson with authentic antique zari border for an upcoming wedding. Do you offer custom weaving?",
    status: "unread",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "msg_seed_2",
    name: "Tanvir Ahmed",
    phone: "01819554433",
    email: "tanvir.engr@yahoo.com",
    subject: "Bulk Order for Corporate Eid Gift Silk Panjabis",
    message: "We need 50 pieces of Premium Rajshahi Mulberry Silk Panjabi for our executive team for Eid-ul-Fitr. What is your turnaround time and wholesale invoice structure?",
    status: "replied",
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    reply: "Dear Tanvir, thank you for your query. We provide custom bespoke monogram packaging for corporate bulk orders. Our B2B coordinator has sent our bulk price brochure to your email.",
    repliedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    repliedBy: "Admin Support",
  },
];

class MockDataRepository {
  private products: Product[] = [];
  private categories: Category[] = [];
  private brands: Brand[] = [];
  private orders: Order[] = [];
  private suppliers: Supplier[] = [];
  private sourcingRecords: SourcingRecord[] = [];
  private inventoryMovements: InventoryMovement[] = [];
  private supportTickets: SupportTicket[] = [];
  private contactMessages: ContactMessage[] = [];
  private deliveryZones: DeliveryZone[] = [];
  private pickupPoints: PickupPoint[] = [];
  private coupons: Coupon[] = [];
  private banners: Banner[] = [];
  private settings: BusinessSettings = { ...SEED_SETTINGS };
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    if (typeof window !== "undefined") {
      try {
        const p = localStorage.getItem("sd_mock_products");
        const o = localStorage.getItem("sd_mock_orders");
        const s = localStorage.getItem("sd_mock_suppliers");
        const c = localStorage.getItem("sd_mock_categories");
        const b = localStorage.getItem("sd_mock_brands");
        const src = localStorage.getItem("sd_mock_sourcing");
        const tkt = localStorage.getItem("sd_mock_tickets");
        const msg = localStorage.getItem("sd_mock_contact_messages");
        const set = localStorage.getItem("sd_mock_settings");
        const dz = localStorage.getItem("sd_mock_delivery_zones");
        const pp = localStorage.getItem("sd_mock_pickup_points");
        const cp = localStorage.getItem("sd_mock_coupons");
        const bn = localStorage.getItem("sd_mock_banners");

        this.products = p ? JSON.parse(p) : [...SEED_PRODUCTS];
        this.orders = o ? JSON.parse(o) : [...SEED_ORDERS];
        this.suppliers = s ? JSON.parse(s) : [...SEED_SUPPLIERS];
        this.categories = c ? JSON.parse(c) : [...SEED_CATEGORIES];
        this.brands = b ? JSON.parse(b) : [...SEED_BRANDS];
        this.sourcingRecords = src ? JSON.parse(src) : [...SEED_SOURCING_RECORDS];
        this.supportTickets = tkt ? JSON.parse(tkt) : [...SEED_SUPPORT_TICKETS];
        this.contactMessages = msg ? JSON.parse(msg) : [...SEED_CONTACT_MESSAGES];
        this.deliveryZones = dz ? JSON.parse(dz) : [...SEED_DELIVERY_ZONES];
        this.pickupPoints = pp ? JSON.parse(pp) : [...SEED_PICKUP_POINTS];
        this.coupons = cp ? JSON.parse(cp) : [...SEED_COUPONS];
        this.banners = bn ? JSON.parse(bn) : [...SEED_BANNERS];
        if (set) {
          this.settings = { ...SEED_SETTINGS, ...JSON.parse(set) };
        }
      } catch {
        this.loadSeeds();
      }
    } else {
      this.loadSeeds();
    }
    this.initialized = true;
  }

  private loadSeeds() {
    this.products = [...SEED_PRODUCTS];
    this.orders = [...SEED_ORDERS];
    this.suppliers = [...SEED_SUPPLIERS];
    this.categories = [...SEED_CATEGORIES];
    this.brands = [...SEED_BRANDS];
    this.sourcingRecords = [...SEED_SOURCING_RECORDS];
    this.supportTickets = [...SEED_SUPPORT_TICKETS];
    this.contactMessages = [...SEED_CONTACT_MESSAGES];
    this.deliveryZones = [...SEED_DELIVERY_ZONES];
    this.pickupPoints = [...SEED_PICKUP_POINTS];
    this.coupons = [...SEED_COUPONS];
    this.banners = [...SEED_BANNERS];
    this.settings = { ...SEED_SETTINGS };
  }

  private persist(key: string, data: unknown) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Storage full
    }
  }

  // ==========================================
  // PRODUCTS CRUD
  // ==========================================
  getProducts(): Product[] {
    return this.products;
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.products.find((p) => p.slug === slug);
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  saveProduct(product: Product): Product {
    const idx = this.products.findIndex((p) => p.id === product.id);
    if (idx > -1) {
      this.products[idx] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      this.products.unshift({
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.persist("sd_mock_products", this.products);
    return product;
  }

  deleteProduct(id: string): boolean {
    this.products = this.products.filter((p) => p.id !== id);
    this.persist("sd_mock_products", this.products);
    return true;
  }

  // ==========================================
  // CATEGORIES CRUD
  // ==========================================
  getCategories(): Category[] {
    return this.categories;
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find((c) => c.id === id || c.slug === id);
  }

  saveCategory(category: Category): Category {
    const idx = this.categories.findIndex((c) => c.id === category.id);
    if (idx > -1) {
      this.categories[idx] = { ...category };
    } else {
      this.categories.push({ ...category });
    }
    this.persist("sd_mock_categories", this.categories);
    return category;
  }

  deleteCategory(id: string): boolean {
    this.categories = this.categories.filter((c) => c.id !== id);
    this.persist("sd_mock_categories", this.categories);
    return true;
  }

  // ==========================================
  // BRANDS CRUD
  // ==========================================
  getBrands(): Brand[] {
    return this.brands;
  }

  saveBrand(brand: Brand): Brand {
    const idx = this.brands.findIndex((b) => b.id === brand.id);
    if (idx > -1) {
      this.brands[idx] = brand;
    } else {
      this.brands.push(brand);
    }
    this.persist("sd_mock_brands", this.brands);
    return brand;
  }

  deleteBrand(id: string): boolean {
    this.brands = this.brands.filter((b) => b.id !== id);
    this.persist("sd_mock_brands", this.brands);
    return true;
  }

  // ==========================================
  // SUPPLIERS & ARTISANS CRUD
  // ==========================================
  getSuppliers(): Supplier[] {
    return this.suppliers;
  }

  getSupplierById(id: string): Supplier | undefined {
    return this.suppliers.find((s) => s.id === id);
  }

  saveSupplier(supplier: Supplier): Supplier {
    const idx = this.suppliers.findIndex((s) => s.id === supplier.id);
    if (idx > -1) {
      this.suppliers[idx] = { ...supplier };
    } else {
      this.suppliers.unshift({ ...supplier });
    }
    this.persist("sd_mock_suppliers", this.suppliers);
    return supplier;
  }

  deleteSupplier(id: string): boolean {
    this.suppliers = this.suppliers.filter((s) => s.id !== id);
    this.persist("sd_mock_suppliers", this.suppliers);
    return true;
  }

  // ==========================================
  // ORDERS CRUD
  // ==========================================
  getOrders(): Order[] {
    return this.orders;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  createOrder(orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt" | "timeline">): Order {
    const orderNumber = generateOrderNumber();
    const id = `ord_${generateId()}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          status: "pending",
          labelEn: "Order submitted by customer",
          labelBn: "গ্রাহক কর্তৃক অর্ডার দাখিল করা হয়েছে",
          timestamp: now,
        },
      ],
    };

    // Decrement inventory atomically in mock store
    for (const item of newOrder.items) {
      const prod = this.getProductById(item.productId);
      if (prod) {
        const prevStock = prod.stockTotal;
        const newStock = Math.max(0, prod.stockTotal - item.quantity);
        prod.stockTotal = newStock;
        this.saveProduct(prod);

        this.inventoryMovements.push({
          id: `mov_${generateId()}`,
          productId: prod.id,
          productName: prod.nameEn,
          variantId: item.variantId,
          type: "order",
          quantityDelta: -item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          referenceId: orderNumber,
          reason: `Customer Order ${orderNumber}`,
          performedBy: "Storefront Checkout",
          createdAt: now,
        });
      }
    }

    this.orders.unshift(newOrder);
    this.persist("sd_mock_orders", this.orders);
    return newOrder;
  }

  updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    paymentStatus?: PaymentStatus,
    note?: string
  ): Order | undefined {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return undefined;

    order.orderStatus = status;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    order.updatedAt = new Date().toISOString();

    order.timeline.push({
      status,
      labelEn: `Status updated to ${status}`,
      labelBn: `স্ট্যাটাস পরিবর্তন: ${status}`,
      timestamp: new Date().toISOString(),
      note,
    });

    this.persist("sd_mock_orders", this.orders);
    return order;
  }

  deleteOrder(id: string): boolean {
    this.orders = this.orders.filter((o) => o.id !== id);
    this.persist("sd_mock_orders", this.orders);
    return true;
  }

  assignCourier(orderId: string, provider: "pathao" | "steadfast" | "redx" | "internal", trackingId: string): Order | undefined {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return undefined;

    order.courierProvider = provider;
    order.courierTrackingId = trackingId;
    order.orderStatus = "shipped";
    order.updatedAt = new Date().toISOString();

    order.timeline.push({
      status: "shipped",
      labelEn: `Dispatched via ${provider.toUpperCase()}`,
      labelBn: `${provider.toUpperCase()} কুরিয়ারের মাধ্যমে পাঠানো হয়েছে`,
      timestamp: new Date().toISOString(),
      note: `Tracking Code: ${trackingId}`,
    });

    this.persist("sd_mock_orders", this.orders);
    return order;
  }

  // ==========================================
  // SOURCING BATCHES
  // ==========================================
  getSourcingRecords(): SourcingRecord[] {
    return this.sourcingRecords;
  }

  addSourcingRecord(record: SourcingRecord): SourcingRecord {
    this.sourcingRecords.unshift(record);
    this.persist("sd_mock_sourcing", this.sourcingRecords);

    // Increase product inventory
    const prod = this.getProductById(record.productId);
    if (prod) {
      const prevStock = prod.stockTotal;
      const newStock = prod.stockTotal + record.quantityReceived;
      prod.stockTotal = newStock;
      this.saveProduct(prod);

      this.inventoryMovements.push({
        id: `mov_${generateId()}`,
        productId: prod.id,
        productName: prod.nameEn,
        type: "sourcing",
        quantityDelta: record.quantityReceived,
        previousStock: prevStock,
        newStock: newStock,
        referenceId: record.batchNumber,
        reason: `Goods receipt from ${record.supplierName}`,
        performedBy: "Admin Inventory Manager",
        createdAt: new Date().toISOString(),
      });
    }

    return record;
  }

  deleteSourcingRecord(id: string): boolean {
    this.sourcingRecords = this.sourcingRecords.filter((r) => r.id !== id);
    this.persist("sd_mock_sourcing", this.sourcingRecords);
    return true;
  }

  getInventoryMovements(): InventoryMovement[] {
    return this.inventoryMovements;
  }

  // ==========================================
  // DELIVERY ZONES & PICKUP POINTS CRUD
  // ==========================================
  getDeliveryZones(): DeliveryZone[] {
    return this.deliveryZones;
  }

  saveDeliveryZone(zone: DeliveryZone): DeliveryZone {
    const idx = this.deliveryZones.findIndex((z) => z.id === zone.id);
    if (idx > -1) {
      this.deliveryZones[idx] = zone;
    } else {
      this.deliveryZones.push(zone);
    }
    this.persist("sd_mock_delivery_zones", this.deliveryZones);
    return zone;
  }

  deleteDeliveryZone(id: string): boolean {
    this.deliveryZones = this.deliveryZones.filter((z) => z.id !== id);
    this.persist("sd_mock_delivery_zones", this.deliveryZones);
    return true;
  }

  getPickupPoints(): PickupPoint[] {
    return this.pickupPoints;
  }

  savePickupPoint(point: PickupPoint): PickupPoint {
    const idx = this.pickupPoints.findIndex((p) => p.id === point.id);
    if (idx > -1) {
      this.pickupPoints[idx] = point;
    } else {
      this.pickupPoints.push(point);
    }
    this.persist("sd_mock_pickup_points", this.pickupPoints);
    return point;
  }

  deletePickupPoint(id: string): boolean {
    this.pickupPoints = this.pickupPoints.filter((p) => p.id !== id);
    this.persist("sd_mock_pickup_points", this.pickupPoints);
    return true;
  }

  // ==========================================
  // MARKETING: COUPONS & BANNERS CRUD
  // ==========================================
  getCoupons(): Coupon[] {
    return this.coupons;
  }

  saveCoupon(coupon: Coupon): Coupon {
    const idx = this.coupons.findIndex((c) => c.id === coupon.id);
    if (idx > -1) {
      this.coupons[idx] = coupon;
    } else {
      this.coupons.unshift(coupon);
    }
    this.persist("sd_mock_coupons", this.coupons);
    return coupon;
  }

  deleteCoupon(id: string): boolean {
    this.coupons = this.coupons.filter((c) => c.id !== id);
    this.persist("sd_mock_coupons", this.coupons);
    return true;
  }

  getBanners(): Banner[] {
    return this.banners;
  }

  saveBanner(banner: Banner): Banner {
    const idx = this.banners.findIndex((b) => b.id === banner.id);
    if (idx > -1) {
      this.banners[idx] = banner;
    } else {
      this.banners.push(banner);
    }
    this.persist("sd_mock_banners", this.banners);
    return banner;
  }

  deleteBanner(id: string): boolean {
    this.banners = this.banners.filter((b) => b.id !== id);
    this.persist("sd_mock_banners", this.banners);
    return true;
  }

  // ==========================================
  // SUPPORT TICKETS CRUD
  // ==========================================
  getSupportTickets(): SupportTicket[] {
    return this.supportTickets;
  }

  createSupportTicket(ticket: SupportTicket): SupportTicket {
    this.supportTickets.unshift(ticket);
    this.persist("sd_mock_tickets", this.supportTickets);
    return ticket;
  }

  addTicketMessage(ticketId: string, senderRole: "customer" | "staff", message: string, senderName: string): SupportTicket | undefined {
    const ticket = this.supportTickets.find((t) => t.id === ticketId);
    if (!ticket) return undefined;

    ticket.messages.push({
      id: `msg_${generateId()}`,
      senderId: senderRole === "staff" ? "admin_staff" : "customer_user",
      senderName,
      senderRole,
      message,
      createdAt: new Date().toISOString(),
    });
    ticket.updatedAt = new Date().toISOString();
    this.persist("sd_mock_tickets", this.supportTickets);
    return ticket;
  }

  // ==========================================
  // CONTACT MESSAGES
  // ==========================================
  getContactMessages(): ContactMessage[] {
    return this.contactMessages;
  }

  saveContactMessage(message: ContactMessage): ContactMessage {
    const idx = this.contactMessages.findIndex((m) => m.id === message.id);
    if (idx > -1) {
      this.contactMessages[idx] = message;
    } else {
      this.contactMessages.unshift(message);
    }
    this.persist("sd_mock_contact_messages", this.contactMessages);
    return message;
  }

  updateContactMessageStatus(
    id: string,
    status: "unread" | "read" | "replied" | "archived",
    reply?: string
  ): ContactMessage | undefined {
    const msg = this.contactMessages.find((m) => m.id === id);
    if (!msg) return undefined;

    msg.status = status;
    msg.updatedAt = new Date().toISOString();
    if (reply) {
      msg.reply = reply;
      msg.repliedAt = new Date().toISOString();
      msg.repliedBy = "Admin Support";
    }
    this.persist("sd_mock_contact_messages", this.contactMessages);
    return msg;
  }

  // ==========================================
  // WISHLIST PERSISTENCE
  // ==========================================
  getWishlist(userId?: string): string[] {
    if (typeof window === "undefined") return [];
    try {
      const key = userId ? `sd_mock_wishlist_${userId}` : "sd_mock_wishlist";
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
      const fallback = localStorage.getItem("silkendrift_wishlist") || localStorage.getItem("sd_mock_wishlist");
      return fallback ? JSON.parse(fallback) : [];
    } catch {
      return [];
    }
  }

  saveWishlist(slugs: string[], userId?: string): void {
    if (typeof window === "undefined") return;
    try {
      const key = userId ? `sd_mock_wishlist_${userId}` : "sd_mock_wishlist";
      localStorage.setItem(key, JSON.stringify(slugs));
      localStorage.setItem("silkendrift_wishlist", JSON.stringify(slugs));
    } catch (e) {
      console.warn("Could not save wishlist to mock store:", e);
    }
  }

  toggleWishlist(slug: string, userId?: string): string[] {
    const current = this.getWishlist(userId);
    const updated = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    this.saveWishlist(updated, userId);
    return updated;
  }

  // ==========================================
  // SETTINGS & SYSTEM RESET
  // ==========================================
  getSettings(): BusinessSettings {
    if (typeof window !== "undefined") {
      try {
        const set = localStorage.getItem("sd_mock_settings");
        if (set) {
          this.settings = { ...SEED_SETTINGS, ...JSON.parse(set) };
        }
      } catch {}
    }
    return this.settings;
  }

  updateSettings(newSettings: Partial<BusinessSettings>): BusinessSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.persist("sd_mock_settings", this.settings);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("silkendrift:settings-updated", { detail: this.settings })
      );
    }
    return this.settings;
  }

  reset(): void {
    this.loadSeeds();
    this.persist("sd_mock_products", this.products);
    this.persist("sd_mock_categories", this.categories);
    this.persist("sd_mock_brands", this.brands);
    this.persist("sd_mock_suppliers", this.suppliers);
    this.persist("sd_mock_orders", this.orders);
    this.persist("sd_mock_delivery_zones", this.deliveryZones);
    this.persist("sd_mock_pickup_points", this.pickupPoints);
    this.persist("sd_mock_coupons", this.coupons);
    this.persist("sd_mock_banners", this.banners);
    this.persist("sd_mock_settings", this.settings);
  }
}

export const mockRepository = new MockDataRepository();
