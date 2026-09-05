/**
 * Lemon Squeezy integration configuration and utilities.
 */

export interface LemonSqueezyUserInfo {
  id?: string | null;
  email?: string | null;
  businessId?: string | null;
}

export const LEMON_SQUEEZY_PRODUCT_URLS = {
  // Plan Básico (Variant 2094248)
  BASIC: "https://volta.lemonsqueezy.com/checkout/buy/3321b367-f2a6-4deb-bc72-102dd40ef8f3",
  // Plan Pro (Variant 2094249)
  PRO: "https://volta.lemonsqueezy.com/checkout/buy/651f8338-5657-46c6-8d5c-b97c103ad80e",
};

/**
 * Construye la URL de checkout de Lemon Squeezy inyectando como query parameters
 * el ID del usuario, su email y su business_id en el formato requerido:
 * ?checkout[custom][user_id]=ID_DEL_USUARIO&checkout[custom][business_id]=BUSINESS_ID&checkout[email]=EMAIL_DEL_USUARIO
 *
 * @param productUrl URL base de checkout del producto en Lemon Squeezy
 * @param user Información del usuario autenticado (id, email y businessId)
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
    if (user?.businessId) {
      url.searchParams.set("checkout[custom][business_id]", user.businessId);
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
    if (user?.businessId) {
      params.set("checkout[custom][business_id]", user.businessId);
    }
    if (user?.email) {
      params.set("checkout[email]", user.email);
    }
    const query = params.toString();
    if (!query) return productUrl;
    return productUrl.includes("?") ? `${productUrl}&${query}` : `${productUrl}?${query}`;
  }
}

/**
 * Abre el Checkout Overlay de Lemon Squeezy para la URL dada.
 * Si Lemon Squeezy JS está disponible, usa su overlay modal nativo;
 * de lo contrario, abre la URL como fallback.
 */
export function openLemonSqueezyOverlay(url: string, e?: React.MouseEvent): void {
  if (e) {
    e.preventDefault();
  }
  if (typeof window !== "undefined" && window.LemonSqueezy?.Url?.Open) {
    window.LemonSqueezy.Url.Open(url);
  } else if (typeof window !== "undefined") {
    window.location.href = url;
  }
}
