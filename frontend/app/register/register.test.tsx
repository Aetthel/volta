import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RegisterPage from "./page";

// Mock next/navigation useRouter
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock next-auth/react signIn
vi.mock("next-auth/react", () => ({
  signIn: vi.fn().mockResolvedValue({ ok: true }),
}));

describe("RegisterPage Component Flow", () => {
  it("renders Step 1 (Sector selection) initially", () => {
    render(<RegisterPage />);
    expect(screen.getByText(/¿A qué sector pertenece tu negocio\?/i)).toBeInTheDocument();
    expect(screen.getByText("Peluquería")).toBeInTheDocument();
  });

  it("shows validation error if Siguiente is clicked without selecting sector", () => {
    render(<RegisterPage />);
    const nextBtn = screen.getByRole("button", { name: /siguiente/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Por favor, selecciona un sector para continuar/i)).toBeInTheDocument();
  });

  it("advances to Step 2 when sector is selected", () => {
    render(<RegisterPage />);
    const peluqueriaOption = screen.getByText("Peluquería");
    fireEvent.click(peluqueriaOption);

    const nextBtn = screen.getByRole("button", { name: /siguiente/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Detalles de tu establecimiento/i)).toBeInTheDocument();
  });
});
