import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/currency";

export function TopProducts() {
  // Fetch real top products data from the database
  const { data: topProducts = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/dashboard/top-products'],
  });

  // Fetch company info for currency
  const { data: company } = useQuery<any>({
    queryKey: ['/api/company'],
  });

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
        {isLoading ? (
          <div className="text-center py-4">Loading top products...</div>
        ) : topProducts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No product data available yet
          </div>
        ) : (
          <div className="space-y-6">
            {topProducts.map((product, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.sales} units sold • {company?.currency ? formatCurrency(product.revenue / 100, company.currency) : `$${(product.revenue / 100).toFixed(2)}`}
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
        )}
      </CardContent>
    </Card>
  );
}