"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Group,
  CreditCard,
  Rocket,
  Calendar,
  ChevronDown,
  MoreVertical,
  ArrowUpRight,
  Store,
  Search,
} from "lucide-react";
import { useSession } from "next-auth/react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TrialBanner from "@/components/TrialBanner";
import MetricCard from "@/components/MetricCard";
import { Button, PageHeader, Skeleton, Alert } from "@/components/ui/volta-ui";
import { formatCurrency } from "@/lib/utils";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRange, setSelectedRange] = useState("Últimos 30 días");
  const [activeBar, setActiveBar] = useState<string | null>(null);

  // Alerts Broadcasting States
  const [alertForm, setAlertForm] = useState({
    title: "",
    description: "",
    type: "NOTIFICACION",
    targetRole: "", // Empty string means "Todos"
  });
  const [isAlertSending, setIsAlertSending] = useState(false);
  const [alertStatus, setAlertStatus] = useState<{ success?: boolean; error?: string } | null>(
    null
  );

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertForm.title.trim() || !alertForm.description.trim()) return;
    setIsAlertSending(true);
    setAlertStatus(null);
    try {
      const payload: any = {
        type: alertForm.type,
        title: alertForm.title,
        description: alertForm.description,
      };
      if (alertForm.targetRole) {
        payload.targetRole = alertForm.targetRole;
      }

      const res = await fetch("/api/backend/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAlertStatus({ success: true });
        setAlertForm({
          title: "",
          description: "",
          type: "NOTIFICACION",
          targetRole: "",
        });
      } else {
        setAlertStatus({ error: data.error || "Ocurrió un error al enviar la alerta." });
      }
    } catch (err: any) {
      setAlertStatus({ error: err.message || "Error de red al conectar con el servidor." });
    } finally {
      setIsAlertSending(false);
    }
  };

  const [kpis, setKpis] = useState({
    totalRevenue: formatCurrency(0),
    totalClients: "0",
    averageTicket: formatCurrency(0),
    growth: "+0%",
  });
  const [rankings, setRankings] = useState<
    Array<{ rank: number; name: string; revenue: string; change: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = () => {
    setIsLoading(true);
    fetch("/api/backend/admin/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setKpis({
            totalRevenue: data.totalRevenue,
            totalClients: data.totalClients,
            averageTicket: data.averageTicket,
            growth: data.growth,
          });
          if (Array.isArray(data.rankings)) {
            setRankings(data.rankings);
          }
        }
      })
      .catch((e) => {
        console.error("Error loading admin stats:", e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchAdminData();
    }
  }, [session, status]);

  const chartData = [
    { month: "Ene", val: 28000, label: "€28.0k", pct: "h-[30%]" },
    { month: "Feb", val: 32000, label: "€32.0k", pct: "h-[45%]" },
    { month: "Mar", val: 30000, label: "€30.0k", pct: "h-[40%]" },
    { month: "Abr", val: 38000, label: "€38.0k", pct: "h-[60%]" },
    { month: "May", val: 35000, label: "€35.0k", pct: "h-[55%]" },
    { month: "Jun", val: 45200, label: "€45.2k", pct: "h-[85%]" },
  ];

  const filteredRankings = rankings.filter((branch) =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status !== "loading" && session?.user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
        <Sidebar onNewAppointmentClick={() => {}} />
        <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
          <main className="p-gutter max-w-container-max w-full mx-auto flex-1 flex flex-col justify-center items-center">
            <div className="max-w-md w-full">
              <Alert variant="error" className="mb-4">
                <span className="font-bold">Acceso Denegado:</span> Se requieren permisos de
                Administrador Global para ver esta sección.
              </Alert>
            </div>
          </main>
          <BottomNav />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Sidebar navigation */}
      <Sidebar onNewAppointmentClick={() => {}} />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
        {/* Content Canvas */}
        <TrialBanner />
        <main className="p-gutter max-w-container-max w-full mx-auto flex-1">
          <PageHeader
            title="Panel de Control Global"
            description="Resumen de rendimiento y métricas operativas."
            actions={
              <div className="relative group cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container transition-colors shadow-sm select-none">
                  <Calendar className="w-5 h-5 text-on-surface-variant" />
                  <span className="font-label-lg text-on-surface font-semibold">
                    {selectedRange}
                  </span>
                  <ChevronDown className="w-5 h-5 text-on-surface-variant" />
                </div>
              </div>
            }
          />

          {/* Grid KPIs */}
          {isLoading ? (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-surface-container-lowest p-5 rounded-md border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between h-[116px] animate-pulse"
                >
                  <div className="flex justify-between items-center w-full">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                  <Skeleton className="w-16 h-8 mt-2" />
                  <Skeleton className="w-28 h-3.5 mt-1" />
                </div>
              ))}
            </section>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
              <MetricCard
                title="Ingresos Totales"
                value={kpis.totalRevenue}
                change="+12% vs mes anterior"
                trend="up"
                icon={<TrendingUp className="w-5 h-5" />}
              />
              <MetricCard
                title="Clientes Totales"
                value={kpis.totalClients}
                change="+8% vs mes anterior"
                trend="up"
                icon={<Group className="w-5 h-5" />}
              />
              <MetricCard
                title="Ticket Promedio"
                value={kpis.averageTicket}
                change="+5% vs mes anterior"
                trend="up"
                icon={<CreditCard className="w-5 h-5" />}
              />
              <MetricCard
                title="Crecimiento Mensual"
                value={kpis.growth}
                change="Objetivo: +10% superado"
                trend="stable"
                icon={<Rocket className="w-5 h-5" />}
              />
            </section>
          )}

          {/* Bento Chart and Rankings Grid */}
          {isLoading ? (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
              {/* Chart Panel Skeleton */}
              <div className="col-span-1 lg:col-span-8 bg-surface-container-lowest rounded-md border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col h-[400px] justify-between overflow-hidden">
                <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low animate-pulse">
                  <Skeleton className="w-44 h-6" />
                  <Skeleton className="w-8 h-8 rounded-md" />
                </div>
                <div className="flex-1 p-6 flex items-end gap-6 h-[240px] px-8 pb-10 select-none animate-pulse">
                  {[...Array(6)].map((_, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <Skeleton
                        className="w-full rounded-t-sm"
                        style={{ height: `${50 + (idx % 3) * 60}px` }}
                      />
                      <Skeleton className="w-8 h-4" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Rankings Panel Skeleton */}
              <div className="col-span-1 lg:col-span-4 bg-surface-container-lowest rounded-md border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col h-[400px] overflow-hidden">
                <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low animate-pulse">
                  <Skeleton className="w-40 h-6" />
                  <Skeleton className="w-8 h-8 rounded-md" />
                </div>
                <div className="p-6 flex flex-col gap-4 overflow-y-auto animate-pulse">
                  {[...Array(4)].map((_, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border-b border-outline-variant/35 pb-3"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <div className="flex flex-col gap-1">
                          <Skeleton className="w-24 h-4" />
                          <Skeleton className="w-16 h-3" />
                        </div>
                      </div>
                      <Skeleton className="w-12 h-5 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
              {/* Custom Chart Panel (Spans 8 cols) */}
              <div className="col-span-1 lg:col-span-8 bg-surface-container-lowest rounded-md border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col h-[400px] justify-between overflow-hidden">
                <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                  <h3 className="font-title-lg text-title-lg text-on-surface font-semibold">
                    Evolución de Ingresos
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 rounded-md hover:bg-surface-container text-on-surface-variant w-8 h-8 shadow-none active:scale-95"
                  >
                    <MoreVertical data-icon="more-vertical" />
                  </Button>
                </div>

                {/* Graphical representation */}
                <div className="flex-1 p-6 relative flex items-end gap-4 select-none bg-surface-container-lowest">
                  {/* CSS Bars Container */}
                  <div className="w-full flex justify-between items-end h-[240px] pt-8 z-10 px-4">
                    {chartData.map((data, idx) => {
                      const isLast = idx === chartData.length - 1;
                      const isHovered = activeBar === data.month;

                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setActiveBar(data.month)}
                          onMouseLeave={() => setActiveBar(null)}
                          className={`w-12 rounded-t-sm transition-all duration-300 relative group cursor-pointer ${data.pct} ${
                            isLast
                              ? "bg-primary/80 hover:bg-primary"
                              : "bg-surface-container-high hover:bg-secondary-container"
                          }`}
                        >
                          {/* Custom Tooltip */}
                          <div
                            className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-md px-2 py-[2px] rounded text-[11px] whitespace-nowrap transition-all duration-200 pointer-events-none shadow-md ${
                              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                            }`}
                          >
                            {data.month}: {data.label}
                          </div>

                          {/* Month Label below bar */}
                          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-label-md font-label-md text-on-surface-variant">
                            {data.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dashed Grid Helper Lines */}
                  <div className="absolute inset-x-6 top-6 bottom-8 border-t border-b border-dashed border-outline-variant/30 flex flex-col justify-between pointer-events-none">
                    <div className="border-t border-dashed border-outline-variant/20 w-full"></div>
                    <div className="border-t border-dashed border-outline-variant/20 w-full"></div>
                  </div>
                </div>
              </div>

              {/* Rankings Panel (Spans 4 cols) */}
              <div className="col-span-1 lg:col-span-4 bg-surface-container-lowest rounded-md border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col h-[400px] overflow-hidden">
                <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                  <h3 className="font-title-lg text-title-lg text-on-surface font-semibold">
                    Ranking de Locales
                  </h3>
                  <span className="font-label-md text-primary bg-secondary-container/50 rounded-full px-2 py-[2px] font-bold">
                    Top 3
                  </span>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <ul className="flex flex-col divide-y divide-outline-variant/65">
                    {filteredRankings.map((branch, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-title-md text-title-md font-bold text-outline group-hover:text-primary transition-colors">
                            #{branch.rank}
                          </span>
                          <div>
                            <p className="font-body-md text-body-md font-semibold text-on-surface">
                              {branch.name}
                            </p>
                            <p className="text-[12px] text-on-surface-variant font-medium flex items-center gap-1">
                              <Store className="w-3.5 h-3.5" />
                              <span>Local activo</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-body-lg text-body-lg font-bold text-primary">
                            {branch.revenue}
                          </p>
                          <span
                            className={`text-label-md font-bold inline-flex items-center gap-1 ${
                              branch.change.startsWith("+") ? "text-tertiary" : "text-error"
                            }`}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>{branch.change}</span>
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Alerts Broadcasting Panel */}
          <section className="mt-gutter mb-gutter">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6">
              <h3 className="font-medium text-xl text-on-surface mb-2">
                Emitir Alerta del Sistema
              </h3>
              <p className="text-body-sm text-on-surface-variant mb-6">
                Envía una notificación emergente, aviso crítico o mensaje informativo a los usuarios
                del sistema.
              </p>

              {alertStatus?.success && (
                <Alert variant="success" className="mb-4">
                  ¡Alerta enviada correctamente a los usuarios objetivo!
                </Alert>
              )}

              {alertStatus?.error && (
                <Alert variant="error" className="mb-4">
                  {alertStatus.error}
                </Alert>
              )}

              <form onSubmit={handleSendAlert} className="flex flex-col gap-4 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="alert-title"
                      className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider"
                    >
                      Título de la Alerta
                    </label>
                    <input
                      id="alert-title"
                      type="text"
                      required
                      placeholder="Ej: Mantenimiento Programado"
                      value={alertForm.title}
                      onChange={(e) => setAlertForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-md"
                    />
                  </div>

                  {/* Type and Target */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="alert-type"
                        className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider"
                      >
                        Tipo
                      </label>
                      <select
                        id="alert-type"
                        value={alertForm.type}
                        onChange={(e) =>
                          setAlertForm((prev) => ({ ...prev, type: e.target.value }))
                        }
                        className="px-3 py-2.5 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-md"
                      >
                        <option value="EMERGENTE">Emergente (Inicio)</option>
                        <option value="AVISO">Aviso (Crítico)</option>
                        <option value="NOTIFICACION">Notificación</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="alert-target"
                        className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider"
                      >
                        Destinatarios
                      </label>
                      <select
                        id="alert-target"
                        value={alertForm.targetRole}
                        onChange={(e) =>
                          setAlertForm((prev) => ({ ...prev, targetRole: e.target.value }))
                        }
                        className="px-3 py-2.5 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-md"
                      >
                        <option value="">Todos los Roles</option>
                        <option value="JEFE">Solo Dueños (JEFE)</option>
                        <option value="EMPLEADO">Solo Empleados</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="alert-desc"
                    className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider"
                  >
                    Contenido / Descripción
                  </label>
                  <textarea
                    id="alert-desc"
                    required
                    rows={3}
                    placeholder="Escribe el mensaje detallado aquí..."
                    value={alertForm.description}
                    onChange={(e) =>
                      setAlertForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-md resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="mt-2 flex">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={
                      isAlertSending || !alertForm.title.trim() || !alertForm.description.trim()
                    }
                    className="py-2.5 px-6 font-bold shadow-md rounded-xl active:scale-[0.98] disabled:opacity-50"
                  >
                    {isAlertSending ? "Enviando..." : "Emitir Notificación"}
                  </Button>
                </div>
              </form>
            </div>
          </section>
        </main>

        {/* Mobile menu bar */}
        <BottomNav />
      </div>
    </div>
  );
}
