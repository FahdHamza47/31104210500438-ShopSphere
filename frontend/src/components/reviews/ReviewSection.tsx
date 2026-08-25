import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import {
  getProductReviews,
  createReview,
  type Review,
} from "../../services/reviewService";

interface ReviewSectionProps {
  productId: string;
}

// Everything here talks to the independently-deployed review service
// (see src/services/reviewApi.ts) over REST — this component never touches
// the main ShopSphere backend for review data.
const ReviewSection = ({ productId }: ReviewSectionProps) => {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [count, setCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductReviews(productId);
      setReviews(data.reviews);
      setCount(data.count);
      setAverageRating(data.averageRating);
    } catch {
      // The review service is a separate deployment from the main app —
      // if it's down, the rest of the product page must still work.
      setError("Reviews are temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await createReview(productId, {
        name: user.name,
        rating,
        comment,
      });
      setComment("");
      setRating(5);
      await loadReviews();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Could not submit your review. Please try again.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 border-t border-gray-100 pt-10">
      <h2 className="font-display text-xl font-semibold text-ink-900 mb-1">
        Reviews
      </h2>

      {!loading && !error && (
        <p className="text-sm text-ink-500 mb-6">
          {count === 0
            ? "No reviews yet"
            : `${averageRating.toFixed(1)} average · ${count} review${
                count === 1 ? "" : "s"
              }`}
        </p>
      )}

      {loading && (
        <div className="space-y-3 mb-6">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-6">{error}</p>}

      {!loading && !error && (
        <ul className="space-y-6 mb-10">
          {reviews.map((review) => (
            <li key={review.id} className="border-b border-gray-50 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-ink-900">
                  {review.userName}
                </span>
              </div>
              <p className="text-sm text-ink-500">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <h3 className="font-medium text-ink-900">Write a review</h3>

          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      value <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            minLength={3}
            rows={3}
            placeholder="Share your thoughts about this product..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          {submitError && (
            <p className="text-sm text-red-600">{submitError}</p>
          )}

          <Button type="submit" isLoading={submitting} size="sm">
            Submit review
          </Button>
        </form>
      ) : (
        <p className="text-sm text-ink-500">
          Log in to write a review.
        </p>
      )}
    </div>
  );
};

export default ReviewSection;
