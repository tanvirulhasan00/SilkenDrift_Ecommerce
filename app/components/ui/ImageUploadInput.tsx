import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  normalizeImageUrl,
  getImageProviderInfo,
  readFileAsDataUrl,
  getGoogleDriveFallbackUrls,
  extractGoogleDriveId,
} from "~/lib/imageUrl";
import {
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Image as ImageIcon,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ImageUploadInputProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  accept?: string;
  enableFileUpload?: boolean;
  previewHeight?: string;
  previewShape?: "logo" | "square" | "cover";
  showDriveGuide?: boolean;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "Paste Google Drive link, web image URL, or upload file...",
  helperText,
  required = false,
  accept = "image/*,.png,.jpg,.jpeg,.webp,.svg,.ico",
  enableFileUpload = true,
  previewHeight = "h-16",
  previewShape = "logo",
  showDriveGuide = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasImgError, setHasImgError] = useState(false);
  const [isDriveGuideOpen, setIsDriveGuideOpen] = useState(false);

  const providerInfo = getImageProviderInfo(value);
  const normalizedValue = normalizeImageUrl(value);

  const fallbackUrls = useMemo(() => {
    if (providerInfo.isGoogleDrive) {
      return getGoogleDriveFallbackUrls(value);
    }
    return [normalizedValue];
  }, [value, normalizedValue, providerInfo.isGoogleDrive]);

  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

  // Reset image error state and fallback index whenever value changes
  useEffect(() => {
    setCurrentUrlIndex(0);
    setHasImgError(false);
  }, [value, normalizedValue]);

  const activeDisplayUrl = fallbackUrls[currentUrlIndex] || normalizedValue;

  const handleImgError = () => {
    // If there are more fallbacks to try for Google Drive, try the next format
    if (currentUrlIndex + 1 < fallbackUrls.length) {
      setCurrentUrlIndex((prev) => prev + 1);
    } else {
      setHasImgError(true);
    }
  };

  // Handle direct text/URL input
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const normalized = normalizeImageUrl(rawInput);
    onChange(normalized);
  };

  // Handle direct local file upload from device
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1600px max dimension, high quality WebP/PNG
      const dataUrl = await readFileAsDataUrl(file, 1600, 0.9);
      onChange(dataUrl);
    } catch (err) {
      console.error("Failed to read image file:", err);
    } finally {
      setIsUploading(false);
      // Reset input value so re-selecting same file triggers onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      {/* Label & Quick Guide Toggle */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-silk-900 dark:text-silk-100 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-gold-500" />
            <span>{label}</span>
            {required && <span className="text-rose-500">*</span>}
          </label>

          {showDriveGuide && (
            <button
              type="button"
              onClick={() => setIsDriveGuideOpen(!isDriveGuideOpen)}
              className="text-[11px] font-semibold text-gold-700 hover:text-gold-800 dark:text-gold-400 dark:hover:text-gold-300 flex items-center gap-1 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Google Drive Guide</span>
              {isDriveGuideOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Google Drive Collapsible Quick Guide */}
      {isDriveGuideOpen && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-gold-50 border border-amber-200 dark:from-amber-950/20 dark:to-gold-950/20 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-bold">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
              GD
            </span>
            <span>How to use Google Drive images:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-amber-900 dark:text-amber-300 pl-1">
            <li>
              In Google Drive, right-click your image &rarr; <strong>Share &rarr; Share</strong>.
            </li>
            <li>
              Under <em>General access</em>, change from <strong>"Restricted"</strong> to{" "}
              <strong className="underline">"Anyone with the link"</strong> (Viewer).
              <span className="block text-[10px] text-amber-800 dark:text-amber-400 mt-0.5">
                (Note: On School or Company Google accounts, ensure it says "Anyone on the web", not just members of your organization).
              </span>
            </li>
            <li>
              Click <strong>"Copy link"</strong> and paste it into the field below.
            </li>
          </ol>
          <div className="pt-1 border-t border-amber-200/80 dark:border-amber-900/30 text-[10px] text-amber-800 dark:text-amber-300 flex items-center justify-between gap-2">
            <span>
              💡 <strong>Fastest &amp; 100% Reliable:</strong> Use the <strong>"Browse / Upload"</strong> button to pick the image file directly from your device.
            </span>
          </div>
        </div>
      )}

      {/* Input Group: Text Field + Upload Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={handleUrlChange}
            placeholder={placeholder}
            className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-silk-300 bg-white dark:bg-dark-surface dark:border-dark-border dark:text-silk-100 font-mono focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition"
          />
          <LinkIcon className="w-4 h-4 text-silk-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-silk-400 hover:text-silk-700 p-0.5 rounded hover:bg-silk-100 dark:hover:bg-dark-elevated transition"
              title="Clear Image"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Local File Picker Button */}
        {enableFileUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="shrink-0 px-3.5 py-2 text-xs font-bold rounded-xl border border-gold-300 bg-gold-50 hover:bg-gold-500 hover:text-silk-950 text-gold-900 dark:border-gold-800 dark:bg-gold-950/30 dark:text-gold-300 dark:hover:bg-gold-500 dark:hover:text-silk-950 transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? "Processing..." : "Browse / Upload"}</span>
            </button>
          </>
        )}
      </div>

      {/* Cloud Conversion Indicator Badge */}
      {providerInfo.isGoogleDrive && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-lg">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            Google Drive link detected &amp; converted to direct image stream. (Make sure access is "Anyone with the link").
          </span>
        </div>
      )}

      {providerInfo.isDropbox && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 px-2.5 py-1 rounded-lg">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Dropbox link converted to direct image raw download stream.</span>
        </div>
      )}

      {providerInfo.isDataUri && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/50 px-2.5 py-1 rounded-lg">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Uploaded directly from device (Embedded Data URI).</span>
        </div>
      )}

      {/* Inline Live Image Preview */}
      {normalizedValue && (
        <div className="p-3 rounded-2xl bg-silk-50/60 dark:bg-dark-elevated/40 border border-silk-200 dark:border-dark-border flex items-center gap-3">
          <div
            className={`flex items-center justify-center rounded-xl bg-white dark:bg-dark-surface border border-silk-200 dark:border-dark-border overflow-hidden p-1.5 shrink-0 ${previewHeight} ${
              previewShape === "square" ? "aspect-square" : previewShape === "cover" ? "aspect-[4/3]" : "min-w-[70px] max-w-[160px]"
            }`}
          >
            {!hasImgError ? (
              <img
                src={activeDisplayUrl}
                alt="Preview"
                referrerPolicy="no-referrer"
                onError={handleImgError}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-rose-500 flex flex-col items-center justify-center p-1 text-center">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[9px] font-bold">Blocked</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-xs">
            <p className="font-bold text-silk-900 dark:text-silk-100 truncate">
              {hasImgError ? "Image Blocked by Provider" : "Live Image Active"}
            </p>
            {hasImgError ? (
              <div className="space-y-1 mt-0.5">
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  {providerInfo.isGoogleDrive
                    ? "Google Drive blocked cross-site embedding (403 Forbidden)."
                    : "The URL may be private, expired, or invalid."}
                </p>
                {providerInfo.isGoogleDrive && (
                  <p className="text-[10px] text-silk-600 dark:text-silk-400 leading-normal">
                    In a new tab, your personal Google login allows viewing. But Google blocks other websites from embedding your Drive images without cookies (especially on Work/School Google accounts).
                  </p>
                )}
                {enableFileUpload && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-gold-500 hover:bg-gold-600 text-silk-950 font-bold text-[10px] shadow-xs transition flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload directly from device (100% reliable)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-silk-500 font-mono truncate mt-0.5">
                {activeDisplayUrl.startsWith("data:") ? "Embedded Data URI (Direct)" : activeDisplayUrl}
              </p>
            )}
          </div>

          {normalizedValue.startsWith("http") && (
            <a
              href={normalizedValue}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg border border-silk-200 hover:border-gold-500 text-silk-600 hover:text-gold-600 dark:border-dark-border dark:text-silk-400 transition shrink-0"
              title="Open raw image in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Helper text */}
      {helperText && !providerInfo.isGoogleDrive && !providerInfo.isDropbox && !providerInfo.isDataUri && (
        <p className="text-[11px] text-silk-600 dark:text-silk-400 font-medium">{helperText}</p>
      )}
    </div>
  );
};
