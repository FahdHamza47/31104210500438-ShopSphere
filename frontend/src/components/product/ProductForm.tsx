import { useState, useEffect, type FormEvent } from "react";
import { Upload, X } from "lucide-react";
import type { Product } from "../../types";
import Button from "../ui/Button";
import { getImageUrl } from "../../utils/getImageUrl";

export interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  category: string;
  brand: string;
  stock: string;
}

interface ProductFormProps {
  initialProduct?: Product; // if provided, we're editing
  onSubmit: (values: ProductFormValues, imageFiles: File[]) => Promise<void>;
  onCancel: () => void;
}

const emptyValues: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  category: "",
  brand: "",
  stock: "",
};

const ProductForm = ({
  initialProduct,
  onSubmit,
  onCancel,
}: ProductFormProps) => {
  const [values, setValues] = useState<ProductFormValues>(emptyValues);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill the form when editing an existing product
  useEffect(() => {
    if (initialProduct) {
      setValues({
        name: initialProduct.name,
        description: initialProduct.description,
        price: String(initialProduct.price),
        category: initialProduct.category,
        brand: initialProduct.brand,
        stock: String(initialProduct.stock),
      });
      setPreviews(initialProduct.images.map((img) => getImageUrl(img)));
    }
  }, [initialProduct]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    // Only remove from imageFiles if it's a newly-added file (not an existing product image)
    const existingCount = initialProduct?.images.length || 0;
    if (index >= existingCount) {
      setImageFiles((prev) =>
        prev.filter((_, i) => i !== index - existingCount),
      );
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values, imageFiles);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1.5">
          Product Name
        </label>
        <input
          required
          name="name"
          value={values.name}
          onChange={handleChange}
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1.5">
          Description
        </label>
        <textarea
          required
          name="description"
          value={values.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">
            Price ($)
          </label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            name="price"
            value={values.price}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">
            Stock
          </label>
          <input
            required
            type="number"
            min="0"
            name="stock"
            value={values.stock}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">
            Category
          </label>
          <input
            required
            name="category"
            value={values.category}
            onChange={handleChange}
            placeholder="e.g. Electronics"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">
            Brand
          </label>
          <input
            name="brand"
            value={values.brand}
            onChange={handleChange}
            placeholder="e.g. Generic"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1.5">
          Images
        </label>
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-6 cursor-pointer hover:border-brand-500 transition-colors">
          <Upload className="w-4 h-4 text-ink-500" />
          <span className="text-sm text-ink-500">
            Click to upload images (up to 5)
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {previews.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative w-16 h-16">
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialProduct ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
