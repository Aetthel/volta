/**
 * El buscador global vive dentro del Sidebar, que es quien tiene su estado.
 * Este evento permite abrirlo desde cualquier otro sitio (la lupa del Header en
 * móvil, por ejemplo) sin levantar el estado ni pasar props por media app.
 */
export const OPEN_SEARCH_EVENT = "volta:open-search";

export function openGlobalSearch() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
}
