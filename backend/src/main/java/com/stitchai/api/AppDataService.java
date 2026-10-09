package com.stitchai.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stitchai.api.ApiModels.ArtworkRequest;
import com.stitchai.api.ApiModels.CheckoutRequest;
import com.stitchai.api.ApiModels.OrderRequest;
import com.stitchai.api.ApiModels.QuoteRequest;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AppDataService {
    private static final Map<String, List<BigDecimal>> GARMENT_PRICES = Map.of(
            "hoodie", prices("32.00", "24.50", "19.80", "16.50"),
            "tshirt", prices("18.00", "13.50", "10.80", "8.90"),
            "polo", prices("24.00", "18.50", "15.20", "12.80"),
            "cap", prices("19.50", "14.80", "11.90", "9.75"),
            "bomber", prices("58.00", "46.00", "38.50", "32.00"),
            "apron", prices("22.00", "17.00", "13.50", "11.20"));
    private static final List<String> STAGES = List.of(
            "Inquiry & AI Quotation", "Digital Tech-Pack Generated", "Proof Approval",
            "Garment Sourcing & Knits", "Multi-Head CNC Embroidery",
            "AI Computer Vision QC Inspection", "Custom Labeling & Packaging", "Dispatch & Express Delivery");
    private static final RowMapper<Map<String, Object>> MAP_ROW_MAPPER = AppDataService::mapRow;

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    public AppDataService(JdbcTemplate jdbc, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
    }

    private static List<BigDecimal> prices(String... values) {
        return java.util.Arrays.stream(values).map(BigDecimal::new).toList();
    }

    public List<Map<String, Object>> orders(String email) {
        return jdbc.query("""
                SELECT * FROM orders WHERE owner_email IS NULL OR owner_email = ?
                ORDER BY created_at DESC
                """, MAP_ROW_MAPPER, email);
    }

    public List<Map<String, Object>> leads() {
        return jdbc.query("SELECT * FROM leads ORDER BY intent_score DESC", MAP_ROW_MAPPER);
    }

    public Map<String, Object> dashboard(String email) {
        Map<String, Object> result = new HashMap<>();
        result.put("orders", orders(email));
        result.put("leads", leads());
        return result;
    }

    public Map<String, Object> createQuote(String email, QuoteRequest request) {
        String garmentType = request.garmentType().trim().toLowerCase();
        List<BigDecimal> tiers = GARMENT_PRICES.get(garmentType);
        if (tiers == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a supported garment type.");
        }
        int quantity = request.quantity();
        int tier = quantity >= 500 ? 3 : quantity >= 200 ? 2 : quantity >= 50 ? 1 : 0;
        int stitches = request.stitches() == null ? 16840 : request.stitches();
        int placements = request.placements() == null ? 1 : request.placements();
        boolean polybagging = Boolean.TRUE.equals(request.polybagging());
        boolean wovenTags = Boolean.TRUE.equals(request.wovenTags());
        String speed = request.speed() == null ? "standard" : request.speed().toLowerCase();
        if (!List.of("standard", "express", "rush").contains(speed)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Turnaround must be standard, express, or rush.");
        }

        BigDecimal base = tiers.get(tier);
        BigDecimal embroidery = BigDecimal.valueOf(stitches)
                .divide(BigDecimal.valueOf(1000), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("0.32"))
                .multiply(BigDecimal.valueOf(placements));
        BigDecimal finishing = (polybagging ? new BigDecimal("0.70") : BigDecimal.ZERO)
                .add(wovenTags ? new BigDecimal("1.25") : BigDecimal.ZERO);
        BigDecimal speedMultiplier = switch (speed) {
            case "rush" -> new BigDecimal("1.35");
            case "express" -> new BigDecimal("1.15");
            default -> BigDecimal.ONE;
        };
        BigDecimal unitPrice = base.add(embroidery).add(finishing).multiply(speedMultiplier)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
        String leadTime = switch (speed) {
            case "rush" -> "48–72 Hours";
            case "express" -> "4–6 Business Days";
            default -> "7–10 Business Days";
        };
        List<Map<String, Object>> lineItems = List.of(
                Map.of("name", "Garment", "unitAmount", base),
                Map.of("name", "Embroidery", "unitAmount", embroidery),
                Map.of("name", "Finishing", "unitAmount", finishing),
                Map.of("name", "Turnaround", "multiplier", speedMultiplier));
        String id = "QT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        jdbc.update("""
                INSERT INTO quotes (id, owner_email, client_name, garment_type, quantity, stitch_count,
                unit_price, total_amount, lead_time, valid_until, line_items_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, email, request.clientName().trim(), garmentType, quantity, stitches,
                unitPrice, total, leadTime, LocalDate.now().plusDays(14), toJson(lineItems));

        Map<String, Object> quote = new HashMap<>();
        quote.put("id", id);
        quote.put("clientName", request.clientName().trim());
        quote.put("garmentType", garmentType);
        quote.put("quantity", quantity);
        quote.put("stitches", stitches);
        quote.put("unitPrice", unitPrice);
        quote.put("totalAmount", total);
        quote.put("leadTime", leadTime);
        quote.put("validUntil", LocalDate.now().plusDays(14).toString());
        quote.put("lineItems", lineItems);
        return quote;
    }

    public List<Map<String, Object>> quotes(String email) {
        return jdbc.query("SELECT * FROM quotes WHERE owner_email = ? ORDER BY created_at DESC", MAP_ROW_MAPPER, email);
    }

    @Transactional
    public Map<String, Object> createOrder(String email, OrderRequest request) {
        String id = "ST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        jdbc.update("""
                INSERT INTO orders (id, owner_email, client, title, garment, garment_color, quantity,
                stitch_count, current_stage, stage_title, total_price, payment_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'Pending')
                """, id, email, hasText(request.client()) ? request.client().trim() : "Customer",
                hasText(request.title()) ? request.title().trim() : "Custom apparel order",
                hasText(request.garment()) ? request.garment().trim() : "Heavyweight Hoodie",
                hasText(request.garmentColor()) ? request.garmentColor().trim() : "Black",
                request.quantity() == null ? 50 : request.quantity(),
                request.stitchCount() == null ? 16840 : request.stitchCount(),
                STAGES.getFirst(),
                request.totalPrice() == null ? BigDecimal.ZERO : request.totalPrice());
        return orderForOwner(id, email);
    }

    public Map<String, Object> updateStage(String id, String email, int stage, String title) {
        if (stage < 0 || stage >= STAGES.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order stage must be between 0 and 7.");
        }
        int updated = jdbc.update("""
                UPDATE orders SET current_stage = ?, stage_title = ?
                WHERE id = ? AND (owner_email IS NULL OR owner_email = ?)
                """, stage, hasText(title) ? title.trim() : STAGES.get(stage), id, email);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order was not found.");
        }
        return orderForOwner(id, email);
    }

    @Transactional
    public Map<String, Object> checkout(String email, CheckoutRequest request) {
        Map<String, Object> order = orderForOwner(request.orderId(), email);
        BigDecimal orderTotal = new BigDecimal(order.get("total_price").toString()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal amount = request.amount().setScale(2, RoundingMode.HALF_UP);
        if (orderTotal.signum() <= 0 || amount.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Checkout requires a positive order total.");
        }
        if (amount.compareTo(orderTotal) != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment amount must match the saved order total.");
        }
        String gateway = request.gateway().trim().toLowerCase();
        if (!List.of("stripe", "razorpay").contains(gateway)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported payment gateway.");
        }
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String receipt = "REC-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String details = toJson(Map.of(
                "mode", "simulation",
                "method", gateway.equals("stripe") ? "Card" : "UPI / NetBanking",
                "last4", request.last4() == null ? "4242" : request.last4()));
        jdbc.update("""
                INSERT INTO transactions (id, order_id, amount, payment_gateway, status, receipt_no, payment_details_json)
                VALUES (?, ?, ?, ?, 'Succeeded', ?, ?)
                """, transactionId, request.orderId(), amount, gateway.toUpperCase(), receipt, details);
        jdbc.update("""
                UPDATE orders SET payment_status = 'Paid', current_stage = 3, stage_title = ?
                WHERE id = ? AND (owner_email IS NULL OR owner_email = ?)
                """, "Payment Received - Garment Sourcing in Progress", request.orderId(), email);
        return Map.of(
                "status", "success",
                "transaction_id", transactionId,
                "order_id", request.orderId(),
                "amount", amount,
                "receipt_url", "/receipts/" + transactionId + ".pdf",
                "mode", "simulation",
                "message", "Payment recorded in simulation mode. No card or bank was charged.");
    }

    public Map<String, Object> analyzeArtwork(String email, String filename) {
        String safeFilename = hasText(filename) ? filename.trim() : "custom-artwork.png";
        int tatami = (int) Math.round(4.2 * 3.8 * 0.55 * 1750);
        int satin = (int) Math.round(2 * (4.2 + 3.8) * 1.8 * 160);
        int stitches = tatami + satin;
        List<Map<String, Object>> threads = threadColors();
        String id = persistArtwork(email, safeFilename, "4.2\" W × 3.8\" H", 84, stitches, threads,
                "Eligible for Outer 3D Puff Border");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("artwork_id", id);
        response.put("filename", safeFilename);
        response.put("dimensions", "4.2\" W × 3.8\" H");
        response.put("stitchCount", stitches);
        response.put("tatamiStitches", tatami);
        response.put("satinStitches", satin);
        response.put("complexityScore", 84);
        response.put("estimatedRunTimeMinutes", Math.round((stitches / 850.0 + 1.2) * 10.0) / 10.0);
        response.put("colorCount", threads.size());
        response.put("threadColors", threads);
        response.put("recommendedBacking", "3.0 oz Heavyweight Cutaway Backing");
        response.put("underlayType", "Dual Zig-Zag + Tatami Grid Underlay");
        response.put("puffEligibility", "Eligible for Outer 3D Puff Border");
        return response;
    }

    public Map<String, Object> saveArtwork(String email, ArtworkRequest request) {
        List<Map<String, Object>> colors = request.threadColors() instanceof List<?> list
                ? castColorList(list) : List.of();
        String id = persistArtwork(email, hasText(request.filename()) ? request.filename() : "custom-artwork.png",
                request.dimensions(), defaultInt(request.complexityScore(), 84),
                defaultInt(request.stitchCount(), 0), colors,
                hasText(request.puffEligibility()) ? request.puffEligibility() : "Not assessed");
        return Map.of("status", "created", "artwork_id", id);
    }

    public List<Map<String, Object>> jobs() {
        return List.of(
                Map.ofEntries(
                        Map.entry("id", "JOB-7021"), Map.entry("title", "300x Heavyweight Crewnecks for Tech Summit"),
                        Map.entry("client", "NextWave AI Corp"), Map.entry("units", 300),
                        Map.entry("stitchCount", 18200), Map.entry("colors", 4),
                        Map.entry("garment", "380 GSM Organic French Terry"), Map.entry("deadline", "7 Days"),
                        Map.entry("payout", "$3,850.00"), Map.entry("margin", "38%"),
                        Map.entry("recommendedMachine", "Tajima / Barudan (8+ Heads)"),
                        Map.entry("location", "Oakland Hub"), Map.entry("status", "Open for Bidding")),
                Map.ofEntries(
                        Map.entry("id", "JOB-7022"), Map.entry("title", "150x Performance Pique Polos (Left Chest)"),
                        Map.entry("client", "Apex Capital Partners"), Map.entry("units", 150),
                        Map.entry("stitchCount", 9400), Map.entry("colors", 3),
                        Map.entry("garment", "100% Combed Pique Cotton"), Map.entry("deadline", "4 Days"),
                        Map.entry("payout", "$1,620.00"), Map.entry("margin", "42%"),
                        Map.entry("recommendedMachine", "Brother / Happy 4-Head"),
                        Map.entry("location", "San Jose Hub"), Map.entry("status", "Open for Bidding")),
                Map.ofEntries(
                        Map.entry("id", "JOB-7023"), Map.entry("title", "85x Structured Snapback Caps (3D Puff)"),
                        Map.entry("client", "IronForge Athletics"), Map.entry("units", 85),
                        Map.entry("stitchCount", 22400), Map.entry("colors", 2),
                        Map.entry("garment", "Wool Blend 6-Panel Cap"), Map.entry("deadline", "5 Days"),
                        Map.entry("payout", "$1,190.00"), Map.entry("margin", "45%"),
                        Map.entry("recommendedMachine", "Tubular Cap Driver Ready"),
                        Map.entry("location", "Fremont Facility"), Map.entry("status", "Assigned")));
    }

    public Map<String, Object> orderForOwner(String id, String email) {
        List<Map<String, Object>> rows = jdbc.query("""
                SELECT * FROM orders WHERE id = ? AND (owner_email IS NULL OR owner_email = ?)
                """, MAP_ROW_MAPPER, id, email);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order was not found.");
        return rows.getFirst();
    }

    private String persistArtwork(String email, String filename, String dimensions, int complexity, int stitches,
                                  List<Map<String, Object>> colors, String puffEligibility) {
        String id = "AW-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        jdbc.update("""
                INSERT INTO artworks (id, owner_email, filename, dimensions, complexity_score, stitch_count,
                colors_count, colors_json, puff_eligibility)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, email, filename, dimensions, complexity, stitches, colors.size(), toJson(colors), puffEligibility);
        return id;
    }

    private List<Map<String, Object>> threadColors() {
        return List.of(
                Map.of("name", "Madeira Classic White", "hex", "#FFFFFF", "code", "1801", "percentage", 38),
                Map.of("name", "Madeira Electric Indigo", "hex", "#6366F1", "code", "1738", "percentage", 32),
                Map.of("name", "Madeira Cyan Riviera", "hex", "#06B6D4", "code", "1846", "percentage", 18),
                Map.of("name", "Madeira Platinum Silver", "hex", "#94A3B8", "code", "1810", "percentage", 12));
    }

    private List<Map<String, Object>> castColorList(List<?> values) {
        List<Map<String, Object>> colors = new ArrayList<>();
        for (Object value : values) {
            if (value instanceof Map<?, ?> map) {
                Map<String, Object> color = new HashMap<>();
                map.forEach((key, item) -> color.put(String.valueOf(key), item));
                colors.add(color);
            }
        }
        return colors;
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not encode persisted JSON data.", exception);
        }
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private static int defaultInt(Integer value, int fallback) {
        return value == null ? fallback : value;
    }

    private static Map<String, Object> mapRow(ResultSet result, int rowNumber) throws SQLException {
        Map<String, Object> values = new HashMap<>();
        var metadata = result.getMetaData();
        for (int column = 1; column <= metadata.getColumnCount(); column++) {
            values.put(metadata.getColumnLabel(column).toLowerCase(), result.getObject(column));
        }
        return values;
    }
}
