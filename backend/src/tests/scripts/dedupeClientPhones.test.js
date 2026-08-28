import { jest } from "@jest/globals";
import {
  planMerges,
  applyPlan,
  pickLopdStatus,
  isPlaceholderEmail,
} from "../../../scripts/dedupeClientPhones.js";

const client = (overrides) => ({
  id: "c1",
  businessId: "b1",
  name: "Ana",
  surname: "García",
  email: null,
  phone: "600112233",
  avatarUrl: null,
  frequentService: null,
  lastVisit: null,
  lopdStatus: "Pendiente",
  createdAt: new Date("2026-01-01T10:00:00Z"),
  ...overrides,
});

describe("planMerges", () => {
  it("merges the same number written in different formats into the oldest record", () => {
    const plan = planMerges([
      client({ id: "nuevo", phone: "+34 600 11 22 33", createdAt: new Date("2026-05-01") }),
      client({ id: "viejo", phone: "600112233", createdAt: new Date("2026-01-01") }),
      client({ id: "medio", phone: "0034600112233", createdAt: new Date("2026-03-01") }),
    ]);

    expect(plan.merges).toHaveLength(1);
    expect(plan.merges[0].keeper.id).toBe("viejo");
    expect(plan.merges[0].duplicates.map((d) => d.id)).toEqual(["medio", "nuevo"]);
    expect(plan.merges[0].updates.phone).toBe("600112233");
  });

  it("never lets a merge undo a rejected LOPD consent", () => {
    const plan = planMerges([
      client({ id: "a", lopdStatus: "Aceptado", createdAt: new Date("2026-01-01") }),
      client({ id: "b", phone: "+34600112233", lopdStatus: "Rechazado", createdAt: new Date("2026-02-01") }),
    ]);

    expect(plan.merges[0].updates.lopdStatus).toBe("Rechazado");
  });

  it("keeps the most recent visit and fills the keeper's empty fields from the duplicates", () => {
    const plan = planMerges([
      client({
        id: "viejo",
        createdAt: new Date("2026-01-01"),
        lastVisit: new Date("2026-01-05"),
        email: null,
        frequentService: null,
      }),
      client({
        id: "nuevo",
        phone: "+34600112233",
        createdAt: new Date("2026-04-01"),
        lastVisit: new Date("2026-04-10"),
        email: "ana@real.com",
        frequentService: "Corte",
        avatarUrl: "https://cdn/ana.png",
      }),
    ]);

    const { updates } = plan.merges[0];
    expect(updates.lastVisit).toEqual(new Date("2026-04-10"));
    expect(updates.email).toBe("ana@real.com");
    expect(updates.frequentService).toBe("Corte");
    expect(updates.avatarUrl).toBe("https://cdn/ana.png");
  });

  it("prefers a real email over the one auto-generated from an appointment", () => {
    const plan = planMerges([
      client({ id: "viejo", email: "ana.garcia@email.com", createdAt: new Date("2026-01-01") }),
      client({ id: "nuevo", phone: "+34600112233", email: "ana@gmail.com", createdAt: new Date("2026-02-01") }),
    ]);

    expect(plan.merges[0].updates.email).toBe("ana@gmail.com");
  });

  it("renormalizes a lone client without merging it", () => {
    const plan = planMerges([client({ id: "solo", phone: "+34 600 11 22 33" })]);

    expect(plan.merges).toHaveLength(0);
    expect(plan.renames).toEqual([
      { id: "solo", businessId: "b1", from: "+34 600 11 22 33", to: "600112233" },
    ]);
  });

  it("does nothing when the data is already canonical and unique", () => {
    const plan = planMerges([
      client({ id: "a", phone: "600112233" }),
      client({ id: "b", phone: "600445566" }),
    ]);

    expect(plan).toEqual({ merges: [], renames: [], blockers: [] });
  });

  it("never merges clients across businesses", () => {
    const plan = planMerges([
      client({ id: "a", businessId: "b1", phone: "600112233" }),
      client({ id: "b", businessId: "b2", phone: "+34600112233" }),
    ]);

    expect(plan.merges).toHaveLength(0);
    expect(plan.renames.map((r) => r.id)).toEqual(["b"]);
  });

  it("flags unusable phone numbers instead of merging unrelated people", () => {
    const plan = planMerges([
      client({ id: "a", phone: "" }),
      client({ id: "b", phone: "sin teléfono", name: "Luis" }),
    ]);

    expect(plan.merges).toHaveLength(0);
    expect(plan.blockers).toHaveLength(1);
    expect(plan.blockers[0].clients.map((c) => c.id)).toEqual(["a", "b"]);
  });
});

describe("applyPlan", () => {
  const buildPrisma = (calls) => {
    const tx = {
      lopdConsentLog: {
        updateMany: jest.fn(async (args) => {
          calls.push(["lopdConsentLog.updateMany", args]);
          return { count: 2 };
        }),
      },
      appointment: {
        updateMany: jest.fn(async (args) => {
          calls.push(["appointment.updateMany", args]);
          return { count: 3 };
        }),
      },
      client: {
        update: jest.fn(async (args) => {
          calls.push(["client.update", args]);
          return {};
        }),
        deleteMany: jest.fn(async (args) => {
          calls.push(["client.deleteMany", args]);
          return { count: 1 };
        }),
      },
    };

    return { $transaction: jest.fn(async (fn) => fn(tx)), tx };
  };

  it("reassigns consents and appointments before deleting the duplicate record", async () => {
    const calls = [];
    const prisma = buildPrisma(calls);

    const plan = planMerges([
      client({ id: "viejo", createdAt: new Date("2026-01-01") }),
      client({ id: "nuevo", phone: "+34600112233", createdAt: new Date("2026-02-01") }),
    ]);

    const result = await applyPlan(prisma, plan);

    const order = calls.map(([name]) => name);
    expect(order.indexOf("lopdConsentLog.updateMany")).toBeLessThan(
      order.indexOf("client.deleteMany")
    );
    expect(order.indexOf("appointment.updateMany")).toBeLessThan(order.indexOf("client.deleteMany"));

    const [, consentArgs] = calls.find(([name]) => name === "lopdConsentLog.updateMany");
    expect(consentArgs).toEqual({
      where: { clientId: { in: ["nuevo"] } },
      data: { clientId: "viejo" },
    });

    expect(result.mergedClients).toBe(1);
    expect(result.movedConsents).toBe(2);
  });

  it("rewrites the phone copy denormalized on the appointments", async () => {
    const calls = [];
    const prisma = buildPrisma(calls);

    await applyPlan(prisma, planMerges([client({ id: "solo", phone: "+34 600 11 22 33" })]));

    const [, args] = calls.find(([name]) => name === "appointment.updateMany");
    expect(args).toEqual({
      where: { clientId: "solo" },
      data: { clientPhone: "600112233" },
    });
  });

  it("does not touch the database when there is nothing to do", async () => {
    const calls = [];
    const prisma = buildPrisma(calls);

    await applyPlan(prisma, planMerges([client({ id: "a", phone: "600112233" })]));

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe("merge rule helpers", () => {
  it("orders LOPD statuses from most to least restrictive", () => {
    expect(pickLopdStatus(["Pendiente", "Aceptado", "Rechazado"])).toBe("Rechazado");
    expect(pickLopdStatus(["Pendiente", "Aceptado"])).toBe("Aceptado");
    expect(pickLopdStatus(["Pendiente"])).toBe("Pendiente");
    expect(pickLopdStatus([])).toBe("Pendiente");
  });

  it("recognizes the auto-generated appointment email", () => {
    expect(isPlaceholderEmail("ana.garcia@email.com")).toBe(true);
    expect(isPlaceholderEmail("ana@gmail.com")).toBe(false);
    expect(isPlaceholderEmail(null)).toBe(false);
  });
});
