"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, LogIn, AlertCircle } from "lucide-react";

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
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Algo salió mal. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-[18px]">
      <div className="w-full max-w-md flex flex-col gap-10">
        <header className="flex flex-col items-center text-center gap-4 py-4">
          <div>
            <h1 className="text-4xl font-semibold text-slate-900 tracking-tight leading-none">Volta</h1>
            <p className="text-sm font-medium text-teal-600 uppercase tracking-[0.2em] mt-3">Gestión de Agenda</p>
          </div>
        </header>

        <main className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              {/* Outlined Input: Email */}
              <div className="relative group">
                <div className="absolute left-4 -top-2.5 px-2 bg-white text-xs font-semibold text-teal-600 group-focus-within:text-teal-600 transition-colors z-10 uppercase tracking-widest">
                  Email
                </div>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 size-5 text-slate-400 stroke-[1.5]" />
                  <input 
                    type="email" 
                    placeholder="hola@tuempresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-slate-900 bg-transparent font-medium"
                  />
                </div>
              </div>

              {/* Outlined Input: Password */}
              <div className="relative group">
                <div className="absolute left-4 -top-2.5 px-2 bg-white text-xs font-semibold text-slate-500 group-focus-within:text-teal-600 transition-colors z-10 uppercase tracking-widest">
                  Contraseña
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 size-5 text-slate-400 stroke-[1.5]" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-slate-900 bg-transparent font-medium"
                  />
                </div>
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-700 text-sm font-bold animate-shake">
                <AlertCircle className="size-5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-teal-600 text-white font-semibold rounded-2xl hover:bg-teal-700 active:scale-[0.98] disabled:bg-slate-200 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              {loading ? (
                <div className="size-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="size-5 stroke-[2]" />
              )}
              {loading ? "Iniciando sesión..." : "Entrar al Sistema"}
            </button>
          </form>
        </main>

        <footer className="text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            ¿Problemas para acceder? <br/>
            <span className="text-teal-600 cursor-pointer hover:underline">Contacta con soporte</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
