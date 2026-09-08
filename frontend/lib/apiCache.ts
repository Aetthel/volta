/**
 * Caché de lecturas para los conjuntos que varias pantallas piden a la vez.
 *
 * `Sidebar` (negocio) y `Header` (equipo) están montados en todas las páginas del
 * dashboard, así que abrir `inicio` llegaba a pedir el negocio dos veces en la
 * misma carga, y navegar entre inicio y agenda repetía citas, clientes y
 * servicios enteros.
 *
 * Se aplica a una lista corta de lecturas a propósito, no a todo `apiClient`: los
 * sondeos (estado de WhatsApp cada 4 s, alertas cada 20 s) deben seguir viendo la
 * red en cada vuelta, y una caché genérica los habría dejado servidos de memoria.
 */

interface Entrada {
  expira: number;
  valor: unknown;
}

/**
 * Corto a propósito: cubre la duplicación dentro de una misma carga y el ir y
 * volver entre pantallas, sin llegar a que el usuario perciba datos viejos. Las
 * mutaciones invalidan de todas formas.
 */
const TTL_MS = 10_000;

const entradas = new Map<string, Entrada>();
const enVuelo = new Map<string, Promise<unknown>>();

/**
 * Envuelve una lectura. Devuelve la respuesta cacheada si sigue fresca, se engancha
 * a la petición ya en curso si hay una para la misma clave, y si no la ejecuta.
 */
export async function leerConCache<T>(clave: string, ejecutar: () => Promise<T>): Promise<T> {
  const cacheada = entradas.get(clave);
  if (cacheada && cacheada.expira > Date.now()) {
    return cacheada.valor as T;
  }

  // Dos componentes montados a la vez piden lo mismo en el mismo tick: comparten
  // la petición en lugar de lanzar dos.
  const yaEnCurso = enVuelo.get(clave);
  if (yaEnCurso) {
    return yaEnCurso as Promise<T>;
  }

  const promesa = ejecutar()
    .then((resultado) => {
      // Solo se cachean las respuestas correctas: guardar un error condenaría a la
      // pantalla a repetirlo durante todo el TTL.
      const fallo =
        resultado && typeof resultado === "object" && "error" in resultado
          ? (resultado as { error?: unknown }).error
          : undefined;
      if (!fallo) {
        entradas.set(clave, { expira: Date.now() + TTL_MS, valor: resultado });
      }
      return resultado;
    })
    .finally(() => {
      enVuelo.delete(clave);
    });

  enVuelo.set(clave, promesa);
  return promesa;
}

/**
 * Vacía la caché. La llama `apiClient` tras cualquier escritura: acertar qué claves
 * dependen de una mutación concreta es frágil (una cita nueva cambia el listado de
 * citas y el recuento del cliente), y con un TTL de 10 s vaciar entero cuesta poco.
 */
export function invalidarCache(): void {
  entradas.clear();
}

/** Solo para tests. */
export function _resetCache(): void {
  entradas.clear();
  enVuelo.clear();
}
