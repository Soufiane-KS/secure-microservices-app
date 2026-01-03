package ma.enset.orderservice.repository;

import ma.enset.orderservice.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByCustomerEmail(String customerEmail);
    
    List<Order> findByStatus(Order.OrderStatus status);
    
    List<Order> findByCustomerEmailAndStatus(String customerEmail, Order.OrderStatus status);
    
    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    List<Order> findByTotalAmountBetween(BigDecimal minAmount, BigDecimal maxAmount);
    
    @Query("SELECT o FROM Order o WHERE o.customerName LIKE %:name%")
    List<Order> findByCustomerNameContaining(@Param("name") String name);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(@Param("status") Order.OrderStatus status);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status != 'CANCELLED'")
    BigDecimal sumTotalRevenue();
    
    @Query("SELECT o FROM Order o WHERE o.status = 'PENDING' AND o.createdAt < :date")
    List<Order> findPendingOrdersOlderThan(@Param("date") LocalDateTime date);
}
