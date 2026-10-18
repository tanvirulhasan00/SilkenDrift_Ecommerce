import { DeliveryProviderAdapter, CourierShipmentResult, CourierTrackingEvent } from "./types";
import { Order } from "~/types";

export class PathaoCourierAdapter implements DeliveryProviderAdapter {
  id = "pathao" as const;
  name = "Pathao Courier (Express)";

  async createShipment(order: Order): Promise<CourierShipmentResult> {
    const trackingId = `PTH-${order.shippingAddress.district.slice(0, 2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      success: true,
      trackingId,
      consignmentId: `CONS_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      estimatedDelivery: "24-48 Hours",
    };
  }

  async trackShipment(trackingId: string): Promise<CourierTrackingEvent[]> {
    return [
      {
        status: "Parcel Picked Up",
        timestamp: new Date().toISOString(),
        location: "Central Hub, Tejgaon, Dhaka",
        comment: `Rider assigned for shipment ${trackingId}`,
      },
    ];
  }
}

export class SteadfastCourierAdapter implements DeliveryProviderAdapter {
  id = "steadfast" as const;
  name = "Steadfast Courier (Nationwide)";

  async createShipment(order: Order): Promise<CourierShipmentResult> {
    const trackingId = `STF-${Math.floor(1000000 + Math.random() * 9000000)}`;
    return {
      success: true,
      trackingId,
      estimatedDelivery: "2-4 Days",
    };
  }

  async trackShipment(trackingId: string): Promise<CourierTrackingEvent[]> {
    return [
      {
        status: "In Transit to Sorting Hub",
        timestamp: new Date().toISOString(),
        location: "Dhaka Regional Gateway",
        comment: `Consignment ${trackingId} processed`,
      },
    ];
  }
}

export class RedXCourierAdapter implements DeliveryProviderAdapter {
  id = "redx" as const;
  name = "RedX Logistics";

  async createShipment(order: Order): Promise<CourierShipmentResult> {
    const trackingId = `RDX-${Date.now().toString().slice(-6)}`;
    return {
      success: true,
      trackingId,
      estimatedDelivery: "3 Days",
    };
  }

  async trackShipment(trackingId: string): Promise<CourierTrackingEvent[]> {
    return [
      {
        status: "Manifest Created",
        timestamp: new Date().toISOString(),
        location: "Mirpur Dispatch Hub",
      },
    ];
  }
}

export const deliveryAdapters: Record<string, DeliveryProviderAdapter> = {
  pathao: new PathaoCourierAdapter(),
  steadfast: new SteadfastCourierAdapter(),
  redx: new RedXCourierAdapter(),
};
