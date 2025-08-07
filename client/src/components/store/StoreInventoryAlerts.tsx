import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";

interface StoreInventoryAlertsProps {
  storeId: string;
}

export function StoreInventoryAlerts({ storeId }: StoreInventoryAlertsProps) {
  // Mock data based on store ID - in real app, this would come from API
  const getStoreInventoryAlerts = (id: string) => {
    const storeAlerts = {
      "1": [
        {
          product: "iPhone 15 Pro",
          sku: "IP15-PRO-256",
          stock: 3,
          minStock: 10,
          status: "critical" as const
        },
        {
          product: "AirPods Pro 2",
          sku: "APP2-USBC",
          stock: 5,
          minStock: 25,
          status: "critical" as const
        },
        {
          product: "iPad Air M2",
          sku: "IPA-M2-256",
          stock: 12,
          minStock: 20,
          status: "low" as const
        }
      ],
      "2": [
        {
          product: "Samsung Galaxy S24",
          sku: "SGS24-128",
          stock: 8,
          minStock: 15,
          status: "low" as const
        },
        {
          product: "Galaxy Buds Pro",
          sku: "GBP-2024",
          stock: 6,
          minStock: 20,
          status: "critical" as const
        }
      ],
      "3": [
        {
          product: "MacBook Air M3",
          sku: "MBA-M3-512",
          stock: 2,
          minStock: 8,
          status: "critical" as const
        },
        {
          product: "Travel Adapter",
          sku: "TA-UNIVERSAL",
          stock: 15,
          minStock: 30,
          status: "low" as const
        }
      ],
      "4": [
        {
          product: "Gaming Headset",
          sku: "GH-PRO-X",
          stock: 4,
          minStock: 12,
          status: "critical" as const
        },
        {
          product: "Wireless Charger",
          sku: "WC-FAST-15W",
          stock: 11,
          minStock: 18,
          status: "low" as const
        },
        {
          product: "Phone Case Pro",
          sku: "PC-CLEAR-PRO",
          stock: 7,
          minStock: 25,
          status: "critical" as const
        }
      ]
    };

    return storeAlerts[id as keyof typeof storeAlerts] || [];
  };

  const alerts = getStoreInventoryAlerts(storeId);
  const criticalCount = alerts.filter(alert => alert.status === 'critical').length;
  const lowCount = alerts.filter(alert => alert.status === 'low').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
          Inventory Alerts
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {alerts.length > 0 
            ? `${criticalCount} critical, ${lowCount} low stock items`
            : "All inventory levels are healthy"
          }
        </p>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
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
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No inventory alerts for this store</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}