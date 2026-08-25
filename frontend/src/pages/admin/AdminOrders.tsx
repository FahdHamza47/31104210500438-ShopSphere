import { useState, useEffect, useCallback } from "react";
import { ClipboardX } from "lucide-react";
import toast from "react-hot-toast";
import type { Order, OrderUser } from "../../types";
import * as orderService from "../../services/orderService";
import EmptyState from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";

const STATUS_FLOW = ["Pending", "Processing", "Shipped", "Delivered"];

const statusStyles: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-600",
  Processing: "bg-amber-50 text-amber-600",
  Shipped: "bg-blue-50 text-blue-600",
  Delivered: "bg-emerald-50 text-emerald-600",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const updated = await orderService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      toast.success(`Order marked as ${newStatus}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setUpdatingId(null);
    }
  };

  const getCustomerLabel = (user: OrderUser | string) => {
    if (typeof user === "string") return "Unknown Customer";
    return user.name;
  };

  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-ink-900 mb-6">
        Orders
      </h2>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ClipboardX}
            title="No orders yet"
            description="Orders placed by customers will show up here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-ink-500">
                  <th className="px-6 py-3 font-medium">Order ID</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">
                    Update Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="px-6 py-3 font-mono text-xs text-ink-500">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-3 text-ink-900 font-medium">
                      {getCustomerLabel(order.user)}
                    </td>
                    <td className="px-6 py-3 text-ink-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-ink-900 font-medium">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <select
                        value={order.status}
                        disabled={updatingId === order._id}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white disabled:opacity-50"
                      >
                        {STATUS_FLOW.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
