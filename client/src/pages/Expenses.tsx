import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseStats } from "@/components/expenses/ExpenseStats";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";

interface Expense {
  id: string;
  expenseDate: string;
  description: string;
  categoryId: string;
  amount: number;  // In cents
  vendor: string;
  status: 'paid' | 'pending' | 'overdue';
  receiptUrl?: string;
  receiptFileName?: string;
  storeId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [isViewExpenseOpen, setIsViewExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch expenses
  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery<Expense[]>({
    queryKey: ['/api/expenses'],
  });

  // Fetch categories and stores for filtering
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/expenses-categories/active'],
  });

  const { data: stores = [] } = useQuery<any[]>({
    queryKey: ['/api/stores'],
  });

  // Fetch company information to get currency setting
  const { data: company } = useQuery<any>({
    queryKey: ['/api/company'],
  });
  
  const statuses = ['all', 'paid', 'pending', 'overdue'];
  
  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      return await apiRequest('/api/expenses', {
        method: 'POST',
        body: JSON.stringify(expenseData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      setIsAddExpenseOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create expense",
        variant: "destructive",
      });
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      return await apiRequest(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ expenseId, expenseData }: { expenseId: string; expenseData: any }) => {
      return await apiRequest(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      setIsEditExpenseOpen(false);
      setSelectedExpense(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update expense",
        variant: "destructive",
      });
    },
  });
  
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || expense.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === "all" || expense.status === selectedStatus;
    const matchesStore = selectedStore === "all" || expense.storeId === selectedStore;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesStore;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddExpense = (expenseData: any) => {
    createExpenseMutation.mutate(expenseData);
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsViewExpenseOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditExpenseOpen(true);
  };

  const handleUpdateExpense = (expenseData: any) => {
    if (selectedExpense) {
      updateExpenseMutation.mutate({
        expenseId: selectedExpense.id,
        expenseData
      });
    }
  };

  const handleDeleteExpense = (expense: Expense) => {
    if (window.confirm(`Are you sure you want to delete the expense "${expense.description}"?`)) {
      deleteExpenseMutation.mutate(expense.id);
    }
  };

  const formatAmount = (amountInCents: number) => {
    const currency = company?.currency || 'tzs';
    return formatCurrency(amountInCents, currency);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : storeId;
  };

  if (isLoadingExpenses) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Expenses</h1>
            <p className="text-muted-foreground">Loading expenses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage all your business expenses
          </p>
        </div>
        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-expense">
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Record a new business expense with all relevant details.
              </DialogDescription>
            </DialogHeader>
            <ExpenseForm onSubmit={handleAddExpense} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(expenses.reduce((sum, expense) => sum + expense.amount, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(expenses.filter(e => e.status === 'paid').reduce((sum, expense) => sum + expense.amount, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(expenses.filter(e => e.status === 'pending').reduce((sum, expense) => sum + expense.amount, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(expenses.filter(e => e.status === 'overdue').reduce((sum, expense) => sum + expense.amount, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              data-testid="input-search-expenses"
            />
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedStore} onValueChange={setSelectedStore}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-store">
            <SelectValue placeholder="Store" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
              <p className="text-muted-foreground mb-4">
                {expenses.length === 0 
                  ? "Start by adding your first business expense."
                  : "Try adjusting your search criteria."
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {format(new Date(expense.expenseDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={expense.description}>
                        {expense.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCategoryName(expense.categoryId)}
                    </TableCell>
                    <TableCell>{expense.vendor}</TableCell>
                    <TableCell>
                      {getStoreName(expense.storeId)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatAmount(expense.amount)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(expense.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewExpense(expense)}
                          data-testid={`button-view-expense-${expense.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditExpense(expense)}
                          data-testid={`button-edit-expense-${expense.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteExpense(expense)}
                          data-testid={`button-delete-expense-${expense.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Expense Dialog */}
      <Dialog open={isViewExpenseOpen} onOpenChange={setIsViewExpenseOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
            <DialogDescription>
              View expense information and details
            </DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedExpense.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <p className="text-sm text-muted-foreground mt-1">{formatAmount(selectedExpense.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(selectedExpense.expenseDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <p className="text-sm text-muted-foreground mt-1">{getCategoryName(selectedExpense.categoryId)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Vendor</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedExpense.vendor}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Store</label>
                  <p className="text-sm text-muted-foreground mt-1">{getStoreName(selectedExpense.storeId)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedExpense.status)}</div>
                </div>
              </div>
              {selectedExpense.notes && (
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedExpense.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditExpenseOpen} onOpenChange={setIsEditExpenseOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update expense information and details
            </DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <ExpenseForm
              onSubmit={handleUpdateExpense}
              initialData={{
                description: selectedExpense.description,
                amount: selectedExpense.amount / 100, // Convert cents to dollars for form
                expenseDate: selectedExpense.expenseDate,
                categoryId: selectedExpense.categoryId,
                vendor: selectedExpense.vendor,
                storeId: selectedExpense.storeId,
                status: selectedExpense.status,
                notes: selectedExpense.notes || '',
              }}
              isLoading={updateExpenseMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}