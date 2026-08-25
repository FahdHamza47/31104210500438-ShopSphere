import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils/renderWithProviders";
import ProductCard from "./ProductCard";
import { mockProducts } from "../../mocks/data";

describe("ProductCard", () => {
  it("displays the product name, price, and category", () => {
    renderWithProviders(<ProductCard product={mockProducts[0]} />);

    expect(screen.getByText("Classic Leather Sneakers")).toBeInTheDocument();
    expect(screen.getByText("$89.99")).toBeInTheDocument();
    expect(screen.getByText("Footwear")).toBeInTheDocument();
  });

  it('shows an "Out of Stock" overlay and disables the Add button when stock is 0', () => {
    renderWithProviders(<ProductCard product={mockProducts[1]} />);

    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
  });

  it('lets the user click "Add" without navigating away from the page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductCard product={mockProducts[0]} />);

    const addButton = screen.getByRole("button", { name: /add/i });
    await user.click(addButton);

    // If e.preventDefault()/stopPropagation() in ProductCard's handleAddToCart works correctly,
    // the card (and its product name) should still be rendered — no navigation occurred.
    expect(screen.getByText("Classic Leather Sneakers")).toBeInTheDocument();
  });
});
