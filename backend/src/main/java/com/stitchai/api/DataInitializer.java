package com.stitchai.api;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    private final JdbcTemplate jdbc;

    public DataInitializer(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) {
        if (jdbc.queryForObject("SELECT COUNT(*) FROM orders", Integer.class) == 0) {
            jdbc.update("""
                    INSERT INTO orders (id, client, title, garment, garment_color, quantity, stitch_count,
                    current_stage, stage_title, total_price, payment_status, tracking_carrier)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, "ST-8942", "Stanford Robotics & AI Club",
                    "250x Heavyweight Terry Hoodies with 3D Puff Embroidery",
                    "Heavyweight Fleece Hoodie (400 GSM)", "Onyx Black", 250, 16840, 2,
                    "Digital Tech-Pack Proof Approval", new BigDecimal("5600.00"), "Paid",
                    "FedEx Priority Air (Tracking: #FX-98214-US)");
            jdbc.update("""
                    INSERT INTO orders (id, client, title, garment, garment_color, quantity, stitch_count,
                    current_stage, stage_title, total_price, payment_status, tracking_carrier)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, "ST-8943", "IronForge CrossFit Club",
                    "600x Pro-Stretch DryFit Crewneck Tees", "Oversized Streetwear T-Shirt (240 GSM)",
                    "Charcoal Grey", 600, 21500, 4, "Multi-Head CNC Embroidery in Progress",
                    new BigDecimal("6840.00"), "Paid", "DHL Express Freight");
        }

        if (jdbc.queryForObject("SELECT COUNT(*) FROM leads", Integer.class) == 0) {
            List<Object[]> leads = List.of(
                    new Object[]{"LD-904", "Elena Rostova", "Berkeley Autonomous Driving Club", "$4,650 (320 Hoodies)", 96, "High Value - Immediate Buy", "AI Scored High-Intent", "AI Sales Agent sent volume price tier proposal", "Web Chat + WhatsApp"},
                    new Object[]{"LD-905", "Marcus Vance", "Vanguard Fitness & CrossFit", "$8,900 (600 Uniforms & Tees)", 92, "High Value - Recurring Contract", "Quote Sent", "Automated 48h follow-up triggered with free digitizing perk", "WhatsApp"},
                    new Object[]{"LD-906", "Sophia Chen", "Bloom Coffee & Eatery (5 Locations)", "$2,150 (120 Heavy Canvas Aprons)", 88, "Warm Lead", "Design Proofing", "Awaiting client color swatch approval", "Web Portal"},
                    new Object[]{"LD-907", "David Patel", "Hackathon Global SF", "$12,400 (1,000 Heavyweight Tees)", 94, "Enterprise Opportunity", "AI Scored High-Intent", "AI Sales Agent routed to Enterprise Fulfillment Partner", "Email API Bridge"});
            for (Object[] lead : leads) {
                jdbc.update("""
                        INSERT INTO leads (id, name, org, deal_size, intent_score, score_tag, stage, last_action, channel)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, lead);
            }
        }
    }
}
