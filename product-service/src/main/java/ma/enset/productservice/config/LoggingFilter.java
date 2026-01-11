package ma.enset.productservice.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class LoggingFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(LoggingFilter.class);
    private static final String TRACE_ID = "traceId";
    private static final String USERNAME = "username";
    private static final String CLIENT_IP = "clientIp";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        try {
            // Generate or retrieve trace ID
            String traceId = UUID.randomUUID().toString();
            MDC.put(TRACE_ID, traceId);
            
            // Extract user information from JWT token
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = "anonymous";
            
            if (authentication instanceof JwtAuthenticationToken jwtAuth) {
                username = jwtAuth.getToken().getClaimAsString("preferred_username");
                if (username == null || username.isEmpty()) {
                    username = jwtAuth.getToken().getClaimAsString("sub");
                }
            } else if (authentication != null && authentication.isAuthenticated()) {
                username = authentication.getName();
            }
            
            MDC.put(USERNAME, username);
            
            // Extract client IP address
            String clientIp = getClientIP(httpRequest);
            MDC.put(CLIENT_IP, clientIp);
            
            // Log the API access
            logger.info("API Access: {} {} - User: {} - IP: {}", 
                httpRequest.getMethod(), 
                httpRequest.getRequestURI(), 
                username, 
                clientIp);
            
            chain.doFilter(request, response);
            
        } catch (Exception e) {
            logger.error("Error in logging filter", e);
            throw e;
        } finally {
            // Clean up MDC
            MDC.remove(TRACE_ID);
            MDC.remove(USERNAME);
            MDC.remove(CLIENT_IP);
        }
    }
    
    private String getClientIP(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Return first IP if multiple IPs are present
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
