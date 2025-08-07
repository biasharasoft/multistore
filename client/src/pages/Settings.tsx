import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type ProductsCategory, type InsertProductsCategory, type ExpensesCategory, type InsertExpensesCategory } from "@shared/schema";
import { 
  Settings as SettingsIcon,
  User,
  Store,
  Bell,
  Shield,
  CreditCard,
  Plug,
  Globe,
  DollarSign,
  Save,
  Upload,
  Trash2,
  Plus,
  Edit,
  Key,
  Mail,
  Phone,
  MapPin,
  Clock,
  Palette,
  Database,
  Smartphone,
  Tag
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [categoryType, setCategoryType] = useState<"products" | "expenses">("products");
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductsCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");
  const [editCategoryStatus, setEditCategoryStatus] = useState("");

  // Fetch products categories
  const { data: productCategories = [], isLoading: isLoadingProductCategories } = useQuery<ProductsCategory[]>({
    queryKey: ['/api/products-categories'],
    enabled: categoryType === "products",
  });

  // Fetch expenses categories
  const { data: expenseCategories = [], isLoading: isLoadingExpenseCategories } = useQuery<ExpensesCategory[]>({
    queryKey: ['/api/expenses-categories'],
    enabled: categoryType === "expenses",
  });


  // Create products category mutation
  const createProductsCategoryMutation = useMutation({
    mutationFn: async (data: InsertProductsCategory) => {
      return await apiRequest('/api/products-categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products-categories'] });
      setNewCategoryName("");
      setNewCategoryDescription("");
      setIsAddCategoryOpen(false);
      toast({
        title: "Success",
        description: "Product category has been added successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create product category. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create expenses category mutation
  const createExpensesCategoryMutation = useMutation({
    mutationFn: async (data: InsertExpensesCategory) => {
      return await apiRequest('/api/expenses-categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses-categories'] });
      setNewCategoryName("");
      setNewCategoryDescription("");
      setIsAddCategoryOpen(false);
      toast({
        title: "Success",
        description: "Expense category has been added successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating expense category:', error);
      toast({
        title: "Error",
        description: "Failed to create expense category. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update products category mutation
  const updateProductsCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProductsCategory> }) => {
      return await apiRequest(`/api/products-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products-categories'] });
      setIsEditCategoryOpen(false);
      setEditingCategory(null);
      toast({
        title: "Success",
        description: "Product category has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update product category. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update expenses category mutation
  const updateExpensesCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertExpensesCategory> }) => {
      return await apiRequest(`/api/expenses-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses-categories'] });
      setIsEditCategoryOpen(false);
      setEditingCategory(null);
      toast({
        title: "Success",
        description: "Expense category has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating expense category:', error);
      toast({
        title: "Error",
        description: "Failed to update expense category. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Map product categories to the expected format for the UI
  const mappedProductCategories = productCategories.map(category => ({
    id: category.id,
    name: category.name,
    description: "", // Since our schema doesn't have description
    productCount: 0, // This would need to be calculated if we had products
    status: category.isActive ? "active" : "inactive",
  }));

  // Map expense categories to the expected format for the UI
  const mappedExpenseCategories = expenseCategories.map(category => ({
    id: category.id,
    name: category.name,
    description: "", // Since our schema doesn't have description
    expenseCount: 0, // This would need to be calculated if we had expenses
    status: category.isActive ? "active" : "inactive",
  }));

  // Get current categories based on selected type
  const currentCategories = categoryType === "products" ? mappedProductCategories : mappedExpenseCategories;

  const stores = [
    { id: 1, name: "Downtown Branch", address: "123 Main St, Downtown", status: "active" },
    { id: 2, name: "Mall Location", address: "456 Shopping Center", status: "active" },
    { id: 3, name: "Airport Store", address: "789 Airport Terminal", status: "inactive" },
  ];

  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: "John Doe", email: "john@company.com", role: "Admin", status: "active", store: "Downtown Branch" },
    { id: 2, name: "Jane Smith", email: "jane@company.com", role: "Manager", status: "active", store: "Mall Location" },
    { id: 3, name: "Mike Johnson", email: "mike@company.com", role: "Cashier", status: "pending", store: "Downtown Branch" },
  ]);

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [newMemberStore, setNewMemberStore] = useState("");

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    if (categoryType === "products") {
      createProductsCategoryMutation.mutate({
        name: newCategoryName.trim(),
        isActive: true,
      });
    } else {
      createExpensesCategoryMutation.mutate({
        name: newCategoryName.trim(),
        isActive: true,
      });
    }
  };

  const handleEditCategory = (category: any) => {
    if (categoryType === "products") {
      // Find the original ProductsCategory from productCategories array
      const originalCategory = productCategories.find(pc => pc.id === category.id);
      if (originalCategory) {
        setEditingCategory(originalCategory);
        setEditCategoryName(originalCategory.name);
        setEditCategoryDescription(""); // Our schema doesn't have description
        setEditCategoryStatus(originalCategory.isActive ? "active" : "inactive");
        setIsEditCategoryOpen(true);
      }
    } else {
      // Find the original ExpensesCategory from expenseCategories array
      const originalCategory = expenseCategories.find(ec => ec.id === category.id);
      if (originalCategory) {
        setEditingCategory(originalCategory);
        setEditCategoryName(originalCategory.name);
        setEditCategoryDescription(""); // Our schema doesn't have description
        setEditCategoryStatus(originalCategory.isActive ? "active" : "inactive");
        setIsEditCategoryOpen(true);
      }
    }
  };

  const handleUpdateCategory = () => {
    if (!editCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    if (categoryType === "products" && editingCategory) {
      updateProductsCategoryMutation.mutate({
        id: editingCategory.id,
        data: {
          name: editCategoryName.trim(),
          isActive: editCategoryStatus === "active",
        }
      });
    } else if (categoryType === "expenses" && editingCategory) {
      updateExpensesCategoryMutation.mutate({
        id: editingCategory.id,
        data: {
          name: editCategoryName.trim(),
          isActive: editCategoryStatus === "active",
        }
      });
    }
  };

  const handleAddMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim() || !newMemberRole || !newMemberStore) {
      toast({
        title: "Error",
        description: "All fields are required.",
        variant: "destructive",
      });
      return;
    }

    const newMember = {
      id: Math.max(...teamMembers.map(m => m.id)) + 1,
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: newMemberRole,
      store: newMemberStore,
      status: "pending" as const,
    };

    setTeamMembers([...teamMembers, newMember]);
    
    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberRole("");
    setNewMemberStore("");
    setIsAddMemberOpen(false);
    
    toast({
      title: "Success",
      description: `Team member "${newMember.name}" has been added and will receive an invitation email.`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account, stores, and system preferences
          </p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john@company.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue="+1 (555) 123-4567" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="est">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                        <SelectItem value="cst">Central Time (CST)</SelectItem>
                        <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                        <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Manage your business details and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" defaultValue="BiasharaSoft" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select defaultValue="retail">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="food">Food & Beverage</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" defaultValue="https://biasharasoft.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea 
                    id="address" 
                    defaultValue="123 Business Ave, Suite 100&#10;New York, NY 10001"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select defaultValue="tzs">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tzs">TZS (TSh)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="cad">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance & Theme
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark theme for the interface</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact View</Label>
                  <p className="text-sm text-muted-foreground">Use compact spacing in tables and lists</p>
                </div>
                <Switch />
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stores Management */}
        <TabsContent value="stores" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Store Locations
                  </CardTitle>
                  <CardDescription>
                    Manage your store locations and their settings
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Store
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stores.map((store) => (
                  <div key={store.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Store className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{store.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {store.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={store.status === 'active' ? 'default' : 'secondary'}>
                        {store.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Store Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Default Store Settings</CardTitle>
              <CardDescription>
                Configure default settings applied to all new stores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Business Hours</Label>
                  <div className="flex space-x-2">
                    <Select defaultValue="9">
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="flex items-center text-muted-foreground">to</span>
                    <Select defaultValue="17">
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" defaultValue="8.25" step="0.01" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable POS Mode</Label>
                  <p className="text-sm text-muted-foreground">Allow stores to use POS functionality</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Inventory Tracking</Label>
                  <p className="text-sm text-muted-foreground">Track inventory levels automatically</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Management */}
        <TabsContent value="categories" className="space-y-6">
          {/* Category Type Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Category Management
              </CardTitle>
              <CardDescription>
                Manage categories for both products and expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg w-fit">
                <Button
                  variant={categoryType === "products" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCategoryType("products")}
                  className="h-8"
                >
                  Product Categories
                </Button>
                <Button
                  variant={categoryType === "expenses" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCategoryType("expenses")}
                  className="h-8"
                >
                  Expense Categories
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Categories List */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    {categoryType === "products" ? "Product Categories" : "Expense Categories"}
                  </CardTitle>
                  <CardDescription>
                    {categoryType === "products" 
                      ? "Organize your products into categories for better management"
                      : "Organize your expenses into categories for better tracking"
                    }
                  </CardDescription>
                </div>
                <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-category">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New {categoryType === "products" ? "Product" : "Expense"} Category</DialogTitle>
                      <DialogDescription>
                        Create a new {categoryType === "products" ? "product" : "expense"} category to organize your {categoryType === "products" ? "inventory" : "expenses"}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoryName">Category Name</Label>
                        <Input
                          id="categoryName"
                          data-testid="input-category-name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter category name"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)} data-testid="button-cancel-category">
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddCategory} 
                        disabled={categoryType === "products" ? createProductsCategoryMutation.isPending : createExpensesCategoryMutation.isPending}
                        data-testid="button-save-category"
                      >
                        {(categoryType === "products" ? createProductsCategoryMutation.isPending : createExpensesCategoryMutation.isPending) ? "Adding..." : "Add Category"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(categoryType === "products" && isLoadingProductCategories) || (categoryType === "expenses" && isLoadingExpenseCategories) ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  currentCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Tag className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {categoryType === "products" 
                              ? `${(category as any).productCount} products`
                              : `${(category as any).expenseCount} expenses`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                          {category.status}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Category Settings</CardTitle>
              <CardDescription>
                Configure how categories are displayed and managed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-categorize {categoryType === "products" ? "Products" : "Expenses"}</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically suggest categories for new {categoryType === "products" ? "products" : "expenses"}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Category Icons</Label>
                  <p className="text-sm text-muted-foreground">Display icons next to category names</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hierarchical Categories</Label>
                  <p className="text-sm text-muted-foreground">Enable subcategories and nested organization</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Default Category for New {categoryType === "products" ? "Products" : "Expenses"}</Label>
                <Select defaultValue="uncategorized">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
                    {currentCategories.filter(cat => cat.status === 'active').map((category) => (
                      <SelectItem key={category.id} value={category.name.toLowerCase()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Edit Category Dialog */}
          <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit {categoryType === "products" ? "Product" : "Expense"} Category</DialogTitle>
                <DialogDescription>
                  Update the category information and settings.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editCategoryName">Category Name</Label>
                  <Input
                    id="editCategoryName"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCategoryStatus">Status</Label>
                  <Select value={editCategoryStatus} onValueChange={setEditCategoryStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditCategoryOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateCategory}>
                  Update Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Team Management */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Team Members
                  </CardTitle>
                  <CardDescription>
                    Manage team access and permissions
                  </CardDescription>
                </div>
                <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Team Member</DialogTitle>
                      <DialogDescription>
                        Invite a new team member to join your organization. They will receive an invitation email.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="memberName">Full Name</Label>
                        <Input
                          id="memberName"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memberEmail">Email Address</Label>
                        <Input
                          id="memberEmail"
                          type="email"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memberRole">Role</Label>
                        <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Cashier">Cashier</SelectItem>
                            <SelectItem value="Staff">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memberStore">Assign Store</Label>
                        <Select value={newMemberStore} onValueChange={setNewMemberStore}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select store" />
                          </SelectTrigger>
                          <SelectContent>
                            {stores.filter(store => store.status === 'active').map((store) => (
                              <SelectItem key={store.id} value={store.name}>
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddMember}>
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                       <div>
                         <h4 className="font-medium">{member.name}</h4>
                         <p className="text-sm text-muted-foreground flex items-center">
                           <Mail className="h-3 w-3 mr-1" />
                           {member.email}
                         </p>
                         <p className="text-xs text-muted-foreground flex items-center mt-1">
                           <Store className="h-3 w-3 mr-1" />
                           {member.store}
                         </p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{member.role}</Badge>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency Settings */}
        <TabsContent value="currency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Currency Settings
              </CardTitle>
              <CardDescription>
                Configure currency preferences and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Primary Currency */}
                <div className="space-y-4">
                  <h4 className="font-medium">Primary Currency</h4>
                  <div className="space-y-2">
                    <Label htmlFor="primaryCurrency">Default Currency</Label>
                    <Select defaultValue="tzs">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tzs">TZS - Tanzanian Shilling (TSh)</SelectItem>
                        <SelectItem value="usd">USD - US Dollar ($)</SelectItem>
                        <SelectItem value="eur">EUR - Euro (€)</SelectItem>
                        <SelectItem value="gbp">GBP - British Pound (£)</SelectItem>
                        <SelectItem value="cad">CAD - Canadian Dollar (C$)</SelectItem>
                        <SelectItem value="jpy">JPY - Japanese Yen (¥)</SelectItem>
                        <SelectItem value="aud">AUD - Australian Dollar (A$)</SelectItem>
                        <SelectItem value="chf">CHF - Swiss Franc (CHF)</SelectItem>
                        <SelectItem value="cny">CNY - Chinese Yuan (¥)</SelectItem>
                        <SelectItem value="inr">INR - Indian Rupee (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      This currency will be used for all transactions and reporting
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currencyFormat">Currency Format</Label>
                    <Select defaultValue="symbol_before">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="symbol_before">TSh 1,000.00</SelectItem>
                        <SelectItem value="symbol_after">1,000.00 TSh</SelectItem>
                        <SelectItem value="code_before">TZS 1,000.00</SelectItem>
                        <SelectItem value="code_after">1,000.00 TZS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="decimalPlaces">Decimal Places</Label>
                    <Select defaultValue="2">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 (1,000)</SelectItem>
                        <SelectItem value="2">2 (1,000.00)</SelectItem>
                        <SelectItem value="3">3 (1,000.000)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Regional Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium">Regional Settings</h4>
                  <div className="space-y-2">
                    <Label htmlFor="numberFormat">Number Format</Label>
                    <Select defaultValue="comma_period">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comma_period">1,000.00 (US/UK style)</SelectItem>
                        <SelectItem value="period_comma">1.000,00 (European style)</SelectItem>
                        <SelectItem value="space_comma">1 000,00 (French style)</SelectItem>
                        <SelectItem value="apostrophe_period">1'000.00 (Swiss style)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxDisplay">Tax Display</Label>
                    <Select defaultValue="inclusive">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inclusive">Tax Inclusive</SelectItem>
                        <SelectItem value="exclusive">Tax Exclusive</SelectItem>
                        <SelectItem value="both">Show Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Round to Nearest</Label>
                      <p className="text-sm text-muted-foreground">Round prices to nearest denomination</p>
                    </div>
                    <Select defaultValue="0.01">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.01">0.01</SelectItem>
                        <SelectItem value="0.05">0.05</SelectItem>
                        <SelectItem value="0.10">0.10</SelectItem>
                        <SelectItem value="1.00">1.00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Exchange Rate Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Multi-Currency Support</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Multi-Currency</Label>
                    <p className="text-sm text-muted-foreground">Allow transactions in multiple currencies</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Update Exchange Rates</Label>
                    <p className="text-sm text-muted-foreground">Automatically fetch current exchange rates</p>
                  </div>
                  <Switch />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exchangeProvider">Exchange Rate Provider</Label>
                  <Select defaultValue="bank_of_tanzania">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_of_tanzania">Bank of Tanzania</SelectItem>
                      <SelectItem value="fixer">Fixer.io</SelectItem>
                      <SelectItem value="openexchange">Open Exchange Rates</SelectItem>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Currency History */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Recent Currency Changes</h4>
                  <Button variant="outline" size="sm">
                    View All Changes
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Changed to TZS</p>
                      <p className="text-sm text-muted-foreground">Set as primary currency</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Today, 2:30 PM
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Was USD</p>
                      <p className="text-sm text-muted-foreground">Previous primary currency</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      3 days ago
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Email Notifications</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Order Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified about new orders</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Inventory Alerts</Label>
                    <p className="text-sm text-muted-foreground">Low stock and inventory updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive daily sales summaries</p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <h4 className="font-medium">Push Notifications</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mobile Notifications</Label>
                    <p className="text-sm text-muted-foreground">Push notifications on mobile devices</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Browser Notifications</Label>
                    <p className="text-sm text-muted-foreground">Browser push notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Password</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                </div>
                <Button>Update Password</Button>

                <Separator />

                <h4 className="font-medium">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable 2FA</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Setup 2FA
                  </Button>
                </div>

                <Separator />

                <h4 className="font-medium">API Access</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">API Key</p>
                      <p className="text-sm text-muted-foreground">Created 2 days ago</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Key className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New API Key
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Third-party Integrations
              </CardTitle>
              <CardDescription>
                Connect with external services and platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { name: "Stripe", description: "Payment processing", status: "connected" },
                  { name: "QuickBooks", description: "Accounting software", status: "not_connected" },
                  { name: "Mailchimp", description: "Email marketing", status: "connected" },
                  { name: "Slack", description: "Team communication", status: "not_connected" },
                ].map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{integration.name}</h4>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                    <Button 
                      variant={integration.status === 'connected' ? 'outline' : 'default'}
                      size="sm"
                    >
                      {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}