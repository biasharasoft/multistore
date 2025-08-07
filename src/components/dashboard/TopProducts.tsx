import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";

const topProducts = [
  {
    name: "iPhone 15 Pro Max",
    sales: 156,
    revenue: "TSh 234,000",
    progress: 92,
    trend: "+12%"
  },
  {
    name: "Samsung Galaxy S24 Ultra", 
    sales: 134,
    revenue: "TSh 189,500",
    progress: 78,
    trend: "+8%"
  },
  {
    name: "MacBook Pro M3",
    sales: 98,
    revenue: "TSh 245,000",
    progress: 65,
    trend: "+15%"
  },
  {
    name: "iPad Pro 11\"",
    sales: 87,
    revenue: "TSh 87,000",
    progress: 58,
    trend: "+5%"
  },
  {
    name: "AirPods Pro 2",
    sales: 234,
    revenue: "TSh 58,500",
    progress: 45,
    trend: "+3%"
  }
];

export function TopProducts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-success" />
          Top Products
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Best performing products this month
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {topProducts.map((product, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.sales} units sold • {product.revenue}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-success">
                    {product.trend}
                  </span>
                </div>
              </div>
              <Progress value={product.progress} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}