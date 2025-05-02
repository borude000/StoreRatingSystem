import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    isIncrease: boolean;
  };
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-primary",
  iconBgColor = "bg-blue-100",
  trend,
}: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-4">
        <div className={cn("p-3 rounded-full", iconBgColor)}>
          <Icon className={cn("text-xl", iconColor)} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-500">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
      
      {trend && (
        <div className="mt-4">
          <span 
            className={cn(
              "text-xs font-medium",
              trend.isIncrease ? "text-success" : "text-danger"
            )}
          >
            {trend.isIncrease ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {trend.value}% {trend.isIncrease ? "increase" : "decrease"}
          </span>
          <span className="text-xs text-slate-500 ml-2">since last month</span>
        </div>
      )}
    </Card>
  );
}
