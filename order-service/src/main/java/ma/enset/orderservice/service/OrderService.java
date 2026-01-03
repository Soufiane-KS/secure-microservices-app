package ma.enset.orderservice.service;

import ma.enset.orderservice.dto.OrderDTO;
import ma.enset.orderservice.dto.OrderItemDTO;
import ma.enset.orderservice.entity.Order;
import ma.enset.orderservice.entity.OrderItem;
import ma.enset.orderservice.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<OrderDTO> getOrderById(Long id) {
        return orderRepository.findById(id)
                .map(this::convertToDTO);
    }

    public List<OrderDTO> getOrdersByCustomerEmail(String customerEmail) {
        return orderRepository.findByCustomerEmail(customerEmail).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO createOrder(OrderDTO orderDTO) {
        Order order = convertToEntity(orderDTO);
        Order savedOrder = orderRepository.save(order);
        return convertToDTO(savedOrder);
    }

    public OrderDTO updateOrder(Long id, OrderDTO orderDTO) {
        return orderRepository.findById(id)
                .map(existingOrder -> {
                    existingOrder.setCustomerName(orderDTO.getCustomerName());
                    existingOrder.setCustomerEmail(orderDTO.getCustomerEmail());
                    existingOrder.setTotalAmount(orderDTO.getTotalAmount());
                    if (orderDTO.getStatus() != null) {
                        existingOrder.setStatus(Order.OrderStatus.valueOf(orderDTO.getStatus().name()));
                    }
                    
                    Order updatedOrder = orderRepository.save(existingOrder);
                    return convertToDTO(updatedOrder);
                })
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    public OrderDTO updateOrderStatus(Long id, Order.OrderStatus status) {
        return orderRepository.findById(id)
                .map(existingOrder -> {
                    existingOrder.setStatus(status);
                    Order updatedOrder = orderRepository.save(existingOrder);
                    return convertToDTO(updatedOrder);
                })
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Order not found with id: " + id);
        }
        orderRepository.deleteById(id);
    }

    public List<OrderDTO> searchOrdersByCustomerName(String name) {
        return orderRepository.findByCustomerNameContaining(name).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByCreatedAtBetween(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getOrdersByAmountRange(BigDecimal minAmount, BigDecimal maxAmount) {
        return orderRepository.findByTotalAmountBetween(minAmount, maxAmount).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Long getOrdersCountByStatus(Order.OrderStatus status) {
        return orderRepository.countByStatus(status);
    }

    public BigDecimal getTotalRevenue() {
        return orderRepository.sumTotalRevenue();
    }

    public List<OrderDTO> getPendingOrdersOlderThan(LocalDateTime date) {
        return orderRepository.findPendingOrdersOlderThan(date).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private OrderDTO convertToDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(this::convertOrderItemToDTO)
                .collect(Collectors.toList());

        return new OrderDTO(
                order.getId(),
                order.getCustomerName(),
                order.getCustomerEmail(),
                order.getTotalAmount(),
                OrderDTO.OrderStatus.valueOf(order.getStatus().name()),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                itemDTOs
        );
    }

    private OrderItemDTO convertOrderItemToDTO(OrderItem orderItem) {
        return new OrderItemDTO(
                orderItem.getId(),
                orderItem.getOrder().getId(),
                orderItem.getProductName(),
                orderItem.getQuantity(),
                orderItem.getUnitPrice(),
                orderItem.getTotalPrice()
        );
    }

    private Order convertToEntity(OrderDTO orderDTO) {
        Order order = new Order();
        order.setCustomerName(orderDTO.getCustomerName());
        order.setCustomerEmail(orderDTO.getCustomerEmail());
        order.setTotalAmount(orderDTO.getTotalAmount());
        if (orderDTO.getStatus() != null) {
            order.setStatus(Order.OrderStatus.valueOf(orderDTO.getStatus().name()));
        }
        
        if (orderDTO.getItems() != null) {
            List<OrderItem> items = orderDTO.getItems().stream()
                    .map(this::convertOrderItemToEntity)
                    .collect(Collectors.toList());
            order.setItems(items);
            items.forEach(item -> item.setOrder(order));
        }
        
        return order;
    }

    private OrderItem convertOrderItemToEntity(OrderItemDTO orderItemDTO) {
        OrderItem orderItem = new OrderItem();
        orderItem.setProductName(orderItemDTO.getProductName());
        orderItem.setQuantity(orderItemDTO.getQuantity());
        orderItem.setUnitPrice(orderItemDTO.getUnitPrice());
        return orderItem;
    }
}
