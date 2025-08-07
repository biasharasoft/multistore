import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const salesData = [
  { month: "Jan", sales: 4000, target: 3800 },
  { month: "Feb", sales: 3000, target: 3200 },
  { month: "Mar", sales: 5000, target: 4500 },
  { month: "Apr", sales: 4500, target: 4200 },
  { month: "May", sales: 6000, target: 5500 },
  { month: "Jun", sales: 5500, target: 5800 },
  { month: "Jul", sales: 7000, target: 6500 },
  { month: "Aug", sales: 6500, target: 6800 },
  { month: "Sep", sales: 8000, target: 7500 },
  { month: "Oct", sales: 7500, target: 7800 },
  { month: "Nov", sales: 9000, target: 8500 },
  { month: "Dec", sales: 8500, target: 9000 }
];

export function SalesChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Sales Overview</CardTitle>
        <p className="text-sm text-muted-foreground">
          Monthly sales performance across all stores
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(216 12% 88%)" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(215 16% 47%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(215 16% 47%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `TSh ${value/1000}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(0 0% 100%)",
                  border: "1px solid hsl(216 12% 88%)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                formatter={(value, name) => [
                  `TSh ${value.toLocaleString()}`,
                  name === 'sales' ? 'Actual Sales' : 'Target'
                ]}
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="hsl(142 71% 45%)"
                strokeWidth={2}
                fill="url(#targetGradient)"
                strokeDasharray="5 5"
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(217 91% 60%)"
                strokeWidth={2}
                fill="url(#salesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}