import { PaymentAdapter, PaymentInitiationResult, PaymentVerificationResult } from "./types";
import { Order } from "~/types";

/**
 * bKash Payment Adapter Scaffolding
 * Frontend boundary that calls Firebase Cloud Functions.
 * App Key and App Secret are securely retained on the server.
 */
export class BKashPaymentAdapter implements PaymentAdapter {
  id = "bkash" as const;
  nameEn = "bKash Online Payment";
  nameBn = "বিকাশ অনলাইন পেমেন্ট";

  async initiatePayment(order: Order): Promise<PaymentInitiationResult> {
    try {
      // In production, invoke secure Firebase Cloud Function endpoint:
      // const response = await fetch(`${FUNCTIONS_URL}/api/payments/bkash/create`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ orderId: order.id, amountBDT: order.totalBDT, phone: order.customerPhone }),
      // });
      // return await response.json();

      // Scaffolding demonstration response:
      return {
        success: true,
        paymentId: `BKASH_${order.orderNumber}_${Date.now()}`,
        instructionsEn: "Please complete bKash authorization in popup or enter bKash Verification PIN.",
        instructionsBn: "অনুগ্রহ করে আপনার বিকাশ পিন নম্বর ও ভেরিফিকেশন ওটিপি নিশ্চিত করুন।",
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to initiate bKash payment",
      };
    }
  }

  async verifyPayment(paymentId: string, data: Record<string, unknown>): Promise<PaymentVerificationResult> {
    // Scaffolded execution call:
    return {
      success: true,
      transactionId: `TRX_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      status: "paid",
      rawResponse: { paymentId, ...data },
    };
  }
}

/**
 * SSLCOMMERZ Payment Adapter Scaffolding
 * Frontend boundary calling Cloud Functions session generator.
 * Store ID and Store Password are kept secret on backend.
 */
export class SSLCommerzPaymentAdapter implements PaymentAdapter {
  id = "sslcommerz" as const;
  nameEn = "SSLCOMMERZ Gateway (Cards / MFS / Net Banking)";
  nameBn = "এসএসএলকমার্জ গেটওয়ে (কার্ড / নগদ / ইন্টারনেট ব্যাংকিং)";

  async initiatePayment(order: Order): Promise<PaymentInitiationResult> {
    try {
      return {
        success: true,
        paymentId: `SSL_${order.orderNumber}_${Date.now()}`,
        redirectUrl: `https://sandbox.sslcommerz.com/gwprocess/v4/simulator?tran_id=${order.orderNumber}`,
        instructionsEn: "Redirecting to SSLCOMMERZ secure multi-channel payment gateway...",
        instructionsBn: "এসএসএলকমার্জ এর সুরক্ষিত পেমেন্ট গেটওয়েতে রিডাইরেক্ট করা হচ্ছে...",
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "SSLCOMMERZ initiation error",
      };
    }
  }

  async verifyPayment(paymentId: string, data: Record<string, unknown>): Promise<PaymentVerificationResult> {
    return {
      success: true,
      transactionId: `VAL_${Date.now()}`,
      status: "paid",
      rawResponse: { paymentId, ...data },
    };
  }
}

/**
 * Cash on Delivery Adapter
 * Enforces business eligibility rules (e.g., maximum order amount ৳15,000)
 */
export class CashOnDeliveryAdapter implements PaymentAdapter {
  id = "cod" as const;
  nameEn = "Cash on Delivery";
  nameBn = "ক্যাশ অন ডেলিভারি";

  private maxEligibleAmountBDT = 15000;

  async initiatePayment(order: Order): Promise<PaymentInitiationResult> {
    if (order.totalBDT > this.maxEligibleAmountBDT) {
      return {
        success: false,
        error: `Cash on Delivery is limited to orders up to ৳${this.maxEligibleAmountBDT}. Please use bKash or card for larger orders.`,
      };
    }

    return {
      success: true,
      paymentId: `COD_${order.orderNumber}`,
      instructionsEn: "Your order is confirmed for Cash on Delivery. Please keep exact cash ready upon delivery.",
      instructionsBn: "আপনার অর্ডার ক্যাশ অন ডেলিভারিতে নিশ্চিত করা হয়েছে। ডেলিভারির সময় প্রস্তুত নগদ টাকা প্রদান করুন।",
    };
  }

  async verifyPayment(): Promise<PaymentVerificationResult> {
    return {
      success: true,
      status: "cod_pending",
    };
  }
}

export const paymentAdapters: Record<string, PaymentAdapter> = {
  bkash: new BKashPaymentAdapter(),
  sslcommerz: new SSLCommerzPaymentAdapter(),
  cod: new CashOnDeliveryAdapter(),
};
