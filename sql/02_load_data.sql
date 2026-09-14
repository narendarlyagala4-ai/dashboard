-- ==============================================================================
-- E-COMMERCE BUSINESS INTELLIGENCE & DATA WAREHOUSING
-- SCRIPT 02: DATA INGESTION & ETL INSTRUCTIONS
-- ==============================================================================

/*
PRODUCTION DATA LOADING INSTRUCTIONS (MULTI-DATABASE COMPATIBLE):

1. PostgreSQL / CockroachDB:
   \copy dim_date FROM 'data/processed/dim_date.csv' WITH (FORMAT csv, HEADER true);
   \copy dim_geography FROM 'data/processed/dim_geography.csv' WITH (FORMAT csv, HEADER true);
   \copy dim_products FROM 'data/processed/dim_products.csv' WITH (FORMAT csv, HEADER true);
   \copy dim_customers FROM 'data/processed/dim_customers.csv' WITH (FORMAT csv, HEADER true);
   \copy fact_orders FROM 'data/processed/fact_orders.csv' WITH (FORMAT csv, HEADER true);
   \copy fact_returns FROM 'data/processed/fact_returns.csv' WITH (FORMAT csv, HEADER true);

2. Google BigQuery:
   bq load --autodetect --source_format=CSV ecommerce_dw.dim_date data/processed/dim_date.csv
   bq load --autodetect --source_format=CSV ecommerce_dw.fact_orders data/processed/fact_orders.csv

3. Snowflake:
   COPY INTO dim_date FROM @ecommerce_stage/dim_date.csv FILE_FORMAT = (TYPE = 'CSV' SKIP_HEADER = 1);
   COPY INTO fact_orders FROM @ecommerce_stage/fact_orders.csv FILE_FORMAT = (TYPE = 'CSV' SKIP_HEADER = 1);

4. SQLite:
   Use automated Python ingestion script:
   `python scripts/build_sqlite_db.py`
*/

-- Verification Query: Check table row counts across star schema
SELECT 'dim_date' AS table_name, COUNT(*) AS total_rows FROM dim_date
UNION ALL
SELECT 'dim_geography', COUNT(*) FROM dim_geography
UNION ALL
SELECT 'dim_products', COUNT(*) FROM dim_products
UNION ALL
SELECT 'dim_customers', COUNT(*) FROM dim_customers
UNION ALL
SELECT 'fact_orders', COUNT(*) FROM fact_orders
UNION ALL
SELECT 'fact_returns', COUNT(*) FROM fact_returns;
