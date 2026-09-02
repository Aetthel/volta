import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import BookingWizard, {
  type BookingBusinessData,
  type BookingBusinessHours,
  type BookingHoliday,
  type WizardSelection,
} from "./BookingWizard";

const service = {
  id: "s1",
  name: "Corte",
  description: "Corte y peinado",
  duration: 30,
  price: 20,
  capacity: 1,
};

// El negocio abre de lunes a sábado y cierra los domingos (dayOfWeek 0).
const HOURS: BookingBusinessHours[] = [
  { dayOfWeek: 0, openTime: "09:00", closeTime: "20:00", isClosed: true },
  ...[1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
    dayOfWeek,
    openTime: "09:00",
    closeTime: "20:00",
    isClosed: false,
  })),
];

const businessWith = (
  hours?: BookingBusinessHours[],
  holidays?: BookingHoliday[]
): BookingBusinessData => ({
  id: "biz-1",
  name: "Peluquería Volta",
  address: "Calle Mayor 1",
  services: [service],
  hours,
  holidays,
});

const identity = { phone: "600112233", name: "Ana García" };

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/** Misma firma que el prop `authFetch` del asistente. */
type AuthFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const authFetchReturning = (body: unknown): Mock<AuthFetch> =>
  vi.fn<AuthFetch>().mockResolvedValue(jsonResponse(body));

// Miércoles 2 de septiembre de 2026; el domingo siguiente es el día 6.
const WEDNESDAY = new Date(2026, 8, 2, 10, 0, 0, 0);
const SUNDAY_ISO = "2026-09-06";
const WEDNESDAY_ISO = "2026-09-02";

const renderWizard = (
  authFetch: Mock<AuthFetch>,
  {
    selection = {},
    // `null` representa un negocio que no envía horario; `undefined` toma el
    // horario por defecto (cierra los domingos).
    hours = HOURS,
    holidays,
  }: {
    selection?: Partial<WizardSelection>;
    hours?: BookingBusinessHours[] | null;
    holidays?: BookingHoliday[];
  } = {}
) => {
  const onSelectionChange = vi.fn();
  const full: WizardSelection = {
    service,
    date: WEDNESDAY_ISO,
    time: "",
    ...selection,
  };

  const view = render(
    <BookingWizard
      business={businessWith(hours ?? undefined, holidays)}
      identity={identity}
      selection={full}
      onSelectionChange={onSelectionChange}
      authFetch={authFetch}
    />
  );

  return { ...view, onSelectionChange };
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(WEDNESDAY);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("BookingWizard — días en los que el negocio cierra", () => {
  it("deshabilita en el calendario los días cerrados", async () => {
    const authFetch = authFetchReturning({ availableSlots: ["10:00"] });
    renderWizard(authFetch);

    // react-day-picker deshabilita el botón del día con el atributo nativo.
    const domingos = await screen.findAllByRole("button", { name: /domingo/i });
    expect(domingos.length).toBeGreaterThan(0);
    domingos.forEach((dia) => expect(dia).toBeDisabled());
  });

  it("mantiene seleccionables los días en los que sí abre", async () => {
    const authFetch = authFetchReturning({ availableSlots: ["10:00"] });
    renderWizard(authFetch);

    const lunes = await screen.findAllByRole("button", { name: /lunes/i });
    expect(lunes.some((dia) => !dia.hasAttribute("disabled"))).toBe(true);
  });

  it("no deja elegir fechas pasadas", async () => {
    const authFetch = authFetchReturning({ availableSlots: ["10:00"] });
    renderWizard(authFetch);

    // El lunes 31 de agosto ya ha pasado respecto al miércoles 2.
    const ayer = await screen.findByRole("button", { name: /lunes, 31 de agosto/i });
    expect(ayer).toBeDisabled();
  });

  it("mueve la fecha al próximo día abierto si arranca en uno cerrado", async () => {
    const authFetch = authFetchReturning({ availableSlots: [] });
    const { onSelectionChange } = renderWizard(authFetch, {
      selection: { date: SUNDAY_ISO },
    });

    await waitFor(() => expect(onSelectionChange).toHaveBeenCalled());
    // El domingo 6 cae en cerrado: se propone el lunes 7.
    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.objectContaining({ date: "2026-09-07", time: "" })
    );
  });

  it("no pide horarios al backend para un día cerrado", async () => {
    const authFetch = authFetchReturning({ availableSlots: [] });
    renderWizard(authFetch, {
      selection: { date: SUNDAY_ISO },
      // Sin horario configurado no habría reubicación; con él, el efecto de
      // slots debe abstenerse mientras la fecha siga siendo la del domingo.
      hours: HOURS,
    });

    const llamadasDeSlots = authFetch.mock.calls.filter(([url]) =>
      String(url).includes("available-slots")
    );
    expect(llamadasDeSlots).toHaveLength(0);
  });

  it("explica que el negocio está cerrado en lugar de listar horarios", async () => {
    const authFetch = authFetchReturning({ availableSlots: [] });
    renderWizard(authFetch, { selection: { date: SUNDAY_ISO } });

    expect(await screen.findByText(/El negocio está cerrado/i)).toBeInTheDocument();
  });

  it("no deja continuar al paso de datos con un día cerrado", async () => {
    const authFetch = authFetchReturning({ availableSlots: [] });
    renderWizard(authFetch, { selection: { date: SUNDAY_ISO, time: "10:00" } });

    expect(await screen.findByRole("button", { name: /Continuar con Mis Datos/i })).toBeDisabled();
  });

  it("avisa y no admite reservas si el negocio no abre ningún día", async () => {
    const authFetch = authFetchReturning({ availableSlots: [] });
    const todosCerrados: BookingBusinessHours[] = HOURS.map((h) => ({ ...h, isClosed: true }));

    renderWizard(authFetch, { hours: todosCerrados });

    expect(
      await screen.findByText(/no tiene días de apertura configurados/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continuar con Mis Datos/i })).toBeDisabled();
  });

  it("sigue funcionando con normalidad en un día abierto", async () => {
    const authFetch = authFetchReturning({ availableSlots: ["10:00"] });
    renderWizard(authFetch);

    await waitFor(() =>
      expect(
        authFetch.mock.calls.some(([url]) => String(url).includes("available-slots"))
      ).toBe(true)
    );
    expect(await screen.findByRole("button", { name: "10:00" })).toBeInTheDocument();
    expect(screen.queryByText(/El negocio está cerrado/i)).not.toBeInTheDocument();
  });

  it("no bloquea nada si el negocio no envía horario", async () => {
    const authFetch = authFetchReturning({ availableSlots: ["10:00"] });
    renderWizard(authFetch, { hours: null });

    const domingos = await screen.findAllByRole("button", { name: /domingo/i });
    expect(domingos.some((dia) => !dia.hasAttribute("disabled"))).toBe(true);
  });

  describe("festivos", () => {
    // El backend envía los festivos ya resueltos a fecha, Pascua incluida.
    const FESTIVOS: BookingHoliday[] = [
      {
        date: "2026-10-12",
        key: "FIESTA_NACIONAL",
        name: "Fiesta Nacional de España",
        scope: "NATIONAL",
      },
      { date: "2026-09-03", key: "SAN_JUAN", name: "San Juan", scope: "REGIONAL" },
    ];

    it("deshabilita en el calendario la fecha del festivo", async () => {
      const authFetch = authFetchReturning({ availableSlots: ["10:00"] });
      renderWizard(authFetch, { holidays: FESTIVOS });

      // El 3 de septiembre de 2026 es jueves laborable, bloqueado por el festivo.
      const festivo = await screen.findByRole("button", { name: /jueves, 3 de septiembre/i });
      expect(festivo).toBeDisabled();
    });

    it("explica el festivo por su nombre en lugar de decir solo cerrado", async () => {
      const authFetch = authFetchReturning({ availableSlots: [] });
      renderWizard(authFetch, { selection: { date: "2026-09-03" }, holidays: FESTIVOS });

      expect(await screen.findByText(/cerrado por San Juan/i)).toBeInTheDocument();
    });

    it("no pide horarios al backend en un festivo", async () => {
      const authFetch = authFetchReturning({ availableSlots: [] });
      renderWizard(authFetch, { selection: { date: "2026-09-03" }, holidays: FESTIVOS });

      const llamadas = authFetch.mock.calls.filter(([url]) =>
        String(url).includes("available-slots")
      );
      expect(llamadas).toHaveLength(0);
    });

    it("mueve la fecha al siguiente día hábil cuando arranca en festivo", async () => {
      const authFetch = authFetchReturning({ availableSlots: [] });
      const { onSelectionChange } = renderWizard(authFetch, {
        selection: { date: "2026-09-03" },
        holidays: FESTIVOS,
      });

      await waitFor(() => expect(onSelectionChange).toHaveBeenCalled());
      expect(onSelectionChange).toHaveBeenCalledWith(
        expect.objectContaining({ date: "2026-09-04", time: "" })
      );
    });

    it("un día sin festivo ni cierre sigue reservable", async () => {
      const authFetch = authFetchReturning({ availableSlots: ["10:00"] });
      renderWizard(authFetch, { holidays: FESTIVOS });

      const jueves = await screen.findByRole("button", { name: /jueves, 10 de septiembre/i });
      expect(jueves).not.toBeDisabled();
    });
  });

  it("no envía la reserva si la fecha elegida cae en cerrado", async () => {
    const authFetch = authFetchReturning({ availableSlots: ["10:00"] });
    // Sin horario el asistente deja llegar al paso 3; el horario se inyecta
    // después mediante un rerender para simular una sesión que se queda obsoleta.
    const onSelectionChange = vi.fn();
    const selection: WizardSelection = { service, date: SUNDAY_ISO, time: "10:00" };

    const { rerender } = render(
      <BookingWizard
        business={businessWith(undefined)}
        identity={identity}
        selection={selection}
        onSelectionChange={onSelectionChange}
        authFetch={authFetch}
      />
    );

    fireEvent.click(await screen.findByRole("button", { name: /Continuar con Mis Datos/i }));
    expect(await screen.findByText("Teléfono verificado")).toBeInTheDocument();

    rerender(
      <BookingWizard
        business={businessWith(HOURS)}
        identity={identity}
        selection={selection}
        onSelectionChange={onSelectionChange}
        authFetch={authFetch}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Confirmar y Reservar Cita/i }));

    // El aviso del formulario es el que pide elegir otra fecha; el paso 2 muestra
    // además su propio mensaje de cerrado, de ahí que se busque el texto exacto.
    await waitFor(() => expect(screen.getByText(/Elige otra fecha/i)).toBeInTheDocument());
    const reservas = authFetch.mock.calls.filter(([url]) => String(url).includes("/reserve"));
    expect(reservas).toHaveLength(0);
  });
});
