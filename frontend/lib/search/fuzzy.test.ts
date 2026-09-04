import { describe, expect, it } from "vitest";
import { normalizeText, scoreEntry, splitHighlight, tokenizeQuery } from "./fuzzy";

describe("normalizeText", () => {
  it("baja a minúsculas y quita acentos", () => {
    expect(normalizeText("Contraseña Válida")).toBe("contrasena valida");
  });

  it("preserva la longitud para no descuadrar los rangos de resaltado", () => {
    const original = "Facturación año";
    expect(normalizeText(original)).toHaveLength(original.length);
  });
});

describe("tokenizeQuery", () => {
  it("parte por espacios ignorando los sobrantes", () => {
    expect(tokenizeQuery("  plantilla   whatsapp ")).toEqual(["plantilla", "whatsapp"]);
  });

  it("devuelve lista vacía si no hay consulta", () => {
    expect(tokenizeQuery("   ")).toEqual([]);
  });
});

describe("scoreEntry", () => {
  const whatsapp = {
    title: "Conectar WhatsApp (QR)",
    keywords: ["qr", "vincular", "escanear", "wasap"],
    description: "Vincula tu número escaneando el código QR desde el móvil.",
    group: "Mensajes y WhatsApp",
  };

  it("encuentra por título ignorando mayúsculas y acentos", () => {
    expect(scoreEntry("whatsapp", whatsapp)).not.toBeNull();
    expect(scoreEntry("numero", whatsapp)).not.toBeNull();
  });

  it("encuentra por sinónimo aunque la palabra no esté en el título", () => {
    expect(scoreEntry("wasap", whatsapp)).not.toBeNull();
  });

  it("descarta la entrada si algún término no aparece en ningún campo", () => {
    expect(scoreEntry("whatsapp facturas", whatsapp)).toBeNull();
  });

  it("acepta varios términos que sí aparecen en campos distintos", () => {
    expect(scoreEntry("conectar qr", whatsapp)).not.toBeNull();
  });

  it("puntúa más alto el prefijo del título que una coincidencia interna", () => {
    const prefijo = scoreEntry("clientes", { title: "Clientes", keywords: [] });
    const interna = scoreEntry("clientes", {
      title: "Exportar clientes a CSV",
      keywords: [],
    });

    expect(prefijo!.score).toBeGreaterThan(interna!.score);
  });

  it("puntúa más alto el título que la descripción", () => {
    const enTitulo = scoreEntry("horarios", { title: "Horarios de apertura", keywords: [] });
    const enDescripcion = scoreEntry("horarios", {
      title: "Gestión del Negocio",
      keywords: [],
      description: "Datos, horarios y catálogo.",
    });

    expect(enTitulo!.score).toBeGreaterThan(enDescripcion!.score);
  });

  it("admite abreviaturas por subsecuencia en el título", () => {
    expect(scoreEntry("fctr", { title: "Facturación", keywords: [] })).not.toBeNull();
  });

  it("no aplica subsecuencia a términos de menos de tres letras", () => {
    expect(scoreEntry("fc", { title: "Facturación", keywords: [] })).toBeNull();
  });

  it("devuelve los rangos del título coincidente", () => {
    const match = scoreEntry("apertura", { title: "Horarios de apertura", keywords: [] });
    expect(match!.titleRanges).toEqual([[12, 20]]);
  });

  it("con la consulta vacía no filtra nada", () => {
    expect(scoreEntry("  ", whatsapp)).toEqual({ score: 0, titleRanges: [] });
  });
});

describe("splitHighlight", () => {
  it("trocea el texto marcando los tramos coincidentes", () => {
    expect(splitHighlight("Nueva cita", [[6, 10]])).toEqual([
      { text: "Nueva ", match: false },
      { text: "cita", match: true },
    ]);
  });

  it("sin rangos devuelve el texto intacto", () => {
    expect(splitHighlight("Inbox", [])).toEqual([{ text: "Inbox", match: false }]);
  });
});
