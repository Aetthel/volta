import { useState, useLayoutEffect, useEffect, useRef } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface TriggerRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface UseDraggableModalOptions {
  isOpen: boolean;
  triggerRect?: TriggerRect | null;
  modalWidth?: number;
  modalHeight?: number;
}

/** Margen mínimo entre el modal y el borde de la ventana. */
const VIEWPORT_MARGIN = 12;

/**
 * Los modales se limitan a la altura de la ventana (ver MODAL_MAX_HEIGHT en los
 * componentes), así que la altura efectiva nunca supera el viewport disponible.
 */
function effectiveHeight(modalHeight: number) {
  return Math.min(modalHeight, window.innerHeight - VIEWPORT_MARGIN * 2);
}

/**
 * Mantiene el modal completamente dentro de la ventana. Si no cabe (ventana muy
 * baja), se ancla al margen superior en lugar de quedar recortado por arriba.
 */
export function clampToViewport(x: number, y: number, modalWidth: number, modalHeight: number) {
  if (typeof window === "undefined") return { x, y };

  const maxX = window.innerWidth - modalWidth - VIEWPORT_MARGIN;
  const maxY = window.innerHeight - effectiveHeight(modalHeight) - VIEWPORT_MARGIN;

  return {
    x: Math.max(VIEWPORT_MARGIN, Math.min(x, Math.max(VIEWPORT_MARGIN, maxX))),
    y: Math.max(VIEWPORT_MARGIN, Math.min(y, Math.max(VIEWPORT_MARGIN, maxY))),
  };
}

/**
 * Calculates modal coordinates relative to clicked element or screen center
 */
export function calculateModalPosition(
  triggerRect?: TriggerRect | null,
  modalWidth = 448,
  modalHeight = 550
) {
  if (typeof window === "undefined") return { x: 0, y: 0 };

  if (triggerRect && window.innerWidth >= 768) {
    let targetX = triggerRect.right + VIEWPORT_MARGIN;
    if (targetX + modalWidth > window.innerWidth) {
      targetX = triggerRect.left - modalWidth - VIEWPORT_MARGIN;
    }

    return clampToViewport(targetX, triggerRect.top, modalWidth, modalHeight);
  }

  // Default: Center modal on screen
  const targetX = (window.innerWidth - modalWidth) / 2;
  const targetY = (window.innerHeight - effectiveHeight(modalHeight)) / 2;
  return clampToViewport(targetX, targetY, modalWidth, modalHeight);
}

/**
 * Professional custom hook for draggable modal dialogs.
 * Eliminates frame-1 position jumps ("teleporting") using synchronous layout effect.
 */
export function useDraggableModal({
  isOpen,
  triggerRect,
  modalWidth = 448,
  modalHeight = 550,
}: UseDraggableModalOptions) {
  const [position, setPosition] = useState<{ x: number; y: number }>(() =>
    calculateModalPosition(triggerRect, modalWidth, modalHeight)
  );
  const [isDragging, setIsDragging] = useState(false);
  const prevIsOpenRef = useRef(false);

  // Synchronously compute initial position BEFORE browser paint on modal open
  useIsomorphicLayoutEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setPosition(calculateModalPosition(triggerRect, modalWidth, modalHeight));
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, triggerRect, modalWidth, modalHeight]);

  // Al redimensionar la ventana (o girar el móvil) el modal podría quedar fuera
  // de la vista: lo devolvemos dentro de los límites.
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      setPosition((prev) => clampToViewport(prev.x, prev.y, modalWidth, modalHeight));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, modalWidth, modalHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("input") ||
      (e.target as HTMLElement).closest("select") ||
      (e.target as HTMLElement).closest("textarea")
    ) {
      return;
    }

    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setPosition(
        clampToViewport(
          moveEvent.clientX - startX,
          moveEvent.clientY - startY,
          modalWidth,
          modalHeight
        )
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return {
    position,
    setPosition,
    isDragging,
    handleMouseDown,
  };
}
