package com.example.awseks.api

import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@SpringBootTest
@AutoConfigureMockMvc
class ApiControllerTest {

    @Autowired
    lateinit var mockMvc: MockMvc

    @Test
    fun `health returns ok`() {
        mockMvc.get("/health")
            .andExpect {
                status { isOk() }
                jsonPath("$.status", equalTo("ok"))
            }
    }

    @Test
    fun `hello returns frontend message`() {
        mockMvc.get("/api/hello")
            .andExpect {
                status { isOk() }
                jsonPath("$.message", equalTo("Hello from Kotlin Spring Boot on EKS"))
            }
    }
}
