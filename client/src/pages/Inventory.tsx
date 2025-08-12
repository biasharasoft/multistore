import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Package, TrendingUp, TrendingDown, AlertTriangle, Edit, Eye, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { apiRequest } from "@/lib/queryClient";

interface InventoryItem {
  inventoryId: string;
  productId: string;
  productName: string;
  productCategory: string | null;
  productBarcode: string | null;
  productImage: string | null;
  productRetailPrice: number;
  productRetailDiscount: number | null;
  productWholesalerPrice: number;
  productWholesalerDiscount: number | null;
  productCost: number;
  productLowStockThreshold: number;
  productStatus: string;
  currentQuantity: number;
  inventoryUpdatedAt: string;
}

interface InventoryBatch {
  batchId: string;
  productId: string;
  productName: string;
  productCategory: string | null;
  batchNumber: string;
  quantity: number;
  totalCost: number;
  buyingPrice: number;
  retailPrice: number;
  retailDiscount: number | null;
  wholesalerPrice: number;
  wholesalerDiscount: number | null;
  createdAt: string;
}

export default function Inventory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("inventory");
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);

  // Fetch inventory data
  const { data: inventoryItems = [], isLoading: inventoryLoading } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
  });

  // Fetch inventory batches data
  const { data: inventoryBatches = [], isLoading: batchesLoading } = useQuery<InventoryBatch[]>({
    queryKey: ['/api/inventory/batches'],
  });

  // Fetch company data for currency
  const { data: company } = useQuery<any>({
    queryKey: ['/api/company'],
  });

  // Update inventory mutation
  const updateInventoryMutation = useMutation({
    mutationFn: async ({ inventoryId, quantity }: { inventoryId: string; quantity: number }) => {
      return apiRequest(`/api/inventory/${inventoryId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: "Inventory Updated",
        description: "Inventory quantity has been updated successfully."
      });
      setIsAdjustDialogOpen(false);
      setSelectedInventoryItem(null);
      setNewQuantity(0);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update inventory",
        variant: "destructive"
      });
    }
  });

  // Calculate inventory statistics
  const inventoryStats = useMemo(() => {
    const totalItems = inventoryItems.length;
    const totalValue = inventoryItems.reduce((sum, item) => {
      return sum + (item.currentQuantity * item.productRetailPrice);
    }, 0);
    const lowStockItems = inventoryItems.filter(item => 
      item.currentQuantity <= item.productLowStockThreshold && item.currentQuantity > 0
    ).length;
    const outOfStockItems = inventoryItems.filter(item => item.currentQuantity === 0).length;
    
    return { totalItems, totalValue, lowStockItems, outOfStockItems };
  }, [inventoryItems]);

  // Filter inventory items
  const filteredInventoryItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.productBarcode && item.productBarcode.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === "all" || 
        (item.productCategory && item.productCategory === categoryFilter);
      
      let matchesStatus = true;
      if (statusFilter === "in-stock") {
        matchesStatus = item.currentQuantity > item.productLowStockThreshold;
      } else if (statusFilter === "low-stock") {
        matchesStatus = item.currentQuantity <= item.productLowStockThreshold && item.currentQuantity > 0;
      } else if (statusFilter === "out-of-stock") {
        matchesStatus = item.currentQuantity === 0;
      }
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventoryItems, searchTerm, categoryFilter, statusFilter]);

  // Filter inventory batches
  const filteredInventoryBatches = useMemo(() => {
    return inventoryBatches.filter(batch => {
      const matchesSearch = batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || 
        (batch.productCategory && batch.productCategory === categoryFilter);
      
      return matchesSearch && matchesCategory;
    });
  }, [inventoryBatches, searchTerm, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const allCategories = inventoryItems
      .map(item => item.productCategory)
      .filter(Boolean);
    return [...new Set(allCategories)] as string[];
  }, [inventoryItems]);

  // Get status badge
  const getStatusBadge = (item: InventoryItem) => {
    if (item.currentQuantity === 0) {
      return <Badge variant="destructive" data-testid={`status-out-of-stock-${item.productId}`}>Out of Stock</Badge>;
    } else if (item.currentQuantity <= item.productLowStockThreshold) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800" data-testid={`status-low-stock-${item.productId}`}>Low Stock</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800" data-testid={`status-in-stock-${item.productId}`}>In Stock</Badge>;
    }
  };

  // Handle inventory adjustment
  const handleAdjustInventory = (item: InventoryItem) => {
    setSelectedInventoryItem(item);
    setNewQuantity(item.currentQuantity);
    setIsAdjustDialogOpen(true);
  };

  const handleSaveAdjustment = () => {
    if (!selectedInventoryItem) return;
    
    updateInventoryMutation.mutate({
      inventoryId: selectedInventoryItem.inventoryId,
      quantity: newQuantity
    });
  };

  return (
    <div className="space-y-6" data-testid="inventory-page">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Inventory Management</h1>
          <p className="text-muted-foreground">Monitor stock levels, view batches, and manage inventory</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-items-count">{inventoryStats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Tracked products
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-value-amount">
              {formatCurrency(inventoryStats.totalValue, company?.currency || 'tzs')}
            </div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="low-stock-count">{inventoryStats.lowStockItems}</div>
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
            <div className="text-2xl font-bold text-red-600" data-testid="out-of-stock-count">{inventoryStats.outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Immediate action required
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by product name or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="category-filter">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Inventory and Batches */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory" data-testid="tab-inventory">Current Inventory</TabsTrigger>
          <TabsTrigger value="batches" data-testid="tab-batches">Inventory Batches</TabsTrigger>
        </TabsList>

        {/* Current Inventory Tab */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
              <CardDescription>
                View and manage current stock levels for all products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4">
                          Loading inventory...
                        </TableCell>
                      </TableRow>
                    ) : filteredInventoryItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4">
                          No inventory items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventoryItems.map((item) => (
                        <TableRow key={item.inventoryId} data-testid={`inventory-row-${item.productId}`}>
                          <TableCell className="font-medium">
                            <div>
                              <div data-testid={`product-name-${item.productId}`}>{item.productName}</div>
                              {item.productBarcode && (
                                <div className="text-sm text-muted-foreground" data-testid={`product-barcode-${item.productId}`}>
                                  {item.productBarcode}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell data-testid={`product-category-${item.productId}`}>
                            {item.productCategory || "-"}
                          </TableCell>
                          <TableCell data-testid={`current-quantity-${item.productId}`}>
                            {item.currentQuantity}
                          </TableCell>
                          <TableCell data-testid={`threshold-${item.productId}`}>
                            {item.productLowStockThreshold}
                          </TableCell>
                          <TableCell data-testid={`unit-price-${item.productId}`}>
                            {formatCurrency(item.productRetailPrice, company?.currency || 'tzs')}
                          </TableCell>
                          <TableCell data-testid={`total-value-${item.productId}`}>
                            {formatCurrency(item.currentQuantity * item.productRetailPrice, company?.currency || 'tzs')}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item)}
                          </TableCell>
                          <TableCell data-testid={`last-updated-${item.productId}`}>
                            {new Date(item.inventoryUpdatedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAdjustInventory(item)}
                              data-testid={`button-adjust-${item.productId}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Batches Tab */}
        <TabsContent value="batches">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Batches</CardTitle>
              <CardDescription>
                View all inventory batches with purchase history and pricing details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Buying Price</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Retail Price</TableHead>
                      <TableHead>Wholesale Price</TableHead>
                      <TableHead>Created Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batchesLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          Loading batches...
                        </TableCell>
                      </TableRow>
                    ) : filteredInventoryBatches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No inventory batches found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventoryBatches.map((batch) => (
                        <TableRow key={batch.batchId} data-testid={`batch-row-${batch.batchId}`}>
                          <TableCell className="font-medium">
                            <div>
                              <div data-testid={`batch-product-name-${batch.batchId}`}>{batch.productName}</div>
                              {batch.productCategory && (
                                <div className="text-sm text-muted-foreground">
                                  {batch.productCategory}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm" data-testid={`batch-number-${batch.batchId}`}>
                            {batch.batchNumber}
                          </TableCell>
                          <TableCell data-testid={`batch-quantity-${batch.batchId}`}>
                            {batch.quantity}
                          </TableCell>
                          <TableCell data-testid={`batch-buying-price-${batch.batchId}`}>
                            {formatCurrency(batch.buyingPrice, company?.currency || 'tzs')}
                          </TableCell>
                          <TableCell data-testid={`batch-total-cost-${batch.batchId}`}>
                            {formatCurrency(batch.totalCost, company?.currency || 'tzs')}
                          </TableCell>
                          <TableCell data-testid={`batch-retail-price-${batch.batchId}`}>
                            {formatCurrency(batch.retailPrice, company?.currency || 'tzs')}
                            {batch.retailDiscount && batch.retailDiscount > 0 && (
                              <span className="text-sm text-muted-foreground ml-1">
                                (-{(batch.retailDiscount / 100).toFixed(1)}%)
                              </span>
                            )}
                          </TableCell>
                          <TableCell data-testid={`batch-wholesale-price-${batch.batchId}`}>
                            {formatCurrency(batch.wholesalerPrice, company?.currency || 'tzs')}
                            {batch.wholesalerDiscount && batch.wholesalerDiscount > 0 && (
                              <span className="text-sm text-muted-foreground ml-1">
                                (-{(batch.wholesalerDiscount / 100).toFixed(1)}%)
                              </span>
                            )}
                          </TableCell>
                          <TableCell data-testid={`batch-created-date-${batch.batchId}`}>
                            {new Date(batch.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Adjust Inventory Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Inventory Quantity</DialogTitle>
            <DialogDescription>
              Update the current stock quantity for {selectedInventoryItem?.productName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-quantity">Current Quantity</Label>
              <Input
                id="current-quantity"
                type="number"
                value={selectedInventoryItem?.currentQuantity || 0}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="new-quantity">New Quantity</Label>
              <Input
                id="new-quantity"
                type="number"
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                min="0"
                data-testid="input-new-quantity"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAdjustDialogOpen(false)}
                data-testid="button-cancel-adjust"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAdjustment}
                disabled={updateInventoryMutation.isPending}
                data-testid="button-save-adjust"
              >
                {updateInventoryMutation.isPending ? "Updating..." : "Update Quantity"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}