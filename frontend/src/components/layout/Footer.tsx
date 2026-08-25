import { Store } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-white mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 font-display text-lg font-bold text-ink-900 mb-3">
              <Store className="w-5 h-5 text-brand-500" />
              ShopSphere
            </div>
            <p className="text-sm text-ink-500 max-w-sm">
              A modern shopping experience built with React, TypeScript, and
              Node.js — designed for speed, clarity, and ease of use.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink-900 mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-ink-500">
              <li>
                <a href="/" className="hover:text-brand-500 transition-colors">
                  All Products
                </a>
              </li>
              <li>
                <a
                  href="/cart"
                  className="hover:text-brand-500 transition-colors"
                >
                  Your Cart
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink-900 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-ink-500">
              <li>
                <a href="#" className="hover:text-brand-500 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-500 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 text-xs text-ink-500 text-center">
          © {year} ShopSphere. Built as a full-stack capstone project.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
