package com.example.awseks.api

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

data class HealthResponse(val status: String)
data class HelloResponse(val message: String)

@RestController
class ApiController {

    @GetMapping("/health")
    fun health(): HealthResponse = HealthResponse(status = "ok")

    @GetMapping("/api/hello")
    fun hello(): HelloResponse = HelloResponse(message = "Hello from Kotlin Spring Boot on EKS")
}
