package ma.enset.orderservice.controller;

import ma.enset.orderservice.dto.OrderDTO;
import ma.enset.orderservice.entity.Order;
import ma.enset.orderservice.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders(Authentication authentication) {
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id, Authentication authentication) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customer/{email}")
    public ResponseEntity<List<OrderDTO>> getOrdersByCustomerEmail(@PathVariable String email, Authentication authentication) {
        List<OrderDTO> orders = orderService.getOrdersByCustomerEmail(email);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderDTO>> getOrdersByStatus(@PathVariable Order.OrderStatus status, Authentication authentication) {
        List<OrderDTO> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@Valid @RequestBody OrderDTO orderDTO, Authentication authentication) {
        OrderDTO createdOrder = orderService.createOrder(orderDTO);
        return ResponseEntity.ok(createdOrder);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderDTO> updateOrder(@PathVariable Long id, 
                                                 @Valid @RequestBody OrderDTO orderDTO, 
                                                 Authentication authentication) {
        try {
            OrderDTO updatedOrder = orderService.updateOrder(id, orderDTO);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Long id, 
                                                      @RequestParam Order.OrderStatus status, 
                                                      Authentication authentication) {
        try {
            OrderDTO updatedOrder = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id, Authentication authentication) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<OrderDTO>> searchOrdersByCustomerName(@RequestParam String name, Authentication authentication) {
        List<OrderDTO> orders = orderService.searchOrdersByCustomerName(name);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<OrderDTO>> getOrdersByDateRange(@RequestParam String startDate, 
                                                             @RequestParam String endDate, 
                                                             Authentication authentication) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            List<OrderDTO> orders = orderService.getOrdersByDateRange(start, end);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/amount-range")
    public ResponseEntity<List<OrderDTO>> getOrdersByAmountRange(@RequestParam BigDecimal minAmount, 
                                                               @RequestParam BigDecimal maxAmount, 
                                                               Authentication authentication) {
        List<OrderDTO> orders = orderService.getOrdersByAmountRange(minAmount, maxAmount);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/stats/count/{status}")
    public ResponseEntity<Long> getOrdersCountByStatus(@PathVariable Order.OrderStatus status, Authentication authentication) {
        Long count = orderService.getOrdersCountByStatus(status);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/stats/revenue")
    public ResponseEntity<BigDecimal> getTotalRevenue(Authentication authentication) {
        BigDecimal revenue = orderService.getTotalRevenue();
        return ResponseEntity.ok(revenue);
    }

    @GetMapping("/admin")
    public ResponseEntity<String> adminOrders(Authentication authentication) {
        return ResponseEntity.ok("Gestion des commandes (ADMIN) : " + authentication.getName());
    }
}
