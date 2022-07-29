package net.dgkim.example.hello;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import net.dgkim.example.hello.entity.Customer;
import net.dgkim.example.hello.repository.CustomerRepository;

@SpringBootApplication
public class CustomerApplication {

    public static final Logger logger = LoggerFactory.getLogger(CustomerApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(CustomerApplication.class, args);
    }

    @Bean
    public CommandLineRunner hello(CustomerRepository repository) {
        return (args) -> {
            repository.save(new Customer("Deokgon", "Kim"));

            logger.info("All customers");
            for (Customer customer : repository.findAll()) {
                logger.info(customer.toString());
            }

            Customer customer = repository.findById(1L);
            logger.info("Customer found with findById(1L)");
            logger.info(customer.toString());

            repository.findByFirstName("Deokgon").forEach((dg) -> {
                logger.info(dg.toString());
            });
        };
    }
}
