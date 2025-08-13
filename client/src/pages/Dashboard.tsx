import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/currency";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

export default function Dashboard() {
  // Fetch company information to get currency setting
  const { data: company } = useQuery<any>({
    queryKey: ['/api/company'],
  });

  // Fetch real dashboard metrics from the database
  const { data: metricsData, isLoading: metricsLoading } = useQuery<any>({
    queryKey: ['/api/dashboard/metrics'],
  });

  const metrics = [
    {
      title: "Total Revenue",
      value: formatCurrency((metricsData?.totalRevenue || 0) / 100, company?.currency || 'USD'),
      change: "+20.1%", // TODO: Calculate actual percentage change
      changeType: "positive" as const,
      icon: DollarSign
    },
    {
      title: "Sales",
      value: metricsData?.totalSales?.toString() || "0",
      change: "+180.1%", // TODO: Calculate actual percentage change
      changeType: "positive" as const, 
      icon: ShoppingBag
    },
    {
      title: "Customers",
      value: metricsData?.totalCustomers?.toString() || "0",
      change: "+19%", // TODO: Calculate actual percentage change
      changeType: "positive" as const,
      icon: Users
    },
    {
      title: "Products",
      value: metricsData?.totalProducts?.toString() || "0",
      change: "-2%", // TODO: Calculate actual percentage change
      changeType: "negative" as const,
      icon: Package
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your stores today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-lg font-semibold text-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricsCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts and Data */}
      <div className="grid gap-6">
        <CashFlowChart />
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <InventoryAlerts />
        <TopProducts />
      </div>
    </div>
  );
}