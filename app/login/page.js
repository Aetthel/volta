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
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F9] p-4 dark:bg-[#0A0A0A]">
      <Card className="w-full max-w-md border-none shadow-none bg-transparent">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-4xl font-display tracking-tight text-[#1A1A1A] dark:text-white">
            Volta
          </CardTitle>
          <CardDescription className="text-neutral-500 uppercase tracking-widest text-xs">
            Gestión de Agenda
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="hola@tuempresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-none border-t-0 border-x-0 border-b border-neutral-300 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-solar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-none border-t-0 border-x-0 border-b border-neutral-300 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-solar"
              />
            </div>
            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1A1A] text-white hover:bg-neutral-800 rounded-none h-12 text-sm uppercase tracking-widest dark:bg-white dark:text-black"
            >
              {loading ? "Cargando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-neutral-100 pt-6 mt-4">
          <p className="text-xs text-neutral-400">
            ¿Problemas para acceder? Contacta con soporte.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
