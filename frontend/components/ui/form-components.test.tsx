import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { User } from "lucide-react";
import {
  Fieldset,
  FieldsetLegend,
  Field,
  FieldLabel,
  Input,
  FieldDescription,
  FieldError,
} from "./volta-ui";
import { formatPhoneNumber } from "@/lib/utils";

describe("Form UI Components (Fieldset, Field, Input)", () => {
  it("renders Fieldset and FieldsetLegend correctly", () => {
    render(
      <Fieldset>
        <FieldsetLegend>Payment Details</FieldsetLegend>
      </Fieldset>
    );
    expect(screen.getByText("Payment Details")).toBeInTheDocument();
  });

  it("renders Input with default styling and placeholder", () => {
    render(<Input placeholder="Enter your name" />);
    const input = screen.getByPlaceholderText("Enter your name");
    expect(input).toBeInTheDocument();
    expect(input.className).toContain("rounded-xl");
    expect(input.className).toContain("bg-surface");
  });

  it("renders Input with Lucide icon component without throwing error", () => {
    render(<Input placeholder="Enter username" icon={User} />);
    const input = screen.getByPlaceholderText("Enter username");
    expect(input).toBeInTheDocument();
    expect(input.className).toContain("pl-9");
  });

  it("formats phone numbers with spaces when type='tel'", () => {
    render(<Input type="tel" placeholder="Enter phone" />);
    const input = screen.getByPlaceholderText("Enter phone") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "612345678" } });
    expect(input.value).toBe("612 34 56 78");

    fireEvent.change(input, { target: { value: "+34612345678" } });
    expect(input.value).toBe("+34 612 34 56 78");
  });

  it("formats phone numbers correctly via formatPhoneNumber utility", () => {
    expect(formatPhoneNumber("600112233")).toBe("600 11 22 33");
    expect(formatPhoneNumber("+34600112233")).toBe("+34 600 11 22 33");
    expect(formatPhoneNumber("61234")).toBe("612 34");
    expect(formatPhoneNumber("")).toBe("");
  });

  it("renders FieldLabel and FieldDescription", () => {
    render(
      <Field>
        <FieldLabel>Cardholder Name</FieldLabel>
        <Input placeholder="John Doe" />
        <FieldDescription>Name as shown on card</FieldDescription>
      </Field>
    );
    expect(screen.getByText("Cardholder Name")).toBeInTheDocument();
    expect(screen.getByText("Name as shown on card")).toBeInTheDocument();
  });

  it("renders FieldError with role='alert'", () => {
    render(
      <Field data-invalid>
        <FieldLabel>Card Number</FieldLabel>
        <Input placeholder="1234 5678" aria-invalid="true" />
        <FieldError>Invalid card number</FieldError>
      </Field>
    );
    const error = screen.getByRole("alert");
    expect(error).toBeInTheDocument();
    expect(error.textContent).toBe("Invalid card number");
    expect(error.className).toContain("text-error");
  });
});
