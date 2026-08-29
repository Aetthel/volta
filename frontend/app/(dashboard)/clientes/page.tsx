"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamicImport from "next/dynamic";
import { Plus, ShieldCheck, MessageCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TrialBanner from "@/components/TrialBanner";
import Header from "@/components/Header";
import { Alert } from "@/components/ui/volta-ui";
import { Button } from "@/components/ui/button";
import { useClientsList, type ClientItem } from "@/lib/hooks/useClientsList";
import { ClientFiltersBar } from "@/components/clients/ClientFiltersBar";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientPagination } from "@/components/clients/ClientPagination";

const AddClientModal = dynamicImport(() => import("@/components/AddClientModal"), {
  ssr: false,
});
const NewAppointmentModal = dynamicImport(() => import("@/components/NewAppointmentModal"), {
  ssr: false,
});

export default function ClientesPage() {
  const { data: session } = useSession();
  const businessId = session?.user?.businessId || "";

  // Modals & client selection state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientModalTriggerRect, setClientModalTriggerRect] = useState<DOMRect | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [, setSelectedClientForAppointment] = useState<ClientItem | null>(null);

  // Custom Clients List Hook
  const {
    isLoading,
    fetchData,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    activityFilter,
    setActivityFilter,
    visibleColumns,
    toggleColumn,
    currentPage,
    setCurrentPage,
    totalPages,
    startItem,
    endItem,
    filteredClients,
    paginatedClients,
    getClientAppointmentsCount,
    handleSaveClient,
    handleDeleteClient,
    handleSendWhatsAppConsent,
    handleSendCustomMessage,
    handleExportCSV,
    showConsentToast,
    toastPhone,
    showGeneralToast,
    toastText,
  } = useClientsList(businessId);

  useEffect(() => {
    if (session?.user?.name) {
      document.title = `Clientes - ${session.user.name} - Volta`;
    }
  }, [session]);

  const handleOpenNewClientModal = (e?: React.MouseEvent<HTMLButtonElement>) => {
    setEditingClient(null);
    if (e?.currentTarget) {
      setClientModalTriggerRect(e.currentTarget.getBoundingClientRect());
    }
    setIsClientModalOpen(true);
  };

  const handleEditClient = (client: ClientItem) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  };

  const handleScheduleAppointment = (client: ClientItem) => {
    setSelectedClientForAppointment(client);
    setIsAppointmentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Navigation Sidebar */}
      <Sidebar
        onNewAppointmentClick={() => {
          setSelectedClientForAppointment(null);
          setIsAppointmentModalOpen(true);
        }}
      />

      {/* Main Content Canvas */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
        <TrialBanner />
        <main className="flex-1 flex flex-col w-full p-0">
          {/* Top Header & Controls Toolbar */}
          <div className="p-gutter max-w-container-max w-full mx-auto pt-6 pb-4 flex flex-col gap-4 bg-surface shrink-0">
            {/* Title & Header Profile */}
            <div className="flex items-center justify-between gap-3">
              <h1 className="font-display text-headline-lg text-on-surface font-semibold capitalize tracking-tight">
                Gestión de Clientes
              </h1>
              <div className="shrink-0">
                <Header />
              </div>
            </div>

            {/* Filter Toolbar and Actions */}
            <ClientFiltersBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              activityFilter={activityFilter}
              setActivityFilter={setActivityFilter}
              visibleColumns={visibleColumns}
              toggleColumn={toggleColumn}
              onExportCSV={handleExportCSV}
              onNewClientClick={handleOpenNewClientModal}
              onFilterResetPage={() => setCurrentPage(1)}
            />
          </div>

          {/* Main Table Container */}
          <div className="w-full flex-1 overflow-auto border-t border-outline-variant/30 flex flex-col justify-between">
            <ClientsTable
              isLoading={isLoading}
              clients={paginatedClients}
              visibleColumns={visibleColumns}
              getClientAppointmentsCount={getClientAppointmentsCount}
              onSendWhatsAppConsent={handleSendWhatsAppConsent}
              onSendCustomMessage={handleSendCustomMessage}
              onScheduleAppointment={handleScheduleAppointment}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
              onNewClientClick={handleOpenNewClientModal}
            />

            {/* Pagination Footer */}
            {!isLoading && (
              <ClientPagination
                startItem={startItem}
                endItem={endItem}
                totalItems={filteredClients.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
                onNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              />
            )}
          </div>
        </main>

        {/* Mobile Floating Action Button */}
        <Button
          onClick={handleOpenNewClientModal}
          variant="default"
          className="md:hidden fixed bottom-20 right-6 z-40 p-4 rounded-full shadow-lg"
          aria-label="Añadir nuevo cliente"
        >
          <Plus className="w-5 h-5" />
        </Button>

        <BottomNav />
      </div>

      {/* Add / Edit Client Modal */}
      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setEditingClient(null);
        }}
        onSave={(data) =>
          handleSaveClient(data, () => {
            setIsClientModalOpen(false);
            setEditingClient(null);
          })
        }
        clientToEdit={editingClient}
        triggerRect={clientModalTriggerRect}
      />

      {/* Appointment booking Modal */}
      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setSelectedClientForAppointment(null);
        }}
        onSave={() => fetchData()}
      />

      {/* Feedback Toasts */}
      {showConsentToast && (
        <Alert
          variant="info"
          className="fixed top-6 right-6 z-[60] flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm"
        >
          <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-on-secondary-container text-sm">
              Consentimiento Reenviado
            </p>
            <p className="text-xs text-on-secondary-container/80">
              Mensaje LOPD reenviado a <span className="font-semibold">{toastPhone}</span> por WhatsApp.
            </p>
          </div>
        </Alert>
      )}

      {showGeneralToast && (
        <Alert
          variant="info"
          className="fixed top-6 right-6 z-[60] flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm"
        >
          <MessageCircle className="w-5 h-5 text-secondary shrink-0" />
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-on-secondary-container text-sm">
              Información
            </p>
            <p className="text-xs text-on-secondary-container/80">{toastText}</p>
          </div>
        </Alert>
      )}
    </div>
  );
}
