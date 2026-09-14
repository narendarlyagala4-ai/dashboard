"""
SQLite Database Builder & Ingestion Script
Loads cleaned Star Schema datasets into SQLite `data/ecommerce_bi.db` with column mapping.
"""

import sqlite3
import pandas as pd
import os

db_path = "data/ecommerce_bi.db"
if os.path.exists(db_path):
    os.remove(db_path)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Execute DDL
with open("sql/01_schema_ddl.sql", "r", encoding="utf-8") as f:
    ddl_script = f.read()

cursor.executescript(ddl_script)
conn.commit()

print("Executing Data Ingestion into SQLite...")

# 2. Dim Date
dim_date = pd.read_csv("data/processed/dim_date.csv")
dim_date.columns = [c.lower().replace(" ", "_").replace("-", "_") for c in dim_date.columns]
dim_date.to_sql("dim_date", conn, if_exists="append", index=False)

# 3. Dim Geography
dim_geo = pd.read_csv("data/processed/dim_geography.csv")
dim_geo.columns = [c.lower().replace(" ", "_") for c in dim_geo.columns]
dim_geo.to_sql("dim_geography", conn, if_exists="append", index=False)

# 4. Dim Products
dim_prod = pd.read_csv("data/processed/dim_products.csv")
dim_prod.rename(columns={
    "Product ID": "product_id",
    "Product Name": "product_name",
    "Category": "category",
    "Sub-Category": "sub_category",
    "Cost": "cost",
    "Selling Price": "selling_price",
    "Total_Sales": "total_sales",
    "Total_Profit": "total_profit",
    "Total_Units": "total_units",
    "Total_Orders": "total_orders",
    "Total_Returns": "total_returns",
    "Profit Margin %": "profit_margin_pct",
    "Return Rate %": "return_rate_pct",
    "Performance Category": "performance_category"
}, inplace=True)
dim_prod.to_sql("dim_products", conn, if_exists="append", index=False)

# 5. Dim Customers
dim_cust = pd.read_csv("data/processed/dim_customers.csv")
dim_cust.rename(columns={
    "Customer ID": "customer_id",
    "Customer Name": "customer_name",
    "Segment": "segment",
    "Region": "region",
    "State": "state",
    "City": "city",
    "Join Date": "join_date",
    "Geography Key": "geography_key",
    "Recency": "recency",
    "Frequency": "frequency",
    "Monetary": "monetary",
    "Total_Profit": "total_profit",
    "Total_Units": "total_units",
    "First_Purchase": "first_purchase",
    "Last_Purchase": "last_purchase",
    "R_Score": "r_score",
    "F_Score": "f_score",
    "M_Score": "m_score",
    "RFM_Score": "rfm_score",
    "RFM Segment": "rfm_segment",
    "Customer Lifetime Value": "customer_lifetime_value",
    "Average Order Value": "average_order_value"
}, inplace=True)
dim_cust.to_sql("dim_customers", conn, if_exists="append", index=False)

# 6. Fact Orders
fact_ord = pd.read_csv("data/processed/fact_orders.csv")
fact_ord.rename(columns={
    "Order ID": "order_id",
    "Order Date": "order_date",
    "Ship Date": "ship_date",
    "Order Date Key": "order_date_key",
    "Ship Date Key": "ship_date_key",
    "Customer ID": "customer_id",
    "Product ID": "product_id",
    "Geography Key": "geography_key",
    "Sales": "sales",
    "Quantity": "quantity",
    "Discount": "discount",
    "Profit": "profit",
    "Shipping Days": "shipping_days",
    "Is Returned": "is_returned"
}, inplace=True)
fact_ord.to_sql("fact_orders", conn, if_exists="append", index=False)

# 7. Fact Returns
fact_ret = pd.read_csv("data/processed/fact_returns.csv")
fact_ret.rename(columns={
    "Order ID": "order_id",
    "Return Status": "return_status",
    "Return Reason": "return_reason"
}, inplace=True)
fact_ret.to_sql("fact_returns", conn, if_exists="append", index=False)

conn.commit()

print("="*60)
print("SUCCESSFULLY LOADED STAR SCHEMA INTO SQLITE DATABASE")
for table in ["dim_date", "dim_geography", "dim_products", "dim_customers", "fact_orders", "fact_returns"]:
    cursor.execute(f"SELECT COUNT(*) FROM {table}")
    count = cursor.fetchone()[0]
    print(f" - {table}: {count:,} records")
print("="*60)

conn.close()
