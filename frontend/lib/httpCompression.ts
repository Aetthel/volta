import { gzip } from "node:zlib";
import { promisify } from "node:util";

const gzipAsync = promisify(gzip);

/**
 * Next comprime el HTML que renderiza, pero NO las respuestas de los route
 * handlers del App Router: su cuerpo se escribe por una vía que no pasa por el
 * middleware `compression` del servidor. Medido sobre este proyecto, una página
 * baja de 37 KB a 11 KB mientras que un JSON de 28 KB sale intacto.
 *
 * Como todo el tráfico de API hacia el navegador cruza el proxy
 * `/api/backend/[...path]`, comprimir ahí cubre la superficie entera.
 */

/** Por debajo de esto la cabecera y el ciclo de CPU cuestan más de lo que ahorran. */
const UMBRAL_BYTES = 1024;

/**
 * Devuelve una respuesta JSON comprimida si el cliente lo admite y el cuerpo lo
 * justifica; si no, la misma respuesta sin comprimir. Ante cualquier fallo de
 * compresión devuelve el cuerpo en claro: es una optimización, nunca un motivo
 * para tumbar la petición.
 */
export async function jsonResponseComprimida(
  data: unknown,
  status: number,
  acceptEncoding: string | null
): Promise<Response> {
  const cuerpo = JSON.stringify(data);
  const bytes = Buffer.byteLength(cuerpo);

  const cabeceras: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    // Sin esto una caché intermedia podría servir el cuerpo comprimido a un
    // cliente que no lo admite.
    Vary: "Accept-Encoding",
  };

  if (bytes < UMBRAL_BYTES || !/\bgzip\b/i.test(acceptEncoding || "")) {
    return new Response(cuerpo, { status, headers: cabeceras });
  }

  try {
    const comprimido = await gzipAsync(cuerpo);
    return new Response(comprimido, {
      status,
      headers: { ...cabeceras, "Content-Encoding": "gzip" },
    });
  } catch {
    return new Response(cuerpo, { status, headers: cabeceras });
  }
}
