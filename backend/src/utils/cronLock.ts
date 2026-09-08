import redisClient from "../config/redis.js";
import { logger } from "./logger.js";

/**
 * Ejecuta una tarea programada como mucho una vez por ventana, aunque haya varias
 * instancias del backend.
 *
 * `node-cron` corre dentro del proceso: con más de una réplica, las cuatro tareas
 * se dispararían en todas a la vez. Para el Sentinel eso significa recordatorios
 * de WhatsApp duplicados al mismo cliente; para las purgas, trabajo repetido.
 *
 * El cerrojo NO se libera al terminar: se deja expirar. Así el TTL actúa además
 * como ventana de exclusión —"esta tarea no vuelve a correr hasta dentro de N
 * segundos"—, que es justo lo que se quiere de algo programado, y evita la carrera
 * de liberar un cerrojo que ya haya readquirido otra instancia.
 */
export const ejecutarConLock = async (
  nombre: string,
  ttlSegundos: number,
  // `unknown` y no `void`: las purgas devuelven un resumen que aquí no se usa,
  // pero rechazarlas por eso obligaría a envolverlas sin motivo.
  tarea: () => Promise<unknown>
): Promise<void> => {
  const clave = `volta:cron:lock:${nombre}`;

  if (redisClient) {
    try {
      // NX: solo si no existe. EX: expira sola, así un proceso que muera a mitad
      // no deja la tarea bloqueada para siempre.
      const adquirido = await redisClient.set(clave, process.pid.toString(), "EX", ttlSegundos, "NX");
      if (adquirido !== "OK") {
        logger.info(`[Cron] "${nombre}" ya lo está ejecutando otra instancia; se omite`);
        return;
      }
    } catch (err) {
      // Se continúa a propósito. Con una sola instancia —el despliegue actual—
      // negarse a ejecutar dejaría sin recordatorios ni purgas cada vez que Redis
      // parpadee, que es peor que el riesgo de duplicar. Misma postura que el
      // limitador de peticiones y la caché: Redis es opcional en este proyecto.
      logger.warn(
        `[Cron] No se pudo comprobar el cerrojo de "${nombre}"; se ejecuta igualmente`,
        err
      );
    }
  }

  await tarea();
};
