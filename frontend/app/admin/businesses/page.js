import prisma from "backend/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function BusinessListPage() {
  const businesses = await prisma.business.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-end justify-between border-b border-neutral-100 dark:border-neutral-900 pb-8">
        <div className="space-y-2">
          <h2 className="text-sm uppercase tracking-[0.3em] text-neutral-400">Administración</h2>
          <h1 className="text-5xl font-display font-bold">Negocios</h1>
        </div>
        <Link href="/admin/businesses/new">
          <Button className="rounded-none bg-[#1A1A1A] text-white hover:bg-neutral-800 uppercase tracking-widest text-[10px] px-8 h-12 dark:bg-white dark:text-black">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Negocio
          </Button>
        </Link>
      </header>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-neutral-100 dark:border-neutral-800">
              <TableHead className="text-[10px] uppercase tracking-widest py-6 px-8">Nombre</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest py-6">Email</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest py-6">Teléfono</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest py-6 text-right">Rol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.map((business) => (
              <TableRow key={business.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border-neutral-100 dark:border-neutral-800 transition-colors">
                <TableCell className="font-display text-xl py-6 px-8">{business.name}</TableCell>
                <TableCell className="text-sm text-neutral-500">{business.email}</TableCell>
                <TableCell className="text-sm text-neutral-500 font-mono">{business.phone}</TableCell>
                <TableCell className="text-right py-6 pr-8">
                  <Badge className={cn(
                    "rounded-none uppercase tracking-widest text-[9px] px-3 py-1 font-normal",
                    business.role === "ADMIN" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                  )}>
                    {business.role}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}
