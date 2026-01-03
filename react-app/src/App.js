import axios from "axios";
import React, { useState, useEffect } from "react";

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
        customerEmail: ""
    });

    useEffect(() => {
        // Load products when component mounts
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            await keycloak.updateToken(30);
            const response = await axios.get(
                "http://localhost:8085/products",
                {
                    headers: {
                        Authorization: `Bearer ${keycloak.token}`,
                    },
                }
            );
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
            console.error("Products error:", error);
        }
    };

    const callOrders = async () => {
        try {
            await keycloak.updateToken(30);

            const response = await axios.get(
                "http://localhost:8085/orders",
                {
                    headers: {
                        Authorization: `Bearer ${keycloak.token}`,
                    },
                }
            );

            setOrders(response.data);
            setShowOrders(true);
            setShowProducts(false);
            setShowOrderForm(false);
            setMessage("Orders loaded successfully!");
        } catch (error) {
            setMessage("Error loading orders: " + error.message);
            console.error("Orders error:", error);
        }
    };

    const showCreateOrderForm = () => {
        setShowOrderForm(true);
        setShowProducts(false);
        setShowOrders(false);
        setCustomerInfo({
            customerName: keycloak.tokenParsed?.preferred_username || "",
            customerEmail: keycloak.tokenParsed?.email || ""
        });
        setSelectedProducts([]);
    };

    const addProductToOrder = (product) => {
        const existingItem = selectedProducts.find(item => item.id === product.id);
        
        if (existingItem) {
            // Update quantity if product already in order
            setSelectedProducts(selectedProducts.map(item => 
                item.id === product.id 
                    ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
                    : item
            ));
        } else {
            // Add new product to order
            setSelectedProducts([...selectedProducts, {
                id: product.id,
                productName: product.name,
                unitPrice: product.price,
                quantity: 1,
                totalPrice: product.price
            }]);
        }
    };

    const updateProductQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            setSelectedProducts(selectedProducts.filter(item => item.id !== productId));
        } else {
            setSelectedProducts(selectedProducts.map(item => 
                item.id === productId 
                    ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
                    : item
            ));
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
                items: selectedProducts
            };

            const response = await axios.post(
                "http://localhost:8085/orders",
                orderData,
                {
                    headers: {
                        Authorization: `Bearer ${keycloak.token}`,
                        "Content-Type": "application/json"
                    },
                }
            );

            setMessage("Order created successfully! Order ID: " + response.data.id);
            setShowOrderForm(false);
            setSelectedProducts([]);
            // Refresh orders list
            callOrders();
        } catch (error) {
            setMessage("Error creating order: " + error.message);
            console.error("Create order error:", error);
        }
    };

    return (
        <div style={{ padding: "30px", fontFamily: "Arial" }}>
            <h2>React + Keycloak + API Gateway</h2>

            <div style={{ backgroundColor: "#f5f5f5", padding: "15px", marginBottom: "20px", borderRadius: "5px" }}>
                <p><strong>Utilisateur:</strong> {keycloak.idTokenParsed?.preferred_username}</p>
                <p><strong>Email:</strong> {keycloak.idTokenParsed?.email}</p>
                <p><strong>Rôles:</strong> {keycloak.tokenParsed?.realm_access?.roles.join(", ")}</p>
            </div>

            {message && (
                <div style={{ 
                    backgroundColor: message.includes("Error") ? "#ffebee" : "#e8f5e8", 
                    padding: "10px", 
                    marginBottom: "20px", 
                    borderRadius: "5px",
                    border: message.includes("Error") ? "1px solid #f44336" : "1px solid #4caf50"
                }}>
                    {message}
                </div>
            )}

            <div style={{ marginBottom: "20px" }}>
                <button onClick={callProducts} style={{ marginRight: "10px", padding: "10px 20px" }}>
                    📦 Voir Produits
                </button>
                <button onClick={callOrders} style={{ marginRight: "10px", padding: "10px 20px" }}>
                    🛒 Voir Commandes
                </button>
                <button onClick={showCreateOrderForm} style={{ marginRight: "10px", padding: "10px 20px", backgroundColor: "#4caf50", color: "white" }}>
                    ➕ Créer Commande
                </button>
                <button onClick={() => keycloak.logout()} style={{ padding: "10px 20px", backgroundColor: "#f44336", color: "white" }}>
                    🚪 Se déconnecter
                </button>
            </div>

            {showProducts && (
                <div style={{ marginTop: "20px" }}>
                    <h3>📦 Products ({products.length})</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
                        {products.map(product => (
                            <div key={product.id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "5px" }}>
                                <h4>{product.name}</h4>
                                <p>{product.description}</p>
                                <p><strong>Price:</strong> ${product.price}</p>
                                <p><strong>Stock:</strong> {product.quantity} units</p>
                                <button 
                                    onClick={() => addProductToOrder(product)}
                                    style={{ padding: "5px 10px", backgroundColor: "#2196f3", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                                >
                                    Add to Order
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showOrderForm && (
                <div style={{ marginTop: "20px" }}>
                    <h3>➕ Create New Order</h3>
                    
                    <div style={{ marginBottom: "20px" }}>
                        <h4>Customer Information</h4>
                        <div style={{ marginBottom: "10px" }}>
                            <label>Name: </label>
                            <input 
                                type="text" 
                                value={customerInfo.customerName}
                                onChange={(e) => setCustomerInfo({...customerInfo, customerName: e.target.value})}
                                style={{ padding: "5px", marginLeft: "10px", width: "300px" }}
                            />
                        </div>
                        <div>
                            <label>Email: </label>
                            <input 
                                type="email" 
                                value={customerInfo.customerEmail}
                                onChange={(e) => setCustomerInfo({...customerInfo, customerEmail: e.target.value})}
                                style={{ padding: "5px", marginLeft: "10px", width: "300px" }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <h4>Available Products</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "10px" }}>
                            {products.map(product => (
                                <div key={product.id} style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
                                    <h5>{product.name}</h5>
                                    <p>${product.price}</p>
                                    <p>Stock: {product.quantity}</p>
                                    <button 
                                        onClick={() => addProductToOrder(product)}
                                        style={{ padding: "5px 10px", backgroundColor: "#2196f3", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedProducts.length > 0 && (
                        <div style={{ marginBottom: "20px" }}>
                            <h4>Selected Products</h4>
                            <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "5px" }}>
                                {selectedProducts.map(item => (
                                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                        <span>{item.productName}</span>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <button 
                                                onClick={() => updateProductQuantity(item.id, item.quantity - 1)}
                                                style={{ padding: "2px 8px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button 
                                                onClick={() => updateProductQuantity(item.id, item.quantity + 1)}
                                                style={{ padding: "2px 8px", backgroundColor: "#4caf50", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                                            >
                                                +
                                            </button>
                                            <span>${item.totalPrice.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ borderTop: "1px solid #ddd", paddingTop: "10px", marginTop: "10px" }}>
                                    <strong>Total: ${calculateTotal().toFixed(2)}</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button 
                            onClick={createOrder}
                            disabled={selectedProducts.length === 0}
                            style={{ 
                                padding: "10px 20px", 
                                backgroundColor: selectedProducts.length === 0 ? "#ccc" : "#4caf50", 
                                color: "white", 
                                border: "none", 
                                borderRadius: "5px", 
                                cursor: selectedProducts.length === 0 ? "not-allowed" : "pointer",
                                marginRight: "10px"
                            }}
                        >
                            Place Order (${calculateTotal().toFixed(2)})
                        </button>
                        <button 
                            onClick={() => setShowOrderForm(false)}
                            style={{ padding: "10px 20px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {showOrders && (
                <div style={{ marginTop: "20px" }}>
                    <h3>🛒 Orders ({orders.length})</h3>
                    {orders.map(order => (
                        <div key={order.id} style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "10px", borderRadius: "5px" }}>
                            <h4>Order #{order.id} - {order.customerName}</h4>
                            <p><strong>Email:</strong> {order.customerEmail}</p>
                            <p><strong>Status:</strong> <span style={{ 
                                backgroundColor: order.status === 'DELIVERED' ? '#4caf50' : 
                                               order.status === 'SHIPPED' ? '#2196f3' : 
                                               order.status === 'PENDING' ? '#ff9800' : 
                                               order.status === 'CANCELLED' ? '#f44336' : '#9e9e9e',
                                color: 'white', padding: '3px 8px', borderRadius: '3px'
                            }}>{order.status}</span></p>
                            <p><strong>Total:</strong> ${order.totalAmount}</p>
                            <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                            {order.items && order.items.length > 0 && (
                                <div>
                                    <strong>Items:</strong>
                                    <ul style={{ margin: "5px 0" }}>
                                        {order.items.map((item, index) => (
                                            <li key={index}>
                                                {item.productName} - {item.quantity}x ${item.unitPrice} = ${item.totalPrice}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
