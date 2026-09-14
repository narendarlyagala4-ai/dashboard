-- ==============================================================================
-- E-COMMERCE BUSINESS INTELLIGENCE & DATA WAREHOUSING
-- SCRIPT 07: PRODUCT PERFORMANCE MATRIX & PARETO ANALYSIS
-- Answers: "Which products drive 80% of revenue, and which have quality/return issues?"
-- ==============================================================================

-- 1. PRODUCT PERFORMANCE MATRIX CLASSIFICATION
SELECT 
    p.product_id,
    p.product_name,
    p.category,
    p.sub_category,
    ROUND(p.total_sales, 2) AS total_sales,
    ROUND(p.total_profit, 2) AS total_profit,
    p.total_units AS units_sold,
    p.total_orders AS order_count,
    p.total_returns AS return_count,
    ROUND(p.profit_margin_pct, 2) AS profit_margin_pct,
    ROUND(p.return_rate_pct, 2) AS return_rate_pct,
    p.performance_category
FROM dim_products p
ORDER BY p.total_sales DESC;


-- 2. PARETO ANALYSIS (80/20 REVENUE PRINCIPLE)
-- Calculates cumulative sales and flags the top 20% products driving 80% revenue
WITH ranked_products AS (
    SELECT 
        p.product_id,
        p.product_name,
        p.category,
        ROUND(SUM(f.sales), 2) AS product_sales,
        SUM(SUM(f.sales)) OVER (ORDER BY SUM(f.sales) DESC) AS cumulative_sales,
        SUM(SUM(f.sales)) OVER () AS total_sales_all
    FROM fact_orders f
    JOIN dim_products p ON f.product_id = p.product_id
    GROUP BY p.product_id, p.product_name, p.category
)
SELECT 
    product_id,
    product_name,
    category,
    product_sales,
    cumulative_sales,
    ROUND((cumulative_sales / total_sales_all) * 100, 2) AS cumulative_sales_pct,
    CASE 
        WHEN (cumulative_sales / total_sales_all) <= 0.80 THEN 'Core 80% Revenue Driver'
        ELSE 'Long-Tail Product'
    END AS pareto_classification
FROM ranked_products
ORDER BY product_sales DESC;


-- 3. PRODUCTS WITH HIGHEST RETURN RATES (>8% RETURN THRESHOLD)
SELECT 
    p.product_id,
    p.product_name,
    p.category,
    p.sub_category,
    p.total_orders,
    p.total_returns,
    ROUND(p.return_rate_pct, 2) AS return_rate_pct,
    ROUND(p.total_sales, 2) AS total_sales,
    ROUND(p.total_profit, 2) AS total_profit
FROM dim_products p
WHERE p.total_returns >= 3 AND p.return_rate_pct > 7.0
ORDER BY p.return_rate_pct DESC, p.total_returns DESC;


-- 4. RETURN REASON DISTRIBUTION BY PRODUCT CATEGORY
SELECT 
    p.category,
    r.return_reason,
    COUNT(*) AS return_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY p.category), 2) AS category_reason_share_pct
FROM fact_returns r
JOIN fact_orders f ON r.order_id = f.order_id
JOIN dim_products p ON f.product_id = p.product_id
GROUP BY p.category, r.return_reason
ORDER BY p.category, return_count DESC;
