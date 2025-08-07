import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Edit, 
  Save, 
  Package,
  DollarSign,
  Warehouse,
  BarChart3,
  ChevronDown,
  CalendarIcon,
  Box,
  AlertTriangle
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  Area, 
  AreaChart,
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { format } from "date-fns";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  description: string;
  barcode: string;
  status: "active" | "inactive" | "discontinued";
  featuredImage?: string;
  images?: string[];
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newFeaturedImage, setNewFeaturedImage] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("Last 6 months");
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Mock sales data for the chart
  const salesData = [
    { month: 'Feb', actual: 3000, target: 3200 },
    { month: 'Mar', actual: 5000, target: 4500 },
    { month: 'Apr', actual: 4500, target: 5000 },
    { month: 'May', actual: 6000, target: 5500 },
    { month: 'Jun', actual: 5500, target: 5800 },
    { month: 'Jul', actual: 7000, target: 6500 },
  ];

  // Mock product data - in a real app, this would come from an API
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Wireless Headphones",
      sku: "WH-001",
      category: "Electronics",
      price: 99.99,
      cost: 45.00,
      stock: 150,
      lowStockThreshold: 20,
      description: "High-quality wireless headphones with noise cancellation and 20-hour battery life.",
      barcode: "123456789012",
      status: "active",
      images: []
    },
    {
      id: "2",
      name: "Coffee Mug",
      sku: "CM-002",
      category: "Kitchen",
      price: 12.99,
      cost: 5.50,
      stock: 75,
      lowStockThreshold: 10,
      description: "Ceramic coffee mug with ergonomic handle.",
      barcode: "123456789013",
      status: "active",
      images: []
    }
  ];

  useEffect(() => {
    // Find product by ID
    const foundProduct = mockProducts.find(p => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      setEditForm(foundProduct);
    }
  }, [id]);

  const handleSave = () => {
    if (product && editForm) {
      const updatedProduct = { 
        ...product, 
        ...editForm, 
        images: [...(product.images || []), ...newImages],
        featuredImage: newFeaturedImage || product.featuredImage
      };
      setProduct(updatedProduct);
      setIsEditing(false);
      setNewImages([]);
      setNewFeaturedImage(null);
      
      toast({
        title: "Success",
        description: "Product updated successfully.",
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you would upload these files to a server
      // For now, we'll just create mock URLs
      const newImageUrls = Array.from(files).map((file, index) => 
        `https://via.placeholder.com/400x300?text=Product+Image+${(product?.images?.length || 0) + newImages.length + index + 1}`
      );
      setNewImages([...newImages, ...newImageUrls]);
    }
  };

  const handleFeaturedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this file to a server
      // For now, we'll just create a mock URL
      const featuredImageUrl = `https://via.placeholder.com/600x400?text=Featured+Image`;
      setNewFeaturedImage(featuredImageUrl);
    }
  };

  const removeImage = (index: number, isNew: boolean = false) => {
    if (isNew) {
      setNewImages(newImages.filter((_, i) => i !== index));
    } else if (product?.images) {
      const updatedImages = product.images.filter((_, i) => i !== index);
      setProduct({ ...product, images: updatedImages });
    }
  };

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Product not found</h2>
          <Button onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "discontinued":
        return <Badge variant="destructive">Discontinued</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const allImages = [...(product.images || []), ...newImages];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button variant="ghost" onClick={() => navigate("/products")} className="hover-scale">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    {product.name}
                  </h1>
                  {getStatusBadge(product.status)}
                </div>
                <p className="text-muted-foreground font-medium">SKU: {product.sku}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="hover-scale shadow-lg">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="hover-scale">
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="hover-scale shadow-lg">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Product Images Section */}
          <div className="xl:col-span-2 space-y-6">
            {/* Featured Image */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      Featured Image
                    </CardTitle>
                    {isEditing && (
                      <>
                        <Label 
                          htmlFor="featured-upload" 
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer hover-scale"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {newFeaturedImage || product?.featuredImage ? "Change" : "Add"}
                        </Label>
                        <Input
                          id="featured-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFeaturedImageUpload}
                        />
                      </>
                    )}
                  </div>
                </CardHeader>
              </div>
              <CardContent>
                {(newFeaturedImage || product?.featuredImage) ? (
                  <div className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                      <img
                        src={newFeaturedImage || product?.featuredImage}
                        alt="Featured product image"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    {isEditing && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                        onClick={() => setNewFeaturedImage(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                    <div className="text-center space-y-3">
                      <div className="relative">
                        <Package className="h-16 w-16 mx-auto text-muted-foreground/60" />
                        <div className="absolute -top-1 -right-1 h-6 w-6 bg-muted rounded-full animate-pulse" />
                      </div>
                      <p className="text-muted-foreground font-medium">No featured image</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Images */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent" />
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                      Product Gallery
                    </CardTitle>
                    {isEditing && (
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild className="hover-scale">
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Add Images
                          </span>
                        </Button>
                        <Input
                          id="image-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </Label>
                    )}
                  </div>
                </CardHeader>
              </div>
              <CardContent>
                {allImages.length === 0 ? (
                  <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                    <div className="text-center space-y-3">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground/60" />
                      <p className="text-muted-foreground">No additional images</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {allImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        {isEditing && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                            onClick={() => removeImage(index, index >= (product.images?.length || 0))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Details Section */}
          <div className="xl:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Price</p>
                      <p className="text-2xl font-bold text-green-800 dark:text-green-200">${product.price}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Warehouse className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Stock</p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{product.stock}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Margin</p>
                      <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                        {((product.price - product.cost) / product.price * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Overview */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                <CardHeader className="relative">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Product Overview
                  </CardTitle>
                </CardHeader>
              </div>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold">Product Name</Label>
                      <Input
                        id="name"
                        value={editForm.name || ""}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
                      <Input
                        id="category"
                        value={editForm.category || ""}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm font-semibold">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={editForm.price || ""}
                        onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                        className="focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost" className="text-sm font-semibold">Cost ($)</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={editForm.cost || ""}
                        onChange={(e) => setEditForm({ ...editForm, cost: parseFloat(e.target.value) })}
                        className="focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock" className="text-sm font-semibold">Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={editForm.stock || ""}
                        onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) })}
                        className="focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="threshold" className="text-sm font-semibold">Low Stock Threshold</Label>
                      <Input
                        id="threshold"
                        type="number"
                        value={editForm.lowStockThreshold || ""}
                        onChange={(e) => setEditForm({ ...editForm, lowStockThreshold: parseInt(e.target.value) })}
                        className="focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                      <Textarea
                        id="description"
                        value={editForm.description || ""}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={4}
                        className="focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Sales Performance Chart */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-chart-1" />
                          Sales Performance
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm" className="text-xs">
                              {selectedPeriod}
                              <ChevronDown className="ml-2 h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => setSelectedPeriod("Today")}>
                              Today
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedPeriod("Week")}>
                              Week
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedPeriod("Month")}>
                              Month
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedPeriod("Year")}>
                              Year
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsCustomDateOpen(true)}>
                              Custom
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Dialog open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen}>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Select Date Range</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>From Date</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !dateRange.from && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange.from ? format(dateRange.from, "PPP") : "Pick a date"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={dateRange.from}
                                        onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                                        className="pointer-events-auto"
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <div className="space-y-2">
                                  <Label>To Date</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !dateRange.to && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange.to ? format(dateRange.to, "PPP") : "Pick a date"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={dateRange.to}
                                        onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                                        className="pointer-events-auto"
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsCustomDateOpen(false)}>
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={() => {
                                    if (dateRange.from && dateRange.to) {
                                      setSelectedPeriod(`${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`);
                                    }
                                    setIsCustomDateOpen(false);
                                  }}
                                  disabled={!dateRange.from || !dateRange.to}
                                >
                                  Apply
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="h-[280px] w-full p-4 bg-gradient-to-br from-muted/30 to-transparent rounded-xl border border-muted/50">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={salesData}>
                            <defs>
                              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                              </linearGradient>
                              <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <XAxis 
                              dataKey="month" 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <YAxis 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                              tickFormatter={(value) => `$${value/1000}k`}
                            />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-background/95 backdrop-blur-sm border border-muted/50 rounded-lg p-3 shadow-lg">
                                      <p className="font-medium text-sm mb-2">{label}</p>
                                      {payload.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2 text-xs">
                                          <div 
                                            className="h-3 w-3 rounded-full" 
                                            style={{ backgroundColor: entry.color }}
                                          />
                                          <span className="text-muted-foreground">{entry.name}:</span>
                                          <span className="font-semibold">${entry.value?.toLocaleString()}</span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="actual"
                              stroke="hsl(var(--chart-1))"
                              strokeWidth={3}
                              fill="url(#actualGradient)"
                              name="Actual Sales"
                              dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6, fill: 'hsl(var(--chart-1))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                            />
                            <Area
                              type="monotone"
                              dataKey="target"
                              stroke="hsl(var(--chart-2))"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              fill="url(#targetGradient)"
                              name="Target"
                              dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 3 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="text-center p-4 bg-gradient-to-br from-chart-1/5 to-transparent rounded-lg border border-chart-1/20">
                          <div className="text-2xl font-bold text-chart-1 mb-1">$42K</div>
                          <div className="text-xs text-muted-foreground">Total Sales</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-chart-2/5 to-transparent rounded-lg border border-chart-2/20">
                          <div className="text-2xl font-bold text-chart-2 mb-1">$39K</div>
                          <div className="text-xs text-muted-foreground">Target</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-500/5 to-transparent rounded-lg border border-green-500/20">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">+7.7%</div>
                          <div className="text-xs text-muted-foreground">vs Target</div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Description
                      </h3>
                      <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg border-l-4 border-primary/30">
                        {product.description}
                      </p>
                    </div>

                    {/* Product Information Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                      {/* Product Information Card */}
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                          {/* Header with icon */}
                          <div className="flex items-center gap-3 mb-8">
                            <div className="relative">
                              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-sm"></div>
                              <div className="relative bg-gradient-to-br from-primary to-primary/80 p-3 rounded-xl">
                                <Package className="h-6 w-6 text-primary-foreground" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                                Product Information
                              </h3>
                              <p className="text-muted-foreground text-sm">Core product details</p>
                            </div>
                          </div>

                          {/* Information Grid */}
                          <div className="space-y-6">
                            <div className="group/item flex justify-between items-center p-4 rounded-xl hover:bg-muted/30 transition-all duration-300">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                                <span className="font-medium text-foreground/80">Category</span>
                              </div>
                              <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 hover:border-primary/40 transition-colors font-semibold">
                                {product.category}
                              </Badge>
                            </div>

                            <div className="group/item flex justify-between items-center p-4 rounded-xl hover:bg-muted/30 transition-all duration-300">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                                <span className="font-medium text-foreground/80">SKU</span>
                              </div>
                              <code className="bg-gradient-to-r from-muted to-muted/70 px-4 py-2 rounded-lg text-sm font-mono border border-border/50 hover:border-primary/30 transition-colors">
                                {product.sku}
                              </code>
                            </div>

                            <div className="group/item flex justify-between items-center p-4 rounded-xl hover:bg-muted/30 transition-all duration-300">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                                <span className="font-medium text-foreground/80">Barcode</span>
                              </div>
                              <code className="bg-gradient-to-r from-muted to-muted/70 px-4 py-2 rounded-lg text-sm font-mono border border-border/50 hover:border-primary/30 transition-colors">
                                {product.barcode}
                              </code>
                            </div>

                            <div className="group/item flex justify-between items-center p-4 rounded-xl hover:bg-muted/30 transition-all duration-300">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
                                <span className="font-medium text-foreground/80">Status</span>
                              </div>
                              {getStatusBadge(product.status)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Inventory Details Card */}
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                          {/* Header with icon */}
                          <div className="flex items-center gap-3 mb-8">
                            <div className="relative">
                              <div className="absolute inset-0 bg-secondary/20 rounded-xl blur-sm"></div>
                              <div className="relative bg-gradient-to-br from-secondary to-secondary/80 p-3 rounded-xl">
                                <Warehouse className="h-6 w-6 text-secondary-foreground" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                                Inventory Details
                              </h3>
                              <p className="text-muted-foreground text-sm">Stock & pricing information</p>
                            </div>
                          </div>

                          {/* Inventory Grid */}
                          <div className="space-y-6">
                            <div className="group/item flex justify-between items-center p-4 rounded-xl hover:bg-muted/30 transition-all duration-300">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                                <span className="font-medium text-foreground/80">Cost Price</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                  {product.cost}
                                </span>
                              </div>
                            </div>

                            <div className="group/item flex justify-between items-center p-4 rounded-xl hover:bg-muted/30 transition-all duration-300">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                                <span className="font-medium text-foreground/80">Current Stock</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Box className="h-4 w-4 text-blue-500" />
                                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                  {product.stock}
                                </span>
                                <span className="text-muted-foreground text-sm">units</span>
                              </div>
                            </div>

                            <div className="group/item flex justify-between items-center p-4 rounded-xl hover:bg-muted/30 transition-all duration-300">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                                <span className="font-medium text-foreground/80">Low Stock Alert</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                <span className="font-semibold text-lg">{product.lowStockThreshold}</span>
                                <span className="text-muted-foreground text-sm">units</span>
                              </div>
                            </div>

                            <div className="group/item flex justify-between items-center p-4 rounded-xl hover:bg-muted/30 transition-all duration-300">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500"></div>
                                <span className="font-medium text-foreground/80">Stock Status</span>
                              </div>
                              <Badge 
                                variant={product.stock <= product.lowStockThreshold ? "destructive" : "default"}
                                className="bg-gradient-to-r font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                {product.stock <= product.lowStockThreshold ? "Low Stock" : "In Stock"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}