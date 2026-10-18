/**
 * Image URL normalization and cloud storage direct-stream converter.
 * Converts Google Drive, Dropbox, OneDrive, Imgur, and local file uploads
 * into direct image streams suitable for <img> tags and <link rel="icon">.
 */

/**
 * Normalizes an image URL from Google Drive, Dropbox, OneDrive, Imgur, etc.
 * into a direct raw image streaming URL.
 */
export function normalizeImageUrl(rawUrl: string | undefined | null): string {
  if (!rawUrl || typeof rawUrl !== "string") return "";

  let url = rawUrl.trim();
  if (!url) return "";

  // 1. Strip markdown wrappers: ![alt](https://...) -> https://...
  const mdMatch = url.match(/\((https?:\/\/[^\s)]+)\)/);
  if (mdMatch) {
    url = mdMatch[1];
  }

  // 2. Strip surrounding quotes or angle brackets
  url = url.replace(/^["'<]|["'>]$/g, "").trim();

  // 3. If it's already a Data URI (SVG / Base64 image), keep as-is
  if (url.startsWith("data:image/")) {
    return url;
  }

  // 4. Google Drive Transformation
  // Google Drive sharing links return an HTML webpage instead of raw image data.
  // Converting to `https://drive.google.com/thumbnail?id={FILE_ID}&sz=w1200` directly
  // streams the raw image from Google CDN with image/jpeg or image/png headers!
  const driveId = extractGoogleDriveId(url);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`;
  }

  // 5. Dropbox Transformation
  // www.dropbox.com/s/.../photo.png?dl=0 -> dl.dropboxusercontent.com/s/.../photo.png
  if (url.includes("dropbox.com")) {
    let dlUrl = url.replace("www.dropbox.com", "dl.dropboxusercontent.com");
    if (dlUrl.includes("?dl=0")) {
      dlUrl = dlUrl.replace("?dl=0", "?raw=1");
    } else if (dlUrl.includes("&dl=0")) {
      dlUrl = dlUrl.replace("&dl=0", "&raw=1");
    } else if (!dlUrl.includes("raw=1") && !dlUrl.includes("dl.dropboxusercontent.com")) {
      dlUrl += dlUrl.includes("?") ? "&raw=1" : "?raw=1";
    }
    return dlUrl;
  }

  // 6. OneDrive Transformation
  if (url.includes("1drv.ms") || url.includes("onedrive.live.com")) {
    if (url.includes("redir?")) {
      return url.replace("redir?", "download?");
    }
  }

  // 7. Imgur Transformation
  // https://imgur.com/{id} -> https://i.imgur.com/{id}.jpg
  const imgurMatch = url.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)$/i);
  if (imgurMatch && imgurMatch[1]) {
    return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
  }

  return url;
}

/**
 * Extracts the alphanumeric file ID from any Google Drive URL format.
 */
export function extractGoogleDriveId(rawUrl: string | undefined | null): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const url = rawUrl.trim();

  // 1. /file/d/{FILE_ID}
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // 2. id={FILE_ID} in query parameters (open?id=, uc?id=, thumbnail?id=)
  const queryIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (queryIdMatch && queryIdMatch[1]) return queryIdMatch[1];

  // 3. /d/{FILE_ID} (e.g. lh3.googleusercontent.com/d/{FILE_ID})
  const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (dMatch && dMatch[1]) return dMatch[1];

  // 4. docs.google.com/.../d/{FILE_ID}
  const docsMatch = url.match(/docs\.google\.com\/[^/]+\/d\/([a-zA-Z0-9_-]{20,})/);
  if (docsMatch && docsMatch[1]) return docsMatch[1];

  return null;
}

/**
 * Returns an array of progressive fallback direct URLs for a Google Drive asset.
 */
export function getGoogleDriveFallbackUrls(urlOrId: string | undefined | null): string[] {
  const id =
    extractGoogleDriveId(urlOrId) ||
    (urlOrId && /^[a-zA-Z0-9_-]{20,}$/.test(urlOrId.trim()) ? urlOrId.trim() : null);
  if (!id) return [];
  return [
    `https://drive.google.com/thumbnail?id=${id}&sz=w1200`,
    `https://lh3.googleusercontent.com/d/${id}=w1200`,
    `https://lh3.googleusercontent.com/d/${id}`,
    `https://drive.usercontent.google.com/download?id=${id}&export=view`,
    `https://drive.google.com/uc?export=view&id=${id}`,
  ];
}

/**
 * Returns diagnostic metadata about an image URL source
 */
export function getImageProviderInfo(rawUrl: string | undefined | null): {
  isGoogleDrive: boolean;
  isDropbox: boolean;
  isOneDrive: boolean;
  isDataUri: boolean;
  isConverted: boolean;
  convertedUrl: string;
  originalUrl: string;
} {
  const original = (rawUrl || "").trim();
  const converted = normalizeImageUrl(original);
  const isGoogleDrive =
    Boolean(extractGoogleDriveId(original)) ||
    original.includes("drive.google.com") ||
    original.includes("docs.google.com") ||
    converted.includes("lh3.googleusercontent.com") ||
    converted.includes("drive.google.com");
  const isDropbox = original.includes("dropbox.com");
  const isOneDrive = original.includes("1drv.ms") || original.includes("onedrive.live.com");
  const isDataUri = original.startsWith("data:image/");
  const isConverted = original !== "" && converted !== original;

  return {
    isGoogleDrive,
    isDropbox,
    isOneDrive,
    isDataUri,
    isConverted,
    convertedUrl: converted,
    originalUrl: original,
  };
}

/**
 * Reads a local file from disk/device and converts it to a clean base64 Data URI.
 * Automatically preserves SVG vector fidelity and optimizes large images.
 */
export function readFileAsDataUrl(
  file: File,
  maxDimension: number = 1600,
  quality: number = 0.88
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's an SVG file, keep the clean vector markup without rasterization
    if (file.type === "image/svg+xml" || file.name.endsWith(".svg")) {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    // For raster images (JPEG, PNG, WebP), check size
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      // If file is under 400KB, return directly to preserve 100% original quality
      if (file.size <= 400 * 1024) {
        resolve(dataUrl);
        return;
      }

      // If in browser environment with Canvas support, optimize and resize
      if (typeof window !== "undefined" && typeof document !== "undefined") {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Use WebP if supported, otherwise JPEG or PNG
          const outputFormat = file.type === "image/png" ? "image/png" : "image/webp";
          const optimizedDataUrl = canvas.toDataURL(outputFormat, quality);
          resolve(optimizedDataUrl);
        };
        img.onerror = () => {
          resolve(dataUrl);
        };
        img.src = dataUrl;
      } else {
        resolve(dataUrl);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
