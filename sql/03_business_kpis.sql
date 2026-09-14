-- ==============================================================================
-- E-COMMERCE BUSINESS INTELLIGENCE & DATA WAREHOUSING
-- SCRIPT 03: EXECUTIVE OVERVIEW & CORE BUSINESS KPIS
-- Answers: "How is the overall business performing?"
-- ==============================================================================

-- 1. OVERALL EXECUTIVE KPIS SUMMARY
-- Calculates Total Sales, Total Profit, Gross Margin %, Total Orders, Customers, Quantity, Return Rate, and AOV
SELECT 
    ROUND(SUM(f.sales), 2) AS total_sales,
    ROUND(SUM(f.profit), 2) AS total_profit,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS profit_margin_pct,
    COUNT(DISTINCT f.order_id) AS total_orders,
    COUNT(DISTINCT f.customer_id) AS total_customers,
    SUM(f.quantity) AS total_quantity_sold,
    ROUND(AVG(f.sales), 2) AS average_order_value,
    ROUND(AVG(f.discount) * 100, 2) AS average_discount_pct,
    SUM(f.is_returned) AS total_returned_orders,
    ROUND((CAST(SUM(f.is_returned) AS REAL) / COUNT(DISTINCT f.order_id)) * 100, 2) AS return_rate_pct
FROM fact_orders f;


-- 2. YEARLY EXECUTIVE SUMMARY & GROWTH TRAJECTORY
SELECT 
    d.year,
    COUNT(DISTINCT f.order_id) AS total_orders,
    COUNT(DISTINCT f.customer_id) AS active_customers,
    ROUND(SUM(f.sales), 2) AS total_sales,
    ROUND(SUM(f.profit), 2) AS total_profit,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS profit_margin_pct,
    ROUND((CAST(SUM(f.is_returned) AS REAL) / COUNT(DISTINCT f.order_id)) * 100, 2) AS return_rate_pct
FROM fact_orders f
JOIN dim_date d ON f.order_date_key = d.date_key
GROUP BY d.year
ORDER BY d.year;


-- 3. EXECUTIVE SALES & PROFIT CONTRIBUTION BY CATEGORY
SELECT 
    p.category,
    COUNT(DISTINCT f.order_id) AS total_orders,
    SUM(f.quantity) AS total_units_sold,
    ROUND(SUM(f.sales), 2) AS total_sales,
    ROUND(SUM(f.sales) * 100.0 / (SELECT SUM(sales) FROM fact_orders), 2) AS sales_share_pct,
    ROUND(SUM(f.profit), 2) AS total_profit,
    ROUND(SUM(f.profit) * 100.0 / (SELECT SUM(profit) FROM fact_orders), 2) AS profit_share_pct,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS profit_margin_pct
FROM fact_orders f
JOIN dim_products p ON f.product_id = p.product_id
GROUP BY p.category
ORDER BY total_sales DESC;


-- 4. EXECUTIVE REGIONAL PERFORMANCE MATRIX
SELECT 
    g.region,
    COUNT(DISTINCT f.order_id) AS total_orders,
    COUNT(DISTINCT f.customer_id) AS total_customers,
    ROUND(SUM(f.sales), 2) AS total_sales,
    ROUND(SUM(f.profit), 2) AS total_profit,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS profit_margin_pct,
    ROUND((CAST(SUM(f.is_returned) AS REAL) / COUNT(DISTINCT f.order_id)) * 100, 2) AS return_rate_pct
FROM fact_orders f
JOIN dim_geography g ON f.geography_key = g.geography_key
GROUP BY g.region
ORDER BY total_sales DESC;


-- 5. EXECUTIVE TOP 5 MOST PROFITABLE PRODUCTS
SELECT 
    p.product_name,
    p.category,
    p.sub_category,
    SUM(f.quantity) AS total_units_sold,
    ROUND(SUM(f.sales), 2) AS total_sales,
    ROUND(SUM(f.profit), 2) AS total_profit,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS profit_margin_pct
FROM fact_orders f
JOIN dim_products p ON f.product_id = p.product_id
GROUP BY p.product_id, p.product_name, p.category, p.sub_category
ORDER BY total_profit DESC
LIMIT 5;
