# 🛒 Microservices E-commerce Platform

A comprehensive microservices-based e-commerce platform built with Spring Boot, React, MySQL, and Keycloak for OAuth2 authentication.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  API Gateway    │    │  Keycloak       │
│   (Port 3000)   │────│   (Port 8085)   │────│   (Port 8080)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │Product Svc  │ │Order Service│ │   MySQL     │
        │(Port 8081)  │ │(Port 8082)  │ │(Ports 3307/ │
        │              │ │             │ │   3308)     │
        └─────────────┘ └─────────────┘ └─────────────┘
```

## 🚀 Features

### **🔐 Security & Authentication**
- OAuth2/OIDC with Keycloak
- JWT token-based authentication
- Zero-trust security model
- Role-based access control

### **📦 Product Management**
- CRUD operations for products
- Product search and filtering
- Stock management
- Price validation

### **🛒 Order Management**
- Multi-item order creation
- Product selection interface
- Real-time price calculation
- Order status tracking
- Order history

### **🗄️ Database**
- MySQL for persistent storage
- Separate databases per service
- Docker containerization
- Data initialization

### **🎨 User Interface**
- Modern React frontend
- Product catalog browsing
- Interactive order forms
- Real-time cart management
- Responsive design

## 📋 Prerequisites

- **Java 17+**
- **Maven 3.8+**
- **Node.js 16+**
- **Docker & Docker Compose**
- **Keycloak 21+**

## 🛠️ Quick Start

### **1. Start Infrastructure**
```bash
# Start MySQL containers
docker-compose up -d
```

### **2. Start Keycloak**
```bash
# Start Keycloak server (separate from this project)
# Configure realm: microservices-realm
# Configure client: react-client
```

### **3. Start Microservices**
```bash
# Terminal 1: Product Service
cd product-service
mvn spring-boot:run

# Terminal 2: Order Service
cd order-service
mvn spring-boot:run

# Terminal 3: API Gateway
cd gateway
mvn spring-boot:run
```

### **4. Start React App**
```bash
cd react-app
npm install
npm start
```

## 🌐 Access URLs

| Service          | URL                          | Description                     |
|------------------|------------------------------|---------------------------------|
| React App        | http://localhost:3000        | Frontend application            |
| API Gateway      | http://localhost:8085        | API Gateway endpoint           |
| Product Service  | http://localhost:8081        | Product microservice           |
| Order Service    | http://localhost:8082        | Order microservice             |
| Keycloak         | http://localhost:8080        | Authentication server          |

## 🗄️ Database Configuration

### **MySQL Databases**
- **Product Service**: `localhost:3307/product_service`
- **Order Service**: `localhost:3308/order_service`

### **Connection Details**
```yaml
# Product Service
datasource:
  url: jdbc:mysql://localhost:3307/product_service
  username: product_user
  password: product_pass

# Order Service
datasource:
  url: jdbc:mysql://localhost:3308/order_service
  username: order_user
  password: order_pass
```

## 📚 API Endpoints

### **Product Service**
- `GET /products` - List all products
- `GET /products/{id}` - Get product by ID
- `POST /products` - Create new product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product
- `GET /products/search` - Search products

### **Order Service**
- `GET /orders` - List all orders
- `GET /orders/{id}` - Get order by ID
- `POST /orders` - Create new order
- `PUT /orders/{id}` - Update order
- `DELETE /orders/{id}` - Delete order
- `GET /orders/customer/{email}` - Get orders by customer
- `GET /orders/status/{status}` - Get orders by status

### **API Gateway Routes**
- `/products/**` → Product Service
- `/orders/**` → Order Service

## 🔐 Security Configuration

### **Keycloak Realm**
- **Realm Name**: `microservices-realm`
- **Client ID**: `react-client`
- **Access Type**: `public`
- **Valid Redirect URIs**: `http://localhost:3000/*`

### **JWT Validation**
All microservices validate JWT tokens from Keycloak using the issuer URI:
```
http://localhost:8080/realms/microservices-realm
```

## 🧪 Testing

### **Sample Data**
The application automatically initializes sample data:
- **10 Products**: Laptops, phones, tablets, accessories
- **5 Orders**: Sample orders with various statuses

### **Test Scenarios**
1. **Product Management**: Create, update, delete products
2. **Order Creation**: Multi-item orders with product selection
3. **Authentication**: Login/logout flows
4. **Authorization**: Protected endpoints
5. **Data Persistence**: MySQL data retention

## 📦 Service Details

### **Product Service**
- **Port**: 8081
- **Database**: MySQL (product_service)
- **Features**: CRUD, search, validation
- **Security**: OAuth2 Resource Server

### **Order Service**
- **Port**: 8082
- **Database**: MySQL (order_service)
- **Features**: Order management, status tracking
- **Security**: OAuth2 Resource Server

### **API Gateway**
- **Port**: 8085
- **Technology**: Spring Cloud Gateway
- **Features**: Routing, load balancing, security
- **Routes**: /products/**, /orders/**

### **React Frontend**
- **Port**: 3000
- **Technology**: React 18, Axios
- **Features**: Product catalog, order forms
- **Authentication**: Keycloak JS adapter

## 🛠️ Development

### **Environment Variables**
```bash
# Optional: Override database credentials
export DB_USERNAME=custom_user
export DB_PASSWORD=custom_password
```

### **Build & Package**
```bash
# Build all services
mvn clean package

# Build individual service
cd product-service && mvn clean package
```

### **Docker Development**
```bash
# Start only databases
docker-compose up -d mysql-product-service mysql-order-service

# View logs
docker-compose logs -f mysql-product-service
```

## 🔧 Configuration

### **Application Properties**
Each service uses `application.yml` for configuration:
- Database connection
- Security settings
- Server ports
- Logging levels

### **Docker Compose**
- MySQL 8.0 containers
- Persistent volumes
- Network isolation
- Environment variables

## 📊 Monitoring & Logging

### **Log Levels**
```yaml
logging:
  level:
    ma.enset.productservice: DEBUG
    ma.enset.orderservice: DEBUG
    org.springframework.security: DEBUG
```

### **Health Endpoints**
- `/actuator/health` - Service health status
- `/actuator/info` - Service information

## 🚀 Production Considerations

### **Security**
- Enable SSL/TLS
- Use environment variables for secrets
- Implement rate limiting
- Add audit logging

### **Database**
- Change `ddl-auto` to `validate`
- Set up regular backups
- Configure connection pooling
- Monitor performance

### **Scaling**
- Horizontal scaling of services
- Load balancer configuration
- Container orchestration (Kubernetes)
- Service discovery

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### **Common Issues**

#### **Database Connection**
```bash
# Check MySQL containers
docker-compose ps

# Check database connectivity
docker exec mysql-product-service mysql -u product_user -pproduct_pass -e "SELECT 1;"
```

#### **Authentication Issues**
- Verify Keycloak is running
- Check realm and client configuration
- Validate redirect URIs
- Check JWT token validation

#### **Service Communication**
- Verify API Gateway routing
- Check service ports
- Validate JWT tokens
- Check network connectivity

### **Debug Commands**
```bash
# Check service logs
docker-compose logs -f [service-name]

# Test API endpoints
curl -H "Authorization: Bearer TOKEN" http://localhost:8085/products

# Database queries
mysql -h localhost -P 3307 -u product_user -p product_service
```

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the documentation

---

**Built with ❤️ using Spring Boot, React, MySQL, and Keycloak**
