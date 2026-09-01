"use client";

import * as React from "react";
import { Card, Avatar } from "@/components/ui/volta-ui";
import { Clock, CalendarIcon } from "lucide-react";

export interface UpcomingAppointment {
  id: string;
  clientName: string;
  clientSurname?: string;
  serviceName: string;
  time: string;
  duration: string;
  avatarUrl?: string;
}

export interface UpcomingAppointmentsListProps {
  appointments: UpcomingAppointment[];
}

export const UpcomingAppointmentsList: React.FC<UpcomingAppointmentsListProps> = ({
  appointments,
}) => {
  return (
    <>
      {appointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {appointments.map((app) => (
            <Card
              key={app.id}
              className="p-4 flex items-center justify-between bg-white rounded-default shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Avatar
                  name={app.clientName}
                  surname={app.clientSurname}
                  src={app.avatarUrl}
                  size="md"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-on-surface text-body-md truncate">
                    {app.clientName}
                  </h4>
                  <p className="text-on-surface-variant text-body-sm font-semibold truncate mt-0.5">
                    {app.serviceName}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="px-2 py-0.5 bg-surface-container-low rounded text-on-surface-variant font-bold text-body-xs border border-outline-variant/30 select-none">
                  {app.time}
                </div>
                <div className="flex items-center gap-1 text-primary text-body-xs font-semibold">
                  <Clock className="w-3 h-3 text-primary" />
                  <span>{app.duration}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-outline-variant/60 rounded-default text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)] select-none">
          <CalendarIcon className="w-8 h-8 text-on-surface-variant/30 mb-2" />
          <p className="font-semibold text-on-surface-variant text-body-md">
            No hay próximas citas programadas
          </p>
          <p className="text-on-surface-variant/70 text-body-sm mt-0.5 font-medium">
            Tus citas programadas para los próximos días aparecerán aquí.
          </p>
        </div>
      )}
    </>
  );
};
UpcomingAppointmentsList.displayName = "UpcomingAppointmentsList";
