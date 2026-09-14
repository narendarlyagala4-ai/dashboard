-- ==============================================================================
-- E-COMMERCE BUSINESS INTELLIGENCE & DATA WAREHOUSING
-- SCRIPT 04: SALES PERFORMANCE ANALYSIS & TIME INTELLIGENCE
-- Answers: "How are sales changing over time, and what drives growth?"
-- ==============================================================================

-- 1. MONTH-OVER-MONTH (MoM) SALES & GROWTH TREND (USING WINDOW FUNCTIONS)
WITH monthly_sales AS (
    SELECT 
        d.year,
        d.month,
        d.month_short,
        d.month_year,
        ROUND(SUM(f.sales), 2) AS current_month_sales,
        COUNT(DISTINCT f.order_id) AS current_month_orders,
        ROUND(SUM(f.profit), 2) AS current_month_profit
    FROM fact_orders f
    JOIN dim_date d ON f.order_date_key = d.date_key
    GROUP BY d.year, d.month, d.month_short, d.month_year
)
SELECT 
    year,
    month,
    month_year,
    current_month_sales,
    LAG(current_month_sales, 1) OVER (ORDER BY year, month) AS prev_month_sales,
    ROUND(
        (current_month_sales - LAG(current_month_sales, 1) OVER (ORDER BY year, month)) * 100.0 / 
        NULLIF(LAG(current_month_sales, 1) OVER (ORDER BY year, month), 0), 2
    ) AS mom_sales_growth_pct,
    current_month_profit,
    ROUND((current_month_profit / current_month_sales) * 100, 2) AS profit_margin_pct
FROM monthly_sales
ORDER BY year, month;


-- 2. YEAR-OVER-YEAR (YoY) SALES GROWTH BY QUARTER
WITH quarterly_sales AS (
    SELECT 
        d.year,
        d.quarter,
        d.quarter_name,
        ROUND(SUM(f.sales), 2) AS current_qtr_sales,
        ROUND(SUM(f.profit), 2) AS current_qtr_profit
    FROM fact_orders f
    JOIN dim_date d ON f.order_date_key = d.date_key
    GROUP BY d.year, d.quarter, d.quarter_name
)
SELECT 
    q1.year,
    q1.quarter_name,
    q1.current_qtr_sales,
    LAG(q1.current_qtr_sales, 4) OVER (ORDER BY q1.year, q1.quarter) AS prior_year_qtr_sales,
    ROUND(
        (q1.current_qtr_sales - LAG(q1.current_qtr_sales, 4) OVER (ORDER BY q1.year, q1.quarter)) * 100.0 / 
        NULLIF(LAG(q1.current_qtr_sales, 4) OVER (ORDER BY q1.year, q1.quarter), 0), 2
    ) AS yoy_qtr_growth_pct
FROM quarterly_sales q1
ORDER BY q1.year, q1.quarter;


-- 3. HIERARCHICAL SALES DRILLDOWN: CATEGORY -> SUB-CATEGORY
SELECT 
    p.category,
    p.sub_category,
    COUNT(DISTINCT f.order_id) AS total_orders,
    SUM(f.quantity) AS units_sold,
    ROUND(SUM(f.sales), 2) AS total_sales,
    ROUND(AVG(f.discount) * 100, 2) AS avg_discount_pct,
    ROUND(SUM(f.profit), 2) AS total_profit,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS profit_margin_pct
FROM fact_orders f
JOIN dim_products p ON f.product_id = p.product_id
GROUP BY p.category, p.sub_category
ORDER BY p.category, total_sales DESC;


-- 4. TOP 10 BEST-SELLING PRODUCTS
SELECT 
    p.product_id,
    p.product_name,
    p.category,
    p.sub_category,
    COUNT(DISTINCT f.order_id) AS order_count,
    SUM(f.quantity) AS total_quantity,
    ROUND(SUM(f.sales), 2) AS total_sales,
    ROUND(SUM(f.profit), 2) AS total_profit,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS profit_margin_pct
FROM fact_orders f
JOIN dim_products p ON f.product_id = p.product_id
GROUP BY p.product_id, p.product_name, p.category, p.sub_category
ORDER BY total_sales DESC
LIMIT 10;


-- 5. BOTTOM 10 LOWEST-SELLING PRODUCTS
SELECT 
    p.product_id,
    p.product_name,
    p.category,
    p.sub_category,
    COUNT(DISTINCT f.order_id) AS order_count,
    SUM(f.quantity) AS total_quantity,
    ROUND(SUM(f.sales), 2) AS total_sales,
    ROUND(SUM(f.profit), 2) AS total_profit,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS profit_margin_pct
FROM fact_orders f
JOIN dim_products p ON f.product_id = p.product_id
GROUP BY p.product_id, p.product_name, p.category, p.sub_category
ORDER BY total_sales ASC
LIMIT 10;


-- 6. BEST & WORST SALES MONTHS AUTOMATED IDENTIFICATION
WITH monthly_rankings AS (
    SELECT 
        d.year,
        d.month_name,
        d.month_year,
        ROUND(SUM(f.sales), 2) AS total_sales,
        RANK() OVER (ORDER BY SUM(f.sales) DESC) AS rank_highest,
        RANK() OVER (ORDER BY SUM(f.sales) ASC) AS rank_lowest
    FROM fact_orders f
    JOIN dim_date d ON f.order_date_key = d.date_key
    GROUP BY d.year, d.month, d.month_name, d.month_year
)
SELECT 'Best Month' AS metric, month_year, total_sales FROM monthly_rankings WHERE rank_highest = 1
UNION ALL
SELECT 'Worst Month' AS metric, month_year, total_sales FROM monthly_rankings WHERE rank_lowest = 1;
