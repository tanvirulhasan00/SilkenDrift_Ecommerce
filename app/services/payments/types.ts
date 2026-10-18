import { Order, PaymentMethod, PaymentStatus } from "~/types";

export interface PaymentInitiationResult {
  success: boolean;
  paymentId?: string;
  redirectUrl?: string;
  instructionsEn?: string;
  instructionsBn?: string;
  error?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  transactionId?: string;
  status: PaymentStatus;
  rawResponse?: Record<string, unknown>;
  error?: string;
}

export interface PaymentAdapter {
  id: PaymentMethod;
  nameEn: string;
  nameBn: string;
  initiatePayment(order: Order): Promise<PaymentInitiationResult>;
  verifyPayment(paymentId: string, data: Record<string, unknown>): Promise<PaymentVerificationResult>;
}
