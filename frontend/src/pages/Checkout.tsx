import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import * as orderService from "../services/orderService";
import Button from "../components/ui/Button";

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 50;
const FLAT_SHIPPING_FEE = 5.99;

interface FormState {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

const initialForm: FormState = {
  fullName: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  phone: "",
};

const Checkout = () => {
  const { cart, clearCartItems } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(initialForm);
  const [isPlacing, setIsPlacing] = useState(false);

  const items = cart?.items || [];

  // If someone lands here with an empty cart, send them back
  useEffect(() => {
    if (cart && items.length === 0) {
      navigate("/cart");
    }
  }, [cart, items.length, navigate]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacing(true);

    try {
      await orderService.createOrder({
        orderItems: items.map((item) => ({
          product: item.product._id,
          name: item.product.name,
          image: item.product.images[0] || "",
          price: item.product.price,
          quantity: item.quantity,
        })),
        shippingAddress: form,
        subtotal,
        tax,
        shipping,
        totalPrice: total,
      });

      await clearCartItems();
      toast.success("Order placed successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-8">
        Checkout
      </h1>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Shipping Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 space-y-4">
            <h2 className="font-display font-semibold text-lg text-ink-900">
              Shipping Details
            </h2>

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-ink-700 mb-1.5"
              >
                Full Name
              </label>
              <input
                id="fullName"
                required
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-ink-700 mb-1.5"
              >
                Street Address
              </label>
              <input
                id="address"
                required
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-ink-700 mb-1.5"
                >
                  City
                </label>
                <input
                  id="city"
                  required
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium text-ink-700 mb-1.5"
                >
                  Postal Code
                </label>
                <input
                  id="postalCode"
                  required
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-ink-700 mb-1.5"
                >
                  Country
                </label>
                <input
                  id="country"
                  required
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-ink-700 mb-1.5"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  required
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isPlacing}
            className="w-full lg:hidden"
          >
            Place Order — ${total.toFixed(2)}
          </Button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 sticky top-24">
            <h2 className="font-display font-semibold text-lg text-ink-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.product._id}
                  className="flex justify-between text-sm"
                >
                  <span className="text-ink-500 truncate pr-2">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="text-ink-900 font-medium whitespace-nowrap">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
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
                <span>Tax</span>
                <span className="text-ink-900 font-medium">
                  ${tax.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-ink-900 text-base">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              size="lg"
              isLoading={isPlacing}
              onClick={handleSubmit}
              className="w-full mt-6 hidden lg:flex"
            >
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
