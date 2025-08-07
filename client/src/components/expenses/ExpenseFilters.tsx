
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface ExpenseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedStore: string;
  onStoreChange: (value: string) => void;
}

export function ExpenseFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedStore,
  onStoreChange
}: ExpenseFiltersProps) {
  const categories = [
    "Office Supplies",
    "Rent",
    "Utilities",
    "Marketing",
    "Maintenance",
    "Travel",
    "Software",
    "Equipment"
  ];

  const stores = [
    "Downtown Branch",
    "Mall Location",
    "Airport Store"
  ];

  const hasActiveFilters = selectedCategory !== "all" || selectedStatus !== "all" || selectedStore !== "all" || searchTerm;

  const clearFilters = () => {
    onSearchChange("");
    onCategoryChange("all");
    onStatusChange("all");
    onStoreChange("all");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card p-4 rounded-lg border">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search expenses, vendors..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
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

        {/* Status Filter */}
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        {/* Store Filter */}
        <Select value={selectedStore} onValueChange={onStoreChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Stores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store} value={store}>
                {store}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
