import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BookingWizard, { type BookingBusinessData, type WizardSelection } from "./BookingWizard";

const business: BookingBusinessData = {
  id: "biz-1",
  name: "Peluquería Volta",
  address: "Calle Mayor 1",
  services: [
    { id: "s1", name: "Corte", description: "Corte y peinado", duration: 30, price: 20, capacity: 1 },
  ],
};

const identity = { phone: "600112233", name: "Ana García" };

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const renderWizard = (
  authFetch: ReturnType<typeof vi.fn>,
  selection: Partial<WizardSelection> = {}
) => {
  const onSelectionChange = vi.fn();
  const full: WizardSelection = {
    service: business.services[0],
    date: "2026-09-01",
    time: "10:00",
    ...selection,
  };

  const view = render(
    <BookingWizard
      business={business}
      identity={identity}
      selection={full}
      onSelectionChange={onSelectionChange}
      authFetch={authFetch}
    />
  );

  return { ...view, onSelectionChange };
};

describe("BookingWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the same service information the portal showed before the gate", () => {
    const authFetch = vi.fn().mockResolvedValue(jsonResponse({ availableSlots: [] }));
    renderWizard(authFetch, { service: null, time: "" });

    expect(screen.getByText("Corte")).toBeInTheDocument();
    expect(screen.getByText("Corte y peinado")).toBeInTheDocument();
    expect(screen.getByText("30 min")).toBeInTheDocument();
    expect(screen.getByText(/20,00/)).toBeInTheDocument();
  });

  it("presents the verified name and phone as read-only, with no inputs to edit them", async () => {
    const authFetch = vi.fn().mockResolvedValue(jsonResponse({ availableSlots: ["10:00"] }));
    renderWizard(authFetch);

    fireEvent.click(await screen.findByRole("button", { name: /Continuar con Mis Datos/i }));

    expect(await screen.findByText("Teléfono verificado")).toBeInTheDocument();
    expect(screen.getAllByText("Ana García").length).toBeGreaterThan(0);
    expect(screen.getByText("600112233")).toBeInTheDocument();

    // El único campo editable del paso es el correo opcional.
    const textboxes = screen.getAllByRole("textbox");
    expect(textboxes).toHaveLength(1);
    expect(textboxes[0]).toHaveAttribute("id", "booking-email");
  });

  it("never sends the phone or the name in the reservation body", async () => {
    const authFetch = vi
      .fn()
      .mockImplementation((url: string) =>
        url.includes("available-slots")
          ? Promise.resolve(jsonResponse({ availableSlots: ["10:00"] }))
          : Promise.resolve(jsonResponse({ appointment: { id: "a1" } }, 201))
      );

    renderWizard(authFetch);

    fireEvent.click(await screen.findByRole("button", { name: /Continuar con Mis Datos/i }));
    fireEvent.click(await screen.findByRole("button", { name: /Confirmar y Reservar Cita/i }));

    await waitFor(() => {
      expect(authFetch).toHaveBeenCalledWith(
        "/api/backend/public/booking/reserve",
        expect.objectContaining({ method: "POST" })
      );
    });

    const reserveCall = authFetch.mock.calls.find(([url]) => String(url).includes("/reserve"));
    const body = JSON.parse(reserveCall[1].body);

    expect(body).toEqual({
      businessId: "biz-1",
      serviceId: "s1",
      appointmentDate: "2026-09-01T10:00:00",
      clientEmail: undefined,
    });
    expect(body.clientPhone).toBeUndefined();
    expect(body.clientName).toBeUndefined();
  });

  it("shows the confirmation receipt with the verified identity", async () => {
    const authFetch = vi
      .fn()
      .mockImplementation((url: string) =>
        url.includes("available-slots")
          ? Promise.resolve(jsonResponse({ availableSlots: ["10:00"] }))
          : Promise.resolve(jsonResponse({ appointment: { id: "a1" } }, 201))
      );

    renderWizard(authFetch);

    fireEvent.click(await screen.findByRole("button", { name: /Continuar con Mis Datos/i }));
    fireEvent.click(await screen.findByRole("button", { name: /Confirmar y Reservar Cita/i }));

    expect(await screen.findByText("¡Reserva Confirmada!")).toBeInTheDocument();
    expect(screen.getByText(/Hacer otra reserva/i)).toBeInTheDocument();
  });

  it("stays silent on a 401 so the page can send the visitor back to the gate", async () => {
    const authFetch = vi
      .fn()
      .mockImplementation((url: string) =>
        url.includes("available-slots")
          ? Promise.resolve(jsonResponse({ availableSlots: ["10:00"] }))
          : Promise.resolve(
              jsonResponse({ error: "Tu sesión ha caducado.", code: "BOOKING_SESSION_INVALID" }, 401)
            )
      );

    renderWizard(authFetch);

    fireEvent.click(await screen.findByRole("button", { name: /Continuar con Mis Datos/i }));
    fireEvent.click(await screen.findByRole("button", { name: /Confirmar y Reservar Cita/i }));

    await waitFor(() => {
      expect(screen.queryByText("¡Reserva Confirmada!")).not.toBeInTheDocument();
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("surfaces a capacity clash without losing the chosen slot", async () => {
    const authFetch = vi
      .fn()
      .mockImplementation((url: string) =>
        url.includes("available-slots")
          ? Promise.resolve(jsonResponse({ availableSlots: ["10:00"] }))
          : Promise.resolve(jsonResponse({ error: "El horario seleccionado ya está ocupado." }, 409))
      );

    renderWizard(authFetch);

    fireEvent.click(await screen.findByRole("button", { name: /Continuar con Mis Datos/i }));
    fireEvent.click(await screen.findByRole("button", { name: /Confirmar y Reservar Cita/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/ya está ocupado/i);
    expect(screen.getByRole("button", { name: /Confirmar y Reservar Cita/i })).toBeInTheDocument();
  });
});
