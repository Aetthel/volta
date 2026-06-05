"use client";

import { useState } from "react";
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
  Store 
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRange, setSelectedRange] = useState("Últimos 30 días");
  const [activeBar, setActiveBar] = useState<string | null>(null);

  const chartData = [
    { month: "Ene", val: 28000, label: "€28.0k", pct: "h-[30%]" },
    { month: "Feb", val: 32000, label: "€32.0k", pct: "h-[45%]" },
    { month: "Mar", val: 30000, label: "€30.0k", pct: "h-[40%]" },
    { month: "Abr", val: 38000, label: "€38.0k", pct: "h-[60%]" },
    { month: "May", val: 35000, label: "€35.0k", pct: "h-[55%]" },
    { month: "Jun", val: 45200, label: "€45.2k", pct: "h-[85%]" },
  ];

  const rankings = [
    { rank: 1, name: "Sede Centro - Madrid", revenue: "€22,400", change: "+14%" },
    { rank: 2, name: "Sede Velázquez - Madrid", revenue: "€16,800", change: "+9%" },
    { rank: 3, name: "Sede Sarrià - Barcelona", revenue: "€6,000", change: "-2%" },
  ];

  const filteredRankings = rankings.filter((branch) =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Sidebar navigation */}
      <Sidebar onNewAppointmentClick={() => {}} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[240px]">
        {/* Header Search */}
        <Header 
          searchPlaceholder="Buscar en el panel global..." 
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Canvas */}
        <main className="p-margin-mobile md:p-gutter max-w-container-max w-full mx-auto flex-1">
          
          {/* Dashboard Header & Range Selector */}
          <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <h1 className="font-display text-headline-lg text-on-surface font-semibold tracking-tight mb-1">
                Panel de Control Global
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
                Resumen de rendimiento y métricas operativas.
              </p>
            </div>
            
            {/* Range dropdown */}
            <div className="relative group cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container transition-colors shadow-sm select-none">
                <Calendar className="w-5 h-5 text-on-surface-variant" />
                <span className="font-label-lg text-on-surface font-semibold">{selectedRange}</span>
                <ChevronDown className="w-5 h-5 text-on-surface-variant" />
              </div>
            </div>
          </section>

          {/* Grid KPIs */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Ingresos Totales"
              value="€45,200"
              change="+12% vs mes anterior"
              trend="up"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <MetricCard
              title="Clientes Totales"
              value="5,400"
              change="+8% vs mes anterior"
              trend="up"
              icon={<Group className="w-5 h-5" />}
            />
            <MetricCard
              title="Ticket Promedio"
              value="€32"
              change="+5% vs mes anterior"
              trend="up"
              icon={<CreditCard className="w-5 h-5" />}
            />
            <MetricCard
              title="Crecimiento Mensual"
              value="+15%"
              change="Objetivo: +10% superado"
              trend="stable"
              icon={<Rocket className="w-5 h-5" />}
            />
          </section>

          {/* Bento Chart and Rankings Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Custom Chart Panel (Spans 8 cols) */}
            <div className="col-span-1 lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col h-[400px] justify-between">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <h3 className="font-title-lg text-title-lg text-on-surface font-semibold">
                  Evolución de Ingresos
                </h3>
                <button className="p-1 rounded-md hover:bg-surface-container transition-colors text-on-surface-variant cursor-pointer">
                  <MoreVertical className="w-5 h-5" />
                </button>
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
                        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-md px-2 py-[2px] rounded text-[11px] whitespace-nowrap transition-all duration-200 pointer-events-none shadow-md ${
                          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                        }`}>
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
            <div className="col-span-1 lg:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col h-[400px]">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <h3 className="font-title-lg text-title-lg text-on-surface font-semibold">
                  Ranking de Sedes
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
                            <span>Sucursal activa</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-body-lg text-body-lg font-bold text-primary">
                          {branch.revenue}
                        </p>
                        <span className={`text-label-md font-bold inline-flex items-center gap-1 ${
                          branch.change.startsWith("+") ? "text-tertiary" : "text-error"
                        }`}>
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
        </main>

        {/* Mobile menu bar */}
        <BottomNav />
      </div>
    </div>
  );
}
