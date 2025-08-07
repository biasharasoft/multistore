import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Eye,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  X,
  Clock,
  CreditCard,
  MapPin
} from "lucide-react";
import { format } from "date-fns";

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [timeFilter, setTimeFilter] = useState("Today");
  const [showDateRange, setShowDateRange] = useState(false);
  const [viewMode, setViewMode] = useState("overview");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Mock sales data
  const salesMetrics = [
    {
      title: "Total Sales",
      value: "$45,231.89",
      change: "+20.1%",
      trend: "up",
      icon: DollarSign,
      period: "from last month"
    },
    {
      title: "Transactions",
      value: "1,234",
      change: "+15.3%",
      trend: "up",
      icon: ShoppingCart,
      period: "this month"
    },
    {
      title: "Avg. Order Value",
      value: "$36.65",
      change: "-2.1%",
      trend: "down",
      icon: TrendingUp,
      period: "vs last month"
    },
    {
      title: "Customers Served",
      value: "892",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      period: "this month"
    }
  ];

  const recentSales = [
    {
      id: "TXN-001",
      date: "2024-01-15",
      time: "14:30",
      customer: "John Doe",
      customerEmail: "john.doe@email.com",
      customerPhone: "+1 (555) 123-4567",
      store: "Main Store",
      storeAddress: "123 Main St, City, State 12345",
      items: 3,
      total: 125.50,
      subtotal: 115.50,
      tax: 10.00,
      status: "completed",
      paymentMethod: "Credit Card",
      cardLast4: "4242",
      products: [
        { name: "Wireless Headphones", quantity: 1, price: 79.99 },
        { name: "USB Cable", quantity: 2, price: 17.75 }
      ]
    },
    {
      id: "TXN-002", 
      date: "2024-01-15",
      time: "13:45",
      customer: "Jane Smith",
      customerEmail: "jane.smith@email.com",
      customerPhone: "+1 (555) 987-6543",
      store: "Branch A",
      storeAddress: "456 Oak Ave, City, State 12345",
      items: 1,
      total: 89.99,
      subtotal: 82.99,
      tax: 7.00,
      status: "completed",
      paymentMethod: "Cash",
      cardLast4: null,
      products: [
        { name: "Smartphone Case", quantity: 1, price: 82.99 }
      ]
    },
    {
      id: "TXN-003",
      date: "2024-01-15", 
      time: "12:20",
      customer: "Mike Johnson",
      customerEmail: "mike.johnson@email.com",
      customerPhone: "+1 (555) 456-7890",
      store: "Main Store",
      storeAddress: "123 Main St, City, State 12345",
      items: 5,
      total: 234.75,
      subtotal: 216.75,
      tax: 18.00,
      status: "refunded",
      paymentMethod: "Debit Card",
      cardLast4: "8765",
      products: [
        { name: "Laptop Stand", quantity: 1, price: 98.99 },
        { name: "Power Bank", quantity: 2, price: 49.99 },
        { name: "USB Cable", quantity: 2, price: 17.75 }
      ]
    },
    {
      id: "TXN-004",
      date: "2024-01-15",
      time: "11:15",
      customer: "Sarah Wilson",
      customerEmail: "sarah.wilson@email.com",
      customerPhone: "+1 (555) 321-9876",
      store: "Branch B",
      storeAddress: "789 Pine St, City, State 12345",
      items: 2,
      total: 156.80,
      subtotal: 144.80,
      tax: 12.00,
      status: "completed",
      paymentMethod: "Mobile Pay",
      cardLast4: null,
      products: [
        { name: "Wireless Headphones", quantity: 1, price: 79.99 },
        { name: "Smartphone Case", quantity: 1, price: 64.81 }
      ]
    }
  ];

  const topProducts = [
    { name: "Wireless Headphones", sales: 145, revenue: "$7,250", growth: "+12%" },
    { name: "Smartphone Case", sales: 132, revenue: "$3,960", growth: "+8%" },
    { name: "Laptop Stand", sales: 98, revenue: "$4,900", growth: "+15%" },
    { name: "USB Cable", sales: 87, revenue: "$1,305", growth: "+5%" },
    { name: "Power Bank", sales: 76, revenue: "$3,800", growth: "+20%" }
  ];

  const salesByStore = [
    { store: "Main Store", sales: "$18,540", transactions: 456, growth: "+22%" },
    { store: "Branch A", sales: "$14,290", transactions: 378, growth: "+15%" },
    { store: "Branch B", sales: "$12,401", transactions: 332, growth: "+18%" },
    { store: "Online Store", sales: "$8,890", transactions: 245, growth: "+35%" }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: "default" as const, label: "Completed" },
      refunded: { variant: "destructive" as const, label: "Refunded" },
      pending: { variant: "secondary" as const, label: "Pending" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredSales = recentSales.filter(sale => {
    const matchesSearch = sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.store.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sales Analytics</h1>
          <p className="text-muted-foreground">Track your sales performance and revenue metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeFilter} onValueChange={(value) => {
            setTimeFilter(value);
            setShowDateRange(value === "Date Range");
          }}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Week">Week</SelectItem>
              <SelectItem value="Month">Month</SelectItem>
              <SelectItem value="Quarter">Quarter</SelectItem>
              <SelectItem value="Semi Annual">Semi Annual</SelectItem>
              <SelectItem value="Year">Year</SelectItem>
              <SelectItem value="Date Range">Date Range</SelectItem>
            </SelectContent>
          </Select>
          
          {showDateRange && (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {dateRange ? format(dateRange, "MMM dd") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange}
                    onSelect={setDateRange}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {endDate ? format(endDate, "MMM dd") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {salesMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {metric.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                )}
                <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {metric.change}
                </span>
                <span className="ml-1">{metric.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Top Products
          </TabsTrigger>
          <TabsTrigger value="stores" className="gap-2">
            <PieChart className="h-4 w-4" />
            By Store
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Sales Trend (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart will be implemented with actual data visualization library
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Sales by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Pie chart showing sales distribution by product category
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Transaction ID</th>
                      <th className="text-left p-4">Date & Time</th>
                      <th className="text-left p-4">Customer</th>
                      <th className="text-left p-4">Store</th>
                      <th className="text-left p-4">Items</th>
                      <th className="text-left p-4">Total</th>
                      <th className="text-left p-4">Payment</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{sale.id}</td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{sale.date}</div>
                            <div className="text-sm text-muted-foreground">{sale.time}</div>
                          </div>
                        </td>
                        <td className="p-4">{sale.customer}</td>
                        <td className="p-4">{sale.store}</td>
                        <td className="p-4">{sale.items}</td>
                        <td className="p-4 font-medium">${sale.total.toFixed(2)}</td>
                        <td className="p-4">{sale.paymentMethod}</td>
                        <td className="p-4">{getStatusBadge(sale.status)}</td>
                        <td className="p-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewTransaction(sale)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.sales} units sold</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{product.revenue}</div>
                      <div className="text-sm text-green-500">{product.growth}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {salesByStore.map((store, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {store.store}
                    <Badge variant="secondary">{store.growth}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Sales</span>
                      <span className="font-bold text-xl">{store.sales}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Transactions</span>
                      <span className="font-medium">{store.transactions}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${60 + index * 10}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="w-screen h-screen max-w-none max-h-none rounded-none overflow-y-auto flex items-center justify-center">
          <div className="w-[70%] max-h-full overflow-y-auto bg-background rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between mb-6">
              <span>Transaction Details</span>
              <Badge variant={selectedTransaction?.status === "completed" ? "default" : 
                            selectedTransaction?.status === "refunded" ? "destructive" : "secondary"}>
                {selectedTransaction?.status?.charAt(0).toUpperCase() + selectedTransaction?.status?.slice(1)}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Transaction Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="font-medium">{selectedTransaction.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time:</span>
                      <div className="text-right">
                        <div className="font-medium">{selectedTransaction.date}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {selectedTransaction.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        <span className="font-medium">
                          {selectedTransaction.paymentMethod}
                          {selectedTransaction.cardLast4 && ` ****${selectedTransaction.cardLast4}`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Customer Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedTransaction.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedTransaction.customerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{selectedTransaction.customerPhone}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Store Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Store Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{selectedTransaction.store}</div>
                      <div className="text-sm text-muted-foreground">{selectedTransaction.storeAddress}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Items Purchased ({selectedTransaction.items})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedTransaction.products.map((product: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">Qty: {product.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${(product.price * product.quantity).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">${product.price.toFixed(2)} each</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${selectedTransaction.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${selectedTransaction.tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${selectedTransaction.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sales;