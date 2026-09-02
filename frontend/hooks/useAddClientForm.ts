"use client";

import { useState, useEffect } from "react";
import { formatPhoneNumber } from "@/lib/utils";

export interface ClientToEdit {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email?: string;
  frequentService?: string;
}

export interface ClientFormData {
  name: string;
  surname: string;
  phone: string;
  email: string;
  frequency: string;
  notes: string;
}

const EMPTY_FORM: ClientFormData = {
  name: "",
  surname: "",
  phone: "",
  email: "",
  frequency: "",
  notes: "",
};

export function useAddClientForm(
  isOpen: boolean,
  clientToEdit: ClientToEdit | null | undefined,
  onSave: (clientData: {
    id?: string;
    name: string;
    surname: string;
    phone: string;
    email?: string;
    frequency?: string;
    notes?: string;
  }) => void,
  onClose: () => void
) {
  const [formData, setFormData] = useState<ClientFormData>(EMPTY_FORM);
  const isEditMode = !!clientToEdit;

  useEffect(() => {
    if (!isOpen) return;

    if (clientToEdit) {
      setFormData({
        name: clientToEdit.name ?? "",
        surname: clientToEdit.surname ?? "",
        phone: clientToEdit.phone ? formatPhoneNumber(clientToEdit.phone) : "",
        email: clientToEdit.email ?? "",
        frequency: clientToEdit.frequentService ?? "",
        notes: "",
      });
      return;
    }

    setFormData(EMPTY_FORM);
  }, [clientToEdit, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    const finalVal = id === "phone" ? formatPhoneNumber(value) : value;
    setFormData((prev) => ({ ...prev, [id]: finalVal }));
  };

  const handleFrequencyChange = (val: string) => {
    setFormData((prev) => ({ ...prev, frequency: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalName = formData.name.trim();
    let finalSurname = formData.surname.trim();

    if (!finalSurname && finalName.includes(" ")) {
      const parts = finalName.split(/\s+/);
      finalName = parts[0] || "";
      finalSurname = parts.slice(1).join(" ");
    }

    onSave({
      ...formData,
      name: finalName,
      surname: finalSurname,
      id: clientToEdit?.id,
    });

    setFormData(EMPTY_FORM);
    onClose();
  };

  return {
    formData,
    isEditMode,
    handleChange,
    handleFrequencyChange,
    handleSubmit,
  };
}
