# Docker Deployment Guide

## Prerequisites

- Docker 20.10 or higher
- Docker Compose 2.0 or higher
- At least 8GB RAM available
- 20GB free disk space

## Quick Start

### 1. Build and Start All Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 2. Access Services

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8085
- **Product Service**: http://localhost:8081
- **Order Service**: http://localhost:8082
- **Keycloak**: http://localhost:8080

### 3. Initial Setup

#### Configure Keycloak

1. Access Keycloak at http://localhost:8080
2. Login with admin/admin
3. Create realm: `microservices-realm`
4. Create clients for each service
5. Create test users

## Service Architecture

```
┌─────────────────┐
│  React Frontend │
│   (Port 3000)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Gateway   │
│   (Port 8085)   │
└────┬────────┬───┘
     │        │
     ▼        ▼
┌─────────┐ ┌──────────┐
│ Product │ │  Order   │
│ Service │ │ Service  │
│  :8081  │ │  :8082   │
└────┬────┘ └────┬─────┘
     │           │
     ▼           ▼
┌─────────┐ ┌─────────┐
│Product  │ │ Order   │
│   DB    │ │   DB    │
│  :3307  │ │  :3308  │
└─────────┘ └─────────┘
```

## Docker Compose Services

### Application Services

#### Frontend (React)

- **Container**: react-frontend
- **Port**: 3000
- **Base Image**: nginx:alpine
- **Health Check**: HTTP GET /

#### API Gateway

- **Container**: api-gateway
- **Port**: 8085
- **Base Image**: eclipse-temurin:21-jre-alpine
- **Health Check**: /actuator/health

#### Product Service

- **Container**: product-service
- **Port**: 8081
- **Base Image**: eclipse-temurin:21-jre-alpine
- **Database**: product-db (MySQL)
- **Health Check**: /actuator/health

#### Order Service

- **Container**: order-service
- **Port**: 8082
- **Base Image**: eclipse-temurin:21-jre-alpine
- **Database**: order-db (MySQL)
- **Health Check**: /actuator/health

### Infrastructure Services

#### Keycloak

- **Container**: keycloak
- **Port**: 8080
- **Database**: keycloak-postgres
- **Admin Credentials**: admin/admin

#### Databases

- **product-db**: MySQL 8.0 (Port 3307)
- **order-db**: MySQL 8.0 (Port 3308)
- **keycloak-postgres**: PostgreSQL 16 (Internal)

## Docker Commands

### Building Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build product-service

# Build without cache
docker-compose build --no-cache
```

### Starting Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d product-service

# Start with build
docker-compose up -d --build
```

### Stopping Services

```bash
# Stop all services
docker-compose stop

# Stop specific service
docker-compose stop product-service

# Stop and remove containers
docker-compose down

# Stop and remove everything (including volumes)
docker-compose down -v
```

### Viewing Logs

```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f product-service

# View last 100 lines
docker-compose logs --tail=100
```

### Service Management

```bash
# Restart service
docker-compose restart product-service

# Scale service (if supported)
docker-compose up -d --scale product-service=3

# Execute command in container
docker-compose exec product-service sh

# View resource usage
docker stats
```

### Database Management

```bash
# Access Product DB
docker-compose exec product-db mysql -u product_user -pproduct_pass product_service

# Access Order DB
docker-compose exec order-db mysql -u order_user -porder_pass order_service

# Backup database
docker-compose exec product-db mysqldump -u product_user -pproduct_pass product_service > backup.sql

# Restore database
docker-compose exec -T product-db mysql -u product_user -pproduct_pass product_service < backup.sql
```

## Health Checks

All services implement health checks:

```bash
# Check gateway health
curl http://localhost:8085/actuator/health

# Check product service health
curl http://localhost:8081/actuator/health

# Check order service health
curl http://localhost:8082/actuator/health

# Check all container health
docker-compose ps
```

## Logging

Logs are configured with rotation:

- **Max Size**: 10MB per file
- **Max Files**: 3 files retained
- **Format**: JSON

View logs:

```bash
# Docker logs
docker-compose logs -f

# Application logs (inside containers)
docker-compose exec product-service cat /app/logs/product-service.log
docker-compose exec order-service cat /app/logs/order-service.log
docker-compose exec gateway cat /app/logs/gateway.log
```

## Volumes

Persistent data volumes:

```bash
# List volumes
docker volume ls | grep microservices

# Inspect volume
docker volume inspect product-db-data

# Remove volumes (CAUTION: Data loss)
docker volume rm product-db-data order-db-data keycloak-data keycloak-postgres-data

# Backup volume
docker run --rm -v product-db-data:/data -v $(pwd):/backup alpine tar czf /backup/product-db-backup.tar.gz -C /data .

# Restore volume
docker run --rm -v product-db-data:/data -v $(pwd):/backup alpine tar xzf /backup/product-db-backup.tar.gz -C /data
```

## Networking

Services communicate via internal network:

- **Network Name**: microservices-network
- **Driver**: bridge

```bash
# Inspect network
docker network inspect microservices-network

# Test connectivity
docker-compose exec gateway ping product-service
docker-compose exec product-service ping product-db
```

## Environment Variables

Configure services via environment variables:

```bash
# Override in docker-compose.override.yml
version: '3.8'
services:
  product-service:
    environment:
      SPRING_PROFILES_ACTIVE: production
      JAVA_OPTS: "-Xmx2g -XX:+UseG1GC"
```

## Troubleshooting

### Service won't start

```bash
# Check logs
docker-compose logs service-name

# Check resource usage
docker stats

# Verify configuration
docker-compose config
```

### Database connection issues

```bash
# Verify database is running
docker-compose ps | grep db

# Check database logs
docker-compose logs product-db

# Test connection
docker-compose exec product-service nc -zv product-db 3306
```

### Port conflicts

```bash
# Find process using port
lsof -i :8081
netstat -tulpn | grep 8081

# Change port in docker-compose.yml
ports:
  - "8091:8081"  # Map to different host port
```

### Out of memory

```bash
# Check container memory
docker stats

# Increase container memory
services:
  product-service:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Clear everything and restart

```bash
# Stop and remove everything
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Clean Docker system
docker system prune -a --volumes

# Rebuild and restart
docker-compose up -d --build
```

## Production Considerations

### Security

1. **Change default credentials**
2. **Use secrets management**
3. **Enable HTTPS/TLS**
4. **Limit exposed ports**
5. **Regular security scans**

### Performance

1. **Tune JVM settings**
2. **Configure connection pools**
3. **Enable caching**
4. **Optimize database queries**
5. **Use production-grade database**

### Monitoring

1. **Prometheus metrics**: All services expose /actuator/prometheus
2. **Health checks**: All services have health endpoints
3. **Log aggregation**: Use ELK stack or similar
4. **APM**: Consider Datadog, New Relic, or similar

### High Availability

```yaml
# docker-compose.ha.yml
version: "3.8"
services:
  product-service:
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
        max_attempts: 3
      resources:
        limits:
          cpus: "2"
          memory: 2G
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [React Docker Deployment](https://create-react-app.dev/docs/deployment/)
