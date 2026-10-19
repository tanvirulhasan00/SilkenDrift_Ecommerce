import React, { useState } from "react";
import { useLoaderData } from "react-router";
import { firestoreService } from "~/services/firebase/firestoreService";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { formatPriceBDT } from "~/lib/formatters";
import { Button } from "~/components/ui/Button";
import { Modal } from "~/components/ui/Modal";
import { Input } from "~/components/ui/Input";
import { Badge } from "~/components/ui/Badge";
import { useToast } from "~/components/feedback/ToastContext";
import { Supplier, SourcingRecord, Product } from "~/types";
import {
  Plus,
  Layers,
  Truck,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Trash2,
  Users,
  Search,
  Building2,
  Calendar,
  CheckCircle,
} from "lucide-react";

export async function clientLoader() {
  const [suppliers, products] = await Promise.all([
    firestoreService.getSuppliers(),
    firestoreService.getProducts(),
  ]);
  const sourcingRecords = mockRepository.getSourcingRecords();
  return { suppliers, sourcingRecords, products };
}

export default function AdminSourcingPage() {
  const {
    suppliers: initialSuppliers,
    sourcingRecords: initialSourcing,
    products,
  } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"suppliers" | "receipts">("suppliers");

  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [sourcingRecords, setSourcingRecords] = useState<SourcingRecord[]>(initialSourcing);
  const [searchSupplier, setSearchSupplier] = useState("");

  // Supplier Modal state (Create / Edit)
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [supName, setSupName] = useState("");
  const [supContact, setSupContact] = useState("");
  const [supPhone, setSupPhone] = useState("");
  const [supEmail, setSupEmail] = useState("");
  const [supDivision, setSupDivision] = useState("Rajshahi");
  const [supDistrict, setSupDistrict] = useState("Rajshahi");
  const [supAddress, setSupAddress] = useState("");
  const [supSpecialty, setSupSpecialty] = useState("Rajshahi Silk Weaving");
  const [supPaymentTerms, setSupPaymentTerms] = useState("Net 15 Days");

  // Goods Receipt Modal state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || "");
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [quantityReceived, setQuantityReceived] = useState<number>(20);
  const [purchaseCostBDT, setPurchaseCostBDT] = useState<number>(3500);
  const [notes, setNotes] = useState("");

  // ==========================================
  // SUPPLIER CRUD HANDLERS
  // ==========================================
  const openCreateSupplierModal = () => {
    setEditingSupplier(null);
    setSupName("");
    setSupContact("");
    setSupPhone("+8801");
    setSupEmail("");
    setSupDivision("Rajshahi");
    setSupDistrict("Rajshahi");
    setSupAddress("BSIC Industrial Silk Estate, Rajshahi");
    setSupSpecialty("Pure Mulberry Silk & Muslin");
    setSupPaymentTerms("Net 15 Days");
    setIsSupplierModalOpen(true);
  };

  const openEditSupplierModal = (s: Supplier) => {
    setEditingSupplier(s);
    setSupName(s.name);
    setSupContact(s.contactPerson);
    setSupPhone(s.phone);
    setSupEmail(s.email || "");
    setSupDivision(s.division || "Rajshahi");
    setSupDistrict(s.district || "Rajshahi");
    setSupAddress(s.address || "");
    setSupSpecialty(s.categorySpecialty || "");
    setSupPaymentTerms(s.paymentTerms || "Net 15 Days");
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();

    const supplierPayload: Supplier = {
      id: editingSupplier ? editingSupplier.id : `sup_${Date.now()}`,
      name: supName.trim(),
      contactPerson: supContact.trim(),
      phone: supPhone.trim(),
      email: supEmail.trim() || "artisan@silkendrift.com",
      division: supDivision,
      district: supDistrict,
      address: supAddress.trim(),
      categorySpecialty: supSpecialty.trim(),
      paymentTerms: supPaymentTerms,
      rating: editingSupplier ? editingSupplier.rating : 4.9,
      leadTimeDays: editingSupplier ? editingSupplier.leadTimeDays : 7,
      status: "active",
      createdAt: editingSupplier ? editingSupplier.createdAt : new Date().toISOString(),
    };

    await firestoreService.saveSupplier(supplierPayload);

    if (editingSupplier) {
      setSuppliers(suppliers.map((s) => (s.id === supplierPayload.id ? supplierPayload : s)));
      showToast(language === "bn" ? "সাপ্লায়ার তথ্য আপডেট হয়েছে" : "Supplier updated successfully", "success");
    } else {
      setSuppliers([supplierPayload, ...suppliers]);
      showToast(language === "bn" ? "নতুন তাঁতি/সাপ্লায়ার যুক্ত হয়েছে" : "New artisan supplier created successfully", "success");
    }

    setIsSupplierModalOpen(false);
  };

  const handleDeleteSupplier = async (id: string) => {
    if (confirm("Are you sure you want to remove this supplier?")) {
      await firestoreService.deleteSupplier(id);
      setSuppliers(suppliers.filter((s) => s.id !== id));
      showToast("Supplier removed", "info");
    }
  };

  // ==========================================
  // SOURCING RECEIPT HANDLERS
  // ==========================================
  const handleCreateSourcing = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    const product = products.find((p) => p.id === selectedProductId);

    if (!supplier || !product) return;

    const newRecord: SourcingRecord = {
      id: `src_${Date.now()}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      productId: product.id,
      productName: product.nameEn,
      sku: product.sku,
      quantityReceived: Number(quantityReceived),
      purchaseCostBDT: Number(purchaseCostBDT),
      batchNumber: `BATCH-SD-${Date.now().toString().slice(-6)}`,
      receivedDate: new Date().toISOString().split("T")[0],
      notes,
    };

    mockRepository.addSourcingRecord(newRecord);
    setSourcingRecords([newRecord, ...sourcingRecords]);
    setIsRecordModalOpen(false);
    showToast("Goods received and central inventory updated!", "success");
  };

  const handleDeleteReceipt = (id: string) => {
    if (confirm("Delete this sourcing record?")) {
      mockRepository.deleteSourcingRecord(id);
      setSourcingRecords(sourcingRecords.filter((r) => r.id !== id));
      showToast("Sourcing record deleted", "info");
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchSupplier.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchSupplier.toLowerCase()) ||
      (s.district && s.district.toLowerCase().includes(searchSupplier.toLowerCase())) ||
      (s.categorySpecialty && s.categorySpecialty.toLowerCase().includes(searchSupplier.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
            {t.admin.sourcing}
          </h1>
          <p className="text-xs text-silk-700 dark:text-silk-300 font-medium mt-0.5">
            Full management of artisan weavers, silk mills, procurement receipts, and cost accounting
          </p>
        </div>

        {activeTab === "suppliers" ? (
          <Button size="sm" variant="gold" onClick={openCreateSupplierModal}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Add New Supplier</span>
          </Button>
        ) : (
          <Button size="sm" variant="gold" onClick={() => setIsRecordModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            <span>New Goods Receipt</span>
          </Button>
        )}
      </div>

      {/* Tabs Switcher: Suppliers vs Receipts */}
      <div className="flex items-center gap-2 border-b border-silk-200 dark:border-dark-border">
        <button
          type="button"
          onClick={() => setActiveTab("suppliers")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 ${
            activeTab === "suppliers"
              ? "border-gold-500 text-silk-950 dark:text-gold-300 bg-silk-50/50 dark:bg-dark-elevated"
              : "border-transparent text-silk-600 dark:text-silk-400 hover:text-silk-950 dark:hover:text-white"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Suppliers & Master Weavers ({suppliers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("receipts")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 ${
            activeTab === "receipts"
              ? "border-gold-500 text-silk-950 dark:text-gold-300 bg-silk-50/50 dark:bg-dark-elevated"
              : "border-transparent text-silk-600 dark:text-silk-400 hover:text-silk-950 dark:hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Procurement Batches ({sourcingRecords.length})</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: SUPPLIERS FULL CRUD                 */}
      {/* ========================================== */}
      {activeTab === "suppliers" && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder="Search by supplier name, contact, or district..."
              value={searchSupplier}
              onChange={(e) => setSearchSupplier(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-silk-300 bg-white dark:bg-dark-surface dark:border-dark-border dark:text-silk-100"
            />
            <Search className="w-4 h-4 text-silk-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Supplier Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSuppliers.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-silk-200 p-5 shadow-card dark:bg-dark-surface dark:border-dark-border flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-base text-silk-950 dark:text-silk-50">
                        {s.name}
                      </h3>
                      <p className="text-xs text-gold-700 dark:text-gold-400 font-semibold mt-0.5">
                        {s.categorySpecialty || "Heritage Handloom"}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Active Partner
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-silk-700 dark:text-silk-300 pt-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-silk-400 shrink-0" />
                      <span>{s.contactPerson}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-silk-400 shrink-0" />
                      <a href={`tel:${s.phone}`} className="hover:underline font-mono">
                        {s.phone}
                      </a>
                    </div>

                    {s.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-silk-400 shrink-0" />
                        <span className="truncate">{s.email}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-silk-400 shrink-0" />
                      <span>{s.district || "Rajshahi"}, {s.division || "Rajshahi"}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-silk-50 dark:bg-dark-elevated text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-silk-500">Payment Terms:</span>
                      <span className="font-semibold text-silk-900 dark:text-silk-100">{s.paymentTerms || "Net 15 Days"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-silk-500">Quality Rating:</span>
                      <span className="font-bold text-gold-600">★ {s.rating || 5.0} / 5.0</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-silk-100 dark:border-dark-border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditSupplierModal(s)}
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    <span>Edit Supplier</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    onClick={() => handleDeleteSupplier(s.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: GOODS SOURCING RECEIPTS            */}
      {/* ========================================== */}
      {activeTab === "receipts" && (
        <div className="bg-white rounded-2xl border border-silk-200 overflow-hidden shadow-card dark:bg-dark-surface dark:border-dark-border">
          <div className="p-4 border-b border-silk-100 dark:border-dark-border flex justify-between items-center">
            <h3 className="font-serif font-bold text-sm text-silk-950 dark:text-silk-50 flex items-center gap-2">
              <Layers className="w-4 h-4 text-gold-600" />
              <span>Procurement Receipts Logged</span>
            </h3>
            <span className="text-xs text-silk-500 font-medium">Auto-increments central warehouse inventory</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-silk-100/90 border-b border-silk-200 dark:bg-dark-elevated dark:border-dark-border text-silk-900 dark:text-silk-200 uppercase text-[10px] font-extrabold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Product / SKU</th>
                  <th className="py-3 px-4">Qty Received</th>
                  <th className="py-3 px-4">Unit Cost (BDT)</th>
                  <th className="py-3 px-4">Total Cost</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-silk-100 dark:divide-dark-border">
                {sourcingRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-silk-50/50 dark:hover:bg-dark-elevated/40">
                    <td className="py-3 px-4 font-mono font-bold text-silk-900 dark:text-silk-100">
                      {r.batchNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-silk-800 dark:text-silk-200">
                      {r.supplierName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-silk-900 dark:text-silk-100 block">{r.productName}</span>
                      <span className="text-[10px] font-mono text-silk-500">{r.sku}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        +{r.quantityReceived} units
                      </span>
                    </td>
                    <td className="py-3 px-4 font-serif font-bold text-silk-900 dark:text-silk-100">
                      {formatPriceBDT(r.purchaseCostBDT, language)}
                    </td>
                    <td className="py-3 px-4 font-serif font-bold text-gold-700 dark:text-gold-400">
                      {formatPriceBDT(r.purchaseCostBDT * r.quantityReceived, language)}
                    </td>
                    <td className="py-3 px-4 text-silk-600 dark:text-silk-400">
                      {r.receivedDate}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteReceipt(r.id)}
                        className="p-1.5 text-silk-400 hover:text-rose-600 transition"
                        title="Delete Sourcing Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: CREATE / EDIT SUPPLIER              */}
      {/* ========================================== */}
      <Modal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title={editingSupplier ? "Edit Artisan Supplier" : "Register Master Weaver / Supplier"}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Supplier / Loom Name"
              placeholder="e.g. Rajshahi Silk Federation Weavers"
              value={supName}
              onChange={(e) => setSupName(e.target.value)}
              required
            />
            <Input
              label="Contact Person / Master Weaver"
              placeholder="e.g. Haji Rafiqul Islam"
              value={supContact}
              onChange={(e) => setSupContact(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              placeholder="+8801XXXXXXXXX"
              value={supPhone}
              onChange={(e) => setSupPhone(e.target.value)}
              required
            />
            <Input
              label="Email Address (Optional)"
              placeholder="supplier@domain.com"
              value={supEmail}
              onChange={(e) => setSupEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Division"
              placeholder="e.g. Rajshahi or Dhaka"
              value={supDivision}
              onChange={(e) => setSupDivision(e.target.value)}
              required
            />
            <Input
              label="District"
              placeholder="e.g. Rajshahi, Tangail, Sirajganj"
              value={supDistrict}
              onChange={(e) => setSupDistrict(e.target.value)}
              required
            />
            <Input
              label="Payment Terms"
              placeholder="e.g. Net 15 Days, 50% Advance"
              value={supPaymentTerms}
              onChange={(e) => setSupPaymentTerms(e.target.value)}
            />
          </div>

          <Input
            label="Category Specialty / Craft Focus"
            placeholder="e.g. Pure Mulberry Silk, Antique Zari Jamdani, Organic Indigo Silk"
            value={supSpecialty}
            onChange={(e) => setSupSpecialty(e.target.value)}
            required
          />

          <Input
            label="Workshop / Factory Address"
            placeholder="e.g. Plot 14, BSCIC Silk Industrial Area, Sopura, Rajshahi"
            value={supAddress}
            onChange={(e) => setSupAddress(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-silk-100 dark:border-dark-border">
            <Button type="button" variant="outline" onClick={() => setIsSupplierModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              {editingSupplier ? "Update Supplier" : "Register Supplier"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================== */}
      {/* MODAL: CREATE GOODS RECEIPT               */}
      {/* ========================================== */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Procurement Receipt & Increment Stock"
      >
        <form onSubmit={handleCreateSourcing} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-silk-800 dark:text-silk-200 mb-1">
              Select Supplier / Artisan
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full rounded-xl border border-silk-300 bg-white p-2.5 text-xs text-silk-900 dark:bg-dark-surface dark:border-dark-border dark:text-silk-100 font-medium"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.contactPerson}) - {s.district}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-silk-800 dark:text-silk-200 mb-1">
              Select Product to Receive
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-xl border border-silk-300 bg-white p-2.5 text-xs text-silk-900 dark:bg-dark-surface dark:border-dark-border dark:text-silk-100 font-medium"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameEn} (Current Stock: {p.stockTotal})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Quantity Received (Units)"
              value={quantityReceived}
              onChange={(e) => setQuantityReceived(Number(e.target.value))}
              required
            />
            <Input
              type="number"
              label="Purchase Unit Cost (BDT)"
              value={purchaseCostBDT}
              onChange={(e) => setPurchaseCostBDT(Number(e.target.value))}
              required
            />
          </div>

          <Input
            label="Batch Inspection / Quality Notes"
            placeholder="e.g. Mulberry thread density verified. Silk mark certified."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-silk-100 dark:border-dark-border">
            <Button type="button" variant="outline" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              Submit & Add to Central Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
