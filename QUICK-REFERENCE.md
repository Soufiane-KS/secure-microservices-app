# Quick Reference Card

## 🚀 Quick Commands

### Application Management

```bash
./app.sh start      # Start all services
./app.sh stop       # Stop all services
./app.sh restart    # Restart all services
./app.sh status     # Check service health
./app.sh logs       # View logs
./app.sh clean      # Clean everything (removes data!)
```

### Docker Commands

```bash
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose ps                 # List services
docker-compose logs -f service    # Follow service logs
docker-compose restart service    # Restart service
docker-compose exec service sh    # Access container shell
```

### Security Scanning

```bash
./security-scan.sh                # Run all security scans
./app.sh security                 # Same as above
./app.sh sonarqube               # Start SonarQube
trivy image image-name:latest     # Scan specific image
```

### Testing

```bash
./app.sh test                     # Run all tests
cd service && ./mvnw test        # Test Java service
cd react-app && npm test         # Test React app
```

## 🌐 Access URLs

| Service         | URL                   | Credentials    |
| --------------- | --------------------- | -------------- |
| Frontend        | http://localhost:3000 | (via Keycloak) |
| API Gateway     | http://localhost:8085 | -              |
| Product Service | http://localhost:8081 | -              |
| Order Service   | http://localhost:8082 | -              |
| Keycloak        | http://localhost:8080 | admin/admin    |
| SonarQube       | http://localhost:9000 | admin/admin    |

## 📊 Health Endpoints

```bash
# Health Checks
curl http://localhost:8085/actuator/health  # Gateway
curl http://localhost:8081/actuator/health  # Product
curl http://localhost:8082/actuator/health  # Order

# Metrics (Prometheus format)
curl http://localhost:8081/actuator/prometheus

# Service Info
curl http://localhost:8081/actuator/info
```

## 🔍 Log Analysis

```bash
# View logs
docker-compose logs -f

# View specific service
docker-compose logs -f product-service

# Search for errors
docker-compose logs | grep ERROR

# Search by user
docker-compose logs | grep "User: john.doe"

# Search by trace ID
docker-compose logs | grep "TraceId: abc-123"

# Access log files in container
docker-compose exec product-service cat /app/logs/product-service.log
```

## 🗄️ Database Access

```bash
# Product Database
docker-compose exec product-db mysql -u product_user -pproduct_pass product_service

# Order Database
docker-compose exec order-db mysql -u order_user -porder_pass order_service

# Keycloak Database
docker-compose exec keycloak-postgres psql -U keycloak keycloak

# Backup database
docker-compose exec product-db mysqldump -u product_user -pproduct_pass product_service > backup.sql

# Restore database
docker-compose exec -T product-db mysql -u product_user -pproduct_pass product_service < backup.sql
```

## 🛠️ Troubleshooting

### Service Won't Start

```bash
docker-compose logs service-name          # Check logs
docker-compose restart service-name       # Restart
docker-compose up -d --build service-name # Rebuild
docker system prune -a                    # Clean Docker
```

### Database Connection Issues

```bash
docker-compose ps | grep db                           # Check DB running
docker-compose exec service nc -zv product-db 3306   # Test connectivity
docker-compose restart product-db                     # Restart DB
```

### Out of Memory

```bash
docker stats                              # Check resource usage
docker system df                          # Check disk usage
docker system prune -a --volumes          # Free up space
```

### Port Already in Use

```bash
lsof -i :8081                            # Find process using port
netstat -tulpn | grep 8081               # Alternative check
# Change port in docker-compose.yml or kill process
```

## 📝 Common Tasks

### Add New User in Keycloak

1. Access http://localhost:8080
2. Login with admin/admin
3. Select realm: microservices-realm
4. Users → Add User
5. Set username and credentials
6. Assign roles

### View Security Reports

```bash
ls -la security-reports/
open security-reports/SECURITY-SUMMARY.md
open security-reports/trivy-gateway.html
```

### Update Dependencies

```bash
# Java services
cd service && ./mvnw versions:display-dependency-updates

# React app
cd react-app && npm outdated
cd react-app && npm update
```

### Run Individual Service Tests

```bash
# Gateway
cd gateway && ./mvnw clean test

# Product Service
cd product-service && ./mvnw clean test

# Order Service
cd order-service && ./mvnw clean test

# React App
cd react-app && npm test
```

## 🔐 Security Checks

### Quick Security Audit

```bash
# Run all scans
./security-scan.sh

# Check for high severity CVEs
grep "HIGH\|CRITICAL" security-reports/*.txt

# Review SonarQube
open http://localhost:9000
```

### View Audit Logs

```bash
# Failed authentication attempts
docker-compose logs gateway | grep -E "401|403"

# Admin actions
docker-compose logs | grep "User: admin"

# All POST/PUT/DELETE operations
docker-compose logs | grep -E "POST|PUT|DELETE"

# Suspicious IP activity
docker-compose logs | grep "IP: suspicious_ip"
```

## 📦 Backup and Restore

### Backup Everything

```bash
# Stop services
./app.sh stop

# Backup databases
docker-compose exec product-db mysqldump -u product_user -pproduct_pass product_service > product-backup.sql
docker-compose exec order-db mysqldump -u order_user -porder_pass order_service > order-backup.sql

# Backup Keycloak
docker-compose exec keycloak-postgres pg_dump -U keycloak keycloak > keycloak-backup.sql

# Backup volumes
docker run --rm -v product-db-data:/data -v $(pwd):/backup alpine tar czf /backup/volumes-backup.tar.gz -C /data .
```

### Restore

```bash
# Restore databases
docker-compose exec -T product-db mysql -u product_user -pproduct_pass product_service < product-backup.sql
docker-compose exec -T order-db mysql -u order_user -porder_pass order_service < order-backup.sql
docker-compose exec -T keycloak-postgres psql -U keycloak keycloak < keycloak-backup.sql

# Restart services
./app.sh restart
```

## 🎯 Performance Optimization

### Monitor Performance

```bash
# Container stats
docker stats

# Java heap usage
docker-compose exec product-service jstat -gc 1

# Database performance
docker-compose exec product-db mysqladmin -u root -proot_pass status
```

### Tune JVM

Edit `docker-compose.yml`:

```yaml
environment:
  JAVA_OPTS: "-Xms512m -Xmx2g -XX:+UseG1GC"
```

## 🔄 CI/CD

### GitHub Actions

- Automatically runs on push/PR
- Weekly security scans (Sunday)
- View results: GitHub → Actions tab
- Security alerts: GitHub → Security tab

### Manual Pipeline Run

```bash
# Push to trigger pipeline
git add .
git commit -m "Your message"
git push origin master

# View in GitHub Actions
```

## 📚 Documentation

| Document                                               | Purpose                 |
| ------------------------------------------------------ | ----------------------- |
| [README.md](README.md)                                 | Main documentation      |
| [DOCKER-GUIDE.md](DOCKER-GUIDE.md)                     | Docker deployment guide |
| [DEVSECOPS.md](DEVSECOPS.md)                           | Security and DevSecOps  |
| [LOGGING-GUIDE.md](LOGGING-GUIDE.md)                   | Logging and monitoring  |
| [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md) | Implementation details  |
| [ORDER-DEMO.md](ORDER-DEMO.md)                         | Demo walkthrough        |

## 🆘 Getting Help

1. Check documentation in project root
2. Review logs: `./app.sh logs`
3. Check service health: `./app.sh status`
4. Review security reports: `ls security-reports/`
5. Check GitHub issues
6. Contact support team

## 💡 Tips

- Always check logs first: `./app.sh logs`
- Use trace IDs to correlate requests across services
- Run security scans before deploying
- Keep dependencies up to date
- Monitor resource usage with `docker stats`
- Backup data regularly
- Test in staging before production
- Review security reports weekly
- Keep documentation updated
- Use version control for configuration changes

---

**Need more help?** Check the detailed guides:

- `./app.sh help` - Show all commands
- `cat DOCKER-GUIDE.md` - Docker details
- `cat DEVSECOPS.md` - Security details
- `cat LOGGING-GUIDE.md` - Logging details
