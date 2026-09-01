/**
 * Lemon Squeezy integration configuration and utilities.
 */

export interface LemonSqueezyUserInfo {
  id?: string | null;
  email?: string | null;
}

export const LEMON_SQUEEZY_PRODUCT_URLS = {
  // TODO: Insertar URL del producto de Lemon Squeezy aquí para el Plan Básico
  BASIC: "https://volta.lemonsqueezy.com/buy/basic-checkout",
  // TODO: Insertar URL del producto de Lemon Squeezy aquí para el Plan Pro
  PRO: "https://volta.lemonsqueezy.com/buy/pro-checkout",
};

/**
 * Construye la URL de checkout de Lemon Squeezy inyectando como query parameters
 * el ID del usuario y su email en el formato requerido:
 * ?checkout[custom][user_id]=ID_DEL_USUARIO&checkout[email]=EMAIL_DEL_USUARIO
 *
 * @param productUrl URL base de checkout del producto en Lemon Squeezy
 * @param user Información del usuario autenticado (id y email)
 * @returns URL final con los query parameters inyectados
 */
export function buildLemonSqueezyCheckoutUrl(
  productUrl: string,
  user?: LemonSqueezyUserInfo
): string {
  if (!productUrl) return "";

  try {
    const url = new URL(productUrl);

    if (user?.id) {
      url.searchParams.set("checkout[custom][user_id]", user.id);
    }
    if (user?.email) {
      url.searchParams.set("checkout[email]", user.email);
    }

    return url.toString();
  } catch {
    const params = new URLSearchParams();
    if (user?.id) {
      params.set("checkout[custom][user_id]", user.id);
    }
    if (user?.email) {
      params.set("checkout[email]", user.email);
    }
    const query = params.toString();
    if (!query) return productUrl;
    return productUrl.includes("?") ? `${productUrl}&${query}` : `${productUrl}?${query}`;
  }
}
