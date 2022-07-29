package net.dgkim.example.hello.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import net.dgkim.example.hello.entity.Customer;

public interface CustomerRepository extends CrudRepository<Customer, Long> {
    
    List<Customer> findByFirstName(String firstName);

    Customer findById(long id);
}
