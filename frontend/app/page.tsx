"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FaceIcon from "@/components/FaceIcon";
import {
  Calendar,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Play,
  Check,
  User,
  ShieldCheck,
  Star,
  ExternalLink,
  Mail,
  Share2
} from "lucide-react";
import { Button, Card, Badge } from "@/components/ui/volta-ui";

export default function RootPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Monitor scroll for header styling (Task 2.2)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased font-sans">
      
      {/* 1. Header Navigation (Task 2.1) */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
          isScrolled
            ? "bg-surface/95 backdrop-blur-md shadow-md border-outline-variant/30 py-3"
            : "bg-surface/80 backdrop-blur-md border-transparent py-4"
        }`}
      >
        <div className="flex justify-between items-center px-6 md:px-16 lg:px-24 xl:px-32 max-w-container-max mx-auto">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2">
            <FaceIcon className="w-11 h-11 text-primary" />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-body-md font-medium text-on-surface-variant hover:text-primary transition-colors duration-200"
            >
              Características
            </a>
            <a
              href="#pricing"
              className="text-body-md font-medium text-on-surface-variant hover:text-primary transition-colors duration-200"
            >
              Precios
            </a>
            <a
              href="#testimonials"
              className="text-body-md font-medium text-on-surface-variant hover:text-primary transition-colors duration-200"
            >
              Testimonios
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                size="md"
                className="text-primary hover:bg-primary/5 hover:text-primary"
              >
                Login
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="primary" size="md">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content (Task 1.2 Layout Structure) */}
      <main className="pt-20">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-24 md:py-32 border-b border-outline-variant/10 bg-[radial-gradient(circle_at_2px_2px,var(--color-primary-fixed-dim)_1px,transparent_0)] bg-[size:32px_32px] bg-opacity-[0.08]">
          <div className="max-w-container-max mx-auto px-6 md:px-16 lg:px-24 xl:px-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="flex flex-col items-start text-left z-10">
              <Badge variant="secondary" className="px-3 py-1 text-label-md font-semibold mb-6 border border-secondary/20 gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Estándar Clínico en Belleza
              </Badge>
              <h1 className="font-display text-display-lg md:text-[52px] lg:text-[56px] text-on-surface leading-tight font-bold mb-6">
                Gestiona tu salón con <span className="text-primary italic font-medium">elegancia clínica</span>
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-lg mb-8 leading-relaxed">
                La plataforma todo en uno para peluquerías y centros de estética que buscan profesionalidad, eficiencia y una experiencia de cliente superior.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                    Empezar Gratis
                  </Button>
                </Link>
                <a href="#features" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    Ver Demo
                    <Play className="w-4 h-4 fill-primary" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Hero Right Media (White Placeholder Dashboard Mockup) */}
            <div className="relative w-full aspect-[4/3] max-w-2xl mx-auto lg:mx-0">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
              
              {/* Ultra Clean White Dashboard Mockup */}
              <div className="w-full h-full bg-white rounded-2xl border border-outline-variant p-4 shadow-xl hover:rotate-0 transition-transform duration-700 relative z-10 flex flex-col gap-3">
                {/* Mockup Header */}
                <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-error/40"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400/40"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400/40"></span>
                  </div>
                  <div className="w-32 h-4 bg-surface-container rounded"></div>
                  <div className="w-8 h-8 rounded-full bg-surface-container"></div>
                </div>

                {/* Mockup Body */}
                <div className="flex-1 flex gap-3 overflow-hidden">
                  {/* Mockup Sidebar */}
                  <div className="w-16 md:w-24 bg-surface-container-low rounded-lg p-2 flex flex-col gap-2">
                    <div className="w-full h-4 bg-surface-container rounded-sm"></div>
                    <div className="w-full h-4 bg-primary/20 rounded-sm"></div>
                    <div className="w-full h-4 bg-surface-container rounded-sm"></div>
                    <div className="w-full h-4 bg-surface-container rounded-sm"></div>
                  </div>

                  {/* Mockup Calendar Grid */}
                  <div className="flex-1 bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-2 flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                      <div className="w-16 h-3 bg-surface-container rounded"></div>
                      <div className="flex gap-1">
                        <div className="w-4 h-3 bg-surface-container rounded"></div>
                        <div className="w-4 h-3 bg-surface-container rounded"></div>
                      </div>
                    </div>
                    {/* Mock Calendar Slots */}
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div className="border border-dashed border-outline-variant/30 rounded p-1 flex flex-col gap-1">
                        <div className="w-full h-2.5 bg-primary/30 rounded-sm"></div>
                        <div className="w-2/3 h-2 bg-surface-container rounded-sm"></div>
                      </div>
                      <div className="border border-dashed border-outline-variant/30 rounded p-1"></div>
                      <div className="border border-dashed border-outline-variant/30 rounded p-1 flex flex-col gap-1">
                        <div className="w-full h-2.5 bg-secondary-container rounded-sm"></div>
                        <div className="w-1/2 h-2 bg-surface-container rounded-sm"></div>
                      </div>
                      <div className="border border-dashed border-outline-variant/30 rounded p-1"></div>
                      <div className="border border-dashed border-outline-variant/30 rounded p-1 flex flex-col gap-1">
                        <div className="w-full h-2.5 bg-primary/30 rounded-sm"></div>
                      </div>
                      <div className="border border-dashed border-outline-variant/30 rounded p-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Trust Bar Section */}
        <section className="py-12 bg-surface-container-low border-b border-outline-variant/20">
          <div className="max-w-container-max mx-auto px-6 md:px-16 lg:px-24 xl:px-32 text-center">
            <p className="text-center text-label-md font-semibold text-on-surface-variant uppercase tracking-widest mb-8">
              Con la confianza de salones de élite
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 text-title-md font-bold text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary/40"></span>
                L'Elegance
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary/40"></span>
                Studio 54
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary/40"></span>
                Nova Esthetics
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary/40"></span>
                DermaClinic
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary/40"></span>
                Aura Beauty
              </div>
            </div>
          </div>
        </section>

        {/* Features Sections */}
        <section id="features" className="py-24 bg-surface relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(55,126,127,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(55,126,127,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          
          <div className="max-w-container-max mx-auto px-6 md:px-16 lg:px-24 xl:px-32 relative z-10 flex flex-col gap-24">
            
            {/* Feature 1: Scheduling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              
              {/* Media Placeholder */}
              <div className="order-2 md:order-1">
                <div className="bg-white rounded-2xl shadow-lg border border-outline-variant aspect-video flex flex-col items-center justify-center p-6 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Calendar className="w-16 h-16 text-primary/30 mb-4" />
                  <div className="border border-dashed border-outline-variant/60 rounded-xl px-6 py-4 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm shadow-sm">
                    <span className="text-body-md font-medium text-on-surface-variant">
                      Interfaz de Calendario Avanzado
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="order-1 md:order-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary px-3 py-1 text-label-md font-semibold mb-6 border-none">
                  Precisión
                </Badge>
                <h2 className="font-display text-headline-lg md:text-[32px] text-on-surface font-bold mb-6">
                  Agendamiento de Precisión Quirúrgica
                </h2>
                <p className="text-body-lg text-on-surface-variant mb-8 leading-relaxed">
                  Optimiza cada minuto de tu jornada. Nuestro motor de reservas inteligente previene solapamientos, gestiona tiempos de espera para coloración y envía recordatorios automáticos por WhatsApp con confirmación bidireccional.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1 shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-title-md font-semibold text-on-surface">Citas Inteligentes</h4>
                      <p className="text-body-md text-on-surface-variant">Bloqueo automático de tiempos de desarrollo técnicos.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1 shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-title-md font-semibold text-on-surface">Recordatorios Omnicanal</h4>
                      <p className="text-body-md text-on-surface-variant">SMS, Email y WhatsApp integrados nativamente.</p>
                    </div>
                  </li>
                </ul>
              </div>

            </div>

            {/* Feature 2: Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              
              {/* Description */}
              <div>
                <Badge variant="secondary" className="px-3 py-1 text-label-md font-semibold mb-6">
                  Insights
                </Badge>
                <h2 className="font-display text-headline-lg md:text-[32px] text-on-surface font-bold mb-6">
                  Analítica Clínica para tu Crecimiento
                </h2>
                <p className="text-body-lg text-on-surface-variant mb-8 leading-relaxed">
                  Deja de adivinar. Obtén visibilidad total sobre la salud financiera de tu salón, retención de clientes, rendimiento del equipo y rentabilidad del inventario en tiempo real con dashboards precisos.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1 shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-title-md font-semibold text-on-surface">Métricas de Retención</h4>
                      <p className="text-body-md text-on-surface-variant">Identifica patrones de clientes en riesgo de abandono.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1 shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-title-md font-semibold text-on-surface">Control de Inventario</h4>
                      <p className="text-body-md text-on-surface-variant">Alertas de bajo stock y cálculo de coste por servicio.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Media Placeholder */}
              <div>
                <div className="bg-white rounded-2xl shadow-lg border border-outline-variant aspect-video flex flex-col items-center justify-center p-6 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-secondary-container/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <BarChart3 className="w-16 h-16 text-secondary/30 mb-4" />
                  <div className="border border-dashed border-outline-variant/60 rounded-xl px-6 py-4 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm shadow-sm">
                    <span className="text-body-md font-medium text-on-surface-variant">
                      Dashboard Financiero y Métricas
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-surface-container-low border-y border-outline-variant/20">
          <div className="max-w-container-max mx-auto px-6 md:px-16 lg:px-24 xl:px-32">
            
            <div className="text-center mb-16">
              <h2 className="font-display text-headline-lg md:text-[32px] text-on-surface font-bold mb-4">
                Planes de Inversión
              </h2>
              <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                Escala tu negocio con la transparencia de Volta. Precios claros, sin sorpresas ocultas.
              </p>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
              
              {/* Basic Plan */}
              <Card className="p-8 flex flex-col hover:shadow-md transition-shadow">
                <div className="mb-8">
                  <p className="text-label-lg font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Básico
                  </p>
                  <h4 className="text-display font-bold text-on-surface mb-2">
                    18€<span className="text-title-lg font-normal text-on-surface-variant">/mes</span>
                  </h4>
                  <p className="text-body-md text-on-surface-variant italic">
                    Para empezar sin complicaciones.
                  </p>
                </div>
                
                <div className="flex-grow">
                  <p className="text-title-md font-bold mb-4 text-on-surface">Incluye:</p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-body-md text-on-surface">
                      <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                      1 trabajador
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface">
                      <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                      1 calendario
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface">
                      <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                      Hasta 40 citas/mes
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface">
                      <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                      Soporte por email
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface-variant/50 line-through">
                      <Check className="w-4.5 h-4.5 text-outline shrink-0 opacity-30" />
                      Sin recordatorios WhatsApp
                    </li>
                  </ul>
                </div>
                
                <div className="mt-8 space-y-3">
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="w-full">
                      Probar 14 días gratis
                    </Button>
                  </Link>
                  <p className="text-body-sm text-on-surface-variant text-center mt-2">Sin compromiso</p>
                </div>
              </Card>

              {/* Pro Plan */}
              <Card className="bg-primary p-8 shadow-xl relative flex flex-col lg:-mt-4 lg:mb-4 transform lg:scale-105 z-10 text-on-primary border-none overflow-visible">
                <Badge variant="secondary" className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-5 py-1 text-label-md uppercase tracking-wider font-bold shadow-md border-none">
                  MÁS POPULAR
                </Badge>
                
                <div className="mb-8 mt-2">
                  <p className="text-label-lg font-bold text-on-primary/80 uppercase tracking-wider mb-2">
                    Pro
                  </p>
                  <h4 className="text-[2.75rem] font-bold text-white mb-2 leading-none">
                    25€<span className="text-title-lg font-normal text-on-primary/80">/mes</span>
                  </h4>
                  <p className="text-body-md text-on-primary/95">
                    Para salones que quieren crecer.
                  </p>
                </div>

                <div className="flex-grow">
                  <p className="text-title-md font-bold mb-4 text-white">Todo lo Básico, más:</p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-body-md text-white">
                      <Check className="w-4.5 h-4.5 text-secondary-container shrink-0" />
                      Trabajadores ilimitados
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-white">
                      <Check className="w-4.5 h-4.5 text-secondary-container shrink-0" />
                      Citas y calendarios ilimitados
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-white">
                      <Check className="w-4.5 h-4.5 text-secondary-container shrink-0" />
                      Recordatorios WhatsApp 2 vías
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-white">
                      <Check className="w-4.5 h-4.5 text-secondary-container shrink-0" />
                      Gestión completa de clientes
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-white">
                      <Check className="w-4.5 h-4.5 text-secondary-container shrink-0" />
                      Analítica de negocio
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-white">
                      <Check className="w-4.5 h-4.5 text-secondary-container shrink-0" />
                      Soporte prioritario por chat
                    </li>
                  </ul>
                </div>

                <div className="mt-8 space-y-3">
                  <Link href="/login">
                    <Button variant="secondary" size="lg" className="w-full bg-white text-primary hover:bg-surface-container-lowest">
                      Probar 14 días gratis
                    </Button>
                  </Link>
                  <p className="text-body-sm text-on-primary/70 text-center mt-2">Sin compromiso</p>
                </div>
              </Card>

              {/* A medida Plan */}
              <Card className="p-8 flex flex-col hover:shadow-md transition-shadow">
                <div className="mb-8">
                  <p className="text-label-lg font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    A Medida
                  </p>
                  <h4 className="text-display font-bold text-on-surface mb-2">
                    A medida
                  </h4>
                  <p className="text-body-md text-on-surface-variant italic">
                    Para múltiples sedes y franquicias.
                  </p>
                </div>

                <div className="flex-grow">
                  <p className="text-title-md font-bold mb-4 text-on-surface">Todo lo Pro, más:</p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-body-md text-on-surface">
                      <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                      Multi-gestión Local consolidada
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface">
                      <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                      Acceso API Completo
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface">
                      <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                      Roles y permisos avanzados (SSO)
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface">
                      <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                      Onboarding presencial/remoto
                    </li>
                    <li className="flex items-center gap-3 text-body-md text-on-surface">
                      <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                      Account Manager Dedicado
                    </li>
                  </ul>
                </div>

                <div className="mt-8 space-y-3">
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="w-full bg-surface-container border-outline-variant text-on-surface hover:bg-surface-container-high">
                      Contactar Ventas
                    </Button>
                  </Link>
                  <p className="text-body-sm text-on-surface-variant text-center mt-2">Sin compromiso</p>
                </div>
              </Card>

            </div>

          </div>
        </section>


        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 bg-primary/5">
          <div className="max-w-container-max mx-auto px-6 md:px-16 lg:px-24 xl:px-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              {/* Testimonials List */}
              <div className="flex flex-col gap-8">
                <h2 className="font-display text-headline-lg md:text-[32px] text-on-surface font-bold mb-2">
                  Voces de Excelencia
                </h2>
                
                {/* Testimonial Card 1 */}
                <Card className="bg-white p-6 flex flex-col gap-6 border-outline-variant/30">
                  <p className="text-body-lg text-on-surface-variant italic leading-relaxed">
                    "Volta ha transformado la forma en que gestiono mis citas. La elegancia de la interfaz proyecta la profesionalidad que mis clientes esperan."
                  </p>
                  <div className="flex items-center gap-4">
                    {/* Minimalist White Profile Placeholder */}
                    <div className="w-12 h-12 rounded-full border border-outline-variant bg-surface-container-lowest flex items-center justify-center text-on-surface-variant">
                      <User className="w-5 h-5 text-outline" />
                    </div>
                    <div>
                      <h4 className="text-title-md font-bold text-on-surface">Maria García</h4>
                      <p className="text-label-md text-primary font-semibold">Dueña de Volta &amp; Spa</p>
                    </div>
                  </div>
                </Card>

                {/* Testimonial Card 2 */}
                <Card className="bg-white p-6 flex flex-col gap-6 border-outline-variant/30 lg:ml-8">
                  <p className="text-body-lg text-on-surface-variant italic leading-relaxed">
                    "La analítica avanzada me permitió reducir el stock parado en un 20% en solo tres meses. Es la herramienta definitiva."
                  </p>
                  <div className="flex items-center gap-4">
                    {/* Minimalist White Profile Placeholder */}
                    <div className="w-12 h-12 rounded-full border border-outline-variant bg-surface-container-lowest flex items-center justify-center text-on-surface-variant">
                      <User className="w-5 h-5 text-outline" />
                    </div>
                    <div>
                      <h4 className="text-title-md font-bold text-on-surface">Javier Ruíz</h4>
                      <p className="text-label-md text-primary font-semibold">Director de Estética Avanzada</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Graphic Placeholder Card */}
              <div className="hidden lg:block">
                <div className="relative h-[360px] w-full rounded-2xl overflow-hidden shadow-lg border border-white bg-white flex flex-col items-center justify-center p-8 group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="flex gap-1.5 mb-4 text-amber-500">
                    <Star className="w-6 h-6 fill-current" />
                    <Star className="w-6 h-6 fill-current" />
                    <Star className="w-6 h-6 fill-current" />
                    <Star className="w-6 h-6 fill-current" />
                    <Star className="w-6 h-6 fill-current" />
                  </div>
                  <h3 className="text-title-lg font-bold text-on-surface mb-2 text-center">
                    Calificación de 4.9/5 Estrellas
                  </h3>
                  <p className="text-body-md text-on-surface-variant text-center max-w-sm">
                    Reconocido como el software de gestión para centros de estética con mejor satisfacción de usuario de este año.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-surface-container-lowest">
          <div className="max-w-3xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32">
            
            <div className="text-center mb-12">
              <h2 className="font-display text-headline-lg md:text-[32px] text-on-surface font-bold mb-4">
                Preguntas Frecuentes
              </h2>
              <p className="text-body-md text-on-surface-variant">
                Resolvemos tus dudas principales para que des el paso con seguridad.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "¿Es difícil migrar mis datos desde otro software?",
                  a: "En absoluto. Nuestro equipo de soporte se encarga de la migración completa de tus clientes, citas futuras e historial de servicios desde los principales softwares del mercado de forma gratuita en el plan Pro."
                },
                {
                  q: "¿Tengo permanencia o contrato a largo plazo?",
                  a: "No. Volta funciona mediante suscripción mensual sin compromiso de permanencia. Puedes cancelar o pausar tu cuenta en cualquier momento desde el panel de configuración."
                },
                {
                  q: "¿Los recordatorios por WhatsApp tienen coste adicional?",
                  a: "Los planes Pro y Enterprise incluyen una cuota generosa de mensajes mensuales que cubren las necesidades de más del 95% de los salones. Si superas el límite, el coste por mensaje extra es marginal y transparente."
                }
              ].map((item, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div key={index} className="border border-outline-variant rounded-2xl overflow-hidden transition-all bg-surface">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex justify-between items-center p-6 text-left hover:bg-surface-container-low transition-colors duration-200 focus:outline-none"
                    >
                      <span className="text-title-md font-bold text-on-surface">
                        {item.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-primary shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-primary shrink-0" />
                      )}
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-[200px] border-t border-outline-variant/30 opacity-100 p-6 bg-white" : "max-h-0 opacity-0 overflow-hidden"
                      }`}
                    >
                      <p className="text-body-md text-on-surface-variant leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 text-center px-6 md:px-16 lg:px-24 xl:px-32 bg-surface">
          <div className="max-w-4xl mx-auto bg-primary rounded-[32px] p-12 md:p-20 shadow-xl relative overflow-hidden border-4 border-primary/20 text-on-primary">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,var(--color-on-primary)_1px,transparent_0)] bg-[size:32px_32px]"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            
            <h2 className="font-display text-display-lg md:text-[44px] text-white mb-6 relative z-10 font-bold leading-tight">
              ¿Listo para elevar tu estándar?
            </h2>
            <p className="text-body-lg text-white/90 mb-12 relative z-10 max-w-2xl mx-auto">
              Únete a los más de 1,500 salones que ya han profesionalizado su gestión con Volta. Sin tarjeta de crédito requerida para empezar.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link href="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-surface-container-lowest">
                  Comenzar Prueba Gratuita
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                  Agendar Demostración
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Section */}
      <footer className="bg-surface-container-low border-t border-outline-variant w-full pt-16 pb-8">
        <div className="max-w-container-max mx-auto px-6 md:px-16 lg:px-24 xl:px-32">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            
            {/* Footer Logo & Brand info */}
            <div className="lg:col-span-2 flex flex-col items-start">
              <span className="font-display text-headline-lg font-bold text-primary mb-4">
                Volta
              </span>
              <p className="text-body-md text-on-surface-variant mb-6 max-w-sm leading-relaxed">
                El estándar clínico para la gestión integral de salones de belleza, peluquerías y centros de estética avanzados.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-colors" aria-label="Social Link">
                  <Share2 className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-colors" aria-label="Email Link">
                  <Mail className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-colors" aria-label="External Link">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="text-title-md font-bold text-on-surface mb-6">Producto</h4>
              <ul className="space-y-3 text-body-md text-on-surface-variant">
                <li><a href="#features" className="hover:text-primary transition-colors">Características</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Casos de Uso</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Actualizaciones</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-title-md font-bold text-on-surface mb-6">Compañía</h4>
              <ul className="space-y-3 text-body-md text-on-surface-variant">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Empleo</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="text-title-md font-bold text-on-surface mb-6">Recursos</h4>
              <ul className="space-y-3 text-body-md text-on-surface-variant">
                <li><a href="#" className="hover:text-primary transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Guías de Negocio</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Webinars</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Comunidad</a></li>
              </ul>
            </div>

          </div>

          {/* Legal Bar */}
          <div className="border-t border-outline-variant/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-label-md text-on-surface-variant">
              © 2024 Volta Technologies. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-label-md text-on-surface-variant">
              <a href="#" className="hover:text-primary transition-colors">Política de Privacidad</a>
              <a href="#" className="hover:text-primary transition-colors">Términos de Servicio</a>
              <a href="#" className="hover:text-primary transition-colors">Cookies</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
