interface SkeletonProps {
  className?: string;
}

// A single shimmering placeholder block — compose these to build any loading shape
export const Skeleton = ({ className = "" }: SkeletonProps) => {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200/80 ${className}`} />
  );
};

// Pre-built skeleton matching our ProductCard layout (used on the Shop page while products load)
export const ProductCardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-soft">
      <Skeleton className="w-full aspect-square mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-6 w-1/3" />
    </div>
  );
};

// A grid of skeleton cards — drop this in while a full product list is loading
export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
