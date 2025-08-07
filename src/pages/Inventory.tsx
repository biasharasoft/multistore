import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, Trash2, AlertTriangle, Package, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  countingStock?: number;
  adjustmentStock?: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  supplier: string;
  lastUpdated: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
}
interface SelectedItem extends InventoryItem {
  quantity?: number;
  costPrice?: number;
  sellingPrice?: number;
}
const mockInventoryData: InventoryItem[] = [{
  id: "1",
  name: "Premium Coffee Beans",
  sku: "PCB-001",
  category: "Beverages",
  currentStock: 150,
  minStock: 50,
  maxStock: 300,
  unitPrice: 12.99,
  supplier: "Coffee Co.",
  lastUpdated: "2024-01-15",
  status: "in-stock"
}, {
  id: "2",
  name: "Chocolate Croissant",
  sku: "CHC-002",
  category: "Pastries",
  currentStock: 25,
  minStock: 30,
  maxStock: 100,
  unitPrice: 3.50,
  supplier: "Bakery Plus",
  lastUpdated: "2024-01-14",
  status: "low-stock"
}, {
  id: "3",
  name: "Organic Tea Bags",
  sku: "OTB-003",
  category: "Beverages",
  currentStock: 0,
  minStock: 20,
  maxStock: 200,
  unitPrice: 8.99,
  supplier: "Tea Masters",
  lastUpdated: "2024-01-13",
  status: "out-of-stock"
}];
export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventoryData);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [adjustmentItems, setAdjustmentItems] = useState<SelectedItem[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [adjustmentSearchTerm, setAdjustmentSearchTerm] = useState("");
  const {
    toast
  } = useToast();
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  const categories = [...new Set(inventory.map(item => item.category))];
  const filteredProducts = inventory.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || product.sku.toLowerCase().includes(productSearchTerm.toLowerCase());
    return matchesSearch;
  });
  const filteredAdjustmentProducts = inventory.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(adjustmentSearchTerm.toLowerCase()) || product.sku.toLowerCase().includes(adjustmentSearchTerm.toLowerCase());
    return matchesSearch;
  });
  const addSelectedItem = (product: InventoryItem) => {
    if (!selectedItems.find(item => item.id === product.id)) {
      setSelectedItems(prev => [...prev, {
        ...product,
        quantity: 1,
        costPrice: product.unitPrice,
        sellingPrice: product.unitPrice
      }]);
    }
  };
  const addAdjustmentItem = (product: InventoryItem) => {
    if (!adjustmentItems.find(item => item.id === product.id)) {
      setAdjustmentItems(prev => [...prev, {
        ...product,
        quantity: 0,
        costPrice: product.unitPrice,
        sellingPrice: product.unitPrice
      }]);
    }
  };
  const removeSelectedItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  };
  const removeAdjustmentItem = (id: string) => {
    setAdjustmentItems(prev => prev.filter(item => item.id !== id));
  };
  const updateSelectedItem = (id: string, field: keyof SelectedItem, value: number) => {
    setSelectedItems(prev => prev.map(item => item.id === id ? {
      ...item,
      [field]: value
    } : item));
  };
  const updateAdjustmentItem = (id: string, field: keyof SelectedItem, value: number) => {
    setAdjustmentItems(prev => prev.map(item => item.id === id ? {
      ...item,
      [field]: value
    } : item));
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return <Badge variant="default" className="bg-green-100 text-green-800">In Stock</Badge>;
      case "low-stock":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
      case "out-of-stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  const handleAddItem = () => {
    if (selectedItems.length > 0) {
      // Update counting stock for selected items
      selectedItems.forEach(item => {
        const existingItemIndex = inventory.findIndex(inv => inv.id === item.id);
        if (existingItemIndex !== -1) {
          setInventory(prev => prev.map((inv, idx) => idx === existingItemIndex ? {
            ...inv,
            countingStock: item.quantity || 0
          } : inv));
        }
      });
      toast({
        title: "Counting Saved",
        description: `Counting for ${selectedItems.length} item(s) has been saved.`
      });
      setSelectedItems([]);
      setProductSearchTerm("");
      setIsAddDialogOpen(false);
    }
  };
  const handleAdjustment = () => {
    if (adjustmentItems.length > 0) {
      // Update adjustment stock for selected items
      adjustmentItems.forEach(item => {
        const existingItemIndex = inventory.findIndex(inv => inv.id === item.id);
        if (existingItemIndex !== -1) {
          setInventory(prev => prev.map((inv, idx) => idx === existingItemIndex ? {
            ...inv,
            adjustmentStock: item.quantity || 0
          } : inv));
        }
      });
      toast({
        title: "Adjustment Saved",
        description: `Adjustment for ${adjustmentItems.length} item(s) has been saved.`
      });
      setAdjustmentItems([]);
      setAdjustmentSearchTerm("");
      setIsAdjustmentDialogOpen(false);
    }
  };
  const handleDeleteItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Item Deleted",
      description: "Inventory item has been removed."
    });
  };
  const lowStockItems = inventory.filter(item => item.status === "low-stock").length;
  const outOfStockItems = inventory.filter(item => item.status === "out-of-stock").length;
  const totalValue = inventory.reduce((sum, item) => sum + item.currentStock * item.unitPrice, 0);
  return <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage your inventory items</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Stock Counting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Stock counting</DialogTitle>
              <DialogDescription>Select products from the list of products and specify quantities.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-6 h-full">
              {/* Left Panel - Selected Items */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-lg font-semibold mb-4">Selected Items</h3>
                <div className="flex-1 border rounded-lg p-4 bg-muted/50">
                  {selectedItems.length === 0 ? <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No items selected</p>
                        <p className="text-sm">Select products from the catalog</p>
                      </div>
                    </div> : <div className="space-y-4">
                      {selectedItems.map(item => <div key={item.id} className="bg-background border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">{item.sku}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeSelectedItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <Label htmlFor={`qty-${item.id}`} className="text-sm">Quantity</Label>
                            <Input id={`qty-${item.id}`} type="number" placeholder="0" value={item.quantity || ""} onChange={e => updateSelectedItem(item.id, 'quantity', parseInt(e.target.value) || 0)} />
                          </div>
                        </div>)}
                    </div>}
                </div>
              </div>

              {/* Right Panel - Product Catalog */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-lg font-semibold mb-4">Products</h3>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search products..." value={productSearchTerm} onChange={e => setProductSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="flex-1 border rounded-lg overflow-hidden">
                  <div className="h-full overflow-y-auto p-4 space-y-2">
                    {filteredProducts.map(product => <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => addSelectedItem(product)}>
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.sku} • {product.category}</div>
                          <div className="text-sm text-muted-foreground">Current Stock: {product.currentStock}</div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(product.status)}
                        </div>
                      </div>)}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem} disabled={selectedItems.length === 0}>
                Save Counting
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Stock Adjustment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Stock Adjustment</DialogTitle>
              <DialogDescription>Select products and specify adjustment quantities.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-6 h-full">
              {/* Left Panel - Selected Items */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-lg font-semibold mb-4">Selected Items</h3>
                <div className="flex-1 border rounded-lg p-4 bg-muted/50">
                  {adjustmentItems.length === 0 ? <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No items selected</p>
                        <p className="text-sm">Select products from the catalog</p>
                      </div>
                    </div> : <div className="space-y-4">
                      {adjustmentItems.map(item => <div key={item.id} className="bg-background border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">{item.sku}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeAdjustmentItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <Label htmlFor={`adj-${item.id}`} className="text-sm">Adjustment Quantity</Label>
                            <Input id={`adj-${item.id}`} type="number" placeholder="0" value={item.quantity || ""} onChange={e => updateAdjustmentItem(item.id, 'quantity', parseInt(e.target.value) || 0)} />
                          </div>
                        </div>)}
                    </div>}
                </div>
              </div>

              {/* Right Panel - Product Catalog */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-lg font-semibold mb-4">Products</h3>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search products..." value={adjustmentSearchTerm} onChange={e => setAdjustmentSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="flex-1 border rounded-lg overflow-hidden">
                  <div className="h-full overflow-y-auto p-4 space-y-2">
                    {filteredAdjustmentProducts.map(product => <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => addAdjustmentItem(product)}>
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.sku} • {product.category}</div>
                          <div className="text-sm text-muted-foreground">Current Stock: {product.currentStock}</div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(product.status)}
                        </div>
                      </div>)}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdjustmentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdjustment} disabled={adjustmentItems.length === 0}>
                Save Adjustment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>


    {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TSh {totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Immediate action required
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Manage your inventory with filters and search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Counting</TableHead>
                  <TableHead>Adjustment</TableHead>
                  <TableHead>Discrepancy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map(item => <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.currentStock}</TableCell>
                    <TableCell>{item.countingStock !== undefined ? item.countingStock : "-"}</TableCell>
                    <TableCell>{item.adjustmentStock !== undefined ? item.adjustmentStock : "-"}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDeleteItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>;
}