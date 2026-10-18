import { Order } from "~/types";

export interface CourierShipmentResult {
  success: boolean;
  trackingId: string;
  consignmentId?: string;
  labelUrl?: string;
  estimatedDelivery?: string;
  error?: string;
}

export interface CourierTrackingEvent {
  status: string;
  timestamp: string;
  location?: string;
  comment?: string;
}

export interface DeliveryProviderAdapter {
  id: "pathao" | "steadfast" | "redx" | "internal";
  name: string;
  createShipment(order: Order): Promise<CourierShipmentResult>;
  trackShipment(trackingId: string): Promise<CourierTrackingEvent[]>;
}
