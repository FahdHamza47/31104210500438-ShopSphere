import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { getImageUrl } from "../utils/getImageUrl";

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 50;
const FLAT_SHIPPING_FEE = 5.99;

const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCartItems } =
    useCart();
  const navigate = useNavigate();

  const items = cart?.items || [];

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : FLAT_SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="text-center py-24 text-ink-500">Loading your cart...</div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Looks like you haven't added anything yet. Start exploring our products."
        action={
          <Link to="/">
            <Button>Continue Shopping</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-900">
          Your Cart
        </h1>
        <button
          onClick={clearCartItems}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const imageUrl = getImageUrl(item.product.images[0], "No+Image");

            return (
              <div
                key={item.product._id}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-soft"
              >
                <img
                  src={imageUrl}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-xl object-cover bg-gray-50"
                />

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.product._id}`}
                    className="font-medium text-ink-900 hover:text-brand-500 truncate block"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-ink-500 mt-1">
                    ${item.product.price.toFixed(2)} each
                  </p>
                </div>

                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() =>
                      updateQuantity(
                        item.product._id,
                        Math.max(1, item.quantity - 1),
                      )
                    }
                    className="p-2 hover:bg-gray-50 rounded-l-lg"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    aria-label="Increase quantity"
                    onClick={() =>
                      updateQuantity(item.product._id, item.quantity + 1)
                    }
                    className="p-2 hover:bg-gray-50 rounded-r-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="w-20 text-right font-semibold text-ink-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>

                <button
                  aria-label="Remove item"
                  onClick={() => removeFromCart(item.product._id)}
                  className="p-2 text-ink-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 sticky top-24">
            <h2 className="font-display font-semibold text-lg text-ink-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-ink-500">
                <span>Subtotal</span>
                <span className="text-ink-900 font-medium">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-ink-500">
                <span>Shipping</span>
                <span className="text-ink-900 font-medium">
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-ink-500">
                <span>Estimated Tax</span>
                <span className="text-ink-900 font-medium">
                  ${tax.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-ink-900 text-base">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {subtotal < FREE_SHIPPING_THRESHOLD && (
              <p className="text-xs text-ink-500 mt-3">
                Add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for
                free shipping.
              </p>
            )}

            <Button
              className="w-full mt-6"
              size="lg"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
