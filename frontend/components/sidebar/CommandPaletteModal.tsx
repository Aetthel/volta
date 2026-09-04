"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ArrowUpRight, CornerDownLeft, Loader2, Search, SearchX, Sparkles, X } from "lucide-react";
import {
  buildCommandIndex,
  findEntryById,
  getFeaturedEntries,
  groupResults,
  searchCommands,
  type CommandActionId,
  type CommandEntry,
} from "@/lib/search/commandIndex";
import {
  groupContentResults,
  searchContent,
  type ContentItem,
} from "@/lib/search/contentIndex";
import { useContentSearch } from "@/lib/search/useContentSearch";
import { splitHighlight, type HighlightRange } from "@/lib/search/fuzzy";

const RECENTS_KEY = "volta-search-recents";
const MAX_RECENTS = 5;

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchInputVal: string;
  setSearchInputVal: (v: string) => void;
  role?: string | null;
  businessId?: string | null;
  subscriptionStatus?: string | null;
}

/**
 * Fila de la lista, ya venga del catálogo de funcionalidades o del contenido
 * del negocio. Unificarlas es lo que permite que las flechas recorran todo el
 * panel sin saber de qué fuente sale cada resultado.
 */
interface Row {
  key: string;
  title: string;
  description: string;
  icon: React.ElementType;
  titleRanges: HighlightRange[];
  href?: string;
  action?: CommandActionId;
  external?: boolean;
  comingSoon?: boolean;
  /** Solo las funcionalidades se recuerdan: el contenido puede desaparecer. */
  recentId?: string;
}

interface RowGroup {
  key: string;
  label: string;
  suggested?: boolean;
  rows: Row[];
}

function readRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function pushRecent(id: string) {
  const next = [id, ...readRecents().filter((entryId) => entryId !== id)].slice(0, MAX_RECENTS);
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    // Modo privado o almacenamiento bloqueado: los recientes son prescindibles.
  }
}

function commandToRow(entry: CommandEntry, titleRanges: HighlightRange[] = []): Row {
  return {
    key: entry.id,
    title: entry.title,
    description: entry.description,
    icon: entry.icon,
    titleRanges,
    href: entry.href,
    action: entry.action,
    external: entry.external,
    comingSoon: entry.comingSoon,
    recentId: entry.id,
  };
}

function contentToRow(item: ContentItem, titleRanges: HighlightRange[]): Row {
  return {
    key: item.id,
    title: item.title,
    description: item.description,
    icon: item.icon,
    titleRanges,
    href: item.href,
  };
}

/** Título con los tramos coincidentes resaltados. */
function HighlightedTitle({ title, ranges }: { title: string; ranges: HighlightRange[] }) {
  return (
    <>
      {splitHighlight(title, ranges).map((part, idx) =>
        part.match ? (
          <mark key={idx} className="bg-transparent text-primary font-bold">
            {part.text}
          </mark>
        ) : (
          <React.Fragment key={idx}>{part.text}</React.Fragment>
        )
      )}
    </>
  );
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  searchInputVal,
  setSearchInputVal,
  role,
  businessId,
  subscriptionStatus,
}) => {
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const entries = useMemo(
    () => buildCommandIndex({ role, businessId, subscriptionStatus }),
    [role, businessId, subscriptionStatus]
  );

  const query = searchInputVal.trim();
  const upperRole = role?.toUpperCase();

  // El contenido del negocio se descarga al escribir, no al abrir el panel.
  const { items: contentItems, isLoading: isLoadingContent } = useContentSearch({
    businessId,
    canManageCatalog: upperRole === "JEFE" || upperRole === "ADMIN",
    enabled: isOpen && query.length > 0,
  });

  useEffect(() => {
    if (isOpen) setRecentIds(readRecents());
  }, [isOpen]);

  const groups = useMemo<RowGroup[]>(() => {
    // Con el buscador vacío: lo último usado y los accesos destacados, para que
    // el panel nunca aparezca en blanco.
    if (!query) {
      const recents = recentIds
        .map((id) => findEntryById(entries, id))
        .filter((entry): entry is CommandEntry => !!entry)
        .map((entry) => commandToRow(entry));

      const recentSet = new Set(recents.map((row) => row.key));
      const featured = getFeaturedEntries(entries)
        .filter((entry) => !recentSet.has(entry.id))
        .map((entry) => commandToRow(entry));

      return [
        ...(recents.length ? [{ key: "recientes", label: "Recientes", rows: recents }] : []),
        ...(featured.length
          ? [{ key: "sugerencias", label: "Accesos rápidos", suggested: true, rows: featured }]
          : []),
      ];
    }

    const commandGroups = groupResults(searchCommands(entries, query)).map((group) => ({
      key: `cmd-${group.id}`,
      label: group.label,
      rows: group.results.map((result) => commandToRow(result.entry, result.titleRanges)),
    }));

    const contentGroups = groupContentResults(searchContent(contentItems, query)).map((group) => ({
      key: `content-${group.kind}`,
      label: group.label,
      rows: group.results.map((result) => contentToRow(result.item, result.titleRanges)),
    }));

    return [...commandGroups, ...contentGroups];
  }, [entries, query, recentIds, contentItems]);

  // Lista plana: es sobre la que se mueven las flechas, ignorando los grupos.
  const flatRows = useMemo(() => groups.flatMap((group) => group.rows), [groups]);

  useEffect(() => {
    setActiveIndex(0);
  }, [searchInputVal]);

  // El contenido llega después de teclear: si la selección quedaba fuera de
  // rango tras recomponerse la lista, la devolvemos al principio.
  useEffect(() => {
    setActiveIndex((prev) => (prev >= flatRows.length ? 0 : prev));
  }, [flatRows.length]);

  const runRow = useCallback(
    (row: Row) => {
      if (row.comingSoon) return;

      if (row.recentId) pushRecent(row.recentId);
      onClose();
      setSearchInputVal("");

      if (row.action === "sign-out") {
        void signOut({ callbackUrl: "/login" });
        return;
      }

      if (row.href) {
        if (row.external) window.open(row.href, "_blank", "noopener,noreferrer");
        else router.push(row.href);
      }
    },
    [onClose, router, setSearchInputVal]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => (flatRows.length ? (prev + 1) % flatRows.length : 0));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) =>
          flatRows.length ? (prev - 1 + flatRows.length) % flatRows.length : 0
        );
      } else if (event.key === "Enter") {
        const selected = flatRows[activeIndex];
        if (selected) {
          event.preventDefault();
          runRow(selected);
        }
      } else if (event.key === "Home") {
        setActiveIndex(0);
      } else if (event.key === "End") {
        setActiveIndex(Math.max(0, flatRows.length - 1));
      }
    };

    // En captura, para adelantarnos al listener global de ⌘K/ESC del Sidebar.
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, flatRows, activeIndex, runRow]);

  // Mantiene visible la fila activa cuando se navega con el teclado.
  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, groups]);

  if (!isOpen || typeof document === "undefined") return null;

  let renderIndex = -1;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 sm:pt-28 p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscador de Volta"
        className="relative w-full max-w-xl bg-surface border border-outline-variant/60 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[70vh]"
      >
        {/* Campo de búsqueda */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-outline-variant/40 bg-surface shrink-0">
          <Search className="w-5 h-5 text-primary shrink-0" strokeWidth={2} />
          <input
            autoFocus
            type="text"
            role="combobox"
            aria-expanded
            aria-controls="volta-search-results"
            aria-autocomplete="list"
            value={searchInputVal}
            onChange={(e) => setSearchInputVal(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-sm text-on-surface placeholder:text-on-surface-variant/60 font-medium min-w-0"
            placeholder="Busca un cliente, una cita, un servicio o un ajuste..."
          />
          {isLoadingContent && (
            <Loader2 className="w-4 h-4 shrink-0 text-primary/70 animate-spin" strokeWidth={2} />
          )}
          {searchInputVal && (
            <button
              onClick={() => setSearchInputVal("")}
              className="p-1 rounded-md text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container transition-colors text-xs font-medium cursor-pointer"
            >
              Borrar
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant/70 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            aria-label="Cerrar búsqueda"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Resultados */}
        <div
          ref={listRef}
          id="volta-search-results"
          role="listbox"
          aria-label="Resultados de búsqueda"
          aria-busy={isLoadingContent}
          className="flex-1 overflow-y-auto overscroll-contain py-2"
        >
          {flatRows.length === 0 ? (
            <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-inner">
                {isLoadingContent ? (
                  <Loader2 className="w-6 h-6 animate-spin" strokeWidth={1.75} />
                ) : (
                  <SearchX className="w-6 h-6" strokeWidth={1.75} />
                )}
              </div>
              <p className="text-sm font-semibold text-on-surface mb-1">
                {isLoadingContent
                  ? "Buscando en tus clientes y citas..."
                  : `Sin resultados para “${query}”`}
              </p>
              {!isLoadingContent && (
                <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
                  Prueba con el nombre de un cliente, un servicio, o con “citas”,
                  “WhatsApp”, “precios”, “horarios”, “facturas”...
                </p>
              )}
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.key} className="mb-1 last:mb-0">
                <div className="px-4 pt-2 pb-1 flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                  {group.suggested && <Sparkles className="w-3 h-3" strokeWidth={2.2} />}
                  {group.label}
                </div>

                {group.rows.map((row) => {
                  renderIndex += 1;
                  const index = renderIndex;
                  const isActive = index === activeIndex;
                  const Icon = row.icon;

                  return (
                    <div
                      key={row.key}
                      role="option"
                      aria-selected={isActive}
                      aria-disabled={row.comingSoon || undefined}
                      data-active={isActive}
                      onMouseMove={() => setActiveIndex(index)}
                      onClick={() => runRow(row)}
                      className={`mx-2 px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors select-none ${
                        row.comingSoon ? "cursor-default opacity-70" : "cursor-pointer"
                      } ${isActive ? "bg-primary/10" : ""}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "bg-surface-container text-on-surface-variant/80"
                        }`}
                      >
                        <Icon className="w-[18px] h-[18px]" strokeWidth={1.85} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold truncate ${
                              isActive ? "text-primary" : "text-on-surface"
                            }`}
                          >
                            <HighlightedTitle title={row.title} ranges={row.titleRanges} />
                          </span>
                          {row.comingSoon && (
                            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant/70 border border-outline-variant/50">
                              Próximamente
                            </span>
                          )}
                          {row.external && (
                            <ArrowUpRight
                              className="w-3.5 h-3.5 shrink-0 text-on-surface-variant/60"
                              strokeWidth={2}
                            />
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant/85 truncate">
                          {row.description}
                        </p>
                      </div>

                      {isActive && !row.comingSoon && (
                        <CornerDownLeft
                          className="w-4 h-4 shrink-0 text-primary/70"
                          strokeWidth={2}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
