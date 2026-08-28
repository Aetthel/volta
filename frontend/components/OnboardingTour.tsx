"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronRight, ChevronLeft, X, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/volta-ui";

export interface TourStep {
  targetSelector: string; // e.g. '[data-tour="metrics-grid"]'
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

/**
 * Custom ultra-smooth scroll animation with cubic-bezier easing (like Lenis smooth scroll)
 */
function smoothScrollToY(targetY: number, duration = 850): Promise<void> {
  return new Promise((resolve) => {
    const startY = window.scrollY;
    const distance = targetY - startY;

    if (Math.abs(distance) < 5) {
      window.scrollTo(0, targetY);
      resolve();
      return;
    }

    let startTime: number | null = null;

    function step(currentTime: number) {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeInOutCubic: smooth acceleration start & gradual deceleration stop
      const ease =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startY + distance * ease);

      if (elapsed < duration) {
        requestAnimationFrame(step);
      } else {
        window.scrollTo(0, targetY);
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

export default function OnboardingTour({
  steps,
  isOpen,
  onClose,
  onComplete,
}: OnboardingTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const currentStep = steps[currentStepIndex];

  // Glide view smoothly to current step target
  const scrollToTarget = useCallback(async () => {
    if (!isOpen || !currentStep) return;

    const element = document.querySelector(currentStep.targetSelector);
    if (!element) {
      setTargetRect(null);
      return;
    }

    setIsScrolling(true);

    const rect = element.getBoundingClientRect();
    const elementCenterY = rect.top + window.scrollY - window.innerHeight / 2 + rect.height / 2;
    const targetY = Math.max(0, elementCenterY);

    // Perform ultra-smooth scroll animation
    await smoothScrollToY(targetY, 900);

    // Re-measure bounds after smooth scroll completes
    const finalRect = element.getBoundingClientRect();
    setTargetRect(finalRect);
    setIsScrolling(false);
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (isOpen) {
      scrollToTarget();
    }
  }, [isOpen, currentStepIndex, scrollToTarget]);

  // Recalculate spotlight positions on window resize
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    const handleResize = () => {
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, currentStep]);

  if (!isOpen || !currentStep) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      if (onComplete) onComplete();
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Tooltip position calculation relative to viewport
  const getTooltipStyle = () => {
    if (!targetRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const margin = 20;
    const cardWidth = 360;
    const cardHeight = 220;

    let left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
    left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, left));

    let top = targetRect.bottom + margin;
    if (top + cardHeight > window.innerHeight - 16) {
      top = Math.max(16, targetRect.top - cardHeight - margin);
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
    };
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto select-none overflow-hidden">
      {/* Dark Spotlight Backdrop Overlay */}
      {targetRect ? (
        <div
          className="absolute inset-0 transition-all duration-700 ease-out cursor-pointer"
          style={{
            background: `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${
              targetRect.top + targetRect.height / 2
            }px, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 12}px, rgba(15, 23, 42, 0.78) ${
              Math.max(targetRect.width, targetRect.height) / 2 + 35
            }px)`,
          }}
          onClick={onClose}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs" onClick={onClose} />
      )}

      {/* Glowing Highlight Box on Target Element */}
      {targetRect && (
        <div
          className="fixed rounded-2xl border-2 border-primary ring-4 ring-primary/40 pointer-events-none transition-all duration-700 ease-out shadow-[0_0_30px_rgba(0,128,128,0.35)]"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Floating Guided Tooltip Card */}
      <div
        className={`fixed z-[101] w-[360px] bg-surface border border-outline-variant/60 rounded-3xl p-6 shadow-2xl transition-all duration-500 ease-out ${
          isScrolling ? "opacity-40 scale-95" : "opacity-100 scale-100"
        }`}
        style={getTooltipStyle()}
      >
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            Paso {currentStepIndex + 1} de {steps.length}
          </span>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
            title="Cerrar guía"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title and Description */}
        <h3 className="text-title-md font-bold text-on-surface mb-2">{currentStep.title}</h3>
        <p className="text-body-sm text-on-surface-variant leading-relaxed mb-6">
          {currentStep.description}
        </p>

        {/* Step Progress Line */}
        <div className="w-full h-1.5 bg-surface-container rounded-full mb-5 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-body-xs font-medium text-on-surface-variant hover:text-on-surface underline cursor-pointer"
          >
            Saltar tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={isScrolling}
                className="gap-1 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              disabled={isScrolling}
              className="gap-1 rounded-xl shadow-md"
            >
              {isLastStep ? (
                <>
                  Entendido <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Siguiente <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
