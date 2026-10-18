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
import { Coupon, Banner } from "~/types";
import { ImageUploadInput } from "~/components/ui/ImageUploadInput";
import { normalizeImageUrl } from "~/lib/imageUrl";
import {
  Tag,
  Plus,
  Sparkles,
  Percent,
  Image,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";

export async function clientLoader() {
  const coupons = mockRepository.getCoupons();
  const banners = mockRepository.getBanners();
  return { coupons, banners };
}

export default function AdminMarketingPage() {
  const { coupons: initialCoupons, banners: initialBanners } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [banners, setBanners] = useState<Banner[]>(initialBanners);

  // Coupon Modals
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [code, setCode] = useState("");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [minOrderBDT, setMinOrderBDT] = useState<number>(2000);
  const [descEn, setDescEn] = useState("");
  const [isCouponActive, setIsCouponActive] = useState(true);

  // Banner Modals
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [bannerTitleEn, setBannerTitleEn] = useState("");
  const [bannerTitleBn, setBannerTitleBn] = useState("");
  const [bannerSubEn, setBannerSubEn] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [bannerLink, setBannerLink] = useState("/shop");
  const [bannerPriority, setBannerPriority] = useState<number>(1);

  // ==========================================
  // COUPON CRUD
  // ==========================================
  const openCreateCouponModal = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountValue(10);
    setDiscountType("percentage");
    setMinOrderBDT(2000);
    setDescEn("10% promotional discount on handloom silk");
    setIsCouponActive(true);
    setIsCouponModalOpen(true);
  };

  const openEditCouponModal = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountValue(c.discountValue);
    setDiscountType(c.discountType);
    setMinOrderBDT(c.minOrderBDT);
    setDescEn(c.descriptionEn || "");
    setIsCouponActive(c.isActive);
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const couponPayload: Coupon = {
      id: editingCoupon ? editingCoupon.id : `cp_${Date.now()}`,
      code: code.trim().toUpperCase(),
      descriptionEn: descEn || `${discountValue}${discountType === "percentage" ? "%" : " BDT"} off`,
      descriptionBn: `বিশেষ ${discountValue}${discountType === "percentage" ? "%" : " টাকা"} কুপন ছাড়`,
      discountType,
      discountValue: Number(discountValue),
      minOrderBDT: Number(minOrderBDT),
      startDate: editingCoupon ? editingCoupon.startDate : new Date().toISOString().split("T")[0],
      endDate: "2026-12-31",
      usedCount: editingCoupon ? editingCoupon.usedCount : 0,
      isActive: isCouponActive,
    };

    mockRepository.saveCoupon(couponPayload);

    if (editingCoupon) {
      setCoupons(coupons.map((c) => (c.id === couponPayload.id ? couponPayload : c)));
      showToast("Coupon updated successfully", "success");
    } else {
      setCoupons([couponPayload, ...coupons]);
      showToast("New promotional coupon created", "success");
    }

    setIsCouponModalOpen(false);
  };

  const handleDeleteCoupon = (id: string) => {
    if (confirm("Delete this coupon code?")) {
      mockRepository.deleteCoupon(id);
      setCoupons(coupons.filter((c) => c.id !== id));
      showToast("Coupon removed", "info");
    }
  };

  // ==========================================
  // BANNER CRUD
  // ==========================================
  const openCreateBannerModal = () => {
    setEditingBanner(null);
    setBannerTitleEn("");
    setBannerTitleBn("");
    setBannerSubEn("");
    setBannerImage("https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80");
    setBannerLink("/shop");
    setBannerPriority(banners.length + 1);
    setIsBannerModalOpen(true);
  };

  const openEditBannerModal = (b: Banner) => {
    setEditingBanner(b);
    setBannerTitleEn(b.titleEn);
    setBannerTitleBn(b.titleBn);
    setBannerSubEn(b.subtitleEn || "");
    setBannerImage(b.imageUrl);
    setBannerLink(b.linkUrl);
    setBannerPriority(b.priority);
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    const bannerPayload: Banner = {
      id: editingBanner ? editingBanner.id : `bn_${Date.now()}`,
      titleEn: bannerTitleEn.trim(),
      titleBn: bannerTitleBn.trim() || bannerTitleEn.trim(),
      subtitleEn: bannerSubEn.trim(),
      subtitleBn: bannerSubEn.trim(),
      imageUrl: bannerImage.trim(),
      linkUrl: bannerLink.trim(),
      priority: Number(bannerPriority),
      isActive: true,
      placement: "hero",
    };

    mockRepository.saveBanner(bannerPayload);

    if (editingBanner) {
      setBanners(banners.map((b) => (b.id === bannerPayload.id ? bannerPayload : b)));
      showToast("Hero banner updated", "success");
    } else {
      setBanners([...banners, bannerPayload]);
      showToast("New banner created", "success");
    }

    setIsBannerModalOpen(false);
  };

  const handleDeleteBanner = (id: string) => {
    if (confirm("Delete this campaign banner?")) {
      mockRepository.deleteBanner(id);
      setBanners(banners.filter((b) => b.id !== id));
      showToast("Banner deleted", "info");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
            {t.admin.marketing}
          </h1>
          <p className="text-xs text-silk-700 dark:text-silk-300 font-medium mt-0.5">
            Full CRUD for promotional discount vouchers, campaign banners, and festival offers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={openCreateBannerModal}>
            <Image className="w-4 h-4 mr-1" />
            <span>Add Banner</span>
          </Button>

          <Button size="sm" variant="gold" onClick={openCreateCouponModal}>
            <Plus className="w-4 h-4 mr-1" />
            <span>{t.admin.createCoupon}</span>
          </Button>
        </div>
      </div>

      {/* Coupons Section */}
      <div className="bg-white rounded-2xl border border-silk-200 overflow-hidden shadow-card dark:bg-dark-surface dark:border-dark-border space-y-2">
        <div className="p-4 border-b border-silk-100 dark:border-dark-border flex justify-between items-center">
          <h3 className="font-serif font-bold text-sm text-silk-950 dark:text-silk-50 flex items-center gap-2">
            <Tag className="w-4 h-4 text-gold-600" />
            <span>Active Promo Codes & Vouchers ({coupons.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-silk-100/90 border-b border-silk-200 dark:bg-dark-elevated dark:border-dark-border text-silk-900 dark:text-silk-200 uppercase text-[10px] font-extrabold tracking-wider">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min Order</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Usage</th>
                <th className="py-3 px-4 text-right">Actions (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silk-100 dark:divide-dark-border">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-silk-50/50 dark:hover:bg-dark-elevated/40">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-silk-950 dark:text-gold-300 bg-gold-50 dark:bg-dark-elevated px-2 py-1 rounded border border-gold-300 dark:border-dark-border">
                      {c.code}
                    </span>
                    <span className="block text-[11px] text-silk-500 mt-1">{c.descriptionEn}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-silk-900 dark:text-silk-100">
                    {c.discountType === "percentage" ? `${c.discountValue}% Off` : `৳${c.discountValue} Flat`}
                  </td>
                  <td className="py-3 px-4 font-serif text-silk-700 dark:text-silk-300">
                    {formatPriceBDT(c.minOrderBDT, language)}
                  </td>
                  <td className="py-3 px-4">
                    {c.isActive ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        Expired
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-silk-600 dark:text-silk-400 font-medium">
                    {c.usedCount} times applied
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditCouponModal(c)}
                        className="p-1.5 rounded-lg border border-silk-200 hover:border-gold-500 hover:bg-gold-50 text-silk-700 dark:border-dark-border dark:text-silk-300 transition"
                        title="Edit Coupon"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-1.5 rounded-lg border border-silk-200 hover:border-rose-400 hover:bg-rose-50 text-silk-400 hover:text-rose-600 dark:border-dark-border transition"
                        title="Delete Coupon"
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

      {/* Hero Banners Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif font-bold text-base text-silk-950 dark:text-silk-50 flex items-center gap-2">
            <Image className="w-4 h-4 text-gold-600" />
            <span>Homepage Hero Campaigns & Banners ({banners.length})</span>
          </h3>
          <Button size="sm" variant="outline" onClick={openCreateBannerModal}>
            <Plus className="w-4 h-4 mr-1" />
            <span>New Banner</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-silk-200 overflow-hidden shadow-card dark:bg-dark-surface dark:border-dark-border flex flex-col justify-between"
            >
              <div>
                <img
                  src={normalizeImageUrl(b.imageUrl)}
                  alt={b.titleEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-gold-600">
                      Priority #{b.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Live
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-silk-950 dark:text-silk-50 pt-1">
                    {b.titleEn}
                  </h4>
                  <p className="text-xs text-silk-600 dark:text-silk-400">{b.subtitleEn}</p>
                  <p className="text-[11px] font-mono text-silk-500 truncate pt-1">
                    Redirects to: {b.linkUrl}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 p-3 bg-silk-50 dark:bg-dark-elevated border-t border-silk-100 dark:border-dark-border">
                <Button size="sm" variant="outline" onClick={() => openEditBannerModal(b)}>
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  <span>Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  onClick={() => handleDeleteBanner(b.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL: CREATE / EDIT COUPON                */}
      {/* ========================================== */}
      <Modal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        title={editingCoupon ? "Edit Promotional Coupon" : "Create New Coupon Code"}
      >
        <form onSubmit={handleSaveCoupon} className="space-y-4">
          <Input
            label="Coupon Code (UPPERCASE)"
            placeholder="e.g. EIDMUBARAK"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-silk-800 dark:text-silk-200 mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full rounded-xl border border-silk-300 bg-white p-2 text-xs text-silk-900 dark:bg-dark-surface dark:border-dark-border dark:text-silk-100 font-medium"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed BDT Amount (৳)</option>
              </select>
            </div>

            <Input
              type="number"
              label={discountType === "percentage" ? "Discount Percentage (%)" : "Discount Amount (BDT)"}
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              required
            />
          </div>

          <Input
            type="number"
            label="Minimum Order Value (BDT)"
            value={minOrderBDT}
            onChange={(e) => setMinOrderBDT(Number(e.target.value))}
            required
          />

          <Input
            label="Description / Campaign Label"
            placeholder="e.g. 15% discount for Eid Festival Collection"
            value={descEn}
            onChange={(e) => setDescEn(e.target.value)}
          />

          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isCouponActive}
              onChange={(e) => setIsCouponActive(e.target.checked)}
              className="rounded border-silk-300 text-gold-600 focus:ring-gold-500"
            />
            <span>Active and Redeemable</span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-silk-100 dark:border-dark-border">
            <Button type="button" variant="outline" onClick={() => setIsCouponModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              {editingCoupon ? "Update Coupon" : "Publish Coupon"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================== */}
      {/* MODAL: CREATE / EDIT BANNER                */}
      {/* ========================================== */}
      <Modal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        title={editingBanner ? "Edit Campaign Banner" : "New Hero Campaign Banner"}
      >
        <form onSubmit={handleSaveBanner} className="space-y-4">
          <Input
            label="Banner Title (English)"
            placeholder="e.g. Royal Rajshahi Silk Exhibition"
            value={bannerTitleEn}
            onChange={(e) => setBannerTitleEn(e.target.value)}
            required
          />

          <Input
            label="Banner Title (Bangla)"
            placeholder="e.g. রাজকীয় রাজশাহী সিল্ক প্রদর্শনী"
            value={bannerTitleBn}
            onChange={(e) => setBannerTitleBn(e.target.value)}
          />

          <Input
            label="Subtitle / Promotional Tagline"
            placeholder="e.g. Handwoven Mulberry Silk Sarees for Eid-ul-Fitr"
            value={bannerSubEn}
            onChange={(e) => setBannerSubEn(e.target.value)}
          />

          <ImageUploadInput
            label="Campaign Banner Image"
            value={bannerImage}
            onChange={(url) => setBannerImage(url)}
            placeholder="Paste Google Drive link, web image URL, or upload from device..."
            helperText="Supports Google Drive share links, Unsplash, Imgur, or direct device uploads"
            previewShape="cover"
            previewHeight="h-28"
            showDriveGuide={true}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Destination Link"
              placeholder="/shop?category=rajshahi-silk-sarees"
              value={bannerLink}
              onChange={(e) => setBannerLink(e.target.value)}
              required
            />
            <Input
              type="number"
              label="Display Priority"
              value={bannerPriority}
              onChange={(e) => setBannerPriority(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-silk-100 dark:border-dark-border">
            <Button type="button" variant="outline" onClick={() => setIsBannerModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              {editingBanner ? "Update Banner" : "Create Banner"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
