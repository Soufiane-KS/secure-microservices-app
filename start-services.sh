#!/bin/bash

echo "🚀 Starting Microservices with MySQL..."

# Step 1: Start MySQL containers
echo "📦 Starting MySQL containers..."
docker-compose up -d

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 10

# Check if databases are accessible
echo "🔍 Checking database connections..."
docker exec mysql-product-service mysql -u product_user -pproduct_pass -e "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Product Service database is ready"
else
    echo "❌ Product Service database connection failed"
    exit 1
fi

docker exec mysql-order-service mysql -u order_user -porder_pass -e "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Order Service database is ready"
else
    echo "❌ Order Service database connection failed"
    exit 1
fi

echo "🎯 All databases are ready!"
echo ""
echo "📋 Next steps:"
echo "1. Start Product Service: cd product-service && mvn spring-boot:run"
echo "2. Start Order Service: cd order-service && mvn spring-boot:run"
echo "3. Start Gateway: cd gateway && mvn spring-boot:run"
echo "4. Start React App: cd react-app && npm start"
echo ""
echo "🔗 Access URLs:"
echo "- React App: http://localhost:3000"
echo "- API Gateway: http://localhost:8085"
echo "- Product Service: http://localhost:8081"
echo "- Order Service: http://localhost:8082"
echo ""
echo "🗄️ Database Access:"
echo "- Product DB: mysql -h localhost -P 3307 -u product_user -p product_service"
echo "- Order DB: mysql -h localhost -P 3308 -u order_user -p order_service"
