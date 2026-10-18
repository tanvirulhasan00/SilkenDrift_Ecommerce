import React, { useState, useEffect } from "react";
import { useLoaderData, Link } from "react-router";
import { firestoreService } from "~/services/firebase/firestoreService";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { formatPriceBDT, formatDate } from "~/lib/formatters";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { Modal } from "~/components/ui/Modal";
import { Input } from "~/components/ui/Input";
import { useToast } from "~/components/feedback/ToastContext";
import { Order, OrderStatus, PaymentStatus } from "~/types";
import {
  Search,
  Truck,
  ExternalLink,
  Printer,
  CheckCircle,
  FileText,
  Clock,
} from "lucide-react";

export async function clientLoader() {
  const orders = await firestoreService.getOrders();
  return { orders };
}

export default function AdminOrdersPage() {
  const { orders: initialOrders } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Real-time listener for orders from live Firestore
  useEffect(() => {
    const unsubscribe = firestoreService.subscribeToOrders((liveOrders) => {
      setOrders(liveOrders);
    });
    return () => unsubscribe();
  }, []);

  // Modal for courier assignment
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [courierProvider, setCourierProvider] = useState<"pathao" | "steadfast" | "redx">("pathao");
  const [trackingId, setTrackingId] = useState("");

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const updated = await firestoreService.updateOrderStatus(orderId, newStatus);
    if (updated) {
      setOrders(orders.map((o) => (o.id === orderId ? { ...updated } : o)));
      showToast(`Status updated to ${newStatus}`, "success");
    }
  };

  const handleAssignCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const generatedTracking = trackingId.trim() || `${courierProvider.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const updated = mockRepository.assignCourier(selectedOrder.id, courierProvider, generatedTracking);

    if (updated) {
      setOrders(orders.map((o) => (o.id === selectedOrder.id ? { ...updated } : o)));
      showToast(`Order dispatched via ${courierProvider.toUpperCase()}`, "success");
      setSelectedOrder(null);
      setTrackingId("");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
            {t.admin.orders}
          </h1>
          <p className="text-xs text-silk-700 dark:text-silk-300 font-medium mt-0.5">
            {language === "bn"
              ? "অর্ডার প্রসেসিং, পাঠাও/স্টিডফাস্ট কুরিয়ার অ্যাসাইন ও চালান প্রিন্ট"
              : "Order fulfillment, courier dispatching, and tracking lifecycle"}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder={language === "bn" ? "অর্ডার নং বা ফোন দিয়ে খুঁজুন..." : "Search by order # or phone..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-silk-300 bg-white dark:bg-dark-surface dark:border-dark-border"
          />
          <Search className="w-4 h-4 text-silk-600 dark:text-silk-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <span className="text-silk-800 dark:text-silk-200 font-bold">{t.common.filter}:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-silk-300 bg-white p-2 text-xs text-silk-900 dark:bg-dark-surface dark:border-dark-border dark:text-silk-100"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-silk-200 overflow-hidden shadow-card dark:bg-dark-surface dark:border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-silk-100/90 border-b border-silk-200 dark:bg-dark-elevated dark:border-dark-border text-silk-900 dark:text-silk-200 uppercase text-[10px] font-extrabold tracking-wider">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Total (BDT)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Courier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silk-100 dark:divide-dark-border">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-silk-50/50 dark:hover:bg-dark-elevated/40">
                  <td className="py-3 px-4 font-mono font-bold text-silk-950 dark:text-silk-100">
                    #{order.orderNumber}
                  </td>
                  <td className="py-3 px-4 text-silk-700 dark:text-silk-300 font-medium">
                    {formatDate(order.createdAt, language)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-silk-900 dark:text-silk-100 block">
                      {order.customerName}
                    </span>
                    <span className="text-[11px] font-mono font-medium text-silk-600 dark:text-silk-400">
                      {order.customerPhone}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-silk-700 dark:text-silk-300">
                    {order.shippingAddress.upazila}, {order.shippingAddress.district}
                  </td>
                  <td className="py-3 px-4 font-serif font-bold text-silk-900 dark:text-silk-100">
                    {formatPriceBDT(order.totalBDT, language)}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        handleUpdateStatus(order.id, e.target.value as OrderStatus)
                      }
                      className="rounded-md border border-silk-200 bg-silk-50 py-1 px-2 text-[11px] font-semibold text-silk-900 focus:outline-none dark:bg-dark-elevated dark:border-dark-border dark:text-silk-200"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    {order.courierTrackingId ? (
                      <div>
                        <span className="font-bold text-[10px] uppercase text-emerald-600">
                          {order.courierProvider}
                        </span>
                        <span className="block font-mono text-[10px] text-silk-700 dark:text-silk-300 font-medium">
                          {order.courierTrackingId}
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="text-[11px] font-semibold text-gold-600 hover:text-gold-700 underline flex items-center gap-1"
                      >
                        <Truck className="w-3 h-3" />
                        <span>Assign</span>
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/order/success/${order.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 p-1 text-silk-400 hover:text-gold-600"
                      title="Print Invoice"
                    >
                      <Printer className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Courier Assignment Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Assign Courier for Order #${selectedOrder.orderNumber}`}
        >
          <form onSubmit={handleAssignCourier} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-silk-800 dark:text-silk-200 mb-1">
                Select Courier Partner
              </label>
              <select
                value={courierProvider}
                onChange={(e) => setCourierProvider(e.target.value as any)}
                className="w-full rounded-lg border border-silk-300 bg-white p-2.5 text-xs text-silk-900 dark:bg-dark-surface dark:border-dark-border dark:text-silk-100"
              >
                <option value="pathao">Pathao Courier (Express Dhaka/Nationwide)</option>
                <option value="steadfast">Steadfast Courier (64 Districts)</option>
                <option value="redx">RedX Logistics</option>
              </select>
            </div>

            <Input
              label="Courier Tracking Code (Auto-generated if left blank)"
              placeholder="e.g. PTH-DH-982144"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setSelectedOrder(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold">
                Confirm & Dispatch
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
