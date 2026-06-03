"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, RefreshCw, CheckCircle2, XCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          icon: <CheckCircle2 className="h-5 w-5 text-solar" />,
          description: "Tu bot está listo para enviar mensajes.",
        };
      case "WAITING_QR":
        return {
          label: "Esperando QR",
          color: "bg-amber-500 text-white",
          icon: <RefreshCw className="h-5 w-5 text-amber-500 animate-spin" />,
          description: "Escanea el código de abajo con tu WhatsApp Business.",
        };
      default:
        return {
          label: "Desconectado",
          color: "bg-red-500 text-white",
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          description: "Inicia el bot para empezar a enviar recordatorios.",
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <Card className="rounded-none border-neutral-100 dark:border-neutral-800 shadow-none bg-white dark:bg-neutral-900 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-50 dark:border-neutral-800 pb-8">
        <div className="space-y-1">
          <CardTitle className="text-xl font-display flex items-center">
            <Smartphone className="mr-3 h-5 w-5 text-neutral-400" />
            Estado del Servicio
          </CardTitle>
          <CardDescription className="text-xs uppercase tracking-widest">
            {display.description}
          </CardDescription>
        </div>
        <Badge className={`rounded-none uppercase tracking-widest text-[9px] px-3 py-1 font-normal ${display.color}`}>
          {display.label}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-12 space-y-8">
        {status === "WAITING_QR" && qrImageUrl ? (
          <div className="p-4 bg-white border border-neutral-100 animate-in fade-in zoom-in duration-500">
            <img src={qrImageUrl} alt="Escanea este código QR" className="w-64 h-64" />
          </div>
        ) : status === "CONNECTED" ? (
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-12 w-12 text-solar" />
            </div>
            <p className="text-sm font-sans text-neutral-500 italic">Vinculación exitosa.</p>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto">
              <Smartphone className="h-12 w-12 text-neutral-300" />
            </div>
            <div className="space-y-4">
              <p className="text-sm font-sans text-neutral-500 italic">El bot no está iniciado actualmente.</p>
              <Button 
                onClick={handleInit} 
                disabled={loading}
                className="rounded-none bg-[#1A1A1A] text-white hover:bg-neutral-800 uppercase tracking-widest text-[10px] px-8 h-12 dark:bg-white dark:text-black"
              >
                {loading ? "Iniciando..." : "Iniciar Bot de WhatsApp"}
              </Button>
            </div>
          </div>
        )}

        <div className="w-full pt-8 border-t border-neutral-50 dark:border-neutral-800 flex justify-between items-center">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400">ID del Negocio</p>
          <p className="text-[10px] font-mono text-neutral-300">Auto-Generated Session</p>
        </div>
      </CardContent>
    </Card>
  );
}
