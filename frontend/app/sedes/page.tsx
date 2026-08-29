"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TrialBanner from "@/components/TrialBanner";
import {
  Alert,
  Button,
  Card,
  PageHeader,
  Skeleton,
} from "@/components/ui/volta-ui";
import { useLocationsList } from "@/lib/hooks/useLocationsList";
import { LocationCard } from "@/components/sedes/LocationCard";
import { LocationModal } from "@/components/sedes/LocationModal";
import { LocationWorkersModal } from "@/components/sedes/LocationWorkersModal";

export default function SedesPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const {
    filteredBusinesses,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    editingBusiness,
    businessForm,
    setBusinessForm,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveBusiness,
    handleDeleteBusiness,
    selectedBusiness,
    isWorkersModalOpen,
    setIsWorkersModalOpen,
    workers,
    isAddWorkerModalOpen,
    setIsAddWorkerModalOpen,
    editingWorker,
    workerFormData,
    setWorkerFormData,
    workerErrorMsg,
    handleOpenWorkersModal,
    handleOpenCreateWorkerModal,
    handleOpenEditWorkerModal,
    handleSaveWorker,
    handleDeleteWorker,
  } = useLocationsList(isAdmin);

  useEffect(() => {
    if (session?.user?.name) {
      document.title = `Locales - ${session.user.name} - Volta`;
    }
  }, [session]);

  if (status !== "loading" && !isAdmin) {
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
        <TrialBanner />
        <main className="p-gutter max-w-container-max w-full mx-auto flex-1">
          <PageHeader
            title="Gestión de Locales"
            description="Registra y administra las cuentas de salones en la plataforma."
            actions={
              <Button
                variant="primary"
                size="lg"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1 px-6 py-2 self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir Local</span>
              </Button>
            }
          />

          {/* Grid Layout of Businesses */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="p-6 flex flex-col justify-between h-[280px]">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                        <Skeleton className="w-32 h-5" />
                      </div>
                      <Skeleton className="w-16 h-5 rounded" />
                    </div>
                    <div className="flex flex-col gap-2 mt-6">
                      <Skeleton className="w-48 h-4" />
                      <Skeleton className="w-36 h-4" />
                      <Skeleton className="w-56 h-4" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Skeleton className="w-24 h-9 rounded-lg" />
                    <Skeleton className="w-24 h-9 rounded-lg" />
                  </div>
                </Card>
              ))
            ) : filteredBusinesses.length > 0 ? (
              filteredBusinesses.map((biz) => (
                <LocationCard
                  key={biz.id}
                  business={biz}
                  currentUserId={session?.user?.id}
                  onOpenWorkers={handleOpenWorkersModal}
                  onEdit={handleOpenEditModal}
                  onDelete={(id) => handleDeleteBusiness(id, session?.user?.id)}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-on-surface-variant text-body-lg">
                No se encontraron locales registrados.
              </div>
            )}
          </section>
        </main>
        <BottomNav />
      </div>

      {/* Create / Edit Business Modal */}
      <LocationModal
        isOpen={isModalOpen}
        editingBusiness={editingBusiness}
        businessForm={businessForm}
        setBusinessForm={setBusinessForm}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveBusiness}
      />

      {/* Workers Management Sub-Modal */}
      <LocationWorkersModal
        isOpen={isWorkersModalOpen}
        selectedBusiness={selectedBusiness}
        workers={workers}
        isAddWorkerModalOpen={isAddWorkerModalOpen}
        editingWorker={editingWorker}
        workerFormData={workerFormData}
        setWorkerFormData={setWorkerFormData}
        workerErrorMsg={workerErrorMsg}
        onClose={() => setIsWorkersModalOpen(false)}
        onOpenCreateWorker={handleOpenCreateWorkerModal}
        onOpenEditWorker={handleOpenEditWorkerModal}
        onCloseAddWorkerModal={() => setIsAddWorkerModalOpen(false)}
        onSaveWorker={handleSaveWorker}
        onDeleteWorker={handleDeleteWorker}
      />
    </div>
  );
}
