import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Product as DbProduct, type InsertProduct, type ProductsCategory } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Edit,
  Power,
  Filter,
  Grid3x3,
  List,
  Barcode,
  DollarSign,
  Package2
} from "lucide-react";

// Extended Product type for frontend with converted prices
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
}

// Helper function to convert database product to frontend product
const convertDbProductToFrontend = (dbProduct: DbProduct, categories: ProductsCategory[], inventoryData: any[]): Product => {
  const category = categories.find(c => c.id === dbProduct.categoryId);
  const inventoryItem = inventoryData.find(inv => inv.productId === dbProduct.id);
  const actualStock = inventoryItem ? inventoryItem.currentQuantity : 0;
  
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    categoryId: dbProduct.categoryId || undefined,
    category: category?.name || "Uncategorized",
    price: (dbProduct.price || 0) / 100, // Convert cents to dollars
    cost: (dbProduct.cost || 0) / 100,
    wholesalerPrice: (dbProduct.wholesalerPrice || 0) / 100,
    wholesalerDiscount: (dbProduct.wholesalerDiscount || 0) / 100, // Convert to percentage
    retailPrice: (dbProduct.retailPrice || 0) / 100,
    retailDiscount: (dbProduct.retailDiscount || 0) / 100,
    stock: actualStock, // Use inventory stock instead of product stock
    lowStockThreshold: dbProduct.lowStockThreshold,
    description: dbProduct.description || "",
    barcode: dbProduct.barcode || "",
    image: dbProduct.image || undefined,
    status: dbProduct.status as "active" | "inactive" | "discontinued",
  };
};



export default function Products() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get selected store for inventory data
  const { data: stores = [] } = useQuery<any[]>({
    queryKey: ['/api/stores'],
  });
  
  // Use first store as default for inventory lookup
  const selectedStoreId = stores.length > 0 ? stores[0].id : null;

  // API Queries
  const { data: dbProducts = [], isLoading: isLoadingProducts } = useQuery<DbProduct[]>({
    queryKey: ['/api/products'],
  });
  
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<ProductsCategory[]>({
    queryKey: ['/api/products-categories'],
  });

  // Fetch inventory data for the selected store
  const { data: inventoryData = [] } = useQuery<any[]>({
    queryKey: ['/api/inventory', selectedStoreId],
    queryFn: () => selectedStoreId ? fetch(`/api/inventory?storeId=${selectedStoreId}`).then(res => res.json()) : [],
    enabled: !!selectedStoreId,
  });

  // Fetch company information to get currency setting
  const { data: company } = useQuery<any>({
    queryKey: ['/api/company'],
  });
  
  // Convert database products to frontend format
  const products = dbProducts.map(dbProduct => convertDbProductToFrontend(dbProduct, categories, inventoryData));
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  // Available categories for dropdowns
  const availableCategories = categories.filter(cat => cat.isActive).map(cat => cat.name);
  const filterCategories = ["All", ...availableCategories];
  
  // Add form state
  const [addForm, setAddForm] = useState({
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
  
  // Edit form state
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });


  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === "active").length;
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.cost), 0);

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (product.stock <= product.lowStockThreshold) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsAddProductOpen(false);
      setAddForm({
        name: "", category: "", price: "", cost: "", wholesalerPrice: "",
        wholesalerDiscount: "", retailPrice: "", retailDiscount: "", stock: "",
        lowStockThreshold: "", description: "", barcode: "", status: "active"
      });
      toast({ title: "Success", description: "Product has been added successfully." });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast({ title: "Error", description: "Failed to create product. Please try again.", variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsEditProductOpen(false);
      setEditingProduct(null);
      toast({ title: "Success", description: "Product has been updated successfully." });
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast({ title: "Error", description: "Failed to update product. Please try again.", variant: "destructive" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; isActive: boolean }) => {
      return await apiRequest('/api/products-categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products-categories'] });
      setNewCategoryName("");
      setIsAddCategoryOpen(false);
      toast({ title: "Success", description: "Category has been added successfully." });
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast({ title: "Error", description: "Failed to create category. Please try again.", variant: "destructive" });
    },
  });

  const handleToggleProductStatus = (product: Product) => {
    const newStatus: "active" | "inactive" = product.status === "active" ? "inactive" : "active";
    
    updateProductMutation.mutate({
      id: product.id,
      data: { status: newStatus }
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(), // Already converted to dollars
      cost: product.cost.toString(), // Already converted to dollars
      wholesalerPrice: product.wholesalerPrice.toString(), // Already converted to dollars
      wholesalerDiscount: product.wholesalerDiscount.toString(), // Already converted to percentage
      retailPrice: product.retailPrice.toString(), // Already converted to dollars
      retailDiscount: product.retailDiscount.toString(), // Already converted to percentage
      stock: product.stock.toString(),
      lowStockThreshold: product.lowStockThreshold.toString(),
      description: product.description,
      barcode: product.barcode,
      status: product.status
    });
    setIsEditProductOpen(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    if (!editForm.name.trim()) {
      toast({
        title: "Error",
        description: "Product name is required.",
        variant: "destructive",
      });
      return;
    }

    updateProductMutation.mutate({
      id: editingProduct.id,
      data: {
        name: editForm.name,
        categoryId: categories.find(c => c.name === editForm.category)?.id,
        price: Math.round((parseFloat(editForm.price) || 0) * 100), // Convert dollars to cents
        cost: Math.round((parseFloat(editForm.cost) || 0) * 100),
        wholesalerPrice: Math.round((parseFloat(editForm.wholesalerPrice) || 0) * 100),
        wholesalerDiscount: Math.round((parseFloat(editForm.wholesalerDiscount) || 0) * 100), // Convert percentage to storage format
        retailPrice: Math.round((parseFloat(editForm.retailPrice) || 0) * 100),
        retailDiscount: Math.round((parseFloat(editForm.retailDiscount) || 0) * 100),
        stock: parseInt(editForm.stock) || 0,
        lowStockThreshold: parseInt(editForm.lowStockThreshold) || 5,
        description: editForm.description,
        barcode: editForm.barcode,
        status: editForm.status
      }
    });
  };

  const handleAddProduct = () => {
    if (!addForm.name.trim()) {
      toast({
        title: "Error",
        description: "Product name is required.",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate({
      name: addForm.name,
      categoryId: categories.find(c => c.name === addForm.category)?.id,
      price: Math.round((parseFloat(addForm.price) || 0) * 100), // Convert dollars to cents
      cost: Math.round((parseFloat(addForm.cost) || 0) * 100),
      wholesalerPrice: Math.round((parseFloat(addForm.wholesalerPrice) || 0) * 100),
      wholesalerDiscount: Math.round((parseFloat(addForm.wholesalerDiscount) || 0) * 100), // Convert percentage to storage format
      retailPrice: Math.round((parseFloat(addForm.retailPrice) || 0) * 100),
      retailDiscount: Math.round((parseFloat(addForm.retailDiscount) || 0) * 100),
      stock: parseInt(addForm.stock) || 0,
      lowStockThreshold: parseInt(addForm.lowStockThreshold) || 5,
      description: addForm.description,
      barcode: addForm.barcode,
      status: addForm.status
    });
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    if (availableCategories.includes(newCategoryName.trim())) {
      toast({
        title: "Error",
        description: "Category already exists.",
        variant: "destructive",
      });
      return;
    }

    createCategoryMutation.mutate({
      name: newCategoryName.trim(),
      isActive: true
    });
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const stockStatus = getStockStatus(product);
    const margin = ((product.retailPrice - product.cost) / product.retailPrice * 100).toFixed(1);

    return (
      <Card className="group hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">
                {product.name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {product.category} {product.barcode && `• Barcode: ${product.barcode}`}
              </CardDescription>
            </div>
            <Badge variant={stockStatus.variant} className="text-xs">
              {stockStatus.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Retail Price</p>
              <p className="font-semibold text-primary">
                {formatCurrency(Math.round(product.retailPrice * 100), company?.currency || 'tzs')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Stock</p>
              <p className="font-semibold">{product.stock} units</p>
            </div>
            <div>
              <p className="text-muted-foreground">Cost</p>
              <p className="font-semibold">
                {formatCurrency(Math.round(product.cost * 100), company?.currency || 'tzs')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Margin</p>
              <p className="font-semibold text-green-600">{margin}%</p>
            </div>
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditProduct(product)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              variant={product.status === "active" ? "outline" : "default"} 
              size="sm"
              onClick={() => handleToggleProductStatus(product)}
              className={product.status === "active" ? "" : "bg-green-600 hover:bg-green-700"}
            >
              <Power className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProductListRow = ({ product }: { product: Product }) => {
    const stockStatus = getStockStatus(product);
    const margin = ((product.retailPrice - product.cost) / product.retailPrice * 100).toFixed(1);

    return (
      <div className="grid grid-cols-8 gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors items-center">
        <div className="col-span-2">
          <p className="font-medium">
            {product.name}
          </p>
          <p className="text-sm text-muted-foreground">{product.barcode || "No barcode"}</p>
        </div>
        <div className="text-center">
          <Badge variant="outline">{product.category}</Badge>
        </div>
        <div className="text-center font-semibold text-primary">
          {formatCurrency(Math.round(product.retailPrice * 100), company?.currency || 'tzs')}
        </div>
        <div className="text-center">
          {formatCurrency(Math.round(product.cost * 100), company?.currency || 'tzs')}
        </div>
        <div className="text-center">
          <Badge variant={stockStatus.variant}>
            {product.stock} units
          </Badge>
        </div>
        <div className="text-center text-green-600 font-medium">
          {margin}%
        </div>
        <div className="flex gap-1 justify-center">
          <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleToggleProductStatus(product)}
            className={product.status === "active" ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
          >
            <Power className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory and catalog</p>
        </div>
        
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product in your inventory
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input 
                  id="name" 
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Enter product name" 
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <div className="flex gap-2">
                  <Select value={addForm.category} onValueChange={(value) => setAddForm({ ...addForm, category: value })}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" type="button">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                          Create a new product category for your inventory.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="newCategoryName">Category Name</Label>
                          <Input
                            id="newCategoryName"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Enter category name"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddCategory}>
                          Add Category
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input 
                  id="barcode" 
                  value={addForm.barcode}
                  onChange={(e) => setAddForm({ ...addForm, barcode: e.target.value })}
                  placeholder="Product barcode" 
                />
              </div>
              <div className="col-span-2 mb-4">
                <Label htmlFor="cost">Cost Price ($)</Label>
                <Input 
                  id="cost" 
                  type="number" 
                  step="0.01" 
                  value={addForm.cost}
                  onChange={(e) => setAddForm({ ...addForm, cost: e.target.value })}
                  placeholder="0.00"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="wholesalerPrice">Wholesaler Price ($)</Label>
                <Input 
                  id="wholesalerPrice" 
                  type="number" 
                  step="0.01" 
                  value={addForm.wholesalerPrice}
                  onChange={(e) => setAddForm({ ...addForm, wholesalerPrice: e.target.value })}
                  placeholder="0.00" 
                />
              </div>
              <div>
                <Label htmlFor="wholesalerDiscount">Wholesaler Discount (%)</Label>
                <Input 
                  id="wholesalerDiscount" 
                  type="number" 
                  step="0.01" 
                  value={addForm.wholesalerDiscount}
                  onChange={(e) => setAddForm({ ...addForm, wholesalerDiscount: e.target.value })}
                  placeholder="0.00" 
                />
              </div>
              <div>
                <Label htmlFor="retailPrice">Retail Price ($)</Label>
                <Input 
                  id="retailPrice" 
                  type="number" 
                  step="0.01" 
                  value={addForm.retailPrice}
                  onChange={(e) => setAddForm({ ...addForm, retailPrice: e.target.value })}
                  placeholder="0.00" 
                />
              </div>
              <div>
                <Label htmlFor="retailDiscount">Retail Discount (%)</Label>
                <Input 
                  id="retailDiscount" 
                  type="number" 
                  step="0.01" 
                  value={addForm.retailDiscount}
                  onChange={(e) => setAddForm({ ...addForm, retailDiscount: e.target.value })}
                  placeholder="0.00" 
                />
              </div>
              <div>
                <Label htmlFor="stock">Initial Stock</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  value={addForm.stock}
                  onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })}
                  placeholder="0" 
                />
              </div>
              <div>
                <Label htmlFor="threshold">Low Stock Alert</Label>
                <Input 
                  id="threshold" 
                  type="number" 
                  value={addForm.lowStockThreshold}
                  onChange={(e) => setAddForm({ ...addForm, lowStockThreshold: e.target.value })}
                  placeholder="5" 
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder="Product description" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct}>
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                <p className="text-2xl font-bold">{activeProducts}</p>
              </div>
              <Package2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(Math.round(totalValue * 100), company?.currency || 'tzs')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filterCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {lowStockProducts.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-orange-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Low Stock Alerts ({lowStockProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 3).map(product => (
                    <div key={product.id} className="flex justify-between items-center text-sm">
                      <span>{product.name}</span>
                      <Badge variant="secondary">{product.stock} left</Badge>
                    </div>
                  ))}
                  {lowStockProducts.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{lowStockProducts.length - 3} more items
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {outOfStockProducts.length > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Out of Stock ({outOfStockProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {outOfStockProducts.slice(0, 3).map(product => (
                    <div key={product.id} className="flex justify-between items-center text-sm">
                      <span>{product.name}</span>
                      <Badge variant="destructive">0 stock</Badge>
                    </div>
                  ))}
                  {outOfStockProducts.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{outOfStockProducts.length - 3} more items
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Products Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="grid grid-cols-8 gap-4 text-sm font-medium text-muted-foreground">
              <div className="col-span-2">Product</div>
              <div className="text-center">Category</div>
              <div className="text-center">Retail Price</div>
              <div className="text-center">Cost</div>
              <div className="text-center">Stock</div>
              <div className="text-center">Margin</div>
              <div className="text-center">Actions</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredProducts.map(product => (
              <ProductListRow key={product.id} product={product} />
            ))}
          </CardContent>
        </Card>
      )}

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== "All" 
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first product"
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information and settings
            </DialogDescription>
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
              <div className="flex gap-2">
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
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => setIsAddCategoryOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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
              <Label htmlFor="editStock">Initial Stock</Label>
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
            <Button variant="outline" onClick={() => setIsEditProductOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct}>
              Update Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
