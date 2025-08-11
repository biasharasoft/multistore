
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
import { useQuery } from "@tanstack/react-query";

interface ExpenseFormData {
  expenseDate: string;
  description: string;
  categoryId: string;
  amount: number;
  vendor: string;
  status: 'paid' | 'pending' | 'overdue';
  storeId: string;
  receipt?: string;
  notes?: string;
}

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
}

export function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [status, setStatus] = useState<'paid' | 'pending' | 'overdue'>('pending');
  const [storeId, setStoreId] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  // Fetch active expense categories
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/expenses-categories/active'],
  });

  // Fetch user stores
  const { data: stores = [] } = useQuery<any[]>({
    queryKey: ['/api/stores'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !categoryId || !amount || !vendor || !storeId) {
      return;
    }

    const formData: ExpenseFormData = {
      expenseDate: format(date, 'yyyy-MM-dd'),
      description,
      categoryId,
      amount: Math.round(parseFloat(amount) * 100), // Convert to cents
      vendor,
      status,
      storeId,
      receipt: receipt?.name,
      notes: notes.trim() || undefined
    };

    onSubmit(formData);
    
    // Reset form
    setDate(new Date());
    setDescription("");
    setCategoryId("");
    setAmount("");
    setVendor("");
    setStatus('pending');
    setStoreId("");
    setReceipt(null);
    setNotes("");
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
          <Select value={categoryId} onValueChange={setCategoryId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
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
          <Select value={storeId} onValueChange={setStoreId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
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

      {/* Notes (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes or comments..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
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
