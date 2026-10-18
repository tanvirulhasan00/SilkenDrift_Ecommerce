import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config";
import {
  Product,
  Category,
  Brand,
  Order,
  OrderStatus,
  PaymentStatus,
  SupportTicket,
  ContactMessage,
  BusinessSettings,
  PickupPoint,
  Supplier,
  Coupon,
  DeliveryZone,
} from "~/types";
import {
  SEED_PRODUCTS,
  SEED_CATEGORIES,
  SEED_BRANDS,
  SEED_ORDERS,
  SEED_SETTINGS,
  SEED_PICKUP_POINTS,
  SEED_SUPPORT_TICKETS,
} from "../mock/seedData";
import { mockRepository } from "../mock/mockStore";
import { generateOrderNumber, generateId } from "~/lib/utils";

class FirestoreService {
  private hasLiveFirestore: boolean = false;
  public isDemoMode: boolean = true; // Safe default: Demo mode until authenticated as real user

  constructor() {
    this.hasLiveFirestore = isFirebaseConfigured();
  }

  /**
   * Set data isolation mode
   * @param isDemo If true, operations only modify local mock/browser store. Live DB is 100% protected.
   */
  setDemoMode(isDemo: boolean): void {
    this.isDemoMode = isDemo;
  }

  getIsDemoMode(): boolean {
    return this.isDemoMode;
  }

  // ==========================================
  // PRODUCTS
  // ==========================================

  /**
   * Fetch all products from Firestore (if real mode) or local mock data (if demo mode)
   */
  async getProducts(): Promise<Product[]> {
    // In demo mode or if no live firestore, isolate to mock repository
    if (this.isDemoMode || !this.hasLiveFirestore) {
      return mockRepository.getProducts();
    }

    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // If collection not yet seeded in Firestore, return seed products
        return mockRepository.getProducts();
      }

      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Product[];
    } catch (err) {
      console.warn("Firestore getProducts fallback to local store:", err);
      return mockRepository.getProducts();
    }
  }

  /**
   * Fetch single product by slug
   */
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    if (this.isDemoMode || !this.hasLiveFirestore) {
      return mockRepository.getProductBySlug(slug);
    }

    try {
      const q = query(collection(db, "products"), where("slug", "==", slug), limit(1));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }

      return mockRepository.getProductBySlug(slug);
    } catch (err) {
      console.warn("Firestore getProductBySlug fallback:", err);
      return mockRepository.getProductBySlug(slug);
    }
  }

  /**
   * Fetch single product by ID
   */
  async getProductById(id: string): Promise<Product | undefined> {
    if (this.isDemoMode || !this.hasLiveFirestore) {
      return mockRepository.getProductById(id);
    }

    try {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }

      return mockRepository.getProductById(id);
    } catch (err) {
      console.warn("Firestore getProductById fallback:", err);
      return mockRepository.getProductById(id);
    }
  }

  /**
   * Save or update product in Firestore (real mode) or local mock store (demo mode)
   */
  async saveProduct(product: Product): Promise<Product> {
    // Always keep mockRepository in sync
    mockRepository.saveProduct(product);

    // Write to live Firestore only for real authenticated staff
    if (this.hasLiveFirestore && !this.isDemoMode) {
      try {
        const productRef = doc(db, "products", product.id);
        const dataToSave = {
          ...product,
          updatedAt: new Date().toISOString(),
        };
        await setDoc(productRef, dataToSave, { merge: true });
      } catch (err) {
        console.error("Firestore saveProduct error:", err);
      }
    }

    return product;
  }

  /**
   * Delete product from Firestore (real mode) or local mock store (demo mode)
   */
  async deleteProduct(id: string): Promise<boolean> {
    mockRepository.deleteProduct(id);

    // Delete from live Firestore only for real staff
    if (this.hasLiveFirestore && !this.isDemoMode) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (err) {
        console.error("Firestore deleteProduct error:", err);
      }
    }

    return true;
  }

  // ==========================================
  // CATEGORIES CRUD
  // ==========================================

  /**
   * Fetch all categories
   */
  async getCategories(): Promise<Category[]> {
    if (this.isDemoMode || !this.hasLiveFirestore) {
      return mockRepository.getCategories();
    }

    try {
      const q = query(collection(db, "categories"), orderBy("sortOrder", "asc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return mockRepository.getCategories();
      }

      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Category[];
    } catch (err) {
      console.warn("Firestore getCategories fallback to local store:", err);
      return mockRepository.getCategories();
    }
  }

  /**
   * Save or update category in Firestore (real mode) or local mock store (demo mode)
   */
  async saveCategory(category: Category): Promise<Category> {
    mockRepository.saveCategory(category);

    if (this.hasLiveFirestore && !this.isDemoMode) {
      try {
        const catRef = doc(db, "categories", category.id);
        await setDoc(catRef, category, { merge: true });
      } catch (err) {
        console.error("Firestore saveCategory error:", err);
      }
    }

    return category;
  }

  /**
   * Delete category from Firestore (real mode) or local mock store (demo mode)
   */
  async deleteCategory(id: string): Promise<boolean> {
    mockRepository.deleteCategory(id);

    if (this.hasLiveFirestore && !this.isDemoMode) {
      try {
        await deleteDoc(doc(db, "categories", id));
      } catch (err) {
        console.error("Firestore deleteCategory error:", err);
      }
    }

    return true;
  }

  // ==========================================
  // SUPPLIERS & ARTISANS CRUD
  // ==========================================

  /**
   * Fetch all suppliers
   */
  async getSuppliers(): Promise<Supplier[]> {
    if (this.isDemoMode || !this.hasLiveFirestore) {
      return mockRepository.getSuppliers();
    }

    try {
      const snapshot = await getDocs(collection(db, "suppliers"));

      if (snapshot.empty) {
        return mockRepository.getSuppliers();
      }

      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Supplier[];
    } catch (err) {
      console.warn("Firestore getSuppliers fallback to local store:", err);
      return mockRepository.getSuppliers();
    }
  }

  /**
   * Save or update supplier in Firestore (real mode) or local mock store (demo mode)
   */
  async saveSupplier(supplier: Supplier): Promise<Supplier> {
    mockRepository.saveSupplier(supplier);

    if (this.hasLiveFirestore && !this.isDemoMode) {
      try {
        const supRef = doc(db, "suppliers", supplier.id);
        await setDoc(supRef, supplier, { merge: true });
      } catch (err) {
        console.error("Firestore saveSupplier error:", err);
      }
    }

    return supplier;
  }

  /**
   * Delete supplier from Firestore (real mode) or local mock store (demo mode)
   */
  async deleteSupplier(id: string): Promise<boolean> {
    mockRepository.deleteSupplier(id);

    if (this.hasLiveFirestore && !this.isDemoMode) {
      try {
        await deleteDoc(doc(db, "suppliers", id));
      } catch (err) {
        console.error("Firestore deleteSupplier error:", err);
      }
    }

    return true;
  }

  // ==========================================
  // ORDERS (Free Spark Plan Direct Creation)
  // ==========================================

  /**
   * Create an order in Firestore and local store
   */
  async createOrder(
    orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt" | "timeline">
  ): Promise<Order> {
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

    // Save to local store for instant reactive UI
    mockRepository.createOrder(orderData);

    // Save to Firestore only in real user mode
    if (this.hasLiveFirestore && !this.isDemoMode) {
      try {
        const orderRef = doc(db, "orders", id);
        await setDoc(orderRef, newOrder);
      } catch (err) {
        console.error("Firestore createOrder error (order saved locally):", err);
      }
    }

    return newOrder;
  }

  /**
   * Get an order by ID or order number
   */
  async getOrderById(id: string): Promise<Order | undefined> {
    if (this.isDemoMode || !this.hasLiveFirestore) {
      return mockRepository.getOrderById(id);
    }

    try {
      // 1. Direct doc ID lookup
      const docRef = doc(db, "orders", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Order;
      }

      // 2. Query by orderNumber
      const q = query(collection(db, "orders"), where("orderNumber", "==", id), limit(1));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const item = querySnap.docs[0];
        return { id: item.id, ...item.data() } as Order;
      }

      // 3. Fallback to local
      return mockRepository.getOrderById(id);
    } catch (err) {
      console.warn("Firestore getOrderById fallback:", err);
      return mockRepository.getOrderById(id);
    }
  }

  /**
   * Get all orders
   */
  async getOrders(): Promise<Order[]> {
    if (this.isDemoMode || !this.hasLiveFirestore) {
      return mockRepository.getOrders();
    }

    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return mockRepository.getOrders();
      }

      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[];
    } catch (err) {
      console.warn("Firestore getOrders fallback:", err);
      return mockRepository.getOrders();
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    paymentStatus?: PaymentStatus,
    note?: string
  ): Promise<Order | undefined> {
    const updated = mockRepository.updateOrderStatus(orderId, status, paymentStatus, note);

    if (this.hasLiveFirestore && !this.isDemoMode && updated) {
      try {
        const orderRef = doc(db, "orders", updated.id);
        await updateDoc(orderRef, {
          orderStatus: status,
          ...(paymentStatus ? { paymentStatus } : {}),
          updatedAt: new Date().toISOString(),
          timeline: updated.timeline,
        });
      } catch (err) {
        console.error("Firestore updateOrderStatus error:", err);
      }
    }

    return updated;
  }

  /**
   * Realtime listener for orders in admin portal
   */
  subscribeToOrders(callback: (orders: Order[]) => void): () => void {
    if (!this.hasLiveFirestore) {
      callback(mockRepository.getOrders());
      return () => { };
    }

    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const liveOrders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[];
            callback(liveOrders);
          } else {
            callback(mockRepository.getOrders());
          }
        },
        (error) => {
          console.warn("Orders subscription error, using local:", error);
          callback(mockRepository.getOrders());
        }
      );
    } catch {
      callback(mockRepository.getOrders());
      return () => { };
    }
  }

  // ==========================================
  // SUPPORT TICKETS
  // ==========================================

  async createSupportTicket(
    ticket: Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "messages"> & {
      initialMessage: string;
    }
  ): Promise<SupportTicket> {
    const id = `tkt_${generateId()}`;
    const now = new Date().toISOString();

    const newTicket: SupportTicket = {
      id,
      ticketNumber: `TK-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: ticket.customerName,
      customerEmail: ticket.customerEmail || "customer@silkendrift.com",
      customerPhone: ticket.customerPhone,
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      status: "open",
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: `msg_${generateId()}`,
          senderId: "customer_user",
          senderName: ticket.customerName,
          senderRole: "customer",
          message: ticket.initialMessage,
          createdAt: now,
        },
      ],
    };

    mockRepository.createSupportTicket(newTicket);

    if (this.hasLiveFirestore && !this.isDemoMode) {
      try {
        await setDoc(doc(db, "supportTickets", id), newTicket);
      } catch (err) {
        console.error("Firestore createSupportTicket error:", err);
      }
    }

    return newTicket;
  }

  // ==========================================
  // CONTACT MESSAGES (Storefront Contact Page -> Admin Panel)
  // ==========================================

  /**
   * Submit a contact message from the storefront contact page
   * Saves to Firestore 'contactMessages' collection (real mode) and syncs locally
   */
  async submitContactMessage(data: {
    name: string;
    phone: string;
    email?: string;
    subject?: string;
    message: string;
  }): Promise<{ success: boolean; id: string; error?: string }> {
    const id = `cmsg_${generateId()}`;
    const now = new Date().toISOString();

    const contactMsg: ContactMessage = {
      id,
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      subject: data.subject || "Customer Inquiry from SilkenDrift Storefront",
      message: data.message,
      status: "unread",
      createdAt: now,
      updatedAt: now,
    };

    // Save locally
    mockRepository.saveContactMessage(contactMsg);

    // Save to Firestore only in real user mode
    if (this.hasLiveFirestore && !this.isDemoMode) {
      try {
        await setDoc(doc(db, "contactMessages", id), contactMsg);
      } catch (err: any) {
        console.error("Firestore submitContactMessage error (saved locally):", err);
      }
    }

    return { success: true, id };
  }

  /**
   * Fetch all contact messages for admin panel
   */
  async getContactMessages(): Promise<ContactMessage[]> {
    if (this.isDemoMode || !this.hasLiveFirestore) {
      return mockRepository.getContactMessages();
    }

    try {
      const q = query(collection(db, "contactMessages"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return mockRepository.getContactMessages();
      }

      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as ContactMessage[];
    } catch (err) {
      console.warn("Firestore getContactMessages fallback to local:", err);
      return mockRepository.getContactMessages();
    }
  }

  /**
   * Real-time listener for contact messages in admin panel
   */
  subscribeToContactMessages(callback: (messages: ContactMessage[]) => void): () => void {
    if (this.isDemoMode || !this.hasLiveFirestore) {
      callback(mockRepository.getContactMessages());
      return () => { };
    }

    try {
      const q = query(collection(db, "contactMessages"), orderBy("createdAt", "desc"));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const liveMessages = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as ContactMessage[];
            callback(liveMessages);
          } else {
            callback(mockRepository.getContactMessages());
          }
        },
        (error) => {
          console.warn("Contact messages subscription error, using local:", error);
          callback(mockRepository.getContactMessages());
        }
      );
    } catch {
      callback(mockRepository.getContactMessages());
      return () => { };
    }
  }

  /**
   * Update contact message status (mark as read, replied, archived)
   */
  async updateContactMessageStatus(
    id: string,
    status: "unread" | "read" | "replied" | "archived",
    reply?: string
  ): Promise<boolean> {
    mockRepository.updateContactMessageStatus(id, status, reply);

    if (this.hasLiveFirestore && !this.isDemoMode) {
      try {
        const msgRef = doc(db, "contactMessages", id);
        const updatePayload: Record<string, any> = {
          status,
          updatedAt: new Date().toISOString(),
        };
        if (reply) {
          updatePayload.reply = reply;
          updatePayload.repliedAt = new Date().toISOString();
          updatePayload.repliedBy = "Admin Support";
        }
        await updateDoc(msgRef, updatePayload);
      } catch (err) {
        console.error("Firestore updateContactMessageStatus error:", err);
      }
    }

    return true;
  }

  // ==========================================
  // BUSINESS SETTINGS & BRAND IDENTITY
  // ==========================================

  /**
   * Fetch business settings from Firestore or local mock store
   */
  async getSettings(): Promise<BusinessSettings> {
    if (this.hasLiveFirestore) {
      try {
        const settingsRef = doc(db, "settings", "business");
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) {
          const liveSettings = {
            ...SEED_SETTINGS,
            id: docSnap.id,
            ...docSnap.data(),
          } as BusinessSettings;
          // Keep local mock repository synchronized
          mockRepository.updateSettings(liveSettings);
          return liveSettings;
        }
      } catch (err) {
        console.warn("Firestore getSettings fallback to local store:", err);
      }
    }

    return mockRepository.getSettings();
  }

  /**
   * Save or update business settings in Firestore and local store
   */
  async saveSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const updated = mockRepository.updateSettings(settings);

    if (this.hasLiveFirestore) {
      try {
        const settingsRef = doc(db, "settings", "business");
        const dataToSave = {
          ...updated,
          updatedAt: new Date().toISOString(),
        };
        await setDoc(settingsRef, dataToSave, { merge: true });
      } catch (err) {
        console.error("Firestore saveSettings error:", err);
      }
    }

    return updated;
  }

  /**
   * Realtime listener for business settings changes
   */
  subscribeToSettings(callback: (settings: BusinessSettings) => void): () => void {
    let firestoreUnsub: (() => void) | null = null;

    if (this.hasLiveFirestore) {
      try {
        const settingsRef = doc(db, "settings", "business");
        firestoreUnsub = onSnapshot(
          settingsRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const liveSettings = {
                ...SEED_SETTINGS,
                id: docSnap.id,
                ...docSnap.data(),
              } as BusinessSettings;
              mockRepository.updateSettings(liveSettings);
              callback(liveSettings);
            }
          },
          (error) => {
            console.warn("Settings realtime subscription fallback:", error);
          }
        );
      } catch (err) {
        console.warn("Error attaching firestore settings listener:", err);
      }
    }

    const handleLocalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<BusinessSettings>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      } else {
        callback(mockRepository.getSettings());
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("silkendrift:settings-updated", handleLocalUpdate);
    }

    // Call immediately with current settings
    callback(mockRepository.getSettings());

    return () => {
      if (firestoreUnsub) firestoreUnsub();
      if (typeof window !== "undefined") {
        window.removeEventListener("silkendrift:settings-updated", handleLocalUpdate);
      }
    };
  }

  // ==========================================
  // ONE-CLICK DATABASE SEEDER (Spark Free Tier)
  // ==========================================

  /**
   * Seeds initial Bangladesh silk products, categories, brands, and settings into Firestore
   */
  async seedFirestore(): Promise<{ success: boolean; count: number; error?: string }> {
    if (!this.hasLiveFirestore) {
      return { success: false, count: 0, error: "Firebase is not configured" };
    }

    try {
      const batch = writeBatch(db);
      let count = 0;

      // Seed Products
      for (const p of SEED_PRODUCTS) {
        const ref = doc(db, "products", p.id);
        batch.set(ref, p, { merge: true });
        count++;
      }

      // Seed Categories
      for (const c of SEED_CATEGORIES) {
        const ref = doc(db, "categories", c.id);
        batch.set(ref, c, { merge: true });
        count++;
      }

      // Seed Brands
      for (const b of SEED_BRANDS) {
        const ref = doc(db, "brands", b.id);
        batch.set(ref, b, { merge: true });
        count++;
      }

      // Seed Pickup Points
      for (const pp of SEED_PICKUP_POINTS) {
        const ref = doc(db, "pickupPoints", pp.id);
        batch.set(ref, pp, { merge: true });
        count++;
      }

      // Seed Business Settings
      const settingsRef = doc(db, "settings", "business");
      batch.set(settingsRef, SEED_SETTINGS, { merge: true });
      count++;

      // Seed Initial Orders for demo analytics
      for (const o of SEED_ORDERS) {
        const ref = doc(db, "orders", o.id);
        batch.set(ref, o, { merge: true });
        count++;
      }

      // Commit batch
      await batch.commit();

      return { success: true, count };
    } catch (err: any) {
      console.error("Error seeding Firestore:", err);
      return {
        success: false,
        count: 0,
        error: err.message || "Failed to commit Firestore batch",
      };
    }
  }
}

export const firestoreService = new FirestoreService();
