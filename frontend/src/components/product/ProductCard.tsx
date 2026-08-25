import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import type { Product } from "../../types";
import { useCart } from "../../context/CartContext";
import Button from "../ui/Button";
import { getImageUrl } from "../../utils/getImageUrl";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    await addToCart(product._id, 1);
    setIsAdding(false);
  };

  const imageUrl = getImageUrl(product.images[0]);

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-soft hover:shadow-card transition-shadow duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-medium bg-white/90 backdrop-blur-sm text-ink-700 rounded-full border border-gray-100">
          {product.category}
        </span>
        {product.stock === 0 && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm font-semibold">
            Out of Stock
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-ink-900 truncate">{product.name}</h3>

        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs text-ink-500">
            {product.rating.toFixed(1)} ({product.numReviews})
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="font-display font-semibold text-lg text-ink-900">
            ${product.price.toFixed(2)}
          </span>
          <Button
            size="sm"
            isLoading={isAdding}
            disabled={product.stock === 0}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
