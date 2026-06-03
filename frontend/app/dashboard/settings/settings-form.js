"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Info } from "lucide-react";

export default function SettingsForm({ initialData }) {
  const [data, setData] = useState({
    welcomeMessage: initialData?.welcomeMessage || "Hola {{clientName}}, hemos reservado tu cita para el {{appointmentDate}}. ¡Te esperamos!",
    reminderMessage: initialData?.reminderMessage || "Recordatorio: Mañana tienes cita a las {{appointmentTime}}. ¡Nos vemos!",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/business/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Error al guardar");
      
      setMessage("Configuración guardada correctamente.");
    } catch (err) {
      setMessage("Error al guardar los cambios.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <Card className="rounded-none border-neutral-100 dark:border-neutral-800 shadow-none">
        <CardHeader>
          <CardTitle className="text-xl font-display">Plantillas de WhatsApp</CardTitle>
          <CardDescription className="text-xs uppercase tracking-widest text-neutral-400">
            Define cómo quieres que el bot hable con tus clientes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="welcome-message" className="text-[10px] uppercase tracking-widest text-neutral-400">
                Mensaje de Bienvenida (Inmediato)
              </FieldLabel>
              <Textarea
                id="welcome-message"
                value={data.welcomeMessage}
                onChange={(e) => setData({ ...data, welcomeMessage: e.target.value })}
                className="rounded-none border-neutral-200 min-h-[100px] focus-visible:ring-0 focus-visible:border-solar"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="reminder-message" className="text-[10px] uppercase tracking-widest text-neutral-400">
                Mensaje de Recordatorio (24h antes)
              </FieldLabel>
              <Textarea
                id="reminder-message"
                value={data.reminderMessage}
                onChange={(e) => setData({ ...data, reminderMessage: e.target.value })}
                className="rounded-none border-neutral-200 min-h-[100px] focus-visible:ring-0 focus-visible:border-solar"
              />
            </Field>
          </FieldGroup>

          <Alert variant="secondary" className="rounded-none bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-800">
            <Info data-icon="inline-start" />
            <AlertTitle className="text-[10px] uppercase tracking-widest font-bold">Variables disponibles:</AlertTitle>
            <AlertDescription className="text-[10px] text-neutral-500 italic">
              {"{{clientName}}, {{appointmentDate}}, {{appointmentTime}}, {{businessName}}"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-xs text-solar font-medium">{message}</p>
        <Button
          type="submit"
          disabled={loading}
          className="rounded-none bg-solar text-white hover:bg-green-600 px-12 h-12 uppercase tracking-widest text-[10px]"
        >
          {loading && <Spinner data-icon="inline-start" />}
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}

