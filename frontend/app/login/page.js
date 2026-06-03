"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result.error) {
        setError("Credenciales inválidas");
      } else {
        router.push("/dashboard"); // El middleware redirigirá a /admin si es necesario
      }
    } catch (err) {
      setError("Algo salió mal. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-12">
        <header className="space-y-4 text-center">
          <h1 className="text-6xl font-display font-bold tracking-tight">
            Volta
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-sans">
            Gestión de Agenda
          </p>
        </header>

        <main className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hola@tuempresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-none border-t-0 border-x-0 border-b border-border bg-transparent px-1 pb-3 h-auto text-lg focus-visible:ring-0 focus-visible:border-solar transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-none border-t-0 border-x-0 border-b border-border bg-transparent px-1 pb-3 h-auto text-lg focus-visible:ring-0 focus-visible:border-solar transition-colors"
                />
              </div>
            </div>
            
            {error && (
              <p className="text-[10px] uppercase tracking-widest text-red-500 text-center animate-in fade-in duration-300">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:opacity-90 rounded-none h-14 text-[10px] uppercase tracking-[0.2em] font-bold"
            >
              {loading ? "Cargando..." : "Entrar al Sistema"}
            </Button>
          </form>
        </main>

        <footer className="text-center pt-8 border-t border-border/50">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
            ¿Problemas para acceder? Contacta con soporte.
          </p>
        </footer>
      </div>
    </div>
  );
}
