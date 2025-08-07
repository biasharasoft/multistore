import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const recentSales = [
  {
    customer: "Alice Johnson",
    email: "alice@example.com", 
    amount: "+TSh 1,999.00",
    avatar: "/placeholder.svg",
    time: "2 minutes ago"
  },
  {
    customer: "Bob Wilson", 
    email: "bob@example.com",
    amount: "+TSh 39.00",
    avatar: "/placeholder.svg", 
    time: "5 minutes ago"
  },
  {
    customer: "Charlie Brown",
    email: "charlie@example.com",
    amount: "+TSh 299.00", 
    avatar: "/placeholder.svg",
    time: "12 minutes ago"
  },
  {
    customer: "Diana Prince",
    email: "diana@example.com", 
    amount: "+TSh 99.00",
    avatar: "/placeholder.svg",
    time: "25 minutes ago"
  },
  {
    customer: "Edward Smith",
    email: "edward@example.com",
    amount: "+TSh 159.00",
    avatar: "/placeholder.svg",
    time: "1 hour ago"
  }
];

export function RecentSales() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentSales.map((sale, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={sale.avatar} alt={sale.customer} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {sale.customer.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{sale.customer}</p>
                  <p className="text-xs text-muted-foreground">{sale.email}</p>
                  <p className="text-xs text-muted-foreground">{sale.time}</p>
                </div>
              </div>
              <div className="text-sm font-semibold text-success">
                {sale.amount}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}