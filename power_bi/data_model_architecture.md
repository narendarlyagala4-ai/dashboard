# Star Schema Data Model Architecture
## E-Commerce Business Intelligence & Analytics

### Model Overview
The semantic layer follows a strict **Kimball Star Schema Design** to ensure optimal DAX performance, predictable filter context propagation, and simplified business querying.

```
                  +-------------------+
                  |     dim_date      |
                  +-------------------+
                  | PK: date_key      |
                  +---------+---------+
                            | 1
                            |
                            | * (Order Date Key)
+------------------+  1     |     *  +--------------------+
|  dim_customers   +--------+--------+    fact_orders     |
+------------------+                 +--------------------+
| PK: customer_id  |                 | PK: order_id       |
+------------------+                 | FK: customer_id    |
                                     | FK: product_id     |
+------------------+  1              | FK: geography_key  |
|   dim_products   +--------+--------+ FK: order_date_key |
+------------------+        |        | FK: ship_date_key  |
| PK: product_id   |        |        +---------+----------+
+------------------+        |                  | 1
                            |                  |
+------------------+  1     |                  | 1:1
|  dim_geography   +--------+                  |
+------------------+                           |
| PK: geography_key|                 +---------+----------+
+------------------+                 |    fact_returns    |
                                     +--------------------+
                                     | PK/FK: order_id    |
                                     +--------------------+
```

---

### Table Relationships & Cardinality

| Primary Table (Dimension) | Foreign Table (Fact) | Join Key (Primary/Foreign) | Cardinality | Filter Direction | Active / Inactive |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `dim_date` | `fact_orders` | `date_key` = `order_date_key` | 1-to-Many (`1:*`) | Single (`dim_date` $\rightarrow$ `fact_orders`) | **Active** |
| `dim_date` | `fact_orders` | `date_key` = `ship_date_key` | 1-to-Many (`1:*`) | Single (`dim_date` $\rightarrow$ `fact_orders`) | **Inactive** (Use `USERELATIONSHIP`) |
| `dim_customers` | `fact_orders` | `customer_id` = `customer_id` | 1-to-Many (`1:*`) | Single (`dim_customers` $\rightarrow$ `fact_orders`) | **Active** |
| `dim_products` | `fact_orders` | `product_id` = `product_id` | 1-to-Many (`1:*`) | Single (`dim_products` $\rightarrow$ `fact_orders`) | **Active** |
| `dim_geography` | `fact_orders` | `geography_key` = `geography_key` | 1-to-Many (`1:*`) | Single (`dim_geography` $\rightarrow$ `fact_orders`) | **Active** |
| `fact_orders` | `fact_returns` | `order_id` = `order_id` | 1-to-1 (`1:1`) | Both Directions | **Active** |

---

### Best Practices Implemented
1. **Surrogate Keys**: Integer `date_key` (`YYYYMMDD`) and string `geography_key` (`GEO-XXXX`) optimize compression and index scans.
2. **Single-Direction Filter Flow**: Prevents circular dependencies, ambiguous paths, and performance degradation in DAX calculations.
3. **Role-Playing Dimension (Date)**: Uses inactive relationship for `Ship Date` via `USERELATIONSHIP(fact_orders[ship_date_key], dim_date[date_key])`.
4. **Separation of Concerns**: Numerical transaction facts are isolated in `fact_orders`, categorical slice-and-dice attributes live in dimension tables.
