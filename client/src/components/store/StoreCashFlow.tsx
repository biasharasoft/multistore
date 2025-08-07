import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StoreCashFlowProps {
  storeId: string;
}

export function StoreCashFlow({ storeId }: StoreCashFlowProps) {
  const [filterPeriod, setFilterPeriod] = useState("Week");
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>();

  // Mock data based on store ID and period - in real app, this would come from API
  const getStoreCashFlowData = (id: string, period: string) => {
    const baseData = {
      "1": {
        today: { revenue: 15000, expenses: 8000, cashFlow: 7000, previousCashFlow: 6500, period: "Today" },
        week: { revenue: 200000, expenses: 400000, cashFlow: -200000, previousCashFlow: -178000, period: "This week" },
        month: { revenue: 850000, expenses: 650000, cashFlow: 200000, previousCashFlow: 180000, period: "This month" },
        year: { revenue: 5800000, expenses: 4200000, cashFlow: 1600000, previousCashFlow: 1400000, period: "This year" },
        custom: { revenue: 120000, expenses: 90000, cashFlow: 30000, previousCashFlow: 25000, period: "Custom period" }
      },
      "2": {
        today: { revenue: 12000, expenses: 7000, cashFlow: 5000, previousCashFlow: 4800, period: "Today" },
        week: { revenue: 150000, expenses: 120000, cashFlow: 30000, previousCashFlow: 25000, period: "This week" },
        month: { revenue: 620000, expenses: 480000, cashFlow: 140000, previousCashFlow: 125000, period: "This month" },
        year: { revenue: 4200000, expenses: 3600000, cashFlow: 600000, previousCashFlow: 550000, period: "This year" },
        custom: { revenue: 85000, expenses: 65000, cashFlow: 20000, previousCashFlow: 18000, period: "Custom period" }
      },
      "3": {
        today: { revenue: 8000, expenses: 9000, cashFlow: -1000, previousCashFlow: -800, period: "Today" },
        week: { revenue: 80000, expenses: 90000, cashFlow: -10000, previousCashFlow: -8000, period: "This week" },
        month: { revenue: 320000, expenses: 380000, cashFlow: -60000, previousCashFlow: -45000, period: "This month" },
        year: { revenue: 2800000, expenses: 3200000, cashFlow: -400000, previousCashFlow: -350000, period: "This year" },
        custom: { revenue: 45000, expenses: 52000, cashFlow: -7000, previousCashFlow: -5000, period: "Custom period" }
      },
      "4": {
        today: { revenue: 14000, expenses: 10000, cashFlow: 4000, previousCashFlow: 3800, period: "Today" },
        week: { revenue: 180000, expenses: 160000, cashFlow: 20000, previousCashFlow: 18000, period: "This week" },
        month: { revenue: 720000, expenses: 640000, cashFlow: 80000, previousCashFlow: 70000, period: "This month" },
        year: { revenue: 4800000, expenses: 4200000, cashFlow: 600000, previousCashFlow: 520000, period: "This year" },
        custom: { revenue: 95000, expenses: 85000, cashFlow: 10000, previousCashFlow: 9000, period: "Custom period" }
      }
    };

    const storeData = baseData[id as keyof typeof baseData] || baseData["1"];
    
    switch (period) {
      case "Today":
        return storeData.today;
      case "Week":
        return storeData.week;
      case "Month":
        return storeData.month;
      case "Year":
        return storeData.year;
      case "Custom":
        return storeData.custom;
      default:
        return storeData.week;
    }
  };

  const data = getStoreCashFlowData(storeId, filterPeriod);
  const changePercent = Math.abs(((data.cashFlow - data.previousCashFlow) / Math.abs(data.previousCashFlow)) * 100);
  const isPositiveChange = data.cashFlow > data.previousCashFlow;
  const isNegativeCashFlow = data.cashFlow < 0;
  
  const maxAmount = Math.max(Math.abs(data.revenue), Math.abs(data.expenses));
  const revenueWidth = (Math.abs(data.revenue) / maxAmount) * 100;
  const expensesWidth = (Math.abs(data.expenses) / maxAmount) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Cash Flow</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Am i spending more than i make?
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-md z-50">
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
                  <PopoverContent className="w-auto p-0 z-50" align="start">
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
                  <PopoverContent className="w-auto p-0 z-50" align="start">
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
              {changePercent.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Revenue</span>
              <span className="text-sm font-medium text-foreground">{data.revenue.toLocaleString()}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${revenueWidth}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Expenses</span>
              <span className="text-sm font-medium text-foreground">- {data.expenses.toLocaleString()}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-destructive h-3 rounded-full transition-all duration-300" 
                style={{ width: `${expensesWidth}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}