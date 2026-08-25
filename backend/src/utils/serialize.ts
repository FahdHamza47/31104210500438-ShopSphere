import { Prisma } from "@prisma/client";

// The frontend was originally built against Mongoose's `_id` convention
// and still expects `_id` on Product/Cart-item objects. Rather than touch
// 9 frontend files and every test fixture, we mirror `id` as `_id` at the
// API boundary — same approach already used for Order responses.

type ProductRow = Prisma.ProductGetPayload<Record<string, never>>;

export function serializeProduct(product: ProductRow) {
  return { ...product, _id: product.id };
}

type CartWithItems = Prisma.CartGetPayload<{
  include: { items: { include: { product: true } } };
}>;

export function serializeCart(cart: CartWithItems) {
  return {
    ...cart,
    _id: cart.id,
    items: cart.items.map((item) => ({
      ...item,
      _id: item.id,
      product: serializeProduct(item.product),
    })),
  };
}
