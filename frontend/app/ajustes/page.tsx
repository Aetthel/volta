"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Store,
  Clock,
  CreditCard,
  Camera,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Save,
  Scissors,
  Palette,
  Sparkles,
  ShieldCheck,
  Lock,
  Plus,
  MessageSquare,
  Send,
  Loader2,
  Wifi,
  WifiOff,
  RefreshCw,
  Check,
  Pencil,
  X,
  User,
  Key,
  Users,
  UserPlus,
  Edit2,
  Trash2,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import NewAppointmentModal from "@/components/NewAppointmentModal";
import AddServiceModal from "@/components/AddServiceModal";
import { FieldGroup, Field, FieldLabel, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, FloatingInput } from "@/components/ui/volta-ui";

const DEFAULT_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuD4Ec4Zci7RmiQqA_-qTa0tdRpm9Wl1AVZQsYRoqmBCYgu-SrdSAZoK38if-6y3v-fI_rbpjvuXSX1DFFje1tbtmTQt0JTNiO8-dR8-QBSIhw6Ob2_GaRhoHHIUj_ssbabDqhqu3DNXv-QcDPpcQZCs0T6AirCFHbqrAQLOZ9Y-0DTH68gpUFZxyRQx4q2-DKgTBUU6cSPfG6LVM1L9xd3VaAr1PPApcF4Xlu4kLCaLYAbwyfkOOpjFQ234c3SqedBa-PqJ_pywDw";

export default function AjustesPage() {
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState(
    "¡Ajustes guardados correctamente!",
  );
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Custom tabs
  const [activeTab, setActiveTab] = useState("perfil");

  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<any | null>(null);

  const [hours, setHours] = useState<any[]>([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [savingHours, setSavingHours] = useState(false);

  const dayNames = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  // WhatsApp connection states
  const [whatsappStatus, setWhatsappStatus] = useState("DISCONNECTED");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);

  // Message templates states
  const [templates, setTemplates] = useState({
    welcomeMessage: "",
    reminderMessage: "",
  });
  const [isEditingTemplates, setIsEditingTemplates] = useState(false);
  const [savingTemplates, setSavingTemplates] = useState(false);

  const handleSaveAppointment = (data: any) => {
    console.log("Appointment booked from settings:", data);
  };

  const { data: session, update } = useSession();
  const businessId = session?.user?.businessId || "mock-business-id";
  const role = session?.user?.role || "EMPLEADO";

  // Admin settings state and handlers
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [savingAdmin, setSavingAdmin] = useState(false);

  // Logged-in worker settings state (Sobre ti)
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (session?.user) {
      if (role === "ADMIN") {
        setAdminForm({
          name: session.user.name || "",
          email: session.user.email || "",
          password: ""
        });
      } else {
        setUserForm({
          name: session.user.name || "",
          email: session.user.email || "",
          password: ""
        });
      }
    }
  }, [session, role]);

  const [userProfileData, setUserProfileData] = useState<any>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/backend/users`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const current = data.find((u: any) => u.id === session.user.id);
            if (current) {
              setUserProfileData(current);
            }
          }
        })
        .catch(err => console.error("Error fetching user profile data:", err));
    }
  }, [session]);

  const formatProfileDate = (dateString: string) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const handleSaveAdminSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setSavingAdmin(true);

    const payload: any = {
      name: adminForm.name,
      email: adminForm.email
    };
    if (adminForm.password) {
      payload.password = adminForm.password;
    }

    fetch(`/api/backend/users/${session.user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al guardar cambios");
        return data;
      })
      .then((updatedUser) => {
        update({
          name: updatedUser.name,
          email: updatedUser.email
        });
        setToastText("¡Ajustes de administrador guardados!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setAdminForm(prev => ({ ...prev, password: "" }));
      })
      .catch((err) => {
        alert(err.message);
      })
      .finally(() => {
        setSavingAdmin(false);
      });
  };

  // Refs for file uploads
  const businessLogoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const workerPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleBusinessLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, coverUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWorkerPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, workerPhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerBusinessLogoUpload = () => {
    businessLogoInputRef.current?.click();
  };

  const triggerCoverUpload = () => {
    coverInputRef.current?.click();
  };

  const triggerWorkerPhotoUpload = () => {
    workerPhotoInputRef.current?.click();
  };

  // Business profile state
  const [profile, setProfile] = useState({
    name: "Estilo & Spa (Ejemplo)",
    email: "contacto@volta.com",
    phone: "+34 912 345 678",
    address: "Calle de Velázquez, 45, Madrid",
    logoUrl: "/logo.png", // Business photo / logo
    coverUrl: "",        // Business banner
    description: "Espacio de belleza profesional dedicado al estilismo y cuidado personal.",
    ownerName: "Sofía Martín",
    workerPhoto: DEFAULT_AVATAR,     // Worker / Stylist photo
  });

  const fetchProfile = () => {
    if (!businessId) return;
    fetch(`/api/backend/business/${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          const savedWorkerPhoto = typeof window !== "undefined" ? localStorage.getItem("stylist_worker_photo") || "" : "";
          setProfile((prev) => ({
            ...prev,
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address || prev.address,
            logoUrl: data.logoUrl || prev.logoUrl,
            coverUrl: data.coverUrl || prev.coverUrl,
            description: data.description || prev.description,
            ownerName: data.ownerName || prev.ownerName,
            workerPhoto: savedWorkerPhoto || prev.workerPhoto || DEFAULT_AVATAR,
          }));
        }
      })
      .catch((e) => {
        console.error("Error loading business profile:", e);
      });
  };

  const fetchWhatsappStatus = () => {
    if (!businessId) return;
    fetch(`/api/backend/whatsapp/status?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setWhatsappStatus(data.status);
          setQrCode(data.qrCode);
          // Auto-activate polling if QR is already waiting (e.g. after page refresh)
          if (data.status === "WAITING_QR") {
            setPollingActive(true);
          } else {
            setPollingActive(false);
          }
        }
      })
      .catch((e) => console.error("Error loading whatsapp status:", e));
  };

  const fetchTemplates = () => {
    if (!businessId) return;
    fetch(`/api/backend/whatsapp/templates?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setTemplates({
            welcomeMessage: data.welcomeMessage || "",
            reminderMessage: data.reminderMessage || "",
          });
        }
      })
      .catch((e) => console.error("Error loading templates:", e));
  };

  useEffect(() => {
    fetchProfile();
    fetchWhatsappStatus();
    fetchTemplates();
    fetchServices();
    fetchHours();
  }, [businessId]);

  useEffect(() => {
    if (!pollingActive || !businessId) return;

    const interval = setInterval(() => {
      fetch(`/api/backend/whatsapp/status?businessId=${businessId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setWhatsappStatus(data.status);
            setQrCode(data.qrCode);
            if (data.status === "CONNECTED") {
              setPollingActive(false);
              setQrCode(null);
            } else if (data.status === "DISCONNECTED") {
              setPollingActive(false);
              setQrCode(null);
            }
          }
        })
        .catch((e) => console.error("Error polling whatsapp status:", e));
    }, 5000);

    return () => clearInterval(interval);
  }, [pollingActive, businessId]);

  // Workers state for the store manager (JEFE)
  const [workers, setWorkers] = useState<any[]>([]);
  const [showTrabajadoresTab, setShowTrabajadoresTab] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any | null>(null);
  const [workerFormData, setWorkerFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLEADO" as "JEFE" | "EMPLEADO",
  });
  const [workerErrorMsg, setWorkerErrorMsg] = useState("");

  const fetchWorkers = () => {
    if (!businessId || businessId === "mock-business-id" || role === "ADMIN") return;
    fetch(`/api/backend/users?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setWorkers(data);
          // Show tab only if business has more than 1 worker (including the jefe)
          setShowTrabajadoresTab(data.length > 1);
        }
      })
      .catch((err) => console.error("Error loading workers:", err));
  };

  const getWorkerSpecialty = (worker: any) => {
    const nameLower = worker.name.toLowerCase();
    if (nameLower.includes("lucía") || nameLower.includes("lucia")) return "Estilista Senior";
    if (nameLower.includes("marcos")) return "Barbero";
    if (nameLower.includes("sofía") || nameLower.includes("sofia")) return "Recepcionista";
    if (nameLower.includes("dani")) return "Colorista";
    return worker.role === "JEFE" ? "Directora de Estilo" : "Estilista";
  };

  const getWorkerStatus = (worker: any) => {
    const nameLower = worker.name.toLowerCase();
    if (nameLower.includes("sofía") || nameLower.includes("sofia")) return "INACTIVO";
    return "ACTIVO";
  };

  const getWorkerAvatar = (worker: any) => {
    if (worker.id === session?.user?.id) {
      return profile.workerPhoto || DEFAULT_AVATAR;
    }
    if (worker.name.toLowerCase().includes("lucía") || worker.name.toLowerCase().includes("lucia")) {
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuD4Ec4Zci7RmiQqA_-qTa0tdRpm9Wl1AVZQsYRoqmBCYgu-SrdSAZoK38if-6y3v-fI_rbpjvuXSX1DFFje1tbtmTQt0JTNiO8-dR8-QBSIhw6Ob2_GaRhoHHIUj_ssbabDqhqu3DNXv-QcDPpcQZCs0T6AirCFHbqrAQLOZ9Y-0DTH68gpUFZxyRQx4q2-DKgTBUU6cSPfG6LVM1L9xd3VaAr1PPApcF4Xlu4kLCaLYAbwyfkOOpjFQ234c3SqedBa-PqJ_pywDw";
    }
    return null;
  };


  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkerErrorMsg("");

    if (!workerFormData.name || !workerFormData.email) {
      setWorkerErrorMsg("El nombre y el correo son obligatorios.");
      return;
    }
    if (!editingWorker && !workerFormData.password) {
      setWorkerErrorMsg("La contraseña es obligatoria para nuevos trabajadores.");
      return;
    }

    const isEdit = !!editingWorker;
    const url = isEdit ? `/api/backend/users/${editingWorker.id}` : "/api/backend/users";
    const method = isEdit ? "PUT" : "POST";

    const payload: any = {
      name: workerFormData.name,
      email: workerFormData.email,
      role: workerFormData.role,
      businessId: businessId
    };
    if (workerFormData.password) {
      payload.password = workerFormData.password;
    }

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al guardar trabajador.");
        return data;
      })
      .then(() => {
        setToastText(isEdit ? "¡Trabajador actualizado!" : "¡Trabajador creado!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setIsWorkerModalOpen(false);
        fetchWorkers();
      })
      .catch((err) => {
        setWorkerErrorMsg(err.message);
      });
  };

  const handleDeleteWorker = (id: string) => {
    if (id === session?.user?.id) {
      alert("No puedes eliminar tu propia cuenta activa.");
      return;
    }
    if (!window.confirm("¿Estás seguro de que deseas eliminar este trabajador?")) {
      return;
    }
    fetch(`/api/backend/users/${id}`, {
      method: "DELETE"
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al eliminar");
        return res.json();
      })
      .then(() => {
        setToastText("¡Trabajador eliminado!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        fetchWorkers();
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const handleOpenCreateWorkerModal = () => {
    setEditingWorker(null);
    setWorkerFormData({
      name: "",
      email: "",
      password: "",
      role: "EMPLEADO"
    });
    setWorkerErrorMsg("");
    setIsWorkerModalOpen(true);
  };

  const handleOpenEditWorkerModal = (worker: any) => {
    setEditingWorker(worker);
    setWorkerFormData({
      name: worker.name,
      email: worker.email,
      password: "",
      role: worker.role
    });
    setWorkerErrorMsg("");
    setIsWorkerModalOpen(true);
  };

  useEffect(() => {
    fetchProfile();
    fetchWhatsappStatus();
    fetchTemplates();
    fetchServices();
    fetchHours();
    fetchWorkers();
  }, [businessId]);

  useEffect(() => {
    if (session?.user?.name) {
      document.title = `Ajustes - ${session.user.name} - Volta`;
    }
  }, [session]);

  const handleConnectWhatsapp = () => {
    setLoadingQr(true);
    fetch("/api/backend/whatsapp/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ businessId }),
    })
      .then((res) => res.json())
      .then(() => {
        setWhatsappStatus("WAITING_QR");
        setPollingActive(true);
        setLoadingQr(false);
      })
      .catch((err) => {
        console.error("Error starting whatsapp:", err);
        setLoadingQr(false);
      });
  };

  const handleDisconnectWhatsapp = () => {
    if (
      !window.confirm(
        "¿Seguro que deseas desconectar tu cuenta de WhatsApp? Se detendrán los mensajes automáticos.",
      )
    )
      return;

    fetch("/api/backend/whatsapp/disconnect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ businessId }),
    })
      .then((res) => res.json())
      .then(() => {
        setWhatsappStatus("DISCONNECTED");
        setQrCode(null);
        setPollingActive(false);
        setToastText("WhatsApp desconectado correctamente.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch((err) => {
        console.error("Error disconnecting whatsapp:", err);
      });
  };

  const handleSaveTemplates = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTemplates(true);
    fetch("/api/backend/whatsapp/templates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessId,
        welcomeMessage: templates.welcomeMessage,
        reminderMessage: templates.reminderMessage,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save templates");
        return res.json();
      })
      .then(() => {
        setIsEditingTemplates(false);
        setSavingTemplates(false);
        setToastText("Plantillas guardadas correctamente.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch((err) => {
        console.error("Error saving templates:", err);
        setSavingTemplates(false);
      });
  };

  const fetchServices = () => {
    if (!businessId) return;
    setLoadingServices(true);
    fetch(`/api/backend/services?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setServices(data);
        }
        setLoadingServices(false);
      })
      .catch((e) => {
        console.error("Error loading services:", e);
        setLoadingServices(false);
      });
  };

  const fetchHours = () => {
    if (!businessId) return;
    setLoadingHours(true);
    fetch(`/api/backend/business/${businessId}/hours`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHours(data);
        }
        setLoadingHours(false);
      })
      .catch((e) => {
        console.error("Error loading hours:", e);
        setLoadingHours(false);
      });
  };

  const handleSaveService = (serviceData: any) => {
    const isEdit = !!serviceData.id;
    const url = isEdit
      ? `/api/backend/services/${serviceData.id}`
      : `/api/backend/services`;
    const method = isEdit ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...serviceData,
        businessId,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save service");
        return res.json();
      })
      .then(() => {
        fetchServices();
        setToastText(
          isEdit
            ? "Servicio actualizado correctamente."
            : "Servicio añadido correctamente.",
        );
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch((err) => console.error("Error saving service:", err));
  };

  const handleDeleteService = (serviceId: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este servicio?")) return;

    fetch(`/api/backend/services/${serviceId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete service");
        return res.json();
      })
      .then(() => {
        fetchServices();
        setToastText("Servicio eliminado correctamente.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch((err) => console.error("Error deleting service:", err));
  };

  const handleSaveHours = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHours(true);

    fetch(`/api/backend/business/${businessId}/hours`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hours),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save hours");
        return res.json();
      })
      .then((data) => {
        setHours(data);
        setIsEditingHours(false);
        setSavingHours(false);
        setToastText("Horario de apertura guardado correctamente.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch((err) => {
        console.error("Error saving hours:", err);
        setSavingHours(false);
      });
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();

    fetch(`/api/backend/business/${businessId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        coverUrl: profile.coverUrl,
        logoUrl: profile.logoUrl, // Business photo / logo
        description: profile.description,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update business profile");
        return res.json();
      })
      .then(async (data) => {
        setIsEditingBusiness(false);
        setToastText("¡Información del negocio guardada!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);

        // Update NextAuth session state so header/sidebar updates automatically
        if (update) {
          await update({
            ...session,
            user: {
              ...session?.user,
              name: data.name,
              email: data.email,
            },
          });
        }
      })
      .catch((err) => {
        console.error("Error updating business profile:", err);
        setToastText(
          "Error al guardar los ajustes. Por favor, inténtelo de nuevo.",
        );
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setIsEditingBusiness(false);
      });
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!session?.user?.id) return;
    setSavingProfile(true);

    // Persist worker photo in localStorage
    if (typeof window !== "undefined" && profile.workerPhoto) {
      localStorage.setItem("stylist_worker_photo", profile.workerPhoto);
      window.dispatchEvent(new Event("stylist_worker_photo_changed"));
    }

    const payload: any = {
      name: userForm.name,
      email: userForm.email,
    };
    if (userForm.password) {
      payload.password = userForm.password;
    }

    fetch(`/api/backend/users/${session.user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al actualizar perfil.");
        return data;
      })
      .then(async (updatedUser) => {
        setIsEditingProfile(false);
        setToastText("¡Tu perfil personal ha sido guardado!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);

        // Update NextAuth session state so header/sidebar updates automatically
        if (update) {
          await update({
            ...session,
            user: {
              ...session?.user,
              name: updatedUser.name,
              email: updatedUser.email,
            },
          });
        }
        setUserForm((prev) => ({ ...prev, password: "" }));
      })
      .catch((err) => {
        console.error("Error updating profile:", err);
        setToastText(err.message || "Error al guardar el perfil. Por favor, inténtelo de nuevo.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setIsEditingProfile(false);
      })
      .finally(() => {
        setSavingProfile(false);
      });
  };

  if (role === "ADMIN") {
    return (
      <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
        {/* Sidebar navigation */}
        <Sidebar onNewAppointmentClick={() => {}} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen md:ml-[240px]">
          {/* Top Header */}
          <Header
            searchPlaceholder="Buscar en ajustes..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Content Canvas */}
          <main className="p-margin-mobile md:p-gutter max-w-container-max w-full mx-auto flex-1 relative">
            {/* Toast Notification Banner */}
            {showToast && (
              <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-secondary-container text-on-secondary-container border border-outline-variant px-6 py-4 rounded-md shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                <span className="font-label-lg text-label-lg font-semibold">
                  {toastText}
                </span>
              </div>
            )}

            {/* Page Title */}
            <div className="mb-6">
              <h1 className="font-display text-2xl sm:text-headline-lg text-on-surface font-semibold mb-1">
                Ajustes de Administrador
              </h1>
              <p className="font-body-md text-on-surface-variant font-medium">
                Gestiona tus credenciales de acceso y perfil de administrador.
              </p>
            </div>

            <div className="max-w-xl">
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span>Tu Perfil de Administrador</span>
                  </CardTitle>
                </CardHeader>
                <form onSubmit={handleSaveAdminSettings}>
                  <CardContent className="flex flex-col gap-6">
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="adminName">Nombre Completo</FieldLabel>
                        <FloatingInput
                          id="adminName"
                          label="Nombre y Apellidos"
                          value={adminForm.name}
                          onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                          icon={User}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="adminEmail">Correo Electrónico</FieldLabel>
                        <FloatingInput
                          id="adminEmail"
                          label="correo@empresa.com"
                          type="email"
                          value={adminForm.email}
                          onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                          icon={Mail}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="adminPassword">Nueva Contraseña (dejar en blanco para mantener)</FieldLabel>
                        <FloatingInput
                          id="adminPassword"
                          label="Mínimo 6 caracteres"
                          type="password"
                          value={adminForm.password}
                          onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                          icon={Key}
                        />
                      </Field>
                    </FieldGroup>
                  </CardContent>
                  <CardFooter className="border-t border-outline-variant/40 pt-4 flex justify-end gap-3">
                    <button
                      type="submit"
                      disabled={savingAdmin}
                      className="py-2.5 px-5 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container rounded-lg font-medium text-body-md active:scale-95 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {savingAdmin ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Guardar Cambios</span>
                        </>
                      )}
                    </button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </main>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Sidebar navigation */}
      <Sidebar onNewAppointmentClick={() => setIsAppointmentModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[240px]">
        {/* Top Header */}
        <Header
          searchPlaceholder="Buscar ajustes..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Canvas */}
        <main className="p-margin-mobile md:p-gutter max-w-container-max w-full mx-auto flex-1 relative">
          {/* Toast Notification Banner */}
          {showToast && (
            <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-secondary-container text-on-secondary-container border border-outline-variant px-6 py-4 rounded-md shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
              <CheckCircle className="w-5 h-5 text-primary shrink-0" />
              <span className="font-label-lg text-label-lg font-semibold">
                {toastText}
              </span>
            </div>
          )}

          {/* Page Title */}
          <div className="mb-4 sm:mb-6">
            <h1 className="font-display text-2xl sm:text-headline-lg text-on-surface font-semibold mb-1">
              Configuración
            </h1>
            <p className="font-body-md text-body-sm sm:text-body-md text-on-surface-variant font-medium">
              Gestiona tu identidad de marca, horarios, servicios y mensajería
              automatizada.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-outline-variant/65 mb-6 sm:mb-8 gap-4 sm:gap-6">
            <button
              onClick={() => setActiveTab("perfil")}
              className={`pb-3 font-label-lg text-label-lg font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "perfil"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Perfil y Seguridad
            </button>
            <button
              onClick={() => setActiveTab("mensajeria")}
              className={`pb-3 font-label-lg text-label-lg font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "mensajeria"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Mensajes y WhatsApp
            </button>
            <button
              onClick={() => setActiveTab("gestion")}
              className={`pb-3 font-label-lg text-label-lg font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "gestion"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Gestión del Negocio
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === "perfil" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
              {/* Profile Card (Screenshot 1 style) */}
              <Card className="lg:col-span-12">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                    <div className="flex items-center gap-6">
                      {/* Avatar */}
                      <div className="relative w-24 h-24 shrink-0">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-teal-500/30 bg-surface-container shadow-sm flex items-center justify-center">
                          <img
                            src={profile.workerPhoto || DEFAULT_AVATAR}
                            alt="Foto de perfil del profesional"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <input
                          type="file"
                          ref={workerPhotoInputRef}
                          onChange={handleWorkerPhotoChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={triggerWorkerPhotoUpload}
                          className="absolute -bottom-1 -left-1 w-8 h-8 bg-teal-800 hover:bg-teal-900 text-white rounded-full flex items-center justify-center border-2 border-surface shadow-md transition-all active:scale-90 cursor-pointer"
                          title="Cambiar foto de perfil"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Name, Badge, ID */}
                      <div className="flex flex-col gap-1">
                        <h2 className="font-display text-2xl font-semibold text-on-surface">
                          {userForm.name || "Sin nombre"}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-teal-750 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                            {role === "JEFE" ? "Administradora" : "Empleado"}
                          </span>
                          <span className="text-on-surface-variant/70 text-xs">
                            • ID: #GS-{userProfileData?.id?.slice(-3).toUpperCase() || "001"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                      {isEditingProfile && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingProfile(false);
                            if (session?.user) {
                              setUserForm({
                                name: session.user.name || "",
                                email: session.user.email || "",
                                password: "",
                              });
                            }
                          }}
                          className="py-2 px-4 border border-outline rounded-lg font-label-md text-label-md hover:bg-surface-variant/20 transition-all cursor-pointer font-semibold text-on-surface"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (isEditingProfile) {
                            handleSaveProfile();
                          } else {
                            setIsEditingProfile(true);
                          }
                        }}
                        className="py-2 px-4 bg-teal-850 hover:bg-teal-905 text-white rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer font-semibold shadow-sm"
                      >
                        {isEditingProfile ? (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Guardar Perfil</span>
                          </>
                        ) : (
                          <>
                            <Pencil className="w-4 h-4" />
                            <span>Editar Perfil</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <hr className="border-outline-variant/60 my-6" />

                  {/* Info Columns */}
                  {isEditingProfile ? (
                    <FieldGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Field>
                        <FieldLabel htmlFor="user-name">Nombre Completo</FieldLabel>
                        <input
                          id="user-name"
                          type="text"
                          required
                          value={userForm.name}
                          onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                          className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="user-email">Correo Electrónico</FieldLabel>
                        <input
                          id="user-email"
                          type="email"
                          required
                          value={userForm.email}
                          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                          className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="user-password">
                          Nueva Contraseña <span className="text-on-surface-variant/50 font-normal">(opcional)</span>
                        </FieldLabel>
                        <input
                          id="user-password"
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={userForm.password}
                          onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                          className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                        />
                      </Field>
                    </FieldGroup>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider block mb-1">
                          Nombre Completo
                        </span>
                        <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                          {userForm.name || "Elena Martínez"}
                        </p>
                      </div>
                      <div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider block mb-1">
                          Correo Electrónico
                        </span>
                        <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                          {userForm.email || "elena@glowstudio.com"}
                        </p>
                      </div>
                      <div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider block mb-1">
                          Fecha de Ingreso
                        </span>
                        <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                          {formatProfileDate(userProfileData?.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Security Card */}
              <Card className="lg:col-span-12 mt-2">
                <CardHeader>
                  <CardTitle className="text-primary">
                    Seguridad de la Cuenta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Password card */}
                    <div className="border border-outline-variant rounded-md p-3 sm:p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <Lock data-icon="lock" className="text-on-surface-variant shrink-0" />
                        <div>
                          <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                            Contraseña
                          </p>
                          <p className="font-body-md text-body-md text-on-surface-variant">
                            Actualizada hace 3 meses
                          </p>
                        </div>
                      </div>
                      <button className="text-primary hover:text-primary-container font-label-lg text-label-lg font-semibold cursor-pointer hover:underline">
                        Cambiar
                      </button>
                    </div>

                    {/* 2FA card */}
                    <div className="border border-outline-variant rounded-md p-3 sm:p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <ShieldCheck data-icon="shield-check" className="text-on-surface-variant shrink-0" />
                        <div>
                          <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                            Verificación en dos pasos
                          </p>
                          <p className="font-body-md text-body-md text-primary font-semibold">
                            Activada
                          </p>
                        </div>
                      </div>
                      <button className="text-error hover:text-error/80 font-label-lg text-label-lg font-semibold cursor-pointer hover:underline">
                        Desactivar
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : activeTab === "mensajeria" ? (
            /* Bento Grid Layout - Messaging & WhatsApp */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 animate-in fade-in duration-200">
              {/* WhatsApp Connection Card (Spans 5 cols) */}
              <Card className="sm:col-span-2 lg:col-span-5 flex flex-col justify-between min-h-0 sm:min-h-[420px]">
                <div>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-primary flex items-center gap-2">
                      <MessageSquare data-icon="message-square" />
                      <span>Canal de WhatsApp</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-col gap-4 sm:gap-6">
                      {/* Status Indicator */}
                      <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-md border border-outline-variant/50">
                        {whatsappStatus === "CONNECTED" ? (
                          <>
                            <div className="relative flex h-3 w-3 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </div>
                            <div>
                              <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                                Conectado
                              </p>
                              <p className="font-body-sm text-body-sm text-on-surface-variant">
                                Mensajería activa
                              </p>
                            </div>
                          </>
                        ) : whatsappStatus === "WAITING_QR" ? (
                          <>
                            <div className="relative flex h-3 w-3 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                            </div>
                            <div>
                              <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                                Esperando escaneo
                              </p>
                              <p className="font-body-sm text-body-sm text-on-surface-variant">
                                Escanea el código QR
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="h-3 w-3 rounded-full bg-on-surface-variant/40 shrink-0"></div>
                            <div>
                              <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                                Desconectado
                              </p>
                              <p className="font-body-sm text-body-sm text-on-surface-variant">
                                Sin vinculación activa
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* QR or Instructions block */}
                      {whatsappStatus === "WAITING_QR" ? (
                        <div className="flex flex-col items-center justify-center py-2 animate-in fade-in duration-200">
                          {qrCode ? (
                            <div className="flex flex-col items-center bg-white p-4 rounded-md border border-outline-variant shadow-sm max-w-[240px]">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                                alt="WhatsApp QR Code"
                                className="w-[180px] h-[180px]"
                              />
                              <span className="text-[11px] font-medium text-on-surface-variant mt-2 text-center">
                                Código QR de sincronización
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[200px] text-center">
                              <Loader2 data-icon="loader" className="animate-spin mb-3 text-primary" />
                              <p className="font-body-md text-body-md text-on-surface-variant font-medium">
                                Generando código QR...
                              </p>
                              <p className="text-[11px] text-on-surface-variant/80 mt-1 max-w-[200px]">
                                Esto puede tomar hasta 15 segundos mientras se
                                inicia la sesión.
                              </p>
                            </div>
                          )}

                          <div className="mt-4 text-center">
                            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed max-w-[260px] mx-auto">
                              Abre WhatsApp en tu teléfono, ve a{" "}
                              <strong>Dispositivos vinculados</strong> y escanea
                              el código QR.
                            </p>
                          </div>
                        </div>
                      ) : whatsappStatus === "CONNECTED" ? (
                        <div className="flex flex-col justify-center py-4 text-center">
                          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-[280px] mx-auto mb-4">
                            Tu cuenta de WhatsApp se encuentra vinculada
                            correctamente. Las confirmaciones de citas y
                            recordatorios se enviarán de forma automática a tus
                            clientes.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-center py-4 text-center">
                          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-[280px] mx-auto mb-4">
                            Vincula tu número de WhatsApp para poder enviar
                            confirmaciones inmediatas al agendar citas y
                            recordatorios automáticos 24 horas antes del servicio.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="pt-0">
                  {whatsappStatus === "CONNECTED" ? (
                    <button
                      onClick={handleDisconnectWhatsapp}
                      className="w-full py-3 border border-error text-error font-label-lg text-label-lg font-semibold rounded-lg hover:bg-error-container/20 transition-all cursor-pointer text-center"
                    >
                      Desconectar cuenta
                    </button>
                  ) : whatsappStatus === "WAITING_QR" ? (
                    <button
                      onClick={handleDisconnectWhatsapp}
                      className="w-full py-3 border border-outline text-on-surface-variant font-label-lg text-label-lg font-semibold rounded-lg hover:bg-surface-container transition-all cursor-pointer text-center"
                    >
                      Cancelar vinculación
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectWhatsapp}
                      disabled={loadingQr}
                      className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-label-lg text-label-lg font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                    >
                      {loadingQr ? (
                        <>
                          <Loader2 data-icon="loader" className="animate-spin" />
                          <span>Iniciando...</span>
                        </>
                      ) : (
                        <>
                          <span>Vincular WhatsApp</span>
                        </>
                      )}
                    </button>
                  )}
                </CardFooter>
              </Card>

              {/* Message Templates Editor Card (Spans 7 cols) */}
              <Card className="sm:col-span-2 lg:col-span-7 flex flex-col justify-between">
                <div>
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-primary flex items-center gap-2">
                      <Send data-icon="send" />
                      <span>Plantillas de Mensajería</span>
                    </CardTitle>

                    {!isEditingTemplates ? (
                      <button
                        onClick={() => setIsEditingTemplates(true)}
                        className="text-primary hover:text-primary-container font-label-lg text-label-lg font-semibold transition-all cursor-pointer hover:underline"
                      >
                        Editar plantillas
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setIsEditingTemplates(false);
                            fetchTemplates();
                          }}
                          className="text-on-surface-variant hover:text-on-surface font-label-md text-label-md font-semibold transition-all cursor-pointer hover:underline"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveTemplates}
                          disabled={savingTemplates}
                          className="flex items-center gap-1 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer font-semibold shadow-sm disabled:opacity-50"
                        >
                          {savingTemplates ? (
                            <Loader2 data-icon="loader" className="animate-spin" />
                          ) : (
                            <Save data-icon="save" />
                          )}
                          <span>Guardar</span>
                        </button>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent>
                    <form className="flex flex-col gap-4 sm:gap-6">
                      <FieldGroup className="gap-4 sm:gap-6">
                        {/* Welcome Message Template */}
                        <Field>
                          <div className="flex justify-between items-center w-full">
                            <FieldLabel>
                              Mensaje de Bienvenida / Confirmación
                            </FieldLabel>
                            <Badge variant="secondary">Inmediato</Badge>
                          </div>
                          <textarea
                            disabled={!isEditingTemplates}
                            rows={3}
                            value={templates.welcomeMessage}
                            onChange={(e) =>
                              setTemplates((prev) => ({
                                ...prev,
                                welcomeMessage: e.target.value,
                              }))
                            }
                            className="w-full border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface disabled:opacity-75 disabled:cursor-not-allowed resize-none custom-scrollbar"
                            placeholder="Escribe el mensaje de confirmación..."
                          />
                        </Field>

                        {/* Reminder Message Template */}
                        <Field>
                          <div className="flex justify-between items-center w-full">
                            <FieldLabel>Mensaje de Recordatorio</FieldLabel>
                            <Badge variant="secondary">
                              Sentinel (24h antes)
                            </Badge>
                          </div>
                          <textarea
                            disabled={!isEditingTemplates}
                            rows={3}
                            value={templates.reminderMessage}
                            onChange={(e) =>
                              setTemplates((prev) => ({
                                ...prev,
                                reminderMessage: e.target.value,
                              }))
                            }
                            className="w-full border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface disabled:opacity-75 disabled:cursor-not-allowed resize-none custom-scrollbar"
                            placeholder="Escribe el mensaje de recordatorio..."
                          />
                        </Field>
                      </FieldGroup>

                      {/* Variables Helper Box */}
                      <div className="bg-surface-container-low p-4 rounded-md border border-outline-variant/50">
                        <p className="font-label-md text-label-md text-on-surface font-semibold mb-2">
                          Variables dinámicas disponibles:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className="bg-surface-container-lowest border border-outline-variant text-[11px] px-2 py-1 rounded font-mono select-all cursor-pointer"
                            title="Nombre del cliente"
                          >
                            {"{{clientName}}"}
                          </span>
                          <span
                            className="bg-surface-container-lowest border border-outline-variant text-[11px] px-2 py-1 rounded font-mono select-all cursor-pointer"
                            title="Fecha de la cita (ej. lunes 8 de junio)"
                          >
                            {"{{appointmentDate}}"}
                          </span>
                          <span
                            className="bg-surface-container-lowest border border-outline-variant text-[11px] px-2 py-1 rounded font-mono select-all cursor-pointer"
                            title="Hora de la cita (ej. 10:00)"
                          >
                            {"{{appointmentTime}}"}
                          </span>
                          <span
                            className="bg-surface-container-lowest border border-outline-variant text-[11px] px-2 py-1 rounded font-mono select-all cursor-pointer"
                            title="Nombre comercial de tu negocio"
                          >
                            {"{{businessName}}"}
                          </span>
                        </div>
                      </div>

                      {/* Live Preview Block */}
                      <div>
                        <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider block mb-2">
                          Vista previa del mensaje de bienvenida:
                        </span>
                        <div className="bg-[#efeae2] p-4 rounded-md border border-outline-variant font-sans relative">
                          <div className="bg-white rounded-lg p-3 shadow-sm text-body-md text-on-surface max-w-[85%] relative border border-outline-variant/20">
                            <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                              {templates.welcomeMessage ? (
                                templates.welcomeMessage
                                  .replace(/{{clientName}}/g, "Ana García")
                                  .replace(
                                    /{{appointmentDate}}/g,
                                    "lunes 8 de junio",
                                  )
                                  .replace(/{{appointmentTime}}/g, "10:00")
                                  .replace(
                                    /{{businessName}}/g,
                                    profile.name || "Glow",
                                  )
                              ) : (
                                <span className="text-on-surface-variant italic">
                                  No hay plantilla configurada para bienvenida.
                                </span>
                              )}
                            </p>
                            <span className="text-[10px] text-on-surface-variant float-right mt-1">
                              12:00
                            </span>
                            <div className="clear-both" />
                          </div>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </div>
              </Card>
            </div>
          ) : (
            /* Bento Grid Layout - Gestión del Negocio */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 animate-in fade-in duration-200">
              {/* Business Profile Card (Spans 8 cols) */}
              {isEditingBusiness ? (
                <Card className="sm:col-span-2 lg:col-span-8 flex flex-col justify-between">
                  <form onSubmit={handleSaveBusiness} className="h-full flex flex-col justify-between">
                    <div>
                      <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-primary flex items-center gap-2">
                          <Store data-icon="store" />
                          <span>Información del Negocio</span>
                        </CardTitle>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingBusiness(false);
                              fetchProfile();
                            }}
                            className="px-4 py-2 border border-outline rounded-lg font-label-md text-label-md hover:bg-surface-variant/20 transition-all cursor-pointer font-semibold text-on-surface"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer font-semibold shadow-sm"
                          >
                            <Save data-icon="save" />
                            <span>Guardar</span>
                          </button>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {/* Cover Photo Banner */}
                        <div className="relative w-full h-36 rounded-lg overflow-hidden bg-gradient-to-r from-primary/10 to-secondary/10 border border-outline-variant/60 mb-6 group">
                          {profile.coverUrl ? (
                            <img
                              src={profile.coverUrl}
                              alt="Portada del Negocio"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30 font-medium text-body-sm select-none">
                              Sin foto de portada. Haz clic para subir una.
                            </div>
                          )}
                          <input
                            type="file"
                            ref={coverInputRef}
                            onChange={handleCoverChange}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={triggerCoverUpload}
                            className="absolute bottom-2 right-2 bg-surface/85 hover:bg-surface border border-outline-variant px-3 py-1 rounded-md text-label-sm font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                          >
                            <Camera data-icon="camera" />
                            <span>Cambiar portada</span>
                          </button>
                        </div>

                        {/* Business Photo Row */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="relative group shrink-0">
                            <div className="w-20 h-20 rounded-md overflow-hidden bg-surface-container border border-outline-variant shadow-sm">
                              <img
                                src={profile.logoUrl || "/logo.png"}
                                alt="Foto del Negocio"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <input
                              type="file"
                              ref={businessLogoInputRef}
                              onChange={handleBusinessLogoChange}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={triggerBusinessLogoUpload}
                              className="absolute inset-0 bg-primary/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md cursor-pointer border border-primary/20"
                            >
                              <Camera data-icon="camera" className="text-white" />
                            </button>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-label-md text-label-md text-on-surface font-semibold">Foto del Negocio</span>
                            <p className="text-[11px] text-on-surface-variant/85 leading-normal">
                              Esta es la imagen de perfil de tu negocio o logotipo comercial.
                            </p>
                          </div>
                        </div>

                        {/* Form fields */}
                        <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field>
                            <FieldLabel htmlFor="profile-name">
                              Nombre Comercial
                            </FieldLabel>
                            <input
                              id="profile-name"
                              type="text"
                              required
                              value={profile.name}
                              onChange={(e) =>
                                setProfile((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                            />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="profile-email">
                              Correo Electrónico
                            </FieldLabel>
                            <input
                              id="profile-email"
                              type="email"
                              required
                              value={profile.email}
                              onChange={(e) =>
                                setProfile((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                              className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                            />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="profile-phone">
                              Teléfono
                            </FieldLabel>
                            <input
                              id="profile-phone"
                              type="tel"
                              required
                              value={profile.phone}
                              onChange={(e) =>
                                setProfile((prev) => ({
                                  ...prev,
                                  phone: e.target.value,
                                }))
                              }
                              className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                            />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="profile-address">
                              Dirección
                            </FieldLabel>
                            <input
                              id="profile-address"
                              type="text"
                              required
                              value={profile.address}
                              onChange={(e) =>
                                setProfile((prev) => ({
                                  ...prev,
                                  address: e.target.value,
                                }))
                              }
                              className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                            />
                          </Field>
                        </FieldGroup>
                        
                        <Field className="mt-4">
                          <FieldLabel htmlFor="profile-description">
                            Descripción del Negocio
                          </FieldLabel>
                          <textarea
                            id="profile-description"
                            value={profile.description || ""}
                            onChange={(e) =>
                              setProfile((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            placeholder="Describe tu negocio, servicios o especialidad..."
                            className="w-full min-h-[90px] border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface resize-none"
                          />
                        </Field>
                      </CardContent>
                    </div>
                  </form>
                </Card>
              ) : (
                <Card className="sm:col-span-2 lg:col-span-8 flex flex-col justify-between">
                  <div>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <CardTitle className="text-primary flex items-center gap-2">
                        <Store data-icon="store" />
                        <span>Información del Negocio</span>
                      </CardTitle>
                      <button
                        type="button"
                        onClick={() => setIsEditingBusiness(true)}
                        className="text-primary hover:text-primary-container font-label-lg text-label-lg font-semibold transition-all cursor-pointer hover:underline"
                      >
                        Editar negocio
                      </button>
                    </CardHeader>

                    <CardContent>
                      {/* Cover Photo Banner */}
                      <div className="relative w-full h-36 rounded-lg overflow-hidden bg-gradient-to-r from-primary/10 to-secondary/10 border border-outline-variant/60 mb-6">
                        {profile.coverUrl ? (
                          <img
                            src={profile.coverUrl}
                            alt="Portada del Negocio"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30 font-medium text-body-sm select-none">
                            Espacio sin foto de portada.
                          </div>
                        )}
                      </div>

                      {/* Business Photo Row (View Only) */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="shrink-0">
                          <div className="w-20 h-20 rounded-md overflow-hidden bg-surface-container border border-outline-variant shadow-sm">
                            <img
                              src={profile.logoUrl || "/logo.png"}
                              alt="Foto del Negocio"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">Foto del Negocio</span>
                          <p className="text-[11px] text-on-surface-variant/85 leading-normal">
                            Logotipo comercial o imagen principal de tu salón.
                          </p>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                        <div className="flex flex-col gap-1">
                          <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">
                            Nombre Comercial
                          </span>
                          <p className="font-body-lg text-body-lg font-medium text-on-surface">
                            {profile.name}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">
                            Correo Electrónico
                          </span>
                          <p className="font-body-lg text-body-lg font-medium text-on-surface">
                            {profile.email}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">
                            Teléfono
                          </span>
                          <p className="font-body-lg text-body-lg font-medium text-on-surface">
                            {profile.phone}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">
                            Dirección
                          </span>
                          <p className="font-body-lg text-body-lg font-medium text-on-surface leading-relaxed">
                            {profile.address}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2 border-t border-outline-variant/35 pt-4">
                          <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">
                            Descripción del Negocio
                          </span>
                          <p className="font-body-lg text-body-lg font-medium text-on-surface leading-relaxed whitespace-pre-wrap">
                            {profile.description || "Sin descripción disponible."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              )}

              {/* Operating Hours Card (Spans 4 cols) */}
              <Card className="sm:col-span-1 lg:col-span-4 flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-primary flex items-center gap-2">
                      <Clock data-icon="clock" />
                      <span>Horario de Apertura</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {loadingHours ? (
                      <div className="flex justify-center py-8">
                        <Loader2 data-icon="loader" className="animate-spin text-primary" />
                      </div>
                    ) : !isEditingHours ? (
                      <div className="flex flex-col gap-2.5 sm:gap-4 font-medium text-body-md text-on-surface-variant font-semibold">
                        {hours.map((hourRow) => (
                          <div
                            key={hourRow.dayOfWeek}
                            className="flex items-center justify-between py-1 border-b border-outline-variant/65"
                          >
                            <span>{dayNames[hourRow.dayOfWeek]}</span>
                            <span
                              className={`font-semibold ${hourRow.isClosed ? "text-error" : "text-primary"}`}
                            >
                              {hourRow.isClosed
                                ? "Cerrado"
                                : `${hourRow.openTime} - ${hourRow.closeTime}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <form
                        onSubmit={handleSaveHours}
                        className="flex flex-col gap-4"
                      >
                        {hours.map((hourRow, idx) => (
                          <div
                            key={hourRow.dayOfWeek}
                            className="flex flex-col gap-2 pb-2 border-b border-outline-variant/40"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-body-md text-on-surface">
                                {dayNames[hourRow.dayOfWeek]}
                              </span>
                              <label className="flex items-center gap-2 cursor-pointer text-xs text-on-surface-variant select-none">
                                <input
                                  type="checkbox"
                                  checked={hourRow.isClosed}
                                  onChange={(e) => {
                                    const updatedHours = [...hours];
                                    updatedHours[idx] = {
                                      ...updatedHours[idx],
                                      isClosed: e.target.checked,
                                    };
                                    setHours(updatedHours);
                                  }}
                                  className="rounded border-outline-variant text-primary focus:ring-primary"
                                />
                                Cerrado
                              </label>
                            </div>
                            {!hourRow.isClosed && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={hourRow.openTime}
                                  onChange={(e) => {
                                    const updatedHours = [...hours];
                                    updatedHours[idx] = {
                                      ...updatedHours[idx],
                                      openTime: e.target.value,
                                    };
                                    setHours(updatedHours);
                                  }}
                                  className="border border-outline-variant rounded px-2 py-1 text-xs bg-surface focus:outline-none focus:border-primary w-full"
                                />
                                <span className="text-xs text-on-surface-variant">
                                  a
                                </span>
                                <input
                                  type="time"
                                  value={hourRow.closeTime}
                                  onChange={(e) => {
                                    const updatedHours = [...hours];
                                    updatedHours[idx] = {
                                      ...updatedHours[idx],
                                      closeTime: e.target.value,
                                    };
                                    setHours(updatedHours);
                                  }}
                                  className="border border-outline-variant rounded px-2 py-1 text-xs bg-surface focus:outline-none focus:border-primary w-full"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-outline-variant/35">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingHours(false);
                              fetchHours();
                            }}
                            className="px-3 py-1.5 border border-outline rounded text-xs hover:bg-surface-variant/20 transition-all font-semibold cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={savingHours}
                            className="px-3 py-1.5 bg-primary text-on-primary rounded text-xs hover:bg-primary-container transition-all font-semibold cursor-pointer flex items-center gap-1"
                          >
                            {savingHours && (
                              <Loader2 data-icon="loader" className="animate-spin" />
                            )}
                            <span>Guardar</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </div>

                {!isEditingHours && !loadingHours && (
                  <CardFooter className="pt-0">
                    <button
                      onClick={() => setIsEditingHours(true)}
                      className="w-full border border-primary text-primary font-label-lg text-label-lg font-semibold py-2 rounded-lg hover:bg-secondary-container/30 transition-all cursor-pointer"
                    >
                      Modificar Horarios
                    </button>
                  </CardFooter>
                )}
              </Card>

              {/* Featured Services Card (Spans 12 cols - full width) */}
              <Card className="col-span-12 flex flex-col justify-between mt-2">
                <div>
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-primary flex items-center gap-2">
                      <Scissors data-icon="scissors" />
                      <span>Servicios Destacados</span>
                    </CardTitle>
                    <span className="text-body-sm text-on-surface-variant font-medium">
                      {services.length} servicios registrados
                    </span>
                  </CardHeader>

                  <CardContent>
                    {loadingServices ? (
                      <div className="flex justify-center py-12">
                        <Loader2 data-icon="loader" className="animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                        {filteredServices.map((service, idx) => (
                          <div
                            key={idx}
                            className="bg-surface-container-low flex items-center justify-between p-4 rounded-md group/service relative"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
                                <Scissors data-icon="scissors" />
                              </div>
                              <div>
                                <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                                  {service.name}
                                </p>
                                <p className="font-body-md text-body-md text-on-surface-variant">
                                  {service.duration} min · {service.price}€
                                </p>
                              </div>
                            </div>

                            {/* Hover actions / Mobile visible actions */}
                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover/service:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2 bg-surface-container-low pl-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setServiceToEdit(service);
                                  setIsAddServiceModalOpen(true);
                                }}
                                className="p-2 hover:bg-surface-variant rounded-lg text-primary transition-all cursor-pointer"
                                title="Editar servicio"
                              >
                                <Pencil data-icon="pencil" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteService(service.id)}
                                className="p-2 hover:bg-surface-variant rounded-lg text-error transition-all cursor-pointer"
                                title="Eliminar servicio"
                              >
                                <X data-icon="x" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add Service (Dashed border button) */}
                        <div
                          onClick={() => {
                            setServiceToEdit(null);
                            setIsAddServiceModalOpen(true);
                          }}
                          className="border border-dashed border-outline-variant hover:border-primary flex items-center justify-center gap-2 p-4 rounded-md cursor-pointer hover:bg-surface-variant/20 transition-all min-h-[80px]"
                        >
                          <Plus data-icon="plus" />
                          <span className="font-label-lg text-label-lg font-semibold text-primary">
                            Añadir Servicio
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
              {/* Workers Management Card */}
              {showTrabajadoresTab && (
                <Card className="col-span-12 mt-2">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-teal-850 flex items-center gap-2">
                      <Users className="w-5 h-5 text-teal-805" />
                      <span className="text-teal-805">Gestión de Trabajadores</span>
                    </CardTitle>
                    <button
                      onClick={handleOpenCreateWorkerModal}
                      className="py-2.5 px-4 bg-teal-850 hover:bg-teal-905 text-white rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer font-semibold shadow-sm"
                    >
                      <UserPlus data-icon="user-plus" />
                      <span>Añadir Empleado</span>
                    </button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                      {workers.map((worker) => {
                        const specialty = getWorkerSpecialty(worker);
                        const status = getWorkerStatus(worker);
                        const avatarUrl = getWorkerAvatar(worker);
                        const isActive = status === "ACTIVO";

                        return (
                          <div
                            key={worker.id}
                            className={`bg-surface-container-low border border-outline-variant/60 rounded-xl p-4 flex items-center gap-4 relative group/worker transition-all hover:shadow-sm ${
                              !isActive ? "opacity-65" : ""
                            }`}
                          >
                            {/* Avatar / Placeholder */}
                            <div className="shrink-0">
                              {avatarUrl ? (
                                <div className="w-14 h-14 rounded-full overflow-hidden border border-outline-variant/55 bg-surface-container">
                                  <img
                                    src={avatarUrl}
                                    alt={`Foto de ${worker.name}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div
                                  className={`w-14 h-14 rounded-full flex items-center justify-center border border-outline-variant/40 ${
                                    isActive
                                      ? "bg-[#b0c4de]/40 text-slate-600"
                                      : "bg-slate-100 text-slate-350"
                                  }`}
                                >
                                  <User className="w-6 h-6" />
                                </div>
                              )}
                            </div>

                            {/* Worker Info */}
                            <div className="flex flex-col min-w-0">
                              <span className={`font-semibold text-body-lg truncate ${!isActive ? "text-on-surface-variant/50" : "text-on-surface"}`}>
                                {worker.name}
                              </span>
                              <span className={`text-body-md truncate ${!isActive ? "text-on-surface-variant/40" : "text-on-surface-variant"}`}>
                                {specialty}
                              </span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    isActive ? "bg-emerald-500" : "bg-red-400"
                                  }`}
                                />
                                <span className={`text-[10px] font-semibold tracking-wider ${!isActive ? "text-on-surface-variant/40" : "text-on-surface-variant"}`}>
                                  {status}
                                </span>
                              </div>
                            </div>

                            {/* Hover actions / Mobile visible actions */}
                            <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover/worker:opacity-100 transition-opacity bg-surface-container-low pl-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditWorkerModal(worker)}
                                className="p-1.5 hover:bg-surface-variant text-on-surface-variant hover:text-on-surface rounded-md active:scale-95 transition-all cursor-pointer"
                                title="Editar trabajador"
                              >
                                <Edit2 data-icon="edit-2" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteWorker(worker.id)}
                                disabled={worker.id === session?.user?.id}
                                className="p-1.5 hover:bg-error-container/20 text-on-surface-variant hover:text-error rounded-md active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                                title="Eliminar trabajador"
                              >
                                <Trash2 data-icon="trash-2" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>

      {/* Appointment booking Modal */}
      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSave={handleSaveAppointment}
      />

      {/* Services CRUD Modal */}
      <AddServiceModal
        isOpen={isAddServiceModalOpen}
        onClose={() => {
          setIsAddServiceModalOpen(false);
          setServiceToEdit(null);
        }}
        onSave={handleSaveService}
        serviceToEdit={serviceToEdit}
      />

      {/* Worker Add/Edit Modal */}
      {isWorkerModalOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/35">
              <h2 className="font-title-lg text-title-lg font-semibold text-on-surface flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {editingWorker ? "Editar Trabajador" : "Nuevo Trabajador"}
              </h2>
              <button
                onClick={() => setIsWorkerModalOpen(false)}
                className="p-1.5 hover:bg-surface-variant text-on-surface-variant rounded-full active:scale-90 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="p-6 flex flex-col gap-6 overflow-y-auto">
              {workerErrorMsg && (
                <div className="bg-error-container border border-error-container/45 text-on-error-container p-4 rounded-xl font-medium text-body-md">
                  {workerErrorMsg}
                </div>
              )}

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="workerName">Nombre Completo</FieldLabel>
                  <FloatingInput
                    id="workerName"
                    label="Nombre y Apellidos"
                    value={workerFormData.name}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                    icon={User}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="workerEmail">Correo Electrónico</FieldLabel>
                  <FloatingInput
                    id="workerEmail"
                    label="correo@empresa.com"
                    type="email"
                    value={workerFormData.email}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, email: e.target.value })}
                    icon={Mail}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="workerPassword">
                    Contraseña {editingWorker && <span className="text-on-surface-variant/50 font-normal">(dejar en blanco para mantener)</span>}
                  </FieldLabel>
                  <FloatingInput
                    id="workerPassword"
                    label={editingWorker ? "Nueva contraseña (opcional)" : "Mínimo 6 caracteres"}
                    type="password"
                    value={workerFormData.password}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, password: e.target.value })}
                    icon={Key}
                    required={!editingWorker}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="workerRole">Rol de Usuario</FieldLabel>
                  <div className="relative">
                    <select
                      id="workerRole"
                      value={workerFormData.role}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, role: e.target.value as "JEFE" | "EMPLEADO" })}
                      className="w-full bg-transparent text-body-lg text-on-surface border border-outline rounded-md p-3.5 focus:border-primary focus:border-2 focus:outline-none transition-all"
                    >
                      <option value="EMPLEADO">Empleado (Staff)</option>
                      <option value="JEFE">Jefe / Encargado</option>
                    </select>
                  </div>
                </Field>
              </FieldGroup>

              <div className="flex items-center justify-end gap-3 mt-4 border-t border-outline-variant/50 pt-4">
                <button
                  type="button"
                  onClick={() => setIsWorkerModalOpen(false)}
                  className="py-2.5 px-4 text-on-surface-variant hover:bg-surface-variant rounded-lg font-medium text-body-md active:scale-95 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container rounded-lg font-medium text-body-md active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  {editingWorker ? "Guardar Cambios" : "Crear Trabajador"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
