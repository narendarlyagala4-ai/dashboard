-- ==============================================================================
-- E-COMMERCE BUSINESS INTELLIGENCE & DATA WAREHOUSING
-- SCRIPT 05: PROFITABILITY & DISCOUNT ELASTICITY ANALYSIS
-- Answers: "Which areas are causing losses, and how do discounts destroy margin?"
-- ==============================================================================

-- 1. PROFITABILITY BREAKDOWN BY SUB-CATEGORY
SELECT 
    p.category,
    p.sub_category,
    ROUND(SUM(f.sales), 2) AS total_sales,
    ROUND(SUM(f.profit), 2) AS total_profit,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS profit_margin_pct,
    ROUND(AVG(f.discount) * 100, 2) AS avg_discount_pct,
    CASE 
        WHEN SUM(f.profit) < 0 THEN 'Loss Maker'
        WHEN (SUM(f.profit) / SUM(f.sales)) < 0.20 THEN 'Low Margin Alert'
        WHEN (SUM(f.profit) / SUM(f.sales)) < 0.35 THEN 'Healthy Margin'
        ELSE 'High Margin Star'
    END AS margin_health_status
FROM fact_orders f
JOIN dim_products p ON f.product_id = p.product_id
GROUP BY p.category, p.sub_category
ORDER BY total_profit DESC;


-- 2. DISCOUNT TIERS VS. PROFIT MARGIN ELASTICITY ANALYSIS
-- Demonstrates how margin collapses as discount exceeds 20%
SELECT 
    CASE 
        WHEN f.discount = 0.00 THEN '1. No Discount (0%)'
        WHEN f.discount <= 0.10 THEN '2. Low (1% - 10%)'
        WHEN f.discount <= 0.20 THEN '3. Moderate (11% - 20%)'
        WHEN f.discount <= 0.30 THEN '4. High (21% - 30%)'
        ELSE '5. Aggressive (>30%)'
    END AS discount_tier,
    COUNT(DISTINCT f.order_id) AS total_orders,
    SUM(f.quantity) AS total_units_sold,
    ROUND(SUM(f.sales), 2) AS total_sales,
    ROUND(SUM(f.profit), 2) AS total_profit,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS profit_margin_pct,
    ROUND(AVG(f.profit), 2) AS avg_profit_per_order
FROM fact_orders f
GROUP BY 
    CASE 
        WHEN f.discount = 0.00 THEN '1. No Discount (0%)'
        WHEN f.discount <= 0.10 THEN '2. Low (1% - 10%)'
        WHEN f.discount <= 0.20 THEN '3. Moderate (11% - 20%)'
        WHEN f.discount <= 0.30 THEN '4. High (21% - 30%)'
        ELSE '5. Aggressive (>30%)'
    END
ORDER BY discount_tier;


-- 3. LOSS-MAKING TRANSACTIONS & HEAVY DISCOUNT EROSION
-- Pinpoints specific orders where aggressive discounting caused negative net profit
SELECT 
    f.order_id,
    f.order_date,
    p.product_name,
    p.category,
    p.sub_category,
    g.state,
    f.quantity,
    f.discount * 100 AS discount_pct,
    f.sales,
    f.profit
FROM fact_orders f
JOIN dim_products p ON f.product_id = p.product_id
JOIN dim_geography g ON f.geography_key = g.geography_key
WHERE f.profit < 0
ORDER BY f.profit ASC
LIMIT 15;


-- 4. PRODUCTS WITH LOWEST PROFIT MARGINS (Vulnerable / Low-Margin Products)
SELECT 
    p.product_name,
    p.category,
    p.sub_category,
    ROUND(SUM(f.sales), 2) AS total_sales,
    ROUND(SUM(f.profit), 2) AS total_profit,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS profit_margin_pct,
    ROUND(AVG(f.discount) * 100, 2) AS avg_discount_pct
FROM fact_orders f
JOIN dim_products p ON f.product_id = p.product_id
GROUP BY p.product_id, p.product_name, p.category, p.sub_category
ORDER BY profit_margin_pct ASC
LIMIT 10;


-- 5. REGIONAL PROFITABILITY & MARGIN RANKING
SELECT 
    g.region,
    ROUND(SUM(f.sales), 2) AS total_sales,
    ROUND(SUM(f.profit), 2) AS total_profit,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS profit_margin_pct,
    ROUND(AVG(f.discount) * 100, 2) AS avg_discount_pct
FROM fact_orders f
JOIN dim_geography g ON f.geography_key = g.geography_key
GROUP BY g.region
ORDER BY profit_margin_pct DESC;
