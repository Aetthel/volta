const normalizeString = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
};

const normalizePhone = (phone) => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("34") && digits.length > 9) {
    return digits.slice(2);
  }
  return digits;
};

const eurFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formatea un importe en euros con la convención española: "1.234,56 €". */
const formatCurrency = (value) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return eurFormatter.format(Number.isFinite(parsed) ? parsed : 0);
};

export { normalizeString, normalizePhone, formatCurrency };
