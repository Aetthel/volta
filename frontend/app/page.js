import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-7xl font-display font-bold tracking-tight sm:text-9xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Volta
        </h1>
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500 font-sans">
          Intelligent Agenda Management
        </p>
        <div className="pt-12 animate-in fade-in duration-1000 delay-500 fill-mode-both">
          <Link href="/login">
            <Button className="rounded-none bg-[#1A1A1A] text-white px-12 py-6 text-xs uppercase tracking-widest hover:bg-neutral-800 dark:bg-white dark:text-black">
              Acceder al Panel
            </Button>
          </Link>
        </div>
      </div>
      <footer className="absolute bottom-8 text-[10px] uppercase tracking-widest text-neutral-400">
        © 2026 Volta Systems — Editorial Edition
      </footer>
    </main>
  );
}
