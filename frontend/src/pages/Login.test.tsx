import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../test-utils/renderWithProviders";
import Login from "./Login";
import { mockUser } from "../mocks/data";

describe("Login page", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("renders the sign-in form", () => {
    renderWithProviders(<Login />, { initialEntries: ["/login"] });

    expect(
      screen.getByRole("heading", { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("shows a validation message when submitted with empty fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />, { initialEntries: ["/login"] });

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/please enter both email and password/i),
    ).toBeInTheDocument();
  });

  it("logs the user in and persists them to localStorage on valid credentials", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />, { initialEntries: ["/login"] });

    await user.type(screen.getByLabelText(/email/i), mockUser.email);
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem("user")).not.toBeNull();
    });

    const stored = JSON.parse(localStorage.getItem("user") as string);
    expect(stored.email).toBe(mockUser.email);
  });

  it("shows an error message on invalid credentials and does not persist a user", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />, { initialEntries: ["/login"] });

    await user.type(screen.getByLabelText(/email/i), "wrong@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/invalid email or password/i),
    ).toBeInTheDocument();
    expect(localStorage.getItem("user")).toBeNull();
  });
});
