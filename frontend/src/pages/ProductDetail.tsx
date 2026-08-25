import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import type { Product } from "../types";
import * as productService from "../services/productService";
import { useCart } from "../context/CartContext";
import Button from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { getImageUrl } from "../utils/getImageUrl";
import ReviewSection from "../components/reviews/ReviewSection";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setNotFound(false);

    productService
      .getProductById(id)
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    await addToCart(product._id, quantity);
    setIsAdding(false);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 gap-12">
        <Skeleton className="w-full aspect-square" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="text-center py-24">
        <h2 className="font-display text-2xl font-semibold text-ink-900">
          Product not found
        </h2>
        <p className="text-ink-500 mt-2">This product may have been removed.</p>
        <Link to="/" className="inline-block mt-6">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Button>
        </Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(product.images[0]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-gray-50 aspect-square">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div>
          <span className="inline-block px-3 py-1 text-xs font-medium bg-brand-50 text-brand-600 rounded-full mb-3">
            {product.category}
          </span>

          <h1 className="font-display text-3xl font-bold text-ink-900">
            {product.name}
          </h1>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-ink-900">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-ink-500">
              ({product.numReviews} reviews)
            </span>
            <span className="text-gray-300">•</span>
            <span
              className={`text-sm font-medium ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <p className="text-3xl font-display font-bold text-ink-900 mt-6">
            ${product.price.toFixed(2)}
          </p>

          <p className="text-ink-500 mt-6 leading-relaxed">
            {product.description}
          </p>

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mt-8">
              <div className="flex items-center border border-gray-200 rounded-xl">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 hover:bg-gray-50 rounded-l-xl"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  className="p-3 hover:bg-gray-50 rounded-r-xl"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                size="lg"
                isLoading={isAdding}
                onClick={handleAddToCart}
                className="flex-1"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>

      <ReviewSection productId={product._id} />
    </div>
  );
};

export default ProductDetail;
