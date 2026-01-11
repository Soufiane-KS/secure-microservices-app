# Secure Microservices E-commerce Platform

A production-ready microservices-based e-commerce platform built with Spring Boot, React, MySQL, and Keycloak for authentication, featuring comprehensive DevSecOps practices, containerization, and logging/traceability.

## 🚀 Features

### Core Functionality

- **Product Management**: Full CRUD operations with search and filtering
- **Order Management**: Multi-item orders with real-time calculations
- **User Authentication**: OAuth2/OIDC with Keycloak integration
- **API Gateway**: Centralized routing and security
- **Responsive Frontend**: Modern React application

### Security & DevSecOps

- ✅ **Static Code Analysis**: SonarQube integration
- ✅ **Dependency Scanning**: OWASP Dependency-Check
- ✅ **Container Security**: Trivy image scanning
- ✅ **Automated CI/CD**: GitHub Actions pipeline
- ✅ **Security Reporting**: Comprehensive vulnerability reports

### Containerization

- 🐳 **Docker**: Individual Dockerfiles for each service
- 🐳 **Docker Compose**: Complete orchestration with all dependencies
- 🐳 **Multi-stage Builds**: Optimized image sizes
- 🐳 **Health Checks**: Built-in service monitoring
- 🐳 **Non-root Users**: Security-hardened containers

### Logging & Traceability

- 📊 **Comprehensive Logging**: All API requests, errors, and events
- 👤 **User Identification**: JWT-based user tracking in logs
- 🔍 **Request Tracing**: Unique trace IDs across services
- 🌐 **Client IP Logging**: Source tracking for requests
- 📈 **Metrics**: Prometheus-compatible actuator endpoints
- 💊 **Health Monitoring**: Service health checks

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Network                            │
│                                                                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │   Frontend   │────▶│  API Gateway │────▶│  Keycloak    │   │
│  │  (React)     │     │  (Port 8085) │     │  (Port 8080) │   │
│  │  Port 3000   │     └──────┬───────┘     └──────────────┘   │
│  └──────────────┘            │                                  │
│                      ┌───────┴────────┐                         │
│                      │                │                         │
│              ┌───────▼──────┐  ┌─────▼────────┐               │
│              │   Product     │  │    Order     │               │
│              │   Service     │  │   Service    │               │
│              │  (Port 8081)  │  │ (Port 8082)  │               │
│              └───────┬───────┘  └─────┬────────┘               │
│                      │                │                         │
│              ┌───────▼───────┐  ┌─────▼────────┐               │
│              │  Product DB   │  │  Order DB    │               │
│              │  MySQL :3307  │  │ MySQL :3308  │               │
│              └───────────────┘  └──────────────┘               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Keycloak Database (PostgreSQL)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

- **Docker**: 20.10 or higher
- **Docker Compose**: 2.0 or higher
- **RAM**: At least 8GB available
- **Disk Space**: 20GB free

For development without Docker:

- **Java**: 21
- **Maven**: 3.8+
- **Node.js**: 20+
- **MySQL**: 8.0
- **PostgreSQL**: 16

## 🚀 Quick Start with Docker

### 1. Clone and Navigate

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd secure-microservices-app
```

### 2. Start All Services

```bash
# Build and start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 3. Configure Keycloak

1. Access Keycloak at http://localhost:8080
2. Login with `admin/admin`
3. Create realm: `microservices-realm`
4. Configure clients (see [Keycloak Setup](#keycloak-setup))

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8085
- **Product Service**: http://localhost:8081
- **Order Service**: http://localhost:8082
- **Keycloak**: http://localhost:8080

## 📚 Documentation

- **[Docker Guide](DOCKER-GUIDE.md)** - Complete Docker deployment guide
- **[DevSecOps Guide](DEVSECOPS.md)** - Security scanning and CI/CD
- **[Logging Guide](LOGGING-GUIDE.md)** - Logging and traceability
- **[Order Demo](ORDER-DEMO.md)** - Demo walkthrough

## 🔐 Security Features

### Authentication & Authorization

- OAuth2/OIDC with Keycloak
- JWT token validation
- Role-based access control (RBAC)
- Secure password policies

### DevSecOps Integration

#### 1. Static Code Analysis (SonarQube)

```bash
# Start SonarQube
docker-compose -f docker-compose.sonarqube.yml up -d

# Run analysis
cd gateway && ./mvnw sonar:sonar
cd product-service && ./mvnw sonar:sonar
cd order-service && ./mvnw sonar:sonar

# Access dashboard: http://localhost:9000
```

#### 2. Dependency Scanning (OWASP)

```bash
# Run comprehensive security scan
./security-scan.sh

# View reports
ls -la security-reports/
```

#### 3. Container Scanning (Trivy)

```bash
# Scan individual images
trivy image secure-microservices-app-gateway:latest
trivy image secure-microservices-app-product-service:latest
trivy image secure-microservices-app-order-service:latest
trivy image secure-microservices-app-frontend:latest
```

#### 4. Automated CI/CD

- GitHub Actions workflow for automated testing
- Security scans on every pull request
- Automated deployment to production
- Weekly security audits

See [DEVSECOPS.md](DEVSECOPS.md) for detailed information.

## 📊 Logging & Monitoring

### Logging Features

- **User Tracking**: All logs include authenticated user
- **Request Tracing**: Unique trace IDs across services
- **IP Tracking**: Client IP address logging
- **Audit Trail**: Complete API access logs
- **Error Tracking**: Detailed exception logging

### Log Format

```
2025-01-11 14:30:45 [thread] INFO Controller - [User: john.doe] [TraceId: abc-123] [IP: 192.168.1.100] - API Access: GET /products - 200 OK
```

### Accessing Logs

```bash
# View live logs
docker-compose logs -f

# View specific service
docker-compose logs -f product-service

# Search logs
docker-compose logs product-service | grep "ERROR"

# View log files
docker-compose exec product-service cat /app/logs/product-service.log
```

### Health Checks

```bash
# Check all services
curl http://localhost:8085/actuator/health  # Gateway
curl http://localhost:8081/actuator/health  # Product Service
curl http://localhost:8082/actuator/health  # Order Service

# Prometheus metrics
curl http://localhost:8081/actuator/prometheus
```

See [LOGGING-GUIDE.md](LOGGING-GUIDE.md) for detailed information.

## 🛠️ Development Setup

### Without Docker

#### 1. Start Databases

```bash
docker-compose up -d product-db order-db keycloak-postgres keycloak
```

#### 2. Start Services

```bash
# Terminal 1: Gateway
cd gateway
./mvnw spring-boot:run

# Terminal 2: Product Service
cd product-service
./mvnw spring-boot:run

# Terminal 3: Order Service
cd order-service
./mvnw spring-boot:run

# Terminal 4: Frontend
cd react-app
npm install
npm start
```

### With Hot Reload

```bash
# Java services
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.devtools.restart.enabled=true"

# React app
npm start  # Auto-reloads on changes
```

## 🧪 Testing

### Unit Tests

```bash
# Java services
cd gateway && ./mvnw test
cd product-service && ./mvnw test
cd order-service && ./mvnw test

# React app
cd react-app && npm test
```

### Integration Tests

```bash
# Run with Docker
docker-compose up -d
./mvnw verify
```

### Security Tests

```bash
# Run security scan
./security-scan.sh

# View reports
open security-reports/SECURITY-SUMMARY.md
```

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
# Database
MYSQL_ROOT_PASSWORD=root_pass
PRODUCT_DB_PASSWORD=product_pass
ORDER_DB_PASSWORD=order_pass

# Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# Application
SPRING_PROFILES_ACTIVE=docker
```

### Service Configuration

Each service can be configured via `application.yml` or environment variables:

```yaml
# Example: product-service
spring:
  datasource:
    url: jdbc:mysql://product-db:3306/product_service
    username: product_user
    password: ${PRODUCT_DB_PASSWORD}
```

## 📦 Project Structure

```
.
├── gateway/                  # API Gateway Service
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── product-service/          # Product Microservice
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── order-service/            # Order Microservice
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── react-app/                # React Frontend
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml        # Main compose file
├── docker-compose.sonarqube.yml  # SonarQube setup
├── security-scan.sh          # Security scanning script
├── sonar-project.properties  # SonarQube config
├── .github/
│   └── workflows/
│       └── devsecops.yml     # CI/CD pipeline
├── DOCKER-GUIDE.md           # Docker documentation
├── DEVSECOPS.md              # Security documentation
├── LOGGING-GUIDE.md          # Logging documentation
└── README.md                 # This file
```

## 🎯 API Endpoints

### Product Service (via Gateway)

- `GET /products` - List all products
- `GET /products/{id}` - Get product by ID
- `POST /products` - Create product (requires authentication)
- `PUT /products/{id}` - Update product (requires authentication)
- `DELETE /products/{id}` - Delete product (requires authentication)

### Order Service (via Gateway)

- `GET /orders` - List all orders (requires authentication)
- `GET /orders/{id}` - Get order by ID (requires authentication)
- `POST /orders` - Create order (requires authentication)
- `PUT /orders/{id}` - Update order (requires authentication)
- `DELETE /orders/{id}` - Delete order (requires authentication)

## 🔑 Keycloak Setup

### 1. Create Realm

1. Login to Keycloak (admin/admin)
2. Create new realm: `microservices-realm`

### 2. Create Client

1. Client ID: `react-client`
2. Client Protocol: `openid-connect`
3. Access Type: `public`
4. Valid Redirect URIs: `http://localhost:3000/*`
5. Web Origins: `http://localhost:3000`

### 3. Create Users

1. Navigate to Users
2. Add User
3. Set username and credentials
4. Assign roles

### 4. Configure Roles

- `ROLE_USER` - Standard user access
- `ROLE_ADMIN` - Administrative access

## 🚀 Deployment

### Production Checklist

- [ ] Change default passwords
- [ ] Configure HTTPS/TLS
- [ ] Set up database backups
- [ ] Configure log aggregation
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Use secrets management
- [ ] Set resource limits
- [ ] Configure auto-scaling

### Docker Production

```bash
# Use production compose file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes

```bash
# Apply manifests (if available)
kubectl apply -f k8s/
```

## 📈 Monitoring

### Metrics Available

- Request rate per service
- Error rate
- Response time (p50, p95, p99)
- Database connection pool metrics
- JVM metrics (heap, threads, GC)
- Custom business metrics

### Prometheus Integration

```yaml
# prometheus.yml
scrape_configs:
  - job_name: "spring-actuator"
    metrics_path: "/actuator/prometheus"
    static_configs:
      - targets: ["gateway:8085", "product-service:8081", "order-service:8082"]
```

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Restart service
docker-compose restart <service-name>

# Rebuild service
docker-compose up -d --build <service-name>
```

### Database Connection Issues

```bash
# Check database is running
docker-compose ps | grep db

# Verify connectivity
docker-compose exec product-service nc -zv product-db 3306
```

### Keycloak Configuration Issues

- Ensure realm name matches configuration
- Verify client settings
- Check redirect URIs
- Validate user credentials

### Memory Issues

```bash
# Increase container memory
services:
  product-service:
    deploy:
      resources:
        limits:
          memory: 2G
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and security scans
5. Submit a pull request

### Code Quality Standards

- SonarQube quality gate must pass
- No critical or high vulnerabilities
- Test coverage > 80%
- All tests must pass

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name

## 🙏 Acknowledgments

- Spring Boot framework
- React community
- Keycloak project
- Docker community
- OWASP Foundation

## 📞 Support

For support and questions:

- Create an issue on GitHub
- Contact: your-email@example.com

## 🔗 Related Projects

- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway)
- [Keycloak](https://www.keycloak.org/)
- [React](https://reactjs.org/)
- [Docker](https://www.docker.com/)

---

**Last Updated**: January 2025

| Service         | URL                   |
| --------------- | --------------------- |
| React App       | http://localhost:3000 |
| API Gateway     | http://localhost:8085 |
| Product Service | http://localhost:8081 |
| Order Service   | http://localhost:8082 |
| Keycloak        | http://localhost:8080 |

## Database Configuration

### MySQL Databases

- Product Service: localhost:3307/product_service
- Order Service: localhost:3308/order_service

### Connection Details

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

## API Endpoints

### Product Service

- GET /products - List all products
- GET /products/{id} - Get product by ID
- POST /products - Create new product
- PUT /products/{id} - Update product
- DELETE /products/{id} - Delete product
- GET /products/search - Search products

### Order Service

- GET /orders - List all orders
- GET /orders/{id} - Get order by ID
- POST /orders - Create new order
- PUT /orders/{id} - Update order
- DELETE /orders/{id} - Delete order
- GET /orders/customer/{email} - Get orders by customer
- GET /orders/status/{status} - Get orders by status

### API Gateway Routes

- /products/\*\* → Product Service
- /orders/\*\* → Order Service

## Security Configuration

### Keycloak Realm

- Realm Name: microservices-realm
- Client ID: react-client
- Access Type: public
- Valid Redirect URIs: http://localhost:3000/\*

### JWT Validation

All microservices validate JWT tokens from Keycloak:

```
http://localhost:8080/realms/microservices-realm
```

## Testing

### Sample Data

The application initializes sample data:

- 10 Products: Laptops, phones, tablets, accessories
- 5 Orders: Sample orders with various statuses

### Test Scenarios

1. Product Management: Create, update, delete products
2. Order Creation: Multi-item orders with product selection
3. Authentication: Login/logout flows
4. Authorization: Protected endpoints
5. Data Persistence: MySQL data retention

## Service Details

### Product Service

- Port: 8081
- Database: MySQL (product_service)
- Features: CRUD, search, validation
- Security: OAuth2 Resource Server

### Order Service

- Port: 8082
- Database: MySQL (order_service)
- Features: Order management, status tracking
- Security: OAuth2 Resource Server

### API Gateway

- Port: 8085
- Technology: Spring Cloud Gateway
- Features: Routing, load balancing, security
- Routes: /products/**, /orders/**

### React Frontend

- Port: 3000
- Technology: React 18, Axios
- Features: Product catalog, order forms
- Authentication: Keycloak JS adapter

## Development

### Environment Variables

```bash
# Optional: Override database credentials
export DB_USERNAME=custom_user
export DB_PASSWORD=custom_password
```

### Build & Package

```bash
# Build all services
mvn clean package

# Build individual service
cd product-service && mvn clean package
```

### Docker Development

```bash
# Start only databases
docker-compose up -d mysql-product-service mysql-order-service

# View logs
docker-compose logs -f mysql-product-service
```

## Configuration

### Application Properties

Each service uses application.yml for configuration:

- Database connection
- Security settings
- Server ports
- Logging levels

### Docker Compose

- MySQL 8.0 containers
- Persistent volumes
- Network isolation
- Environment variables

## Monitoring & Logging

### Log Levels

```yaml
logging:
  level:
    ma.enset.productservice: DEBUG
    ma.enset.orderservice: DEBUG
    org.springframework.security: DEBUG
```

### Health Endpoints

- /actuator/health - Service health status
- /actuator/info - Service information

## Production Considerations

### Security

- Enable SSL/TLS
- Use environment variables for secrets
- Implement rate limiting
- Add audit logging

### Database

- Change ddl-auto to validate
- Set up regular backups
- Configure connection pooling
- Monitor performance

### Scaling

- Horizontal scaling of services
- Load balancer configuration
- Container orchestration (Kubernetes)
- Service discovery

## Troubleshooting

### Common Issues

#### Database Connection

```bash
# Check MySQL containers
docker-compose ps

# Check database connectivity
docker exec mysql-product-service mysql -u product_user -pproduct_pass -e "SELECT 1;"
```

#### Authentication Issues

- Verify Keycloak is running
- Check realm and client configuration
- Validate redirect URIs
- Check JWT token validation

#### Service Communication

- Verify API Gateway routing
- Check service ports
- Validate JWT tokens
- Check network connectivity

### Debug Commands

```bash
# Check service logs
docker-compose logs -f [service-name]

# Test API endpoints
curl -H "Authorization: Bearer TOKEN" http://localhost:8085/products

# Database queries
mysql -h localhost -P 3307 -u product_user -p product_service
```

**Built with Spring Boot, React, MySQL, and Keycloak**
