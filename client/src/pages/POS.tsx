import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Minus, Trash2, CreditCard, DollarSign, Receipt, User, UserPlus, CheckCircle, Clock, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/hooks/useStore";
import { formatCurrency, formatDecimalCurrency } from "@/lib/currency";

interface Product {
  id: string;
  name: string;
  price: number; // This will be retail price in cents from DB
  category: string;
  stock: number;
  image?: string;
  retailPrice: number;
  retailDiscount: number;
}

interface InventoryItem {
  inventoryId: string;
  productId: string;
  productName: string;
  productCategory: string;
  productBarcode: string | null;
  productImage: string | null;
  productRetailPrice: number;
  productRetailDiscount: number;
  productWholesalerPrice: number;
  productWholesalerDiscount: number;
  productCost: number;
  productLowStockThreshold: number;
  productStatus: string;
  currentQuantity: number;
  inventoryUpdatedAt: string;
  storeId: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

const POS = () => {
  const { toast } = useToast();
  const { selectedStore } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([
    { id: "walk-in", name: "Walk-in Customer" },
    { id: "john-doe", name: "John Doe", email: "john@example.com", phone: "+1234567890" },
    { id: "jane-smith", name: "Jane Smith", email: "jane@example.com", phone: "+0987654321" },
    { id: "mike-wilson", name: "Mike Wilson", email: "mike@example.com", phone: "+1122334455" },
  ]);

  // Fetch inventory data for the selected store
  const { data: inventoryItems = [], isLoading: inventoryLoading } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory', selectedStore],
    queryFn: async () => {
      if (!selectedStore) return [];
      const response = await fetch(`/api/inventory?storeId=${selectedStore}`);
      if (!response.ok) throw new Error('Failed to fetch inventory');
      return response.json();
    },
    enabled: !!selectedStore,
  });

  // Fetch company data for currency
  const { data: company } = useQuery({
    queryKey: ['/api/company'],
  });
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentTiming, setPaymentTiming] = useState("now");

  // Transform inventory data to products format
  const products: Product[] = useMemo(() => {
    return inventoryItems
      .filter(item => item.currentQuantity > 0 && item.productStatus === 'active') // Only show in-stock active products
      .map(item => ({
        id: item.productId,
        name: item.productName,
        price: item.productRetailPrice / 100, // Convert from cents to currency units
        category: item.productCategory || 'Uncategorized',
        stock: item.currentQuantity,
        image: item.productImage || undefined,
        retailPrice: item.productRetailPrice,
        retailDiscount: item.productRetailDiscount
      }));
  }, [inventoryItems]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return ["all", ...uniqueCategories];
  }, [products]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const addCustomer = () => {
    if (!newCustomer.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter customer name.",
        variant: "destructive"
      });
      return;
    }

    const customerId = `customer-${Date.now()}`;
    const customerToAdd: Customer = {
      id: customerId,
      name: newCustomer.name.trim(),
      email: newCustomer.email.trim() || undefined,
      phone: newCustomer.phone.trim() || undefined,
    };

    setCustomers([...customers, customerToAdd]);
    setCustomer(customerId);
    setNewCustomer({ name: "", email: "", phone: "" });
    setIsAddCustomerOpen(false);

    toast({
      title: "Customer Added",
      description: `${customerToAdd.name} has been added successfully.`,
    });
  };

  const processPayment = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before processing payment.",
        variant: "destructive"
      });
      return;
    }
    setIsPaymentDialogOpen(true);
  };

  const handleSaveSale = () => {
    const action = paymentTiming === "now" ? "Payment processed" : "Sale saved (payment pending)";
    
    toast({
      title: action,
      description: `Transaction for ${formatCurrency(total, company?.currency || 'tzs')} using ${paymentMethod}`,
    });
    
    setCart([]);
    setCustomer("");
    setIsPaymentDialogOpen(false);
    setPaymentMethod("cash");
    setPaymentTiming("now");
  };

  // Show store selection warning if no store is selected
  if (!selectedStore) {
    return (
      <div className="min-h-screen bg-background w-full fixed inset-0 z-50">
        <div className="w-full h-full p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
            <p className="text-muted-foreground">Process sales quickly and efficiently</p>
          </div>

          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Store className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Select a Store</h3>
                <p className="text-muted-foreground max-w-md">
                  Please select a store from the sidebar to access the Point of Sale system. 
                  Product inventory is managed separately for each store.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading state while fetching inventory
  if (inventoryLoading) {
    return (
      <div className="min-h-screen bg-background w-full fixed inset-0 z-50">
        <div className="w-full h-full p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
            <p className="text-muted-foreground">Loading inventory data...</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full fixed inset-0 z-50">
      <div className="w-full h-full p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
          <p className="text-muted-foreground">Process sales quickly and efficiently</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-6rem)]">
          
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-4xl mb-4">📦</div>
                  <h3 className="text-lg font-medium mb-2">No products available</h3>
                  <p className="text-muted-foreground max-w-md">
                    {products.length === 0 
                      ? "No products are currently in stock for this store. Add inventory to start selling."
                      : "No products match your current search and filter criteria."
                    }
                  </p>
                </div>
              ) : (
                filteredProducts.map(product => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gradient-subtle rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                    <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">
                          {formatDecimalCurrency(product.price, (company as any)?.currency || 'tzs')}
                        </span>
                        <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"} className="text-xs">
                          {product.stock}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </div>

          {/* Cart & Checkout Section */}
          <div className="space-y-4 h-full">
            {/* Customer Selection */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer
                  </CardTitle>
                  <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                            placeholder="Customer name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                            placeholder="customer@example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                            placeholder="+1234567890"
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button onClick={addCustomer} className="flex-1">
                            Add Customer
                          </Button>
                          <Button variant="outline" onClick={() => setIsAddCustomerOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Select value={customer} onValueChange={setCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(cust => (
                      <SelectItem key={cust.id} value={cust.id}>
                        {cust.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Cart */}
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Cart ({cart.length} items)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No items in cart</p>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.price, company?.currency || 'tzs')} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.id)}
                            className="h-8 w-8 p-0 ml-2"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatDecimalCurrency(subtotal, (company as any)?.currency || 'tzs')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (8%):</span>
                    <span>{formatDecimalCurrency(tax, (company as any)?.currency || 'tzs')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{formatDecimalCurrency(total, (company as any)?.currency || 'tzs')}</span>
                  </div>
                </div>

                {/* Payment Buttons */}
                <div className="space-y-2 pt-4">
                  <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        size="lg"
                        disabled={cart.length === 0}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Process Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Payment Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Payment Method */}
                        <div>
                          <Label className="text-sm font-medium">Payment Method</Label>
                          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="cash" id="cash" />
                              <Label htmlFor="cash" className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Cash
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="card" id="card" />
                              <Label htmlFor="card" className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Credit/Debit Card
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="check" id="check" />
                              <Label htmlFor="check" className="flex items-center gap-2">
                                <Receipt className="h-4 w-4" />
                                Check
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Payment Timing */}
                        <div>
                          <Label className="text-sm font-medium">Payment Status</Label>
                          <RadioGroup value={paymentTiming} onValueChange={setPaymentTiming} className="mt-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="now" id="now" />
                              <Label htmlFor="now" className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Customer paying now
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="later" id="later" />
                              <Label htmlFor="later" className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Customer will pay later
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Order Summary */}
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>{formatDecimalCurrency(subtotal, (company as any)?.currency || 'tzs')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tax (8%):</span>
                              <span>{formatDecimalCurrency(tax, (company as any)?.currency || 'tzs')}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold">
                              <span>Total:</span>
                              <span className="text-primary">{formatDecimalCurrency(total, (company as any)?.currency || 'tzs')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleSaveSale} className="flex-1">
                            {paymentTiming === "now" ? "Confirm Payment" : "Save Sale"}
                          </Button>
                          <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;