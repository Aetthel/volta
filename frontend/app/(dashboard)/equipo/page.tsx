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

import InviteWorkerModal from "@/components/InviteWorkerModal";
import NewAppointmentModal from "@/components/NewAppointmentModal";

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

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
        <TrialBanner />

        <main className="flex-1 flex flex-col w-full p-0">
          {/* Top Header & Controls Toolbar */}
          <div className="p-gutter max-w-container-max w-full mx-auto pt-6 pb-4 flex flex-col gap-4 bg-surface shrink-0">
            {/* Title & Header Profile */}
            <div className="flex items-center justify-between gap-3">
              <h1 className="font-display text-headline-lg text-on-surface font-semibold capitalize tracking-tight">
                Gestión de Equipo
              </h1>
              <div className="shrink-0">
                <Header />
              </div>
            </div>

            {/* Filter Toolbar and Actions */}
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
          </div>

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
          <Plus className="w-6 h-6" />
        </Button>

        <BottomNav />
      </div>

      {/* Invite/Edit Worker Modal */}
      {isInviteModalOpen && (
        <InviteWorkerModal
          isOpen={isInviteModalOpen}
          onClose={() => {
            setIsInviteModalOpen(false);
            setEditingWorker(null);
            setInviteModalTriggerRect(null);
          }}
          onSave={handleSaveWorker}
          workerToEdit={editingWorker}
          triggerRect={inviteModalTriggerRect}
        />
      )}

      {/* New Appointment Modal */}
      {isAppointmentModalOpen && (
        <NewAppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={() => setIsAppointmentModalOpen(false)}
          onSave={() => {
            setIsAppointmentModalOpen(false);
            fetchMembers();
          }}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Alert variant="info" className="flex items-center gap-2 shadow-lg bg-surface border border-primary/20">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{toastText}</span>
          </Alert>
        </div>
      )}
    </div>
  );
}
