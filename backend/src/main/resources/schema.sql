CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(40) PRIMARY KEY,
    owner_email VARCHAR(254),
    client VARCHAR(180) NOT NULL,
    title VARCHAR(240) NOT NULL,
    garment VARCHAR(120) NOT NULL,
    garment_color VARCHAR(80),
    quantity INTEGER NOT NULL,
    stitch_count INTEGER NOT NULL,
    current_stage INTEGER NOT NULL DEFAULT 0,
    stage_title VARCHAR(180),
    total_price DECIMAL(12,2) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    tracking_carrier VARCHAR(180) DEFAULT 'FedEx Priority Air',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(140) NOT NULL,
    org VARCHAR(180) NOT NULL,
    deal_size VARCHAR(140) NOT NULL,
    intent_score INTEGER NOT NULL,
    score_tag VARCHAR(120),
    stage VARCHAR(100) NOT NULL,
    last_action VARCHAR(240),
    channel VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotes (
    id VARCHAR(40) PRIMARY KEY,
    owner_email VARCHAR(254),
    client_name VARCHAR(180) NOT NULL,
    garment_type VARCHAR(40) NOT NULL,
    quantity INTEGER NOT NULL,
    stitch_count INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    lead_time VARCHAR(60) NOT NULL,
    valid_until DATE NOT NULL,
    line_items_json CLOB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artworks (
    id VARCHAR(40) PRIMARY KEY,
    owner_email VARCHAR(254),
    filename VARCHAR(240) NOT NULL,
    dimensions VARCHAR(100),
    complexity_score INTEGER NOT NULL,
    stitch_count INTEGER NOT NULL,
    colors_count INTEGER NOT NULL,
    colors_json CLOB,
    puff_eligibility VARCHAR(180),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(40) PRIMARY KEY,
    order_id VARCHAR(40) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_gateway VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    receipt_no VARCHAR(40),
    payment_details_json CLOB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qc_logs (
    id VARCHAR(40) PRIMARY KEY,
    order_id VARCHAR(40) NOT NULL,
    pass_rate DECIMAL(5,2),
    needle_breaks INTEGER NOT NULL DEFAULT 0,
    inspector_notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_intent_score ON leads(intent_score);
CREATE INDEX IF NOT EXISTS idx_quotes_owner_email ON quotes(owner_email);
