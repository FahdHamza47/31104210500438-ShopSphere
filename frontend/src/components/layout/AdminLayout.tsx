import { NavLink, Outlet } from "react-router-dom";
import { Package, ClipboardList } from "lucide-react";

const AdminLayout = () => {
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive ? "bg-brand-500 text-white" : "text-ink-700 hover:bg-gray-100"
    }`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-8">
        Admin Dashboard
      </h1>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
          <NavLink to="/admin/products" className={linkClasses}>
            <Package className="w-4 h-4" />
            Products
          </NavLink>
          <NavLink to="/admin/orders" className={linkClasses}>
            <ClipboardList className="w-4 h-4" />
            Orders
          </NavLink>
        </aside>

        {/* Content */}
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
