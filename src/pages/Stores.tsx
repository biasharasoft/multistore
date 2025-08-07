import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, MapPin, Clock, Phone, Mail, Edit, Eye, MoreHorizontal, Store, Users, DollarSign, Package, AlertTriangle, CheckCircle, XCircle, Grid3X3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  manager: string;
  status: "open" | "closed" | "maintenance";
  openTime: string;
  closeTime: string;
  employees: number;
  totalSales: number;
  monthlyGoal: number;
  inventoryAlerts: number;
}

const Stores = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [newStore, setNewStore] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    manager: "",
    openTime: "09:00",
    closeTime: "21:00"
  });

  // Mock data
  const [stores, setStores] = useState<Store[]>([
    {
      id: "1",
      name: "Downtown Store",
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      phone: "+1 (555) 123-4567",
      email: "downtown@company.com",
      manager: "Sarah Johnson",
      status: "open",
      openTime: "09:00",
      closeTime: "21:00",
      employees: 12,
      totalSales: 48500,
      monthlyGoal: 50000,
      inventoryAlerts: 3
    },
    {
      id: "2",
      name: "Mall Location",
      address: "456 Shopping Center Blvd",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      phone: "+1 (555) 987-6543",
      email: "mall@company.com",
      manager: "Mike Chen",
      status: "open",
      openTime: "10:00",
      closeTime: "22:00",
      employees: 8,
      totalSales: 32000,
      monthlyGoal: 35000,
      inventoryAlerts: 1
    },
    {
      id: "3",
      name: "Airport Terminal",
      address: "789 Airport Way",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      phone: "+1 (555) 456-7890",
      email: "airport@company.com",
      manager: "Emily Rodriguez",
      status: "maintenance",
      openTime: "06:00",
      closeTime: "23:00",
      employees: 6,
      totalSales: 28000,
      monthlyGoal: 30000,
      inventoryAlerts: 0
    },
    {
      id: "4",
      name: "Suburban Plaza",
      address: "321 Suburban Road",
      city: "Houston",
      state: "TX",
      zipCode: "77001",
      phone: "+1 (555) 321-0987",
      email: "suburban@company.com",
      manager: "David Wilson",
      status: "closed",
      openTime: "09:30",
      closeTime: "20:30",
      employees: 10,
      totalSales: 41200,
      monthlyGoal: 45000,
      inventoryAlerts: 5
    }
  ]);

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || store.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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
      case "open": return <CheckCircle className="h-4 w-4" />;
      case "closed": return <XCircle className="h-4 w-4" />;
      case "maintenance": return <AlertTriangle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  const addStore = () => {
    if (!newStore.name.trim() || !newStore.address.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in store name and address.",
        variant: "destructive"
      });
      return;
    }

    const storeToAdd: Store = {
      id: `store-${Date.now()}`,
      ...newStore,
      status: "open",
      employees: 0,
      totalSales: 0,
      monthlyGoal: 25000,
      inventoryAlerts: 0
    };

    setStores([...stores, storeToAdd]);
    setNewStore({
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      manager: "",
      openTime: "09:00",
      closeTime: "21:00"
    });
    setIsAddStoreOpen(false);

    toast({
      title: "Store Added",
      description: `${storeToAdd.name} has been added successfully.`,
    });
  };

  const totalStores = stores.length;
  const openStores = stores.filter(s => s.status === "open").length;
  const totalSales = stores.reduce((sum, store) => sum + store.totalSales, 0);
  const totalAlerts = stores.reduce((sum, store) => sum + store.inventoryAlerts, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Stores</h1>
            <p className="text-muted-foreground">Manage your store locations and performance</p>
          </div>
          <Dialog open={isAddStoreOpen} onOpenChange={setIsAddStoreOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Store
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Store</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store-name">Store Name *</Label>
                  <Input
                    id="store-name"
                    value={newStore.name}
                    onChange={(e) => setNewStore({...newStore, name: e.target.value})}
                    placeholder="Store name"
                  />
                </div>
                <div>
                  <Label htmlFor="manager">Manager</Label>
                  <Input
                    id="manager"
                    value={newStore.manager}
                    onChange={(e) => setNewStore({...newStore, manager: e.target.value})}
                    placeholder="Manager name"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={newStore.address}
                    onChange={(e) => setNewStore({...newStore, address: e.target.value})}
                    placeholder="Store address"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newStore.city}
                    onChange={(e) => setNewStore({...newStore, city: e.target.value})}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={newStore.state}
                    onChange={(e) => setNewStore({...newStore, state: e.target.value})}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={newStore.zipCode}
                    onChange={(e) => setNewStore({...newStore, zipCode: e.target.value})}
                    placeholder="ZIP Code"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newStore.phone}
                    onChange={(e) => setNewStore({...newStore, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStore.email}
                    onChange={(e) => setNewStore({...newStore, email: e.target.value})}
                    placeholder="store@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="open-time">Open Time</Label>
                  <Input
                    id="open-time"
                    type="time"
                    value={newStore.openTime}
                    onChange={(e) => setNewStore({...newStore, openTime: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="close-time">Close Time</Label>
                  <Input
                    id="close-time"
                    type="time"
                    value={newStore.closeTime}
                    onChange={(e) => setNewStore({...newStore, closeTime: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={addStore} className="flex-1">
                  Add Store
                </Button>
                <Button variant="outline" onClick={() => setIsAddStoreOpen(false)}>
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
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
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "table" ? "default" : "ghost"}
              size="icon"
              className="rounded-none rounded-r-md"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stores View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStores.map(store => (
              <Card key={store.id} className="hover:shadow-lg transition-shadow">
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
                          <Badge variant={getStatusColor(store.status)} className="flex items-center gap-1">
                            {getStatusIcon(store.status)}
                            {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                          </Badge>
                          {store.inventoryAlerts > 0 && (
                            <Badge variant="outline" className="text-orange-600">
                              {store.inventoryAlerts} alerts
                            </Badge>
                          )}
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
                        <DropdownMenuItem>
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
                      <span>{store.address}, {store.city}, {store.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{store.openTime} - {store.closeTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{store.manager} • {store.employees} employees</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-sm font-medium">Monthly Sales</p>
                      <p className="text-lg font-bold text-primary">${store.totalSales.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        Goal: ${store.monthlyGoal.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Performance</p>
                      <p className="text-lg font-bold">
                        {Math.round((store.totalSales / store.monthlyGoal) * 100)}%
                      </p>
                      <div className="w-full bg-secondary rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((store.totalSales / store.monthlyGoal) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
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
                  <TableHead>Sales</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Alerts</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.map(store => (
                  <TableRow key={store.id} className="hover:bg-muted/50">
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
                    <TableCell>{store.manager}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(store.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(store.status)}
                        {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {store.openTime} - {store.closeTime}
                    </TableCell>
                    <TableCell>{store.employees}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">${store.totalSales.toLocaleString()}</div>
                        <div className="text-muted-foreground">Goal: ${store.monthlyGoal.toLocaleString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {Math.round((store.totalSales / store.monthlyGoal) * 100)}%
                        </div>
                        <div className="w-16 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((store.totalSales / store.monthlyGoal) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {store.inventoryAlerts > 0 ? (
                        <Badge variant="outline" className="text-orange-600">
                          {store.inventoryAlerts}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
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
                          <DropdownMenuItem>
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

        {filteredStores.length === 0 && (
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

        {/* Store Details Dialog */}
        <Dialog open={!!selectedStore} onOpenChange={() => setSelectedStore(null)}>
          <DialogContent className="max-w-4xl">
            {selectedStore && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {selectedStore.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {selectedStore.name}
                  </DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="font-medium">Staff</span>
                          </div>
                          <p className="text-2xl font-bold">{selectedStore.employees}</p>
                          <p className="text-sm text-muted-foreground">Employees</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Sales</span>
                          </div>
                          <p className="text-2xl font-bold">${selectedStore.totalSales.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">This month</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-orange-500" />
                            <span className="font-medium">Alerts</span>
                          </div>
                          <p className="text-2xl font-bold">{selectedStore.inventoryAlerts}</p>
                          <p className="text-sm text-muted-foreground">Inventory alerts</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="performance" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Monthly Goal Progress</span>
                          <span className="text-sm text-muted-foreground">
                            ${selectedStore.totalSales.toLocaleString()} / ${selectedStore.monthlyGoal.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3">
                          <div 
                            className="bg-primary h-3 rounded-full transition-all"
                            style={{ width: `${Math.min((selectedStore.totalSales / selectedStore.monthlyGoal) * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {Math.round((selectedStore.totalSales / selectedStore.monthlyGoal) * 100)}% complete
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="contact" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Address</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedStore.address}<br />
                              {selectedStore.city}, {selectedStore.state} {selectedStore.zipCode}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <p className="text-sm text-muted-foreground">{selectedStore.phone}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{selectedStore.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Hours</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedStore.openTime} - {selectedStore.closeTime}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Manager</p>
                            <p className="text-sm text-muted-foreground">{selectedStore.manager}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Stores;