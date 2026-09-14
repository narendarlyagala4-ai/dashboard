-- ==============================================================================
-- E-COMMERCE BUSINESS INTELLIGENCE & DATA WAREHOUSING
-- SCRIPT 08: REGIONAL & GEOSPATIAL PERFORMANCE
-- Answers: "Which states and cities are thriving, and where are we losing money?"
-- ==============================================================================

-- 1. STATE-LEVEL PERFORMANCE & PROFITABILITY RANKING
SELECT 
    g.region,
    g.state,
    COUNT(DISTINCT f.order_id) AS total_orders,
    COUNT(DISTINCT f.customer_id) AS total_customers,
    ROUND(SUM(f.sales), 2) AS total_sales,
    ROUND(SUM(f.profit), 2) AS total_profit,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS profit_margin_pct,
    ROUND(AVG(f.discount) * 100, 2) AS avg_discount_pct,
    ROUND((CAST(SUM(f.is_returned) AS REAL) / COUNT(DISTINCT f.order_id)) * 100, 2) AS return_rate_pct
FROM fact_orders f
JOIN dim_geography g ON f.geography_key = g.geography_key
GROUP BY g.region, g.state
ORDER BY total_sales DESC;


-- 2. TOP 10 MOST PROFITABLE CITIES
SELECT 
    g.region,
    g.state,
    g.city,
    COUNT(DISTINCT f.order_id) AS total_orders,
    ROUND(SUM(f.sales), 2) AS total_sales,
    ROUND(SUM(f.profit), 2) AS total_profit,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS profit_margin_pct
FROM fact_orders f
JOIN dim_geography g ON f.geography_key = g.geography_key
GROUP BY g.region, g.state, g.city
ORDER BY total_profit DESC
LIMIT 10;


-- 3. UNDERPERFORMING OR LOW-MARGIN CITIES (MARGIN < 30%)
SELECT 
    g.region,
    g.state,
    g.city,
    COUNT(DISTINCT f.order_id) AS total_orders,
    ROUND(SUM(f.sales), 2) AS total_sales,
    ROUND(SUM(f.profit), 2) AS total_profit,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS profit_margin_pct,
    ROUND(AVG(f.discount) * 100, 2) AS avg_discount_pct
FROM fact_orders f
JOIN dim_geography g ON f.geography_key = g.geography_key
GROUP BY g.region, g.state, g.city
ORDER BY profit_margin_pct ASC
LIMIT 10;


-- 4. REGIONAL DRILL-DOWN SUMMARY: REGION -> STATE -> CATEGORY
SELECT 
    g.region,
    g.state,
    p.category,
    ROUND(SUM(f.sales), 2) AS category_sales,
    ROUND(SUM(f.profit), 2) AS category_profit,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS category_margin_pct
FROM fact_orders f
JOIN dim_geography g ON f.geography_key = g.geography_key
JOIN dim_products p ON f.product_id = p.product_id
GROUP BY g.region, g.state, p.category
ORDER BY g.region, g.state, category_sales DESC;
