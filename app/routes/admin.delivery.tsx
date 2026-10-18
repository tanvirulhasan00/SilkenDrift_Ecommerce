import React, { useState } from "react";
import { useLoaderData } from "react-router";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { formatPriceBDT } from "~/lib/formatters";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { Modal } from "~/components/ui/Modal";
import { Input } from "~/components/ui/Input";
import { useToast } from "~/components/feedback/ToastContext";
import { DeliveryZone, PickupPoint } from "~/types";
import {
  Truck,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  Clock,
  Building,
} from "lucide-react";

export async function clientLoader() {
  const zones = mockRepository.getDeliveryZones();
  const pickupPoints = mockRepository.getPickupPoints();
  return { zones, pickupPoints };
}

export default function AdminDeliveryPage() {
  const { zones: initialZones, pickupPoints: initialPickupPoints } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [zones, setZones] = useState<DeliveryZone[]>(initialZones);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>(initialPickupPoints);

  // Delivery Zone Modal state
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);

  const [zoneNameEn, setZoneNameEn] = useState("");
  const [zoneNameBn, setZoneNameBn] = useState("");
  const [zoneRate, setZoneRate] = useState<number>(120);
  const [zoneThreshold, setZoneThreshold] = useState<number>(2500);
  const [zoneDaysMin, setZoneDaysMin] = useState<number>(2);
  const [zoneDaysMax, setZoneDaysMax] = useState<number>(4);
  const [zoneDistricts, setZoneDistricts] = useState("");

  // Pickup Point Modal state
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<PickupPoint | null>(null);

  const [pointNameEn, setPointNameEn] = useState("");
  const [pointNameBn, setPointNameBn] = useState("");
  const [pointAddress, setPointAddress] = useState("");
  const [pointDivision, setPointDivision] = useState("Dhaka");
  const [pointDistrict, setPointDistrict] = useState("Dhaka");
  const [pointPhone, setPointPhone] = useState("+8801");
  const [pointHours, setPointHours] = useState("10:00 AM - 8:00 PM (Daily)");

  // ==========================================
  // ZONE CRUD HANDLERS
  // ==========================================
  const openCreateZoneModal = () => {
    setEditingZone(null);
    setZoneNameEn("");
    setZoneNameBn("");
    setZoneRate(120);
    setZoneThreshold(2500);
    setZoneDaysMin(2);
    setZoneDaysMax(4);
    setZoneDistricts("Dhaka, Narayanganj, Gazipur");
    setIsZoneModalOpen(true);
  };

  const openEditZoneModal = (z: DeliveryZone) => {
    setEditingZone(z);
    setZoneNameEn(z.nameEn);
    setZoneNameBn(z.nameBn);
    setZoneRate(z.standardChargeBDT);
    setZoneThreshold(z.freeShippingThresholdBDT || 2500);
    const daysMatch = z.estimatedDays?.match(/(\d+)\s*-\s*(\d+)/);
    if (daysMatch) {
      setZoneDaysMin(Number(daysMatch[1]));
      setZoneDaysMax(Number(daysMatch[2]));
    } else {
      setZoneDaysMin(2);
      setZoneDaysMax(4);
    }
    setZoneDistricts(z.districts.join(", "));
    setIsZoneModalOpen(true);
  };

  const handleSaveZone = (e: React.FormEvent) => {
    e.preventDefault();
    const zonePayload: DeliveryZone = {
      id: editingZone ? editingZone.id : `zone_${Date.now()}`,
      nameEn: zoneNameEn.trim(),
      nameBn: zoneNameBn.trim() || zoneNameEn.trim(),
      division: "All",
      districts: zoneDistricts.split(",").map((d) => d.trim()).filter(Boolean),
      standardChargeBDT: Number(zoneRate),
      freeShippingThresholdBDT: Number(zoneThreshold),
      estimatedDays: `${zoneDaysMin}-${zoneDaysMax} Days`,
      isActive: true,
    };

    mockRepository.saveDeliveryZone(zonePayload);

    if (editingZone) {
      setZones(zones.map((z) => (z.id === zonePayload.id ? zonePayload : z)));
      showToast("Delivery zone updated", "success");
    } else {
      setZones([...zones, zonePayload]);
      showToast("New delivery zone created", "success");
    }

    setIsZoneModalOpen(false);
  };

  const handleDeleteZone = (id: string) => {
    if (confirm("Delete this delivery zone?")) {
      mockRepository.deleteDeliveryZone(id);
      setZones(zones.filter((z) => z.id !== id));
      showToast("Delivery zone removed", "info");
    }
  };

  // ==========================================
  // PICKUP POINT CRUD HANDLERS
  // ==========================================
  const openCreatePointModal = () => {
    setEditingPoint(null);
    setPointNameEn("");
    setPointNameBn("");
    setPointAddress("");
    setPointDivision("Dhaka");
    setPointDistrict("Dhaka");
    setPointPhone("+8801");
    setPointHours("10:00 AM - 8:00 PM (Daily)");
    setIsPointModalOpen(true);
  };

  const openEditPointModal = (p: PickupPoint) => {
    setEditingPoint(p);
    setPointNameEn(p.nameEn);
    setPointNameBn(p.nameBn);
    setPointAddress(p.addressEn);
    setPointDivision(p.division);
    setPointDistrict(p.district);
    setPointPhone(p.phone);
    setPointHours(p.operatingHours);
    setIsPointModalOpen(true);
  };

  const handleSavePoint = (e: React.FormEvent) => {
    e.preventDefault();
    const pointPayload: PickupPoint = {
      id: editingPoint ? editingPoint.id : `pp_${Date.now()}`,
      nameEn: pointNameEn.trim(),
      nameBn: pointNameBn.trim() || pointNameEn.trim(),
      addressEn: pointAddress.trim(),
      addressBn: pointAddress.trim(),
      division: pointDivision.trim(),
      district: pointDistrict.trim(),
      phone: pointPhone.trim(),
      operatingHours: pointHours.trim(),
      isActive: true,
    };

    mockRepository.savePickupPoint(pointPayload);

    if (editingPoint) {
      setPickupPoints(pickupPoints.map((p) => (p.id === pointPayload.id ? pointPayload : p)));
      showToast("Pickup hub updated", "success");
    } else {
      setPickupPoints([...pickupPoints, pointPayload]);
      showToast("New collection hub registered", "success");
    }

    setIsPointModalOpen(false);
  };

  const handleDeletePoint = (id: string) => {
    if (confirm("Delete this collection hub?")) {
      mockRepository.deletePickupPoint(id);
      setPickupPoints(pickupPoints.filter((p) => p.id !== id));
      showToast("Pickup hub removed", "info");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
            {t.admin.delivery}
          </h1>
          <p className="text-xs text-silk-700 dark:text-silk-300 font-medium mt-0.5">
            Full CRUD for courier rates, regional transit rules, and pickup collection points
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={openCreatePointModal}>
            <MapPin className="w-4 h-4 mr-1" />
            <span>Add Pickup Hub</span>
          </Button>

          <Button size="sm" variant="gold" onClick={openCreateZoneModal}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Add Delivery Zone</span>
          </Button>
        </div>
      </div>

      {/* Courier Integrations Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-2.5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-sm text-silk-900 dark:text-silk-100">Pathao Courier API</h3>
              <span className="text-[10px] text-silk-500 font-semibold">Dhaka & Division Express</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Ready
            </span>
          </div>
          <p className="text-xs text-silk-600 dark:text-silk-300">
            Adapter: <code className="font-mono text-[11px] font-bold">PathaoCourierAdapter</code>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-2.5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-sm text-silk-900 dark:text-silk-100">Steadfast Courier API</h3>
              <span className="text-[10px] text-silk-500 font-semibold">64 Districts & Upazila COD</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Ready
            </span>
          </div>
          <p className="text-xs text-silk-600 dark:text-silk-300">
            Adapter: <code className="font-mono text-[11px] font-bold">SteadfastCourierAdapter</code>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-2.5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-sm text-silk-900 dark:text-silk-100">RedX Delivery API</h3>
              <span className="text-[10px] text-silk-500 font-semibold">Doorstep Parcel Pickup</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Ready
            </span>
          </div>
          <p className="text-xs text-silk-600 dark:text-silk-300">
            Adapter: <code className="font-mono text-[11px] font-bold">RedxCourierAdapter</code>
          </p>
        </div>
      </div>

      {/* Delivery Zones Table */}
      <div className="bg-white rounded-2xl border border-silk-200 overflow-hidden shadow-card dark:bg-dark-surface dark:border-dark-border space-y-2">
        <div className="p-4 border-b border-silk-100 dark:border-dark-border flex justify-between items-center">
          <h3 className="font-serif font-bold text-sm text-silk-950 dark:text-silk-50 flex items-center gap-2">
            <Truck className="w-4 h-4 text-gold-600" />
            <span>Configured Delivery Zones & Shipping Rates ({zones.length})</span>
          </h3>
          <Button size="sm" variant="outline" onClick={openCreateZoneModal}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add Zone</span>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-silk-100/90 border-b border-silk-200 dark:bg-dark-elevated dark:border-dark-border text-silk-900 dark:text-silk-200 uppercase text-[10px] font-extrabold tracking-wider">
              <tr>
                <th className="py-3 px-4">Zone Name</th>
                <th className="py-3 px-4">Base Rate</th>
                <th className="py-3 px-4">Free Shipping On</th>
                <th className="py-3 px-4">Transit Time</th>
                <th className="py-3 px-4">Districts Covered</th>
                <th className="py-3 px-4 text-right">Actions (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silk-100 dark:divide-dark-border">
              {zones.map((z) => (
                <tr key={z.id} className="hover:bg-silk-50/50 dark:hover:bg-dark-elevated/40">
                  <td className="py-3 px-4 font-bold text-silk-950 dark:text-silk-100">
                    {z.nameEn}
                    <span className="block text-[11px] text-silk-500 font-normal">{z.nameBn}</span>
                  </td>
                  <td className="py-3 px-4 font-bold font-serif text-silk-900 dark:text-silk-100">
                    {formatPriceBDT(z.standardChargeBDT, language)}
                  </td>
                  <td className="py-3 px-4 font-serif text-silk-700 dark:text-silk-300">
                    {formatPriceBDT(z.freeShippingThresholdBDT || 2500, language)}
                  </td>
                  <td className="py-3 px-4 text-silk-700 dark:text-silk-300 font-medium">
                    {z.estimatedDays}
                  </td>
                  <td className="py-3 px-4 text-silk-600 dark:text-silk-400 max-w-xs truncate">
                    {z.districts.join(", ")}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditZoneModal(z)}
                        className="p-1.5 rounded-lg border border-silk-200 hover:border-gold-500 hover:bg-gold-50 text-silk-700 dark:border-dark-border dark:text-silk-300 transition"
                        title="Edit Zone"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteZone(z.id)}
                        className="p-1.5 rounded-lg border border-silk-200 hover:border-rose-400 hover:bg-rose-50 text-silk-400 hover:text-rose-600 dark:border-dark-border transition"
                        title="Delete Zone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pickup Collection Hubs */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif font-bold text-base text-silk-950 dark:text-silk-50 flex items-center gap-2">
            <Building className="w-4 h-4 text-gold-600" />
            <span>Customer Collection & Pickup Hubs ({pickupPoints.length})</span>
          </h3>
          <Button size="sm" variant="outline" onClick={openCreatePointModal}>
            <Plus className="w-4 h-4 mr-1" />
            <span>New Pickup Point</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pickupPoints.map((pp) => (
            <div
              key={pp.id}
              className="bg-white rounded-2xl border border-silk-200 p-5 shadow-card dark:bg-dark-surface dark:border-dark-border flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-silk-950 dark:text-silk-50">
                    {pp.nameEn}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Active
                  </span>
                </div>
                <p className="text-xs text-silk-600 dark:text-silk-400 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0 mt-0.5" />
                  <span>{pp.addressEn}</span>
                </p>
                <p className="text-xs text-silk-700 dark:text-silk-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-silk-400 shrink-0" />
                  <span>{pp.operatingHours}</span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-silk-100 dark:border-dark-border">
                <Button size="sm" variant="outline" onClick={() => openEditPointModal(pp)}>
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  <span>Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  onClick={() => handleDeletePoint(pp.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL: CREATE / EDIT DELIVERY ZONE         */}
      {/* ========================================== */}
      <Modal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        title={editingZone ? "Edit Delivery Zone" : "Add Delivery Zone"}
      >
        <form onSubmit={handleSaveZone} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Zone Name (English)"
              placeholder="e.g. Inside Dhaka Metropolitan"
              value={zoneNameEn}
              onChange={(e) => setZoneNameEn(e.target.value)}
              required
            />
            <Input
              label="Zone Name (Bangla)"
              placeholder="e.g. ঢাকা মেট্রোপলিটন এলাকা"
              value={zoneNameBn}
              onChange={(e) => setZoneNameBn(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Base Delivery Charge (BDT)"
              value={zoneRate}
              onChange={(e) => setZoneRate(Number(e.target.value))}
              required
            />
            <Input
              type="number"
              label="Free Shipping Threshold (BDT)"
              value={zoneThreshold}
              onChange={(e) => setZoneThreshold(Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Min Transit Days"
              value={zoneDaysMin}
              onChange={(e) => setZoneDaysMin(Number(e.target.value))}
              required
            />
            <Input
              type="number"
              label="Max Transit Days"
              value={zoneDaysMax}
              onChange={(e) => setZoneDaysMax(Number(e.target.value))}
              required
            />
          </div>

          <Input
            label="Covered Districts (comma-separated)"
            placeholder="e.g. Dhaka, Gazipur, Narayanganj"
            value={zoneDistricts}
            onChange={(e) => setZoneDistricts(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-silk-100 dark:border-dark-border">
            <Button type="button" variant="outline" onClick={() => setIsZoneModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              {editingZone ? "Update Zone" : "Create Zone"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================== */}
      {/* MODAL: CREATE / EDIT PICKUP POINT          */}
      {/* ========================================== */}
      <Modal
        isOpen={isPointModalOpen}
        onClose={() => setIsPointModalOpen(false)}
        title={editingPoint ? "Edit Pickup Hub" : "Register Collection Hub"}
      >
        <form onSubmit={handleSavePoint} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Hub Name (English)"
              placeholder="e.g. Banani Flagship Boutique Hub"
              value={pointNameEn}
              onChange={(e) => setPointNameEn(e.target.value)}
              required
            />
            <Input
              label="Hub Name (Bangla)"
              placeholder="e.g. বনানী ফ্ল্যাগশিপ লাউঞ্জ"
              value={pointNameBn}
              onChange={(e) => setPointNameBn(e.target.value)}
              required
            />
          </div>

          <Input
            label="Full Physical Address"
            placeholder="e.g. Road 11, House 42, Block D, Banani, Dhaka"
            value={pointAddress}
            onChange={(e) => setPointAddress(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Division"
              value={pointDivision}
              onChange={(e) => setPointDivision(e.target.value)}
              required
            />
            <Input
              label="District"
              value={pointDistrict}
              onChange={(e) => setPointDistrict(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Phone"
              value={pointPhone}
              onChange={(e) => setPointPhone(e.target.value)}
              required
            />
            <Input
              label="Operating Hours"
              value={pointHours}
              onChange={(e) => setPointHours(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-silk-100 dark:border-dark-border">
            <Button type="button" variant="outline" onClick={() => setIsPointModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              {editingPoint ? "Update Hub" : "Register Hub"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
