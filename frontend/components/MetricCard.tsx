import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: string;
  trend?: "up" | "down" | "neutral" | "stable";
  className?: string;
}

export default function MetricCard({
  title,
  value,
  icon,
  change,
  trend,
  className = "",
}: MetricCardProps) {
  const getTrendStyles = () => {
    switch (trend) {
      case "up":
        return {
          textColor: "text-tertiary",
          bgColor: "bg-secondary-container/30",
          icon: TrendingUp,
        };
      case "down":
        return {
          textColor: "text-error",
          bgColor: "bg-error-container/30",
          icon: TrendingDown,
        };
      case "neutral":
      case "stable":
      default:
        return {
          textColor: "text-on-surface-variant",
          bgColor: "bg-surface-container",
          icon: Minus,
        };
    }
  };

  const trendStyles = getTrendStyles();
  const TrendIcon = trendStyles.icon;

  return (
    <div
      className={`bg-surface-container-lowest p-4 sm:p-6 rounded-xl border border-outline-variant shadow-[0px_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-2 sm:gap-3 hover:border-primary-fixed-dim transition-colors ${className}`}
    >
      <div className="flex justify-between items-start">
        {/* Metric Icon Wrapper */}
        <div className="p-1 sm:p-1.5 bg-surface-container text-primary rounded-lg shrink-0">
          {icon}
        </div>
        
        {/* Trend Indicator */}
        {change && (
          <div
            className={`flex items-center gap-0.5 sm:gap-1 px-2 py-[1px] sm:px-3 sm:py-[2px] rounded-full text-label-sm sm:text-label-md font-bold ${trendStyles.bgColor} ${trendStyles.textColor}`}
          >
            {trend !== "neutral" && trend !== "stable" && (
              <TrendIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>

      {/* Label and Value */}
      <div className="mt-0.5 sm:mt-1">
        <p className="text-on-surface-variant font-label-sm sm:font-label-md text-label-sm sm:text-label-md">
          {title}
        </p>
        <h3 className="text-headline-md sm:text-headline-lg font-headline-md sm:font-headline-lg font-semibold text-on-surface mt-0.5 sm:mt-1">
          {value}
        </h3>
      </div>
    </div>
  );
}
