package com.stitchai.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:stitchai-test;DB_CLOSE_DELAY=-1",
        "app.jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "app.gemini.api-key="
})
class ApiWorkflowTest {
    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate rest;

    @Test
    void jwtProtectsWorkspaceAndAllowsQuoteOrderPaymentAndRagWorkflows() {
        ResponseEntity<Map> unauthenticated = rest.getForEntity(url("/api/dashboard"), Map.class);
        assertEquals(HttpStatus.UNAUTHORIZED, unauthenticated.getStatusCode());

        String email = "workflow-" + UUID.randomUUID() + "@example.test";
        ResponseEntity<Map> registration = rest.postForEntity(url("/api/auth/register"), Map.of(
                "name", "Workflow Tester", "email", email, "password", "stitchai-test-password"), Map.class);
        assertEquals(HttpStatus.OK, registration.getStatusCode());
        String token = registration.getBody().get("token").toString();
        assertNotNull(token);
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Map> dashboard = rest.exchange(url("/api/dashboard"), HttpMethod.GET,
                new HttpEntity<>(headers), Map.class);
        assertEquals(HttpStatus.OK, dashboard.getStatusCode());
        assertTrue(dashboard.getBody().containsKey("orders"));

        ResponseEntity<Map> quote = rest.postForEntity(url("/api/quotes"), new HttpEntity<>(Map.of(
                "clientName", "Northstar Running Club", "garmentType", "hoodie", "quantity", 80,
                "stitches", 12000, "placements", 1, "speed", "standard", "polybagging", true,
                "wovenTags", false), headers), Map.class);
        assertEquals(HttpStatus.OK, quote.getStatusCode());
        BigDecimal total = new BigDecimal(quote.getBody().get("totalAmount").toString());
        assertTrue(total.compareTo(BigDecimal.ZERO) > 0);

        ResponseEntity<Map> createdOrder = rest.postForEntity(url("/api/orders"), new HttpEntity<>(Map.of(
                "client", "Northstar Running Club", "title", "Custom hoodie order",
                "garment", "hoodie", "quantity", 80, "stitchCount", 12000,
                "totalPrice", total), headers), Map.class);
        assertEquals(HttpStatus.OK, createdOrder.getStatusCode());
        String orderId = createdOrder.getBody().get("id").toString();

        ResponseEntity<Map> advanced = rest.exchange(url("/api/orders/" + orderId + "/stage"),
                HttpMethod.PATCH, new HttpEntity<>(Map.of("stage", 2), headers), Map.class);
        assertEquals(HttpStatus.OK, advanced.getStatusCode());
        assertEquals(2, ((Number) advanced.getBody().get("current_stage")).intValue());

        ResponseEntity<Map> payment = rest.postForEntity(url("/api/orders/" + orderId + "/checkout"),
                new HttpEntity<>(Map.of("orderId", orderId, "amount", total,
                        "gateway", "stripe", "last4", "4242"), headers), Map.class);
        assertEquals(HttpStatus.OK, payment.getStatusCode());
        assertEquals("simulation", payment.getBody().get("mode"));
        assertTrue(payment.getBody().get("message").toString().contains("No card or bank was charged"));

        ResponseEntity<Map> answer = rest.postForEntity(url("/api/ai/chat"),
                new HttpEntity<>(Map.of("message", "What backing should I choose for stretchy knit embroidery?"), headers),
                Map.class);
        assertEquals(HttpStatus.OK, answer.getStatusCode());
        assertEquals("local-rag", answer.getBody().get("mode"));
        assertFalse(((java.util.List<?>) answer.getBody().get("sources")).isEmpty());
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }
}
