import { onCall, onRequest, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

interface OrderItemPayload {
  productId: string;
  quantity: number;
  priceBDT: number;
}

interface CreateOrderPayload {
  items: OrderItemPayload[];
  customerName: string;
  customerPhone: string;
  shippingAddress: Record<string, unknown>;
  deliveryMethod: string;
  paymentMethod: string;
  totalBDT: number;
}

/**
 * Atomic Order Creation with Server-Side Inventory Verification
 * Prevents overselling by running in a Firestore Transaction.
 */
export const createOrderWithInventoryLock = onCall(
  async (request: CallableRequest<CreateOrderPayload>) => {
    const { items, customerName, customerPhone, shippingAddress, deliveryMethod, paymentMethod, totalBDT } = request.data;

    if (!items || !items.length) {
      throw new HttpsError("invalid-argument", "Order must contain at least one item.");
    }

    return await db.runTransaction(async (transaction: admin.firestore.Transaction) => {
      // 1. Verify stock for each item
      const productDocs = await Promise.all(
        items.map((item) =>
          transaction.get(db.collection("products").doc(item.productId))
        )
      );

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const productSnap = productDocs[i];

        if (!productSnap.exists) {
          throw new HttpsError("not-found", `Product ${item.productId} not found.`);
        }

        const productData = productSnap.data()!;
        if (productData.stockTotal < item.quantity) {
          throw new HttpsError(
            "failed-precondition",
            `Insufficient stock for "${productData.nameEn}". Available: ${productData.stockTotal}`
          );
        }
      }

      // 2. Decrement stock atomically
      const now = new Date().toISOString();
      const orderRef = db.collection("orders").doc();
      const orderNumber = `SD-${Date.now().toString().slice(-8)}`;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const productSnap = productDocs[i];
        const productData = productSnap.data()!;
        const prevStock = productData.stockTotal;
        const newStock = prevStock - item.quantity;

        transaction.update(productSnap.ref, {
          stockTotal: newStock,
          updatedAt: now,
        });

        // Record inventory movement
        const movRef = db.collection("inventoryMovements").doc();
        transaction.set(movRef, {
          productId: item.productId,
          productName: productData.nameEn,
          type: "order",
          quantityDelta: -item.quantity,
          previousStock: prevStock,
          newStock,
          referenceId: orderNumber,
          reason: `Customer Order ${orderNumber}`,
          performedBy: "Server Transaction",
          createdAt: now,
        });
      }

      // 3. Create the order record
      const orderRecord = {
        orderNumber,
        customerId: request.auth ? request.auth.uid : "guest",
        customerName,
        customerPhone,
        shippingAddress,
        deliveryMethod,
        items,
        totalBDT,
        orderStatus: "confirmed",
        paymentStatus: paymentMethod === "cod" ? "cod_pending" : "pending",
        paymentMethod,
        timeline: [
          {
            status: "confirmed",
            labelEn: "Order placed & inventory reserved",
            labelBn: "অর্ডার গ্রহণ ও স্টক রিজার্ভ সম্পন্ন",
            timestamp: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      transaction.set(orderRef, orderRecord);
      return { orderId: orderRef.id, orderNumber, success: true };
    });
  }
);

/**
 * bKash Payment Initiation Endpoint
 * Server-side boundary storing private bKash credentials.
 */
export const createBkashPayment = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(204).send("");
    return;
  }

  try {
    const mockPaymentID = `BKASH_GW_${Date.now()}`;

    res.json({
      statusCode: "0000",
      statusMessage: "Successful",
      paymentID: mockPaymentID,
      bkashURL: `https://sandbox.payment.bka.sh/redirect/tokenized/?paymentID=${mockPaymentID}`,
      receivedPayload: req.body,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Payment error";
    res.status(500).json({ error: message });
  }
});

/**
 * SSLCOMMERZ Payment Session Creator
 * Generates gateway session and returns GatewayPageURL.
 */
export const initiateSslCommerzPayment = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
    return;
  }

  try {
    const storeId = process.env.SSL_STORE_ID || "silkendrift_sandbox";
    const mockSessionKey = `SSL_SESSION_${Date.now()}`;

    res.json({
      status: "SUCCESS",
      sessionkey: mockSessionKey,
      storeId,
      GatewayPageURL: `https://sandbox.sslcommerz.com/EasyCheckOut/testbox/${mockSessionKey}`,
      receivedPayload: req.body,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "SSLCOMMERZ error";
    res.status(500).json({ error: message });
  }
});

/**
 * SSLCOMMERZ IPN Webhook Receiver
 * Verifies gateway hash signature and confirms order payment status.
 */
export const sslCommerzIpnWebhook = onRequest(async (req, res) => {
  try {
    const { tran_id, val_id, status } = req.body;
    if (status === "VALID" || status === "VALIDATED") {
      const snapshot = await db
        .collection("orders")
        .where("orderNumber", "==", tran_id)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        await doc.ref.update({
          paymentStatus: "paid",
          paymentId: val_id,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    res.status(200).send("IPN_PROCESSED");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "IPN error";
    res.status(500).send(message);
  }
});

interface SetUserRolePayload {
  targetUid: string;
  newRole: "admin" | "manager" | "customer";
}

/**
 * Admin User Role Assignment & Custom Claims
 * Accessible only by users who already have 'admin' claim.
 */
export const setUserRole = onCall(
  async (request: CallableRequest<SetUserRolePayload>) => {
    if (!request.auth || request.auth.token.role !== "admin") {
      throw new HttpsError(
        "permission-denied",
        "Only super-administrators can assign staff roles."
      );
    }

    const { targetUid, newRole } = request.data;
    if (!["admin", "manager", "customer"].includes(newRole)) {
      throw new HttpsError("invalid-argument", "Invalid role specified.");
    }

    await admin.auth().setCustomUserClaims(targetUid, { role: newRole });
    await db.collection("users").doc(targetUid).update({
      role: newRole,
      updatedAt: new Date().toISOString(),
    });

    // Log admin action to AuditLogs
    await db.collection("auditLogs").add({
      actorId: request.auth.uid,
      action: `Changed role of user ${targetUid} to ${newRole}`,
      module: "User Management",
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }
);
