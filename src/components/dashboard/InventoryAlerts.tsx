import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";

const inventoryAlerts = [
  {
    product: "iPhone 15 Pro",
    sku: "IP15-PRO-256",
    stock: 3,
    minStock: 10,
    status: "critical",
    store: "Downtown Branch"
  },
  {
    product: "Samsung Galaxy S24",
    sku: "SGS24-128",
    stock: 8,
    minStock: 15,
    status: "low",
    store: "Mall Location"
  },
  {
    product: "MacBook Air M3",
    sku: "MBA-M3-512",
    stock: 12,
    minStock: 20,
    status: "low",
    store: "Airport Store"
  },
  {
    product: "AirPods Pro 2",
    sku: "APP2-USBC",
    stock: 5,
    minStock: 25,
    status: "critical",
    store: "Downtown Branch"
  }
];

export function InventoryAlerts() {
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
      </CardContent>
    </Card>
  );
}