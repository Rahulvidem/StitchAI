package com.stitchai.api;

import com.stitchai.api.ApiModels.ArtworkRequest;
import com.stitchai.api.ApiModels.ChatRequest;
import com.stitchai.api.ApiModels.CheckoutRequest;
import com.stitchai.api.ApiModels.OrderRequest;
import com.stitchai.api.ApiModels.QuoteRequest;
import com.stitchai.api.ApiModels.StageRequest;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final AppDataService data;
    private final ChatService chat;

    public ApiController(AppDataService data, ChatService chat) {
        this.data = data;
        this.chat = chat;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "healthy", "platform", "StitchAI", "version", "4.0.0",
                "database", "SQL", "modules", List.of("Orders", "Quotations", "Embroidery Studio", "AI RAG Assistant"));
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(Authentication authentication) {
        return data.dashboard(authentication.getName());
    }

    @GetMapping("/orders")
    public List<Map<String, Object>> orders(Authentication authentication) {
        return data.orders(authentication.getName());
    }

    @PostMapping("/orders")
    public Map<String, Object> createOrder(Authentication authentication,
                                           @Valid @RequestBody OrderRequest request) {
        return data.createOrder(authentication.getName(), request);
    }

    @PatchMapping("/orders/{id}/stage")
    public Map<String, Object> updateStage(Authentication authentication, @PathVariable String id,
                                           @Valid @RequestBody StageRequest request) {
        return data.updateStage(id, authentication.getName(), request.stage(), request.stageTitle());
    }

    @PostMapping("/orders/{id}/checkout")
    public Map<String, Object> checkout(Authentication authentication, @PathVariable String id,
                                        @Valid @RequestBody CheckoutRequest request) {
        if (!id.equals(request.orderId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order ID in the URL and request must match.");
        }
        return data.checkout(authentication.getName(), request);
    }

    @GetMapping("/leads")
    public List<Map<String, Object>> leads() {
        return data.leads();
    }

    @GetMapping("/quotes")
    public List<Map<String, Object>> quotes(Authentication authentication) {
        return data.quotes(authentication.getName());
    }

    @PostMapping("/quotes")
    public Map<String, Object> createQuote(Authentication authentication,
                                           @Valid @RequestBody QuoteRequest request) {
        return data.createQuote(authentication.getName(), request);
    }

    @PostMapping("/artworks/analyze")
    public Map<String, Object> analyzeArtwork(Authentication authentication,
                                              @RequestBody(required = false) Map<String, Object> body) {
        String filename = body == null ? null : stringValue(body.get("filename"));
        return data.analyzeArtwork(authentication.getName(), filename);
    }

    @PostMapping("/ai/chat")
    public Map<String, Object> chat(Authentication authentication, @Valid @RequestBody ChatRequest request) {
        return chat.answer(request.message().trim());
    }

    @GetMapping("/jobs")
    public Map<String, Object> jobs() {
        return Map.of("jobs", data.jobs());
    }

    @GetMapping("/db/orders")
    public Map<String, Object> legacyOrders(Authentication authentication) {
        return Map.of("orders", data.orders(authentication.getName()));
    }

    @GetMapping("/db/leads")
    public Map<String, Object> legacyLeads() {
        return Map.of("leads", data.leads());
    }

    @PostMapping("/quote")
    public Map<String, Object> legacyQuote(Authentication authentication,
                                           @Valid @RequestBody QuoteRequest request) {
        return data.createQuote(authentication.getName(), request);
    }

    @PostMapping("/analyze-artwork")
    public Map<String, Object> legacyAnalyzeArtwork(Authentication authentication,
                                                    @RequestBody(required = false) Map<String, Object> body) {
        String filename = body == null ? null : stringValue(body.get("filename"));
        return data.analyzeArtwork(authentication.getName(), filename);
    }

    @PostMapping("/db/artworks")
    public Map<String, Object> legacySaveArtwork(Authentication authentication,
                                                 @Valid @RequestBody ArtworkRequest request) {
        return data.saveArtwork(authentication.getName(), request);
    }

    @PostMapping("/db/checkout")
    public Map<String, Object> legacyCheckout(Authentication authentication,
                                              @Valid @RequestBody CheckoutRequest request) {
        return data.checkout(authentication.getName(), request);
    }

    @PostMapping("/db/orders/create")
    public Map<String, Object> legacyCreateOrder(Authentication authentication,
                                                 @Valid @RequestBody OrderRequest request) {
        Map<String, Object> order = data.createOrder(authentication.getName(), request);
        Map<String, Object> result = new HashMap<>();
        result.put("status", "created");
        result.put("order_id", order.get("id"));
        result.put("order", order);
        return result;
    }

    @PostMapping("/db/orders/{id}/stage")
    public Map<String, Object> legacyUpdateStage(Authentication authentication, @PathVariable String id,
                                                 @Valid @RequestBody StageRequest request) {
        return data.updateStage(id, authentication.getName(), request.stage(), request.stageTitle());
    }

    @PostMapping("/gemini/chat")
    public Map<String, Object> legacyChat(@Valid @RequestBody ChatRequest request) {
        Map<String, Object> response = chat.answer(request.message().trim());
        return Map.of("reply", response.get("answer"), "source", response.get("mode"),
                "sources", response.get("sources"));
    }

    @PostMapping("/whatsapp-simulator")
    public Map<String, Object> whatsapp(@RequestBody(required = false) Map<String, Object> request) {
        String message = request == null ? "" : stringValue(request.get("message"));
        return Map.of("received", message, "aiResponse",
                "Thanks for contacting StitchAI. A production specialist will help with your custom apparel order.",
                "status", "dispatched");
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }
}
