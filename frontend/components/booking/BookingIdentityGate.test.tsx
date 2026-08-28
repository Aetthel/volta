import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import BookingIdentityGate from "./BookingIdentityGate";

const business = { name: "Peluquería Volta", address: "Calle Mayor 1" };

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const renderGate = () => {
  const onVerified = vi.fn();
  render(
    <BookingIdentityGate businessId="biz-1" business={business} onVerified={onVerified} />
  );
  return { onVerified };
};

const typePhone = (value = "600112233") => {
  fireEvent.change(screen.getByLabelText("Teléfono móvil"), { target: { value } });
};

const enterCode = (code: string) => {
  const boxes = screen.getAllByLabelText(/Dígito \d de 6/);
  code.split("").forEach((digit, index) => {
    fireEvent.change(boxes[index], { target: { value: digit } });
  });
};

describe("BookingIdentityGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("explains what the phone number is used for before asking for it", () => {
    vi.stubGlobal("fetch", vi.fn());
    renderGate();

    expect(screen.getByText(/verificar que eres tú/i)).toBeInTheDocument();
    expect(screen.getByText(/código por WhatsApp/i)).toBeInTheDocument();
  });

  it("keeps the continue button disabled until the phone looks like a phone", () => {
    vi.stubGlobal("fetch", vi.fn());
    renderGate();

    const button = screen.getByRole("button", { name: /Continuar/i });
    expect(button).toBeDisabled();

    typePhone("600112233");
    expect(button).toBeEnabled();
  });

  it("asks for the full name when the phone is not a client yet", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ state: "NAME_REQUIRED" }));
    vi.stubGlobal("fetch", fetchMock);
    renderGate();

    typePhone();
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));

    expect(await screen.findByText("Es tu primera vez aquí")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre y apellidos")).toBeInTheDocument();
  });

  it("sends the name along with the phone on the second attempt", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ state: "NAME_REQUIRED" }))
      .mockResolvedValueOnce(
        jsonResponse({ state: "OTP_SENT", maskedPhone: "••••••233", expiresInSeconds: 300 })
      );
    vi.stubGlobal("fetch", fetchMock);
    renderGate();

    typePhone();
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));

    fireEvent.change(await screen.findByLabelText("Nombre y apellidos"), {
      target: { value: "Luis Pérez" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Enviarme el código/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      phone: "600112233",
      fullName: "Luis Pérez",
    });
  });

  it("verifies as soon as the six digits are in and hands the session over", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ state: "OTP_SENT", maskedPhone: "••••••233", expiresInSeconds: 300 })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          bookingToken: "token-abc",
          expiresAt: "2026-09-01T10:30:00.000Z",
          displayName: "Ana García",
        })
      );
    vi.stubGlobal("fetch", fetchMock);
    const { onVerified } = renderGate();

    typePhone();
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));

    await screen.findByText("Introduce el código");
    enterCode("123456");

    await waitFor(() =>
      expect(onVerified).toHaveBeenCalledWith({
        token: "token-abc",
        expiresAt: "2026-09-01T10:30:00.000Z",
        identity: { phone: "600112233", name: "Ana García" },
      })
    );
  });

  it("fills every box when the code is pasted from the notification", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ state: "OTP_SENT", maskedPhone: "••••••233", expiresInSeconds: 300 })
      )
      .mockResolvedValueOnce(
        jsonResponse({ bookingToken: "t", expiresAt: "2026-09-01T10:30:00.000Z", displayName: "Ana" })
      );
    vi.stubGlobal("fetch", fetchMock);
    const { onVerified } = renderGate();

    typePhone();
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));
    await screen.findByText("Introduce el código");

    fireEvent.paste(screen.getAllByLabelText(/Dígito 1 de 6/)[0], {
      clipboardData: { getData: () => "Tu código es 987654" },
    });

    await waitFor(() => expect(onVerified).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).code).toBe("987654");
  });

  it("shows the remaining attempts when the code is wrong and clears the boxes", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ state: "OTP_SENT", maskedPhone: "••••••233", expiresInSeconds: 300 })
      )
      .mockResolvedValueOnce(
        jsonResponse({ error: "Código incorrecto. Te quedan 4 intentos.", attemptsLeft: 4 }, 400)
      );
    vi.stubGlobal("fetch", fetchMock);
    const { onVerified } = renderGate();

    typePhone();
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));
    await screen.findByText("Introduce el código");
    enterCode("111111");

    expect(await screen.findByRole("alert")).toHaveTextContent(/quedan 4 intentos/i);
    expect(onVerified).not.toHaveBeenCalled();
  });

  it("tells the visitor plainly when verification is unavailable", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        { error: "Ahora mismo no podemos enviarte el código de verificación." },
        503
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    renderGate();

    typePhone();
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/no podemos enviarte el código/i);
    expect(screen.queryByText("Introduce el código")).not.toBeInTheDocument();
  });

  it("reports the rate limit instead of pretending the code was sent", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ error: "Has pedido demasiados códigos.", retryAfterSeconds: 900 }, 429)
    );
    vi.stubGlobal("fetch", fetchMock);
    renderGate();

    typePhone();
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/demasiados códigos/i);
  });
});
