import { useState } from "react";
import { Plus, Search, Filter, Download, Eye, Edit, Power, Package, X, ShoppingCart, Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Purchase = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [notes, setNotes] = useState("");
  const [dateFilter, setDateFilter] = useState("Today");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Mock data for purchases
  const purchases = [
    {
      id: "PO-001",
      supplier: "ABC Electronics",
      date: "2024-01-15",
      status: "received",
      total: 15000,
      items: 12,
      notes: "Monthly inventory restock",
      isActive: true
    },
    {
      id: "PO-002",
      supplier: "XYZ Components",
      date: "2024-01-14",
      status: "pending",
      total: 8500,
      items: 8,
      notes: "New product line items",
      isActive: true
    },
    {
      id: "PO-003",
      supplier: "Tech Supplies Co",
      date: "2024-01-12",
      status: "partial",
      total: 12300,
      items: 15,
      notes: "Partial delivery expected",
      isActive: false
    },
    {
      id: "PO-004",
      supplier: "Global Parts Ltd",
      date: "2024-01-10",
      status: "cancelled",
      total: 5600,
      items: 6,
      notes: "Supplier out of stock",
      isActive: false
    }
  ];

  // Mock data for available products
  const availableProducts = [
    { id: "P001", name: "Smartphone", category: "Electronics", price: 15000, stock: 50 },
    { id: "P002", name: "Laptop", category: "Electronics", price: 45000, stock: 25 },
    { id: "P003", name: "Headphones", category: "Electronics", price: 3000, stock: 100 },
    { id: "P004", name: "Tablet", category: "Electronics", price: 25000, stock: 30 },
    { id: "P005", name: "Smart Watch", category: "Electronics", price: 8000, stock: 75 },
    { id: "P006", name: "Camera", category: "Electronics", price: 35000, stock: 15 },
    { id: "P007", name: "Bluetooth Speaker", category: "Electronics", price: 5000, stock: 60 },
    { id: "P008", name: "Gaming Console", category: "Electronics", price: 55000, stock: 20 }
  ];

  const suppliers = [
    { id: "sup1", name: "ABC Electronics" },
    { id: "sup2", name: "XYZ Components" },
    { id: "sup3", name: "Tech Supplies Co" },
    { id: "sup4", name: "Global Parts Ltd" }
  ];

  const stores = [
    { id: "store1", name: "Main Store" },
    { id: "store2", name: "Branch 1" },
    { id: "store3", name: "Branch 2" },
    { id: "store4", name: "Warehouse" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "partial":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredAvailableProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const handleSelectProduct = (product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p
    ));
  };

  const handleAddPurchase = () => {
    if (!selectedSupplier || !selectedStore || selectedProducts.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select supplier, store, and at least one product."
      });
      return;
    }
    
    toast({
      title: "Purchase Order Created",
      description: "New purchase order has been created successfully."
    });
    setIsAddDialogOpen(false);
    // Reset form
    setSelectedProducts([]);
    setSelectedSupplier("");
    setSelectedStore("");
    setNotes("");
    setProductSearchTerm("");
  };

  const handleEditPurchase = (purchase) => {
    setEditingPurchase(purchase);
    setIsEditDialogOpen(true);
  };

  const handleToggleActive = (purchase) => {
    const action = purchase.isActive ? "deactivated" : "activated";
    toast({
      title: `Purchase Order ${action}`,
      description: `Purchase order ${purchase.id} has been ${action}.`
    });
  };

  const handleUpdatePurchase = () => {
    toast({
      title: "Purchase Order Updated",
      description: "Purchase order has been updated successfully."
    });
    setIsEditDialogOpen(false);
    setEditingPurchase(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Purchase Management</h1>
          <p className="text-muted-foreground">
            Manage all product purchases and orders for your store
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Create New Purchase Order</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6 h-[80vh]">
              {/* Left Column - Form */}
              <div className="space-y-6 overflow-y-auto pr-4">
                {/* Supplier and Store */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store">Store</Label>
                    <Select value={selectedStore} onValueChange={setSelectedStore}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select store" />
                      </SelectTrigger>
                      <SelectContent>
                        {stores.map(store => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Selected Products List */}
                <div className="space-y-2">
                  <Label>Selected Products ({selectedProducts.length})</Label>
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    {selectedProducts.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No products selected
                      </div>
                    ) : (
                      <div className="divide-y">
                        {selectedProducts.map((product) => (
                          <div key={product.id} className="p-3 flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                ₱{product.price.toLocaleString()} × {product.quantity} = ₱{(product.price * product.quantity).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                value={product.quantity}
                                onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                                className="w-16 h-8"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveProduct(product.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedProducts.length > 0 && (
                    <div className="text-right font-medium">
                      Total: ₱{selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for this purchase order"
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPurchase}>
                    Create Order
                  </Button>
                </div>
              </div>

              {/* Right Column - Available Products */}
              <div className="space-y-4 overflow-y-auto pl-4 border-l">
                <div className="space-y-2">
                  <Label>Available Products</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 h-full overflow-y-auto">
                  {filteredAvailableProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.category} • Stock: {product.stock}
                          </div>
                          <div className="text-sm font-medium">₱{product.price.toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedProducts.find(p => p.id === product.id) ? (
                            <Badge variant="secondary">Added</Badge>
                          ) : (
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Purchase Order Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Purchase Order</DialogTitle>
            </DialogHeader>
            {editingPurchase && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-supplier">Supplier</Label>
                    <Select defaultValue={editingPurchase.supplier}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ABC Electronics">ABC Electronics</SelectItem>
                        <SelectItem value="XYZ Components">XYZ Components</SelectItem>
                        <SelectItem value="Tech Supplies Co">Tech Supplies Co</SelectItem>
                        <SelectItem value="Global Parts Ltd">Global Parts Ltd</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select defaultValue={editingPurchase.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea 
                    id="edit-notes"
                    defaultValue={editingPurchase.notes}
                    placeholder="Add notes for this purchase order"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdatePurchase}>
                    Update Order
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              2 urgent orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱145,000</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              Active suppliers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-48">
            <CalendarIcon className="h-4 w-4" />
            <SelectValue />
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

        {dateFilter === "Date Range" && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM dd") : "Start Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            <span className="text-muted-foreground">to</span>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "MMM dd") : "End Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>
            View and manage all purchase orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by order ID or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Purchase Orders Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.id}</TableCell>
                    <TableCell>{purchase.supplier}</TableCell>
                    <TableCell>{purchase.date}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(purchase.status)}>
                        {purchase.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{purchase.items} items</TableCell>
                    <TableCell>₱{purchase.total.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditPurchase(purchase)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleActive(purchase)}
                          className={purchase.isActive ? "text-destructive hover:text-destructive" : "text-green-600 hover:text-green-700"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Purchase;