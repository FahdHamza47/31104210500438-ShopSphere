import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../test-utils/renderWithProviders";
import { server } from "../mocks/server";
import Checkout from "./Checkout";
import { mockUser, mockProducts, mockOrder } from "../mocks/data";

// Matches the hardcoded API_BASE used throughout mocks/handlers.ts
const API_BASE = "http://localhost:5000/api";

const loginAsMockUser = () => {
  localStorage.setItem("user", JSON.stringify(mockUser));
};

const fillShippingForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
  await user.type(screen.getByLabelText(/street address/i), "123 Main St");
  await user.type(screen.getByLabelText(/city/i), "Springfield");
  await user.type(screen.getByLabelText(/postal code/i), "12345");
  await user.type(screen.getByLabelText(/country/i), "USA");
  await user.type(screen.getByLabelText(/phone/i), "555-0100");
};

describe("Checkout page", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("renders the shipping form and an order summary populated from the cart", async () => {
    loginAsMockUser();
    renderWithProviders(<Checkout />, { initialEntries: ["/checkout"] });

    expect(
      await screen.findByText(new RegExp(mockProducts[0].name)),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
    // The single cart line item and the subtotal both show $179.98 (89.99 × 2),
    // so there are two matching nodes — assert both are present rather than
    // using getByText, which requires exactly one match.
    expect(screen.getAllByText("$179.98").length).toBeGreaterThanOrEqual(2);
  });

  it("submits the order with the entered shipping details and the cart's items", async () => {
    loginAsMockUser();
    const user = userEvent.setup();

    let capturedBody: any = null;
    server.use(
      http.post(`${API_BASE}/orders`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json(mockOrder, { status: 201 });
      }),
    );

    renderWithProviders(<Checkout />, { initialEntries: ["/checkout"] });

    await screen.findByText(new RegExp(mockProducts[0].name));
    await fillShippingForm(user);

    await user.click(screen.getByRole("button", { name: "Place Order" }));

    await waitFor(() => {
      expect(capturedBody).not.toBeNull();
    });

    expect(capturedBody.shippingAddress).toEqual({
      fullName: "Jane Doe",
      address: "123 Main St",
      city: "Springfield",
      postalCode: "12345",
      country: "USA",
      phone: "555-0100",
    });
    expect(capturedBody.orderItems).toHaveLength(1);
    expect(capturedBody.orderItems[0].product).toBe(mockProducts[0]._id);
    expect(capturedBody.orderItems[0].quantity).toBe(2);
  });

  it("shows an error and does not clear the cart if order placement fails", async () => {
    loginAsMockUser();
    const user = userEvent.setup();

    server.use(
      http.post(`${API_BASE}/orders`, () => {
        return HttpResponse.json(
          { message: "Payment declined" },
          { status: 400 },
        );
      }),
    );

    renderWithProviders(<Checkout />, { initialEntries: ["/checkout"] });

    await screen.findByText(new RegExp(mockProducts[0].name));
    await fillShippingForm(user);
    await user.click(screen.getByRole("button", { name: "Place Order" }));

    // The shipping form (and cart summary) should still be on screen —
    // a failed order must not clear the form or navigate away.
    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toHaveValue("Jane Doe");
    });
  });
});
