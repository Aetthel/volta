"use client";

import { useState } from "react";

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
    <form onSubmit={handleSubmit} >
      <div >
        <div>
          <h3 >Plantillas de WhatsApp</h3>
          <p >
            Define cómo quieres que el bot hable con tus clientes.
          </p>
        </div>
        <div >
          <div>
            <div>
              <FieldLabel htmlFor="welcome-message" >
                Mensaje de Bienvenida (Inmediato)
              </FieldLabel>
              <textarea
                id="welcome-message"
                value={data.welcomeMessage}
                onChange={(e) => setData({ ...data, welcomeMessage: e.target.value })}
                
              />
            </div>

            <div>
              <FieldLabel htmlFor="reminder-message" >
                Mensaje de Recordatorio (24h antes)
              </FieldLabel>
              <textarea
                id="reminder-message"
                value={data.reminderMessage}
                onChange={(e) => setData({ ...data, reminderMessage: e.target.value })}
                
              />
            </div>
          </div>

          <div variant="secondary" >
            <span>[Info]</span>
            <h4 >Variables disponibles:</h4>
            <p >
              {"{{clientName}}, {{appointmentDate}}, {{appointmentTime}}, {{businessName}}"}
            </p>
          </div>
        </div>
      </div>

      <div >
        <p >{message}</p>
        <button
          type="submit"
          disabled={loading}
          
        >
          {loading && <span data-icon="inline-start" />}
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}

