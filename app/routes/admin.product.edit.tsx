import React, { useState } from "react";
import { Link, useNavigate, useLoaderData } from "react-router";
import { firestoreService } from "~/services/firebase/firestoreService";
import { useLanguage } from "~/locales";
import { formatPriceBDT } from "~/lib/formatters";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { Input } from "~/components/ui/Input";
import { useToast } from "~/components/feedback/ToastContext";
import { Product, Category, ProductVariant } from "~/types";
import { getAdminPath } from "~/config/adminConfig";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Package,
  Save,
  Eye,
  Tag,
  DollarSign,
  Boxes,
  ArrowUp,
  ArrowDown,
  Star,
  CheckCircle2,
  Upload,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { normalizeImageUrl, readFileAsDataUrl, getImageProviderInfo, getGoogleDriveFallbackUrls } from "~/lib/imageUrl";

export async function clientLoader({ params }: { params: { id?: string } }) {
  const [categories, allProducts] = await Promise.all([
    firestoreService.getCategories(),
    firestoreService.getProducts(),
  ]);

  const targetId = params.id;
  let product: Product | null = null;

  if (targetId) {
    product = allProducts.find((p) => p.id === targetId) || null;
    if (!product) {
      product = (await firestoreService.getProductById(targetId)) || null;
    }
  }

  return { categories, product, productId: targetId || null };
}

interface ProductEditorProps {
  isNew?: boolean;
}

export default function AdminProductEditorPage({ isNew: isNewProp }: ProductEditorProps) {
  const { categories, product, productId } = useLoaderData<typeof clientLoader>();
  const isCreateMode = isNewProp || !productId || !product;

  return (
    <ProductEditorForm
      key={isCreateMode ? "new-product" : product?.id || "editor"}
      initialProduct={isCreateMode ? null : product}
      categories={categories}
      isCreateMode={isCreateMode}
    />
  );
}

function ProductEditorForm({
  initialProduct,
  categories,
  isCreateMode,
}: {
  initialProduct: Product | null;
  categories: Category[];
  isCreateMode: boolean;
}) {
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Basic Details
  const [prodNameEn, setProdNameEn] = useState(initialProduct?.nameEn || "");
  const [prodNameBn, setProdNameBn] = useState(initialProduct?.nameBn || "");
  const [prodSku, setProdSku] = useState(
    initialProduct?.sku || `SD-NEW-${Math.floor(100 + Math.random() * 900)}`
  );
  const [prodCategoryId, setProdCategoryId] = useState(
    initialProduct?.categoryId || categories[0]?.id || ""
  );
  const [prodDescEn, setProdDescEn] = useState(
    initialProduct?.descriptionEn ||
      (isCreateMode
        ? "Authentic handwoven garment crafted with traditional techniques using premium natural silks."
        : "")
  );
  const [prodDescBn, setProdDescBn] = useState(
    initialProduct?.descriptionBn ||
      (isCreateMode ? "ঐতিহ্যবাহী তাঁতে বোনা আসল প্রিমিয়াম সিল্কের পোশাক।" : "")
  );

  // Pricing & Stock
  const [prodPriceBDT, setProdPriceBDT] = useState<number>(
    initialProduct ? initialProduct.basePriceBDT : 5500
  );
  const [prodSalePriceBDT, setProdSalePriceBDT] = useState<string>(
    initialProduct?.salePriceBDT ? String(initialProduct.salePriceBDT) : ""
  );
  const [prodStockTotal, setProdStockTotal] = useState<number>(
    initialProduct ? initialProduct.stockTotal : 20
  );
  const [prodLowStockThreshold, setProdLowStockThreshold] = useState<number>(
    initialProduct?.lowStockThreshold || 5
  );

  // Status & Visibility
  const [prodIsPublished, setProdIsPublished] = useState(
    initialProduct ? initialProduct.isPublished !== false : true
  );
  const [prodIsFeatured, setProdIsFeatured] = useState(
    initialProduct ? initialProduct.isFeatured === true : false
  );
  const [prodTags, setProdTags] = useState<string>(
    initialProduct?.tags ? initialProduct.tags.join(", ") : "new-arrival, handloom"
  );

  // Dynamic Default Product Images (any number of images)
  const [prodImages, setProdImages] = useState<string[]>(() => {
    if (initialProduct?.images && initialProduct.images.length > 0) {
      return [...initialProduct.images];
    }
    if (isCreateMode) {
      return [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
      ];
    }
    return [""];
  });

  const handleAddProductImage = () => {
    setProdImages((prev) => [...prev, ""]);
  };

  const [isDriveGuideOpen, setIsDriveGuideOpen] = useState(false);

  const handleUpdateProductImage = (index: number, val: string) => {
    setProdImages((prev) => {
      const copy = [...prev];
      copy[index] = normalizeImageUrl(val);
      return copy;
    });
  };

  const handleRemoveProductImage = (index: number) => {
    setProdImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [""];
    });
  };

  const handleMoveProductImage = (fromIdx: number, toIdx: number) => {
    setProdImages((prev) => {
      if (toIdx < 0 || toIdx >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, item);
      return copy;
    });
  };

  // Preset helper for filling 4 sample saree images
  const fillSampleSareeImages = () => {
    setProdImages([
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80",
    ]);
    showToast("4 luxury saree photos filled into dynamic gallery", "info");
  };

  // Variants State
  const [prodVariants, setProdVariants] = useState<ProductVariant[]>(
    initialProduct?.variants ? [...initialProduct.variants] : []
  );
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [varTitleEn, setVarTitleEn] = useState("");
  const [varTitleBn, setVarTitleBn] = useState("");
  const [varColor, setVarColor] = useState("");
  const [varSize, setVarSize] = useState("");
  const [varSku, setVarSku] = useState("");
  const [varPriceBDT, setVarPriceBDT] = useState<number>(prodPriceBDT);
  const [varSalePriceBDT, setVarSalePriceBDT] = useState<string>("");
  const [varStock, setVarStock] = useState<number>(10);
  const [varImages, setVarImages] = useState<string[]>([""]);
  const [varIsDefault, setVarIsDefault] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddVarImage = () => {
    setVarImages((prev) => [...prev, ""]);
  };

  const handleUpdateVarImage = (index: number, val: string) => {
    setVarImages((prev) => {
      const copy = [...prev];
      copy[index] = normalizeImageUrl(val);
      return copy;
    });
  };

  const handleRemoveVarImage = (index: number) => {
    setVarImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [""];
    });
  };

  const handleSetVariantAsDefault = (variantId: string) => {
    setProdVariants((prev) =>
      prev.map((v) => ({
        ...v,
        isDefault: v.id === variantId,
      }))
    );
    showToast("Default variant set for storefront", "success");
  };

  // Preset helper for fast generating 3 color variants with varying image counts
  const handleAddSampleVariants = () => {
    const sampleColors = [
      {
        en: "Royal Crimson & Gold",
        bn: "রক্ত লাল ও সোনালি",
        color: "Royal Crimson",
        code: "CR",
        isDefault: true,
        images: [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80",
        ],
      },
      {
        en: "Deep Emerald & Antique Gold",
        bn: "পান্না সবুজ ও অ্যান্টিক গোল্ড",
        color: "Deep Emerald",
        code: "EM",
        isDefault: false,
        images: [
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80",
        ],
      },
      {
        en: "Royal Sapphire Blue",
        bn: "নীলকান্তমণি নীল",
        color: "Royal Blue",
        code: "RB",
        isDefault: false,
        images: [
          "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
        ],
      },
    ];

    const generated: ProductVariant[] = sampleColors.map((c, i) => ({
      id: `var_${Date.now()}_${i}`,
      productId: initialProduct ? initialProduct.id : "",
      sku: `${prodSku}-${c.code}`,
      titleEn: c.en,
      titleBn: c.bn,
      attributes: {
        color: c.color,
        size: "Standard 6.3m",
      },
      priceBDT: Number(prodPriceBDT),
      salePriceBDT: prodSalePriceBDT ? Number(prodSalePriceBDT) : undefined,
      stock: 8,
      imageUrl: c.images[0],
      images: c.images,
      isDefault: c.isDefault,
    }));

    setProdVariants(generated);
    setProdStockTotal(generated.reduce((acc, v) => acc + v.stock, 0));
    showToast("3 sample variants generated (Default: 1 image, others: 2 images each)", "success");
  };

  const handleOpenAddVariant = () => {
    setEditingVariantId(null);
    setVarTitleEn("");
    setVarTitleBn("");
    setVarColor("");
    setVarSize("");
    setVarSku(`${prodSku}-${(prodVariants.length + 1).toString().padStart(2, "0")}`);
    setVarPriceBDT(prodPriceBDT);
    setVarSalePriceBDT("");
    setVarStock(10);
    setVarImages([""]);
    setVarIsDefault(prodVariants.length === 0);
    setIsAddingVariant(true);
  };

  const handleStartEditVariant = (v: ProductVariant) => {
    setEditingVariantId(v.id);
    setVarTitleEn(v.titleEn || "");
    setVarTitleBn(v.titleBn || "");
    setVarColor(v.attributes?.color || "");
    setVarSize(v.attributes?.size || "");
    setVarSku(v.sku || "");
    setVarPriceBDT(v.priceBDT || prodPriceBDT);
    setVarSalePriceBDT(v.salePriceBDT ? String(v.salePriceBDT) : "");
    setVarStock(v.stock || 5);
    const existingImages =
      v.images && v.images.length > 0
        ? [...v.images]
        : v.imageUrl
        ? [v.imageUrl]
        : [""];
    setVarImages(existingImages);
    setVarIsDefault(v.isDefault === true);
    setIsAddingVariant(true);
  };

  const handleSaveVariant = () => {
    if (!varTitleEn.trim()) {
      showToast("Please enter a variant title (e.g. Color or Size name)", "error");
      return;
    }

    const cleanVarImages = varImages.map((u) => u.trim()).filter(Boolean);
    const primaryImg = cleanVarImages[0] || prodImages[0] || "";

    if (editingVariantId) {
      const updated = prodVariants.map((v) => {
        if (v.id === editingVariantId) {
          return {
            ...v,
            sku: varSku.trim() || v.sku,
            titleEn: varTitleEn.trim(),
            titleBn: varTitleBn.trim() || varTitleEn.trim(),
            attributes: {
              ...v.attributes,
              color: varColor.trim() || undefined,
              size: varSize.trim() || undefined,
            },
            priceBDT: Number(varPriceBDT) || Number(prodPriceBDT),
            salePriceBDT: varSalePriceBDT ? Number(varSalePriceBDT) : undefined,
            stock: Number(varStock) || 0,
            imageUrl: primaryImg,
            images: cleanVarImages.length > 0 ? cleanVarImages : primaryImg ? [primaryImg] : [],
            isDefault: varIsDefault,
          };
        }
        return varIsDefault ? { ...v, isDefault: false } : v;
      });

      setProdVariants(updated);
      showToast("Variant updated successfully", "success");
    } else {
      const newVar: ProductVariant = {
        id: `var_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        productId: initialProduct ? initialProduct.id : "",
        sku: varSku.trim() || `${prodSku}-${(prodVariants.length + 1).toString().padStart(2, "0")}`,
        titleEn: varTitleEn.trim(),
        titleBn: varTitleBn.trim() || varTitleEn.trim(),
        attributes: {
          color: varColor.trim() || undefined,
          size: varSize.trim() || undefined,
        },
        priceBDT: Number(varPriceBDT) || Number(prodPriceBDT),
        salePriceBDT: varSalePriceBDT ? Number(varSalePriceBDT) : undefined,
        stock: Number(varStock) || 5,
        imageUrl: primaryImg,
        images: cleanVarImages.length > 0 ? cleanVarImages : primaryImg ? [primaryImg] : [],
        isDefault: varIsDefault || prodVariants.length === 0,
      };

      const updated = prodVariants.map((v) =>
        varIsDefault ? { ...v, isDefault: false } : v
      );
      setProdVariants([...updated, newVar]);
      showToast("Variant added successfully", "success");
    }

    setIsAddingVariant(false);
    setEditingVariantId(null);
  };

  const handleDeleteVariant = (variantId: string) => {
    const updated = prodVariants.filter((v) => v.id !== variantId);
    // If deleted variant was default, make first remaining default
    if (updated.length > 0 && !updated.some((v) => v.isDefault)) {
      updated[0].isDefault = true;
    }
    setProdVariants(updated);
    if (editingVariantId === variantId) {
      setEditingVariantId(null);
      setIsAddingVariant(false);
    }
    showToast("Variant removed", "info");
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prodNameEn.trim()) {
      showToast("Product name in English is required", "error");
      return;
    }

    if (!prodSku.trim()) {
      showToast("Product SKU is required", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const slug =
        initialProduct?.slug ||
        prodNameEn
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

      const validImages = prodImages.map((u) => normalizeImageUrl(u.trim())).filter(Boolean);

      if (validImages.length === 0) {
        validImages.push(
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
        );
      }

      const assignedProductId = initialProduct ? initialProduct.id : `prod_${Date.now()}`;
      const syncedVariants = prodVariants.map((v, i) => {
        const rawVImgs = v.images && v.images.length > 0 ? v.images : v.imageUrl ? [v.imageUrl] : [];
        const vImgs = rawVImgs.map((u) => normalizeImageUrl(u.trim())).filter(Boolean);
        return {
          ...v,
          productId: assignedProductId,
          images: vImgs.length > 0 ? vImgs : [validImages[0]],
          imageUrl: vImgs[0] || v.imageUrl || validImages[0],
          isDefault: v.isDefault ?? i === 0,
        };
      });

      // Ensure at least one variant is marked default if variants exist
      if (syncedVariants.length > 0 && !syncedVariants.some((v) => v.isDefault)) {
        syncedVariants[0].isDefault = true;
      }

      const finalStockTotal =
        syncedVariants.length > 0
          ? syncedVariants.reduce((sum, v) => sum + (v.stock || 0), 0)
          : Number(prodStockTotal);

      const parsedTags = prodTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const productPayload: Product = {
        id: assignedProductId,
        nameEn: prodNameEn.trim(),
        nameBn: prodNameBn.trim() || prodNameEn.trim(),
        slug,
        sku: prodSku.trim(),
        descriptionEn: prodDescEn,
        descriptionBn: prodDescBn,
        categoryId: prodCategoryId || categories[0]?.id || "",
        basePriceBDT: Number(prodPriceBDT),
        salePriceBDT: prodSalePriceBDT ? Number(prodSalePriceBDT) : undefined,
        stockTotal: finalStockTotal,
        lowStockThreshold: Number(prodLowStockThreshold),
        images: validImages,
        tags: parsedTags.length > 0 ? parsedTags : ["handloom", "new-arrival"],
        isPublished: prodIsPublished,
        isFeatured: prodIsFeatured,
        rating: initialProduct ? initialProduct.rating : 5.0,
        reviewCount: initialProduct ? initialProduct.reviewCount : 1,
        variants: syncedVariants,
        createdAt: initialProduct ? initialProduct.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await firestoreService.saveProduct(productPayload);

      showToast(
        isCreateMode
          ? language === "bn"
            ? "নতুন পণ্য সফলভাবে তৈরি হয়েছে"
            : "Product created successfully"
          : language === "bn"
          ? "পণ্য তথ্য আপডেট সম্পন্ন হয়েছে"
          : "Product updated successfully",
        "success"
      );

      navigate(getAdminPath("products"));
    } catch (err: any) {
      console.error("Save product error:", err);
      showToast(err.message || "Failed to save product", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const discountPercent =
    prodSalePriceBDT && Number(prodSalePriceBDT) < Number(prodPriceBDT)
      ? Math.round(
          ((Number(prodPriceBDT) - Number(prodSalePriceBDT)) / Number(prodPriceBDT)) * 100
        )
      : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-silk-200 dark:border-dark-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-silk-600 dark:text-silk-400 font-medium">
            <Link
              to={getAdminPath("products")}
              className="hover:text-gold-600 dark:hover:text-gold-400 transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Products Catalog</span>
            </Link>
            <span>/</span>
            <span className="text-silk-900 dark:text-silk-100 font-bold">
              {isCreateMode ? "Add New Product" : `Edit: ${initialProduct?.nameEn || "Product"}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
              {isCreateMode ? "Add New Handloom Product" : "Edit Product Details"}
            </h1>
            <Badge variant={isCreateMode ? "gold" : "info"} size="sm">
              {isCreateMode ? "New Entry" : "Editing"}
            </Badge>
          </div>
          <p className="text-xs text-silk-600 dark:text-silk-400">
            {isCreateMode
              ? "Create a luxury product listing with dynamic photo galleries for both default product and custom color variants."
              : "Update live pricing, dynamic multi-angle images, inventory stock, and color variants on this dedicated page."}
          </p>
        </div>

        {/* Action Buttons Top Bar */}
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(getAdminPath("products"))}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial"
          >
            Discard
          </Button>

          <Button
            type="button"
            variant="gold"
            size="sm"
            onClick={handleSaveProduct}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial font-bold"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>{isSubmitting ? "Saving..." : isCreateMode ? "Save & Publish" : "Update Product"}</span>
          </Button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <form onSubmit={handleSaveProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / MAIN COLUMN (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: General Product Information */}
          <div className="bg-white rounded-2xl border border-silk-200 p-5 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-silk-100 dark:border-dark-border">
              <h2 className="text-sm font-bold text-silk-950 dark:text-silk-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-gold-600" />
                <span>General Information</span>
              </h2>
              <span className="text-[11px] text-silk-500 font-mono">Bilingual (EN / BN)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Product Name (English) *"
                placeholder="e.g. Rajshahi Pure Mulberry Silk Saree"
                value={prodNameEn}
                onChange={(e) => setProdNameEn(e.target.value)}
                required
              />

              <Input
                label="Product Name (Bangla)"
                placeholder="e.g. রাজশাহী পিওর তুত সিল্ক শাড়ি"
                value={prodNameBn}
                onChange={(e) => setProdNameBn(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="SKU Identifier Code *"
                placeholder="e.g. SD-RAJ-SILK-001"
                value={prodSku}
                onChange={(e) => setProdSku(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-silk-800 dark:text-silk-200 mb-1">
                  Collection Category *
                </label>
                <select
                  value={prodCategoryId}
                  onChange={(e) => setProdCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-silk-300 bg-white dark:bg-dark-surface dark:border-dark-border dark:text-silk-100 font-medium focus:ring-1 focus:ring-gold-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn} ({c.nameBn})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-silk-800 dark:text-silk-200">
                Description (English)
              </label>
              <textarea
                rows={3}
                placeholder="Artisan handloom description highlighting fabric texture, weave origin, zari detailing..."
                value={prodDescEn}
                onChange={(e) => setProdDescEn(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-silk-300 bg-white dark:bg-dark-surface dark:border-dark-border dark:text-silk-100 focus:ring-1 focus:ring-gold-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-silk-800 dark:text-silk-200">
                Description (Bangla)
              </label>
              <textarea
                rows={2}
                placeholder="পোশাকের বুনন কৌশল, খাঁটি রেশম বা কাতান বৈশিষ্ট্য এবং যত্ন নেওয়ার নির্দেশিকা..."
                value={prodDescBn}
                onChange={(e) => setProdDescBn(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-silk-300 bg-white dark:bg-dark-surface dark:border-dark-border dark:text-silk-100 focus:ring-1 focus:ring-gold-500"
              />
            </div>
          </div>

          {/* Section 2: DYNAMIC Default Product Images Gallery */}
          <div className="bg-white rounded-2xl border border-silk-200 p-5 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-silk-100 dark:border-dark-border">
              <div>
                <h2 className="text-sm font-bold text-silk-950 dark:text-silk-100 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gold-600" />
                  <span>Default Product Images (Dynamic Gallery)</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-silk-100 text-silk-800 dark:bg-dark-elevated dark:text-silk-200 font-mono">
                    {prodImages.filter(Boolean).length} Photos
                  </span>
                </h2>
                <p className="text-[11px] text-silk-600 dark:text-silk-400 mt-0.5">
                  Dynamic image list for the default product. Add 1, 2, 3, or more photo URLs. First image is the primary storefront hero.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDriveGuideOpen(!isDriveGuideOpen)}
                  className="text-xs px-2.5 py-1.5 rounded-xl border border-silk-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gold-700 dark:text-gold-400 font-bold transition flex items-center gap-1 shrink-0 hover:border-gold-500"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Google Drive Guide</span>
                  {isDriveGuideOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <button
                  type="button"
                  onClick={fillSampleSareeImages}
                  className="text-xs px-3 py-1.5 rounded-xl border border-silk-300 dark:border-dark-border bg-silk-100 hover:bg-silk-200 dark:bg-dark-elevated dark:hover:bg-dark-border text-silk-900 dark:text-silk-100 font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs hover:border-gold-500"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                  <span>Fill 4 Sample Saree Photos</span>
                </button>

                <Button
                  type="button"
                  size="sm"
                  variant="gold"
                  onClick={handleAddProductImage}
                  className="text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add Image</span>
                </Button>
              </div>
            </div>

            {/* Google Drive Guide Banner */}
            {isDriveGuideOpen && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-bold">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                    GD
                  </span>
                  <span>How to use images uploaded to Google Drive:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-900 dark:text-amber-300 pl-1">
                  <li>In Google Drive, right-click the image &rarr; <strong>Share &rarr; Share</strong>.</li>
                  <li>Under <em>General access</em>, change from <strong>"Restricted"</strong> to <strong className="underline">"Anyone with the link"</strong> (Viewer).</li>
                  <li>Click <strong>"Copy link"</strong> and paste it directly into any image box below.</li>
                </ol>
                <p className="text-[10px] text-amber-700 dark:text-amber-400 italic">
                  SilkenDrift automatically converts Google Drive links to direct CDN streams (<code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">lh3.googleusercontent.com</code>) or you can click "Upload" to select photos directly from your device!
                </p>
              </div>
            )}

            {/* List of Dynamic Image URL Fields */}
            <div className="space-y-3">
              {prodImages.map((imgUrl, index) => {
                const isHero = index === 0;
                return (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-silk-50/70 border border-silk-200 dark:bg-dark-elevated/40 dark:border-dark-border flex flex-col sm:flex-row items-start sm:items-center gap-3 transition"
                  >
                    {/* Image Preview Box */}
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-silk-200 bg-white dark:border-dark-border dark:bg-dark-surface shrink-0 flex items-center justify-center">
                      {imgUrl.trim() ? (
                        <>
                          <img
                            src={normalizeImageUrl(imgUrl)}
                            alt={`Product image ${index + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center"
                            onError={(e) => {
                              const fallbacks = getGoogleDriveFallbackUrls(imgUrl);
                              const target = e.target as HTMLImageElement;
                              const currentSrc = target.src;
                              const nextIdx = fallbacks.indexOf(currentSrc) + 1;
                              if (nextIdx > 0 && nextIdx < fallbacks.length) {
                                target.src = fallbacks[nextIdx];
                              } else {
                                target.src =
                                  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=60";
                              }
                            }}
                          />
                          {isHero && (
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.2 text-[8px] font-bold rounded bg-silk-950/90 text-gold-300">
                              Hero
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="text-center text-silk-400 text-[10px]">
                          <ImageIcon className="w-5 h-5 mx-auto mb-0.5 opacity-40" />
                          <span>Slot #{index + 1}</span>
                        </div>
                      )}
                    </div>

                    {/* URL Input */}
                    <div className="flex-1 w-full space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-silk-900 dark:text-silk-100 flex items-center gap-1.5">
                          <span>Image #{index + 1}</span>
                          {isHero ? (
                            <span className="px-1.5 py-0.2 rounded bg-gold-100 text-gold-900 dark:bg-gold-950/60 dark:text-gold-300 text-[9px] font-extrabold uppercase">
                              Primary Hero Photo
                            </span>
                          ) : (
                            <span className="text-[10px] text-silk-500 font-normal">
                              Angle / Detail View
                            </span>
                          )}
                        </label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Paste Google Drive link or web image URL..."
                          value={imgUrl}
                          onChange={(e) => handleUpdateProductImage(index, e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-silk-300 bg-white dark:bg-dark-surface dark:border-dark-border dark:text-silk-100 font-mono focus:ring-1 focus:ring-gold-500"
                        />
                        <label className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-gold-300 bg-gold-50 hover:bg-gold-500 hover:text-silk-950 text-gold-900 dark:border-gold-800 dark:bg-gold-950/30 dark:text-gold-300 cursor-pointer flex items-center gap-1 shrink-0 transition shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const dataUrl = await readFileAsDataUrl(file);
                                handleUpdateProductImage(index, dataUrl);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {getImageProviderInfo(imgUrl).isGoogleDrive && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Google Drive link detected &amp; converted to direct image stream</span>
                        </p>
                      )}
                    </div>

                    {/* Position & Delete Buttons */}
                    <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveProductImage(index, index - 1)}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg border border-silk-200 hover:border-gold-500 hover:bg-gold-50 text-silk-600 dark:border-dark-border dark:text-silk-300 disabled:opacity-30 disabled:pointer-events-none transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveProductImage(index, index + 1)}
                        disabled={index === prodImages.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg border border-silk-200 hover:border-gold-500 hover:bg-gold-50 text-silk-600 dark:border-dark-border dark:text-silk-300 disabled:opacity-30 disabled:pointer-events-none transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveProductImage(index)}
                        title="Remove Image"
                        className="p-1.5 rounded-lg border border-silk-200 hover:border-rose-400 hover:bg-rose-50 text-rose-500 hover:text-rose-700 dark:border-dark-border dark:bg-dark-elevated dark:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleAddProductImage}
                className="w-full py-3 rounded-xl border border-dashed border-silk-300 dark:border-dark-border hover:border-gold-500 hover:bg-gold-50/40 text-silk-700 hover:text-silk-950 dark:text-silk-300 dark:hover:text-gold-400 dark:hover:bg-dark-elevated transition flex items-center justify-center gap-2 text-xs font-bold"
              >
                <Plus className="w-4 h-4 text-gold-600" />
                <span>+ Add Another Product Image URL</span>
              </button>
            </div>
          </div>

          {/* Section 3: DYNAMIC Product Variants & Multiple Images Manager */}
          <div className="bg-white rounded-2xl border border-silk-200 p-5 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-silk-100 dark:border-dark-border">
              <div>
                <h2 className="text-sm font-bold text-silk-950 dark:text-silk-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-gold-600" />
                  <span>Product Variants ({prodVariants.length})</span>
                </h2>
                <p className="text-[11px] text-silk-600 dark:text-silk-400 mt-0.5">
                  Each variant supports multiple photos (e.g. 1 photo for Crimson, 2 photos for Emerald). Mark default variant for instant pre-selection.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {prodVariants.length === 0 && (
                  <button
                    type="button"
                    onClick={handleAddSampleVariants}
                    className="text-xs px-3 py-1.5 rounded-xl border border-silk-300 dark:border-dark-border bg-silk-100 hover:bg-silk-200 dark:bg-dark-surface dark:hover:bg-dark-elevated text-silk-900 dark:text-silk-100 font-bold transition flex items-center gap-1.5 shadow-xs hover:border-gold-500"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                    <span>Generate Sample Color Variants</span>
                  </button>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant={isAddingVariant && !editingVariantId ? "secondary" : "gold"}
                  onClick={() => {
                    if (isAddingVariant) {
                      setIsAddingVariant(false);
                      setEditingVariantId(null);
                    } else {
                      handleOpenAddVariant();
                    }
                  }}
                  className="text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>{isAddingVariant && !editingVariantId ? "Close Form" : "Add Variant"}</span>
                </Button>
              </div>
            </div>

            {/* Configured Variants List */}
            {prodVariants.length > 0 ? (
              <div className="space-y-2.5">
                {prodVariants.map((v, idx) => {
                  const isBeingEdited = editingVariantId === v.id;
                  const vImages = v.images && v.images.length > 0 ? v.images : v.imageUrl ? [v.imageUrl] : [];
                  const isDef = v.isDefault === true;

                  return (
                    <div
                      key={v.id || idx}
                      className={`p-3.5 rounded-xl bg-white border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs dark:bg-dark-surface ${
                        isBeingEdited
                          ? "border-gold-500 ring-2 ring-gold-400/30 dark:border-gold-400"
                          : isDef
                          ? "border-gold-400/80 bg-gold-50/20 dark:border-gold-500/50"
                          : "border-silk-200 dark:border-dark-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Variant Primary Thumbnail */}
                        <div className="relative shrink-0">
                          {vImages[0] ? (
                            <img
                              src={normalizeImageUrl(vImages[0])}
                              alt={v.titleEn}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-lg object-cover border border-silk-200 dark:border-dark-border"
                              onError={(e) => {
                                const fallbacks = getGoogleDriveFallbackUrls(vImages[0]);
                                const target = e.target as HTMLImageElement;
                                const currentSrc = target.src;
                                const nextIdx = fallbacks.indexOf(currentSrc) + 1;
                                if (nextIdx > 0 && nextIdx < fallbacks.length) {
                                  target.src = fallbacks[nextIdx];
                                }
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gold-50 text-gold-700 flex items-center justify-center font-bold text-xs border border-gold-200">
                              #{idx + 1}
                            </div>
                          )}
                          {vImages.length > 1 && (
                            <span
                              className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-silk-950 text-gold-300 text-[8px] font-mono font-bold shadow border border-gold-500/40"
                              title={`${vImages.length} photos for this variant`}
                            >
                              +{vImages.length - 1}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-silk-950 dark:text-silk-100">
                              {v.titleEn}
                            </span>
                            <span className="text-[10px] text-silk-500 font-mono">
                              ({v.sku})
                            </span>
                            {isDef && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-gold-500 text-silk-950 font-bold uppercase flex items-center gap-1 shadow-xs">
                                <Star className="w-2.5 h-2.5 fill-silk-950" />
                                <span>Default Variant</span>
                              </span>
                            )}
                            {vImages.length > 0 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-silk-100 dark:bg-dark-elevated text-silk-700 dark:text-silk-300 font-medium">
                                {vImages.length} photo{vImages.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-silk-600 dark:text-silk-400">
                            {v.attributes?.color && (
                              <span className="px-2 py-0.5 rounded bg-silk-100 dark:bg-dark-elevated text-silk-800 dark:text-silk-300 font-medium border border-silk-200 dark:border-dark-border">
                                Color: {v.attributes.color}
                              </span>
                            )}
                            {v.attributes?.size && (
                              <span className="px-2 py-0.5 rounded bg-silk-100 dark:bg-dark-elevated text-silk-800 dark:text-silk-300 font-medium border border-silk-200 dark:border-dark-border">
                                Size: {v.attributes.size}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <span className="font-bold font-serif text-xs text-silk-900 dark:text-silk-100 block">
                            {formatPriceBDT(v.salePriceBDT || v.priceBDT, language)}
                          </span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                            Stock: {v.stock} pcs
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!isDef && (
                            <button
                              type="button"
                              onClick={() => handleSetVariantAsDefault(v.id)}
                              className="px-2 py-1 rounded-lg border border-silk-200 hover:border-gold-500 hover:bg-gold-50 text-[10px] font-bold text-silk-700 hover:text-silk-950 dark:border-dark-border dark:text-silk-300 dark:hover:bg-dark-elevated transition"
                              title="Set as default pre-selected variant"
                            >
                              Make Default
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleStartEditVariant(v)}
                            className={`p-1.5 rounded-lg border transition ${
                              isBeingEdited
                                ? "bg-gold-500 text-silk-950 border-gold-500 shadow-sm"
                                : "border-silk-200 bg-silk-50/70 hover:border-gold-500 hover:bg-gold-50 text-silk-700 hover:text-silk-950 dark:border-dark-border dark:bg-dark-elevated dark:text-silk-200 dark:hover:text-gold-300"
                            }`}
                            title="Edit Variant"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(v.id)}
                            className="p-1.5 rounded-lg border border-silk-200 bg-silk-50/70 hover:border-rose-400 hover:bg-rose-50 text-rose-500 hover:text-rose-700 dark:border-dark-border dark:bg-dark-elevated dark:text-rose-400 transition"
                            title="Delete Variant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-silk-300 dark:border-dark-border text-center space-y-2">
                <Boxes className="w-8 h-8 text-silk-400 mx-auto opacity-60" />
                <p className="text-xs text-silk-600 dark:text-silk-400 font-medium">
                  No variants added yet. This product currently acts as a single base SKU.
                </p>
                <p className="text-[11px] text-silk-500">
                  Click &ldquo;Add Variant&rdquo; to introduce color or size selections, or &ldquo;Generate Sample Color Variants&rdquo; for quick testing.
                </p>
              </div>
            )}

            {/* Inline Variant Creator / Editor Card with DYNAMIC MULTI-IMAGE URLS */}
            {isAddingVariant && (
              <div className="p-4 rounded-2xl bg-silk-50/80 border border-gold-400/70 dark:bg-dark-elevated/60 dark:border-gold-500/50 space-y-3 mt-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-silk-200 dark:border-dark-border">
                  <h4 className="font-bold text-xs text-silk-950 dark:text-silk-100 flex items-center gap-1.5">
                    {editingVariantId ? (
                      <Edit3 className="w-3.5 h-3.5 text-gold-600" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-gold-600" />
                    )}
                    <span>{editingVariantId ? "Edit Variant Details" : "New Variant Details"}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingVariant(false);
                      setEditingVariantId(null);
                    }}
                    className="text-[11px] text-silk-500 hover:text-silk-900 dark:hover:text-silk-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Variant Title (English) *"
                    placeholder="e.g. Royal Crimson & Gold"
                    value={varTitleEn}
                    onChange={(e) => setVarTitleEn(e.target.value)}
                    required
                  />
                  <Input
                    label="Variant Title (Bangla)"
                    placeholder="e.g. রয়্যাল লাল ও সোনালি"
                    value={varTitleBn}
                    onChange={(e) => setVarTitleBn(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Color (e.g. Crimson, Emerald)"
                    value={varColor}
                    onChange={(e) => setVarColor(e.target.value)}
                    placeholder="Crimson"
                  />
                  <Input
                    label="Size (e.g. Standard 6.3m, 40, 42)"
                    value={varSize}
                    onChange={(e) => setVarSize(e.target.value)}
                    placeholder="Standard 6.3m"
                  />
                  <Input
                    label="Variant SKU"
                    value={varSku}
                    onChange={(e) => setVarSku(e.target.value)}
                    placeholder={`${prodSku}-01`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    type="number"
                    label="Variant Price (BDT) *"
                    value={varPriceBDT}
                    onChange={(e) => setVarPriceBDT(Number(e.target.value))}
                    required
                  />
                  <Input
                    type="number"
                    label="Sale Price (BDT)"
                    placeholder="Optional discount"
                    value={varSalePriceBDT}
                    onChange={(e) => setVarSalePriceBDT(e.target.value)}
                  />
                  <Input
                    type="number"
                    label="Variant Stock (pcs) *"
                    value={varStock}
                    onChange={(e) => setVarStock(Number(e.target.value))}
                    required
                  />
                </div>

                {/* DYNAMIC VARIANT IMAGES SECTION */}
                <div className="p-3.5 rounded-xl bg-white border border-silk-200 dark:bg-dark-surface dark:border-dark-border space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-silk-100 dark:border-dark-border">
                    <div>
                      <span className="text-xs font-bold text-silk-900 dark:text-silk-100 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-gold-600" />
                        <span>Variant Photos ({varImages.filter(Boolean).length} URLs)</span>
                      </span>
                      <p className="text-[10px] text-silk-500">
                        Add 1, 2, or more photos for this variant. Shown when customer chooses this variant.
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddVarImage}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      <span>Add Photo</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {varImages.map((vUrl, vIdx) => (
                      <div key={vIdx} className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-silk-200 bg-silk-50 dark:border-dark-border dark:bg-dark-elevated shrink-0 flex items-center justify-center">
                          {vUrl.trim() ? (
                            <img
                              src={normalizeImageUrl(vUrl)}
                              alt={`Variant img ${vIdx + 1}`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const fallbacks = getGoogleDriveFallbackUrls(vUrl);
                                const target = e.target as HTMLImageElement;
                                const currentSrc = target.src;
                                const nextIdx = fallbacks.indexOf(currentSrc) + 1;
                                if (nextIdx > 0 && nextIdx < fallbacks.length) {
                                  target.src = fallbacks[nextIdx];
                                } else {
                                  target.src =
                                    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=60";
                                }
                              }}
                            />
                          ) : (
                            <span className="text-[9px] text-silk-400 font-bold">#{vIdx + 1}</span>
                          )}
                        </div>

                        <div className="flex-1 flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder={`Variant Photo #${vIdx + 1} (Google Drive link or URL)`}
                            value={vUrl}
                            onChange={(e) => handleUpdateVarImage(vIdx, e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-silk-300 bg-white dark:bg-dark-surface dark:border-dark-border dark:text-silk-100 font-mono focus:ring-1 focus:ring-gold-500"
                          />
                          <label className="px-2 py-1 text-[11px] font-bold rounded-lg border border-gold-300 bg-gold-50 hover:bg-gold-500 hover:text-silk-950 text-gold-900 dark:border-gold-800 dark:bg-gold-950/30 dark:text-gold-300 cursor-pointer flex items-center gap-1 shrink-0 transition">
                            <Upload className="w-3 h-3" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const dataUrl = await readFileAsDataUrl(file);
                                  handleUpdateVarImage(vIdx, dataUrl);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {varImages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVarImage(vIdx)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg dark:hover:bg-rose-950/30 transition"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Default Variant Checkbox */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-silk-800 dark:text-silk-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={varIsDefault}
                      onChange={(e) => setVarIsDefault(e.target.checked)}
                      className="rounded border-silk-300 text-gold-600 focus:ring-gold-500"
                    />
                    <span>Set as Default Variant (Pre-selected on storefront product page)</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-silk-200 dark:border-dark-border">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAddingVariant(false);
                      setEditingVariantId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="gold"
                    onClick={handleSaveVariant}
                    className="font-bold"
                  >
                    {editingVariantId ? "Update Variant" : "Save Variant"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT / SIDEBAR COLUMN (1 Col) */}
        <div className="space-y-6">
          {/* Card 1: Publish & Visibility Settings */}
          <div className="bg-white rounded-2xl border border-silk-200 p-5 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-4">
            <h2 className="text-sm font-bold text-silk-950 dark:text-silk-100 pb-3 border-b border-silk-100 dark:border-dark-border flex items-center gap-2">
              <Eye className="w-4 h-4 text-gold-600" />
              <span>Visibility & Publishing</span>
            </h2>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-silk-200 hover:border-silk-300 dark:border-dark-border dark:hover:border-silk-700 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={prodIsPublished}
                  onChange={(e) => setProdIsPublished(e.target.checked)}
                  className="mt-0.5 rounded border-silk-300 text-gold-600 focus:ring-gold-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-silk-900 dark:text-silk-100 block">
                    Publish on Live Storefront
                  </span>
                  <span className="text-[11px] text-silk-500 block">
                    Product appears in shop catalog, search, and category collections
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-silk-200 hover:border-silk-300 dark:border-dark-border dark:hover:border-silk-700 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={prodIsFeatured}
                  onChange={(e) => setProdIsFeatured(e.target.checked)}
                  className="mt-0.5 rounded border-silk-300 text-gold-600 focus:ring-gold-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-silk-900 dark:text-silk-100 block">
                    Feature on Homepage
                  </span>
                  <span className="text-[11px] text-silk-500 block">
                    Showcases product in the Featured Highlights and Curated Carousel
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="gold"
                size="md"
                className="w-full font-bold shadow-md"
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4 mr-2" />
                <span>{isSubmitting ? "Saving..." : isCreateMode ? "Save & Publish" : "Update Product"}</span>
              </Button>
            </div>
          </div>

          {/* Card 2: Pricing & Inventory Overview */}
          <div className="bg-white rounded-2xl border border-silk-200 p-5 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-4">
            <h2 className="text-sm font-bold text-silk-950 dark:text-silk-100 pb-3 border-b border-silk-100 dark:border-dark-border flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gold-600" />
              <span>Pricing & Inventory</span>
            </h2>

            <div className="space-y-3">
              <Input
                type="number"
                label="Base Price (BDT) *"
                value={prodPriceBDT}
                onChange={(e) => setProdPriceBDT(Number(e.target.value))}
                required
              />

              <div>
                <Input
                  type="number"
                  label="Offer / Sale Price (BDT)"
                  placeholder="Optional discount price"
                  value={prodSalePriceBDT}
                  onChange={(e) => setProdSalePriceBDT(e.target.value)}
                />
                {discountPercent !== null && (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
                    <span>Discount applied: {discountPercent}% OFF</span>
                  </div>
                )}
              </div>

              <div>
                <Input
                  type="number"
                  label={
                    prodVariants.length > 0
                      ? "Total Stock (Auto-calculated from variants)"
                      : "Total Stock Quantity *"
                  }
                  value={
                    prodVariants.length > 0
                      ? prodVariants.reduce((sum, v) => sum + (v.stock || 0), 0)
                      : prodStockTotal
                  }
                  onChange={(e) => setProdStockTotal(Number(e.target.value))}
                  disabled={prodVariants.length > 0}
                  required
                />
                {prodVariants.length > 0 && (
                  <p className="text-[10px] text-silk-500 mt-1">
                    Synchronized from sum of {prodVariants.length} variants (
                    {prodVariants.reduce((sum, v) => sum + (v.stock || 0), 0)} pcs).
                  </p>
                )}
              </div>

              <Input
                type="number"
                label="Low Stock Alert Threshold"
                value={prodLowStockThreshold}
                onChange={(e) => setProdLowStockThreshold(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Card 3: Discovery Tags & Badges */}
          <div className="bg-white rounded-2xl border border-silk-200 p-5 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-4">
            <h2 className="text-sm font-bold text-silk-950 dark:text-silk-100 pb-3 border-b border-silk-100 dark:border-dark-border flex items-center gap-2">
              <Tag className="w-4 h-4 text-gold-600" />
              <span>Catalog Tags & Filter Keys</span>
            </h2>

            <div className="space-y-2">
              <Input
                label="Search Tags (comma-separated)"
                placeholder="handloom, saree, silk, new-arrival"
                value={prodTags}
                onChange={(e) => setProdTags(e.target.value)}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["new-arrival", "handloom", "mulberry-silk", "festive", "bridal", "muslin"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      const tagsArray = prodTags.split(",").map((s) => s.trim()).filter(Boolean);
                      if (!tagsArray.includes(t)) {
                        setProdTags([...tagsArray, t].join(", "));
                      }
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-silk-100 hover:bg-gold-100 dark:bg-dark-elevated dark:hover:bg-dark-border text-silk-800 dark:text-silk-200 font-medium transition"
                  >
                    +{t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
