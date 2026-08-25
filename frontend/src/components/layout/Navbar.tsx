import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Store,
  Package,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  // Shared classes for nav links, with active-state styling handled by NavLink's isActive callback
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `relative px-1 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive ? "text-brand-500" : "text-ink-700 hover:text-ink-900"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100/80 bg-white/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2 font-display text-xl font-bold text-ink-900"
          >
            <Store className="w-6 h-6 text-brand-500" />
            ShopSphere
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" end className={linkClasses}>
              {({ isActive }) => (
                <>
                  Shop
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                  )}
                </>
              )}
            </NavLink>

            {user?.role === "admin" && (
              <NavLink to="/admin" className={linkClasses}>
                {({ isActive }) => (
                  <>
                    Admin Panel
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            )}
          </nav>

          {/* Right side: cart + auth */}
          <div className="flex items-center gap-4">
            <NavLink
              to="/cart"
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-ink-900" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[11px] font-semibold text-white bg-brand-500 rounded-full animate-[bounce_0.4s_ease-in-out]">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </NavLink>

            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-ink-900">
                    {user.name.split(" ")[0]}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-card border border-gray-100 py-2 animate-in fade-in slide-in-from-top-1">
                    <NavLink
                      to="/orders"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-gray-50"
                    >
                      <Package className="w-4 h-4" /> My Orders
                    </NavLink>
                    {user.role === "admin" && (
                      <NavLink
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Admin Panel
                      </NavLink>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to="/login"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-ink-900 rounded-xl hover:bg-ink-700 transition-colors"
              >
                <User className="w-4 h-4" /> Sign In
              </NavLink>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3">
          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium text-ink-900"
          >
            Shop
          </NavLink>
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-ink-900"
            >
              Admin Panel
            </NavLink>
          )}
          {user && (
            <NavLink
              to="/orders"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-ink-900"
            >
              My Orders
            </NavLink>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full text-left text-sm font-medium text-red-600"
            >
              Log Out
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-brand-500"
            >
              Sign In
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
