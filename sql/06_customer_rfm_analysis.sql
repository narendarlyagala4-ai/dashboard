-- ==============================================================================
-- E-COMMERCE BUSINESS INTELLIGENCE & DATA WAREHOUSING
-- SCRIPT 06: CUSTOMER ANALYTICS & RFM SEGMENTATION
-- Answers: "Who are the most valuable customers and who is at risk of churning?"
-- ==============================================================================

-- 1. OVERALL CUSTOMER BASE HEALTH & RETENTION METRICS
SELECT 
    COUNT(DISTINCT c.customer_id) AS total_customer_base,
    COUNT(DISTINCT CASE WHEN c.frequency > 1 THEN c.customer_id END) AS repeat_customers_count,
    ROUND(
        (COUNT(DISTINCT CASE WHEN c.frequency > 1 THEN c.customer_id END) * 100.0) / 
        COUNT(DISTINCT c.customer_id), 2
    ) AS repeat_customer_rate_pct,
    COUNT(DISTINCT CASE WHEN c.frequency = 1 THEN c.customer_id END) AS one_time_buyers_count,
    ROUND(AVG(c.monetary), 2) AS avg_customer_lifetime_value,
    ROUND(AVG(c.average_order_value), 2) AS overall_avg_order_value,
    ROUND(AVG(c.frequency), 2) AS avg_orders_per_customer
FROM dim_customers c;


-- 2. RFM CUSTOMER SEGMENT BREAKDOWN (DISTRIBUTION & REVENUE SHARE)
SELECT 
    c.rfm_segment,
    COUNT(DISTINCT c.customer_id) AS customer_count,
    ROUND(COUNT(DISTINCT c.customer_id) * 100.0 / (SELECT COUNT(*) FROM dim_customers), 2) AS customer_share_pct,
    ROUND(SUM(c.monetary), 2) AS total_revenue_generated,
    ROUND(SUM(c.monetary) * 100.0 / (SELECT SUM(monetary) FROM dim_customers), 2) AS revenue_share_pct,
    ROUND(SUM(c.total_profit), 2) AS total_profit_generated,
    ROUND(AVG(c.recency), 1) AS avg_days_since_last_order,
    ROUND(AVG(c.frequency), 1) AS avg_order_frequency,
    ROUND(AVG(c.monetary), 2) AS avg_clv
FROM dim_customers c
GROUP BY c.rfm_segment
ORDER BY total_revenue_generated DESC;


-- 3. TOP 10 CHAMPION CUSTOMERS (HIGHEST LIFETIME VALUE & PROFITABILITY)
SELECT 
    c.customer_id,
    c.customer_name,
    c.segment,
    c.state,
    c.rfm_segment,
    c.frequency AS total_orders,
    ROUND(c.monetary, 2) AS total_spend,
    ROUND(c.total_profit, 2) AS total_profit,
    ROUND(c.average_order_value, 2) AS avg_order_value,
    c.recency AS days_inactive
FROM dim_customers c
ORDER BY c.monetary DESC
LIMIT 10;


-- 4. AT-RISK HIGH VALUE CUSTOMERS (FORMER CHAMPIONS/LOYALISTS INACTIVE > 180 DAYS)
SELECT 
    c.customer_id,
    c.customer_name,
    c.segment,
    c.rfm_segment,
    c.recency AS days_inactive,
    c.frequency AS prior_order_count,
    ROUND(c.monetary, 2) AS historical_spend,
    ROUND(c.total_profit, 2) AS historical_profit,
    c.last_purchase AS last_order_date
FROM dim_customers c
WHERE c.rfm_segment = 'At-Risk Customers'
ORDER BY c.monetary DESC
LIMIT 10;


-- 5. REVENUE CONTRIBUTION BY CUSTOMER SEGMENT (CONSUMER, CORPORATE, HOME OFFICE)
SELECT 
    c.segment,
    COUNT(DISTINCT c.customer_id) AS total_customers,
    COUNT(DISTINCT f.order_id) AS total_orders,
    ROUND(SUM(f.sales), 2) AS total_sales,
    ROUND(SUM(f.profit), 2) AS total_profit,
    ROUND((SUM(f.profit) / SUM(f.sales)) * 100, 2) AS profit_margin_pct,
    ROUND(AVG(f.sales), 2) AS avg_order_value
FROM fact_orders f
JOIN dim_customers c ON f.customer_id = c.customer_id
GROUP BY c.segment
ORDER BY total_sales DESC;
