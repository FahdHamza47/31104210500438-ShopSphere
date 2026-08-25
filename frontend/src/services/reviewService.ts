import reviewApi from "./reviewApi";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductReviewsResponse {
  productId: string;
  count: number;
  averageRating: number;
  reviews: Review[];
}

// Talks to the review microservice over REST — this is the only way the
// main app ever touches review data now that it's been extracted out.
export const getProductReviews = async (
  productId: string,
): Promise<ProductReviewsResponse> => {
  const { data } = await reviewApi.get<ProductReviewsResponse>(
    `/reviews/${productId}`,
  );
  return data;
};

export const createReview = async (
  productId: string,
  payload: { name: string; rating: number; comment: string },
): Promise<Review> => {
  const { data } = await reviewApi.post<Review>(
    `/reviews/${productId}`,
    payload,
  );
  return data;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  await reviewApi.delete(`/reviews/${reviewId}`);
};
