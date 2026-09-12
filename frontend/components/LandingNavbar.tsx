"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import FaceIcon from "@/components/FaceIcon";
import { Button } from "@/components/ui/volta-ui";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    setIsMobileMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `#${targetId}`);
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled || isMobileMenuOpen
          ? "bg-surface/95 backdrop-blur-md shadow-md border-outline-variant/30 py-3"
          : "bg-surface/80 backdrop-blur-md border-transparent py-4"
      }`}
    >
      <div className="flex justify-between items-center px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 max-w-container-max mx-auto">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
            <FaceIcon className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-title-md text-on-surface tracking-tight">
            Volta
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="/#features"
            onClick={(e) => handleNavClick(e, "features")}
            className="text-body-md font-medium text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer"
          >
            Características
          </a>
          <a
            href="/#pricing"
            onClick={(e) => handleNavClick(e, "pricing")}
            className="text-body-md font-medium text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer"
          >
            Precios
          </a>
          <a
            href="/#testimonials"
            onClick={(e) => handleNavClick(e, "testimonials")}
            className="text-body-md font-medium text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer"
          >
            Testimonios
          </a>
        </div>

        {/* Action Buttons & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login">
            <Button
              variant="primary"
              size="md"
              className="px-3.5 sm:px-4 text-xs sm:text-body-md shadow-sm"
            >
              Iniciar Sesión
            </Button>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/20 bg-surface/95 backdrop-blur-lg px-6 py-6 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          <a
            href="/#features"
            onClick={(e) => handleNavClick(e, "features")}
            className="text-body-md font-semibold text-on-surface hover:text-primary py-2 transition-colors border-b border-outline-variant/10 cursor-pointer"
          >
            Características
          </a>
          <a
            href="/#pricing"
            onClick={(e) => handleNavClick(e, "pricing")}
            className="text-body-md font-semibold text-on-surface hover:text-primary py-2 transition-colors border-b border-outline-variant/10 cursor-pointer"
          >
            Precios
          </a>
          <a
            href="/#testimonials"
            onClick={(e) => handleNavClick(e, "testimonials")}
            className="text-body-md font-semibold text-on-surface hover:text-primary py-2 transition-colors border-b border-outline-variant/10 cursor-pointer"
          >
            Testimonios
          </a>
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full justify-center">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
