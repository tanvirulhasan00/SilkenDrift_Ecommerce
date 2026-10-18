import React, { useState, useEffect } from "react";
import { useLoaderData } from "react-router";
import { mockRepository } from "~/services/mock/mockStore";
import { firestoreService } from "~/services/firebase/firestoreService";
import { firebaseConfig } from "~/services/firebase/config";
import { useLanguage } from "~/locales";
import { useAuth } from "~/hooks/useAuth";
import { useSettings } from "~/hooks/useSettings";
import { formatPriceBDT } from "~/lib/formatters";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { Badge } from "~/components/ui/Badge";
import { ImageUploadInput } from "~/components/ui/ImageUploadInput";
import { normalizeImageUrl } from "~/lib/imageUrl";
import { useToast } from "~/components/feedback/ToastContext";
import { BusinessSettings } from "~/types";
import {
  Settings,
  Shield,
  Lock,
  CreditCard,
  Save,
  Database,
  Cloud,
  CheckCircle,
  RefreshCw,
  Image as ImageIcon,
  Globe,
  Sparkles,
  ExternalLink,
  Eye,
  AlertTriangle,
  RotateCcw,
  Palette,
  Layers,
} from "lucide-react";

// Preset Brand Logos for one-click testing
const PRESET_LOGOS = [
  {
    name: "Gold Silk Emblem",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 80' width='320' height='80'%3E%3Cdefs%3E%3ClinearGradient id='goldG' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23e5c07b'/%3E%3Cstop offset='50%25' stop-color='%23c99a3e'/%3E%3Cstop offset='100%25' stop-color='%239e7220'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='8' y='14' width='52' height='52' rx='14' fill='url(%23goldG)'/%3E%3Ctext x='34' y='52' font-family='serif' font-weight='900' font-size='36' font-style='italic' fill='%23ffffff' text-anchor='middle'%3ES%3C/text%3E%3Ctext x='74' y='46' font-family='serif' font-weight='700' font-size='26' fill='%231a0e08' letter-spacing='-0.5'%3ESilkenDrift%3C/text%3E%3Ctext x='75' y='61' font-family='sans-serif' font-weight='700' font-size='9' fill='%23c99a3e' letter-spacing='3'%3EHERITAGE SILK%3C/text%3E%3C/svg%3E",
  },
  {
    name: "Minimal Monogram",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 80' width='300' height='80'%3E%3Ccircle cx='40' cy='40' r='28' fill='none' stroke='%23d4af37' stroke-width='3'/%3E%3Ctext x='40' y='50' font-family='serif' font-weight='700' font-size='30' fill='%23d4af37' text-anchor='middle'%3ESD%3C/text%3E%3Ctext x='84' y='46' font-family='serif' font-weight='700' font-size='24' fill='%23111827'%3ESilkenDrift%3C/text%3E%3Ctext x='85' y='60' font-family='sans-serif' font-weight='600' font-size='8' fill='%236b7280' letter-spacing='2'%3EPURE BANGLADESH SILK%3C/text%3E%3C/svg%3E",
  },
  {
    name: "Royal Loom Crest",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 80' width='320' height='80'%3E%3Cpolygon points='40,12 66,28 66,58 40,74 14,58 14,28' fill='%231a0e08' stroke='%23d4af37' stroke-width='2'/%3E%3Ctext x='40' y='52' font-family='serif' font-weight='900' font-size='28' fill='%23d4af37' text-anchor='middle'%3ES%3C/text%3E%3Ctext x='80' y='44' font-family='serif' font-weight='800' font-size='24' fill='%23991b1b'%3ESILKEN%3C/text%3E%3Ctext x='168' y='44' font-family='serif' font-weight='400' font-size='24' fill='%231f2937'%3EDRIFT%3C/text%3E%3Ctext x='82' y='60' font-family='sans-serif' font-weight='700' font-size='8' fill='%23b45309' letter-spacing='2.5'%3ERAJSHAHI &amp; DHAKAI%3C/text%3E%3C/svg%3E",
  },
];

// Preset Favicons for one-click testing
const PRESET_FAVICONS = [
  {
    name: "Gold Silk Diamond",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%231a0e08'/%3E%3Cpath d='M32 10 L50 28 L32 54 L14 28 Z' fill='none' stroke='%23d4af37' stroke-width='3.5' stroke-linejoin='round'/%3E%3Cpath d='M32 16 L44 28 L32 46 L20 28 Z' fill='%23d4af37'/%3E%3Ccircle cx='32' cy='28' r='3.5' fill='%23ffffff'/%3E%3C/svg%3E",
  },
  {
    name: "Crimson Lotus Bloom",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23881337'/%3E%3Cpath d='M32 12 C36 24 48 30 48 40 C48 48 40 52 32 52 C24 52 16 48 16 40 C16 30 28 24 32 12 Z' fill='%23fbbf24'/%3E%3Ccircle cx='32' cy='40' r='5' fill='%23ffffff'/%3E%3C/svg%3E",
  },
  {
    name: "Royal Loom Spool",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%230f172a'/%3E%3Cpolygon points='32,12 52,24 52,48 32,56 12,48 12,24' fill='none' stroke='%2338bdf8' stroke-width='3'/%3E%3Ctext x='32' y='42' font-family='serif' font-weight='900' font-size='28' fill='%23f8fafc' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E",
  },
  {
    name: "Emerald Silk Shield",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23064e3b'/%3E%3Cpath d='M32 12 L48 20 V34 C48 44 40 50 32 54 C24 50 16 44 16 34 V20 Z' fill='%2310b981' stroke='%23a7f3d0' stroke-width='2'/%3E%3Ctext x='32' y='38' font-family='serif' font-weight='900' font-size='22' fill='%23ffffff' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E",
  },
];

export async function clientLoader() {
  const settings = await firestoreService.getSettings();
  return { settings };
}

export default function AdminSettingsPage() {
  const { settings: initialSettings } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const { updateSettings } = useSettings();

  const [settings, setSettings] = useState<BusinessSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [logoTestError, setLogoTestError] = useState(false);
  const [faviconTestError, setFaviconTestError] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  useEffect(() => {
    setLogoTestError(false);
  }, [settings.logoUrl]);

  useEffect(() => {
    setFaviconTestError(false);
  }, [settings.faviconUrl]);

  const handleSeedFirestore = async () => {
    setIsSeeding(true);
    try {
      const res = await firestoreService.seedFirestore();
      if (res.success) {
        showToast(
          `Successfully synced ${res.count} documents to live Firestore (${firebaseConfig.projectId})!`,
          "success"
        );
      } else {
        showToast(`Sync failed: ${res.error}`, "error");
      }
    } catch (err: any) {
      showToast(err.message || "Seeding error", "error");
    } finally {
      setIsSeeding(false);
    }
  };

  // Security check: only super-admin can modify
  if (!isAdmin) {
    return (
      <div className="p-8 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-300">
        <div className="flex items-center gap-2 font-bold mb-1">
          <Lock className="w-5 h-5 text-amber-600" />
          <span>Restricted Admin Action</span>
        </div>
        <p className="text-xs">
          {t.admin.restrictedAccess} Switch to Super Admin in the top bar to edit system settings.
        </p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Update reactive Context (instant update for Header, Footer, Favicon in active browser)
      await updateSettings(settings);
      // 2. Persist to Firestore & Local Storage
      await firestoreService.saveSettings(settings);
      showToast("Store branding, logo, favicon, and system settings updated successfully!", "success");
    } catch (err: any) {
      console.error("Save settings error:", err);
      showToast(err.message || "Failed to save settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Top Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50 flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-gold-500" />
            <span>{t.admin.settings}</span>
          </h1>
          <p className="text-xs text-silk-700 dark:text-silk-300 font-medium mt-0.5">
            Store identity, editable logo &amp; favicon, Bangladesh tax rules, and delivery thresholds
          </p>
        </div>

        <Button type="submit" variant="gold" size="lg" isLoading={isSaving} className="shadow-luxury">
          <Save className="w-4 h-4 mr-1.5" />
          <span>Save Changes</span>
        </Button>
      </div>

      {/* CARD 1: BRAND IDENTITY, LOGO & FAVICON */}
      <div className="bg-white p-6 rounded-3xl border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-silk-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-silk-950 dark:text-silk-50">
                Store Identity, Logo &amp; Favicon
              </h3>
              <p className="text-[11px] text-silk-600 dark:text-silk-400 font-medium">
                Customize your store logo and browser tab favicon with live preview
              </p>
            </div>
          </div>
          <Badge variant="gold">Live Reactive</Badge>
        </div>

        {/* Store Name Input */}
        <div>
          <Input
            label="Store Display Name"
            value={settings.storeName}
            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            placeholder="e.g. SilkenDrift"
            required
            helperText="Appears in header, browser tab titles, emails, and invoices."
          />
        </div>

        {/* ==================================================== */}
        {/* LOGO CONFIGURATION & LIVE PREVIEWS */}
        {/* ==================================================== */}
        <div className="p-4 rounded-2xl bg-silk-50/70 border border-silk-200 dark:bg-dark-elevated/40 dark:border-dark-border space-y-4">
          <div className="space-y-3">
            <ImageUploadInput
              label="Storefront Logo (Image URL, Google Drive Link, or Upload File)"
              value={settings.logoUrl || ""}
              onChange={(val) => setSettings({ ...settings, logoUrl: val })}
              placeholder="Paste Google Drive sharing link, image URL, or upload from device..."
              helperText="Google Drive, Dropbox, direct device uploads, PNG, WebP, and SVG are fully supported."
              previewShape="logo"
              showDriveGuide={true}
            />

            {/* Quick Logo Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-silk-600 dark:text-silk-400">
                Quick Sample Logos:
              </span>
              {PRESET_LOGOS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setSettings({ ...settings, logoUrl: preset.url })}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white border border-silk-300 text-silk-800 hover:border-gold-500 hover:text-gold-600 dark:bg-dark-surface dark:border-dark-border dark:text-silk-200 transition"
                >
                  {preset.name}
                </button>
              ))}
              {settings.logoUrl && (
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, logoUrl: "" })}
                  className="px-2 py-1 text-[11px] font-medium rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear (Text Only)</span>
                </button>
              )}
            </div>
          </div>

          {/* DUAL LIVE LOGO PREVIEWS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {/* Light Header Simulation */}
            <div className="p-3.5 rounded-xl border border-silk-200 bg-white dark:border-silk-200/40 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-silk-500">
                <span>Light Header Simulation</span>
                <span className="text-emerald-600">Storefront Default</span>
              </div>
              <div className="h-16 flex items-center justify-center p-2 rounded-lg bg-silk-50/50 border border-dashed border-silk-200 overflow-hidden">
                {settings.logoUrl && !logoTestError ? (
                  <img
                    src={normalizeImageUrl(settings.logoUrl)}
                    alt="Logo Preview"
                    referrerPolicy="no-referrer"
                    onError={() => setLogoTestError(true)}
                    className="max-h-12 max-w-full object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-silk-900 font-serif font-bold text-base">
                    <div className="w-7 h-7 rounded-lg bg-gold-500 text-white flex items-center justify-center text-xs font-serif font-bold">
                      S
                    </div>
                    <span>{settings.storeName || "SilkenDrift"}</span>
                  </div>
                )}
              </div>
              {logoTestError && (
                <p className="text-[10px] text-rose-600 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <span>Image failed to load. Check that the URL is public and valid.</span>
                </p>
              )}
            </div>

            {/* Dark Header Simulation */}
            <div className="p-3.5 rounded-xl border border-dark-border bg-silk-950 text-white space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-silk-400">
                <span>Dark Header / Footer Simulation</span>
                <span className="text-gold-400">Night / Footer Mode</span>
              </div>
              <div className="h-16 flex items-center justify-center p-2 rounded-lg bg-black/40 border border-dashed border-silk-800 overflow-hidden">
                {(settings.logoDarkUrl || settings.logoUrl) && !logoTestError ? (
                  <img
                    src={normalizeImageUrl(settings.logoDarkUrl || settings.logoUrl)}
                    alt="Dark Logo Preview"
                    referrerPolicy="no-referrer"
                    onError={() => setLogoTestError(true)}
                    className="max-h-12 max-w-full object-contain brightness-105"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-white font-serif font-bold text-base">
                    <div className="w-7 h-7 rounded-lg bg-gold-500 text-silk-950 flex items-center justify-center text-xs font-serif font-bold">
                      S
                    </div>
                    <span>{settings.storeName || "SilkenDrift"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* FAVICON CONFIGURATION & BROWSER TAB SIMULATION */}
        {/* ==================================================== */}
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 dark:bg-amber-950/10 dark:border-amber-900/30 space-y-4">
          <div className="space-y-3">
            <ImageUploadInput
              label="Browser Tab Favicon (Image URL, Google Drive Link, or Upload File)"
              value={settings.faviconUrl || ""}
              onChange={(val) => setSettings({ ...settings, faviconUrl: val })}
              placeholder="Paste Google Drive sharing link, favicon URL, or upload from device..."
              helperText="Square 16x16, 32x32, or SVG. Updates browser tabs and bookmarks immediately."
              previewShape="square"
              showDriveGuide={false}
            />

            {/* Quick Favicon Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-300">
                Sample Favicon Icons:
              </span>
              {PRESET_FAVICONS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setSettings({ ...settings, faviconUrl: preset.url })}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white border border-amber-200 text-amber-950 hover:border-amber-500 hover:text-amber-700 dark:bg-dark-surface dark:border-amber-900/50 dark:text-amber-200 transition"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* REALISTIC BROWSER TAB SIMULATION MOCKUP */}
          <div className="pt-2 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 block">
              Live Browser Tab Simulation
            </span>

            <div className="rounded-xl border border-slate-300 bg-slate-100 dark:bg-slate-900 dark:border-slate-800 p-2 shadow-sm">
              {/* Tab Bar Chrome */}
              <div className="flex items-center gap-2 pb-2">
                <div className="flex items-center gap-1.5 px-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>

                {/* The Active Browser Tab */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-dark-surface rounded-t-lg shadow-sm border-t border-x border-slate-200 dark:border-slate-700 max-w-xs text-xs font-medium text-slate-800 dark:text-slate-100">
                  {settings.faviconUrl && !faviconTestError ? (
                    <img
                      src={normalizeImageUrl(settings.faviconUrl)}
                      alt="Favicon Preview"
                      referrerPolicy="no-referrer"
                      onError={() => setFaviconTestError(true)}
                      className="w-4 h-4 object-contain rounded-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-sm bg-gold-500 text-[10px] text-white flex items-center justify-center font-bold font-serif">
                      S
                    </div>
                  )}
                  <span className="truncate text-[11px]">
                    {settings.storeName || "SilkenDrift"} | Pure Heritage Silk
                  </span>
                  <span className="text-slate-400 hover:text-slate-600 text-xs ml-auto">✕</span>
                </div>
              </div>

              {/* Mock Address Bar */}
              <div className="px-3 py-1 bg-white dark:bg-dark-surface rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>https://{settings.storeName?.toLowerCase().replace(/\s+/g, "") || "silkendrift"}.com</span>
              </div>
            </div>

            {/* Multi-Size Icon Resolution Preview */}
            <div className="flex items-center gap-6 pt-2 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold">16x16:</span>
                <div className="w-5 h-5 rounded border border-amber-300 dark:border-amber-800 bg-white dark:bg-dark-surface flex items-center justify-center overflow-hidden">
                  {settings.faviconUrl && !faviconTestError ? (
                    <img
                      src={normalizeImageUrl(settings.faviconUrl)}
                      alt="16px"
                      referrerPolicy="no-referrer"
                      className="w-4 h-4 object-contain"
                    />
                  ) : (
                    <span className="text-[10px] font-serif font-bold text-gold-600">S</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold">32x32:</span>
                <div className="w-8 h-8 rounded border border-amber-300 dark:border-amber-800 bg-white dark:bg-dark-surface flex items-center justify-center overflow-hidden">
                  {settings.faviconUrl && !faviconTestError ? (
                    <img
                      src={normalizeImageUrl(settings.faviconUrl)}
                      alt="32px"
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <span className="text-xs font-serif font-bold text-gold-600">S</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold">64x64 HD:</span>
                <div className="w-10 h-10 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-dark-surface flex items-center justify-center overflow-hidden">
                  {settings.faviconUrl && !faviconTestError ? (
                    <img
                      src={normalizeImageUrl(settings.faviconUrl)}
                      alt="64px"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <span className="text-sm font-serif font-bold text-gold-600">S</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info & Slogans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Input
            label="Customer Support Hotline"
            value={settings.phone}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            placeholder="+880 9612-SILKEN"
            required
          />
          <Input
            label="Official Support Email"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            placeholder="support@silkendrift.com"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tagline (English)"
            value={settings.taglineEn}
            onChange={(e) => setSettings({ ...settings, taglineEn: e.target.value })}
            placeholder="Authentic Pure Silk & Heritage Apparel of Bangladesh"
          />
          <Input
            label="Tagline (Bangla)"
            value={settings.taglineBn}
            onChange={(e) => setSettings({ ...settings, taglineBn: e.target.value })}
            placeholder="খাঁটি সিল্ক ও ঐতিহ্যবাহী পোশাকের নির্ভরযোগ্য প্রতিষ্ঠান"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Corporate Address (English)"
            value={settings.addressEn}
            onChange={(e) => setSettings({ ...settings, addressEn: e.target.value })}
            placeholder="Level 4, SilkenDrift Tower, Dhanmondi, Dhaka"
          />
          <Input
            label="Corporate Address (Bangla)"
            value={settings.addressBn || ""}
            onChange={(e) => setSettings({ ...settings, addressBn: e.target.value })}
            placeholder="লেভেল ৪, সিল্কেনড্রিফট টাওয়ার, ধানমন্ডি, ঢাকা"
          />
        </div>
      </div>

      {/* CARD 2: BANGLADESH ECOMMERCE & DELIVERY THRESHOLDS */}
      <div className="bg-white p-6 rounded-3xl border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-4">
        <h3 className="font-serif font-bold text-base text-silk-950 dark:text-silk-50 pb-2 border-b border-silk-100 dark:border-dark-border">
          Delivery Charges &amp; Cash on Delivery Limits
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="number"
            label="Free Shipping Minimum Order (BDT)"
            value={settings.freeShippingMinBDT}
            onChange={(e) =>
              setSettings({ ...settings, freeShippingMinBDT: Number(e.target.value) })
            }
            helperText="Orders above this amount qualify for free shipping automatically."
          />
          <Input
            type="number"
            label="Max Cash on Delivery Limit (BDT)"
            value={settings.codMaxAmountBDT}
            onChange={(e) =>
              setSettings({ ...settings, codMaxAmountBDT: Number(e.target.value) })
            }
            helperText="Orders exceeding this must use bKash or card online."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="number"
            label="Inside Dhaka Flat Shipping Charge (BDT)"
            value={settings.insideDhakaChargeBDT}
            onChange={(e) =>
              setSettings({ ...settings, insideDhakaChargeBDT: Number(e.target.value) })
            }
            helperText="Standard home delivery fee for Dhaka metropolitan."
          />
          <Input
            type="number"
            label="Outside Dhaka Flat Shipping Charge (BDT)"
            value={settings.outsideDhakaChargeBDT}
            onChange={(e) =>
              setSettings({ ...settings, outsideDhakaChargeBDT: Number(e.target.value) })
            }
            helperText="Courier delivery fee across all 63 other districts."
          />
        </div>
      </div>

      {/* CARD 3: PAYMENT GATEWAY CREDENTIALS */}
      <div className="bg-white p-6 rounded-3xl border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-silk-100 dark:border-dark-border">
          <div>
            <h3 className="font-serif font-bold text-base text-silk-950 dark:text-silk-50 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Payment Gateway Scaffolding &amp; Credentials</span>
            </h3>
            <p className="text-[11px] text-silk-600 dark:text-silk-400 font-medium">
              Production secrets are securely injected via Firebase Cloud Functions environment secrets.
            </p>
          </div>
          <Badge variant="gold">Server Secured</Badge>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-200 dark:bg-pink-950/20 dark:border-pink-800 space-y-3">
            <h4 className="font-bold text-pink-900 dark:text-pink-300">
              bKash Tokenized Checkout (Sandbox &amp; Production)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="bKash Merchant Mobile Number"
                placeholder="017XXXXXXXX"
                value={settings.bKashMerchantNumber || ""}
                onChange={(e) =>
                  setSettings({ ...settings, bKashMerchantNumber: e.target.value })
                }
              />
              <Input
                label="bKash App Key"
                type="password"
                placeholder="BKASH_APP_KEY_XXXX"
                value="••••••••••••••••••••"
                readOnly
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800 space-y-3">
            <h4 className="font-bold text-blue-900 dark:text-blue-300">
              SSLCOMMERZ Payment Session
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="SSLCOMMERZ Store ID"
                value={settings.sslStoreId || ""}
                onChange={(e) =>
                  setSettings({ ...settings, sslStoreId: e.target.value })
                }
              />
              <Input
                label="SSLCOMMERZ Store Password"
                type="password"
                placeholder="SSL_STORE_PASSWORD_XXXX"
                value="••••••••••••••••••••"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* CARD 4: FIREBASE CLOUD LIVE STATUS & SEEDER */}
      <div className="bg-white p-6 rounded-3xl border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-silk-100 dark:border-dark-border gap-2">
          <div>
            <h3 className="font-serif font-bold text-base text-silk-950 dark:text-silk-50 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-silk-600 dark:text-silk-400" />
              <span>Firebase Cloud Backend (Free Spark Plan)</span>
            </h3>
            <p className="text-[11px] text-silk-600 dark:text-silk-400 font-medium">
              Direct client-side Firestore &amp; Auth connection. Free tier quotas: 50k reads/day, 20k writes/day, 5GB storage.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Live Connected
            </span>
            <Badge variant="gold">Spark Free Tier</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-silk-50/60 rounded-2xl border border-silk-100 dark:bg-dark-elevated dark:border-dark-border">
            <span className="text-[10px] text-silk-700 dark:text-silk-300 uppercase tracking-wider font-bold block">Project ID</span>
            <span className="font-mono font-medium text-silk-900 dark:text-silk-100 truncate block mt-0.5">
              {firebaseConfig.projectId}
            </span>
          </div>

          <div className="p-3 bg-silk-50/60 rounded-2xl border border-silk-100 dark:bg-dark-elevated dark:border-dark-border">
            <span className="text-[10px] text-silk-700 dark:text-silk-300 uppercase tracking-wider font-bold block">Auth Domain</span>
            <span className="font-mono font-medium text-silk-900 dark:text-silk-100 truncate block mt-0.5">
              {firebaseConfig.authDomain}
            </span>
          </div>

          <div className="p-3 bg-silk-50/60 rounded-2xl border border-silk-100 dark:bg-dark-elevated dark:border-dark-border">
            <span className="text-[10px] text-silk-700 dark:text-silk-300 uppercase tracking-wider font-bold block">Storage Bucket</span>
            <span className="font-mono font-medium text-silk-900 dark:text-silk-100 truncate block mt-0.5">
              {firebaseConfig.storageBucket}
            </span>
          </div>

          <div className="p-3 bg-silk-50/60 rounded-2xl border border-silk-100 dark:bg-dark-elevated dark:border-dark-border">
            <span className="text-[10px] text-silk-700 dark:text-silk-300 uppercase tracking-wider font-bold block">Google Analytics</span>
            <span className="font-mono font-medium text-silk-900 dark:text-silk-100 truncate block mt-0.5">
              {firebaseConfig.measurementId || "Enabled"}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl dark:bg-amber-950/20 dark:border-amber-900/40 gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-amber-950 dark:text-amber-200 text-xs">
              <Database className="w-4 h-4 text-amber-600" />
              <span>One-Click Live Firestore Synchronization</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              Populates all authentic Bangladesh handloom products, categories, pickup hubs, and store metadata into your live Firestore collections (<code className="font-mono text-[10px] bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">daktarkhana-test-db</code>).
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSeedFirestore}
            isLoading={isSeeding}
            className="shrink-0 border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-600 hover:text-white hover:border-amber-600 dark:border-amber-800 dark:text-amber-200 dark:bg-amber-950/30 dark:hover:bg-amber-600 dark:hover:text-white transition"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Seed Live Firestore</span>
          </Button>
        </div>
      </div>

      {/* Floating Save Bar on Bottom for convenience */}
      <div className="flex justify-end pt-4">
        <Button type="submit" variant="gold" size="lg" isLoading={isSaving} className="shadow-luxury">
          <Save className="w-4 h-4 mr-1.5" />
          <span>Save Changes</span>
        </Button>
      </div>
    </form>
  );
}
