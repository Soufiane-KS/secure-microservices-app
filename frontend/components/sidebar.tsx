"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  BarChart3,
  Users,
  Bell,
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isAdmin: boolean;
}

export function Sidebar({ activeView, onViewChange, isAdmin }: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      adminOnly: false,
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      adminOnly: false,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      adminOnly: true,
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      adminOnly: true,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      adminOnly: false,
    },
  ];

  const filteredItems = menuItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="hidden md:flex h-full w-64 flex-col fixed left-0 top-16 bottom-0 border-r bg-muted/10">
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-1 px-4">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-muted",
                  activeView === item.id
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
