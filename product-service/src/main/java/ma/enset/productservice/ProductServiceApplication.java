package ma.enset.productservice;

import ma.enset.productservice.entity.Product;
import ma.enset.productservice.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;
import java.util.Arrays;

@SpringBootApplication
public class ProductServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProductServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner start(ProductRepository productRepository) {
        return args -> {
            // Check if data already exists
            if (productRepository.count() == 0) {
                // Electronics
                Product product1 = new Product("Laptop Dell XPS 15", "High-performance laptop with Intel i7, 16GB RAM and 512GB SSD", new BigDecimal("1299.99"), 25);
                Product product2 = new Product("iPhone 15 Pro", "Latest iPhone with A17 Pro chip and titanium design", new BigDecimal("1199.99"), 50);
                Product product3 = new Product("Samsung Galaxy S24 Ultra", "Flagship Android phone with S Pen and 200MP camera", new BigDecimal("1299.99"), 35);
                Product product4 = new Product("iPad Pro 12.9\"", "Professional tablet with M2 chip and Liquid Retina XDR display", new BigDecimal("1099.99"), 30);
                Product product5 = new Product("MacBook Pro 14\" M3", "Powerful laptop with M3 Pro chip for creative professionals", new BigDecimal("1999.99"), 20);
                Product product6 = new Product("AirPods Pro 2nd Gen", "Wireless earbuds with adaptive audio and USB-C", new BigDecimal("249.99"), 100);
                Product product7 = new Product("Sony WH-1000XM5", "Industry-leading noise-canceling over-ear headphones", new BigDecimal("399.99"), 45);
                Product product8 = new Product("Apple Watch Series 9", "Advanced smartwatch with double tap gesture and health sensors", new BigDecimal("429.99"), 60);
                Product product9 = new Product("Samsung Galaxy Watch 6", "Sleek smartwatch with personalized health insights", new BigDecimal("299.99"), 40);
                Product product10 = new Product("Kindle Paperwhite Signature", "Premium e-reader with auto-adjusting light and wireless charging", new BigDecimal("189.99"), 80);
                
                // Gaming
                Product product11 = new Product("PlayStation 5", "Next-gen gaming console with 4K graphics and ultra-fast SSD", new BigDecimal("499.99"), 30);
                Product product12 = new Product("Xbox Series X", "Powerful gaming console with ray tracing support", new BigDecimal("499.99"), 28);
                Product product13 = new Product("Nintendo Switch OLED", "Hybrid console with vibrant 7-inch OLED screen", new BigDecimal("349.99"), 55);
                Product product14 = new Product("Steam Deck", "Portable PC gaming device by Valve", new BigDecimal("399.99"), 25);
                Product product15 = new Product("Meta Quest 3", "Advanced VR headset with mixed reality capabilities", new BigDecimal("499.99"), 20);
                
                // Computer Accessories
                Product product16 = new Product("Logitech MX Master 3S", "Ergonomic wireless mouse for productivity", new BigDecimal("99.99"), 75);
                Product product17 = new Product("Keychron K8 Pro", "Wireless mechanical keyboard with hot-swappable switches", new BigDecimal("109.99"), 50);
                Product product18 = new Product("LG 27\" 4K Monitor", "UHD monitor with HDR10 and USB-C connectivity", new BigDecimal("449.99"), 35);
                Product product19 = new Product("Dell UltraSharp 34\" Curved", "Ultra-wide curved monitor for immersive productivity", new BigDecimal("699.99"), 20);
                Product product20 = new Product("Webcam Logitech Brio 4K", "Professional 4K webcam with auto-light correction", new BigDecimal("199.99"), 40);
                
                // Audio
                Product product21 = new Product("Bose QuietComfort 45", "Comfortable noise-canceling headphones with 24h battery", new BigDecimal("329.99"), 45);
                Product product22 = new Product("JBL Flip 6", "Portable Bluetooth speaker with powerful bass", new BigDecimal("129.99"), 90);
                Product product23 = new Product("Sonos Era 100", "Smart speaker with spatial audio", new BigDecimal("249.99"), 35);
                Product product24 = new Product("Rode NT-USB", "Professional USB microphone for content creators", new BigDecimal("169.99"), 30);
                Product product25 = new Product("Audio-Technica ATH-M50x", "Professional studio monitor headphones", new BigDecimal("149.99"), 55);
                
                // Smart Home
                Product product26 = new Product("Amazon Echo Dot 5th Gen", "Smart speaker with Alexa voice assistant", new BigDecimal("49.99"), 120);
                Product product27 = new Product("Google Nest Hub Max", "Smart display with Google Assistant and 10\" screen", new BigDecimal("229.99"), 40);
                Product product28 = new Product("Ring Video Doorbell Pro 2", "Smart doorbell with 1536p HD video and 3D motion detection", new BigDecimal("249.99"), 50);
                Product product29 = new Product("Philips Hue Starter Kit", "Smart LED lighting system with color changing bulbs", new BigDecimal("199.99"), 65);
                Product product30 = new Product("Nest Learning Thermostat", "Smart thermostat that learns your schedule", new BigDecimal("249.99"), 35);

                // Save all products
                productRepository.saveAll(Arrays.asList(
                    product1, product2, product3, product4, product5,
                    product6, product7, product8, product9, product10,
                    product11, product12, product13, product14, product15,
                    product16, product17, product18, product19, product20,
                    product21, product22, product23, product24, product25,
                    product26, product27, product28, product29, product30
                ));
                
                System.out.println("✅ 30 products initialized successfully in product_service database!");
            } else {
                System.out.println("ℹ️ Products already exist in database. Count: " + productRepository.count());
            }
        };
    }

}
