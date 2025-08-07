
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";

interface Expense {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  category: string;
}

interface ExpenseStatsProps {
  expenses: Expense[];
}

export function ExpenseStats({ expenses }: ExpenseStatsProps) {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const paidExpenses = expenses
    .filter(expense => expense.status === 'paid')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = expenses
    .filter(expense => expense.status === 'pending')
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthlyExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const stats = [
    {
      title: "Total Expenses",
      value: `TSh ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "All time expenses",
      trend: "+12% from last month",
      trendUp: true
    },
    {
      title: "Paid Expenses",
      value: `TSh ${paidExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      description: "Successfully paid",
      trend: "+8% from last month",
      trendUp: true
    },
    {
      title: "Pending Expenses",
      value: `TSh ${pendingExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingDown,
      description: "Awaiting payment",
      trend: "-3% from last month",
      trendUp: false
    },
    {
      title: "This Month",
      value: `TSh ${monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Calendar,
      description: "Current month expenses",
      trend: "+15% from last month",
      trendUp: true
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              <div className={`flex items-center text-xs mt-2 ${
                stat.trendUp ? 'text-success' : 'text-destructive'
              }`}>
                {stat.trendUp ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {stat.trend}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
