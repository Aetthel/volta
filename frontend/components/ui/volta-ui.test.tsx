import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button, Alert, Badge, Toaster, toast } from "./volta-ui";

describe("volta-ui Components", () => {
  describe("Button", () => {
    it("renders children correctly", () => {
      render(<Button>Empezar Gratis</Button>);
      expect(screen.getByRole("button", { name: /empezar gratis/i })).toBeInTheDocument();
    });

    it("triggers onClick callback when clicked", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      fireEvent.click(screen.getByRole("button", { name: /click me/i }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("applies primary variant classes by default", () => {
      render(<Button>Primary Button</Button>);
      const btn = screen.getByRole("button", { name: /primary button/i });
      expect(btn.className).toContain("bg-primary");
    });
  });

  describe("Alert", () => {
    it("renders alert message", () => {
      render(<Alert variant="error">Error de conexión</Alert>);
      expect(screen.getByText("Error de conexión")).toBeInTheDocument();
    });
  });

  describe("Badge", () => {
    it("renders badge content", () => {
      render(<Badge variant="secondary">Profesional</Badge>);
      expect(screen.getByText("Profesional")).toBeInTheDocument();
    });
  });

  describe("Toaster & Toast Notifications", () => {
    it("renders Toaster without crashing", () => {
      const { container } = render(<Toaster />);
      expect(container).toBeDefined();
    });

    it("triggers whatsapp toast method successfully", () => {
      const toastId = toast.whatsapp({
        phone: "+34600123456",
        message: "Recordatorio enviado con éxito",
      });
      expect(toastId).toBeDefined();
    });
  });
});
