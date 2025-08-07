import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  Grid3X3,
  List,
  MapPin,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Store,
  Users,
  Loader2,
  XCircle
} from "lucide-react";

// Store form validation schema
const storeFormSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  manager: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

type StoreFormData = z.infer<typeof storeFormSchema>;

interface Store {
  id: string;
  userId: string;
  name: string;
  manager: string | null;
  address: string;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  openTime: string | null;
  closeTime: string | null;
  status: string;
  employees: number;
  monthlyGoal: number;
  createdAt: string;
  updatedAt: string;
}

// API functions
const fetchStores = async (): Promise<Store[]> => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch('/api/stores', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stores');
  }

  return response.json();
};

const createStore = async (storeData: StoreFormData): Promise<Store> => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch('/api/stores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(storeData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create store');
  }

  return response.json();
};

const updateStore = async ({ id, ...storeData }: StoreFormData & { id: string }): Promise<Store> => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`/api/stores/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(storeData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update store');
  }

  return response.json();
};

const Stores = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isEditStoreOpen, setIsEditStoreOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Fetch stores query
  const { data: stores = [], isLoading, error } = useQuery({
    queryKey: ['/api/stores'],
    queryFn: fetchStores,
  });

  // Create store mutation
  const createStoreMutation = useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      setIsAddStoreOpen(false);
      form.reset();
      toast({
        title: "Store created",
        description: "Your new store has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create store",
        variant: "destructive",
      });
    },
  });

  // Update store mutation
  const updateStoreMutation = useMutation({
    mutationFn: updateStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      setIsEditStoreOpen(false);
      setEditingStore(null);
      form.reset();
      toast({
        title: "Store updated",
        description: "The store has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update store",
        variant: "destructive",
      });
    },
  });

  // Form setup
  const form = useForm<StoreFormData>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: "",
      manager: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      openTime: "09:00",
      closeTime: "21:00",
    },
  });

  const onSubmit = (data: StoreFormData) => {
    if (editingStore) {
      updateStoreMutation.mutate({ ...data, id: editingStore.id });
    } else {
      createStoreMutation.mutate(data);
    }
  };

  // Handle edit store
  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    form.reset({
      name: store.name,
      manager: store.manager || "",
      address: store.address,
      city: store.city || "",
      state: store.state || "",
      zipCode: store.zipCode || "",
      phone: store.phone || "",
      email: store.email || "",
      openTime: store.openTime || "09:00",
      closeTime: store.closeTime || "21:00",
    });
    setIsEditStoreOpen(true);
  };

  // Filter stores
  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.manager?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || store.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalStores = stores.length;
  const openStores = stores.filter(store => store.status === "open").length;
  const totalSales = 0; // This would come from sales data
  const totalAlerts = 0; // This would come from inventory data

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "default";
      case "closed": return "secondary";
      case "maintenance": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <CheckCircle className="h-3 w-3" />;
      case "closed": return <XCircle className="h-3 w-3" />;
      case "maintenance": return <AlertTriangle className="h-3 w-3" />;
      default: return <XCircle className="h-3 w-3" />;
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error loading stores</h3>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Stores</h1>
          <p className="text-muted-foreground">Manage your retail locations</p>
        </div>
        
        <Dialog open={isAddStoreOpen} onOpenChange={setIsAddStoreOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-store">
              <Plus className="h-4 w-4 mr-2" />
              Add Store
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Store</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Store name" data-testid="input-store-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="manager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manager</FormLabel>
                        <FormControl>
                          <Input placeholder="Manager name" data-testid="input-manager" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Store address" rows={2} data-testid="input-address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" data-testid="input-city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="State" data-testid="input-state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="ZIP Code" data-testid="input-zipCode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" data-testid="input-phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="store@company.com" data-testid="input-email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="openTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Open Time</FormLabel>
                        <FormControl>
                          <Input type="time" data-testid="input-openTime" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="closeTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Close Time</FormLabel>
                        <FormControl>
                          <Input type="time" data-testid="input-closeTime" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={createStoreMutation.isPending}
                    data-testid="button-submit-store"
                  >
                    {createStoreMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Add Store"
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddStoreOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Store Dialog */}
        <Dialog open={isEditStoreOpen} onOpenChange={setIsEditStoreOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Store</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Store name" data-testid="input-edit-store-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="manager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manager</FormLabel>
                        <FormControl>
                          <Input placeholder="Manager name" data-testid="input-edit-manager" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Store address" rows={2} data-testid="input-edit-address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" data-testid="input-edit-city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="State" data-testid="input-edit-state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="12345" data-testid="input-edit-zipCode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" data-testid="input-edit-phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="store@company.com" data-testid="input-edit-email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="openTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Open Time</FormLabel>
                        <FormControl>
                          <Input type="time" data-testid="input-edit-openTime" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="closeTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Close Time</FormLabel>
                        <FormControl>
                          <Input type="time" data-testid="input-edit-closeTime" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={updateStoreMutation.isPending}
                    data-testid="button-update-store"
                  >
                    {updateStoreMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Store"
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditStoreOpen(false);
                      setEditingStore(null);
                      form.reset();
                    }}
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Stores</p>
                <p className="text-2xl font-bold">{totalStores}</p>
              </div>
              <Store className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Stores</p>
                <p className="text-2xl font-bold">{openStores}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">${totalSales.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inventory Alerts</p>
                <p className="text-2xl font-bold">{totalAlerts}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${totalAlerts > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search stores, cities, or managers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        
        {/* View Toggle Buttons */}
        <div className="flex border rounded-md">
          <Button 
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            className="rounded-none rounded-l-md border-r"
            onClick={() => setViewMode("grid")}
            data-testid="button-grid-view"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === "table" ? "default" : "ghost"}
            size="icon"
            className="rounded-none rounded-r-md"
            onClick={() => setViewMode("table")}
            data-testid="button-table-view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading stores...</p>
        </div>
      )}

      {/* Stores View */}
      {!isLoading && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStores.map(store => (
                <Card key={store.id} className="hover:shadow-lg transition-shadow" data-testid={`store-card-${store.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {store.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle 
                            className="text-lg cursor-pointer hover:text-primary transition-colors"
                            onClick={() => navigate(`/stores/${store.id}`)}
                          >
                            {store.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getStatusColor(store.status) as any} className="flex items-center gap-1">
                              {getStatusIcon(store.status)}
                              {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/stores/${store.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditStore(store)} data-testid={`button-edit-store-${store.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Store
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{store.address}{store.city ? `, ${store.city}` : ''}{store.state ? `, ${store.state}` : ''}</span>
                      </div>
                      {(store.openTime || store.closeTime) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{store.openTime || "N/A"} - {store.closeTime || "N/A"}</span>
                        </div>
                      )}
                      {store.manager && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{store.manager} • {store.employees} employees</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStores.map(store => (
                    <TableRow key={store.id} className="hover:bg-muted/50" data-testid={`store-row-${store.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {store.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span 
                            className="font-medium cursor-pointer hover:text-primary transition-colors"
                            onClick={() => navigate(`/stores/${store.id}`)}
                          >
                            {store.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{store.city}, {store.state}</div>
                          <div className="text-muted-foreground">{store.address}</div>
                        </div>
                      </TableCell>
                      <TableCell>{store.manager || "Not assigned"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(store.status) as any} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(store.status)}
                          {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {store.openTime && store.closeTime ? `${store.openTime} - ${store.closeTime}` : "Not set"}
                      </TableCell>
                      <TableCell>{store.employees}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/stores/${store.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditStore(store)} data-testid={`button-edit-store-table-${store.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Store
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {filteredStores.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No stores found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedStatus !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Get started by adding your first store"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Stores;