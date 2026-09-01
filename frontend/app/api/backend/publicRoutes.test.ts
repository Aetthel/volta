import { describe, it, expect } from "vitest";

/**
 * El proxy decide con estas reglas si una llamada al backend puede ir sin
 * sesión. Se replican aquí, en lugar de importar la ruta (que arrastra
 * next-auth y el runtime de Next), para poder fijar la frontera exacta: abrir
 * de más expone endpoints de cuenta, y cerrar de más deja al usuario sin poder
 * recuperar su contraseña, que fue justo el fallo que tenía.
 *
 * Debe seguir en paralelo a `app/api/backend/[...path]/route.ts`.
 */
const PUBLIC_AUTH_SECURITY_ACTIONS = [
  "verify-otp",
  "resend-otp",
  "forgot-password",
  "reset-password",
];

const isPublicRoute = (pathParts: string[]) => {
  const PUBLIC_LOPD_ACTIONS = ["accept", "reject"];
  const isPublicLopdRoute =
    pathParts[0] === "lopd" &&
    (pathParts.length === 2 || PUBLIC_LOPD_ACTIONS.includes(pathParts[2]));

  const isPublicAuthSecurityRoute =
    pathParts[0] === "auth-security" &&
    ((pathParts.length === 2 && PUBLIC_AUTH_SECURITY_ACTIONS.includes(pathParts[1])) ||
      (pathParts.length === 3 &&
        pathParts[1] === "2fa" &&
        pathParts[2] === "validate-challenge"));

  return (
    isPublicLopdRoute ||
    isPublicAuthSecurityRoute ||
    pathParts[0] === "health" ||
    pathParts[0] === "demo" ||
    pathParts[0] === "public" ||
    pathParts[0] === "webhooks" ||
    (pathParts[0] === "users" && pathParts[1] === "register")
  );
};

describe("Rutas públicas del proxy /api/backend", () => {
  describe("recuperación de contraseña", () => {
    it("deja pedir el enlace sin sesión", () => {
      expect(isPublicRoute(["auth-security", "forgot-password"])).toBe(true);
    });

    it("deja definir la nueva contraseña sin sesión", () => {
      expect(isPublicRoute(["auth-security", "reset-password"])).toBe(true);
    });
  });

  describe("verificación de correo y 2FA previos a la sesión", () => {
    it.each([["verify-otp"], ["resend-otp"]])("deja pasar %s", (action) => {
      expect(isPublicRoute(["auth-security", action])).toBe(true);
    });

    it("deja resolver el reto de 2FA, que ocurre antes de iniciar sesión", () => {
      expect(isPublicRoute(["auth-security", "2fa", "validate-challenge"])).toBe(true);
    });
  });

  describe("lo que debe seguir exigiendo sesión", () => {
    it.each([["change-password"], ["setup"], ["enable"], ["disable"]])(
      "no abre %s del propio router auth-security",
      (action) => {
        expect(isPublicRoute(["auth-security", action])).toBe(false);
      }
    );

    it.each([["setup"], ["enable"], ["disable"]])("no abre 2fa/%s", (action) => {
      expect(isPublicRoute(["auth-security", "2fa", action])).toBe(false);
    });

    it("no abre auth-security entero por su primer segmento", () => {
      expect(isPublicRoute(["auth-security"])).toBe(false);
      expect(isPublicRoute(["auth-security", "inventado"])).toBe(false);
    });

    it("sigue protegiendo el resto de la API", () => {
      expect(isPublicRoute(["clients"])).toBe(false);
      expect(isPublicRoute(["appointments"])).toBe(false);
      expect(isPublicRoute(["business", "abc", "hours"])).toBe(false);
      expect(isPublicRoute(["admin", "businesses"])).toBe(false);
    });
  });

  describe("rutas públicas que ya existían", () => {
    it("no se rompen con el cambio", () => {
      expect(isPublicRoute(["health"])).toBe(true);
      expect(isPublicRoute(["public", "booking", "biz-1"])).toBe(true);
      expect(isPublicRoute(["users", "register"])).toBe(true);
      expect(isPublicRoute(["lopd", "token-123"])).toBe(true);
      expect(isPublicRoute(["lopd", "token-123", "accept"])).toBe(true);
      // Las subrutas del LOPD que no son decisiones del cliente siguen cerradas.
      expect(isPublicRoute(["lopd", "token-123", "logs"])).toBe(false);
    });
  });
});
