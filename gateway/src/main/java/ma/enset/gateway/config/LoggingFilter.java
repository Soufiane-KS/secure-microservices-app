package ma.enset.gateway.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(LoggingFilter.class);
    private static final String TRACE_ID = "traceId";
    private static final String USERNAME = "username";
    private static final String CLIENT_IP = "clientIp";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String traceId = UUID.randomUUID().toString();
        
        MDC.put(TRACE_ID, traceId);
        
        return ReactiveSecurityContextHolder.getContext()
            .map(SecurityContext::getAuthentication)
            .defaultIfEmpty(createAnonymousAuthentication())
            .flatMap(authentication -> {
                String username = extractUsername(authentication);
                String clientIp = getClientIP(request);
                
                MDC.put(USERNAME, username);
                MDC.put(CLIENT_IP, clientIp);
                
                // Log the gateway request
                logger.info("Gateway Request: {} {} - User: {} - IP: {} - TraceId: {}", 
                    request.getMethod(), 
                    request.getPath(), 
                    username, 
                    clientIp,
                    traceId);
                
                // Add trace ID to request headers for downstream services
                ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-Trace-Id", traceId)
                    .header("X-User", username)
                    .build();
                
                return chain.filter(exchange.mutate().request(mutatedRequest).build())
                    .doFinally(signalType -> {
                        // Clean up MDC
                        MDC.remove(TRACE_ID);
                        MDC.remove(USERNAME);
                        MDC.remove(CLIENT_IP);
                    });
            });
    }
    
    private String extractUsername(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            String username = jwtAuth.getToken().getClaimAsString("preferred_username");
            if (username == null || username.isEmpty()) {
                username = jwtAuth.getToken().getClaimAsString("sub");
            }
            return username != null ? username : "anonymous";
        } else if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return "anonymous";
    }
    
    private String getClientIP(ServerHttpRequest request) {
        String ip = request.getHeaders().getFirst("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeaders().getFirst("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            if (request.getRemoteAddress() != null) {
                ip = request.getRemoteAddress().getAddress().getHostAddress();
            }
        }
        // Return first IP if multiple IPs are present
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
    
    private Authentication createAnonymousAuthentication() {
        return new Authentication() {
            @Override
            public String getName() { return "anonymous"; }
            @Override
            public Object getCredentials() { return null; }
            @Override
            public Object getDetails() { return null; }
            @Override
            public Object getPrincipal() { return "anonymous"; }
            @Override
            public boolean isAuthenticated() { return false; }
            @Override
            public void setAuthenticated(boolean isAuthenticated) {}
            @Override
            public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() {
                return java.util.Collections.emptyList();
            }
        };
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
