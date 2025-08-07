
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpenseFormData {
  date: string;
  description: string;
  category: string;
  amount: number;
  vendor: string;
  status: 'paid' | 'pending' | 'overdue';
  store: string;
  receipt?: string;
}

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
}

export function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [status, setStatus] = useState<'paid' | 'pending' | 'overdue'>('pending');
  const [store, setStore] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !category || !amount || !vendor || !store) {
      return;
    }

    const formData: ExpenseFormData = {
      date: format(date, 'yyyy-MM-dd'),
      description,
      category,
      amount: parseFloat(amount),
      vendor,
      status,
      store,
      receipt: receipt?.name
    };

    onSubmit(formData);
    
    // Reset form
    setDate(new Date());
    setDescription("");
    setCategory("");
    setAmount("");
    setVendor("");
    setStatus('pending');
    setStore("");
    setReceipt(null);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceipt(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date */}
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (TSh)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter expense description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Vendor */}
        <div className="space-y-2">
          <Label htmlFor="vendor">Vendor</Label>
          <Input
            id="vendor"
            placeholder="Enter vendor name"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Store */}
        <div className="space-y-2">
          <Label>Store</Label>
          <Select value={store} onValueChange={setStore} required>
            <SelectTrigger>
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((storeName) => (
                <SelectItem key={storeName} value={storeName}>
                  {storeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(value: 'paid' | 'pending' | 'overdue') => setStatus(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Receipt Upload */}
      <div className="space-y-2">
        <Label>Receipt (Optional)</Label>
        <div className="flex items-center gap-4">
          <Label 
            htmlFor="receipt-upload"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            {receipt ? "Change Receipt" : "Upload Receipt"}
          </Label>
          <Input
            id="receipt-upload"
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleReceiptUpload}
          />
          {receipt && (
            <span className="text-sm text-muted-foreground">
              {receipt.name}
            </span>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="min-w-32">
          Add Expense
        </Button>
      </div>
    </form>
  );
}
