# DevSecOps Implementation Guide

## Overview

This project implements a comprehensive DevSecOps approach with multiple security scanning tools and automated CI/CD pipelines.

## Security Tools Integrated

### 1. SonarQube (Static Code Analysis)

- **Purpose**: Detect code quality issues, security vulnerabilities, and code smells
- **How to use**:

  ```bash
  # Start SonarQube
  docker-compose -f docker-compose.sonarqube.yml up -d

  # Wait for SonarQube to be ready, then access at http://localhost:9000
  # Default credentials: admin/admin

  # Run analysis for each service
  cd gateway && ./mvnw sonar:sonar -Dsonar.host.url=http://localhost:9000
  cd product-service && ./mvnw sonar:sonar -Dsonar.host.url=http://localhost:9000
  cd order-service && ./mvnw sonar:sonar -Dsonar.host.url=http://localhost:9000
  ```

### 2. OWASP Dependency-Check

- **Purpose**: Identify known vulnerabilities in project dependencies
- **How to use**:

  ```bash
  # Install Dependency-Check
  wget https://github.com/jeremylong/DependencyCheck/releases/download/v9.0.9/dependency-check-9.0.9-release.zip
  unzip dependency-check-9.0.9-release.zip

  # Run scan
  ./dependency-check/bin/dependency-check.sh \
    --project "secure-microservices-app" \
    --scan . \
    --out ./security-reports \
    --format "ALL"
  ```

### 3. Trivy (Docker Image Scanner)

- **Purpose**: Scan Docker images for vulnerabilities
- **How to use**:

  ```bash
  # Install Trivy
  curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

  # Scan images
  trivy image --severity HIGH,CRITICAL secure-microservices-app-gateway:latest
  trivy image --severity HIGH,CRITICAL secure-microservices-app-product-service:latest
  trivy image --severity HIGH,CRITICAL secure-microservices-app-order-service:latest
  trivy image --severity HIGH,CRITICAL secure-microservices-app-frontend:latest
  ```

### 4. NPM Audit (JavaScript Dependencies)

- **Purpose**: Scan npm dependencies for vulnerabilities
- **How to use**:
  ```bash
  cd react-app
  npm audit
  npm audit fix  # Automatically fix vulnerabilities when possible
  ```

## Automated Security Scanning

### Running All Scans

Use the provided script to run all security scans at once:

```bash
./security-scan.sh
```

This script will:

1. Run OWASP Dependency-Check on all Java services
2. Perform NPM audit on the React app
3. Build Docker images and scan them with Trivy
4. Run SonarQube static analysis
5. Generate a comprehensive security report

### CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/devsecops.yml`) that automatically:

1. **Security Scan Job**:

   - OWASP Dependency-Check
   - SonarQube analysis
   - NPM audit

2. **Build and Test Job**:

   - Compile all services
   - Run unit tests
   - Build React application

3. **Docker Security Scan Job**:

   - Build Docker images
   - Scan with Trivy
   - Upload results to GitHub Security tab

4. **Deploy Job**:
   - Deploy to production (on master/main branch)

## Security Best Practices

### 1. Dockerfile Security

All Dockerfiles implement security best practices:

- **Multi-stage builds**: Reduce attack surface
- **Non-root users**: Services run as non-privileged users
- **Minimal base images**: Alpine-based images for smaller attack surface
- **Health checks**: Monitor service health
- **Resource limits**: Prevent resource exhaustion

### 2. Logging and Traceability

Each service implements comprehensive logging:

- **User identification**: Logs include authenticated user information
- **Request tracing**: Unique trace IDs for request tracking
- **Client IP logging**: Track request origin
- **Access logs**: All API calls are logged
- **Error logging**: Detailed error information for debugging

Example log format:

```
2025-01-11 14:30:45 [http-nio-8081-exec-1] INFO  ProductController - [User: john.doe] [TraceId: 123e4567-e89b-12d3-a456-426614174000] [IP: 192.168.1.100] - GET /products - 200 OK
```

### 3. Health Monitoring

All services expose Actuator endpoints:

- `/actuator/health` - Service health status
- `/actuator/metrics` - Performance metrics
- `/actuator/prometheus` - Prometheus-compatible metrics
- `/actuator/info` - Service information

### 4. Dependency Management

- Regular dependency updates
- Automated vulnerability scanning
- Suppression file for false positives
- Version pinning for reproducible builds

## Vulnerability Remediation Process

1. **Detection**: Automated scans identify vulnerabilities
2. **Assessment**: Review vulnerability details and impact
3. **Prioritization**:
   - **Critical**: Fix immediately
   - **High**: Fix within 1 week
   - **Medium**: Fix within 1 month
   - **Low**: Fix during regular maintenance
4. **Remediation**: Update dependencies or apply patches
5. **Verification**: Re-run scans to confirm fix
6. **Documentation**: Update suppression file if needed

## Security Reports

After running `./security-scan.sh`, reports are available in `security-reports/`:

- `dependency-check-*/` - OWASP Dependency-Check HTML reports
- `trivy-*.html` - Trivy Docker scan reports
- `npm-audit.txt` - NPM audit results
- `SECURITY-SUMMARY.md` - Consolidated summary

## Integration with Development Workflow

### Pre-commit Hooks (Recommended)

```bash
# Install pre-commit
pip install pre-commit

# Add to .pre-commit-config.yaml
# - Run npm audit
# - Run dependency-check
# - Run SonarQube quality gate check
```

### Pull Request Checks

The CI/CD pipeline runs on every PR:

- Code quality must meet SonarQube standards
- No critical or high vulnerabilities allowed
- All tests must pass
- Docker images must pass Trivy scans

### Scheduled Scans

Weekly automated scans run every Sunday:

```yaml
schedule:
  - cron: "0 0 * * 0"
```

## Configuration

### SonarQube

Edit `sonar-project.properties` to customize:

- Project key and name
- Source directories
- Exclusions
- Quality gates

### OWASP Dependency-Check

Edit `dependency-check-suppression.xml` to suppress false positives:

```xml
<suppress>
    <notes><![CDATA[Reason for suppression]]></notes>
    <cve>CVE-2021-12345</cve>
</suppress>
```

### GitHub Actions

Required secrets in GitHub repository settings:

- `SONAR_HOST_URL` - SonarQube server URL
- `SONAR_TOKEN` - SonarQube authentication token
- `GITHUB_TOKEN` - Automatically provided by GitHub

## Troubleshooting

### SonarQube not accessible

```bash
docker-compose -f docker-compose.sonarqube.yml logs -f
```

### Dependency-Check scan fails

- Check internet connectivity (downloads CVE database)
- Increase memory: `-Xmx4096m`

### Trivy scan fails

```bash
trivy image --clear-cache
```

### NPM audit fails

```bash
cd react-app
rm -rf node_modules package-lock.json
npm install
npm audit fix
```

## Additional Resources

- [OWASP Dependency-Check Documentation](https://jeremylong.github.io/DependencyCheck/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

## Maintenance

### Regular Tasks

- **Weekly**: Review security scan reports
- **Monthly**: Update all dependencies
- **Quarterly**: Review and update security policies
- **Annually**: Security audit by external team

### Monitoring Metrics

Monitor these key metrics:

- Number of vulnerabilities by severity
- Time to fix vulnerabilities
- Code coverage percentage
- Security hotspots count
- Failed security scans

## Contact

For security issues, contact: [security@example.com](mailto:security@example.com)
