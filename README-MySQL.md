# 🐬 MySQL Migration Guide

## 📋 Overview
Migrated from H2 in-memory database to MySQL for production-ready persistence.

## 🏗️ Architecture
- **Product Service**: Uses `product_service` database (Port 3307)
- **Order Service**: Uses `order_service` database (Port 3308)
- **Separate MySQL instances** for better isolation and security

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
# Start MySQL containers
docker-compose up -d

# Verify containers are running
docker ps
```

### Option 2: Local MySQL Installation
```bash
# Create databases manually
mysql -u root -p

CREATE DATABASE product_service;
CREATE DATABASE order_service;

CREATE USER 'product_user'@'localhost' IDENTIFIED BY 'product_pass';
GRANT ALL PRIVILEGES ON product_service.* TO 'product_user'@'localhost';

CREATE USER 'order_user'@'localhost' IDENTIFIED BY 'order_pass';
GRANT ALL PRIVILEGES ON order_service.* TO 'order_user'@'localhost';

FLUSH PRIVILEGES;
```

## 🔧 Configuration

### Environment Variables
```bash
# For Product Service
export DB_USERNAME=product_user
export DB_PASSWORD=product_pass

# For Order Service  
export DB_USERNAME=order_user
export DB_PASSWORD=order_pass
```

### Database URLs
- **Product Service**: `jdbc:mysql://localhost:3307/product_service`
- **Order Service**: `jdbc:mysql://localhost:3308/order_service`

## 🗄️ Database Schema

### Product Service Tables
```sql
-- Products table
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Order Service Tables
```sql
-- Orders table
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

## 🔐 Security Benefits

### ✅ What's Improved
- **Persistent Data**: Data survives application restarts
- **Better Security**: Separate databases and users
- **Production Ready**: MySQL is enterprise-grade
- **Connection Pooling**: Better performance
- **ACID Compliance**: Full transaction support

### 🔒 Security Measures
- **Separate Users**: Each service has its own database user
- **Limited Privileges**: Users only have access to their own database
- **Password Protection**: Strong passwords for all users
- **Network Isolation**: Docker network isolation

## 🧪 Testing

### 1. Start MySQL
```bash
docker-compose up -d
```

### 2. Start Services
```bash
# Terminal 1: Product Service
cd product-service
mvn spring-boot:run

# Terminal 2: Order Service
cd order-service  
mvn spring-boot:run

# Terminal 3: Gateway
cd gateway
mvn spring-boot:run

# Terminal 4: React App
cd react-app
npm start
```

### 3. Verify Data
```bash
# Connect to Product Service MySQL
mysql -h localhost -P 3307 -u product_user -p product_service

# Connect to Order Service MySQL
mysql -h localhost -P 3308 -u order_user -p order_service

# Check tables
SHOW TABLES;
SELECT * FROM products;
SELECT * FROM orders;
SELECT * FROM order_items;
```

## 📊 Monitoring

### Check MySQL Status
```bash
# Docker logs
docker-compose logs mysql-product-service
docker-compose logs mysql-order-service

# MySQL processes
docker exec mysql-product-service mysqladmin processlist
docker exec mysql-order-service mysqladmin processlist
```

### Database Statistics
```sql
-- Check table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'product_service';

-- Check connections
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Connections';
```

## 🔄 Data Migration (if needed)

### From H2 to MySQL
```bash
# Export H2 data
# (Use H2 console or script to export)

# Import to MySQL
mysql -h localhost -P 3307 -u product_user -p product_service < products.sql
mysql -h localhost -P 3308 -u order_user -p order_service < orders.sql
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
# Check if MySQL is running
docker-compose ps

# Check ports
netstat -an | grep 3307
netstat -an | grep 3308
```

#### 2. Authentication Failed
```bash
# Verify credentials
mysql -h localhost -P 3307 -u product_user -p

# Reset password if needed
docker exec mysql-product-service mysql -u root -p
ALTER USER 'product_user'@'%' IDENTIFIED BY 'product_pass';
```

#### 3. Database Not Found
```bash
# Create database manually
docker exec mysql-product-service mysql -u root -p
CREATE DATABASE product_service;
```

## 🚀 Production Considerations

### For Production Deployment
1. **Change DDL Strategy**: Use `validate` instead of `create-drop`
2. **Environment Variables**: Use proper secret management
3. **Backups**: Implement regular MySQL backups
4. **Monitoring**: Add MySQL monitoring
5. **SSL**: Enable SSL for MySQL connections
6. **Replication**: Consider MySQL replication for HA

### Example Production Config
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # Don't drop production data
  datasource:
    url: jdbc:mysql://mysql-prod:3306/product_service?useSSL=true
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

## 📝 Summary

✅ **Successfully migrated to MySQL**
✅ **Production-ready setup**
✅ **Better security and persistence**
✅ **Docker-based deployment**
✅ **Comprehensive monitoring**

Your microservices now use enterprise-grade MySQL with proper security measures!
