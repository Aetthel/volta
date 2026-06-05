"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Check, ShieldCheck } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const callbackUrl = email === "admin@volta.com" ? "/admin" : "/inicio";
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Credenciales incorrectas. Usa contacto@glow.com / 123456");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError("Error de conexión al servidor de autenticación");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center md:items-center md:p-gutter bg-surface-container-lowest md:bg-surface">
      {/* Main Container - Split Layout */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row md:h-[820px] md:min-h-[600px] md:rounded-2xl md:overflow-hidden md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-surface-container-lowest md:border md:border-outline-variant">

        
        {/* Left Side: Image / Branding */}
        <div className="hidden md:flex flex-col justify-between w-1/2 relative bg-surface-container-low overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDN_UjTdnl86NnMB78-EZVNiH8bnC_5V7qnNEu2uAxSYB6XpTdllew2pJyX1wW9bk-FYjDbJ7Dbu8cRK4_jV0X1iDf27a1v3vMLmkkzb3IZ4ry3O0Kdf4FfrDRrUSS3NMkmCEJqhCjX08qoxrCxrCvaXmWmDgJ6w8_K40G_X9wVCPf23IbfAuEgOsqyUK8-tsu9D1xHQrqelo6PzCG5Lm20DnorcN4CSEoSUQEozeXSLZSK-m1fIeSzN_l3r_8-mVmqyfnW92XVxA')` 
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]"></div>
            {/* Gradient to fade into the white form */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-surface-container-lowest"></div>
          </div>
          
          {/* Content overlay */}
          <div className="relative z-10 p-8 flex flex-col h-full justify-between text-surface-container-lowest">
            <div>
              <h1 className="font-display text-display-lg font-bold mb-1 drop-shadow-md">
                Volta
              </h1>
              <p className="font-title-lg text-title-lg opacity-90 max-w-md drop-shadow-sm font-medium">
                Gestión clínica para salones de belleza de alto rendimiento.
              </p>
            </div>
            
            <div className="bg-white/85 backdrop-blur-md border border-white/30 p-4 rounded-xl max-w-sm text-on-surface">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <span className="font-label-lg text-label-lg font-medium">
                  Precisión y Estilo
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Optimiza tu agenda y eleva la experiencia de tus clientes con herramientas de nivel profesional.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-[64px] bg-surface-container-lowest relative z-20">
          <div className="max-w-md w-full mx-auto">
            {/* Form Header */}
            <div className="mb-6">
              <span className="md:hidden block text-[11px] tracking-widest uppercase font-bold text-primary mb-1">
                Volta
              </span>
              <h2 className="font-display text-headline-lg text-on-surface font-semibold mb-1">
                Iniciar Sesión
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Ingresa tus credenciales para acceder al panel de control.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <div className="bg-error-container text-on-error-container border border-error-container/60 p-2 rounded-lg text-center text-body-md font-semibold select-none">
                  {error}
                </div>
              )}
              {/* Email Input */}
              <div className="flex flex-col gap-1">
                <label className="font-label-lg text-label-lg text-on-surface" htmlFor="email">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-outline">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="block w-full pl-[40px] pr-2 py-[12px] bg-surface text-body-lg text-on-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all placeholder-outline-variant shadow-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="font-label-lg text-label-lg text-on-surface" htmlFor="password">
                    Contraseña
                  </label>
                  <a href="#" className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors">
                    ¿Olvidé mi contraseña?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-outline">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-[40px] pr-[40px] py-[12px] bg-surface text-body-lg text-on-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all placeholder-outline-variant shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-outline hover:text-on-surface focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                    rememberMe 
                      ? "bg-primary border-primary text-white" 
                      : "bg-surface border-outline-variant"
                  }`}
                >
                  {rememberMe && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                </button>
                <span className="font-body-md text-body-md text-on-surface-variant select-none">
                  Recordarme en este dispositivo
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-[12px] px-4 border border-transparent rounded-lg shadow-[0_4px_14px_0_rgba(0,128,128,0.15)] text-on-primary bg-primary hover:bg-primary-container disabled:opacity-50 focus:outline-none transition-all active:scale-[0.98] font-label-lg text-label-lg cursor-pointer"
              >
                {isLoading ? "Cargando..." : "Entrar al Panel"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-surface-container-lowest font-label-md text-label-md text-outline">
                    O continuar con
                  </span>
                </div>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex justify-center items-center py-2 px-4 border border-outline-variant rounded-lg shadow-sm bg-surface hover:bg-surface-variant font-label-md text-label-md text-on-surface transition-colors cursor-pointer gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex justify-center items-center py-2 px-4 border border-outline-variant rounded-lg shadow-sm bg-surface hover:bg-surface-variant font-label-md text-label-md text-on-surface transition-colors cursor-pointer gap-2"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.51-.64.73-1.2 1.87-1.05 2.98 1.1.09 2.22-.57 2.98-1.43z"></path>
                </svg>
                Apple
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
