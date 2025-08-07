import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, CreditCard, TrendingUp, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StoreCashFlow } from "@/components/store/StoreCashFlow";
import { StoreInventoryAlerts } from "@/components/store/StoreInventoryAlerts";

// Mock store data - in real app, this would come from API
const mockStores = {
  "1": {
    id: "1",
    name: "Downtown Store",
    tagline: "Your neighborhood electronics destination",
    address: "123 Main Street, New York, NY 10001",
    manager: "Sarah Johnson",
    status: "open"
  },
  "2": {
    id: "2", 
    name: "Mall Location",
    tagline: "Shopping made convenient",
    address: "456 Shopping Center Blvd, Los Angeles, CA 90210",
    manager: "Mike Chen",
    status: "open"
  },
  "3": {
    id: "3",
    name: "Airport Terminal",
    tagline: "Travel tech essentials",
    address: "789 Airport Way, Chicago, IL 60601", 
    manager: "Emily Rodriguez",
    status: "maintenance"
  },
  "4": {
    id: "4",
    name: "Suburban Plaza", 
    tagline: "Serving the community since 2015",
    address: "321 Suburban Road, Houston, TX 77001",
    manager: "David Wilson", 
    status: "closed"
  }
};

export default function StoreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const store = mockStores[id as keyof typeof mockStores];

  if (!store) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
          <p className="text-muted-foreground mb-4">The store you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/stores")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stores
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate("/stores")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{store.name}</h1>
          <p className="text-muted-foreground text-lg">{store.tagline}</p>
        </div>
      </div>

      {/* Business Metrics Cards */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">How is my business doing?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Sales */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-950/20 dark:to-orange-900/20 dark:border-orange-800/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Today's sales</h3>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">100,000</p>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  +12% ↑ vs yesterday
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Today's Expenses */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-950/20 dark:to-red-900/20 dark:border-red-800/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Today's Expenses</h3>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">12,000</p>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  +12% ↑ vs yesterday
                </p>
              </div>
            </CardContent>
          </Card>

          {/* This Week Profit */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950/20 dark:to-green-900/20 dark:border-green-800/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">This Week Profit</h3>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">250,000</p>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  +2% This week
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pending Debts */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 dark:from-amber-950/20 dark:to-amber-900/20 dark:border-amber-800/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <Bell className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Pending Debts</h3>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">74,000</p>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  2 Due Today
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <StoreCashFlow storeId={id!} />

      {/* Inventory Alerts */}
      <StoreInventoryAlerts storeId={id!} />
    </div>
  );
}