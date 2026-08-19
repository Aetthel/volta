"use client";

import { useState, useEffect } from "react";

export interface ServiceToEdit {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  capacity?: number;
  type?: "INDIVIDUAL" | "GROUP";
  color?: string;
}

export interface ServiceFormData {
  name: string;
  price: string;
  duration: string;
  capacity: string;
  type: "INDIVIDUAL" | "GROUP";
  color: string;
  description: string;
}

const EMPTY_FORM: ServiceFormData = {
  name: "",
  price: "",
  duration: "45",
  capacity: "1",
  type: "INDIVIDUAL",
  color: "TEAL",
  description: "",
};

export function useAddServiceForm(
  isOpen: boolean,
  serviceToEdit: ServiceToEdit | null | undefined,
  onSave: (serviceData: {
    id?: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
    capacity?: number;
    type?: "INDIVIDUAL" | "GROUP";
    color?: string;
  }) => void,
  onClose: () => void
) {
  const [formData, setFormData] = useState<ServiceFormData>(EMPTY_FORM);
  const isEditMode = !!serviceToEdit;

  useEffect(() => {
    if (!isOpen) return;

    if (serviceToEdit) {
      setFormData({
        name: serviceToEdit.name ?? "",
        price: String(serviceToEdit.price) ?? "",
        duration: String(serviceToEdit.duration) ?? "45",
        capacity: String(serviceToEdit.capacity ?? 1),
        type: serviceToEdit.type ?? "INDIVIDUAL",
        color: serviceToEdit.color ?? "TEAL",
        description: serviceToEdit.description ?? "",
      });
      return;
    }

    setFormData(EMPTY_FORM);
  }, [serviceToEdit, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleTypeChange = (val: string) => {
    const serviceType = val as "INDIVIDUAL" | "GROUP";
    setFormData((prev) => ({
      ...prev,
      type: serviceType,
      capacity: serviceType === "INDIVIDUAL" ? "1" : prev.capacity === "1" ? "12" : prev.capacity,
    }));
  };

  const handleColorSelect = (colorId: string) => {
    setFormData((prev) => ({ ...prev, color: colorId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      id: serviceToEdit?.id,
      name: formData.name,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration, 10),
      capacity: formData.type === "INDIVIDUAL" ? 1 : parseInt(formData.capacity, 10) || 12,
      type: formData.type,
      color: formData.color,
      description: formData.description,
    });

    setFormData(EMPTY_FORM);
    onClose();
  };

  return {
    formData,
    isEditMode,
    handleChange,
    handleTypeChange,
    handleColorSelect,
    handleSubmit,
  };
}
