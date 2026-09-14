# 📊 E-Commerce Business Intelligence & Customer Analytics Suite
### End-to-End Data Analyst Portfolio Project

![Python](https://img.shields.io/badge/Python-3.14%20%7C%20Pandas%20%7C%20NumPy-blue?style=for-the-badge&logo=python)
![SQL](https://img.shields.io/badge/SQL-PostgreSQL%20%7C%20SQLite%20%7C%20BigQuery-orange?style=for-the-badge&logo=sqlite)
![Power BI](https://img.shields.io/badge/Power%20BI-DAX%20%7C%20Star%20Schema%20%7C%20Power%20Query-yellow?style=for-the-badge&logo=powerbi)
![Interactive Dashboard](https://img.shields.io/badge/Dashboard-Interactive%20Web%20App-emerald?style=for-the-badge&logo=html5)

An enterprise-grade, end-to-end Data Analytics and Business Intelligence solution designed to answer core commercial questions, analyze customer lifetime value, optimize discounting strategies, and present actionable insights to C-suite executives.

---

## 📑 Project Workflow Overview

```
+---------------------------------------------------------------------------------------------------------+
|                                        FULL DATA LIFECYCLE                                              |
+---------------------------------------------------------------------------------------------------------+
|  1. RAW DATA GENERATION      Multi-year transactions (Orders, Customers, Products, Returns)             |
|             │                                                                                           |
|             ▼                                                                                           |
|  2. PYTHON ETL & CLEANING    Deduplication, IQR Outlier Detection, Validation, RFM Segmentation Engine  |
|             │                                                                                           |
|             ▼                                                                                           |
|  3. DATA WAREHOUSING (SQL)   Kimball Star Schema DDL, Ingestion, 20+ Advanced Analytical Queries        |
|             │                                                                                           |
|             ▼                                                                                           |
|  4. POWER BI & DAX ENGINE    50+ Production DAX Measures, Time Intelligence, Power Query M Scripts      |
|             │                                                                                           |
|             ▼                                                                                           |
|  5. INTERACTIVE BI DASHBOARD 6-Page Production Dashboard with Live Slicers, Drill-Downs & Modals        |
|             │                                                                                           |
|             ▼                                                                                           |
|  6. EXECUTIVE STRATEGY MEMO  Actionable C-Suite Briefing with Financial Impact & 90-Day Roadmap         |
+---------------------------------------------------------------------------------------------------------+
```

---

## 📁 Repository Structure

```
├── data/
│   ├── raw/                              # Raw multi-table datasets (Orders, Customers, Products, Returns)
│   │   ├── orders.csv
│   │   ├── customers.csv
│   │   ├── products.csv
│   │   └── returns.csv
│   ├── processed/                        # Kimball Star Schema normalized datasets
│   │   ├── fact_orders.csv
│   │   ├── fact_returns.csv
│   │   ├── dim_customers.csv
│   │   ├── dim_products.csv
│   │   ├── dim_geography.csv
│   │   └── dim_date.csv
│   └── ecommerce_bi.db                   # Ready-to-query SQLite database warehouse
├── scripts/
│   ├── generate_synthetic_data.py        # Generates realistic multi-year transactional dataset
│   ├── data_cleaning_etl.py              # Data cleaning, IQR outliers, RFM segmentation & ETL
│   ├── build_sqlite_db.py                # Star Schema SQLite DDL & CSV ingestion engine
│   ├── test_sql_queries.py               # Automated SQL test runner & validator
│   └── verify_dashboard.py               # Dashboard asset integrity checker
├── sql/
│   ├── 01_schema_ddl.sql                 # Star Schema DDL with constraints & indexes
│   ├── 02_load_data.sql                  # Data ingestion & multi-database loading guide
│   ├── 03_business_kpis.sql              # Executive KPIs & overall business performance
│   ├── 04_sales_performance.sql          # Time Intelligence, MoM/YoY growth & drilldowns
│   ├── 05_profitability_analysis.sql     # Discount elasticity & loss-making transactions
│   ├── 06_customer_rfm_analysis.sql      # SQL-based RFM scoring, cohorts & retention
│   ├── 07_product_performance.sql        # Product matrix, Pareto 80/20 & return root causes
│   └── 08_regional_analysis.sql          # State/City rankings & geospatial profitability
├── power_bi/
│   ├── dax_measures.md                   # 50+ production DAX formulas organized by domain
│   ├── power_query_m_scripts.md          # Power Query M code for ETL transformations
│   └── data_model_architecture.md        # Star Schema data model blueprint & relationships
├── dashboard_app/                        # Standalone interactive 6-page BI dashboard
│   ├── index.html                        # Executive UI with top KPI cards, charts & modals
│   ├── app.js                            # In-browser analytics engine, slicers, drilldowns & charts
│   ├── style.css                         # Clean styling with light/dark theme support
│   └── data.json                         # Pre-processed clean dataset payload
├── docs/
│   ├── business_insights_report.md       # C-Suite Executive Memo & 5 strategic recommendations
│   └── portfolio_presentation.md         # Interview talking points & technical cheat sheet
└── README.md                             # Master project documentation
```

---

## 🎯 Executive Business Questions Answered

| # | Business Question | Analytics Approach & Tool | Key Finding / Insight |
| :-: | :--- | :--- | :--- |
| **1** | **How is the overall business performing?** | SQL + Executive Dashboard KPI Cards | **$3.14M Revenue**, **$1.26M Profit**, **40.18% Net Margin**, 4,480 orders. |
| **2** | **Which categories drive sales and profit?** | Hierarchical Drill-Down + Donut Charts | **Technology generates 68.3% of revenue** ($2.14M) and 67% of net profit. |
| **3** | **Which products or areas cause losses?** | Bubble Scatter Plot + SQL Audit | Discounts $>30\%$ on heavy Furniture cause direct losses due to freight costs. |
| **4** | **How are sales changing over time?** | Window Functions (`LAG()`) + Time Series | Highest peak in Q4 (Nov $167k), steady $+12.4\%$ YoY growth trajectory. |
| **5** | **Who are our most valuable customers?** | 6-Segment RFM Engine + CLV Analysis | **Champions (18.8%) drive 43.7% of total revenue** ($1.37M). |
| **6** | **What factors damage profitability?** | Discount Elasticity Tiers | Margins drop from $44.8\%$ at $0\%$ discount to $3.9\%$ at $>30\%$ discount. |
| **7** | **What products suffer quality issues?** | Product Performance Matrix & Returns | Furniture return rate reaches $8.2\%$, primarily driven by transit damage ($29.5\%$). |
| **8** | **What actionable strategy is recommended?** | Executive Recommendations Memo | Hard discount caps at $20\%$, OmniVIP loyalty club, and packaging QA overhaul. |

---

## 🚀 Quickstart & Interactive Dashboard Launch

To launch and explore the live interactive dashboard:

```bash
# Option 1: Python HTTP Server (Recommended)
python -m http.server 8000 --directory dashboard_app

# Open in your browser:
# http://localhost:8000
```

---

## 💻 Running the Data Pipeline & SQL Validation

```bash
# 1. Generate Raw Synthetic Data (Orders, Customers, Products, Returns)
python scripts/generate_synthetic_data.py

# 2. Run Data Cleaning, Outlier Checks & RFM Segmentation ETL
python scripts/data_cleaning_etl.py

# 3. Ingest Star Schema into SQLite Data Warehouse
python scripts/build_sqlite_db.py

# 4. Test & Validate All 20+ SQL Business Queries
python scripts/test_sql_queries.py
```

---

## 📐 Star Schema Data Model

```
                  ┌───────────────────┐
                  │     dim_date      │
                  ├───────────────────┤
                  │ PK: date_key      │
                  └─────────┬─────────┘
                            │ 1
                            │
                            │ * (Order Date Key)
┌──────────────────┐  1     │     *  ┌────────────────────┐
│  dim_customers   ├────────┼────────┤    fact_orders     │
├──────────────────┤                 ├────────────────────┤
│ PK: customer_id  │                 │ PK: order_id       │
└──────────────────┘                 │ FK: customer_id    │
                                     │ FK: product_id     │
┌──────────────────┐  1              │ FK: geography_key  │
│   dim_products   ├────────┼────────┤ FK: order_date_key │
├──────────────────┤        │        │ FK: ship_date_key  │
│ PK: product_id   │        │        └─────────┬──────────┘
└──────────────────┘        │                  │ 1
                            │                  │
┌──────────────────┐  1     │                  │ 1:1
│  dim_geography   ├────────┘                  │
├──────────────────┤                 ┌─────────┴──────────┐
│ PK: geography_key│                 │    fact_returns    │
└──────────────────┘                 ├────────────────────┤
                                     │ PK/FK: order_id    │
                                     └────────────────────┘
```

---

## 💡 Key Actionable Recommendations

1. **Implement 20% Hard Discount Caps**: Immediately restrict unapproved $>25\%$ discounts on Furniture and Storage to stop margin erosion, recovering **+$45,000 in lost annual profit**.
2. **Launch "OmniVIP" Loyalty Club**: Provide white-glove incentives to the 160 Champions who drive 43.7% of total revenue.
3. **Automate Win-Back Sequences for At-Risk Customers**: Engage 110 high-value inactive accounts before churn, protecting **+$45k-$55k in recurring spend**.
4. **Overhaul Bulky Freight Packaging**: Enforce reinforced corner protectors to reduce transit damage returns from $8.2\%$ to $<4.5\%$.
5. **Cross-Sell High-Margin Accessory Bundles**: Bundle GaN chargers, mice, and keyboards with laptops to expand Average Order Value by $+8.5\%$.

---

## 👨‍💻 Author & Project Context

- **Author**: Lead Data Analyst
- **Use Cases**: Data Analyst Portfolio Project, College Major Project, Business Intelligence Technical Interview Case Study
- **Documentation**: Check [`docs/business_insights_report.md`](file:///docs/business_insights_report.md) for the executive memo and [`docs/portfolio_presentation.md`](file:///docs/portfolio_presentation.md) for the interview guide.
