import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/volta-ui";

interface MetricCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  change?: string;
  trend?: "up" | "down" | "neutral" | "stable";
  progress?: number; // Optional progress percentage (0 - 100)
  iconClassName?: string; // Optional custom class for icon container
  className?: string;
}

export default function MetricCard({
  title,
  value,
  icon,
  change,
  trend,
  progress,
  iconClassName = "",
  className = "",
}: MetricCardProps) {
  const getTrendStyles = () => {
    switch (trend) {
      case "up":
        return {
          textColor: "text-tertiary",
          icon: TrendingUp,
        };
      case "down":
        return {
          textColor: "text-error",
          icon: TrendingDown,
        };
      case "neutral":
      case "stable":
      default:
        return {
          textColor: "text-on-surface-variant",
          icon: Minus,
        };
    }
  };

  const trendStyles = getTrendStyles();
  const TrendIcon = trendStyles.icon;

  return (
    <Card className={cn("p-4 sm:p-6 flex flex-col gap-2 sm:gap-3", className)}>
      <div className="flex justify-between items-start">
        {/* Metric Icon Wrapper */}
        <div className={cn("text-primary shrink-0 transition-colors", iconClassName)}>{icon}</div>

        {/* Trend Indicator */}
        {change && (
          <div
            className={`flex items-center gap-0.5 sm:gap-1 text-label-sm sm:text-label-md font-bold ${trendStyles.textColor}`}
          >
            {trend !== "neutral" && trend !== "stable" && (
              <TrendIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>

      {/* Label and Value */}
      <div className="mt-0.5 sm:mt-1 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-on-surface-variant font-label-sm sm:font-label-md text-label-sm sm:text-label-md">
            {title}
          </p>
          <h3 className="text-headline-md sm:text-headline-lg font-headline-md sm:font-headline-lg font-semibold text-on-surface mt-0.5 sm:mt-1">
            {value}
          </h3>
        </div>

        {/* Optional Progress Bar */}
        {progress !== undefined && (
          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden mt-3 sm:mt-4">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
