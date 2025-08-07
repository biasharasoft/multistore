import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CashFlowChart() {
  const [filterPeriod, setFilterPeriod] = useState("Week");
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>();

  const getCashFlowData = () => {
    switch (filterPeriod) {
      case "Today":
        return {
          revenue: 850,
          expenses: 420,
          cashFlow: 430,
          previousCashFlow: 380,
          period: "Today"
        };
      case "Week":
        return {
          revenue: 200000,
          expenses: 400000,
          cashFlow: -200000,
          previousCashFlow: -180000,
          period: "This week"
        };
      case "Month":
        return {
          revenue: 850000,
          expenses: 650000,
          cashFlow: 200000,
          previousCashFlow: 180000,
          period: "This month"
        };
      case "Year":
        return {
          revenue: 6800000,
          expenses: 4200000,
          cashFlow: 2600000,
          previousCashFlow: 2200000,
          period: "This year"
        };
      case "Custom":
        return {
          revenue: 250000,
          expenses: 180000,
          cashFlow: 70000,
          previousCashFlow: 65000,
          period: "Custom period"
        };
      default:
        return {
          revenue: 200000,
          expenses: 400000,
          cashFlow: -200000,
          previousCashFlow: -180000,
          period: "This week"
        };
    }
  };

  const data = getCashFlowData();
  const changePercent = Math.abs(((data.cashFlow - data.previousCashFlow) / Math.abs(data.previousCashFlow)) * 100);
  const isPositiveChange = data.cashFlow > data.previousCashFlow;
  const isNegativeCashFlow = data.cashFlow < 0;
  
  const maxAmount = Math.max(Math.abs(data.revenue), Math.abs(data.expenses));
  const revenueWidth = (Math.abs(data.revenue) / maxAmount) * 100;
  const expensesWidth = (Math.abs(data.expenses) / maxAmount) * 100;

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Cash Flow</CardTitle>
            <p className="text-sm text-muted-foreground">
              Am i spending more than i make?
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Today">Today</SelectItem>
                <SelectItem value="Week">Week</SelectItem>
                <SelectItem value="Month">Month</SelectItem>
                <SelectItem value="Year">Year</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            
            {filterPeriod === "Custom" && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-24 justify-start text-left font-normal", !customDateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateFrom ? format(customDateFrom, "MMM dd") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={customDateFrom} onSelect={setCustomDateFrom} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-24 justify-start text-left font-normal", !customDateTo && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateTo ? format(customDateTo, "MMM dd") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={customDateTo} onSelect={setCustomDateTo} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{data.period}</p>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-4xl font-bold", isNegativeCashFlow ? "text-destructive" : "text-foreground")}>
                {isNegativeCashFlow ? "- " : ""}TSh {Math.abs(data.cashFlow).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Vs past period</p>
            <span className={cn("text-xl font-semibold", !isPositiveChange ? "text-destructive" : "text-green-600")}>
              {isPositiveChange ? "+" : ""}{changePercent.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Revenue</span>
              <span className="text-sm font-medium">TSh {data.revenue.toLocaleString()}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${revenueWidth}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Expenses</span>
              <span className="text-sm font-medium">- TSh {data.expenses.toLocaleString()}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-destructive h-2 rounded-full transition-all duration-300" 
                style={{ width: `${expensesWidth}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}