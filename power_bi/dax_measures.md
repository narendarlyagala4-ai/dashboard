# Production DAX Measures Library
## E-Commerce Business Intelligence & Customer Analytics

This repository contains **50+ Production-Ready DAX (Data Analysis Expressions) Measures** categorized into 6 core analytical domains. Each measure is fully formatted with error-handling (`DIVIDE`, `COALESCE`), filter context management (`CALCULATE`, `KEEPFILTERS`, `ALLSELECTED`, `REMOVEFILTERS`), and business logic annotations.

---

### Table of Contents
1. [Core Executive & KPI Measures](#1-core-executive--kpi-measures)
2. [Time Intelligence & Growth Measures](#2-time-intelligence--growth-measures)
3. [Profitability & Margin Analytics](#3-profitability--margin-analytics)
4. [Customer Behavior & RFM Analytics](#4-customer-behavior--rfm-analytics)
5. [Product Performance & Pareto Measures](#5-product-performance--pareto-measures)
6. [Dynamic Formatting, Titles & UI Control](#6-dynamic-formatting-titles--ui-control)

---

## 1. Core Executive & KPI Measures

```dax
-- Total Net Sales Revenue
Total Sales = 
SUM(fact_orders[sales])

-- Total Business Net Profit
Total Profit = 
SUM(fact_orders[profit])

-- Total Cost of Goods Sold (COGS)
Total Cost = 
SUMX(
    fact_orders,
    fact_orders[quantity] * RELATED(dim_products[cost])
)

-- Overall Gross Profit Margin %
Profit Margin % = 
DIVIDE(
    [Total Profit],
    [Total Sales],
    0
)

-- Total Distinct Order Count
Total Orders = 
DISTINCTCOUNT(fact_orders[order_id])

-- Total Distinct Customer Count
Total Customers = 
DISTINCTCOUNT(fact_orders[customer_id])

-- Total Units Sold
Total Quantity Sold = 
SUM(fact_orders[quantity])

-- Average Order Value (AOV)
Average Order Value = 
DIVIDE(
    [Total Sales],
    [Total Orders],
    0
)

-- Total Returned Orders Count
Total Returned Orders = 
CALCULATE(
    COUNTROWS(fact_orders),
    fact_orders[is_returned] = 1
)

-- Order Return Rate %
Return Rate % = 
DIVIDE(
    [Total Returned Orders],
    [Total Orders],
    0
)

-- Average Discount Given %
Average Discount % = 
AVERAGE(fact_orders[discount])
```

---

## 2. Time Intelligence & Growth Measures

```dax
-- Sales Prior Year (PY / SPLY)
Sales PY = 
CALCULATE(
    [Total Sales],
    SAMEPERIODLASTYEAR(dim_date[full_date])
)

-- Sales Year-over-Year (YoY) Growth Amount ($)
Sales YoY Growth $ = 
[Total Sales] - [Sales PY]

-- Sales Year-over-Year (YoY) Growth %
Sales YoY Growth % = 
DIVIDE(
    [Sales YoY Growth $],
    [Sales PY],
    0
)

-- Sales Month-over-Month (MoM) Growth Amount ($)
Sales MoM Growth $ = 
VAR _CurrentMonth = [Total Sales]
VAR _PrevMonth = CALCULATE([Total Sales], DATEADD(dim_date[full_date], -1, MONTH))
RETURN
    IF(ISBLANK(_PrevMonth), BLANK(), _CurrentMonth - _PrevMonth)

-- Sales Month-over-Month (MoM) Growth %
Sales MoM Growth % = 
VAR _CurrentMonth = [Total Sales]
VAR _PrevMonth = CALCULATE([Total Sales], DATEADD(dim_date[full_date], -1, MONTH))
RETURN
    DIVIDE(_CurrentMonth - _PrevMonth, _PrevMonth, 0)

-- Sales Year-to-Date (YTD)
Sales YTD = 
TOTALYTD(
    [Total Sales],
    dim_date[full_date]
)

-- Sales Quarter-to-Date (QTD)
Sales QTD = 
TOTALQTD(
    [Total Sales],
    dim_date[full_date]
)

-- Profit Prior Year (PY)
Profit PY = 
CALCULATE(
    [Total Profit],
    SAMEPERIODLASTYEAR(dim_date[full_date])
)

-- Profit Year-over-Year (YoY) Growth %
Profit YoY Growth % = 
DIVIDE(
    [Total Profit] - [Profit PY],
    [Profit PY],
    0
)

-- 3-Month Rolling Average Sales
Sales 3M Rolling Avg = 
CALCULATE(
    AVERAGEX(
        DATESINPERIOD(dim_date[full_date], MAX(dim_date[full_date]), -3, MONTH),
        [Total Sales]
    )
)

-- 12-Month Rolling Total Sales
Sales 12M Rolling Total = 
CALCULATE(
    [Total Sales],
    DATESINPERIOD(dim_date[full_date], MAX(dim_date[full_date]), -12, MONTH)
)
```

---

## 3. Profitability & Margin Analytics

```dax
-- Loss-Making Orders Count
Loss Making Orders Count = 
CALCULATE(
    COUNTROWS(fact_orders),
    fact_orders[profit] < 0
)

-- Total Loss Value ($)
Loss Amount $ = 
CALCULATE(
    SUM(fact_orders[profit]),
    fact_orders[profit] < 0
)

-- Discount Margin Erosion ($)
Discount Margin Erosion $ = 
SUMX(
    fact_orders,
    fact_orders[sales] * (fact_orders[discount] / (1 - fact_orders[discount]))
)

-- Profit Margin Category Status
Margin Health Status = 
VAR _Margin = [Profit Margin %]
RETURN
    SWITCH(
        TRUE(),
        _Margin < 0, "Loss Maker",
        _Margin < 0.20, "Low Margin Alert",
        _Margin < 0.40, "Healthy Margin",
        "High Margin Star"
    )

-- Profit Contribution % by Current Filter
Profit Share % = 
DIVIDE(
    [Total Profit],
    CALCULATE([Total Profit], ALLSELECTED(fact_orders)),
    0
)
```

---

## 4. Customer Behavior & RFM Analytics

```dax
-- Repeat Customers Count (Ordered 2+ Times)
Repeat Customers Count = 
CALCULATE(
    DISTINCTCOUNT(fact_orders[customer_id]),
    FILTER(
        VALUES(fact_orders[customer_id]),
        CALCULATE(DISTINCTCOUNT(fact_orders[order_id])) > 1
    )
)

-- Repeat Customer Rate %
Repeat Customer Rate % = 
DIVIDE(
    [Repeat Customers Count],
    [Total Customers],
    0
)

-- New Customers Count (Ordered 1 Time)
New Customers Count = 
[Total Customers] - [Repeat Customers Count]

-- Customer Lifetime Value (CLV) Average
Customer Lifetime Value = 
DIVIDE(
    [Total Sales],
    [Total Customers],
    0
)

-- Average Purchase Frequency per Customer
Avg Purchase Frequency = 
DIVIDE(
    [Total Orders],
    [Total Customers],
    0
)

-- Champions Segment Customer Count
Champions Customer Count = 
CALCULATE(
    DISTINCTCOUNT(dim_customers[customer_id]),
    dim_customers[rfm_segment] = "Champions"
)

-- Champions Revenue Contribution
Champions Revenue = 
CALCULATE(
    [Total Sales],
    dim_customers[rfm_segment] = "Champions"
)

-- At-Risk Customers Revenue
At-Risk Revenue = 
CALCULATE(
    [Total Sales],
    dim_customers[rfm_segment] = "At-Risk Customers"
)

-- Top 10 Customers Sales
Top 10 Customers Sales = 
CALCULATE(
    [Total Sales],
    TOPN(10, ALL(dim_customers), [Total Sales], DESC)
)
```

---

## 5. Product Performance & Pareto Measures

```dax
-- Cumulative Sales for Pareto 80/20 Analysis
Cumulative Product Sales = 
VAR _CurrentSales = [Total Sales]
VAR _SummaryTable = 
    ADDCOLUMNS(
        ALLSELECTED(dim_products[product_name]),
        "@ProdSales", [Total Sales]
    )
RETURN
    SUMX(
        FILTER(_SummaryTable, [@ProdSales] >= _CurrentSales),
        [@ProdSales]
    )

-- Pareto 80/20 Revenue Driver Flag
Pareto Revenue Driver Flag = 
VAR _TotalAllSales = CALCULATE([Total Sales], ALLSELECTED(dim_products))
VAR _CumulativeSales = [Cumulative Product Sales]
RETURN
    IF(
        DIVIDE(_CumulativeSales, _TotalAllSales, 0) <= 0.80,
        "Core 80% Driver",
        "Long-Tail Product"
    )

-- Product Rank by Sales
Product Sales Rank = 
RANKX(
    ALLSELECTED(dim_products[product_name]),
    [Total Sales],
    ,
    DESC,
    Dense
)

-- Product Rank by Profit
Product Profit Rank = 
RANKX(
    ALLSELECTED(dim_products[product_name]),
    [Total Profit],
    ,
    DESC,
    Dense
)

-- Products with High Return Rate (>7%) Flag
High Return Alert Flag = 
IF([Return Rate %] > 0.07, "⚠️ High Return Rate", "✅ Normal")
```

---

## 6. Dynamic Formatting, Titles & UI Control

```dax
-- Dynamic Executive Overview Title
Dynamic Page 1 Title = 
VAR _Year = SELECTEDVALUE(dim_date[year], "All Years")
VAR _Region = SELECTEDVALUE(dim_geography[region], "All Regions")
VAR _Category = SELECTEDVALUE(dim_products[category], "All Categories")
RETURN
    "Executive Performance Dashboard | " & _Year & " | Region: " & _Region & " | Category: " & _Category

-- Dynamic Profit Margin KPI Color (Conditional Formatting Hex Code)
Conditional Margin Color Hex = 
VAR _Margin = [Profit Margin %]
RETURN
    SWITCH(
        TRUE(),
        _Margin < 0.0, "#EF4444",   -- Red for Negative / Loss
        _Margin < 0.25, "#F59E0B",  -- Amber for Low Margin
        "#10B981"                  -- Emerald Green for Healthy Profit
    )

-- Conditional Return Rate Color Hex
Conditional Return Color Hex = 
VAR _Rate = [Return Rate %]
RETURN
    SWITCH(
        TRUE(),
        _Rate > 0.08, "#EF4444",   -- Red Alert
        _Rate > 0.05, "#F59E0B",   -- Warning
        "#10B981"                  -- Good
    )

-- Trend Arrow for YoY Sales Growth
YoY Sales Trend Arrow = 
VAR _YoY = [Sales YoY Growth %]
RETURN
    SWITCH(
        TRUE(),
        ISBLANK(_YoY), "―",
        _YoY > 0, "▲ +" & FORMAT(_YoY, "0.0%"),
        "▼ " & FORMAT(_YoY, "0.0%")
    )

-- Dynamic Drillthrough Breadcrumb
Drillthrough Breadcrumb = 
VAR _Region = SELECTEDVALUE(dim_geography[region], "All Regions")
VAR _State = SELECTEDVALUE(dim_geography[state], "All States")
VAR _City = SELECTEDVALUE(dim_geography[city], "All Cities")
RETURN
    "Drill Path: " & _Region & " > " & _State & " > " & _City
```
