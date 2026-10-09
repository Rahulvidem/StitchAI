#!/usr/bin/env python3
"""
StitchAI Database Module (SQLite3)
Handles persistent storage for Orders, Quotations, Leads, Artworks, Transactions, and QC logs.
"""

import sqlite3
import json
import os
import uuid
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "stitchai.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cur = conn.cursor()

    # 1. Orders table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        client TEXT NOT NULL,
        title TEXT NOT NULL,
        garment TEXT NOT NULL,
        garment_color TEXT,
        quantity INTEGER NOT NULL,
        stitch_count INTEGER NOT NULL,
        current_stage INTEGER DEFAULT 0,
        stage_title TEXT,
        total_price REAL NOT NULL,
        payment_status TEXT DEFAULT 'Pending',
        tracking_carrier TEXT DEFAULT 'FedEx Priority Air',
        created_at TEXT NOT NULL
    )
    """)

    # 2. Quotations table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS quotes (
        id TEXT PRIMARY KEY,
        client_name TEXT NOT NULL,
        garment_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        stitch_count INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_amount REAL NOT NULL,
        lead_time TEXT,
        valid_until TEXT,
        line_items_json TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 3. CRM Leads table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        org TEXT NOT NULL,
        deal_size TEXT NOT NULL,
        intent_score INTEGER NOT NULL,
        score_tag TEXT,
        stage TEXT NOT NULL,
        last_action TEXT,
        channel TEXT DEFAULT 'Web Chat',
        created_at TEXT NOT NULL
    )
    """)

    # 4. Artwork & Computer Vision table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS artworks (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        dimensions TEXT,
        complexity_score INTEGER,
        stitch_count INTEGER,
        colors_count INTEGER,
        colors_json TEXT,
        puff_eligibility TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 5. Transactions table (Stripe & Razorpay)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        payment_gateway TEXT NOT NULL,
        status TEXT NOT NULL,
        receipt_no TEXT,
        payment_details_json TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 6. Quality Control (QC) logs
    cur.execute("""
    CREATE TABLE IF NOT EXISTS qc_logs (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        pass_rate REAL,
        needle_breaks INTEGER DEFAULT 0,
        inspector_notes TEXT,
        created_at TEXT NOT NULL
    )
    """)

    conn.commit()

    # Seed initial data if tables are empty
    seed_initial_data(conn)
    conn.close()

def seed_initial_data(conn):
    cur = conn.cursor()

    # Check orders
    cur.execute("SELECT COUNT(*) FROM orders")
    if cur.fetchone()[0] == 0:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cur.execute("""
            INSERT INTO orders (id, client, title, garment, garment_color, quantity, stitch_count, current_stage, stage_title, total_price, payment_status, tracking_carrier, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "ST-8942",
            "Stanford Robotics & AI Club",
            "250x Heavyweight Terry Hoodies with 3D Puff Embroidery",
            "Heavyweight Fleece Hoodie (400 GSM)",
            "Onyx Black",
            250,
            16840,
            2,
            "Digital Tech-Pack Proof Approval",
            5600.00,
            "Paid",
            "FedEx Priority Air (Tracking: #FX-98214-US)",
            now
        ))

        cur.execute("""
            INSERT INTO orders (id, client, title, garment, garment_color, quantity, stitch_count, current_stage, stage_title, total_price, payment_status, tracking_carrier, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "ST-8943",
            "IronForge CrossFit Club",
            "600x Pro-Stretch DryFit Crewneck Tees",
            "Oversized Streetwear T-Shirt (240 GSM)",
            "Charcoal Grey",
            600,
            21500,
            4,
            "Multi-Head CNC Embroidery in Progress",
            6840.00,
            "Paid",
            "DHL Express Freight",
            now
        ))

    # Check leads
    cur.execute("SELECT COUNT(*) FROM leads")
    if cur.fetchone()[0] == 0:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        leads_data = [
            ("LD-904", "Elena Rostova", "Berkeley Autonomous Driving Club", "$4,650 (320 Hoodies)", 96, "High Value - Immediate Buy", "AI Scored High-Intent", "AI Sales Agent sent volume price tier proposal", "Web Chat + WhatsApp", now),
            ("LD-905", "Marcus Vance", "Vanguard Fitness & CrossFit", "$8,900 (600 Uniforms & Tees)", 92, "High Value - Recurring Contract", "Quote Sent", "Automated 48h Follow-up triggered with free digitizing perk", "WhatsApp", now),
            ("LD-906", "Sophia Chen", "Bloom Coffee & Eatery (5 Locations)", "$2,150 (120 Heavy Canvas Aprons)", 88, "Warm Lead", "Design Proofing", "Awaiting client color swatch approval", "Web Portal", now),
            ("LD-907", "David Patel", "Hackathon Global SF", "$12,400 (1,000 Heavyweight Tees)", 94, "Enterprise Opportunity", "AI Scored High-Intent", "AI Sales Agent routed to Enterprise Fulfillment Partner", "Email API Bridge", now),
        ]
        cur.executemany("""
            INSERT INTO leads (id, name, org, deal_size, intent_score, score_tag, stage, last_action, channel, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, leads_data)

    conn.commit()

# --- Database Helper Functions ---
def get_all_orders():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM orders ORDER BY created_at DESC")
    rows = [dict(row) for row in cur.fetchall()]
    conn.close()
    return rows

def create_order(order_data):
    conn = get_connection()
    cur = conn.cursor()
    order_id = order_data.get("id") or f"ST-{uuid.uuid4().hex[:6].upper()}"
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cur.execute("""
        INSERT OR REPLACE INTO orders (id, client, title, garment, garment_color, quantity, stitch_count, current_stage, stage_title, total_price, payment_status, tracking_carrier, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        order_id,
        order_data.get("client", "Customer"),
        order_data.get("title", "Custom Apparel Order"),
        order_data.get("garment", "Heavyweight Hoodie"),
        order_data.get("garment_color", "Black"),
        int(order_data.get("quantity", 50)),
        int(order_data.get("stitch_count", 15000)),
        int(order_data.get("current_stage", 0)),
        order_data.get("stage_title", "Inquiry & AI Quotation"),
        float(order_data.get("total_price", 0.0)),
        order_data.get("payment_status", "Pending"),
        order_data.get("tracking_carrier", "FedEx Express"),
        now
    ))
    conn.commit()
    conn.close()
    return order_id

def update_order_stage(order_id, stage, stage_title=None):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE orders 
        SET current_stage = ?, stage_title = COALESCE(?, stage_title)
        WHERE id = ?
    """, (stage, stage_title, order_id))
    conn.commit()
    updated = cur.rowcount == 1
    conn.close()
    return updated

def save_artwork(artwork_data):
    conn = get_connection()
    cur = conn.cursor()
    artwork_id = artwork_data.get("id") or f"AW-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cur.execute("""
        INSERT INTO artworks (
            id, filename, dimensions, complexity_score, stitch_count,
            colors_count, colors_json, puff_eligibility, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        artwork_id,
        artwork_data.get("filename", "custom_artwork.png"),
        artwork_data.get("dimensions"),
        int(artwork_data.get("complexity_score", 0)),
        int(artwork_data.get("stitch_count", 0)),
        int(artwork_data.get("colors_count", 0)),
        json.dumps(artwork_data.get("colors", [])),
        artwork_data.get("puff_eligibility"),
        now
    ))
    conn.commit()
    conn.close()
    return artwork_id

def record_transaction(txn_data):
    conn = get_connection()
    cur = conn.cursor()
    txn_id = txn_data.get("id") or f"TXN-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cur.execute("""
        INSERT INTO transactions (id, order_id, amount, currency, payment_gateway, status, receipt_no, payment_details_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        txn_id,
        txn_data.get("order_id"),
        float(txn_data.get("amount", 0.0)),
        txn_data.get("currency", "USD"),
        txn_data.get("payment_gateway", "Stripe"),
        txn_data.get("status", "Succeeded"),
        txn_data.get("receipt_no", f"REC-{uuid.uuid4().hex[:6].upper()}"),
        json.dumps(txn_data.get("details", {})),
        now
    ))

    # Also update corresponding order payment status
    if txn_data.get("order_id"):
        cur.execute("""
            UPDATE orders SET payment_status = 'Paid', total_price = ? WHERE id = ?
        """, (float(txn_data.get("amount", 0.0)), txn_data.get("order_id")))

    conn.commit()
    conn.close()
    return txn_id

def get_all_leads():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM leads ORDER BY intent_score DESC")
    rows = [dict(row) for row in cur.fetchall()]
    conn.close()
    return rows

def save_quote(quote_data):
    conn = get_connection()
    cur = conn.cursor()
    quote_id = quote_data.get("id") or f"QT-{uuid.uuid4().hex[:6].upper()}"
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    valid = (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")

    cur.execute("""
        INSERT OR REPLACE INTO quotes (id, client_name, garment_type, quantity, stitch_count, unit_price, total_amount, lead_time, valid_until, line_items_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        quote_id,
        quote_data.get("client_name", "Valued Client"),
        quote_data.get("garment_type", "Hoodie"),
        int(quote_data.get("quantity", 100)),
        int(quote_data.get("stitch_count", 15000)),
        float(quote_data.get("unit_price", 22.0)),
        float(quote_data.get("total_amount", 2200.0)),
        quote_data.get("lead_time", "7-10 Days"),
        valid,
        json.dumps(quote_data.get("line_items", [])),
        now
    ))
    conn.commit()
    conn.close()
    return quote_id

if __name__ == "__main__":
    init_db()
    print("StitchAI SQLite Database Initialized successfully.")
