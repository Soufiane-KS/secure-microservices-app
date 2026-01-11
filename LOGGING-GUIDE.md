# Logging and Traceability Guide

## Overview

This project implements comprehensive logging and traceability across all microservices to ensure:

- Full audit trail of all API access
- User identification in all logs
- Request tracing across services
- Error tracking and debugging
- Security event monitoring
- Service health monitoring

## Logging Architecture

### Components

1. **Application Logs**: Service-specific application logs
2. **Access Logs**: HTTP request/response logs
3. **Security Logs**: Authentication and authorization events
4. **Error Logs**: Exception and error tracking
5. **Audit Logs**: Business transaction logs

### Log Levels

- **TRACE**: Very detailed information (SQL parameters, etc.)
- **DEBUG**: Detailed diagnostic information
- **INFO**: General informational messages
- **WARN**: Warning messages for potentially harmful situations
- **ERROR**: Error events that allow application to continue
- **FATAL**: Very severe error events leading to application abort

## Log Format

### Standard Log Pattern

```
%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - [User: %X{username}] [TraceId: %X{traceId}] [IP: %X{clientIp}] - %msg%n
```

### Example Log Entry

```
2025-01-11 14:30:45 [http-nio-8081-exec-1] INFO  ma.enset.productservice.controller.ProductController - [User: john.doe] [TraceId: 123e4567-e89b-12d3-a456-426614174000] [IP: 192.168.1.100] - API Access: GET /products - 200 OK
```

### Log Fields

| Field     | Description                    | Example                                              |
| --------- | ------------------------------ | ---------------------------------------------------- |
| Timestamp | Date and time of log entry     | 2025-01-11 14:30:45                                  |
| Thread    | Thread name executing the code | http-nio-8081-exec-1                                 |
| Level     | Log level                      | INFO, WARN, ERROR                                    |
| Logger    | Fully qualified class name     | ma.enset.productservice.controller.ProductController |
| User      | Authenticated username         | john.doe                                             |
| TraceId   | Unique request identifier      | 123e4567-e89b-12d3-a456-426614174000                 |
| Client IP | Origin IP address              | 192.168.1.100                                        |
| Message   | Log message                    | API Access: GET /products                            |

## Mapped Diagnostic Context (MDC)

### Implementation

Each service implements `LoggingFilter` that populates MDC with:

```java
MDC.put("traceId", UUID.randomUUID().toString());
MDC.put("username", extractedUsername);
MDC.put("clientIp", clientIpAddress);
```

### Trace ID Propagation

The API Gateway generates a trace ID and propagates it to downstream services:

```java
ServerHttpRequest mutatedRequest = request.mutate()
    .header("X-Trace-Id", traceId)
    .header("X-User", username)
    .build();
```

Downstream services extract and use this trace ID:

```java
String traceId = request.getHeader("X-Trace-Id");
if (traceId != null) {
    MDC.put("traceId", traceId);
}
```

## User Identification

### JWT Token Extraction

User information is extracted from JWT tokens:

```java
if (authentication instanceof JwtAuthenticationToken jwtAuth) {
    username = jwtAuth.getToken().getClaimAsString("preferred_username");
    if (username == null || username.isEmpty()) {
        username = jwtAuth.getToken().getClaimAsString("sub");
    }
}
```

### Anonymous Users

Unauthenticated requests are logged as "anonymous":

```
[User: anonymous] [TraceId: ...] - API Access: GET /public/health
```

## Client IP Detection

### IP Address Extraction

Handles various proxy scenarios:

```java
private String getClientIP(HttpServletRequest request) {
    String ip = request.getHeader("X-Forwarded-For");
    if (ip == null || ip.isEmpty()) {
        ip = request.getHeader("X-Real-IP");
    }
    if (ip == null || ip.isEmpty()) {
        ip = request.getRemoteAddr();
    }
    // Handle multiple IPs (proxy chain)
    if (ip != null && ip.contains(",")) {
        ip = ip.split(",")[0].trim();
    }
    return ip;
}
```

## Log Types

### 1. API Access Logs

Logged for every API request:

```java
logger.info("API Access: {} {} - User: {} - IP: {}",
    request.getMethod(),
    request.getRequestURI(),
    username,
    clientIp);
```

Example:

```
INFO - [User: alice] [TraceId: abc123] [IP: 10.0.1.5] - API Access: POST /products - 201 Created
```

### 2. Business Transaction Logs

Logged for important business operations:

```java
logger.info("Product created: id={}, name={}, price={}",
    product.getId(),
    product.getName(),
    product.getPrice());
```

Example:

```
INFO - [User: alice] [TraceId: abc123] - Product created: id=123, name=Laptop, price=999.99
```

### 3. Security Event Logs

Logged for security-related events:

```java
logger.warn("Unauthorized access attempt to {} by user {}",
    request.getRequestURI(),
    username);
```

Example:

```
WARN - [User: bob] [TraceId: def456] [IP: 192.168.1.50] - Unauthorized access attempt to /admin/users
```

### 4. Error Logs

Logged for exceptions and errors:

```java
try {
    // business logic
} catch (Exception e) {
    logger.error("Error processing order: {}", orderId, e);
    throw e;
}
```

Example:

```
ERROR - [User: charlie] [TraceId: ghi789] - Error processing order: 456
java.lang.RuntimeException: Database connection failed
    at ma.enset.orderservice.service.OrderService.processOrder(OrderService.java:45)
    ...
```

### 5. Performance Logs

Logged for performance monitoring:

```java
long startTime = System.currentTimeMillis();
// ... operation ...
long duration = System.currentTimeMillis() - startTime;
logger.info("Operation completed in {}ms", duration);
```

## Log Storage

### File-based Logging

Configured in `application.yml`:

```yaml
logging:
  file:
    name: logs/product-service.log
    max-size: 10MB
    max-history: 30
    total-size-cap: 1GB
```

### Log Rotation

- **Max Size**: 10MB per file
- **Max History**: 30 days
- **Total Cap**: 1GB total log size
- **Compression**: Old logs are compressed

### Log Locations

- **Gateway**: `logs/gateway.log`
- **Product Service**: `logs/product-service.log`
- **Order Service**: `logs/order-service.log`

## Log Aggregation

### Recommended Tools

1. **ELK Stack** (Elasticsearch, Logstash, Kibana)
2. **Grafana Loki** (Lightweight alternative)
3. **Splunk** (Enterprise solution)
4. **Datadog** (Cloud-based)

### ELK Stack Integration

```yaml
# docker-compose.elk.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

## Service Health Monitoring

### Health Check Endpoints

All services expose health check endpoints:

```bash
# Gateway
curl http://localhost:8085/actuator/health

# Product Service
curl http://localhost:8081/actuator/health

# Order Service
curl http://localhost:8082/actuator/health
```

### Health Check Response

```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "MySQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 250685575168,
        "free": 100685575168,
        "threshold": 10485760
      }
    }
  }
}
```

### Metrics Endpoints

Prometheus-compatible metrics:

```bash
# Get all metrics
curl http://localhost:8081/actuator/prometheus

# View in Prometheus format
http_server_requests_seconds_count{method="GET",outcome="SUCCESS",status="200",uri="/products"}
```

## Querying Logs

### Using grep

```bash
# Find all errors
grep "ERROR" logs/product-service.log

# Find logs for specific user
grep "User: alice" logs/product-service.log

# Find logs with specific trace ID
grep "TraceId: abc123" logs/*.log

# Find unauthorized access attempts
grep "Unauthorized" logs/*.log
```

### Using awk

```bash
# Extract error counts by user
awk -F'User: ' '/ERROR/{print $2}' logs/product-service.log | awk -F']' '{print $1}' | sort | uniq -c

# Extract API endpoint access counts
awk '/API Access/{print $NF}' logs/product-service.log | sort | uniq -c | sort -rn
```

## Security Audit

### Audit Trail Requirements

1. **Who**: User identification (username from JWT)
2. **What**: Action performed (API endpoint, method)
3. **When**: Timestamp of action
4. **Where**: Source IP address
5. **Result**: Success/failure status code

### Example Audit Query

Find all failed authentication attempts:

```bash
grep -E "401|403" logs/gateway.log | grep -v "User: anonymous"
```

Find all admin actions:

```bash
grep "User: admin" logs/*.log | grep -E "POST|PUT|DELETE"
```

## Compliance

### GDPR Considerations

- User identifiers in logs (may need anonymization)
- IP address logging (personal data)
- Log retention policy (30 days)
- Right to be forgotten (log purging)

### PCI DSS Requirements

- No credit card data in logs
- Access control to log files
- Log integrity protection
- Centralized log management

## Troubleshooting

### No Logs Generated

Check file permissions:

```bash
ls -la logs/
chmod 755 logs/
```

### Log File Too Large

Adjust rotation settings:

```yaml
logging:
  file:
    max-size: 5MB # Reduce size
    max-history: 10 # Reduce retention
```

### Missing User Information

Check JWT token configuration:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://keycloak:8080/realms/microservices-realm
```

### Trace ID Not Propagating

Ensure headers are forwarded:

```java
ServerHttpRequest mutatedRequest = request.mutate()
    .header("X-Trace-Id", traceId)
    .build();
```

## Best Practices

1. **Log at appropriate levels**: Don't over-log or under-log
2. **Include context**: Always include user, trace ID, and IP
3. **Don't log sensitive data**: Passwords, tokens, credit cards
4. **Use structured logging**: Consistent format for parsing
5. **Monitor log volume**: Watch for excessive logging
6. **Regular cleanup**: Archive or delete old logs
7. **Centralize logs**: Use log aggregation for production
8. **Alert on errors**: Set up alerts for critical errors
9. **Performance impact**: Consider async logging for high-volume
10. **Test logging**: Verify logs in development

## Monitoring Dashboard Example

### Key Metrics to Monitor

- Request rate per service
- Error rate by service
- Response time percentiles (p50, p95, p99)
- User activity by endpoint
- Geographic distribution (by IP)
- Authentication failures
- Database query performance

## Additional Resources

- [Spring Boot Logging](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.logging)
- [Logback Documentation](https://logback.qos.ch/documentation.html)
- [MDC Documentation](http://logback.qos.ch/manual/mdc.html)
- [ELK Stack Guide](https://www.elastic.co/what-is/elk-stack)
