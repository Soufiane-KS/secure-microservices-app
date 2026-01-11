"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCards } from "@/components/stats-cards";
import { RevenueChart } from "@/components/revenue-chart";
import { RecentOrders } from "@/components/recent-orders";
import { Sidebar } from "@/components/sidebar";
import { toast } from "sonner";
import {
  ShoppingCart,
  Package,
  Plus,
  Minus,
  Trash2,
  LogOut,
  ShoppingBag,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
  Search,
  Filter,
  Download,
  Edit,
  MoreVertical,
  Eye,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

interface OrderItem {
  id: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items?: OrderItem[];
}

interface DashboardProps {
  keycloak: any;
}

export default function Dashboard({ keycloak }: DashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedProducts, setSelectedProducts] = useState<OrderItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    customerName: "",
    customerEmail: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const itemsPerPage = 10;

  const isAdmin =
    keycloak.tokenParsed?.resource_access?.["react-client"]?.roles?.includes(
      "admin"
    );

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const loadProducts = async () => {
    try {
      await keycloak.updateToken(30);
      const response = await axios.get("http://localhost:8085/products", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    }
  };

  const loadOrders = async () => {
    try {
      await keycloak.updateToken(30);
      const response = await axios.get("http://localhost:8085/orders", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await keycloak.updateToken(30);
      await axios.patch(
        `http://localhost:8085/orders/${orderId}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      );
      toast.success(`Order #${orderId} updated to ${newStatus}`);
      loadOrders();
    } catch (error: any) {
      toast.error("Failed to update order status");
    }
  };

  const addProductToOrder = (product: Product) => {
    const existingItem = selectedProducts.find(
      (item) => item.id === product.id
    );
    if (existingItem) {
      setSelectedProducts(
        selectedProducts.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                totalPrice: (item.quantity + 1) * item.unitPrice,
              }
            : item
        )
      );
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          id: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: 1,
          totalPrice: product.price,
        },
      ]);
    }
    toast.success(`${product.name} added to cart`);
  };

  const updateProductQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSelectedProducts(
        selectedProducts.filter((item) => item.id !== productId)
      );
    } else {
      setSelectedProducts(
        selectedProducts.map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: newQuantity,
                totalPrice: newQuantity * item.unitPrice,
              }
            : item
        )
      );
    }
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => total + item.totalPrice, 0);
  };

  const createOrder = async () => {
    try {
      if (selectedProducts.length === 0) {
        toast.error("Please select at least one product");
        return;
      }
      await keycloak.updateToken(30);
      const orderData = {
        customerName: customerInfo.customerName,
        customerEmail: customerInfo.customerEmail,
        totalAmount: calculateTotal(),
        items: selectedProducts,
      };
      const response = await axios.post(
        "http://localhost:8085/orders",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(`Order #${response.data.id} created successfully!`);
      setSelectedProducts([]);
      setActiveView("orders");
      loadOrders();
    } catch (error: any) {
      toast.error("Failed to create order");
    }
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0)
      return <Badge variant="destructive">Out of Stock</Badge>;
    if (quantity < 10) return <Badge variant="secondary">Low Stock</Badge>;
    return <Badge variant="default">In Stock</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDING: "secondary",
      CONFIRMED: "default",
      SHIPPED: "default",
      DELIVERED: "default",
      CANCELLED: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  // Filter and pagination
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toString().includes(searchQuery);
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Calculate stats
  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <ShoppingBag className="h-8 w-8 text-purple-600" />
            <h1 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
              Secure Microservices
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                3
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                      {keycloak.idTokenParsed?.preferred_username
                        ?.charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">
                      {keycloak.idTokenParsed?.preferred_username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin ? "Administrator" : "User"}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => keycloak.logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          isAdmin={isAdmin}
        />

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-8">
          {/* Dashboard View */}
          {activeView === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                  Welcome back! Here's what's happening with your store.
                </p>
              </div>

              <StatsCards
                totalProducts={products.length}
                totalOrders={orders.length}
                totalRevenue={totalRevenue}
                pendingOrders={pendingOrders}
              />

              <div className="grid gap-4 md:grid-cols-7">
                <RevenueChart orders={orders} />
                <RecentOrders orders={orders} />
              </div>
            </div>
          )}

          {/* Products View */}
          {activeView === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Products
                  </h2>
                  <p className="text-muted-foreground">
                    Manage your product inventory
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Order</DialogTitle>
                      <DialogDescription>
                        Select products and create a new order
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* Customer Info */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Full Name
                          </label>
                          <Input
                            value={customerInfo.customerName}
                            onChange={(e) =>
                              setCustomerInfo({
                                ...customerInfo,
                                customerName: e.target.value,
                              })
                            }
                            placeholder="Enter customer name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <Input
                            type="email"
                            value={customerInfo.customerEmail}
                            onChange={(e) =>
                              setCustomerInfo({
                                ...customerInfo,
                                customerEmail: e.target.value,
                              })
                            }
                            placeholder="Enter customer email"
                          />
                        </div>
                      </div>

                      {/* Product Selection */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          Select Products
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {products.map((product) => (
                            <Card
                              key={product.id}
                              className="hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">
                                      {product.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      ${product.price} • Stock:{" "}
                                      {product.quantity}
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => addProductToOrder(product)}
                                    disabled={product.quantity === 0}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Selected Products */}
                      {selectedProducts.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Cart</h3>
                          <div className="space-y-2">
                            {selectedProducts.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <span className="font-medium">
                                  {item.productName}
                                </span>
                                <div className="flex items-center gap-3">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() =>
                                      updateProductQuantity(
                                        item.id,
                                        item.quantity - 1
                                      )
                                    }
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center font-bold">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() =>
                                      updateProductQuantity(
                                        item.id,
                                        item.quantity + 1
                                      )
                                    }
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-20 text-right font-semibold">
                                    ${item.totalPrice.toFixed(2)}
                                  </span>
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    onClick={() =>
                                      updateProductQuantity(item.id, 0)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
                            <span className="text-xl font-semibold">Total</span>
                            <span className="text-2xl font-bold">
                              ${calculateTotal().toFixed(2)}
                            </span>
                          </div>
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={createOrder}
                          >
                            Create Order
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="transition-all hover:shadow-xl hover:scale-[1.02]"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">
                          {product.name}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-3xl font-bold text-purple-600">
                          ${product.price}
                        </div>
                        {getStockBadge(product.quantity)}
                        <p className="text-sm text-muted-foreground">
                          Stock: {product.quantity} units
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => addProductToOrder(product)}
                        disabled={product.quantity === 0}
                      >
                        {product.quantity === 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Orders View */}
          {activeView === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
                  <p className="text-muted-foreground">
                    Manage and track all orders
                  </p>
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Orders Table */}
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.customerEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="font-semibold">
                          ${order.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {isAdmin && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateOrderStatus(order.id, "CONFIRMED")
                                    }
                                    disabled={order.status === "CONFIRMED"}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Confirm
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateOrderStatus(order.id, "SHIPPED")
                                    }
                                    disabled={order.status === "SHIPPED"}
                                  >
                                    <Truck className="mr-2 h-4 w-4" />
                                    Ship
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateOrderStatus(order.id, "DELIVERED")
                                    }
                                    disabled={order.status === "DELIVERED"}
                                  >
                                    <PackageCheck className="mr-2 h-4 w-4" />
                                    Deliver
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateOrderStatus(order.id, "CANCELLED")
                                    }
                                    disabled={order.status === "CANCELLED"}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredOrders.length)}{" "}
                  of {filteredOrders.length} results
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Settings View */}
          {activeView === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                  Manage your account settings and preferences
                </p>
              </div>

              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Username</label>
                        <Input
                          value={
                            keycloak.idTokenParsed?.preferred_username || ""
                          }
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          value={keycloak.idTokenParsed?.email || ""}
                          disabled
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Save Changes</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>
                        Manage how you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Notification settings coming soon...
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Manage your security preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Security settings managed by Keycloak
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog
          open={!!selectedOrder}
          onOpenChange={() => setSelectedOrder(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details #{selectedOrder.id}</DialogTitle>
              <DialogDescription>
                View complete information about this order
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Customer Name
                  </p>
                  <p className="font-semibold">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="font-semibold">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Order Date
                  </p>
                  <p className="font-semibold">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between rounded-md bg-muted p-3"
                      >
                        <span>
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="font-semibold">
                          ${item.totalPrice}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
                <span className="text-xl font-semibold">Total Amount</span>
                <span className="text-2xl font-bold">
                  ${selectedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
