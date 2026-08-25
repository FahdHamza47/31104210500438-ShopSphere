import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, PackageSearch } from "lucide-react";
import toast from "react-hot-toast";
import type { Order } from "../types";
import * as orderService from "../services/orderService";
import { getImageUrl } from "../utils/getImageUrl";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";

const statusStyles: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-600",
  Processing: "bg-amber-50 text-amber-600",
  Shipped: "bg-blue-50 text-blue-600",
  Delivered: "bg-emerald-50 text-emerald-600",
};

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      toast.error("Failed to load your orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpanded = (orderId: string) => {
    setExpandedId((prev) => (prev === orderId ? null : orderId));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">
        <Skeleton className="h-8 w-48 mb-6" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No orders yet"
        description="Once you place an order, you'll be able to track it here."
        action={
          <Link to="/">
            <Button>Start Shopping</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-8">
        Your Orders
      </h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedId === order._id;

          return (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden"
            >
              <button
                onClick={() => toggleExpanded(order._id)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs text-ink-500">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-ink-500 mt-1.5">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                    {order.orderItems.length}{" "}
                    {order.orderItems.length === 1 ? "item" : "items"}
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="font-semibold text-ink-900">
                    ${order.totalPrice.toFixed(2)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-ink-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-ink-500" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-5 space-y-5">
                  <div className="space-y-3">
                    {order.orderItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-50 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-ink-500">
                            Qty {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-ink-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    <div>
                      <h4 className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">
                        Shipping Address
                      </h4>
                      <p className="text-sm text-ink-700 leading-relaxed">
                        {order.shippingAddress.fullName}
                        <br />
                        {order.shippingAddress.address}
                        <br />
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.postalCode}
                        <br />
                        {order.shippingAddress.country}
                        <br />
                        {order.shippingAddress.phone}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">
                        Order Summary
                      </h4>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between text-ink-500">
                          <span>Subtotal</span>
                          <span className="text-ink-900">
                            ${order.subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-ink-500">
                          <span>Shipping</span>
                          <span className="text-ink-900">
                            {order.shipping === 0
                              ? "Free"
                              : `$${order.shipping.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-ink-500">
                          <span>Tax</span>
                          <span className="text-ink-900">
                            ${order.tax.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold text-ink-900 pt-1.5 border-t border-gray-100">
                          <span>Total</span>
                          <span>${order.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistory;
