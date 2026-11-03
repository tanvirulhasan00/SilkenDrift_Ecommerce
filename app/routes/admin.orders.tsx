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
  Trash2,
  AlertTriangle,
  X,
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

  // Order Selection & Bulk Delete
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isAllOrdersSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selectedOrderIds.includes(o.id));

  const isSomeOrdersSelected =
    filteredOrders.some((o) => selectedOrderIds.includes(o.id)) &&
    !isAllOrdersSelected;

  const handleToggleSelectAllOrders = () => {
    if (isAllOrdersSelected) {
      const filteredIdSet = new Set(filteredOrders.map((o) => o.id));
      setSelectedOrderIds(selectedOrderIds.filter((id) => !filteredIdSet.has(id)));
    } else {
      const newSelected = new Set([...selectedOrderIds, ...filteredOrders.map((o) => o.id)]);
      setSelectedOrderIds(Array.from(newSelected));
    }
  };

  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteOrder = async (id: string, orderNumber: string) => {
    if (
      confirm(
        language === "bn"
          ? `আপনি কি নিশ্চিতভাবে অর্ডার #${orderNumber} মুছে ফেলতে চান?`
          : `Are you sure you want to delete Order #${orderNumber}?`
      )
    ) {
      await firestoreService.deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setSelectedOrderIds((prev) => prev.filter((item) => item !== id));
      showToast(
        language === "bn" ? `অর্ডার #${orderNumber} মুছে ফেলা হয়েছে` : `Order #${orderNumber} deleted`,
        "info"
      );
    }
  };

  const handleConfirmBulkDeleteOrders = async () => {
    if (selectedOrderIds.length === 0) return;
    setIsDeletingBulk(true);
    try {
      await firestoreService.deleteOrders(selectedOrderIds);
      const idSet = new Set(selectedOrderIds);
      setOrders((prev) => prev.filter((o) => !idSet.has(o.id)));
      showToast(
        language === "bn"
          ? `${selectedOrderIds.length} টি অর্ডার সফলভাবে মুছে ফেলা হয়েছে`
          : `Successfully deleted ${selectedOrderIds.length} order(s)`,
        "success"
      );
      setSelectedOrderIds([]);
      setIsBulkDeleteModalOpen(false);
    } catch (err) {
      console.error("Bulk delete orders error:", err);
      showToast("Failed to delete selected orders", "error");
    } finally {
      setIsDeletingBulk(false);
    }
  };

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

      {/* Bulk Selection Actions Bar */}
      {selectedOrderIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {selectedOrderIds.length}
            </div>
            <div>
              <p className="text-xs font-bold text-silk-950 dark:text-silk-100">
                {language === "bn"
                  ? `${selectedOrderIds.length} টি অর্ডার নির্বাচন করা হয়েছে`
                  : `${selectedOrderIds.length} order${selectedOrderIds.length > 1 ? "s" : ""} selected`}
              </p>
              <p className="text-[11px] text-silk-600 dark:text-silk-400">
                {language === "bn"
                  ? "নির্বাচিত অর্ডারগুলো এক ক্লিকে মুছে ফেলতে পাশের লাল বাটনে চাপ দিন"
                  : "Perform bulk deletion or action on selected customer orders"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-silk-300 bg-white hover:bg-silk-100 text-silk-700 dark:bg-dark-surface dark:border-dark-border dark:text-silk-300 dark:hover:bg-dark-elevated transition flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.common.deselectAll}</span>
            </button>

            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              <span>
                {language === "bn"
                  ? `নির্বাচিত ${selectedOrderIds.length} টি মুছুন`
                  : `Delete Selected (${selectedOrderIds.length})`}
              </span>
            </Button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-silk-200 overflow-hidden shadow-card dark:bg-dark-surface dark:border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-silk-100/90 border-b border-silk-200 dark:bg-dark-elevated dark:border-dark-border text-silk-900 dark:text-silk-200 uppercase text-[10px] font-extrabold tracking-wider">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllOrdersSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeOrdersSelected;
                    }}
                    onChange={handleToggleSelectAllOrders}
                    title={isAllOrdersSelected ? t.common.deselectAll : t.common.selectAll}
                    className="w-4 h-4 rounded border-silk-300 text-gold-600 focus:ring-gold-500 cursor-pointer dark:bg-dark-elevated dark:border-dark-border accent-gold-600"
                  />
                </th>
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
              {filteredOrders.map((order) => {
                const isSelected = selectedOrderIds.includes(order.id);
                return (
                  <tr
                    key={order.id}
                    className={`transition ${
                      isSelected
                        ? "bg-gold-50/70 dark:bg-gold-950/25"
                        : "hover:bg-silk-50/50 dark:hover:bg-dark-elevated/40"
                    }`}
                  >
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOrder(order.id)}
                        className="w-4 h-4 rounded border-silk-300 text-gold-600 focus:ring-gold-500 cursor-pointer dark:bg-dark-elevated dark:border-dark-border accent-gold-600"
                      />
                    </td>
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
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/order/success/${order.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg border border-silk-200 hover:border-gold-500 hover:bg-gold-50 text-silk-500 hover:text-silk-950 dark:border-dark-border dark:text-silk-300 dark:hover:bg-dark-elevated transition"
                          title="Print Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                          className="p-1.5 rounded-lg border border-silk-200 hover:border-rose-400 hover:bg-rose-50 text-silk-400 hover:text-rose-600 dark:border-dark-border dark:hover:bg-rose-950/30 transition"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      {/* Bulk Delete Orders Modal */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => !isDeletingBulk && setIsBulkDeleteModalOpen(false)}
        title={
          language === "bn"
            ? `নির্বাচিত ${selectedOrderIds.length} টি অর্ডার মুছে ফেলা`
            : `Delete ${selectedOrderIds.length} Selected Order(s)?`
        }
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <p className="font-bold">
                {language === "bn"
                  ? "সতর্কতা: এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না!"
                  : "Warning: Irreversible action!"}
              </p>
              <p>
                {language === "bn"
                  ? `আপনি কি নিশ্চিতভাবে নির্বাচিত ${selectedOrderIds.length} টি অর্ডার মুছে ফেলতে চান? এটি অর্ডার হিস্ট্রি ও ডাটাবেস থেকে মুছে যাবে।`
                  : `Are you sure you want to permanently delete these ${selectedOrderIds.length} selected order(s) from order records?`}
              </p>
            </div>
          </div>

          {/* Selected Orders Preview List */}
          <div className="border border-silk-200 dark:border-dark-border rounded-xl max-h-48 overflow-y-auto divide-y divide-silk-100 dark:divide-dark-border text-xs">
            {orders
              .filter((o) => selectedOrderIds.includes(o.id))
              .map((o) => (
                <div key={o.id} className="p-2.5 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-mono font-bold text-silk-900 dark:text-silk-100 block">
                      #{o.orderNumber}
                    </span>
                    <span className="text-[10px] text-silk-500">
                      {o.customerName} • {formatDate(o.createdAt, language)}
                    </span>
                  </div>
                  <span className="font-serif font-bold text-silk-900 dark:text-silk-100">
                    {formatPriceBDT(o.totalBDT, language)}
                  </span>
                </div>
              ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-silk-100 dark:border-dark-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBulkDeleteModalOpen(false)}
              disabled={isDeletingBulk}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmBulkDeleteOrders}
              disabled={isDeletingBulk}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              <span>
                {isDeletingBulk
                  ? t.common.loading
                  : language === "bn"
                  ? `হ্যাঁ, ${selectedOrderIds.length} টি অর্ডার মুছুন`
                  : `Yes, Delete ${selectedOrderIds.length} Orders`}
              </span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
