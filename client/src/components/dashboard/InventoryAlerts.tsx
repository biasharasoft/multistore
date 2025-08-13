import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function InventoryAlerts() {
  // Fetch real inventory alerts from the database
  const { data: inventoryAlerts = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/dashboard/inventory-alerts'],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
          Inventory Alerts
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Products running low across all stores
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading inventory alerts...</div>
        ) : inventoryAlerts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No inventory alerts at this time
          </div>
        ) : (
          <div className="space-y-4">
            {inventoryAlerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-card-border hover:bg-muted/30 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  alert.status === 'critical' 
                    ? 'bg-destructive/10' 
                    : 'bg-warning/10'
                }`}>
                  {alert.status === 'critical' ? (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  ) : (
                    <Package className="h-4 w-4 text-warning" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{alert.product}</p>
                  <p className="text-xs text-muted-foreground">SKU: {alert.sku}</p>
                  <p className="text-xs text-muted-foreground">{alert.store}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant={alert.status === 'critical' ? 'destructive' : 'secondary'}
                  className="mb-1"
                >
                  {alert.stock} left
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Min: {alert.minStock}
                </p>
              </div>
            </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}