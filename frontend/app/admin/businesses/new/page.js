"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewBusinessPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear el negocio");
      }

      router.push("/admin/businesses");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-4">
        <Link href="/admin/businesses" className="flex items-center text-[10px] uppercase tracking-widest text-neutral-400 hover:text-[#1A1A1A] transition-colors">
          <ArrowLeft className="mr-2 h-3 w-3" /> Volver a la lista
        </Link>
        <h1 className="text-5xl font-display font-bold">Nuevo Negocio</h1>
      </header>

      <div className="max-w-2xl">
        <Card className="rounded-none border-neutral-100 dark:border-neutral-800 shadow-none">
          <CardHeader>
            <CardTitle className="text-xl font-display">Información del Cliente</CardTitle>
            <CardDescription className="text-xs uppercase tracking-widest text-neutral-400">
              Configura los detalles de acceso y contacto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] uppercase tracking-widest text-neutral-400">Nombre del Negocio</Label>
                <Input
                  id="name"
                  placeholder="Ej: Peluquería Elegance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="rounded-none border-t-0 border-x-0 border-b border-neutral-200 focus-visible:ring-0 focus-visible:border-solar px-0"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-neutral-400">Email de Acceso</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contacto@negocio.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="rounded-none border-t-0 border-x-0 border-b border-neutral-200 focus-visible:ring-0 focus-visible:border-solar px-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] uppercase tracking-widest text-neutral-400">Contraseña Temporal</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="rounded-none border-t-0 border-x-0 border-b border-neutral-200 focus-visible:ring-0 focus-visible:border-solar px-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest text-neutral-400">Teléfono (WhatsApp)</Label>
                <Input
                  id="phone"
                  placeholder="34600000000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="rounded-none border-t-0 border-x-0 border-b border-neutral-200 focus-visible:ring-0 focus-visible:border-solar px-0"
                />
                <p className="text-[9px] text-neutral-400 italic">Formato internacional sin el símbolo +</p>
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-12 h-12 rounded-none bg-[#1A1A1A] text-white hover:bg-neutral-800 uppercase tracking-widest text-[10px] dark:bg-white dark:text-black"
                >
                  {loading ? "Creando..." : "Dar de Alta Negocio"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
