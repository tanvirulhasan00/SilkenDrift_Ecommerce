import AdminProductEditorPage, { clientLoader } from "./admin.product.edit";

export { clientLoader };

export default function AdminProductNewPage() {
  return <AdminProductEditorPage isNew={true} />;
}
