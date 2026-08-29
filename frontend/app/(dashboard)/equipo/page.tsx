"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamicImport from "next/dynamic";
import { Plus, CheckCircle2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TrialBanner from "@/components/TrialBanner";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/volta-ui";
import { useTeamList } from "@/lib/hooks/useTeamList";
import { TeamFiltersBar } from "@/components/team/TeamFiltersBar";
import { TeamTable } from "@/components/team/TeamTable";
import { TeamPagination } from "@/components/team/TeamPagination";
import type { WorkerToEdit } from "@/components/InviteWorkerModal";

const InviteWorkerModal = dynamicImport(() => import("@/components/InviteWorkerModal"), {
  ssr: false,
});
const NewAppointmentModal = dynamicImport(() => import("@/components/NewAppointmentModal"), {
  ssr: false,
});

export default function EquipoPage() {
  const { data: session } = useSession();
  const businessId = session?.user?.businessId || "";
  const currentUserId = session?.user?.id;

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteModalTriggerRect, setInviteModalTriggerRect] = useState<DOMRect | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerToEdit | null>(null);

  const {
    isLoading,
    fetchMembers,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    visibleColumns,
    toggleColumn,
    currentPage,
    setCurrentPage,
    totalPages,
    startItem,
    endItem,
    filteredMembers,
    paginatedMembers,
    handleSaveWorker,
    handleDeleteWorker,
    showToast,
    toastText,
  } = useTeamList(businessId, currentUserId);

  useEffect(() => {
    if (session?.user?.name) {
      document.title = `Equipo - ${session.user.name} - Volta`;
    }
  }, [session]);

  const handleOpenInviteModal = (e?: React.MouseEvent<HTMLButtonElement>) => {
    setEditingWorker(null);
    if (e?.currentTarget) {
      setInviteModalTriggerRect(e.currentTarget.getBoundingClientRect());
    }
    setIsInviteModalOpen(true);
  };

  const handleEditWorker = (worker: WorkerToEdit) => {
    setEditingWorker(worker);
    setIsInviteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      <Sidebar onNewAppointmentClick={() => setIsAppointmentModalOpen(true)} />
      <BottomNav />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
        <TrialBanner />

        <main className="p-gutter max-w-container-max w-full mx-auto flex-1 flex flex-col pt-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-headline-lg text-on-surface font-semibold tracking-tight">
                Equipo
              </h1>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Administra los trabajadores, turnos y roles de acceso a tu negocio.
              </p>
            </div>
            <div className="shrink-0">
              <Header />
            </div>
          </div>

          {/* Action & Filter Toolbar */}
          <TeamFiltersBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            visibleColumns={visibleColumns}
            toggleColumn={toggleColumn}
            onInviteWorkerClick={handleOpenInviteModal}
            onFilterResetPage={() => setCurrentPage(1)}
          />

          {/* Main Table Container */}
          <div className="w-full flex-1 overflow-auto border-t border-outline-variant/30 flex flex-col justify-between">
            <TeamTable
              isLoading={isLoading}
              members={paginatedMembers}
              visibleColumns={visibleColumns}
              currentUserId={currentUserId}
              onEditWorker={handleEditWorker}
              onDeleteWorker={handleDeleteWorker}
              onInviteWorkerClick={handleOpenInviteModal}
            />

            {/* Pagination Footer */}
            {!isLoading && (
              <TeamPagination
                startItem={startItem}
                endItem={endItem}
                totalItems={filteredMembers.length}
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
          onClick={handleOpenInviteModal}
          variant="default"
          className="md:hidden fixed bottom-20 right-6 z-40 p-4 rounded-full shadow-lg"
          aria-label="Invitar nuevo trabajador"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Invite / Edit Worker Modal */}
      <InviteWorkerModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setEditingWorker(null);
        }}
        onSave={handleSaveWorker}
        workerToEdit={editingWorker}
        triggerRect={inviteModalTriggerRect}
      />

      {/* New Appointment Modal */}
      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSave={() => fetchMembers()}
      />

      {/* Toast Feedback */}
      {showToast && (
        <Alert
          variant="info"
          className="fixed top-6 right-6 z-[60] flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
          <p className="text-sm font-medium text-on-secondary-container">{toastText}</p>
        </Alert>
      )}
    </div>
  );
}
