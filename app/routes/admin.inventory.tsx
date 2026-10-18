import React, { useState } from "react";
import { useLoaderData } from "react-router";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { formatDate } from "~/lib/formatters";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { Modal } from "~/components/ui/Modal";
import { Input } from "~/components/ui/Input";
import { useToast } from "~/components/feedback/ToastContext";
import { Product, InventoryMovement } from "~/types";
import { Warehouse, Plus, Minus, History, AlertTriangle } from "lucide-react";

export async function clientLoader() {
  const products = mockRepository.getProducts();
  const movements = mockRepository.getInventoryMovements();
  return { products, movements };
}

export default function AdminInventoryPage() {
  const { products: initialProducts, movements: initialMovements } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [movements, setMovements] = useState<InventoryMovement[]>(initialMovements);

  // Stock adjustment modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentDelta, setAdjustmentDelta] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState("");

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || adjustmentDelta === 0) return;

    const prevStock = selectedProduct.stockTotal;
    const newStock = Math.max(0, prevStock + adjustmentDelta);
    selectedProduct.stockTotal = newStock;
    mockRepository.saveProduct(selectedProduct);

    const newMov: InventoryMovement = {
      id: `mov_${Date.now()}`,
      productId: selectedProduct.id,
      productName: selectedProduct.nameEn,
      type: "adjustment",
      quantityDelta: adjustmentDelta,
      previousStock: prevStock,
      newStock,
      referenceId: "MANUAL-ADJ",
      reason: adjustmentReason || "Manual warehouse count",
      performedBy: "Admin Inventory Manager",
      createdAt: new Date().toISOString(),
    };

    setMovements([newMov, ...movements]);
    setProducts([...products]);
    setSelectedProduct(null);
    setAdjustmentDelta(0);
    setAdjustmentReason("");
    showToast("Stock level adjusted successfully", "success");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
          {t.admin.inventory}
        </h1>
        <p className="text-xs text-silk-700 dark:text-silk-300 font-medium mt-0.5">
          {language === "bn"
            ? "রিয়েল-টাইম গুদাম স্টক ও প্রতিটি ইনভেন্টরি ট্রানজ্যাকশন হিস্ট্রি"
            : "Central warehouse stock levels, threshold alerts, and movement logs"}
        </p>
      </div>

      {/* Current Stock Levels Table */}
      <div className="bg-white rounded-2xl border border-silk-200 overflow-hidden shadow-card dark:bg-dark-surface dark:border-dark-border space-y-2">
        <div className="p-4 border-b border-silk-100 dark:border-dark-border flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm text-silk-950 dark:text-silk-50 flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-gold-600" />
            <span>{language === "bn" ? "বর্তমান পণ্য স্টক ব্যালেন্স" : "Current Stock Balances"}</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-silk-100/90 border-b border-silk-200 dark:bg-dark-elevated dark:border-dark-border text-silk-900 dark:text-silk-200 uppercase text-[10px] font-extrabold tracking-wider">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silk-100 dark:divide-dark-border">
              {products.map((p) => {
                const isLow = p.stockTotal <= p.lowStockThreshold;
                return (
                  <tr key={p.id} className="hover:bg-silk-50/50 dark:hover:bg-dark-elevated/40">
                    <td className="py-3 px-4 font-bold text-silk-900 dark:text-silk-100">
                      {language === "bn" ? p.nameBn : p.nameEn}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-silk-700 dark:text-silk-300">
                      {p.sku}
                    </td>
                    <td className="py-3 px-4 font-bold text-sm text-silk-950 dark:text-silk-50">
                      {p.stockTotal} pcs
                    </td>
                    <td className="py-3 px-4 font-medium text-silk-700 dark:text-silk-300">{p.lowStockThreshold} pcs</td>
                    <td className="py-3 px-4">
                      <Badge variant={isLow ? "warning" : "success"} size="sm">
                        {isLow ? "Low Stock" : "Healthy"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedProduct(p)}
                      >
                        Adjust
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movements Log */}
      <div className="bg-white rounded-2xl border border-silk-200 overflow-hidden shadow-card dark:bg-dark-surface dark:border-dark-border space-y-2">
        <div className="p-4 border-b border-silk-100 dark:border-dark-border">
          <h3 className="font-serif font-bold text-sm text-silk-950 dark:text-silk-50 flex items-center gap-2">
            <History className="w-4 h-4 text-gold-600" />
            <span>{language === "bn" ? "ইনভেন্টরি মুভমেন্ট হিস্ট্রি" : "Inventory Movements Log"}</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-silk-100/90 border-b border-silk-200 dark:bg-dark-elevated dark:border-dark-border text-silk-900 dark:text-silk-200 uppercase text-[10px] font-extrabold tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Delta</th>
                <th className="py-3 px-4">Stock Before → After</th>
                <th className="py-3 px-4">Reason / Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silk-100 dark:divide-dark-border">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-silk-50/50 dark:hover:bg-dark-elevated/40">
                  <td className="py-3 px-4 font-medium text-silk-700 dark:text-silk-300">{formatDate(m.createdAt, language)}</td>
                  <td className="py-3 px-4 font-semibold text-silk-900 dark:text-silk-100">
                    {m.productName}
                  </td>
                  <td className="py-3 px-4 uppercase text-[10px] font-bold text-silk-600">
                    {m.type}
                  </td>
                  <td className="py-3 px-4 font-bold">
                    <span className={m.quantityDelta > 0 ? "text-emerald-600" : "text-rose-600"}>
                      {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta} pcs
                    </span>
                  </td>
                  <td className="py-3 px-4 text-silk-600 font-mono">
                    {m.previousStock} → {m.newStock}
                  </td>
                  <td className="py-3 px-4 text-silk-700 dark:text-silk-300 font-medium">{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <Modal
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          title={`Adjust Stock: ${selectedProduct.nameEn}`}
        >
          <form onSubmit={handleAdjustStock} className="space-y-4">
            <p className="text-xs text-silk-600 dark:text-silk-400">
              Current Stock: <strong>{selectedProduct.stockTotal} pcs</strong>
            </p>

            <Input
              type="number"
              label="Stock Change Delta (+ to add, - to subtract)"
              placeholder="e.g. +10 or -3"
              value={adjustmentDelta}
              onChange={(e) => setAdjustmentDelta(Number(e.target.value))}
              required
            />

            <Input
              label="Reason for Adjustment"
              placeholder="e.g. Damaged during handling, or physical recount"
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value)}
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setSelectedProduct(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold">
                Save Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
