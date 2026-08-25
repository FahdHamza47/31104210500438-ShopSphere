import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import type { Cart } from "../types";
import * as cartService from "../services/cartService";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCartItems: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  // Whenever the logged-in user changes (login/logout), refresh the cart
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart(null); // no user = no cart to show
    }
  }, [user]);

  const refreshCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.fetchCart();
      setCart(data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number) => {
    try {
      const updatedCart = await cartService.addItemToCart(productId, quantity);
      setCart(updatedCart);
      toast.success("Added to cart!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const updatedCart = await cartService.updateCartItemQty(
        productId,
        quantity,
      );
      setCart(updatedCart);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update quantity");
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const updatedCart = await cartService.removeItemFromCart(productId);
      setCart(updatedCart);
      toast.success("Item removed");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const clearCartItems = async () => {
    try {
      await cartService.clearCart();
      setCart((prev) => (prev ? { ...prev, items: [] } : prev));
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  };

  // Total number of individual items (sum of quantities), shown as a badge on the cart icon
  const itemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCartItems,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
