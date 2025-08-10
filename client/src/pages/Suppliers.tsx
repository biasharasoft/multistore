import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Supplier, InsertSupplier } from "@shared/schema";
import { 
  Search, 
  Plus, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Edit,
  Trash2,
  Filter,
  Grid3x3,
  List,
  Star,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Users
} from "lucide-react";

const categories = ["All", "Food & Beverages", "Electronics", "Sports & Fitness", "Apparel", "Office Supplies"];

// Helper function to convert database supplier data for display
const convertDbSupplierToFrontend = (dbSupplier: Supplier) => {
  return {
    ...dbSupplier,
    contactPerson: dbSupplier.contactPerson || "",
    email: dbSupplier.email || "",
    phone: dbSupplier.phone || "",
    address: dbSupplier.address || "",
    city: dbSupplier.city || "",
    state: dbSupplier.state || "",
    zipCode: dbSupplier.zipCode || "",
    country: dbSupplier.country || "",
    category: dbSupplier.category || "",
    paymentTerms: dbSupplier.paymentTerms || "",
    description: dbSupplier.description || "",
    website: dbSupplier.website || "",
    rating: dbSupplier.rating ? dbSupplier.rating / 10 : 0, // Convert back from storage format
    totalSpent: dbSupplier.totalSpent ? dbSupplier.totalSpent / 100 : 0, // Convert back from cents
    totalOrders: dbSupplier.totalOrders || 0,
    leadTime: dbSupplier.leadTime || 0,
    lastOrderDate: dbSupplier.lastOrderDate ? new Date(dbSupplier.lastOrderDate).toISOString().split('T')[0] : "",
  };
};

export default function Suppliers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // API Queries
  const { data: dbSuppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });
  
  // Convert database data for display
  const suppliers = dbSuppliers.map(convertDbSupplierToFrontend);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);

  // Form state for adding new supplier
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    category: "",
    status: "active" as "active" | "inactive" | "pending",
    rating: "",
    totalOrders: "",
    totalSpent: "",
    paymentTerms: "",
    leadTime: "",
    description: "",
    website: "",
  });

  // Create supplier mutation
  const createSupplierMutation = useMutation({
    mutationFn: async (supplierData: InsertSupplier) => {
      return apiRequest('/api/suppliers', {
        method: 'POST',
        body: JSON.stringify(supplierData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Supplier created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      setIsAddSupplierOpen(false);
      // Reset form
      setSupplierForm({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        category: "",
        status: "active",
        rating: "",
        totalOrders: "",
        totalSpent: "",
        paymentTerms: "",
        leadTime: "",
        description: "",
        website: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create supplier: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleAddSupplier = () => {
    try {
      // Convert form data to proper types
      const supplierData: InsertSupplier = {
        name: supplierForm.name,
        contactPerson: supplierForm.contactPerson || undefined,
        email: supplierForm.email || undefined,
        phone: supplierForm.phone || undefined,
        address: supplierForm.address || undefined,
        city: supplierForm.city || undefined,
        state: supplierForm.state || undefined,
        zipCode: supplierForm.zipCode || undefined,
        country: supplierForm.country || undefined,
        category: supplierForm.category || undefined,
        status: supplierForm.status,
        rating: supplierForm.rating ? parseInt(supplierForm.rating) : undefined,
        totalOrders: supplierForm.totalOrders ? parseInt(supplierForm.totalOrders) : undefined,
        totalSpent: supplierForm.totalSpent ? parseInt(supplierForm.totalSpent) : undefined,
        paymentTerms: supplierForm.paymentTerms || undefined,
        leadTime: supplierForm.leadTime ? parseInt(supplierForm.leadTime) : undefined,
        description: supplierForm.description || undefined,
        website: supplierForm.website || undefined,
      };

      createSupplierMutation.mutate(supplierData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Please check your form data and try again.",
        variant: "destructive",
      });
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || supplier.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || supplier.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeSuppliers = suppliers.filter(s => s.status === "active").length;
  const pendingSuppliers = suppliers.filter(s => s.status === "pending").length;
  const totalSpent = suppliers.reduce((sum, s) => sum + s.totalSpent, 0);
  const avgRating = suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return { label: "Active", variant: "default" as const };
      case "pending":
        return { label: "Pending", variant: "secondary" as const };
      case "inactive":
        return { label: "Inactive", variant: "destructive" as const };
      default:
        return { label: status, variant: "outline" as const };
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const SupplierCard = ({ supplier }: { supplier: Supplier }) => {
    const statusBadge = getStatusBadge(supplier.status);

    return (
      <Card className="group hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{supplier.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {supplier.contactPerson} • {supplier.category}
              </CardDescription>
            </div>
            <Badge variant={statusBadge.variant} className="text-xs">
              {statusBadge.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{supplier.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{supplier.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{supplier.city}, {supplier.country}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Orders</p>
              <p className="font-semibold">{supplier.totalOrders}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Spent</p>
              <p className="font-semibold text-primary">${supplier.totalSpent.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Lead Time</p>
              <p className="font-semibold">{supplier.leadTime} days</p>
            </div>
            <div>
              <p className="text-muted-foreground">Rating</p>
              <div className="flex items-center gap-1">
                {getRatingStars(supplier.rating)}
                <span className="text-xs font-medium ml-1">{supplier.rating}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const SupplierListRow = ({ supplier }: { supplier: Supplier }) => {
    const statusBadge = getStatusBadge(supplier.status);

    return (
      <div className="grid grid-cols-8 gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors items-center">
        <div className="col-span-2">
          <p className="font-medium">{supplier.name}</p>
          <p className="text-sm text-muted-foreground">{supplier.contactPerson}</p>
        </div>
        <div className="text-center">
          <Badge variant="outline">{supplier.category}</Badge>
        </div>
        <div className="text-center">
          <Badge variant={statusBadge.variant}>
            {statusBadge.label}
          </Badge>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            {getRatingStars(supplier.rating)}
            <span className="text-xs ml-1">{supplier.rating}</span>
          </div>
        </div>
        <div className="text-center font-medium">
          {supplier.totalOrders}
        </div>
        <div className="text-center font-semibold text-primary">
          ${supplier.totalSpent.toLocaleString()}
        </div>
        <div className="flex gap-1 justify-center">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">Manage your supplier relationships and procurement</p>
        </div>
        
        <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>
                Add a new supplier to your network
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="supplierName">Company Name *</Label>
                <Input 
                  id="supplierName" 
                  placeholder="Enter company name"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  data-testid="input-supplier-name"
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input 
                  id="contactPerson" 
                  placeholder="Contact person name"
                  value={supplierForm.contactPerson}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                  data-testid="input-contact-person"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="contact@supplier.com"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  data-testid="input-email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  placeholder="+1 (555) 123-4567"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  data-testid="input-phone"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={supplierForm.category} onValueChange={(value) => setSupplierForm({ ...supplierForm, category: value })}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Sports & Fitness">Sports & Fitness</SelectItem>
                    <SelectItem value="Apparel">Apparel</SelectItem>
                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input 
                  id="website" 
                  placeholder="https://supplier.com"
                  value={supplierForm.website}
                  onChange={(e) => setSupplierForm({ ...supplierForm, website: e.target.value })}
                  data-testid="input-website"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  placeholder="Street address"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  data-testid="input-address"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  placeholder="City"
                  value={supplierForm.city}
                  onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
                  data-testid="input-city"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  placeholder="Country"
                  value={supplierForm.country}
                  onChange={(e) => setSupplierForm({ ...supplierForm, country: e.target.value })}
                  data-testid="input-country"
                />
              </div>
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select value={supplierForm.paymentTerms} onValueChange={(value) => setSupplierForm({ ...supplierForm, paymentTerms: value })}>
                  <SelectTrigger data-testid="select-payment-terms">
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="leadTime">Lead Time (Days)</Label>
                <Input 
                  id="leadTime" 
                  type="number" 
                  placeholder="7"
                  value={supplierForm.leadTime}
                  onChange={(e) => setSupplierForm({ ...supplierForm, leadTime: e.target.value })}
                  data-testid="input-lead-time"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Supplier description and notes"
                  value={supplierForm.description}
                  onChange={(e) => setSupplierForm({ ...supplierForm, description: e.target.value })}
                  data-testid="input-description"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddSupplierOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddSupplier}
                disabled={createSupplierMutation.isPending || !supplierForm.name}
                data-testid="button-add-supplier"
              >
                {createSupplierMutation.isPending ? "Adding..." : "Add Supplier"}
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
                <p className="text-sm font-medium text-muted-foreground">Total Suppliers</p>
                <p className="text-2xl font-bold">{suppliers.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Suppliers</p>
                <p className="text-2xl font-bold">{activeSuppliers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold text-orange-600">{pendingSuppliers}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
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
                  placeholder="Search suppliers..."
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
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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

      {/* Suppliers Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map(supplier => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Suppliers List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Header Row */}
              <div className="grid grid-cols-8 gap-4 p-4 border-b font-medium text-sm text-muted-foreground">
                <div className="col-span-2">Company / Contact</div>
                <div className="text-center">Category</div>
                <div className="text-center">Status</div>
                <div className="text-center">Rating</div>
                <div className="text-center">Orders</div>
                <div className="text-center">Total Spend</div>
                <div className="text-center">Actions</div>
              </div>
              {/* Data Rows */}
              {filteredSuppliers.map(supplier => (
                <SupplierListRow key={supplier.id} supplier={supplier} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredSuppliers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No suppliers found</h3>
            <p className="text-muted-foreground mb-4">
              No suppliers match your current filters. Try adjusting your search criteria.
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
              setSelectedStatus("All");
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}