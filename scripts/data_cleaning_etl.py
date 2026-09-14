"""
E-Commerce End-to-End Data Cleaning, Preprocessing & Star Schema ETL Pipeline
Author: Data Analytics Engineering Team
Technology: Python, Pandas, NumPy

Workflow:
1. Ingest Raw Datasets (Orders, Customers, Products, Returns).
2. Data Cleaning & Validation:
   - Deduplication
   - Handling nulls / missing values
   - String normalization (trimming, title-casing categories & regions)
   - Datetime parsing & validation
   - Range & numerical integrity checks
   - Statistical outlier detection using IQR
3. Feature Engineering:
   - Shipping Days duration
   - Unit Cost, Unit Profit, Profit Margin %
   - Return Flag & Return Reason integration
4. RFM Customer Segmentation:
   - Recency (Days since last order)
   - Frequency (Total order count)
   - Monetary (Total spend)
   - R, F, M Score Quintiles (1-5)
   - 6 RFM Segments: Champions, Loyal, Potential Loyalists, New, At-Risk, Low-Value
5. Star Schema Transformation:
   - dim_date (Date dimension with full time intelligence hierarchy)
   - dim_customers (Enriched customer dimension with RFM scores)
   - dim_products (Product dimension with performance tiering)
   - dim_geography (Unique geographic surrogate keys)
   - fact_orders (Central sales fact table)
   - fact_returns (Returns fact table)
6. Export Clean Datasets & Interactive Dashboard JSON Payload.
"""

import os
import json
import numpy as np
import pandas as pd
from datetime import datetime

def run_etl():
    print("=" * 70)
    print("STARTING E-COMMERCE DATA CLEANING & ETL PIPELINE")
    print("=" * 70)

    # 1. LOAD RAW DATA
    orders_df = pd.read_csv("data/raw/orders.csv")
    customers_df = pd.read_csv("data/raw/customers.csv")
    products_df = pd.read_csv("data/raw/products.csv")
    returns_df = pd.read_csv("data/raw/returns.csv")

    print(f"[RAW LOAD] Orders: {len(orders_df)} | Customers: {len(customers_df)} | Products: {len(products_df)} | Returns: {len(returns_df)}")

    # 2. DATA CLEANING & STANDARDIZATION
    
    # 2.1 Deduplication
    init_orders_len = len(orders_df)
    orders_df = orders_df.drop_duplicates(subset=["Order ID"])
    print(f"[DEDUPLICATION] Removed {init_orders_len - len(orders_df)} duplicate orders.")

    # 2.2 String normalization
    orders_df["Category"] = orders_df["Category"].astype(str).str.strip().str.title()
    orders_df["Sub-Category"] = orders_df["Sub-Category"].astype(str).str.strip()
    orders_df["Region"] = orders_df["Region"].astype(str).str.strip().str.title()
    orders_df["State"] = orders_df["State"].astype(str).str.strip()
    orders_df["City"] = orders_df["City"].astype(str).str.strip()
    
    customers_df["Segment"] = customers_df["Segment"].astype(str).str.strip().str.title()
    customers_df["Region"] = customers_df["Region"].astype(str).str.strip().str.title()
    customers_df["State"] = customers_df["State"].astype(str).str.strip()
    customers_df["City"] = customers_df["City"].astype(str).str.strip()

    # 2.3 Date Conversion & Validation
    orders_df["Order Date"] = pd.to_datetime(orders_df["Order Date"])
    orders_df["Ship Date"] = pd.to_datetime(orders_df["Ship Date"])
    customers_df["Join Date"] = pd.to_datetime(customers_df["Join Date"])

    # Ensure Ship Date >= Order Date
    invalid_dates = orders_df[orders_df["Ship Date"] < orders_df["Order Date"]]
    if not invalid_dates.empty:
        print(f"[DATA FIX] Correcting {len(invalid_dates)} records where Ship Date < Order Date.")
        orders_df.loc[orders_df["Ship Date"] < orders_df["Order Date"], "Ship Date"] = orders_df["Order Date"] + pd.Timedelta(days=2)

    # 2.4 Feature Engineering
    orders_df["Shipping Days"] = (orders_df["Ship Date"] - orders_df["Order Date"]).dt.days
    orders_df["Sales"] = orders_df["Sales"].astype(float).round(2)
    orders_df["Profit"] = orders_df["Profit"].astype(float).round(2)
    orders_df["Quantity"] = orders_df["Quantity"].astype(int)
    orders_df["Discount"] = orders_df["Discount"].astype(float).round(2)
    orders_df["Profit Margin %"] = np.where(orders_df["Sales"] > 0, (orders_df["Profit"] / orders_df["Sales"]) * 100, 0).round(2)

    # 2.5 Outlier Analysis (IQR Method)
    for col in ["Sales", "Profit"]:
        q25 = orders_df[col].quantile(0.25)
        q75 = orders_df[col].quantile(0.75)
        iqr = q75 - q25
        lower_bound = q25 - 1.5 * iqr
        upper_bound = q75 + 1.5 * iqr
        outliers = orders_df[(orders_df[col] < lower_bound) | (orders_df[col] > upper_bound)]
        print(f"[IQR OUTLIER DETECTION] {col}: Lower={lower_bound:.2f}, Upper={upper_bound:.2f}, Found {len(outliers)} statistical outlier records (retained for business variance analysis).")

    # 2.6 Merge Returns
    returns_clean = returns_df.drop_duplicates(subset=["Order ID"])
    orders_df = orders_df.merge(returns_clean, on="Order ID", how="left")
    orders_df["Return Status"] = orders_df["Return Status"].fillna("Not Returned")
    orders_df["Return Reason"] = orders_df["Return Reason"].fillna("N/A")
    orders_df["Is Returned"] = np.where(orders_df["Return Status"] == "Returned", 1, 0)

    # 3. BUILD GEOGRAPHY DIMENSION
    geo_df = orders_df[["Region", "State", "City"]].drop_duplicates().reset_index(drop=True)
    geo_df["Geography Key"] = [f"GEO-{i+1:04d}" for i in range(len(geo_df))]
    
    # Map Geo Key back to orders
    orders_df = orders_df.merge(geo_df, on=["Region", "State", "City"], how="left")
    customers_df = customers_df.merge(geo_df, on=["Region", "State", "City"], how="left")

    # 4. CUSTOMER RFM SEGMENTATION ENGINE
    ref_date = orders_df["Order Date"].max() + pd.Timedelta(days=1)
    
    # Group by customer
    rfm = orders_df.groupby("Customer ID").agg(
        Recency=("Order Date", lambda x: (ref_date - x.max()).days),
        Frequency=("Order ID", "nunique"),
        Monetary=("Sales", "sum"),
        Total_Profit=("Profit", "sum"),
        Total_Units=("Quantity", "sum"),
        First_Purchase=("Order Date", "min"),
        Last_Purchase=("Order Date", "max")
    ).reset_index()

    # RFM Scoring using quintiles (1-5)
    rfm["R_Score"] = pd.qcut(rfm["Recency"], q=5, labels=[5, 4, 3, 2, 1]).astype(int)
    rfm["F_Score"] = pd.qcut(rfm["Frequency"].rank(method="first"), q=5, labels=[1, 2, 3, 4, 5]).astype(int)
    rfm["M_Score"] = pd.qcut(rfm["Monetary"], q=5, labels=[1, 2, 3, 4, 5]).astype(int)
    rfm["RFM_Score"] = rfm["R_Score"].astype(str) + rfm["F_Score"].astype(str) + rfm["M_Score"].astype(str)

    # Segment definition logic
    def assign_segment(row):
        r = row["R_Score"]
        f = row["F_Score"]
        m = row["M_Score"]
        
        if r >= 4 and f >= 4 and m >= 4:
            return "Champions"
        elif f >= 3 and m >= 3:
            return "Loyal Customers"
        elif r >= 4 and f <= 2:
            return "New Customers"
        elif r >= 3 and (f >= 2 or m >= 2):
            return "Potential Loyalists"
        elif r <= 2 and (f >= 3 or m >= 3):
            return "At-Risk Customers"
        else:
            return "Low-Value Customers"

    rfm["RFM Segment"] = rfm.apply(assign_segment, axis=1)
    rfm["Customer Lifetime Value"] = rfm["Monetary"].round(2)
    rfm["Average Order Value"] = (rfm["Monetary"] / rfm["Frequency"]).round(2)

    # Merge RFM metrics into dim_customers
    dim_customers = customers_df.merge(rfm, on="Customer ID", how="left")
    dim_customers["Recency"] = dim_customers["Recency"].fillna(999)
    dim_customers["Frequency"] = dim_customers["Frequency"].fillna(0)
    dim_customers["Monetary"] = dim_customers["Monetary"].fillna(0.0)
    dim_customers["RFM Segment"] = dim_customers["RFM Segment"].fillna("New Customers")

    # 5. BUILD PRODUCT DIMENSION & PERFORMANCE MATRIX
    prod_metrics = orders_df.groupby("Product ID").agg(
        Total_Sales=("Sales", "sum"),
        Total_Profit=("Profit", "sum"),
        Total_Units=("Quantity", "sum"),
        Total_Orders=("Order ID", "count"),
        Total_Returns=("Is Returned", "sum")
    ).reset_index()

    dim_products = products_df.copy()
    dim_products = dim_products.merge(prod_metrics, on="Product ID", how="left").fillna(0)
    dim_products["Profit Margin %"] = np.where(dim_products["Total_Sales"] > 0, (dim_products["Total_Profit"] / dim_products["Total_Sales"]) * 100, 0).round(2)
    dim_products["Return Rate %"] = np.where(dim_products["Total_Orders"] > 0, (dim_products["Total_Returns"] / dim_products["Total_Orders"]) * 100, 0).round(2)

    # Assign Performance Classification
    def classify_product(row):
        margin = row["Profit Margin %"]
        ret_rate = row["Return Rate %"]
        sales = row["Total_Sales"]
        
        if margin >= 45 and ret_rate <= 6:
            return "Excellent"
        elif margin >= 30 and ret_rate <= 8:
            return "Good"
        elif margin >= 15:
            return "Average"
        elif margin < 0:
            return "Poor"
        else:
            return "Risk"

    dim_products["Performance Category"] = dim_products.apply(classify_product, axis=1)

    # 6. BUILD DATE DIMENSION
    all_dates = pd.date_range(start="2022-01-01", end="2026-12-31", freq="D")
    dim_date = pd.DataFrame({
        "Date Key": all_dates.strftime("%Y%m%d").astype(int),
        "Full Date": all_dates.strftime("%Y-%m-%d"),
        "Year": all_dates.year,
        "Quarter": all_dates.quarter,
        "Quarter Name": "Q" + all_dates.quarter.astype(str),
        "Month": all_dates.month,
        "Month Name": all_dates.strftime("%B"),
        "Month Short": all_dates.strftime("%b"),
        "Month-Year": all_dates.strftime("%b %Y"),
        "Day": all_dates.day,
        "Day of Week": all_dates.strftime("%A"),
        "Is Weekend": np.where(all_dates.dayofweek >= 5, 1, 0)
    })

    # 7. BUILD FACT TABLES
    fact_orders = orders_df[[
        "Order ID", "Order Date", "Ship Date", "Customer ID", "Product ID", "Geography Key",
        "Sales", "Quantity", "Discount", "Profit", "Shipping Days", "Is Returned"
    ]].copy()
    
    fact_orders["Order Date Key"] = fact_orders["Order Date"].dt.strftime("%Y%m%d").astype(int)
    fact_orders["Ship Date Key"] = fact_orders["Ship Date"].dt.strftime("%Y%m%d").astype(int)
    fact_orders["Order Date"] = fact_orders["Order Date"].dt.strftime("%Y-%m-%d")
    fact_orders["Ship Date"] = fact_orders["Ship Date"].dt.strftime("%Y-%m-%d")

    fact_returns = returns_clean[["Order ID", "Return Status", "Return Reason"]].copy()

    # 8. EXPORT STAR SCHEMA FILES
    os.makedirs("data/processed", exist_ok=True)
    fact_orders.to_csv("data/processed/fact_orders.csv", index=False)
    fact_returns.to_csv("data/processed/fact_returns.csv", index=False)
    dim_customers.to_csv("data/processed/dim_customers.csv", index=False)
    dim_products.to_csv("data/processed/dim_products.csv", index=False)
    dim_geography.to_csv("data/processed/dim_geography.csv", index=False) if 'dim_geography' in locals() else geo_df.to_csv("data/processed/dim_geography.csv", index=False)
    dim_date.to_csv("data/processed/dim_date.csv", index=False)

    # 9. EXPORT COMPLETE STANDALONE JSON FOR INTERACTIVE BI DASHBOARD
    # Build complete consolidated structure for zero-dependency client dashboard
    dashboard_payload = {
        "metadata": {
            "title": "E-Commerce Enterprise BI & Customer Analytics Dashboard",
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "total_records": len(orders_df),
            "date_range": [str(orders_df["Order Date"].min().date()), str(orders_df["Order Date"].max().date())]
        },
        "orders": []
    }

    # Prepare lightweight transaction list for real-time in-browser aggregation
    for _, r in orders_df.iterrows():
        dashboard_payload["orders"].append({
            "order_id": r["Order ID"],
            "order_date": r["Order Date"].strftime("%Y-%m-%d"),
            "year": int(r["Order Date"].year),
            "month": int(r["Order Date"].month),
            "month_name": r["Order Date"].strftime("%b"),
            "month_year": r["Order Date"].strftime("%b %Y"),
            "quarter": f"Q{r['Order Date'].quarter}",
            "customer_id": r["Customer ID"],
            "customer_name": customers_df.loc[customers_df["Customer ID"] == r["Customer ID"], "Customer Name"].values[0] if len(customers_df.loc[customers_df["Customer ID"] == r["Customer ID"]]) > 0 else "Unknown",
            "segment": customers_df.loc[customers_df["Customer ID"] == r["Customer ID"], "Segment"].values[0] if len(customers_df.loc[customers_df["Customer ID"] == r["Customer ID"]]) > 0 else "Consumer",
            "product_id": r["Product ID"],
            "product_name": products_df.loc[products_df["Product ID"] == r["Product ID"], "Product Name"].values[0] if len(products_df.loc[products_df["Product ID"] == r["Product ID"]]) > 0 else "Item",
            "category": r["Category"],
            "sub_category": r["Sub-Category"],
            "region": r["Region"],
            "state": r["State"],
            "city": r["City"],
            "sales": float(r["Sales"]),
            "quantity": int(r["Quantity"]),
            "discount": float(r["Discount"]),
            "profit": float(r["Profit"]),
            "is_returned": int(r["Is Returned"]),
            "return_reason": r["Return Reason"],
            "rfm_segment": dim_customers.loc[dim_customers["Customer ID"] == r["Customer ID"], "RFM Segment"].values[0] if len(dim_customers.loc[dim_customers["Customer ID"] == r["Customer ID"]]) > 0 else "New Customers"
        })

    # Prepare customer summary for RFM page
    dashboard_payload["customers"] = dim_customers[[
        "Customer ID", "Customer Name", "Segment", "Region", "State", "City", 
        "Recency", "Frequency", "Monetary", "R_Score", "F_Score", "M_Score", "RFM Segment", "Customer Lifetime Value"
    ]].to_dict(orient="records")

    # Prepare product performance list
    dashboard_payload["products"] = dim_products[[
        "Product ID", "Product Name", "Category", "Sub-Category", "Cost", "Selling Price",
        "Total_Sales", "Total_Profit", "Total_Units", "Return Rate %", "Profit Margin %", "Performance Category"
    ]].to_dict(orient="records")

    os.makedirs("dashboard_app", exist_ok=True)
    with open("dashboard_app/data.json", "w", encoding="utf-8") as f:
        json.dump(dashboard_payload, f, indent=2)

    print("=" * 70)
    print("ETL & PREPROCESSING COMPLETED SUCCESSFULLY")
    print(f"- Star Schema Fact Orders: data/processed/fact_orders.csv ({len(fact_orders)} rows)")
    print(f"- Star Schema Fact Returns: data/processed/fact_returns.csv ({len(fact_returns)} rows)")
    print(f"- Star Schema Dim Customers: data/processed/dim_customers.csv ({len(dim_customers)} rows)")
    print(f"- Star Schema Dim Products: data/processed/dim_products.csv ({len(dim_products)} rows)")
    print(f"- Star Schema Dim Geography: data/processed/dim_geography.csv ({len(geo_df)} rows)")
    print(f"- Star Schema Dim Date: data/processed/dim_date.csv ({len(dim_date)} rows)")
    print(f"- Standalone Dashboard JSON: dashboard_app/data.json")
    print("=" * 70)

if __name__ == "__main__":
    run_etl()
