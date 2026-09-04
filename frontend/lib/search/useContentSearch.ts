"use client";

import { useEffect, useRef, useState } from "react";
import { fetchContentItems, type ContentItem } from "@/lib/search/contentIndex";

/** Ventana en la que se reutiliza lo ya descargado sin volver a pedirlo. */
const CACHE_TTL_MS = 2 * 60 * 1000;

interface CacheEntry {
  items: ContentItem[];
  fetchedAt: number;
}

// Caché a nivel de módulo: abrir y cerrar el buscador varias veces seguidas no
// debe repetir cuatro peticiones al backend.
const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<ContentItem[]>>();

function cacheKey(businessId: string, canManageCatalog: boolean): string {
  return `${businessId}:${canManageCatalog ? "catalogo" : "basico"}`;
}

async function loadContent(businessId: string, canManageCatalog: boolean): Promise<ContentItem[]> {
  const key = cacheKey(businessId, canManageCatalog);

  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.items;

  // Si ya hay una carga en curso, nos enganchamos a ella en vez de lanzar otra.
  const pending = inFlight.get(key);
  if (pending) return pending;

  const request = fetchContentItems({ businessId, canManageCatalog })
    .then((items) => {
      cache.set(key, { items, fetchedAt: Date.now() });
      return items;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
}

/** Descarta lo cacheado: tras crear o editar algo conviene volver a pedirlo. */
export function invalidateContentCache() {
  cache.clear();
}

interface UseContentSearchOptions {
  businessId?: string | null;
  canManageCatalog: boolean;
  /** La carga solo arranca cuando esto es true (al escribir la primera letra). */
  enabled: boolean;
}

/**
 * Carga perezosa del contenido del negocio para el buscador global.
 *
 * No se dispara al abrir el panel, sino al empezar a escribir: abrir ⌘K para
 * navegar a una sección no debe costar cuatro peticiones.
 */
export function useContentSearch({
  businessId,
  canManageCatalog,
  enabled,
}: UseContentSearchOptions) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const requestedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !businessId || businessId === "mock-business-id") return;

    const key = cacheKey(businessId, canManageCatalog);
    if (requestedRef.current === key) return;
    requestedRef.current = key;

    let active = true;
    setIsLoading(true);

    loadContent(businessId, canManageCatalog)
      .then((loaded) => {
        if (active) setItems(loaded);
      })
      .catch(() => {
        // El buscador sigue siendo útil solo con las funcionalidades.
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [enabled, businessId, canManageCatalog]);

  return { items, isLoading };
}
