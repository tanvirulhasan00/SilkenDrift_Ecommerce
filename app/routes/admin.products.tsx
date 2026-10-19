import React, { useState } from "react";
import { useLoaderData, Link } from "react-router";
import { firestoreService } from "~/services/firebase/firestoreService";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { formatPriceBDT } from "~/lib/formatters";
import { getAdminPath } from "~/config/adminConfig";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { Modal } from "~/components/ui/Modal";
import { Input } from "~/components/ui/Input";
import { useToast } from "~/components/feedback/ToastContext";
import { Product, Category, Brand } from "~/types";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Layers,
  Package,
  FolderTree,
} from "lucide-react";

export async function clientLoader() {
  const [products, categories] = await Promise.all([
    firestoreService.getProducts(),
    firestoreService.getCategories(),
  ]);
  const brands = mockRepository.getBrands();
  return { products, categories, brands };
}

export default function AdminProductsPage() {
  const {
    products: initialProducts,
    categories: initialCategories,
  } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"products" | "categories">("products");

  // State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Category Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Category Form Fields
  const [catNameEn, setCatNameEn] = useState("");
  const [catNameBn, setCatNameBn] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDescEn, setCatDescEn] = useState("");
  const [catDescBn, setCatDescBn] = useState("");
  const [catImageUrl, setCatImageUrl] = useState("");
  const [catSortOrder, setCatSortOrder] = useState<number>(1);
  const [catIsActive, setCatIsActive] = useState(true);
  const [catFeaturedOnHome, setCatFeaturedOnHome] = useState(true);



  const handleDeleteProduct = async (id: string) => {
    if (confirm(language === "bn" ? "আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?" : "Are you sure you want to delete this product?")) {
      await firestoreService.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      showToast("Product deleted successfully", "info");
    }
  };

  // ==========================================
  // CATEGORY HANDLERS
  // ==========================================
  const openCreateCategoryModal = () => {
    setEditingCategory(null);
    setCatNameEn("");
    setCatNameBn("");
    setCatSlug("");
    setCatDescEn("");
    setCatDescBn("");
    setCatImageUrl("https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80");
    setCatSortOrder(categories.length + 1);
    setCatIsActive(true);
    setCatFeaturedOnHome(true);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (c: Category) => {
    setEditingCategory(c);
    setCatNameEn(c.nameEn);
    setCatNameBn(c.nameBn);
    setCatSlug(c.slug);
    setCatDescEn(c.descriptionEn || "");
    setCatDescBn(c.descriptionBn || "");
    setCatImageUrl(c.imageUrl || "");
    setCatSortOrder(c.sortOrder || 1);
    setCatIsActive(c.isActive !== false);
    setCatFeaturedOnHome(c.featuredOnHome === true);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = catSlug.trim() || catNameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const categoryPayload: Category = {
      id: editingCategory ? editingCategory.id : `cat_${Date.now()}`,
      nameEn: catNameEn.trim(),
      nameBn: catNameBn.trim() || catNameEn.trim(),
      slug,
      descriptionEn: catDescEn,
      descriptionBn: catDescBn,
      imageUrl: catImageUrl,
      sortOrder: Number(catSortOrder),
      isActive: catIsActive,
      featuredOnHome: catFeaturedOnHome,
    };

    await firestoreService.saveCategory(categoryPayload);

    if (editingCategory) {
      setCategories(categories.map((c) => (c.id === categoryPayload.id ? categoryPayload : c)));
      showToast(language === "bn" ? "ক্যাটাগরি আপডেট সম্পন্ন হয়েছে" : "Category updated successfully", "success");
    } else {
      setCategories([...categories, categoryPayload]);
      showToast(language === "bn" ? "নতুন ক্যাটাগরি তৈরি হয়েছে" : "New category created successfully", "success");
    }

    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = async (id: string) => {
    const productsInCat = products.filter((p) => p.categoryId === id);
    if (productsInCat.length > 0) {
      if (
        !confirm(
          `This category has ${productsInCat.length} products associated with it. Are you sure you want to delete it?`
        )
      ) {
        return;
      }
    } else if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    await firestoreService.deleteCategory(id);
    setCategories(categories.filter((c) => c.id !== id));
    showToast("Category deleted successfully", "info");
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategoryFilter === "all" || p.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
            Catalog & Inventory Management
          </h1>
          <p className="text-xs text-silk-700 dark:text-silk-300 font-medium mt-0.5">
            Full CRUD operations for silk sarees, panjabis, apparel, and collection categories
          </p>
        </div>

        {activeTab === "products" ? (
          <Link to={getAdminPath("products/new")}>
            <Button size="sm" variant="gold">
              <Plus className="w-4 h-4 mr-1" />
              <span>Add New Product</span>
            </Button>
          </Link>
        ) : (
          <Button size="sm" variant="gold" onClick={openCreateCategoryModal}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Add New Category</span>
          </Button>
        )}
      </div>

      {/* Tabs Switcher: Products vs Categories */}
      <div className="flex items-center gap-2 border-b border-silk-200 dark:border-dark-border">
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 ${
            activeTab === "products"
              ? "border-gold-500 text-silk-950 dark:text-gold-300 bg-silk-50/50 dark:bg-dark-elevated"
              : "border-transparent text-silk-600 dark:text-silk-400 hover:text-silk-950 dark:hover:text-white"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 ${
            activeTab === "categories"
              ? "border-gold-500 text-silk-950 dark:text-gold-300 bg-silk-50/50 dark:bg-dark-elevated"
              : "border-transparent text-silk-600 dark:text-silk-400 hover:text-silk-950 dark:hover:text-white"
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Categories ({categories.length})</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: PRODUCTS TABLE & CRUD              */}
      {/* ========================================== */}
      {activeTab === "products" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-silk-300 bg-white dark:bg-dark-surface dark:border-dark-border dark:text-silk-100"
              />
              <Search className="w-4 h-4 text-silk-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-silk-600 dark:text-silk-400 font-medium">Category:</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-silk-300 bg-white dark:bg-dark-surface dark:border-dark-border dark:text-silk-100 font-medium"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-silk-200 overflow-hidden shadow-card dark:bg-dark-surface dark:border-dark-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-silk-100/90 border-b border-silk-200 dark:bg-dark-elevated dark:border-dark-border text-silk-900 dark:text-silk-200 uppercase text-[10px] font-extrabold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Product & Image</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price (BDT)</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions (CRUD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-silk-100 dark:divide-dark-border">
                  {filteredProducts.map((p) => {
                    const cat = categories.find((c) => c.id === p.categoryId);
                    return (
                      <tr key={p.id} className="hover:bg-silk-50/50 dark:hover:bg-dark-elevated/40 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={p.images[0]}
                                alt={p.nameEn}
                                className="w-12 h-12 rounded-lg object-cover border border-silk-200 dark:border-dark-border"
                              />
                              {p.images.length > 1 && (
                                <span
                                  className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-silk-950 text-gold-300 text-[9px] font-mono font-bold shadow border border-gold-500/40"
                                  title={`${p.images.length} photos in gallery`}
                                >
                                  +{p.images.length - 1}
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-silk-950 dark:text-silk-100 block">
                                {p.nameEn}
                              </span>
                              <span className="text-[11px] text-silk-600 dark:text-silk-400 font-medium">
                                {p.nameBn}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-semibold text-silk-700 dark:text-silk-300">
                          <div>{p.sku}</div>
                          {p.variants && p.variants.length > 0 && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-silk-100 dark:bg-dark-elevated text-silk-900 dark:text-silk-100 border border-silk-300 dark:border-dark-border text-[10px] font-sans font-bold shadow-xs">
                              <Layers className="w-2.5 h-2.5 text-gold-600 dark:text-gold-400" />
                              <span>{p.variants.length} variant{p.variants.length > 1 ? "s" : ""}</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-silk-700 dark:text-silk-300">
                          <span className="px-2 py-0.5 rounded-full bg-silk-100 dark:bg-dark-elevated text-[11px] font-medium border border-silk-200 dark:border-dark-border">
                            {cat?.nameEn || "Silk"}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-bold font-serif text-silk-950 dark:text-silk-100">
                          {formatPriceBDT(p.salePriceBDT || p.basePriceBDT, language)}
                          {p.salePriceBDT && (
                            <span className="block text-[10px] text-silk-400 line-through">
                              {formatPriceBDT(p.basePriceBDT, language)}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              p.stockTotal <= (p.lowStockThreshold || 5)
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            }`}
                          >
                            {p.stockTotal} pcs
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {p.isPublished !== false ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Live
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-silk-200 text-silk-700 text-[10px] font-bold">
                                Draft
                              </span>
                            )}
                            {p.isFeatured && (
                              <span className="px-1.5 py-0.5 rounded bg-gold-100 text-gold-900 text-[9px] font-bold">
                                Featured
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={getAdminPath(`products/${p.id}/edit`)}
                              className="p-1.5 rounded-lg border border-silk-200 hover:border-gold-500 hover:bg-gold-50 text-silk-700 hover:text-silk-950 dark:border-dark-border dark:text-silk-300 dark:hover:bg-dark-elevated transition"
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg border border-silk-200 hover:border-rose-400 hover:bg-rose-50 text-silk-400 hover:text-rose-600 dark:border-dark-border dark:hover:bg-rose-950/30 transition"
                              title="Delete Product"
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
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: CATEGORIES TABLE & CRUD            */}
      {/* ========================================== */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => {
              const productCount = products.filter((p) => p.categoryId === c.id).length;
              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-silk-200 p-5 shadow-card dark:bg-dark-surface dark:border-dark-border flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {c.imageUrl ? (
                          <img
                            src={c.imageUrl}
                            alt={c.nameEn}
                            className="w-10 h-10 rounded-xl object-cover border border-silk-200 dark:border-dark-border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center font-bold">
                            {c.nameEn.slice(0, 1)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-sm text-silk-950 dark:text-silk-50">
                            {c.nameEn}
                          </h3>
                          <span className="text-[11px] font-medium text-silk-600 dark:text-silk-400">
                            {c.nameBn}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {c.isActive ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-silk-600 dark:text-silk-400 line-clamp-2">
                      {c.descriptionEn || "Artisan collection of handwoven garments."}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-silk-500 pt-2 border-t border-silk-100 dark:border-dark-border font-medium">
                      <span>Slug: <code className="font-mono bg-silk-50 dark:bg-dark-elevated px-1 py-0.5 rounded">/{c.slug}</code></span>
                      <span className="font-bold text-silk-800 dark:text-silk-200">{productCount} Products</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-silk-100 dark:border-dark-border">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditCategoryModal(c)}
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      onClick={() => handleDeleteCategory(c.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* ========================================== */}
      {/* MODAL: CREATE / EDIT CATEGORY              */}
      {/* ========================================== */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Create New Collection Category"}
        maxWidth="md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <Input
            label="Category Name (English)"
            placeholder="e.g. Dhakai Jamdani Sarees"
            value={catNameEn}
            onChange={(e) => {
              setCatNameEn(e.target.value);
              if (!editingCategory) {
                setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
              }
            }}
            required
          />

          <Input
            label="Category Name (Bangla)"
            placeholder="e.g. ঢাকাই জামদানি শাড়ি"
            value={catNameBn}
            onChange={(e) => setCatNameBn(e.target.value)}
            required
          />

          <Input
            label="URL Slug"
            placeholder="e.g. dhakai-jamdani"
            value={catSlug}
            onChange={(e) => setCatSlug(e.target.value)}
            required
          />

          <Input
            label="Cover Image URL"
            placeholder="https://images.unsplash.com/..."
            value={catImageUrl}
            onChange={(e) => setCatImageUrl(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Sort Order"
              value={catSortOrder}
              onChange={(e) => setCatSortOrder(Number(e.target.value))}
            />

            <div className="pt-6 flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={catIsActive}
                  onChange={(e) => setCatIsActive(e.target.checked)}
                  className="rounded border-silk-300 text-gold-600 focus:ring-gold-500"
                />
                <span>Active</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={catFeaturedOnHome}
                  onChange={(e) => setCatFeaturedOnHome(e.target.checked)}
                  className="rounded border-silk-300 text-gold-600 focus:ring-gold-500"
                />
                <span>Show on Home</span>
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-silk-800 dark:text-silk-200">
              Description (English)
            </label>
            <textarea
              rows={2}
              value={catDescEn}
              onChange={(e) => setCatDescEn(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-silk-300 bg-white dark:bg-dark-surface dark:border-dark-border dark:text-silk-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-silk-100 dark:border-dark-border">
            <Button type="button" variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              {editingCategory ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
