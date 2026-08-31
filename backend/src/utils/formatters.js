const normalizeString = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
};

/**
 * Forma canónica de un teléfono dentro del sistema: solo dígitos y sin el
 * prefijo 34. Es el único formato con el que se compara y se almacena
 * `Client.phone`, de modo que `600112233`, `600 11 22 33` y `+34600112233`
 * resuelvan siempre al mismo cliente.
 *
 * No confundir con `whatsappService.cleanPhoneForWhatsApp`, que hace lo
 * contrario (añade el 34) porque es la forma de *marcado* que exige el
 * `chatId` del gateway. Esa se aplica en el momento del envío, sobre el valor
 * ya canónico; nunca para guardar ni para buscar.
 *
 * @param {string} phone
 * @returns {string} Teléfono canónico, o "" si la entrada está vacía.
 */
const normalizePhone = (phone) => {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  // "0034600112233" es una forma habitual de escribir el prefijo internacional:
  // sin quitar el 00 quedaría como un teléfono distinto al mismo número con "+34".
  if (digits.startsWith("00") && digits.length > 2) {
    digits = digits.slice(2);
  }
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
