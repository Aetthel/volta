"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function WhatsAppStatusCard({ initialData }) {
  const [status, setStatus] = useState(initialData.whatsappStatus);
  const [qrCodeData, setQrCodeData] = useState(initialData.qrCode);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (qrCodeData) {
      QRCode.toDataURL(qrCodeData, { width: 300, margin: 2 })
        .then(url => setQrImageUrl(url))
        .catch(err => console.error(err));
    } else {
      setQrImageUrl("");
    }
  }, [qrCodeData]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/business/status");
        const data = await res.json();
        setStatus(data.whatsappStatus);
        setQrCodeData(data.qrCode);
      } catch (err) {
        console.error("Error polling status:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleInit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/business/whatsapp/init", { method: "POST" });
      if (!res.ok) throw new Error("Error al iniciar");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case "CONNECTED":
        return {
          label: "Conectado",
          color: "bg-solar text-white",
          icon: <span>[CheckCircle2]</span>,
          description: "Tu bot está listo para enviar mensajes.",
        };
      case "WAITING_QR":
        return {
          label: "Esperando QR",
          color: "bg-amber-500 text-white",
          icon: <span>[RefreshCw]</span>,
          description: "Escanea el código de abajo con tu WhatsApp Business.",
        };
      default:
        return {
          label: "Desconectado",
          color: "bg-red-500 text-white",
          icon: <span>[XCircle]</span>,
          description: "Inicia el bot para empezar a enviar recordatorios.",
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <div >
      <div >
        <div >
          <h3 >
            <span>[Smartphone]</span>
            Estado del Servicio
          </h3>
          <p >
            {display.description}
          </p>
        </div>
        <span >
          {display.label}
        </span>
      </div>
      <div >
        {status === "WAITING_QR" && qrImageUrl ? (
          <div >
            <img src={qrImageUrl} alt="Escanea este código QR"  />
          </div>
        ) : status === "CONNECTED" ? (
          <div >
            <div >
              <span>[CheckCircle2]</span>
            </div>
            <p >Vinculación exitosa.</p>
          </div>
        ) : (
          <div >
            <div >
              <span>[Smartphone]</span>
            </div>
            <div >
              <p >El bot no está iniciado actualmente.</p>
              <button 
                onClick={handleInit} 
                disabled={loading}
                
              >
                {loading ? "Iniciando..." : "Iniciar Bot de WhatsApp"}
              </button>
            </div>
          </div>
        )}

        <div >
          <p >ID del Negocio</p>
          <p >Auto-Generated Session</p>
        </div>
      </div>
    </div>
  );
}
