/**
 * Deduplicación de `Client` por (businessId, phone) previa a la constraint
 * `@@unique([businessId, phone])`.
 *
 * Hasta ahora el teléfono de un cliente se guardaba de dos formas distintas
 * según por dónde entrase: el dashboard lo canonizaba con `normalizePhone` y la
 * reserva pública lo guardaba tal cual lo tecleaba el visitante. El resultado es
 * que la misma persona puede tener varias fichas en el mismo negocio.
 *
 * Este script canoniza todos los teléfonos y fusiona las fichas que colisionan,
 * conservando la más antigua y reasignándole citas y consentimientos LOPD.
 *
 * Uso:
 *   node scripts/dedupeClientPhones.js --dry-run   # informe, no escribe nada
 *   node scripts/dedupeClientPhones.js             # aplica los cambios
 *
 * Es idempotente: una segunda ejecución no encuentra nada que hacer.
 */
import prismaDefault from "../src/config/db.js";
import { normalizePhone } from "../src/utils/formatters.js";

/** Más restrictivo primero: una negativa nunca se pierde en una fusión. */
const LOPD_PRECEDENCE = ["Rechazado", "Aceptado", "Pendiente"];

/**
 * `appointmentsService` inventa un email cuando da de alta un cliente desde una
 * cita (`maria.garcia@email.com`). No es un dato real, así que en una fusión
 * cede el puesto a cualquier email introducido por una persona.
 */
export const isPlaceholderEmail = (email) => !!email && /@email\.com$/i.test(String(email));

export const pickLopdStatus = (statuses) => {
  for (const status of LOPD_PRECEDENCE) {
    if (statuses.includes(status)) return status;
  }
  return "Pendiente";
};

const isBlank = (value) => value === null || value === undefined || String(value).trim() === "";

/** Primer valor no vacío recorriendo keeper → duplicados en orden de antigüedad. */
const firstFilled = (clients, field) => {
  for (const client of clients) {
    if (!isBlank(client[field])) return client[field];
  }
  return null;
};

const pickEmail = (clients) => {
  const real = clients.find((c) => !isBlank(c.email) && !isPlaceholderEmail(c.email));
  if (real) return real.email;
  return firstFilled(clients, "email");
};

const latestDate = (clients, field) => {
  const dates = clients.map((c) => c[field]).filter(Boolean).map((d) => new Date(d));
  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
};

const byAge = (a, b) => {
  const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  return diff !== 0 ? diff : String(a.id).localeCompare(String(b.id));
};

/**
 * Calcula qué hay que hacer sin tocar la base de datos. Separado de la
 * ejecución para poder razonar sobre las reglas de fusión y probarlas.
 *
 * @param {Array<object>} clients Clientes con sus campos y `createdAt`.
 * @returns {{ merges: Array<object>, renames: Array<object>, blockers: Array<object> }}
 */
export function planMerges(clients) {
  const groups = new Map();

  for (const client of clients) {
    const phone = normalizePhone(client.phone);
    const key = `${client.businessId}::${phone}`;
    if (!groups.has(key)) groups.set(key, { businessId: client.businessId, phone, clients: [] });
    groups.get(key).clients.push(client);
  }

  const merges = [];
  const renames = [];
  const blockers = [];

  for (const group of groups.values()) {
    const members = [...group.clients].sort(byAge);

    // Un teléfono que no deja ningún dígito utilizable no identifica a nadie:
    // fusionar por ese "valor" mezclaría personas distintas. Se marca para que
    // alguien lo resuelva a mano antes de aplicar la constraint.
    if (group.phone === "") {
      blockers.push({
        businessId: group.businessId,
        reason: "Teléfono vacío o sin dígitos tras normalizar",
        clients: members.map((c) => ({ id: c.id, name: c.name, phone: c.phone })),
      });
      continue;
    }

    if (members.length === 1) {
      const only = members[0];
      if (only.phone !== group.phone) {
        renames.push({ id: only.id, businessId: only.businessId, from: only.phone, to: group.phone });
      }
      continue;
    }

    const [keeper, ...duplicates] = members;

    merges.push({
      businessId: group.businessId,
      phone: group.phone,
      keeper: { id: keeper.id, name: keeper.name, phone: keeper.phone },
      duplicates: duplicates.map((c) => ({ id: c.id, name: c.name, phone: c.phone })),
      updates: {
        phone: group.phone,
        name: firstFilled(members, "name") ?? keeper.name,
        surname: firstFilled(members, "surname") ?? "",
        email: pickEmail(members),
        avatarUrl: firstFilled(members, "avatarUrl"),
        frequentService: firstFilled(members, "frequentService"),
        lastVisit: latestDate(members, "lastVisit"),
        lopdStatus: pickLopdStatus(members.map((c) => c.lopdStatus)),
      },
    });
  }

  return { merges, renames, blockers };
}

const formatReport = ({ merges, renames, blockers }) => {
  const lines = [];

  lines.push(`Fusiones:      ${merges.length}`);
  lines.push(`Renormalizados: ${renames.length}`);
  lines.push(`Bloqueos:      ${blockers.length}`);

  if (merges.length > 0) {
    lines.push("");
    lines.push("── Fusiones ──");
    for (const merge of merges) {
      lines.push(`  [${merge.businessId}] ${merge.phone}`);
      lines.push(`    conserva  ${merge.keeper.id}  "${merge.keeper.name}" (${merge.keeper.phone})`);
      for (const dup of merge.duplicates) {
        lines.push(`    absorbe   ${dup.id}  "${dup.name}" (${dup.phone})`);
      }
      lines.push(`    lopdStatus resultante: ${merge.updates.lopdStatus}`);
    }
  }

  if (renames.length > 0) {
    lines.push("");
    lines.push("── Teléfonos renormalizados (sin fusión) ──");
    for (const rename of renames) {
      lines.push(`  ${rename.id}: "${rename.from}" → "${rename.to}"`);
    }
  }

  if (blockers.length > 0) {
    lines.push("");
    lines.push("── BLOQUEOS: requieren resolución manual ──");
    for (const blocker of blockers) {
      lines.push(`  [${blocker.businessId}] ${blocker.reason}`);
      for (const client of blocker.clients) {
        lines.push(`    ${client.id}  "${client.name}"  phone=${JSON.stringify(client.phone)}`);
      }
    }
  }

  return lines.join("\n");
};

/**
 * Aplica el plan. Cada fusión va en su propia transacción: si una falla, las
 * anteriores quedan hechas y el script se puede relanzar.
 */
export async function applyPlan(prisma, plan) {
  let mergedClients = 0;
  let movedAppointments = 0;
  let movedConsents = 0;

  for (const merge of plan.merges) {
    const duplicateIds = merge.duplicates.map((d) => d.id);

    await prisma.$transaction(async (tx) => {
      // El orden importa: LopdConsentLog cae en cascada al borrar el Client, así
      // que hay que reasignarlo antes de eliminar la ficha duplicada.
      const consents = await tx.lopdConsentLog.updateMany({
        where: { clientId: { in: duplicateIds } },
        data: { clientId: merge.keeper.id },
      });

      const appointments = await tx.appointment.updateMany({
        where: { clientId: { in: duplicateIds } },
        data: { clientId: merge.keeper.id },
      });

      await tx.client.update({ where: { id: merge.keeper.id }, data: merge.updates });

      // La cita guarda una copia del teléfono para los envíos de WhatsApp:
      // dejarla con el valor viejo contradiría la ficha recién fusionada.
      await tx.appointment.updateMany({
        where: { clientId: merge.keeper.id },
        data: { clientPhone: merge.phone },
      });

      await tx.client.deleteMany({ where: { id: { in: duplicateIds } } });

      movedConsents += consents.count;
      movedAppointments += appointments.count;
      mergedClients += duplicateIds.length;
    });
  }

  for (const rename of plan.renames) {
    await prisma.$transaction(async (tx) => {
      await tx.client.update({ where: { id: rename.id }, data: { phone: rename.to } });
      await tx.appointment.updateMany({
        where: { clientId: rename.id },
        data: { clientPhone: rename.to },
      });
    });
  }

  return { mergedClients, movedAppointments, movedConsents, renamed: plan.renames.length };
}

export async function dedupeClientPhones({ dryRun = false, prisma = prismaDefault } = {}) {
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      businessId: true,
      name: true,
      surname: true,
      email: true,
      phone: true,
      avatarUrl: true,
      frequentService: true,
      lastVisit: true,
      lopdStatus: true,
      createdAt: true,
    },
  });

  const plan = planMerges(clients);

  console.log(`Clientes analizados: ${clients.length}`);
  console.log(formatReport(plan));

  if (plan.blockers.length > 0) {
    console.log("");
    console.log(
      "Hay clientes sin un teléfono utilizable en un mismo negocio. La constraint de unicidad"
    );
    console.log(
      "los rechazaría, así que resuélvelos a mano (corregir el teléfono o eliminar la ficha)"
    );
    console.log("antes de aplicar la migración de esquema.");
  }

  if (dryRun) {
    console.log("");
    console.log("[dry-run] No se ha escrito nada.");
    return { plan, applied: null };
  }

  const applied = await applyPlan(prisma, plan);

  console.log("");
  console.log(
    `Aplicado: ${applied.mergedClients} fichas fusionadas, ${applied.renamed} teléfonos renormalizados, ` +
      `${applied.movedAppointments} citas y ${applied.movedConsents} consentimientos reasignados.`
  );

  return { plan, applied };
}

const isMain = process.argv[1] && process.argv[1].endsWith("dedupeClientPhones.js");

if (isMain) {
  const dryRun = process.argv.includes("--dry-run");

  dedupeClientPhones({ dryRun })
    .then(({ plan }) => {
      process.exit(plan.blockers.length > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error("Error durante la deduplicación:", err);
      process.exit(1);
    })
    .finally(() => prismaDefault.$disconnect());
}
