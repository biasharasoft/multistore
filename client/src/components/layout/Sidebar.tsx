
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Settings, 
  Store, 
  Truck, 
  BarChart3,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Receipt
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/hooks/useStore";

type Store = {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { selectedStore, setSelectedStore } = useStore();

  // Fetch user data with role information
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Fetch user's accessible stores (role-based)
  const { data: stores = [], isLoading: storesLoading } = useQuery<Store[]>({
    queryKey: ['/api/stores'],
    enabled: !isCollapsed, // Only fetch when sidebar is expanded
  });

  // Auto-select store for non-admin users
  useEffect(() => {
    if (userData?.user && stores.length > 0) {
      const userRole = userData.user.role;
      const assignedStoreId = userData.user.assignedStoreId;
      
      // For non-admin roles, auto-select their assigned store
      if (userRole !== 'Admin' && userRole !== 'Owner' && assignedStoreId) {
        const assignedStore = stores.find(store => store.id === assignedStoreId);
        if (assignedStore && selectedStore !== assignedStoreId) {
          setSelectedStore(assignedStoreId);
        }
      }
      
      // If no store selected and user has stores, select the first one
      if (!selectedStore && stores.length > 0) {
        setSelectedStore(stores[0].id);
      }
    }
  }, [userData, stores, selectedStore, setSelectedStore]);

  const navigationItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: true
    },
    {
      title: "Stores",
      icon: Store,
      href: "/stores"
    },
    {
      title: "Products", 
      icon: Package,
      href: "/products"
    },
    {
      title: "Inventory",
      icon: BarChart3,
      href: "/inventory"
    },
    {
      title: "Suppliers",
      icon: Truck,
      href: "/suppliers"
    },
    {
      title: "Customers",
      icon: Users,
      href: "/customers"
    },
    {
      title: "Sales",
      icon: ShoppingCart,
      href: "/sales"
    },
    {
      title: "Purchase",
      icon: Truck,
      href: "/purchase"
    },
    {
      title: "Expenses",
      icon: Receipt,
      href: "/expenses"
    },
    {
      title: "POS",
      icon: CreditCard,
      href: "/pos"
    },
    {
      title: "Analytics",
      icon: TrendingUp,
      href: "/analytics"
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings"
    }
  ];

  return (
    <div 
      className={cn(
        "flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-sidebar-foreground">BiasharaSoft</h1>
              <p className="text-xs text-sidebar-foreground/60">Multi-Store Management</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-border transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-sidebar-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = item.href;
              }}
              className={cn(
                "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                item.active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-border hover:text-sidebar-foreground",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
              {!isCollapsed && item.title}
            </a>
          );
        })}
      </nav>

      {/* Store Selector - collapsed state */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="bg-sidebar-border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-sidebar-foreground">
                Current Store
                {userData?.user?.role && userData.user.role !== 'Owner' && (
                  <span className="ml-1 text-xs text-sidebar-foreground/60">
                    ({userData.user.role})
                  </span>
                )}
              </span>
              <Store className="h-4 w-4 text-sidebar-foreground/60" />
            </div>
            <select 
              className="w-full bg-transparent text-sm text-sidebar-foreground border-none outline-none"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              data-testid="select-current-store"
              disabled={userData?.user?.role && userData.user.role !== 'Admin' && userData.user.role !== 'Owner'}
            >
              <option value="">
                {storesLoading ? "Loading stores..." : stores.length === 0 ? "No stores available" : "Select a store"}
              </option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                  {userData?.user?.assignedStoreId === store.id && userData?.user?.role !== 'Owner' && userData?.user?.role !== 'Admin' && (
                    " (Assigned)"
                  )}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
