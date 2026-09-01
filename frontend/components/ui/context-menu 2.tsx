"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

// Global ContextMenu manager — ensures only one menu is open at a time
let _activeContextMenuClose: (() => void) | null = null;

function registerContextMenu(closeFn: () => void) {
  if (_activeContextMenuClose && _activeContextMenuClose !== closeFn) {
    _activeContextMenuClose();
  }
  _activeContextMenuClose = closeFn;
}

function unregisterContextMenu(closeFn: () => void) {
  if (_activeContextMenuClose === closeFn) {
    _activeContextMenuClose = null;
  }
}

// ContextMenu Context
interface ContextMenuContextType {
  isOpen: boolean;
  x: number;
  y: number;
  openMenu: (
    e: React.MouseEvent | TouchEvent | React.TouchEvent,
    clientX: number,
    clientY: number
  ) => void;
  closeMenu: () => void;
}

const ContextMenuContext = React.createContext<ContextMenuContextType | null>(null);

export interface ContextMenuProps {
  children: React.ReactNode;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });

  const closeMenu = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const openMenu = React.useCallback(
    (e: React.MouseEvent | TouchEvent | React.TouchEvent, clientX: number, clientY: number) => {
      registerContextMenu(closeMenu);
      setCoords({ x: clientX, y: clientY });
      setIsOpen(true);
    },
    [closeMenu]
  );

  React.useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => closeMenu();
    document.addEventListener("click", handleClose);
    window.addEventListener("scroll", handleClose);
    window.addEventListener("resize", handleClose);
    return () => {
      document.removeEventListener("click", handleClose);
      window.removeEventListener("scroll", handleClose);
      window.removeEventListener("resize", handleClose);
      unregisterContextMenu(closeMenu);
    };
  }, [isOpen, closeMenu]);

  return (
    <ContextMenuContext.Provider value={{ isOpen, x: coords.x, y: coords.y, openMenu, closeMenu }}>
      {children}
    </ContextMenuContext.Provider>
  );
};

// ContextMenuTrigger
export interface ContextMenuTriggerProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  disabled?: boolean;
}

export const ContextMenuTrigger = React.forwardRef<HTMLElement, ContextMenuTriggerProps>(
  ({ children, disabled, className, as: Component = "div", ...props }, ref) => {
    const context = React.useContext(ContextMenuContext);
    if (!context) throw new Error("ContextMenuTrigger must be used within ContextMenu");

    const touchTimer = React.useRef<NodeJS.Timeout | null>(null);
    const touchStartCoords = React.useRef<{ x: number; y: number } | null>(null);

    const handleContextMenu = (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      context.openMenu(e, e.clientX, e.clientY);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      if (disabled) return;
      const touch = e.touches[0];
      touchStartCoords.current = { x: touch.clientX, y: touch.clientY };

      touchTimer.current = setTimeout(() => {
        context.openMenu(e, touch.clientX, touch.clientY);
      }, 500);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!touchStartCoords.current) return;
      const touch = e.touches[0];
      const diffX = Math.abs(touch.clientX - touchStartCoords.current.x);
      const diffY = Math.abs(touch.clientY - touchStartCoords.current.y);
      if (diffX > 10 || diffY > 10) {
        if (touchTimer.current) {
          clearTimeout(touchTimer.current);
          touchTimer.current = null;
        }
      }
    };

    const handleTouchEnd = () => {
      if (touchTimer.current) {
        clearTimeout(touchTimer.current);
        touchTimer.current = null;
      }
      touchStartCoords.current = null;
    };

    return (
      <Component
        ref={ref}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={className}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
ContextMenuTrigger.displayName = "ContextMenuTrigger";

// ContextMenuContent
export interface ContextMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  ({ children, className, ...props }, ref) => {
    const context = React.useContext(ContextMenuContext);
    if (!context) throw new Error("ContextMenuContent must be used within ContextMenu");

    const [mounted, setMounted] = React.useState(false);
    const [computedPos, setComputedPos] = React.useState<{ top: number; left: number } | null>(
      null
    );
    const localRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    React.useEffect(() => {
      if (!context.isOpen || !mounted) return;

      const updatePosition = () => {
        const menuEl = localRef.current;
        if (!menuEl) return;

        const menuWidth = menuEl.offsetWidth || 180;
        const menuHeight = menuEl.offsetHeight || 220;

        let posX = context.x;
        let posY = context.y;

        if (context.x + menuWidth > window.innerWidth) {
          posX = context.x - menuWidth;
        }
        if (context.y + menuHeight > window.innerHeight) {
          posY = context.y - menuHeight;
        }

        setComputedPos({
          top: posY + window.scrollY,
          left: Math.max(8, posX + window.scrollX),
        });
      };

      const frame = requestAnimationFrame(updatePosition);
      return () => cancelAnimationFrame(frame);
    }, [context.isOpen, context.x, context.y, mounted, children]);

    if (!context.isOpen || !mounted) return null;

    const contentElement = (
      <div
        ref={(el) => {
          localRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        style={
          computedPos
            ? {
                position: "absolute",
                top: `${computedPos.top}px`,
                left: `${computedPos.left}px`,
              }
            : {
                position: "absolute",
                visibility: "hidden",
                top: `${context.y + window.scrollY}px`,
                left: `${context.x + window.scrollX}px`,
              }
        }
        className={cn(
          "w-48 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-lg py-2 z-[9999] animate-in fade-in zoom-in-95 duration-100 origin-top-left flex flex-col gap-0.5",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    );

    return createPortal(contentElement, document.body);
  }
);
ContextMenuContent.displayName = "ContextMenuContent";

// ContextMenuItem
export interface ContextMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "error";
}

export const ContextMenuItem = React.forwardRef<HTMLButtonElement, ContextMenuItemProps>(
  ({ children, className, variant = "default", onClick, ...props }, ref) => {
    const context = React.useContext(ContextMenuContext);
    if (!context) throw new Error("ContextMenuItem must be used within ContextMenu");

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      context.closeMenu();
      if (onClick) onClick(e);
    };

    const variantClasses = {
      default: "text-on-surface hover:bg-secondary-container/30",
      error: "text-error hover:bg-error-container/15",
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(
          "w-full px-4 py-2 text-left font-label-md text-label-md hover:bg-surface-container justify-start shadow-none active:scale-100 flex items-center gap-2.5 transition-colors cursor-pointer select-none border-none bg-transparent",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ContextMenuItem.displayName = "ContextMenuItem";

// ContextMenuSeparator
export const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("my-1 border-t border-outline-variant/50", className)} {...props} />
));
ContextMenuSeparator.displayName = "ContextMenuSeparator";
