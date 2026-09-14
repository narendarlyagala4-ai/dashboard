# Power Query M Transformation Scripts
## Automated Data Ingestion & Transformation in Power BI

Paste the following M scripts into the **Advanced Editor** in Power Query for each respective table.

---

### 1. `dim_date` Query

```powerquery
let
    Source = Csv.Document(File.Contents("data/processed/dim_date.csv"), [Delimiter=",", Columns=12, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{
        {"Date Key", Int64.Type}, 
        {"Full Date", type date}, 
        {"Year", Int64.Type}, 
        {"Quarter", Int64.Type}, 
        {"Quarter Name", type text}, 
        {"Month", Int64.Type}, 
        {"Month Name", type text}, 
        {"Month Short", type text}, 
        {"Month-Year", type text}, 
        {"Day", Int64.Type}, 
        {"Day of Week", type text}, 
        {"Is Weekend", Int64.Type}
    })
in
    #"Changed Type"
```

---

### 2. `dim_geography` Query

```powerquery
let
    Source = Csv.Document(File.Contents("data/processed/dim_geography.csv"), [Delimiter=",", Columns=4, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{
        {"Geography Key", type text}, 
        {"Region", type text}, 
        {"State", type text}, 
        {"City", type text}
    })
in
    #"Changed Type"
```

---

### 3. `dim_products` Query

```powerquery
let
    Source = Csv.Document(File.Contents("data/processed/dim_products.csv"), [Delimiter=",", Columns=14, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{
        {"Product ID", type text}, 
        {"Product Name", type text}, 
        {"Category", type text}, 
        {"Sub-Category", type text}, 
        {"Cost", type number}, 
        {"Selling Price", type number}, 
        {"Total_Sales", type number}, 
        {"Total_Profit", type number}, 
        {"Total_Units", Int64.Type}, 
        {"Total_Orders", Int64.Type}, 
        {"Total_Returns", Int64.Type}, 
        {"Profit Margin %", type number}, 
        {"Return Rate %", type number}, 
        {"Performance Category", type text}
    })
in
    #"Changed Type"
```

---

### 4. `dim_customers` Query

```powerquery
let
    Source = Csv.Document(File.Contents("data/processed/dim_customers.csv"), [Delimiter=",", Columns=22, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{
        {"Customer ID", type text}, 
        {"Customer Name", type text}, 
        {"Segment", type text}, 
        {"Region", type text}, 
        {"State", type text}, 
        {"City", type text}, 
        {"Join Date", type date}, 
        {"Geography Key", type text}, 
        {"Recency", Int64.Type}, 
        {"Frequency", Int64.Type}, 
        {"Monetary", type number}, 
        {"Total_Profit", type number}, 
        {"Total_Units", Int64.Type}, 
        {"First_Purchase", type date}, 
        {"Last_Purchase", type date}, 
        {"R_Score", Int64.Type}, 
        {"F_Score", Int64.Type}, 
        {"M_Score", Int64.Type}, 
        {"RFM_Score", type text}, 
        {"RFM Segment", type text}, 
        {"Customer Lifetime Value", type number}, 
        {"Average Order Value", type number}
    })
in
    #"Changed Type"
```

---

### 5. `fact_orders` Query

```powerquery
let
    Source = Csv.Document(File.Contents("data/processed/fact_orders.csv"), [Delimiter=",", Columns=14, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{
        {"Order ID", type text}, 
        {"Order Date", type date}, 
        {"Ship Date", type date}, 
        {"Customer ID", type text}, 
        {"Product ID", type text}, 
        {"Geography Key", type text}, 
        {"Sales", type number}, 
        {"Quantity", Int64.Type}, 
        {"Discount", type number}, 
        {"Profit", type number}, 
        {"Shipping Days", Int64.Type}, 
        {"Is Returned", Int64.Type}, 
        {"Order Date Key", Int64.Type}, 
        {"Ship Date Key", Int64.Type}
    })
in
    #"Changed Type"
```

---

### 6. `fact_returns` Query

```powerquery
let
    Source = Csv.Document(File.Contents("data/processed/fact_returns.csv"), [Delimiter=",", Columns=3, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{
        {"Order ID", type text}, 
        {"Return Status", type text}, 
        {"Return Reason", type text}
    })
in
    #"Changed Type"
```
