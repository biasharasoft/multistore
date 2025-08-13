import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  X,
  Package,
  DollarSign,
  Warehouse,
  BarChart3,
  Tag,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Box,
  ShoppingCart,
  Eye,
  Clock
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Database types
interface DbProduct {
  id: string;
  name: string;
  categoryId: string | null;
  price: number; // in cents
  cost: number; // in cents
  wholesalerPrice: number; // in cents
  wholesalerDiscount: number; // percentage * 100
  retailPrice: number; // in cents
  retailDiscount: number; // percentage * 100
  stock: number;
  lowStockThreshold: number;
  description: string | null;
  barcode: string | null;
  image: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductsCategory {
  id: string;
  name: string;
  isActive: boolean;
}

// Frontend display types
interface Product {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  price: number; // in dollars
  cost: number; // in dollars
  wholesalerPrice: number; // in dollars
  wholesalerDiscount: number; // as percentage
  retailPrice: number; // in dollars
  retailDiscount: number; // as percentage
  stock: number;
  lowStockThreshold: number;
  description: string;
  barcode: string;
  image?: string;
  status: "active" | "inactive" | "discontinued";
  createdAt: string;
  updatedAt: string;
}

// Helper function to convert database product to frontend product
const convertDbProductToFrontend = (dbProduct: DbProduct, categories: ProductsCategory[]): Product => {
  if (!dbProduct) {
    throw new Error('Product data is required');
  }
  
  const category = categories.find(c => c.id === dbProduct.categoryId);
  return {
    id: dbProduct.id || '',
    name: dbProduct.name || 'Unnamed Product',
    categoryId: dbProduct.categoryId || undefined,
    category: category?.name || "Uncategorized",
    price: dbProduct.price || 0, // Already stored as decimal
    cost: dbProduct.cost || 0, // Already stored as decimal
    wholesalerPrice: dbProduct.wholesalerPrice || 0, // Already stored as decimal
    wholesalerDiscount: dbProduct.wholesalerDiscount || 0, // Already stored as percentage decimal
    retailPrice: dbProduct.retailPrice || 0, // Already stored as decimal
    retailDiscount: dbProduct.retailDiscount || 0, // Already stored as percentage decimal
    stock: dbProduct.stock || 0,
    lowStockThreshold: dbProduct.lowStockThreshold || 5,
    description: dbProduct.description || "",
    barcode: dbProduct.barcode || "",
    image: dbProduct.image || undefined,
    status: (dbProduct.status as "active" | "inactive" | "discontinued") || "active",
    createdAt: dbProduct.createdAt || new Date().toISOString(),
    updatedAt: dbProduct.updatedAt || new Date().toISOString(),
  };
};

// Mock sales data for demo purposes
const generateSalesData = (productName: string) => [
  { month: "Jan", sales: Math.floor(Math.random() * 100) + 20, revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Feb", sales: Math.floor(Math.random() * 100) + 20, revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Mar", sales: Math.floor(Math.random() * 100) + 20, revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Apr", sales: Math.floor(Math.random() * 100) + 20, revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: "May", sales: Math.floor(Math.random() * 100) + 20, revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Jun", sales: Math.floor(Math.random() * 100) + 20, revenue: Math.floor(Math.random() * 5000) + 1000 },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: "",
    cost: "",
    wholesalerPrice: "",
    wholesalerDiscount: "",
    retailPrice: "",
    retailDiscount: "",
    stock: "",
    lowStockThreshold: "",
    description: "",
    barcode: "",
    status: "active" as "active" | "inactive" | "discontinued"
  });

  // API Queries
  const { data: dbProduct, isLoading: isLoadingProduct, error: productError } = useQuery<DbProduct>({
    queryKey: ['/api/products', id],
    enabled: !!id,
  });
  
  const { data: categories = [] } = useQuery<ProductsCategory[]>({
    queryKey: ['/api/products-categories'],
  });

  // Debug logging
  console.log('ProductDetail Debug:', {
    id,
    dbProduct,
    categories,
    isLoadingProduct,
    productError
  });

  // Convert database product to frontend format
  const product = dbProduct && categories.length > 0 ? convertDbProductToFrontend(dbProduct, categories) : null;

  // Update mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsEditing(false);
      toast({ title: "Success", description: "Product has been updated successfully." });
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast({ title: "Error", description: "Failed to update product. Please try again.", variant: "destructive" });
    },
  });

  // Available categories for dropdown
  const availableCategories = categories.filter(cat => cat.isActive).map(cat => cat.name);

  // Load product data into edit form when editing starts
  useEffect(() => {
    if (isEditing && product) {
      setEditForm({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        cost: product.cost.toString(),
        wholesalerPrice: product.wholesalerPrice.toString(),
        wholesalerDiscount: product.wholesalerDiscount.toString(),
        retailPrice: product.retailPrice.toString(),
        retailDiscount: product.retailDiscount.toString(),
        stock: product.stock.toString(),
        lowStockThreshold: product.lowStockThreshold.toString(),
        description: product.description,
        barcode: product.barcode,
        status: product.status
      });
    }
  }, [isEditing, product]);

  const handleSave = () => {
    if (!editForm.name.trim()) {
      toast({
        title: "Error",
        description: "Product name is required.",
        variant: "destructive",
      });
      return;
    }

    updateProductMutation.mutate({
      name: editForm.name,
      categoryId: categories.find(c => c.name === editForm.category)?.id,
      price: parseFloat(editForm.price) || 0, // Store as decimal
      cost: parseFloat(editForm.cost) || 0, // Store as decimal
      wholesalerPrice: parseFloat(editForm.wholesalerPrice) || 0, // Store as decimal
      wholesalerDiscount: parseFloat(editForm.wholesalerDiscount) || 0, // Store as percentage decimal
      retailPrice: parseFloat(editForm.retailPrice) || 0, // Store as decimal
      retailDiscount: parseFloat(editForm.retailDiscount) || 0, // Store as percentage decimal
      stock: parseInt(editForm.stock) || 0,
      lowStockThreshold: parseInt(editForm.lowStockThreshold) || 5,
      description: editForm.description,
      barcode: editForm.barcode,
      status: editForm.status
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: "", category: "", price: "", cost: "", wholesalerPrice: "",
      wholesalerDiscount: "", retailPrice: "", retailDiscount: "", stock: "",
      lowStockThreshold: "", description: "", barcode: "", status: "active"
    });
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-6">
                <div className="h-96 bg-muted rounded-lg"></div>
                <div className="h-48 bg-muted rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-muted rounded-lg"></div>
                <div className="h-48 bg-muted rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/products')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const profit = product.price - product.cost;
  const margin = product.cost > 0 ? ((profit / product.price) * 100) : 0;
  const stockValue = product.stock * product.cost;
  const isLowStock = product.stock <= product.lowStockThreshold;
  const isOutOfStock = product.stock === 0;

  // Mock sales data
  const salesData = generateSalesData(product.name);
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);

  // Pie chart data for pricing breakdown
  const pricingData = [
    { name: 'Cost', value: product.cost, color: '#ef4444' },
    { name: 'Profit', value: profit, color: '#22c55e' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/products')}
                className="hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {product?.name?.charAt(0)?.toUpperCase() || 'P'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold">{product?.name || 'Loading...'}</h1>
                  <p className="text-sm text-muted-foreground">{product?.category || 'Loading...'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={product?.status === 'active' ? 'default' : 'secondary'}>
                {product?.status ? (product.status.charAt(0).toUpperCase() + product.status.slice(1)) : 'Loading...'}
              </Badge>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    size="sm"
                    disabled={updateProductMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProductMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="xl:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 border-green-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Profit</p>
                      <p className="text-lg font-bold">${profit.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`bg-gradient-to-br ${isLowStock ? 'from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30 border-red-200/50' : 'from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200/50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isLowStock ? 'bg-red-500/10' : 'bg-purple-500/10'}`}>
                      <Warehouse className={`h-5 w-5 ${isLowStock ? 'text-red-600' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stock</p>
                      <p className="text-lg font-bold">{product.stock} units</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Margin</p>
                      <p className="text-lg font-bold">{margin.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Overview */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Product Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Product Name</Label>
                      {isEditing ? (
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Enter product name"
                        />
                      ) : (
                        <p className="text-sm mt-1 p-2 bg-muted/50 rounded-md">{product.name}</p>
                      )}
                    </div>

                    <div>
                      <Label>Category</Label>
                      {isEditing ? (
                        <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCategories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm mt-1 p-2 bg-muted/50 rounded-md">{product.category}</p>
                      )}
                    </div>

                    <div>
                      <Label>Barcode</Label>
                      {isEditing ? (
                        <Input
                          value={editForm.barcode}
                          onChange={(e) => setEditForm({ ...editForm, barcode: e.target.value })}
                          placeholder="Product barcode"
                        />
                      ) : (
                        <p className="text-sm mt-1 p-2 bg-muted/50 rounded-md font-mono">{product.barcode || "Not set"}</p>
                      )}
                    </div>

                    <div>
                      <Label>Status</Label>
                      {isEditing ? (
                        <Select value={editForm.status} onValueChange={(value: "active" | "inactive" | "discontinued") => setEditForm({ ...editForm, status: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="discontinued">Discontinued</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="mt-1">
                          <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Cost Price</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editForm.cost}
                          onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })}
                          placeholder="0.00"
                        />
                      ) : (
                        <p className="text-sm mt-1 p-2 bg-muted/50 rounded-md">${product.cost.toFixed(2)}</p>
                      )}
                    </div>

                    <div>
                      <Label>Selling Price</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                          placeholder="0.00"
                        />
                      ) : (
                        <p className="text-sm mt-1 p-2 bg-muted/50 rounded-md">${product.price.toFixed(2)}</p>
                      )}
                    </div>

                    <div>
                      <Label>Stock Quantity</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editForm.stock}
                          onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                          placeholder="0"
                        />
                      ) : (
                        <p className="text-sm mt-1 p-2 bg-muted/50 rounded-md">{product.stock} units</p>
                      )}
                    </div>

                    <div>
                      <Label>Low Stock Alert</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editForm.lowStockThreshold}
                          onChange={(e) => setEditForm({ ...editForm, lowStockThreshold: e.target.value })}
                          placeholder="5"
                        />
                      ) : (
                        <p className="text-sm mt-1 p-2 bg-muted/50 rounded-md">{product.lowStockThreshold} units</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  {isEditing ? (
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Product description"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm mt-1 p-3 bg-muted/50 rounded-md min-h-[60px]">
                      {product.description || "No description available"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sales Analytics */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Sales Performance
                  <Badge variant="outline" className="ml-auto">Last 6 Months</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold">{totalSales}</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="hsl(var(--primary))" 
                        fill="url(#salesGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Alerts */}
            {(isLowStock || isOutOfStock) && (
              <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    {isOutOfStock ? "Out of Stock" : "Low Stock Alert"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {isOutOfStock 
                      ? "This product is currently out of stock. Consider restocking soon."
                      : `Stock is running low. Only ${product.stock} units remaining.`
                    }
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Pricing Details */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Pricing Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cost Price</span>
                    <span className="font-medium">${product.cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Selling Price</span>
                    <span className="font-medium">${product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Wholesaler Price</span>
                    <span className="font-medium">${product.wholesalerPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Retail Price</span>
                    <span className="font-medium">${product.retailPrice.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Profit per Unit</span>
                    <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${profit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Margin</span>
                    <span className={`font-medium ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {margin.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Profit Visualization */}
                {profit > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Profit Breakdown</p>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pricingData}
                            cx="50%"
                            cy="50%"
                            outerRadius={40}
                            dataKey="value"
                            stroke="none"
                          >
                            {pricingData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Inventory Info */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5 text-primary" />
                  Inventory Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Stock</span>
                    <span className="font-medium">{product.stock} units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Low Stock Threshold</span>
                    <span className="font-medium">{product.lowStockThreshold} units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Stock Value</span>
                    <span className="font-medium">${stockValue.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={isOutOfStock ? 'destructive' : isLowStock ? 'secondary' : 'default'}>
                      {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Metadata */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Created</span>
                    <p className="text-sm font-medium">
                      {new Date(product.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <p className="text-sm font-medium">
                      {new Date(product.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Product ID</span>
                    <p className="text-sm font-mono font-medium break-all">{product.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Product Form Modal (for mobile) */}
      {isEditing && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl lg:hidden">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update product information and settings</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="editName">Product Name</Label>
                <Input
                  id="editName"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <Label htmlFor="editCategory">Category</Label>
                <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editBarcode">Barcode</Label>
                <Input
                  id="editBarcode"
                  value={editForm.barcode}
                  onChange={(e) => setEditForm({ ...editForm, barcode: e.target.value })}
                  placeholder="Product barcode"
                />
              </div>

              <div>
                <Label htmlFor="editCost">Cost Price ($)</Label>
                <Input
                  id="editCost"
                  type="number"
                  step="0.01"
                  value={editForm.cost}
                  onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="editWholesalerPrice">Wholesaler Price ($)</Label>
                <Input
                  id="editWholesalerPrice"
                  type="number"
                  step="0.01"
                  value={editForm.wholesalerPrice}
                  onChange={(e) => setEditForm({ ...editForm, wholesalerPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="editWholesalerDiscount">Wholesaler Discount (%)</Label>
                <Input
                  id="editWholesalerDiscount"
                  type="number"
                  step="0.01"
                  value={editForm.wholesalerDiscount}
                  onChange={(e) => setEditForm({ ...editForm, wholesalerDiscount: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="editRetailPrice">Retail Price ($)</Label>
                <Input
                  id="editRetailPrice"
                  type="number"
                  step="0.01"
                  value={editForm.retailPrice}
                  onChange={(e) => setEditForm({ ...editForm, retailPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="editRetailDiscount">Retail Discount (%)</Label>
                <Input
                  id="editRetailDiscount"
                  type="number"
                  step="0.01"
                  value={editForm.retailDiscount}
                  onChange={(e) => setEditForm({ ...editForm, retailDiscount: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="editStock">Stock Quantity</Label>
                <Input
                  id="editStock"
                  type="number"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="editThreshold">Low Stock Alert</Label>
                <Input
                  id="editThreshold"
                  type="number"
                  value={editForm.lowStockThreshold}
                  onChange={(e) => setEditForm({ ...editForm, lowStockThreshold: e.target.value })}
                  placeholder="5"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Product description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateProductMutation.isPending}>
                {updateProductMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}