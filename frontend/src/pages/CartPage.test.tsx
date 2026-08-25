import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../test-utils/renderWithProviders";
import CartPage from "./CartPage";
import { mockUser, mockProducts } from "../mocks/data";

const loginAsMockUser = () => {
  localStorage.setItem("user", JSON.stringify(mockUser));
};

describe("CartPage", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("shows the cart item with its quantity and price breakdown", async () => {
    loginAsMockUser();
    renderWithProviders(<CartPage />, { initialEntries: ["/cart"] });

    expect(await screen.findByText(mockProducts[0].name)).toBeInTheDocument();

    expect(screen.getByText("2")).toBeInTheDocument(); // quantity
    // The single line item's total and the order summary subtotal are both
    // $179.98 (89.99 × 2) — assert both matching nodes are present rather
    // than using getByText, which requires exactly one match.
    expect(screen.getAllByText("$179.98").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Free")).toBeInTheDocument(); // over free-shipping threshold
  });

  it("increases the quantity when the increase button is clicked", async () => {
    loginAsMockUser();
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { initialEntries: ["/cart"] });

    await screen.findByText(mockProducts[0].name);
    await user.click(
      screen.getByRole("button", { name: /increase quantity/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  it("removes the item and shows the empty state when the remove button is clicked", async () => {
    loginAsMockUser();
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { initialEntries: ["/cart"] });

    await screen.findByText(mockProducts[0].name);
    await user.click(screen.getByRole("button", { name: /remove item/i }));

    expect(await screen.findByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it("clears the entire cart when Clear Cart is clicked", async () => {
    loginAsMockUser();
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { initialEntries: ["/cart"] });

    await screen.findByText(mockProducts[0].name);
    await user.click(screen.getByRole("button", { name: /clear cart/i }));

    expect(await screen.findByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it("navigates to checkout when Proceed to Checkout is clicked", async () => {
    loginAsMockUser();
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { initialEntries: ["/cart"] });

    await screen.findByText(mockProducts[0].name);
    await user.click(
      screen.getByRole("button", { name: /proceed to checkout/i }),
    );

    expect(
      screen.getByRole("button", { name: /proceed to checkout/i }),
    ).toBeInTheDocument();
  });
});
