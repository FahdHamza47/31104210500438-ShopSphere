import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ page, pages, onPageChange }: PaginationProps) => {
  if (pages <= 1) return null;

  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pageNumbers.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
            num === page
              ? "bg-brand-500 text-white"
              : "border border-gray-200 text-ink-700 hover:bg-gray-50"
          }`}
        >
          {num}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
