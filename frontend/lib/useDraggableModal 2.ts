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
    let targetX = triggerRect.right + 12;
    if (targetX + modalWidth > window.innerWidth) {
      targetX = triggerRect.left - modalWidth - 12;
    }
    targetX = Math.max(12, Math.min(targetX, window.innerWidth - modalWidth - 12));

    let targetY = triggerRect.top;
    if (targetY + modalHeight > window.innerHeight) {
      targetY = Math.max(12, window.innerHeight - modalHeight - 12);
    }

    return { x: targetX, y: targetY };
  }

  // Default: Center modal on screen
  const targetX = Math.max(12, (window.innerWidth - modalWidth) / 2);
  const targetY = Math.max(12, (window.innerHeight - modalHeight) / 2);
  return { x: targetX, y: targetY };
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
      setPosition({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
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
