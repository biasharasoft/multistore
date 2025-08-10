import { useState, useEffect } from "react";
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
import { ObjectUploader } from "@/components/ObjectUploader";
import { type ProductsCategory, type InsertProductsCategory, type ExpensesCategory, type InsertExpensesCategory, type Company, type InsertCompany } from "@shared/schema";
import type { UploadResult } from "@uppy/core";
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

  // Team member invitation states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviteStore, setInviteStore] = useState("");

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

  // Fetch current user data
  const { data: userAuth } = useQuery<{ user: { id: string; email: string; firstName?: string; lastName?: string; phone?: string } }>({
    queryKey: ['/api/auth/me'],
  });

  // Fetch team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['/api/team-members'],
  });

  // Fetch user stores
  const { data: userStores = [] } = useQuery({
    queryKey: ['/api/stores'],
  });

  // Fetch user's stores from database
  const { data: stores = [] } = useQuery<any[]>({
    queryKey: ['/api/stores'],
  });

  // Fetch company data
  const { data: companyData } = useQuery<Company>({
    queryKey: ['/api/companies'],
  });

  // Fetch appearance settings data
  const { data: appearanceData } = useQuery<{ darkMode: boolean; compactView: boolean; language: string }>({
    queryKey: ['/api/appearance-settings'],
  });

  // Fetch industries data
  const { data: industries = [], isLoading: isLoadingIndustries, error: industriesError } = useQuery<any[]>({
    queryKey: ['/api/industries-categories'],
  });

  // Debug log for industries data
  useEffect(() => {
    console.log('Industries data:', industries);
    console.log('Industries loading:', isLoadingIndustries);
    if (industriesError) {
      console.error('Industries error:', industriesError);
    }
  }, [industries, isLoadingIndustries, industriesError]);

  // Profile form states
  const [firstName, setFirstName] = useState(userAuth?.user?.firstName || "");
  const [lastName, setLastName] = useState(userAuth?.user?.lastName || "");
  const [email, setEmail] = useState(userAuth?.user?.email || "");
  const [phone, setPhone] = useState(userAuth?.user?.phone || "");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  // Debug log for user data and phone field
  useEffect(() => {
    console.log('User auth data:', userAuth);
    console.log('Phone value from user:', userAuth?.user?.phone);
    console.log('Current phone state:', phone);
  }, [userAuth, phone]);

  // Company form states
  const [companyName, setCompanyName] = useState(companyData?.name || "");
  const [industry, setIndustry] = useState(companyData?.industry || "");
  const [website, setWebsite] = useState(companyData?.website || "");
  const [businessAddress, setBusinessAddress] = useState(companyData?.address || "");
  const [currency, setCurrency] = useState(companyData?.currency || "tzs");

  // Appearance form states
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [language, setLanguage] = useState("en");

  // Populate form fields when user data is loaded
  useEffect(() => {
    if (userAuth?.user) {
      setFirstName(userAuth.user.firstName || "");
      setLastName(userAuth.user.lastName || "");
      setEmail(userAuth.user.email || "");
      setPhone(userAuth.user.phone || "");
    }
  }, [userAuth]);

  // Populate form fields when company data is loaded
  useEffect(() => {
    if (companyData) {
      setCompanyName(companyData.name || "");
      setIndustry(companyData.industry || "");
      setWebsite(companyData.website || "");
      setBusinessAddress(companyData.address || "");
      setCurrency(companyData.currency || "tzs");
    }
  }, [companyData]);

  // Populate appearance settings when data is loaded
  useEffect(() => {
    if (appearanceData) {
      setDarkMode(appearanceData.darkMode || false);
      setCompactView(appearanceData.compactView || false);
      setLanguage(appearanceData.language || "en");
    }
  }, [appearanceData]);

  // Profile image upload handlers
  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest('/api/objects/upload', {
        method: 'POST',
      });
      return {
        method: 'PUT' as const,
        url: response.uploadURL,
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get upload URL",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = uploadedFile.uploadURL;
      
      try {
        // Update user profile with the uploaded image
        await apiRequest('/api/users/profile', {
          method: 'PUT',
          body: JSON.stringify({
            profileImageURL: uploadURL
          }),
        });
        
        setProfileImageUrl(uploadURL || '');
        
        // Invalidate user auth query to refresh profile data
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        
        toast({
          title: "Success",
          description: "Profile image updated successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update profile image",
          variant: "destructive",
        });
      }
    }
  };


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

  // Save user profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; email: string; phone: string }) => {
      return await apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      // Refresh user data to update form fields
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/auth/me'] });
      }, 100);
      toast({
        title: "Success",
        description: "Profile information has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile information. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save company mutation
  const saveCompanyMutation = useMutation({
    mutationFn: async (data: InsertCompany) => {
      return await apiRequest('/api/companies', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Success",
        description: "Company information has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error saving company:', error);
      toast({
        title: "Error",
        description: "Failed to save company information. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save appearance settings mutation
  const saveAppearanceMutation = useMutation({
    mutationFn: async (data: { darkMode: boolean; compactView: boolean; language: string }) => {
      return await apiRequest('/api/appearance-settings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appearance settings have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error saving appearance settings:', error);
      toast({
        title: "Error",
        description: "Failed to save appearance settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send team member invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: async (data: { email: string; name: string; role: string; storeName?: string }) => {
      return await apiRequest('/api/team-members/invite', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
      setInviteEmail("");
      setInviteName("");
      setInviteRole("viewer");
      setInviteStore("");
      setIsAddMemberOpen(false);
      toast({
        title: "Success",
        description: "Team member invitation sent successfully.",
      });
    },
    onError: (error) => {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
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



  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Handler for sending team member invitation
  const handleSendInvitation = () => {
    if (!inviteEmail.trim() || !inviteName.trim()) {
      toast({
        title: "Error",
        description: "Email and name are required.",
        variant: "destructive",
      });
      return;
    }

    sendInvitationMutation.mutate({
      email: inviteEmail,
      name: inviteName,
      role: inviteRole,
      storeName: inviteStore || undefined,
    });
  };

  // Comprehensive save handler
  const handleSaveAllSettings = async () => {
    try {
      // Save all three sections concurrently
      await Promise.all([
        // Save profile information
        saveProfileMutation.mutateAsync({
          firstName,
          lastName,
          email,
          phone,
        }),
        // Save company information
        saveCompanyMutation.mutateAsync({
          name: companyName,
          industry,
          website,
          address: businessAddress,
          currency,
        }),
        // Save appearance settings
        saveAppearanceMutation.mutateAsync({
          darkMode,
          compactView,
          language,
        }),
      ]);

      toast({
        title: "Success",
        description: "All settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save some settings. Please try again.",
        variant: "destructive",
      });
    }
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

  const handleSaveCompany = () => {
    if (!companyName.trim()) {
      toast({
        title: "Error",
        description: "Company name is required.",
        variant: "destructive",
      });
      return;
    }

    saveCompanyMutation.mutate({
      name: companyName.trim(),
      industry: industry || undefined,
      website: website || undefined,
      address: businessAddress || undefined,
      currency: currency,
    });
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
        <Button 
          onClick={handleSaveAllSettings}
          disabled={saveProfileMutation.isPending || saveCompanyMutation.isPending || saveAppearanceMutation.isPending}
          data-testid="button-save-changes"
        >
          <Save className="h-4 w-4 mr-2" />
          {(saveProfileMutation.isPending || saveCompanyMutation.isPending || saveAppearanceMutation.isPending) ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
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
                    <AvatarFallback>
                      {userAuth?.user?.firstName?.charAt(0) || ""}{userAuth?.user?.lastName?.charAt(0) || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={5242880} // 5MB
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={handleUploadComplete}
                      buttonClassName="h-9"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </ObjectUploader>
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
                      <Input 
                        id="firstName" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        data-testid="input-first-name" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        data-testid="input-last-name" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="input-email" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      data-testid="input-phone" 
                    />
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
                  <Input 
                    id="companyName" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                    data-testid="input-company-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger data-testid="select-industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries && industries.length > 0 ? (
                        industries.map((industryItem: any) => (
                          <SelectItem key={industryItem.id} value={industryItem.name}>
                            {industryItem.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>Loading industries...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourcompany.com"
                    data-testid="input-website"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea 
                    id="address" 
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="Enter business address"
                    rows={3}
                    data-testid="textarea-address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger data-testid="select-currency">
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
                <Switch 
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact View</Label>
                  <p className="text-sm text-muted-foreground">Use compact spacing in tables and lists</p>
                </div>
                <Switch 
                  checked={compactView}
                  onCheckedChange={setCompactView}
                />
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
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
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                          placeholder="Enter full name"
                          data-testid="input-member-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memberEmail">Email Address</Label>
                        <Input
                          id="memberEmail"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="Enter email address"
                          data-testid="input-member-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memberRole">Role</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger data-testid="select-member-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memberStore">Assign Store (Optional)</Label>
                        <Select value={inviteStore} onValueChange={setInviteStore}>
                          <SelectTrigger data-testid="select-member-store">
                            <SelectValue placeholder="Select store (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No specific store</SelectItem>
                            {userStores.map((store) => (
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
                      <Button 
                        onClick={handleSendInvitation}
                        disabled={sendInvitationMutation.isPending}
                        data-testid="button-send-invitation"
                      >
                        {sendInvitationMutation.isPending ? "Sending..." : "Send Invitation"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No team members yet</p>
                    <p className="text-sm">Start by inviting team members to join your organization</p>
                  </div>
                ) : (
                  teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                           {member.storeName && (
                             <p className="text-xs text-muted-foreground flex items-center mt-1">
                               <Store className="h-3 w-3 mr-1" />
                               {member.storeName}
                             </p>
                           )}
                         </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{member.role}</Badge>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                        <Button variant="outline" size="sm" data-testid={`button-edit-member-${member.id}`}>
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


      </Tabs>
    </div>
  );
}