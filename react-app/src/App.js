import axios from "axios";
import React, { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import {
  ShoppingCart,
  Package,
  Plus,
  Minus,
  Trash2,
  LogOut,
  User,
  ShoppingBag,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
} from "lucide-react";
import "./App.css";

function App({ keycloak }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showProducts, setShowProducts] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    customerName: "",
    customerEmail: "",
  });

  useEffect(() => {
    loadProducts();
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
    }
  };

  const callProducts = async () => {
    try {
      await loadProducts();
      setShowProducts(true);
      setShowOrders(false);
      setShowOrderForm(false);
      setMessage("Products loaded successfully!");
    } catch (error) {
      setMessage("Error loading products: " + error.message);
    }
  };

  const callOrders = async () => {
    try {
      await keycloak.updateToken(30);
      const response = await axios.get("http://localhost:8085/orders", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      setOrders(response.data);
      setShowOrders(true);
      setShowProducts(false);
      setShowOrderForm(false);
      setMessage("Orders loaded successfully!");
    } catch (error) {
      setMessage("Error loading orders: " + error.message);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await keycloak.updateToken(30);
      await axios.patch(
        `http://localhost:8085/orders/${orderId}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      );
      setMessage(`Order #${orderId} status updated to ${newStatus}!`);
      callOrders();
    } catch (error) {
      setMessage(`Error updating order status: ${error.message}`);
    }
  };

  const showCreateOrderForm = () => {
    setShowOrderForm(true);
    setShowProducts(false);
    setShowOrders(false);
    setCustomerInfo({
      customerName: keycloak.tokenParsed?.preferred_username || "",
      customerEmail: keycloak.tokenParsed?.email || "",
    });
    setSelectedProducts([]);
  };

  const addProductToOrder = (product) => {
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
  };

  const updateProductQuantity = (productId, newQuantity) => {
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
        setMessage("Please select at least one product");
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
      setMessage("Order created successfully! Order ID: " + response.data.id);
      setShowOrderForm(false);
      setSelectedProducts([]);
      callOrders();
    } catch (error) {
      setMessage("Error creating order: " + error.message);
    }
  };

  const getStockBadge = (quantity) => {
    if (quantity === 0)
      return <Badge variant="destructive">Out of Stock</Badge>;
    if (quantity < 10) return <Badge variant="warning">Low Stock</Badge>;
    return <Badge variant="success">In Stock</Badge>;
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: "warning",
      CONFIRMED: "secondary",
      SHIPPED: "default",
      DELIVERED: "success",
      CANCELLED: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const isAdmin =
    keycloak.tokenParsed?.resource_access?.["react-client"]?.roles?.includes(
      "admin"
    );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="app-header">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <ShoppingBag className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold gradient-text">
              Secure Microservices
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full bg-secondary px-4 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                {keycloak.idTokenParsed?.preferred_username
                  ?.charAt(0)
                  .toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">
                  {keycloak.idTokenParsed?.preferred_username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {keycloak.idTokenParsed?.email}
                </p>
              </div>
            </div>
            <Button variant="destructive" onClick={() => keycloak.logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Message Alert */}
        {message && (
          <Card className="mb-6 border-l-4 border-l-purple-600 bg-purple-50">
            <CardContent className="py-4">
              <p className="text-sm font-medium">{message}</p>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Button size="lg" onClick={callProducts} className="h-auto py-6">
            <Package className="mr-2 h-5 w-5" />
            <span className="text-lg">View Products</span>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={callOrders}
            className="h-auto py-6"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            <span className="text-lg">My Orders</span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={showCreateOrderForm}
            className="h-auto py-6 border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            <User className="mr-2 h-5 w-5" />
            <span className="text-lg">Create Order</span>
          </Button>
        </div>

        {/* Products View */}
        {showProducts && (
          <div>
            <h2 className="mb-6 text-3xl font-bold">
              Available Products ({products.length})
            </h2>
            <div className="product-grid">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="transition-all hover:shadow-xl"
                >
                  <CardHeader>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
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
                      {product.quantity === 0 ? "Out of Stock" : "Add to Order"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Order Form */}
        {showOrderForm && (
          <div className="mx-auto max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Create New Order</CardTitle>
                <CardDescription>
                  Fill in your details and select products
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Customer Information
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input
                        value={customerInfo.customerName}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            customerName: e.target.value,
                          })
                        }
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={customerInfo.customerEmail}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            customerEmail: e.target.value,
                          })
                        }
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Selection */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Select Products</h3>
                  <div className="product-grid">
                    {products.map((product) => (
                      <Card key={product.id}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            {product.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-xl font-bold text-purple-600">
                            ${product.price}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Stock: {product.quantity}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => addProductToOrder(product)}
                            disabled={product.quantity === 0}
                          >
                            Add
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Selected Products */}
                {selectedProducts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Selected Products</h3>
                    <div className="space-y-3">
                      {selectedProducts.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="flex items-center justify-between p-4">
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
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      <CardContent className="flex items-center justify-between p-6">
                        <span className="text-xl font-semibold">
                          Order Total
                        </span>
                        <span className="text-3xl font-bold">
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-4">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={createOrder}
                  disabled={selectedProducts.length === 0}
                >
                  Place Order ${calculateTotal().toFixed(2)}
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  variant="outline"
                  onClick={() => setShowOrderForm(false)}
                >
                  Cancel
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Orders View */}
        {showOrders && (
          <div>
            <h2 className="mb-6 text-3xl font-bold">
              My Orders ({orders.length})
            </h2>
            {orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Package className="mb-4 h-16 w-16 text-muted-foreground" />
                  <p className="text-xl text-muted-foreground">
                    No orders found
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <Card key={order.id} className="order-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Order #{order.id}</CardTitle>
                        {getStatusBadge(order.status)}
                      </div>
                      <CardDescription>
                        {order.customerName} • {order.customerEmail}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Date
                          </p>
                          <p className="font-semibold">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Total Amount
                          </p>
                          <p className="text-2xl font-bold text-purple-600">
                            ${order.totalAmount}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Items
                          </p>
                          <p className="font-semibold">
                            {order.items?.length || 0} items
                          </p>
                        </div>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div>
                          <h4 className="mb-2 font-semibold">Order Items:</h4>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between rounded-md bg-secondary p-3"
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

                      {isAdmin && (
                        <Card className="border-2 border-dashed border-purple-300 bg-purple-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base text-purple-700">
                              Admin Controls
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  updateOrderStatus(order.id, "CONFIRMED")
                                }
                                disabled={order.status === "CONFIRMED"}
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateOrderStatus(order.id, "SHIPPED")
                                }
                                disabled={order.status === "SHIPPED"}
                              >
                                <Truck className="mr-1 h-4 w-4" />
                                Ship
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-600 text-green-600 hover:bg-green-50"
                                onClick={() =>
                                  updateOrderStatus(order.id, "DELIVERED")
                                }
                                disabled={order.status === "DELIVERED"}
                              >
                                <PackageCheck className="mr-1 h-4 w-4" />
                                Deliver
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  updateOrderStatus(order.id, "CANCELLED")
                                }
                                disabled={order.status === "CANCELLED"}
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
