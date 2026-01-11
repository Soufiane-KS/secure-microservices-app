package ma.enset.productservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()  // Allow health checks
                        .anyRequest().authenticated()   // ZERO TRUST : tout est protégé
                )
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(Customizer.withDefaults())
                );

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder(@Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}") String issuerUri) {
        // Use keycloak container name for JWK endpoint (internal Docker network)
        String jwkSetUri = issuerUri.replace("http://keycloak:8080", "http://keycloak:8080") + "/protocol/openid-connect/certs";
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        
        // Custom validator that accepts BOTH localhost:8080 and keycloak:8080 issuers
        jwtDecoder.setJwtValidator(jwt -> {
            String iss = jwt.getIssuer() != null ? jwt.getIssuer().toString() : "";
            
            // Accept either localhost:8080 or keycloak:8080 issuer
            boolean validIssuer = iss.equals("http://localhost:8080/realms/microservices-realm") ||
                                  iss.equals("http://keycloak:8080/realms/microservices-realm");
            
            if (!validIssuer) {
                return org.springframework.security.oauth2.core.OAuth2TokenValidatorResult.failure(
                    new org.springframework.security.oauth2.core.OAuth2Error("invalid_token", "Invalid issuer: " + iss, null)
                );
            }
            
            // Validate timestamp claims (exp, nbf, iat)
            return new org.springframework.security.oauth2.jwt.JwtTimestampValidator().validate(jwt);
        });
        
        return jwtDecoder;
    }
}

