import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { useLanguage } from "~/locales";
import { useSettings } from "~/hooks/useSettings";
import { normalizeImageUrl } from "~/lib/imageUrl";
import {
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();
  const { settings } = useSettings();
  const [logoError, setLogoError] = useState(false);

  const footerLogo = settings.logoDarkUrl || settings.logoUrl;

  useEffect(() => {
    setLogoError(false);
  }, [footerLogo]);

  return (
    <footer className="bg-silk-950 text-silk-200 dark:bg-black dark:text-silk-300 border-t border-silk-900 transition-colors">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              {footerLogo && !logoError ? (
                <img
                  src={normalizeImageUrl(footerLogo)}
                  alt={settings.storeName || t.common.brandName}
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className="h-9 w-auto max-w-[180px] object-contain brightness-110"
                />
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center text-silk-950 font-serif font-bold text-lg">
                    S
                  </div>
                  <span className="text-xl font-serif font-bold text-white tracking-tight">
                    {settings.storeName || t.common.brandName}
                  </span>
                </div>
              )}
            </Link>
            <p className="text-xs text-silk-400 leading-relaxed max-w-sm">
              {language === "bn"
                ? settings.taglineBn || t.footer.aboutText
                : settings.taglineEn || t.footer.aboutText}
            </p>
            <div className="space-y-2 text-xs text-silk-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                <span>
                  {language === "bn"
                    ? settings.addressBn || settings.addressEn || t.footer.headOffice
                    : settings.addressEn || t.footer.headOffice}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                <span>{settings.phone || t.footer.hotline}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                <span>{settings.email || "support@silkendrift.com"}</span>
              </div>
            </div>
          </div>

          {/* Quick Links, Customer Care, Legal & Trust (Grid 2 on mobile, 3 columns on desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-3 lg:col-span-3 gap-6 sm:gap-8">
            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4">
                {t.footer.quickLinks}
              </h4>
              <ul className="space-y-2 text-xs text-silk-400">
                <li>
                  <Link to="/shop" className="hover:text-gold-400 transition">
                    {t.nav.shop}
                  </Link>
                </li>
                <li>
                  <Link to="/shop?category=rajshahi-silk-sarees" className="hover:text-gold-400 transition">
                    {language === "bn" ? "রাজশাহী সিল্ক শাড়ি" : "Rajshahi Silk Sarees"}
                  </Link>
                </li>
                <li>
                  <Link to="/shop?category=dhakai-jamdani" className="hover:text-gold-400 transition">
                    {language === "bn" ? "ঢাকাই জামদানি" : "Dhakai Jamdani"}
                  </Link>
                </li>
                <li>
                  <Link to="/shop?category=mens-silk-panjabi" className="hover:text-gold-400 transition">
                    {language === "bn" ? "পুরুষদের সিল্ক পাঞ্জাবি" : "Men's Silk Panjabi"}
                  </Link>
                </li>
                <li>
                  <Link to="/shop?category=muslin-silk-shawls" className="hover:text-gold-400 transition">
                    {language === "bn" ? "মসলিন ও সিল্ক শাল" : "Muslin & Silk Shawls"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Care */}
            <div>
              <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4">
                {t.footer.customerCare}
              </h4>
              <ul className="space-y-2 text-xs text-silk-400">
                <li>
                  <Link to="/track" className="hover:text-gold-400 transition">
                    {t.nav.trackOrder}
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="hover:text-gold-400 transition">
                    {t.nav.wishlist}
                  </Link>
                </li>
                <li>
                  <Link to="/static/faq" className="hover:text-gold-400 transition">
                    {t.nav.faq}
                  </Link>
                </li>
                <li>
                  <Link to="/static/delivery-policy" className="hover:text-gold-400 transition">
                    {t.footer.shippingPolicy}
                  </Link>
                </li>
                <li>
                  <Link to="/static/return-policy" className="hover:text-gold-400 transition">
                    {t.footer.returnPolicy}
                  </Link>
                </li>
                <li>
                  <Link to="/static/contact" className="hover:text-gold-400 transition">
                    {t.nav.contact}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal & Policies */}
            <div>
              <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4">
                {language === "bn" ? "নীতিমালা" : "Legal & Trust"}
              </h4>
              <ul className="space-y-2 text-xs text-silk-400">
                <li>
                  <Link to="/static/privacy" className="hover:text-gold-400 transition">
                    {t.footer.privacyPolicy}
                  </Link>
                </li>
                <li>
                  <Link to="/static/terms" className="hover:text-gold-400 transition">
                    {t.footer.termsCondition}
                  </Link>
                </li>
                <li>
                  <Link to="/static/about" className="hover:text-gold-400 transition">
                    {t.nav.about}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-gold-400 transition">
                    {t.nav.contact}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-silk-900 text-xs text-silk-300 font-medium text-center sm:text-left">
          <p>{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
};
