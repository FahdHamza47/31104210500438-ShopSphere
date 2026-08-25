import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, PackageX } from "lucide-react";
import toast from "react-hot-toast";
import type { Product } from "../../types";
import * as productService from "../../services/productService";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ProductForm, {
  type ProductFormValues,
} from "../../components/product/ProductForm";
import EmptyState from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { getImageUrl } from "../../utils/getImageUrl";

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // limit=100 keeps this simple for the admin table; a production app might paginate here too
      const data = await productService.getProducts({ limit: 100 });
      setProducts(data.products);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreateForm = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const buildFormData = (
    values: ProductFormValues,
    imageFiles: File[],
  ): FormData => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("price", values.price);
    formData.append("category", values.category);
    formData.append("brand", values.brand);
    formData.append("stock", values.stock);
    imageFiles.forEach((file) => formData.append("images", file));
    return formData;
  };

  const handleFormSubmit = async (
    values: ProductFormValues,
    imageFiles: File[],
  ) => {
    const formData = buildFormData(values, imageFiles);

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, formData);
        toast.success("Product updated");
      } else {
        await productService.createProduct(formData);
        toast.success("Product created");
      }
      setIsFormOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await productService.deleteProduct(deleteTarget._id);
      toast.success("Product deleted");
      setDeleteTarget(null);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg font-semibold text-ink-900">
          Products
        </h2>
        <Button onClick={openCreateForm}>
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={PackageX}
            title="No products yet"
            description="Create your first product to start populating the shop."
            action={<Button onClick={openCreateForm}>Add Product</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-ink-500">
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium">Stock</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const thumb = getImageUrl(product.images[0], "No+Image");

                  return (
                    <tr
                      key={product._id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={thumb}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-gray-50"
                          />
                          <span className="font-medium text-ink-900 truncate max-w-[200px]">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-ink-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-3 text-ink-900 font-medium">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.stock === 0
                              ? "bg-red-50 text-red-600"
                              : product.stock < 10
                                ? "bg-amber-50 text-amber-600"
                                : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {product.stock} in stock
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditForm(product)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-ink-500"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProduct ? "Edit Product" : "Add Product"}
      >
        <ProductForm
          initialProduct={editingProduct || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminProducts;
