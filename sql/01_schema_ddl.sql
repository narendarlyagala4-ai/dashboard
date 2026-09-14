-- ==============================================================================
-- E-COMMERCE BUSINESS INTELLIGENCE & DATA WAREHOUSING
-- SCRIPT 01: STAR SCHEMA DDL (DATA DEFINITION LANGUAGE)
-- Standardized schema with snake_case columns
-- ==============================================================================

DROP TABLE IF EXISTS fact_returns;
DROP TABLE IF EXISTS fact_orders;
DROP TABLE IF EXISTS dim_customers;
DROP TABLE IF EXISTS dim_products;
DROP TABLE IF EXISTS dim_geography;
DROP TABLE IF EXISTS dim_date;

-- 1. DIMENSION: DATE (Time Intelligence Hierarchy)
CREATE TABLE dim_date (
    date_key INTEGER PRIMARY KEY,
    full_date DATE NOT NULL,
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL,
    quarter_name VARCHAR(10) NOT NULL,
    month INTEGER NOT NULL,
    month_name VARCHAR(20) NOT NULL,
    month_short VARCHAR(10) NOT NULL,
    month_year VARCHAR(20) NOT NULL,
    day INTEGER NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    is_weekend INTEGER NOT NULL
);

-- 2. DIMENSION: GEOGRAPHY (Location Hierarchy)
CREATE TABLE dim_geography (
    geography_key VARCHAR(20) PRIMARY KEY,
    region VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL
);

-- 3. DIMENSION: PRODUCTS (Catalog & Performance Tiers)
CREATE TABLE dim_products (
    product_id VARCHAR(20) PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50) NOT NULL,
    cost REAL NOT NULL,
    selling_price REAL NOT NULL,
    total_sales REAL DEFAULT 0.0,
    total_profit REAL DEFAULT 0.0,
    total_units INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_returns INTEGER DEFAULT 0,
    profit_margin_pct REAL DEFAULT 0.0,
    return_rate_pct REAL DEFAULT 0.0,
    performance_category VARCHAR(30)
);

-- 4. DIMENSION: CUSTOMERS (Enriched with RFM Behavioral Metrics)
CREATE TABLE dim_customers (
    customer_id VARCHAR(20) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    segment VARCHAR(50) NOT NULL,
    region VARCHAR(50),
    state VARCHAR(50),
    city VARCHAR(50),
    join_date DATE NOT NULL,
    geography_key VARCHAR(20),
    recency INTEGER,
    frequency INTEGER,
    monetary REAL,
    total_profit REAL,
    total_units INTEGER,
    first_purchase DATE,
    last_purchase DATE,
    r_score INTEGER,
    f_score INTEGER,
    m_score INTEGER,
    rfm_score VARCHAR(10),
    rfm_segment VARCHAR(50),
    customer_lifetime_value REAL,
    average_order_value REAL,
    FOREIGN KEY (geography_key) REFERENCES dim_geography(geography_key)
);

-- 5. FACT TABLE: ORDERS (Central Sales Transactions)
CREATE TABLE fact_orders (
    order_id VARCHAR(30) PRIMARY KEY,
    order_date DATE NOT NULL,
    ship_date DATE NOT NULL,
    order_date_key INTEGER NOT NULL,
    ship_date_key INTEGER NOT NULL,
    customer_id VARCHAR(20) NOT NULL,
    product_id VARCHAR(20) NOT NULL,
    geography_key VARCHAR(20) NOT NULL,
    sales REAL NOT NULL,
    quantity INTEGER NOT NULL,
    discount REAL NOT NULL DEFAULT 0.0,
    profit REAL NOT NULL,
    shipping_days INTEGER NOT NULL,
    is_returned INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (order_date_key) REFERENCES dim_date(date_key),
    FOREIGN KEY (ship_date_key) REFERENCES dim_date(date_key),
    FOREIGN KEY (customer_id) REFERENCES dim_customers(customer_id),
    FOREIGN KEY (product_id) REFERENCES dim_products(product_id),
    FOREIGN KEY (geography_key) REFERENCES dim_geography(geography_key)
);

-- 6. FACT TABLE: RETURNS (Order Return Reasons)
CREATE TABLE fact_returns (
    order_id VARCHAR(30) PRIMARY KEY,
    return_status VARCHAR(50) NOT NULL,
    return_reason VARCHAR(100) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES fact_orders(order_id)
);

-- INDEXES
CREATE INDEX idx_orders_customer ON fact_orders(customer_id);
CREATE INDEX idx_orders_product ON fact_orders(product_id);
CREATE INDEX idx_orders_geo ON fact_orders(geography_key);
CREATE INDEX idx_orders_date ON fact_orders(order_date_key);
CREATE INDEX idx_customers_segment ON dim_customers(segment);
CREATE INDEX idx_customers_rfm ON dim_customers(rfm_segment);
CREATE INDEX idx_products_cat ON dim_products(category, sub_category);
