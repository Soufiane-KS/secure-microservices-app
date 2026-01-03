package ma.enset.orderservice.config;

import ma.enset.orderservice.entity.Order;
import ma.enset.orderservice.entity.OrderItem;
import ma.enset.orderservice.repository.OrderRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner init(OrderRepository orderRepository) {
        return args -> {
            // Check if data already exists
            if (orderRepository.count() == 0) {
                // Create sample orders
                Order order1 = new Order("John Doe", "john.doe@email.com", new BigDecimal("2599.98"));
                order1.setStatus(Order.OrderStatus.CONFIRMED);
                order1.setCreatedAt(LocalDateTime.of(2026, 1, 1, 10, 0));
                order1.setUpdatedAt(LocalDateTime.of(2026, 1, 2, 10, 0));
                
                Order order2 = new Order("Jane Smith", "jane.smith@email.com", new BigDecimal("999.99"));
                order2.setStatus(Order.OrderStatus.SHIPPED);
                order2.setCreatedAt(LocalDateTime.of(2026, 1, 2, 10, 0));
                order2.setUpdatedAt(LocalDateTime.of(2026, 1, 2, 22, 0));
                
                Order order3 = new Order("Bob Johnson", "bob.johnson@email.com", new BigDecimal("1799.98"));
                order3.setStatus(Order.OrderStatus.DELIVERED);
                order3.setCreatedAt(LocalDateTime.of(2026, 1, 1, 10, 0));
                order3.setUpdatedAt(LocalDateTime.of(2026, 1, 1, 10, 0));
                
                Order order4 = new Order("Alice Brown", "alice.brown@email.com", new BigDecimal("649.98"));
                order4.setStatus(Order.OrderStatus.PENDING);
                order4.setCreatedAt(LocalDateTime.of(2026, 1, 3, 8, 0));
                order4.setUpdatedAt(LocalDateTime.of(2026, 1, 3, 8, 0));
                
                Order order5 = new Order("Charlie Wilson", "charlie.wilson@email.com", new BigDecimal("399.99"));
                order5.setStatus(Order.OrderStatus.CANCELLED);
                order5.setCreatedAt(LocalDateTime.of(2026, 1, 2, 10, 0));
                order5.setUpdatedAt(LocalDateTime.of(2026, 1, 2, 16, 0));

                // Add order items for order1
                OrderItem item1 = new OrderItem(order1, "Laptop Dell XPS 15", 1, new BigDecimal("1299.99"));
                OrderItem item2 = new OrderItem(order1, "iPhone 14 Pro", 1, new BigDecimal("999.99"));
                OrderItem item3 = new OrderItem(order1, "AirPods Pro", 1, new BigDecimal("249.99"));
                order1.setItems(Arrays.asList(item1, item2, item3));

                // Add order items for order2
                OrderItem item4 = new OrderItem(order2, "iPhone 14 Pro", 1, new BigDecimal("999.99"));
                order2.setItems(Arrays.asList(item4));

                // Add order items for order3
                OrderItem item5 = new OrderItem(order3, "MacBook Air M2", 1, new BigDecimal("1199.99"));
                OrderItem item6 = new OrderItem(order3, "iPad Air", 1, new BigDecimal("599.99"));
                order3.setItems(Arrays.asList(item5, item6));

                // Add order items for order4
                OrderItem item7 = new OrderItem(order4, "Samsung Galaxy S23", 1, new BigDecimal("899.99"));
                order4.setItems(Arrays.asList(item7));

                // Add order items for order5
                OrderItem item8 = new OrderItem(order5, "Sony WH-1000XM5", 1, new BigDecimal("399.99"));
                order5.setItems(Arrays.asList(item8));

                // Save all orders
                orderRepository.saveAll(Arrays.asList(order1, order2, order3, order4, order5));
                
                System.out.println("Sample order data initialized successfully!");
            }
        };
    }
}
