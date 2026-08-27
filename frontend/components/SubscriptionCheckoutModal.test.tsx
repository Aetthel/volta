import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SubscriptionCheckoutModal from "./SubscriptionCheckoutModal";

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@volta.com",
        subscriptionPlan: "PRO",
        subscriptionStatus: "TRIALING",
        trialExpiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    update: vi.fn(),
  }),
}));

describe("SubscriptionCheckoutModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <SubscriptionCheckoutModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders Step 1 with plan options and trial notice when open", () => {
    render(<SubscriptionCheckoutModal isOpen={true} onClose={vi.fn()} initialPlan="PRO" />);

    expect(screen.getByText("Elige tu Plan de Suscripción")).toBeInTheDocument();
    expect(screen.getByText("Básico")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText(/Prueba Gratuita Activa/i)).toBeInTheDocument();
  });

  it("applies promotional coupon code correctly", () => {
    render(<SubscriptionCheckoutModal isOpen={true} onClose={vi.fn()} initialPlan="PRO" />);

    const couponInput = screen.getByPlaceholderText("Ej. VOLTA2026");
    const applyButton = screen.getByText("Aplicar");

    fireEvent.change(couponInput, { target: { value: "VOLTA2026" } });
    fireEvent.click(applyButton);

    expect(screen.getByText(/Cupón VOLTA2026 aplicado/i)).toBeInTheDocument();
    expect(screen.getByText("-20% de descuento")).toBeInTheDocument();
  });

  it("navigates through the steps correctly", () => {
    render(<SubscriptionCheckoutModal isOpen={true} onClose={vi.fn()} initialPlan="PRO" />);

    // Step 1 -> Step 2
    const continueBtn = screen.getByRole("button", {
      name: /continuar con datos de facturación/i,
    });
    fireEvent.click(continueBtn);

    expect(screen.getByText("Datos de Facturación")).toBeInTheDocument();

    // Step 2 -> Step 3
    const toPaymentBtn = screen.getByRole("button", { name: /ir al pago seguro/i });
    fireEvent.click(toPaymentBtn);

    expect(screen.getByText("Pasarela de Pago Segura")).toBeInTheDocument();
    expect(screen.getByText("🍏 Apple Pay")).toBeInTheDocument();
    expect(screen.getByText("🌐 Google Pay")).toBeInTheDocument();
  });
});
