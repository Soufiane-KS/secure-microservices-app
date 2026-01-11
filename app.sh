#!/bin/bash

# Secure Microservices Application - Startup Script
# This script provides easy commands to manage the application

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
show_header() {
    echo -e "${BLUE}=========================================="
    echo -e "Secure Microservices Application"
    echo -e "==========================================${NC}\n"
}

show_menu() {
    echo -e "${GREEN}Available Commands:${NC}"
    echo "  start         - Start all services with Docker Compose"
    echo "  stop          - Stop all services"
    echo "  restart       - Restart all services"
    echo "  logs          - View logs from all services"
    echo "  status        - Check status of all services"
    echo "  build         - Build all Docker images"
    echo "  clean         - Stop and remove all containers, volumes"
    echo "  security      - Run security scans"
    echo "  sonarqube     - Start SonarQube for code analysis"
    echo "  test          - Run tests for all services"
    echo "  help          - Show this help message"
    echo ""
}

start_services() {
    echo -e "${YELLOW}Starting all services...${NC}"
    
    # Check for conflicting containers and remove them
    echo -e "${YELLOW}Checking for existing containers...${NC}"
    if docker ps -a --format '{{.Names}}' | grep -qE '^(keycloak|keycloak-postgres|product-db|order-db|product-service|order-service|api-gateway|react-frontend)$'; then
        echo -e "${YELLOW}Removing existing containers...${NC}"
        docker rm -f keycloak keycloak-postgres product-db order-db product-service order-service api-gateway react-frontend 2>/dev/null || true
    fi
    
    docker-compose up -d
    echo -e "\n${GREEN}Services started successfully!${NC}"
    echo -e "\nAccess URLs:"
    echo -e "  Frontend:        ${BLUE}http://localhost:3000${NC}"
    echo -e "  API Gateway:     ${BLUE}http://localhost:8085${NC}"
    echo -e "  Product Service: ${BLUE}http://localhost:8081${NC}"
    echo -e "  Order Service:   ${BLUE}http://localhost:8082${NC}"
    echo -e "  Keycloak:        ${BLUE}http://localhost:8080${NC}"
    echo -e "\n${YELLOW}Keycloak default credentials: admin/admin${NC}"
    echo -e "\n${YELLOW}Waiting for services to be healthy...${NC}"
    sleep 15
    docker-compose ps
}

stop_services() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    docker-compose stop
    echo -e "${GREEN}Services stopped successfully!${NC}"
}

restart_services() {
    echo -e "${YELLOW}Restarting all services...${NC}"
    docker-compose restart
    echo -e "${GREEN}Services restarted successfully!${NC}"
}

view_logs() {
    echo -e "${YELLOW}Viewing logs (Ctrl+C to exit)...${NC}"
    docker-compose logs -f
}

check_status() {
    echo -e "${YELLOW}Checking service status...${NC}\n"
    docker-compose ps
    echo ""
    echo -e "${YELLOW}Health checks:${NC}"
    
    # Check Gateway
    if curl -s http://localhost:8085/actuator/health > /dev/null 2>&1; then
        echo -e "  Gateway:         ${GREEN}✓ Healthy${NC}"
    else
        echo -e "  Gateway:         ${RED}✗ Unhealthy${NC}"
    fi
    
    # Check Product Service
    if curl -s http://localhost:8081/actuator/health > /dev/null 2>&1; then
        echo -e "  Product Service: ${GREEN}✓ Healthy${NC}"
    else
        echo -e "  Product Service: ${RED}✗ Unhealthy${NC}"
    fi
    
    # Check Order Service
    if curl -s http://localhost:8082/actuator/health > /dev/null 2>&1; then
        echo -e "  Order Service:   ${GREEN}✓ Healthy${NC}"
    else
        echo -e "  Order Service:   ${RED}✗ Unhealthy${NC}"
    fi
    
    # Check Frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "  Frontend:        ${GREEN}✓ Healthy${NC}"
    else
        echo -e "  Frontend:        ${RED}✗ Unhealthy${NC}"
    fi
    
    # Check Keycloak
    if curl -s http://localhost:8080 > /dev/null 2>&1; then
        echo -e "  Keycloak:        ${GREEN}✓ Healthy${NC}"
    else
        echo -e "  Keycloak:        ${RED}✗ Unhealthy${NC}"
    fi
}

build_services() {
    echo -e "${YELLOW}Building Docker images...${NC}"
    docker-compose build
    echo -e "${GREEN}Build completed successfully!${NC}"
}

clean_all() {
    echo -e "${RED}WARNING: This will remove all containers, networks, and volumes!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        echo -e "${YELLOW}Cleaning up...${NC}"
        docker-compose down -v --remove-orphans
        echo -e "${GREEN}Cleanup completed!${NC}"
    else
        echo -e "${YELLOW}Cleanup cancelled.${NC}"
    fi
}

run_security_scan() {
    echo -e "${YELLOW}Running security scans...${NC}"
    if [ -f "./security-scan.sh" ]; then
        ./security-scan.sh
    else
        echo -e "${RED}security-scan.sh not found!${NC}"
        exit 1
    fi
}

start_sonarqube() {
    echo -e "${YELLOW}Starting SonarQube...${NC}"
    docker-compose -f docker-compose.sonarqube.yml up -d
    echo -e "${GREEN}SonarQube started!${NC}"
    echo -e "Access at: ${BLUE}http://localhost:9000${NC}"
    echo -e "Default credentials: ${YELLOW}admin/admin${NC}"
}

run_tests() {
    echo -e "${YELLOW}Running tests...${NC}\n"
    
    echo -e "${BLUE}Testing Gateway...${NC}"
    cd gateway && ./mvnw test && cd ..
    
    echo -e "\n${BLUE}Testing Product Service...${NC}"
    cd product-service && ./mvnw test && cd ..
    
    echo -e "\n${BLUE}Testing Order Service...${NC}"
    cd order-service && ./mvnw test && cd ..
    
    echo -e "\n${BLUE}Testing React App...${NC}"
    cd react-app && npm test -- --coverage --watchAll=false && cd ..
    
    echo -e "\n${GREEN}All tests completed!${NC}"
}

# Main script
show_header

if [ $# -eq 0 ]; then
    show_menu
    exit 0
fi

case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        view_logs
        ;;
    status)
        check_status
        ;;
    build)
        build_services
        ;;
    clean)
        clean_all
        ;;
    security)
        run_security_scan
        ;;
    sonarqube)
        start_sonarqube
        ;;
    test)
        run_tests
        ;;
    help)
        show_menu
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}\n"
        show_menu
        exit 1
        ;;
esac
