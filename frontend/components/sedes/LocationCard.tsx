"use client";

import React from "react";
import { Store, Mail, Phone, MapPin, Users, Pencil, Trash2 } from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/volta-ui";
import type { BusinessItem } from "@/lib/hooks/useLocationsList";

interface LocationCardProps {
  business: BusinessItem;
  currentUserId?: string;
  onOpenWorkers: (biz: BusinessItem) => void;
  onEdit: (biz: BusinessItem) => void;
  onDelete: (id: string) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  business,
  currentUserId,
  onOpenWorkers,
  onEdit,
  onDelete,
}) => {
  const isCurrentUser = currentUserId === business.id;

  return (
    <Card className="p-6 flex flex-col justify-between hover:border-primary-fixed-dim transition-colors group">
      <div>
        {/* Header: Title and Badge */}
        <div className="flex justify-between items-start gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-surface-container text-primary rounded-lg shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-title-md text-title-md text-on-surface font-semibold">
              {business.name}
            </h3>
          </div>
          <Badge variant="secondary">{business.role}</Badge>
        </div>

        {/* Details list */}
        <div className="flex flex-col gap-2 text-body-md text-on-surface-variant font-medium mt-6">
          <div className="flex items-start gap-2 leading-relaxed">
            <Mail className="w-4 h-4 text-outline shrink-0 mt-0.5" />
            <span className="truncate">{business.email}</span>
          </div>
          {business.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-outline shrink-0" />
              <span>{business.phone}</span>
            </div>
          )}
          {business.address && (
            <div className="flex items-start gap-2 leading-relaxed">
              <MapPin className="w-4 h-4 text-outline shrink-0 mt-0.5" />
              <span>{business.address}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center gap-2 mt-8 pt-6 border-t border-outline-variant/65">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenWorkers(business)}
          className="p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-full shadow-none w-8 h-8"
          title="Gestionar trabajadores"
        >
          <Users className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(business)}
          className="p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-full shadow-none w-8 h-8"
          title="Editar información"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={isCurrentUser}
          onClick={() => onDelete(business.id)}
          className={`p-2 rounded-full shadow-none w-8 h-8 ${
            isCurrentUser
              ? "opacity-30 cursor-not-allowed text-outline"
              : "text-outline hover:text-error hover:bg-error/10"
          }`}
          title={isCurrentUser ? "No puedes eliminar tu propia cuenta activa" : "Eliminar local"}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
