"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { apiClient } from "@/lib/apiClient";

export interface BusinessItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
}

export function useLocationsList(isAdmin: boolean) {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state for Location
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<BusinessItem | null>(null);
  const [businessForm, setBusinessForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  // Modals state for Workers of a specific location
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessItem | null>(null);
  const [isWorkersModalOpen, setIsWorkersModalOpen] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const [isAddWorkerModalOpen, setIsAddWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any | null>(null);
  const [workerFormData, setWorkerFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLEADO" as "JEFE" | "EMPLEADO",
  });
  const [workerErrorMsg, setWorkerErrorMsg] = useState("");

  const fetchBusinesses = useCallback(async () => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiClient.get<BusinessItem[]>("/admin/businesses");
      if (Array.isArray(res.data)) {
        setBusinesses(res.data);
      }
    } catch (e) {
      console.error("Error loading businesses:", e);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const fetchWorkers = useCallback(async (bizId: string) => {
    try {
      const res = await apiClient.team.getAll<any[]>(bizId);
      if (Array.isArray(res.data)) {
        setWorkers(res.data);
      }
    } catch (err) {
      console.error("Error loading business workers:", err);
    }
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setEditingBusiness(null);
    setBusinessForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
    });
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((biz: BusinessItem) => {
    setEditingBusiness(biz);
    setBusinessForm({
      name: biz.name,
      email: biz.email || "",
      phone: biz.phone || "",
      address: biz.address || "",
      password: "",
    });
    setIsModalOpen(true);
  }, []);

  const handleSaveBusiness = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const isEdit = !!editingBusiness;
      const url = isEdit ? `/business/${editingBusiness.id}` : "/admin/businesses";
      const payload = isEdit
        ? {
            name: businessForm.name,
            email: businessForm.email,
            phone: businessForm.phone,
            address: businessForm.address,
          }
        : businessForm;

      const res = isEdit
        ? await apiClient.put(url, payload)
        : await apiClient.post(url, payload);

      if (res.error) {
        alert(
          res.error ||
            "Error al guardar el negocio. Asegúrate de que el email sea único y el teléfono tenga formato válido."
        );
        return;
      }

      fetchBusinesses();
      setBusinessForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
      });
      setEditingBusiness(null);
      setIsModalOpen(false);
    },
    [editingBusiness, businessForm, fetchBusinesses]
  );

  const handleDeleteBusiness = useCallback(
    async (id: string, currentUserId?: string) => {
      if (currentUserId && currentUserId === id) {
        alert("No puedes eliminar tu propia cuenta de administrador.");
        return;
      }
      const confirmDelete = window.confirm(
        "¿Estás seguro de que deseas eliminar este local? Se borrarán de forma permanente todas sus citas y clientes de la base de datos."
      );
      if (!confirmDelete) return;

      const res = await apiClient.delete(`/admin/businesses/${id}`);
      if (res.error) {
        alert(res.error || "Error al eliminar el negocio.");
        return;
      }
      fetchBusinesses();
    },
    [fetchBusinesses]
  );

  // Workers actions
  const handleOpenWorkersModal = useCallback(
    (biz: BusinessItem) => {
      setSelectedBusiness(biz);
      setWorkers([]);
      fetchWorkers(biz.id);
      setIsWorkersModalOpen(true);
    },
    [fetchWorkers]
  );

  const handleOpenCreateWorkerModal = useCallback(() => {
    setEditingWorker(null);
    setWorkerFormData({
      name: "",
      email: "",
      password: "",
      role: "EMPLEADO",
    });
    setWorkerErrorMsg("");
    setIsAddWorkerModalOpen(true);
  }, []);

  const handleOpenEditWorkerModal = useCallback((worker: any) => {
    setEditingWorker(worker);
    setWorkerFormData({
      name: worker.name,
      email: worker.email,
      password: "",
      role: worker.role,
    });
    setWorkerErrorMsg("");
    setIsAddWorkerModalOpen(true);
  }, []);

  const handleSaveWorker = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setWorkerErrorMsg("");
      if (!selectedBusiness) return;

      if (!workerFormData.name || !workerFormData.email) {
        setWorkerErrorMsg("El nombre y el correo son obligatorios.");
        return;
      }
      if (!editingWorker && !workerFormData.password) {
        setWorkerErrorMsg("La contraseña es obligatoria para nuevos trabajadores.");
        return;
      }

      const isEdit = !!editingWorker;
      const payload: any = {
        name: workerFormData.name,
        email: workerFormData.email,
        role: workerFormData.role,
        businessId: selectedBusiness.id,
      };
      if (workerFormData.password) {
        payload.password = workerFormData.password;
      }

      const res = isEdit
        ? await apiClient.team.update(editingWorker.id, payload)
        : await apiClient.team.invite(payload);

      if (res.error) {
        setWorkerErrorMsg(res.error);
        return;
      }

      setIsAddWorkerModalOpen(false);
      fetchWorkers(selectedBusiness.id);
    },
    [selectedBusiness, editingWorker, workerFormData, fetchWorkers]
  );

  const handleDeleteWorker = useCallback(
    async (id: string) => {
      if (!selectedBusiness) return;
      if (!window.confirm("¿Estás seguro de que deseas eliminar este trabajador?")) {
        return;
      }

      const res = await apiClient.team.delete(id);
      if (res.error) {
        alert(res.error || "Error al eliminar trabajador.");
        return;
      }
      fetchWorkers(selectedBusiness.id);
    },
    [selectedBusiness, fetchWorkers]
  );

  const filteredBusinesses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return businesses;
    return businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q)
    );
  }, [businesses, searchQuery]);

  return {
    businesses,
    filteredBusinesses,
    isLoading,
    searchQuery,
    setSearchQuery,
    fetchBusinesses,
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
  };
}
