import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type Product = {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  cost: number;
  stock: number;
  description?: string;
  barcode?: string;
  status: string;
};
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
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
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

  // Fetch user's products from database
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Create purchase mutation
  const createPurchaseMutation = useMutation({
    mutationFn: async (purchaseData: {
      productId: string;
      quantity: number;
      totalCost: number;
      sellingPrice: number;
      purchaseDate: string;
      notes?: string;
    }) => {
      return apiRequest('/api/purchases', {
        method: 'POST',
        body: purchaseData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
      toast({
        title: "Purchase Recorded",
        description: "New purchase has been recorded successfully."
      });
      setIsAddDialogOpen(false);
      // Reset form
      setSelectedProduct("");
      setQuantity(1);
      setTotalCost(0);
      setSellingPrice(0);
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record purchase",
        variant: "destructive"
      });
    }
  });

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

  const handleAddPurchase = () => {
    if (!selectedProduct || quantity <= 0 || totalCost <= 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields with valid values."
      });
      return;
    }
    
    // Convert prices to cents for storage
    const purchaseData = {
      productId: selectedProduct,
      quantity,
      totalCost: Math.round(totalCost * 100), // Convert to cents
      sellingPrice: Math.round(sellingPrice * 100), // Convert to cents
      purchaseDate,
      notes: notes || undefined
    };
    
    createPurchaseMutation.mutate(purchaseData);
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record New Purchase</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Product Selection */}
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger data-testid="select-product">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {productsLoading ? (
                      <SelectItem value="" disabled>Loading products...</SelectItem>
                    ) : products.length === 0 ? (
                      <SelectItem value="" disabled>No products available</SelectItem>
                    ) : (
                      products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  data-testid="input-quantity"
                />
              </div>

              {/* Total Cost */}
              <div className="space-y-2">
                <Label htmlFor="totalCost">Total Cost</Label>
                <Input
                  id="totalCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalCost}
                  onChange={(e) => setTotalCost(parseFloat(e.target.value) || 0)}
                  data-testid="input-total-cost"
                />
              </div>

              {/* Selling Price */}
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  data-testid="input-selling-price"
                />
              </div>

              {/* Purchase Date */}
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  data-testid="input-purchase-date"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes about this purchase..."
                  rows={3}
                  data-testid="textarea-notes"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddPurchase} 
                  disabled={createPurchaseMutation.isPending}
                  data-testid="button-record-purchase"
                >
                  {createPurchaseMutation.isPending ? "Recording..." : "Record Purchase"}
                </Button>
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