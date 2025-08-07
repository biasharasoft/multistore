import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Calendar,
  Download,
  Filter,
  Target,
  Award,
  Clock,
  Star
} from "lucide-react";

export default function Analytics() {
  // Sample data for charts
  const salesData = [
    { month: 'Jan', revenue: 45000, orders: 320, customers: 150 },
    { month: 'Feb', revenue: 52000, orders: 380, customers: 180 },
    { month: 'Mar', revenue: 48000, orders: 350, customers: 165 },
    { month: 'Apr', revenue: 61000, orders: 420, customers: 200 },
    { month: 'May', revenue: 55000, orders: 390, customers: 185 },
    { month: 'Jun', revenue: 67000, orders: 480, customers: 220 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 35, color: 'hsl(217, 91%, 60%)' },
    { name: 'Clothing', value: 25, color: 'hsl(142, 71%, 45%)' },
    { name: 'Books', value: 20, color: 'hsl(38, 92%, 50%)' },
    { name: 'Home & Garden', value: 15, color: 'hsl(0, 84%, 60%)' },
    { name: 'Others', value: 5, color: 'hsl(216, 12%, 84%)' },
  ];

  const hourlyData = [
    { hour: '6AM', sales: 12 },
    { hour: '9AM', sales: 45 },
    { hour: '12PM', sales: 78 },
    { hour: '3PM', sales: 65 },
    { hour: '6PM', sales: 89 },
    { hour: '9PM', sales: 34 },
  ];

  const storePerformance = [
    { store: 'Downtown', revenue: 125000, growth: '+15%', orders: 1250 },
    { store: 'Mall Location', revenue: 98000, growth: '+8%', orders: 980 },
    { store: 'Airport Store', revenue: 156000, growth: '+22%', orders: 1560 },
    { store: 'Suburbs', revenue: 87000, growth: '-3%', orders: 870 },
  ];

  const topProducts = [
    { name: 'iPhone 15 Pro', revenue: 15600, units: 52, margin: '22%' },
    { name: 'Samsung Galaxy S24', revenue: 12800, units: 64, margin: '18%' },
    { name: 'MacBook Air', revenue: 18900, units: 21, margin: '25%' },
    { name: 'Dell XPS 13', revenue: 14200, units: 28, margin: '20%' },
    { name: 'iPad Pro', revenue: 11500, units: 35, margin: '24%' },
  ];

  const kpiCards = [
    {
      title: "Average Order Value",
      value: "TSh 147.50",
      change: "+8.2%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "vs last month"
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      change: "+0.5%",
      changeType: "positive" as const,
      icon: Target,
      description: "from visitors"
    },
    {
      title: "Customer Lifetime Value",
      value: "TSh 892",
      change: "+12.1%",
      changeType: "positive" as const,
      icon: Award,
      description: "average CLV"
    },
    {
      title: "Return Rate",
      value: "2.1%",
      change: "-0.3%",
      changeType: "positive" as const,
      icon: TrendingDown,
      description: "lower is better"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights and performance metrics for your business
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30days">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className={`flex items-center ${
                  kpi.changeType === 'positive' ? 'text-success' : 'text-destructive'
                }`}>
                  {kpi.changeType === 'positive' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {kpi.change}
                </span>
                <span className="ml-1">{kpi.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="stores">Stores</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue Trend */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>
                  Monthly revenue, orders, and customer acquisition over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="hsl(217, 91%, 60%)"
                      fill="hsl(217, 91%, 60%)"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sales by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution across product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Hourly Sales Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Sales Pattern</CardTitle>
                <CardDescription>Average sales volume by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="hsl(142, 71%, 45%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Detailed sales metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(217, 91%, 60%)"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(217, 91%, 60%)', strokeWidth: 2, r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="hsl(142, 71%, 45%)"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(142, 71%, 45%)', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Best selling products by revenue and units sold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.units} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">TSh {product.revenue.toLocaleString()}</p>
                      <Badge variant="secondary">{product.margin} margin</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Performance</CardTitle>
              <CardDescription>Revenue and growth metrics by store location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storePerformance.map((store, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{store.store}</p>
                        <p className="text-sm text-muted-foreground">{store.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">TSh {store.revenue.toLocaleString()}</p>
                      <Badge 
                        variant={store.growth.startsWith('+') ? 'default' : 'destructive'}
                      >
                        {store.growth}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
                <CardDescription>New customers acquired over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="customers" fill="hsl(199, 89%, 48%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Insights</CardTitle>
                <CardDescription>Key customer behavior metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Repeat Customer Rate</span>
                    <span className="font-semibold">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average Purchase Frequency</span>
                    <span className="font-semibold">2.4x/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-semibold">4.6/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Churn Rate</span>
                    <span className="font-semibold text-destructive">5.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}