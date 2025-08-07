import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, CreditCard, TrendingUp, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StoreCashFlow } from "@/components/store/StoreCashFlow";
import { StoreInventoryAlerts } from "@/components/store/StoreInventoryAlerts";
import { useQuery } from "@tanstack/react-query";
import type { Store } from "@shared/schema";

export default function StoreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: store, isLoading, error } = useQuery<Store>({
    queryKey: ['/api/stores', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error Loading Store</h1>
          <p className="text-muted-foreground mb-4">Failed to load store details. Please try again.</p>
          <Button onClick={() => navigate("/stores")} data-testid="button-back-to-stores">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stores
          </Button>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
          <p className="text-muted-foreground mb-4">The store you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/stores")} data-testid="button-back-to-stores-not-found">
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
          data-testid="button-back-to-stores"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-store-name">{store.name}</h1>
          <p className="text-muted-foreground text-lg" data-testid="text-store-tagline">{store.tagline}</p>
        </div>
      </div>

      {/* Business Metrics Cards */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">How is my business doing?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Sales */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-950/20 dark:to-orange-900/20 dark:border-orange-800/30" data-testid="card-todays-sales">
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
                <p className="text-4xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-todays-sales-amount">100,000</p>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium" data-testid="text-todays-sales-change">
                  +12% ↑ vs yesterday
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Today's Expenses */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-950/20 dark:to-red-900/20 dark:border-red-800/30" data-testid="card-todays-expenses">
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
                <p className="text-4xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-todays-expenses-amount">12,000</p>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium" data-testid="text-todays-expenses-change">
                  +12% ↑ vs yesterday
                </p>
              </div>
            </CardContent>
          </Card>

          {/* This Week Profit */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950/20 dark:to-green-900/20 dark:border-green-800/30" data-testid="card-week-profit">
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
                <p className="text-4xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-week-profit-amount">250,000</p>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium" data-testid="text-week-profit-change">
                  +2% This week
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pending Debts */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 dark:from-amber-950/20 dark:to-amber-900/20 dark:border-amber-800/30" data-testid="card-pending-debts">
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
                <p className="text-4xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-pending-debts-amount">74,000</p>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium" data-testid="text-pending-debts-status">
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