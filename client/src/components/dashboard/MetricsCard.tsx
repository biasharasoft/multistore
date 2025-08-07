import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  className?: string;
  trend?: "up" | "down" | "neutral";
}

export function MetricsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  className,
  trend = "neutral"
}: MetricsCardProps) {
  return (
    <Card className={cn("hover:shadow-medium transition-all duration-200", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "p-2 rounded-lg",
          changeType === "positive" && "bg-success/10",
          changeType === "negative" && "bg-destructive/10",
          changeType === "neutral" && "bg-primary/10"
        )}>
          <Icon className={cn(
            "h-4 w-4",
            changeType === "positive" && "text-success",
            changeType === "negative" && "text-destructive", 
            changeType === "neutral" && "text-primary"
          )} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {value}
        </div>
        <div className="flex items-center space-x-2">
          <span className={cn(
            "text-xs font-medium",
            changeType === "positive" && "text-success",
            changeType === "negative" && "text-destructive",
            changeType === "neutral" && "text-muted-foreground"
          )}>
            {change}
          </span>
          <span className="text-xs text-muted-foreground">
            from last period
          </span>
        </div>
      </CardContent>
    </Card>
  );
}