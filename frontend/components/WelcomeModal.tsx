"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAlerts } from "@/lib/alerts";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/volta-ui";
import FaceIcon from "@/components/FaceIcon";
import { X, ArrowRight } from "lucide-react";

export default function WelcomeModal() {
  const { alerts, markAllAsRead } = useAlerts();
  const { data: session } = useSession();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  const emergentes = alerts.filter((a) => a.type === "EMERGENTE" && !a.isRead);
  const totalSteps = emergentes.length;

  useEffect(() => {
    if (activeIndex >= totalSteps && totalSteps > 0) {
      setActiveIndex(totalSteps - 1);
    }
  }, [totalSteps, activeIndex]);

  // If unauthenticated or no emergent alerts or dismissed, do not render
  if (!session || totalSteps === 0 || isDismissed) return null;

  const current = emergentes[activeIndex];
  if (!current) return null;

  const handleCloseModal = () => {
    setIsDismissed(true);
  };

  const handleNext = () => {
    if (activeIndex < totalSteps - 1) {
      setActiveIndex((prev) => prev + 1);
    } else {
      markAllAsRead();
      setIsDismissed(true);
    }
  };

  const handleFinish = () => {
    markAllAsRead();
    setIsDismissed(true);
  };

  return (
    <Dialog open={!isDismissed} onOpenChange={() => handleCloseModal()}>
      <DialogContent className="gap-0 p-0 sm:max-w-[400px] rounded-[16px] overflow-hidden border border-outline-variant/60 bg-surface-container-lowest shadow-2xl">
        {/* Top Light Hero Graphic Banner with Volta Logo & Gridlines */}
        <div className="relative w-full h-[185px] bg-gradient-to-b from-surface-container-low via-surface-container-lowest to-surface-container-low overflow-hidden flex items-center justify-center border-b border-outline-variant/30 select-none">
          {/* Dashed Grid Lines Pattern in Light Neutral */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,101,101,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,101,101,0.06)_1px,transparent_1px)] bg-[size:24px_24px] opacity-70" />

          {/* Centered Volta 3D Circle Logo in Light Card */}
          <div className="relative z-10 w-20 h-20 rounded-full bg-surface-container-lowest border border-outline-variant/60 flex items-center justify-center shadow-[0_8px_24px_rgba(0,101,101,0.12)]">
            <FaceIcon className="w-11 h-11 text-primary" />
          </div>

          {/* Close X Button in Top Right */}
          <button
            type="button"
            onClick={handleCloseModal}
            className="absolute top-3 right-3 z-20 p-1.5 rounded-lg text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Action Footer Section */}
        <div className="space-y-5 px-6 pb-6 pt-5 bg-surface-container-lowest">
          <DialogHeader className="m-0 p-0 space-y-2 text-left">
            <DialogTitle className="text-xl font-bold text-on-surface tracking-tight leading-snug">
              {current.title}
            </DialogTitle>
            <DialogDescription className="text-body-md text-on-surface-variant leading-relaxed">
              {current.description}
            </DialogDescription>
          </DialogHeader>

          {/* Footer Bar: Dot Indicators + Actions */}
          <div className="flex items-center justify-between pt-2">
            {/* Step Dots */}
            <div className="flex items-center space-x-2">
              {[...Array(totalSteps)].map((_, index) => (
                <div
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "rounded-full transition-all duration-300 cursor-pointer",
                    index === activeIndex
                      ? "w-2.5 h-2.5 bg-primary scale-110"
                      : "w-2 h-2 bg-outline-variant/60 hover:bg-outline-variant"
                  )}
                />
              ))}
            </div>

            {/* Actions: Saltar / Siguiente / Entendido */}
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCloseModal}
                className="text-on-surface-variant hover:text-on-surface font-medium cursor-pointer"
              >
                Saltar
              </Button>

              {activeIndex < totalSteps - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  className="group flex items-center gap-1.5 font-medium shadow-sm px-4 cursor-pointer"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 opacity-80 transition-transform group-hover:translate-x-0.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleFinish}
                  className="font-medium shadow-sm px-4 cursor-pointer"
                >
                  Entendido
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
