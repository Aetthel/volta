"use client";

import React, { useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CalendarEvent } from "./EventCard";

export interface TimeGridEventCardProps {
  event: CalendarEvent;
  top: number;
  height: number;
  onEventClick: (event: CalendarEvent) => void;
  onDragStart: (event: CalendarEvent) => void;
  onDragEnd: () => void;
  getColorClasses: (color: string) => { bg: string; text: string };
  leftOffsetPercent?: number;
  widthPercent?: number;
}

export function layoutDayEvents(events: CalendarEvent[]) {
  const START_HOUR = 8;
  const HOUR_HEIGHT = 64;

  const sorted = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const items = sorted.map((event) => {
    const startHour = event.startTime.getHours();
    const startMin = event.startTime.getMinutes();

    const startTotalMins = (startHour - START_HOUR) * 60 + startMin;
    const durationMins = Math.max(
      15,
      Math.round((event.endTime.getTime() - event.startTime.getTime()) / 60000)
    );
    const endTotalMins = startTotalMins + durationMins;

    const top = Math.max(0, (startTotalMins / 60) * HOUR_HEIGHT);
    const height = Math.max(22, (durationMins / 60) * HOUR_HEIGHT - 2);

    return {
      event,
      top,
      height,
      startTotalMins,
      endTotalMins,
      leftOffsetPercent: 0,
      widthPercent: 100,
    };
  });

  // Calculate overlapping clusters
  for (let i = 0; i < items.length; i++) {
    const curr = items[i];
    const overlaps = items.filter(
      (other, j) =>
        i !== j &&
        curr.startTotalMins < other.endTotalMins &&
        curr.endTotalMins > other.startTotalMins
    );
    if (overlaps.length > 0) {
      const allCluster = [curr, ...overlaps].sort((a, b) => a.startTotalMins - b.startTotalMins);
      const totalColumns = allCluster.length;
      const indexInCluster = allCluster.findIndex((item) => item.event.id === curr.event.id);
      curr.widthPercent = Math.floor(100 / totalColumns);
      curr.leftOffsetPercent = curr.widthPercent * indexInCluster;
    }
  }

  return items;
}

export const TimeGridEventCard: React.FC<TimeGridEventCardProps> = ({
  event,
  top,
  height,
  onEventClick,
  onDragStart,
  onDragEnd,
  getColorClasses,
  leftOffsetPercent = 0,
  widthPercent = 100,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const colorClasses = getColorClasses(event.color);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = () => {
    const diff = event.endTime.getTime() - event.startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const isShort = height < 38;
  const isMedium = height >= 38 && height < 60;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(event)}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick(event);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `calc(${leftOffsetPercent}% + 2px)`,
        width: `calc(${widthPercent}% - 4px)`,
      }}
      className={cn(
        "absolute z-10 cursor-pointer rounded-md p-1.5 transition-all duration-150 overflow-hidden shadow-xs flex flex-col justify-start select-none",
        colorClasses.bg,
        "text-white",
        isHovered && "z-30 ring-2 ring-white/80 shadow-md brightness-105"
      )}
    >
      {/* Card Content based on available height */}
      {isShort ? (
        <div className="flex items-center gap-1.5 leading-tight truncate text-[11px]">
          <span className="font-bold truncate">{event.title}</span>
          {event.clientName && (
            <span className="opacity-90 text-[10px] truncate">· {event.clientName}</span>
          )}
          <span className="opacity-80 text-[10px] shrink-0 font-medium ml-auto">
            {formatTime(event.startTime)}
          </span>
        </div>
      ) : isMedium ? (
        <div className="flex flex-col h-full justify-between leading-tight overflow-hidden">
          <div>
            <div className="font-bold text-xs truncate">{event.title}</div>
            {event.clientName && (
              <div className="text-[11px] opacity-90 truncate font-medium">{event.clientName}</div>
            )}
          </div>
          <div className="flex items-center justify-between gap-1 text-[10px] opacity-80 truncate">
            <span>
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between overflow-hidden">
          <div>
            <div className="font-bold text-xs truncate">{event.title}</div>
            {event.clientName && (
              <div className="text-[11px] opacity-95 truncate font-medium mt-0.5">
                {event.clientName}
              </div>
            )}
            <div className="flex items-center gap-1 text-[10px] opacity-85 mt-1">
              <Clock className="w-3 h-3 shrink-0 opacity-80" />
              <span>
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </span>
              <span className="opacity-75">({getDuration()})</span>
            </div>
          </div>
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto pt-1">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-white/20 text-white backdrop-blur-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hover Card / Tooltip Popup */}
      {isHovered && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none">
          <Card className="border border-outline-variant p-3 shadow-xl bg-surface-container-lowest text-on-surface">
            <div className="space-y-1.5">
              <h4 className="font-bold text-sm leading-tight text-on-surface">{event.title}</h4>
              {event.clientName && (
                <p className="text-xs font-semibold text-primary">{event.clientName}</p>
              )}
              {event.description && (
                <p className="text-xs text-on-surface-variant line-clamp-2">{event.description}</p>
              )}
              <div className="flex items-center gap-1 text-xs text-on-surface-variant font-medium">
                <Clock className="h-3 w-3" />
                <span>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </span>
                <span className="text-[10px] text-on-surface-variant/75">({getDuration()})</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {event.category && (
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {event.category}
                  </Badge>
                )}
                {event.tags?.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] h-5">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
