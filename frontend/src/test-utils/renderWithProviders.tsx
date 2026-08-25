import { ReactElement, ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

interface AllProvidersProps {
  children: ReactNode;
  initialEntries?: string[];
}

const AllProviders = ({
  children,
  initialEntries = ["/"],
}: AllProvidersProps) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialEntries?: string[];
}

export const renderWithProviders = (
  ui: ReactElement,
  { initialEntries, ...renderOptions }: CustomRenderOptions = {},
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialEntries={initialEntries}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
};

export * from "@testing-library/react";
