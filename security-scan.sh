#!/bin/bash

# DevSecOps Security Scan Script
# This script performs comprehensive security scanning including:
# - OWASP Dependency Check
# - Trivy Docker image scanning
# - SonarQube static code analysis

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Starting DevSecOps Security Scanning"
echo "=========================================="

# Create reports directory
mkdir -p security-reports

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. OWASP Dependency Check
echo -e "\n${YELLOW}[1/4] Running OWASP Dependency Check...${NC}"

if ! command_exists dependency-check; then
    echo -e "${YELLOW}Installing OWASP Dependency Check...${NC}"
    # Download and install dependency-check if not present
    wget https://github.com/jeremylong/DependencyCheck/releases/download/v9.0.9/dependency-check-9.0.9-release.zip -O /tmp/dependency-check.zip
    unzip -q /tmp/dependency-check.zip -d /tmp/
    export PATH="/tmp/dependency-check/bin:$PATH"
fi

# Scan Java services
for service in gateway product-service order-service; do
    echo -e "${GREEN}Scanning $service...${NC}"
    dependency-check \
        --project "$service" \
        --scan "./$service" \
        --out "./security-reports/dependency-check-$service" \
        --format "ALL" \
        --suppression "./dependency-check-suppression.xml" \
        --disableAssembly \
        --failOnCVSS 7 || echo -e "${RED}High severity vulnerabilities found in $service!${NC}"
done

# Scan React frontend
echo -e "${GREEN}Scanning react-app...${NC}"
if [ -d "react-app/node_modules" ]; then
    npm audit --prefix react-app --audit-level=moderate > security-reports/npm-audit.txt || echo -e "${YELLOW}NPM audit found issues${NC}"
fi

# 2. Trivy Docker Image Scanning
echo -e "\n${YELLOW}[2/4] Running Trivy Docker Image Scans...${NC}"

if ! command_exists trivy; then
    echo -e "${YELLOW}Installing Trivy...${NC}"
    curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
fi

# Build Docker images
echo -e "${GREEN}Building Docker images...${NC}"
docker-compose build

# Scan each Docker image
for service in gateway product-service order-service frontend; do
    echo -e "${GREEN}Scanning $service Docker image...${NC}"
    trivy image \
        --severity HIGH,CRITICAL \
        --format json \
        --output "./security-reports/trivy-$service.json" \
        "secure-microservices-app-$service:latest" || true
    
    # Generate HTML report
    trivy image \
        --severity HIGH,CRITICAL \
        --format template \
        --template "@contrib/html.tpl" \
        --output "./security-reports/trivy-$service.html" \
        "secure-microservices-app-$service:latest" || true
done

# 3. SonarQube Static Analysis
echo -e "\n${YELLOW}[3/4] Running SonarQube Analysis...${NC}"

# Check if SonarQube is running
if ! curl -s http://localhost:9000/api/system/status > /dev/null; then
    echo -e "${YELLOW}SonarQube is not running. Starting SonarQube...${NC}"
    docker-compose -f docker-compose.sonarqube.yml up -d
    echo -e "${YELLOW}Waiting for SonarQube to be ready (this may take a few minutes)...${NC}"
    
    # Wait for SonarQube to be ready
    timeout=300
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if curl -s http://localhost:9000/api/system/status | grep -q "UP"; then
            echo -e "${GREEN}SonarQube is ready!${NC}"
            break
        fi
        sleep 5
        elapsed=$((elapsed + 5))
    done
fi

# Run Maven Sonar analysis for Java services
for service in gateway product-service order-service; do
    echo -e "${GREEN}Analyzing $service with SonarQube...${NC}"
    cd "$service"
    ./mvnw clean verify sonar:sonar \
        -Dsonar.projectKey="$service" \
        -Dsonar.projectName="$service" \
        -Dsonar.host.url=http://localhost:9000 \
        -Dsonar.token=squ_replace_with_your_token || echo -e "${YELLOW}SonarQube analysis failed for $service${NC}"
    cd ..
done

# 4. Generate Summary Report
echo -e "\n${YELLOW}[4/4] Generating Security Summary Report...${NC}"

cat > security-reports/SECURITY-SUMMARY.md << 'EOF'
# Security Scan Summary Report

## Overview
This report contains the results of comprehensive security scanning performed on the Secure Microservices Application.

## Scans Performed

### 1. OWASP Dependency Check
- **Purpose**: Identify known vulnerabilities in project dependencies
- **Severity Threshold**: CVSS >= 7.0
- **Reports**: 
  - Gateway: `dependency-check-gateway/dependency-check-report.html`
  - Product Service: `dependency-check-product-service/dependency-check-report.html`
  - Order Service: `dependency-check-order-service/dependency-check-report.html`

### 2. Trivy Container Scanning
- **Purpose**: Scan Docker images for vulnerabilities
- **Severity**: HIGH, CRITICAL
- **Reports**:
  - Gateway: `trivy-gateway.html`
  - Product Service: `trivy-product-service.html`
  - Order Service: `trivy-order-service.html`
  - Frontend: `trivy-frontend.html`

### 3. SonarQube Static Analysis
- **Purpose**: Code quality and security hotspot detection
- **Dashboard**: http://localhost:9000
- **Projects**: gateway, product-service, order-service

### 4. NPM Audit
- **Purpose**: JavaScript dependency vulnerability scanning
- **Report**: `npm-audit.txt`

## Remediation Steps

1. **Critical Vulnerabilities**: Address immediately
2. **High Severity**: Plan fixes within 1 week
3. **Medium Severity**: Plan fixes within 1 month
4. **Low Severity**: Address during regular maintenance

## Next Steps

1. Review all HTML reports in the `security-reports/` directory
2. Access SonarQube dashboard at http://localhost:9000
3. Create tickets for identified vulnerabilities
4. Update dependencies to latest secure versions
5. Re-run scans after fixes

## Automated Scanning

This scan should be integrated into the CI/CD pipeline to run automatically on:
- Every pull request
- Before deployment to production
- Weekly scheduled scans

EOF

echo -e "\n${GREEN}=========================================="
echo "Security Scanning Complete!"
echo -e "==========================================${NC}"
echo -e "\nReports generated in: ${GREEN}./security-reports/${NC}"
echo -e "\nTo view SonarQube dashboard:"
echo -e "  ${GREEN}http://localhost:9000${NC}"
echo -e "\nDefault SonarQube credentials:"
echo -e "  Username: ${GREEN}admin${NC}"
echo -e "  Password: ${GREEN}admin${NC}"
