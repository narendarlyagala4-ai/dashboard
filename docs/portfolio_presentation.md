# Data Analyst Portfolio Project: Technical Presentation Guide
## E-Commerce Business Intelligence & Customer Analytics

This document serves as your **Interview Cheat Sheet, Portfolio Talking Points, and Technical Architecture Guide** when presenting this project to hiring managers, technical interviewers, and senior business executives.

---

## 1. Project Elevator Pitch (30-Second Interview Answer)

> *"In this project, I engineered an end-to-end Business Intelligence and Customer Analytics solution for a multi-million dollar e-commerce enterprise. I took messy raw transactional data across 4,500+ orders, built a robust Python ETL pipeline with RFM customer segmentation and automated outlier validation, designed a Kimball Star Schema data warehouse with 20+ advanced SQL analytics queries, formulated 50+ production DAX time-intelligence measures in Power BI, and delivered an interactive 6-page BI dashboard suite. The analysis identified an 84% margin collapse on aggressive discounts and provided 5 actionable strategic recommendations that recovered an estimated $45k in lost margin."*

---

## 2. Technical Competencies Demonstrated

### 1. Data Engineering & Python ETL
- **Tools**: `pandas`, `numpy`, `datetime`, `re`
- **Skills**:
  - Automated ingestion of multi-table raw schemas (`Orders`, `Customers`, `Products`, `Returns`).
  - Data hygiene: Deduplication, missing value imputation, string trimming, case standardization, date parsing.
  - Outlier detection using statistical **Interquartile Range (IQR)**:
    $$\text{IQR} = Q_3 - Q_1, \quad \text{Lower Bound} = Q_1 - 1.5 \times \text{IQR}, \quad \text{Upper Bound} = Q_3 + 1.5 \times \text{IQR}$$
  - RFM Feature Engineering using mathematical quintiles:
    - **Recency ($R$)**: Days since last order relative to evaluation cutoff.
    - **Frequency ($F$)**: Count of distinct purchase transactions.
    - **Monetary ($M$)**: Total net spend per customer.
  - Normalized Star Schema generation (`fact_orders`, `fact_returns`, `dim_customers`, `dim_products`, `dim_geography`, `dim_date`).

### 2. SQL Analytics & Data Warehousing
- **Tools**: Standard SQL (PostgreSQL, SQLite, BigQuery, Snowflake compatible)
- **Concepts & Functions Used**:
  - DDL Schema definitions with Primary Keys, Foreign Keys, and B-Tree Indexes.
  - **Window Functions**: `LAG() OVER (ORDER BY ...)`, `LEAD()`, `RANK()`, `SUM(...) OVER (PARTITION BY ...)` for Month-over-Month (MoM) and Year-over-Year (YoY) time intelligence.
  - **Pareto Principle (80/20 Rule)**: Running cumulative revenue share calculations.
  - **Cohort & RFM Analysis**: `NTILE(5)` quintile segmentation and customer retention calculations.
  - **Discount Elasticity**: Aggregations across discount bands to detect margin erosion.

### 3. Data Modeling & DAX Calculation Engine (Power BI)
- **Data Model**: Strict Kimball Star Schema with 1-to-many single-direction filtering.
- **DAX Functions Used**:
  - Filter Context Control: `CALCULATE()`, `FILTER()`, `ALLSELECTED()`, `REMOVEFILTERS()`, `KEEPFILTERS()`
  - Safe Math: `DIVIDE(..., ..., 0)`, `COALESCE()`
  - Time Intelligence: `SAMEPERIODLASTYEAR()`, `TOTALYTD()`, `TOTALQTD()`, `DATEADD()`, `DATESINPERIOD()`
  - Dynamic UI & Formatting: `SWITCH(TRUE(), ...)`, `SELECTEDVALUE()`, `FORMAT()`

### 4. Interactive Data Visualization & Dashboard UI
- **Design Philosophy**: High data-to-ink ratio, consistent color semantics (Blue for Sales, Green for Profit, Red for Loss/Alerts), top KPI cards with sparklines, multi-level drill-down, and contextual drill-through modals.

---

## 3. Sample Technical Interview Questions & Answers

### Q1: *"How did you handle the relationship between fact_orders and fact_returns?"*
> **Answer**:  
> *"In e-commerce schemas, returns are sparse events (6-8% of orders). I modeled `fact_returns` as a 1-to-1 extension table with a foreign key join to `fact_orders[order_id]`. Within the `fact_orders` table, I engineered an indexed integer flag `is_returned` (0 or 1). This allows lightning-fast boolean filtering and DAX return rate calculations (`DIVIDE(SUM(fact_orders[is_returned]), [Total Orders], 0)`) without forcing expensive Outer Joins across the entire fact table on every card visual."*

### Q2: *"How did your RFM segmentation work and what business value did it create?"*
> **Answer**:  
> *"I calculated Recency, Frequency, and Monetary values for every unique customer, then divided each metric into 1-to-5 quintile scores using Python's `pd.qcut` and SQL `NTILE(5)`. Combining these yielded 6 mutually exclusive business cohorts: Champions, Loyal Customers, Potential Loyalists, New Customers, At-Risk, and Low-Value. The key finding was that Champions (18.8% of customers) drove 43.7% of total revenue. By identifying the 110 high-value At-Risk customers who had been inactive for >180 days, we designed targeted CRM win-back workflows to prevent $45k+ in customer churn."*

### Q3: *"How did you identify the negative profit issues in the dataset?"*
> **Answer**:  
> *"I built a multi-dimensional scatter plot comparing Discount % against Net Profit $, with bubble sizes indicating Sales volume. While gross margins were positive at discounts under 20%, discounts exceeding 40% caused profitability to crash from +44% down to -8% on heavy furniture items like Tables and Bookcases. The SQL audit proved that shipping freight costs per bulky unit exceeded the heavily discounted selling price."*

---

## 4. Key Business Metrics Cheat Sheet

| Metric | Value | Business Significance |
| :--- | :--- | :--- |
| **Total Revenue** | $3,136,503.95 | Top-line business volume across 4.5 years |
| **Total Net Profit** | $1,260,122.79 | Bottom-line earnings after COGS and shipping |
| **Gross Margin %** | 40.18% | Healthy enterprise benchmark |
| **Total Orders** | 4,480 | High transaction sample size |
| **Average Order Value (AOV)** | $700.11 | High ticket size driven by Technology |
| **Repeat Customer Rate** | 85.18% | Strong customer stickiness and brand loyalty |
| **Average Customer Lifetime Value (CLV)**| $3,690.00 | Average total revenue generated per customer |
| **Overall Return Rate** | 6.05% | Within standard e-commerce bounds (5-8%) |
| **Top Category Share** | 68.3% | Technology dominates revenue share |
