export type UserRole = "admin" | "manager" | "customer";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  status: "active" | "suspended" | "pending";
  isDemo?: boolean;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  totalOrders: number;
  totalSpendBDT: number;
  loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  notes?: string;
  tags: string[];
  isBlocked: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  areaAddress: string;
  postalCode: string;
  isDefault?: boolean;
  label?: "Home" | "Office" | "Other";
}

export interface Category {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  descriptionEn?: string;
  descriptionBn?: string;
  icon?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  featuredOnHome?: boolean;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  isActive: boolean;
}

export interface Brand {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  logoUrl: string;
  descriptionEn?: string;
  descriptionBn?: string;
  isFeatured: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  titleEn: string;
  titleBn: string;
  attributes: {
    size?: string;
    color?: string;
    material?: string;
  };
  priceBDT: number;
  salePriceBDT?: number;
  stock: number;
  imageUrl?: string;
  images?: string[];
  isDefault?: boolean;
}

export interface Product {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  sku: string;
  descriptionEn: string;
  descriptionBn: string;
  specificationsEn?: Record<string, string>;
  specificationsBn?: Record<string, string>;
  categoryId: string;
  subcategoryId?: string;
  brandId?: string;
  basePriceBDT: number;
  salePriceBDT?: number;
  stockTotal: number;
  lowStockThreshold: number;
  images: string[];
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFlashDeal?: boolean;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categorySpecialty: string;
  rating: number;
  status: "active" | "inactive";
  notes?: string;
  division?: string;
  district?: string;
  paymentTerms?: string;
  leadTimeDays?: number;
  createdAt: string;
}

export interface SourcingRecord {
  id: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  variantId?: string;
  sku: string;
  quantityReceived: number;
  purchaseCostBDT: number;
  batchNumber: string;
  receivedDate: string;
  notes?: string;
}

export type InventoryMovementType =
  | "sourcing"
  | "order"
  | "adjustment"
  | "return"
  | "damaged";

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  type: InventoryMovementType;
  quantityDelta: number; // positive or negative
  previousStock: number;
  newStock: number;
  referenceId: string; // Order ID or Sourcing ID
  reason: string;
  performedBy: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  productNameEn: string;
  productNameBn: string;
  productSlug: string;
  image: string;
  priceBDT: number;
  salePriceBDT?: number;
  quantity: number;
  maxStock: number;
  attributes?: {
    size?: string;
    color?: string;
  };
}

export interface WishlistItem {
  productId: string;
  productNameEn: string;
  productNameBn: string;
  productSlug: string;
  image: string;
  priceBDT: number;
  salePriceBDT?: number;
  inStock: boolean;
  addedAt: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "failed_delivery"
  | "returned"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "initiated"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded"
  | "cod_pending"
  | "cod_collected";

export type PaymentMethod = "bkash" | "sslcommerz" | "cod";

export type DeliveryMethod = "home_delivery" | "pickup_point" | "courier";

export interface OrderTimelineEvent {
  status: OrderStatus;
  labelEn: string;
  labelBn: string;
  timestamp: string;
  note?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productNameEn: string;
  productNameBn: string;
  image: string;
  priceBDT: number;
  quantity: number;
  subtotalBDT: number;
  attributes?: {
    size?: string;
    color?: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: Address;
  deliveryMethod: DeliveryMethod;
  pickupPointId?: string;
  pickupPointName?: string;
  items: OrderItem[];
  subtotalBDT: number;
  discountBDT: number;
  deliveryChargeBDT: number;
  vatBDT: number;
  totalBDT: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentId?: string;
  courierProvider?: "pathao" | "steadfast" | "redx" | "internal";
  courierTrackingId?: string;
  couponCode?: string;
  notes?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryZone {
  id: string;
  nameEn: string;
  nameBn: string;
  division: string;
  districts: string[];
  standardChargeBDT: number;
  freeShippingThresholdBDT: number;
  estimatedDays: string;
  isActive: boolean;
}

export interface PickupPoint {
  id: string;
  nameEn: string;
  nameBn: string;
  division: string;
  district: string;
  addressEn: string;
  addressBn: string;
  phone: string;
  operatingHours: string;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  descriptionEn: string;
  descriptionBn: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderBDT: number;
  maxDiscountBDT?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface Banner {
  id: string;
  titleEn: string;
  titleBn: string;
  subtitleEn?: string;
  subtitleBn?: string;
  ctaTextEn?: string;
  ctaTextBn?: string;
  linkUrl: string;
  imageUrl: string;
  placement: "hero" | "mid_banner" | "promo_sidebar" | "popup";
  priority: number;
  isActive: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface ProductQuestion {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  question: string;
  answer?: string;
  answeredBy?: string;
  isAnswered: boolean;
  createdAt: string;
  answeredAt?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  category: "order" | "delivery" | "payment" | "return" | "general";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo?: string;
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: "customer" | "staff";
    message: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  createdAt: string;
  updatedAt: string;
  reply?: string;
  repliedAt?: string;
  repliedBy?: string;
}

export interface BusinessSettings {
  id: string;
  storeName: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  taglineEn: string;
  taglineBn: string;
  phone: string;
  email: string;
  addressEn: string;
  addressBn: string;
  vatNumber?: string;
  vatRatePercent: number;
  defaultCurrency: string;
  codMaxAmountBDT: number;
  freeShippingMinBDT: number;
  insideDhakaChargeBDT: number;
  outsideDhakaChargeBDT: number;
  bKashMerchantNumber?: string;
  sslStoreId?: string;
  defaultLanguage: "bn" | "en";
  defaultTheme: "light" | "dark" | "system";
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  module: string;
  targetId?: string;
  details: string;
  timestamp: string;
}
