import { useState, useEffect, useCallback } from "react";
import { Search, PackageX } from "lucide-react";
import type { Product } from "../types";
import * as productService from "../services/productService";
import ProductCard from "../components/product/ProductCard";
import { ProductGridSkeleton } from "../components/ui/Skeleton";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";

const SORT_OPTIONS = [
  { value: "", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A-Z" },
  { value: "rating_desc", label: "Top Rated" },
];

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(console.error);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts({
        keyword: debouncedKeyword || undefined,
        category: category || undefined,
        sort: sort || undefined,
        page,
        limit: 8,
      });
      setProducts(data.products);
      setPages(data.pages);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, category, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div>
      <section className="bg-ink-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Shop the essentials.
          </h1>
          <p className="text-gray-400 mt-4 max-w-lg mx-auto">
            Thoughtfully curated products, honest prices, and fast checkout — no
            clutter, no noise.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-8">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={PackageX}
            title="No products found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setKeyword("");
                  setCategory("");
                  setSort("");
                }}
              >
                Clear Filters
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <Pagination page={page} pages={pages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
