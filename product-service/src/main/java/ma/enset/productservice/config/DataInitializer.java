package ma.enset.productservice.config;

import ma.enset.productservice.entity.Product;
import ma.enset.productservice.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.Arrays;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner init(ProductRepository productRepository) {
        return args -> {
            // Check if data already exists
            if (productRepository.count() == 0) {
                // Create sample products
                Product product1 = new Product("Laptop Dell XPS 15", "High-performance laptop with 16GB RAM and 512GB SSD", new BigDecimal("1299.99"), 50);
                Product product2 = new Product("iPhone 14 Pro", "Latest iPhone with A16 Bionic chip", new BigDecimal("999.99"), 100);
                Product product3 = new Product("Samsung Galaxy S23", "Flagship Android phone with excellent camera", new BigDecimal("899.99"), 75);
                Product product4 = new Product("iPad Air", "Versatile tablet for work and entertainment", new BigDecimal("599.99"), 60);
                Product product5 = new Product("MacBook Air M2", "Ultra-thin laptop with M2 chip", new BigDecimal("1199.99"), 40);
                Product product6 = new Product("AirPods Pro", "Wireless earbuds with active noise cancellation", new BigDecimal("249.99"), 150);
                Product product7 = new Product("Sony WH-1000XM5", "Premium noise-canceling headphones", new BigDecimal("399.99"), 80);
                Product product8 = new Product("Apple Watch Series 8", "Advanced health and fitness tracking", new BigDecimal("449.99"), 90);
                Product product9 = new Product("Nintendo Switch", "Hybrid gaming console", new BigDecimal("299.99"), 120);
                Product product10 = new Product("Kindle Paperwhite", "E-reader with adjustable warm light", new BigDecimal("139.99"), 200);

                // Save all products
                productRepository.saveAll(Arrays.asList(
                    product1, product2, product3, product4, product5,
                    product6, product7, product8, product9, product10
                ));
                
                System.out.println("Sample product data initialized successfully!");
            }
        };
    }
}
