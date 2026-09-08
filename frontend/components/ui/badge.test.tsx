import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Badge, BadgeButton, BadgeDot } from "./badge";

describe("Standardized Badge Component Suite", () => {
  it("renders with default props", () => {
    render(<Badge>Default Badge</Badge>);
    const el = screen.getByText("Default Badge");
    expect(el).toBeInTheDocument();
    expect(el.tagName.toLowerCase()).toBe("span");
  });

  it("applies variant and appearance classes correctly", () => {
    const { container } = render(
      <Badge variant="success" appearance="light" shape="pill">
        Activo
      </Badge>
    );
    const badge = container.querySelector("[data-slot='badge']");
    expect(badge).toBeInTheDocument();
    expect(badge?.className).toContain("rounded-full");
    expect(badge?.className).toContain("bg-green-500/15");
  });

  it("renders BadgeDot indicator", () => {
    const { container } = render(
      <Badge variant="primary">
        <BadgeDot data-testid="dot" />
        En curso
      </Badge>
    );
    expect(container.querySelector("[data-slot='badge-dot']")).toBeInTheDocument();
    expect(screen.getByText("En curso")).toBeInTheDocument();
  });

  it("renders BadgeButton and handles click events", () => {
    const handleClick = vi.fn();
    render(
      <Badge variant="secondary">
        Filtro Tag
        <BadgeButton onClick={handleClick} aria-label="Eliminar">
          <span data-testid="close-icon">x</span>
        </BadgeButton>
      </Badge>
    );

    const button = screen.getByRole("button", { name: "Eliminar" });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("delegates element rendering when asChild is true", () => {
    render(
      <Badge asChild variant="warning">
        <a href="/pricing">Actualizar</a>
      </Badge>
    );

    const link = screen.getByRole("link", { name: "Actualizar" });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/pricing");
    expect(link.className).toContain("bg-amber-500");
  });
});
