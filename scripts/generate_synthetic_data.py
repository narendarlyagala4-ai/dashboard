"""
Generate Realistic E-Commerce Synthetic Raw Dataset
Produces 5,500+ orders across 2023-2026 with realistic business scenarios:
- Q4 holiday spikes (Nov-Dec surges)
- Negative profit outliers on high-discount items (Tables, Binders, Supplies)
- RFM variation across segments (Consumer, Corporate, Home Office)
- Return rates correlated with categories (Furniture, Tech) and shipping delays
- Intentional real-world data quirks for ETL cleaning demonstration (casing, trailing whitespace, a few missing values).
"""

import os
import csv
import random
import datetime

random.seed(42)

os.makedirs("data/raw", exist_ok=True)
os.makedirs("data/processed", exist_ok=True)

# 1. PRODUCTS DEFINITION
categories_dict = {
    "Technology": {
        "Phones": [
            ("Apex Pro Smartphone 128GB", 450.0, 799.0),
            ("Horizon 5G Mobile 256GB", 520.0, 899.0),
            ("Vortex Lite Phone 64GB", 220.0, 399.0),
            ("Nova Flagship 512GB", 680.0, 1099.0),
            ("Echo Flip Smartphone", 600.0, 950.0)
        ],
        "Laptops": [
            ("TitanBook Pro 15-inch", 750.0, 1299.0),
            ("UltraSlim Laptop 13-inch", 580.0, 999.0),
            ("Spectra Gaming Rig 17-inch", 1100.0, 1899.0),
            ("CoreBook Student Edition", 320.0, 549.0),
            ("Zenith Carbon Touch 14-inch", 850.0, 1449.0)
        ],
        "Accessories": [
            ("Quantum Wireless Earbuds", 45.0, 129.0),
            ("HyperCharge 100W GaN Block", 18.0, 59.0),
            ("ErgoTrack Bluetooth Mouse", 22.0, 69.0),
            ("MechStrike RGB Keyboard", 55.0, 149.0),
            ("4K Ultra-Wide USB-C Hub", 35.0, 89.0)
        ],
        "Copiers & Printers": [
            ("Canon ImageRunner Multi-function", 900.0, 1699.0),
            ("HP Color LaserJet Pro Office", 380.0, 699.0),
            ("Brother Compact Monochrome Laser", 110.0, 199.0),
            ("Epson EcoTank Wireless All-in-One", 180.0, 329.0)
        ]
    },
    "Furniture": {
        "Chairs": [
            ("ErgoComfort Mesh Executive Chair", 160.0, 349.0),
            ("HighBack Leather Swivel Chair", 190.0, 399.0),
            ("ErgoFlex Lumbar Task Chair", 95.0, 219.0),
            ("Minimalist Wooden Dining Chair Set", 120.0, 249.0),
            ("AeroGamer Ergonomic Recliner", 140.0, 299.0)
        ],
        "Tables": [
            ("Nordic Solid Oak Dining Table", 380.0, 649.0),
            ("Dual-Motor Electric Standing Desk", 280.0, 499.0),
            ("Compact Folding Coffee Table", 75.0, 139.0),
            ("Industrial Steel Frame Meeting Table", 450.0, 799.0),
            ("Modern Minimalist Workstation Desk", 180.0, 319.0)
        ],
        "Bookcases": [
            ("Scandinavian 5-Tier Bookshelf", 110.0, 229.0),
            ("Modular Floating Wall Shelf Unit", 45.0, 99.0),
            ("Heavy Duty Industrial Bookcase", 160.0, 319.0),
            ("Corner Display Bookcase", 85.0, 169.0)
        ],
        "Furnishings": [
            ("Architect LED Task Lamp", 25.0, 65.0),
            ("Acoustic Foam Soundproof Panels", 30.0, 75.0),
            ("Anti-Fatigue Standing Mat", 20.0, 49.0),
            ("Luxury Wool Area Rug 5x7", 90.0, 210.0)
        ]
    },
    "Office Supplies": {
        "Storage": [
            ("Lockable 3-Drawer Steel Cabinet", 95.0, 189.0),
            ("Clear Acrylic Desktop Organizer", 12.0, 32.0),
            ("Heavy Duty Storage Totes 4-Pack", 28.0, 69.0),
            ("Stackable Document File Boxes", 15.0, 39.0)
        ],
        "Art": [
            ("Premium Sketch & Marker Set 80pc", 18.0, 49.0),
            ("Precision Guillotine Paper Cutter", 24.0, 59.0),
            ("Magnetic Whiteboard 36x24 with Marker Kit", 32.0, 79.0),
            ("Heavy-Duty Metal Drafting Easel", 45.0, 110.0)
        ],
        "Paper": [
            ("Premium Multipurpose Copy Paper 5 Reams", 14.0, 34.0),
            ("Recycled Glossy Photo Paper 100pk", 9.0, 24.0),
            ("Heavy Cardstock 250 Sheets", 11.0, 28.0),
            ("Dot-Grid Executive Notebooks 3-Pack", 8.0, 22.0)
        ],
        "Binders": [
            ("Heavy Duty D-Ring Binder 3-inch 6pk", 16.0, 42.0),
            ("Presentation Display Book 40 Pockets", 6.0, 18.0),
            ("Clear Sheet Protectors 200pk", 7.0, 19.0),
            ("Color-Coded Tab Dividers 12-Set", 4.0, 12.0)
        ],
        "Appliances": [
            ("Office Espresso & Coffee Machine", 140.0, 299.0),
            ("Compact Countertop Microwave Oven", 65.0, 139.0),
            ("Mini Fridge with Freezer 3.2 Cu Ft", 110.0, 229.0),
            ("Personal Ceramic Space Heater", 18.0, 45.0)
        ],
        "Fasteners": [
            ("High-Capacity Heavy Duty Stapler", 12.0, 29.0),
            ("Assorted Binder Clips & Paper Clips Tub", 4.0, 11.0),
            ("Velcro Cable Management Straps 50pk", 5.0, 14.0)
        ]
    }
}

products_list = []
prod_id_counter = 1
for cat, subcats in categories_dict.items():
    for subcat, prods in subcats.items():
        for name, cost, price in prods:
            prod_id = f"PROD-{prod_id_counter:04d}"
            products_list.append({
                "Product ID": prod_id,
                "Product Name": name,
                "Category": cat,
                "Sub-Category": subcat,
                "Cost": cost,
                "Selling Price": price
            })
            prod_id_counter += 1

with open("data/raw/products.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["Product ID", "Product Name", "Category", "Sub-Category", "Cost", "Selling Price"])
    writer.writeheader()
    writer.writerows(products_list)

# 2. GEOGRAPHY & CUSTOMERS
geography_data = [
    # West
    ("West", "California", "Los Angeles"),
    ("West", "California", "San Francisco"),
    ("West", "California", "San Diego"),
    ("West", "California", "San Jose"),
    ("West", "Washington", "Seattle"),
    ("West", "Washington", "Spokane"),
    ("West", "Oregon", "Portland"),
    ("West", "Colorado", "Denver"),
    ("West", "Arizona", "Phoenix"),
    ("West", "Nevada", "Las Vegas"),
    # East
    ("East", "New York", "New York City"),
    ("East", "New York", "Buffalo"),
    ("East", "Pennsylvania", "Philadelphia"),
    ("East", "Pennsylvania", "Pittsburgh"),
    ("East", "Massachusetts", "Boston"),
    ("East", "New Jersey", "Newark"),
    # Central
    ("Central", "Illinois", "Chicago"),
    ("Central", "Texas", "Houston"),
    ("Central", "Texas", "Dallas"),
    ("Central", "Texas", "Austin"),
    ("Central", "Texas", "San Antonio"),
    ("Central", "Michigan", "Detroit"),
    ("Central", "Ohio", "Columbus"),
    ("Central", "Ohio", "Cleveland"),
    ("Central", "Minnesota", "Minneapolis"),
    # South
    ("South", "Florida", "Miami"),
    ("South", "Florida", "Orlando"),
    ("South", "Florida", "Tampa"),
    ("South", "Georgia", "Atlanta"),
    ("South", "North Carolina", "Charlotte"),
    ("South", "Tennessee", "Nashville"),
    ("South", "Virginia", "Richmond")
]

first_names = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Margaret",
    "Matthew", "Lisa", "Anthony", "Betty", "Donald", "Dorothy", "Mark", "Sandra",
    "Paul", "Ashley", "Steven", "Kimberly", "Andrew", "Donna", "Kenneth", "Emily",
    "Joshua", "Carol", "Kevin", "Michelle", "Brian", "Amanda", "George", "Melissa",
    "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
    "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
    "Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen", "Stephen", "Anna",
    "Larry", "Brenda", "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma",
    "Benjamin", "Samantha", "Samuel", "Katherine", "Gregory", "Christine", "Frank", "Debra",
    "Alexander", "Rachel", "Raymond", "Catherine", "Patrick", "Carolyn", "Jack", "Janet",
    "Dennis", "Ruth", "Jerry", "Maria", "Tyler", "Heather", "Aaron", "Diane",
    "Jose", "Virginia", "Adam", "Julie", "Nathan", "Joyce", "Henry", "Victoria",
    "Douglas", "Olivia", "Zachary", "Kelly", "Peter", "Christina", "Kyle", "Lauren"
]

last_names = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
    "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
    "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
    "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
    "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
    "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey"
]

segments = ["Consumer", "Corporate", "Home Office"]
segment_weights = [0.52, 0.30, 0.18]

num_customers = 850
customers_list = []

start_join_date = datetime.date(2022, 1, 1)
end_join_date = datetime.date(2025, 6, 30)
days_between = (end_join_date - start_join_date).days

for i in range(1, num_customers + 1):
    c_id = f"CUST-{i:04d}"
    c_name = f"{random.choice(first_names)} {random.choice(last_names)}"
    c_seg = random.choices(segments, weights=segment_weights)[0]
    geo = random.choice(geography_data)
    
    rand_days = random.randint(0, days_between)
    join_dt = start_join_date + datetime.timedelta(days=rand_days)
    
    customers_list.append({
        "Customer ID": c_id,
        "Customer Name": c_name,
        "Segment": c_seg,
        "Region": geo[0],
        "State": geo[1],
        "City": geo[2],
        "Join Date": join_dt.strftime("%Y-%m-%d")
    })

with open("data/raw/customers.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["Customer ID", "Customer Name", "Segment", "Region", "State", "City", "Join Date"])
    writer.writeheader()
    writer.writerows(customers_list)

# 3. GENERATE ORDERS (2023 - 2026)
start_order_date = datetime.date(2023, 1, 1)
end_order_date = datetime.date(2026, 6, 30)

order_rows = []
order_id_counter = 10001

month_weights = {
    1: 0.70, 2: 0.72, 3: 0.85, 4: 0.82, 5: 0.90, 6: 0.95,
    7: 1.05, 8: 1.10, 9: 1.15, 10: 1.30, 11: 1.65, 12: 1.80
}

# Generate ~5,500 realistic orders
for cust in customers_list:
    c_id = cust["Customer ID"]
    c_region = cust["Region"]
    c_state = cust["State"]
    c_city = cust["City"]
    join_dt = datetime.datetime.strptime(cust["Join Date"], "%Y-%m-%d").date()
    
    # Pareto frequency distribution
    # 20% high volume (8-16 orders), 50% medium (3-7 orders), 30% low (1-2 orders)
    r_val = random.random()
    if r_val < 0.20:
        n_orders = random.randint(8, 16)
    elif r_val < 0.70:
        n_orders = random.randint(3, 7)
    else:
        n_orders = random.randint(1, 2)
        
    for _ in range(n_orders):
        if join_dt >= end_order_date:
            ord_dt = join_dt
        else:
            avail_days = (end_order_date - join_dt).days
            if avail_days <= 0:
                ord_dt = join_dt
            else:
                while True:
                    d_offset = random.randint(0, avail_days)
                    candidate_dt = join_dt + datetime.timedelta(days=d_offset)
                    m_wt = month_weights.get(candidate_dt.month, 1.0)
                    if random.random() < (m_wt / 1.80):
                        ord_dt = candidate_dt
                        break
        
        # Ship date
        ship_days = random.choices([1, 2, 3, 4, 5, 6, 7], weights=[0.15, 0.35, 0.25, 0.12, 0.08, 0.03, 0.02])[0]
        ship_dt = ord_dt + datetime.timedelta(days=ship_days)
        
        # Product
        prod_row = random.choice(products_list)
        p_id = prod_row["Product ID"]
        p_cat = prod_row["Category"]
        p_subcat = prod_row["Sub-Category"]
        p_cost = float(prod_row["Cost"])
        p_price = float(prod_row["Selling Price"])
        
        qty = random.choices([1, 2, 3, 4, 5, 6, 8, 10], weights=[0.45, 0.25, 0.15, 0.07, 0.04, 0.02, 0.01, 0.01])[0]
        
        # Discount logic
        if p_subcat in ["Tables", "Bookcases", "Storage"]:
            discount = random.choices([0.0, 0.05, 0.10, 0.15, 0.20, 0.30, 0.40, 0.50, 0.60], 
                                      weights=[0.25, 0.15, 0.15, 0.12, 0.10, 0.10, 0.08, 0.03, 0.02])[0]
        elif p_cat == "Technology":
            discount = random.choices([0.0, 0.05, 0.10, 0.15, 0.20, 0.25], 
                                      weights=[0.55, 0.20, 0.12, 0.08, 0.03, 0.02])[0]
        else:
            discount = random.choices([0.0, 0.05, 0.10, 0.15, 0.20, 0.30, 0.40], 
                                      weights=[0.45, 0.20, 0.15, 0.08, 0.06, 0.04, 0.02])[0]
            
        gross_sales = p_price * qty
        net_sales = round(gross_sales * (1.0 - discount), 2)
        total_cost = round(p_cost * qty, 2)
        
        # Shipping overhead
        shipping_overhead = round(qty * random.uniform(3.0, 7.0), 2)
        profit = round(net_sales - total_cost - shipping_overhead, 2)
        
        ord_id = f"ORD-{ord_dt.year}-{order_id_counter}"
        order_id_counter += 1
        
        # Occasionally simulate dirty data quirks in 1% of rows to test ETL
        r_quirk = random.random()
        cat_str = p_cat
        reg_str = c_region
        if r_quirk < 0.01:
            cat_str = p_cat.lower()  # lowercase anomaly
        elif r_quirk < 0.02:
            reg_str = c_region + " "  # trailing space anomaly
            
        order_rows.append({
            "Order ID": ord_id,
            "Order Date": ord_dt.strftime("%Y-%m-%d"),
            "Ship Date": ship_dt.strftime("%Y-%m-%d"),
            "Customer ID": c_id,
            "Product ID": p_id,
            "Region": reg_str,
            "State": c_state,
            "City": c_city,
            "Category": cat_str,
            "Sub-Category": p_subcat,
            "Sales": net_sales,
            "Quantity": qty,
            "Discount": discount,
            "Profit": profit
        })

# Sort orders by date
order_rows.sort(key=lambda x: x["Order Date"])

# Write orders.csv
order_fieldnames = ["Order ID", "Order Date", "Ship Date", "Customer ID", "Product ID", 
                    "Region", "State", "City", "Category", "Sub-Category", "Sales", "Quantity", "Discount", "Profit"]
with open("data/raw/orders.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=order_fieldnames)
    writer.writeheader()
    writer.writerows(order_rows)

# 4. GENERATE RETURNS
returns_list = []
return_reasons = [
    "Damaged in Transit",
    "Defective Item",
    "Wrong Item Sent",
    "Late Delivery",
    "Customer Changed Mind",
    "Product Did Not Meet Expectations"
]
reason_weights = [0.25, 0.22, 0.18, 0.15, 0.12, 0.08]

for ord_row in order_rows:
    ord_id = ord_row["Order ID"]
    cat = ord_row["Category"].strip().capitalize()
    subcat = ord_row["Sub-Category"]
    disc = float(ord_row["Discount"])
    
    base_ret_prob = 0.04
    if cat == "Furniture":
        base_ret_prob += 0.04
    if subcat in ["Phones", "Laptops"]:
        base_ret_prob += 0.03
    if disc >= 0.30:
        base_ret_prob += 0.025
        
    if random.random() < base_ret_prob:
        reason = random.choices(return_reasons, weights=reason_weights)[0]
        returns_list.append({
            "Order ID": ord_id,
            "Return Status": "Returned",
            "Return Reason": reason
        })

with open("data/raw/returns.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["Order ID", "Return Status", "Return Reason"])
    writer.writeheader()
    writer.writerows(returns_list)

total_sales = sum(r["Sales"] for r in order_rows)
total_profit = sum(r["Profit"] for r in order_rows)

print("="*60)
print("SUCCESSFULLY GENERATED ENRICHED RAW DATASETS")
print(f"- Orders: {len(order_rows)} rows -> data/raw/orders.csv")
print(f"- Customers: {len(customers_list)} rows -> data/raw/customers.csv")
print(f"- Products: {len(products_list)} rows -> data/raw/products.csv")
print(f"- Returns: {len(returns_list)} rows -> data/raw/returns.csv")
print(f"Total Revenue: ${total_sales:,.2f}")
print(f"Total Profit: ${total_profit:,.2f}")
print(f"Overall Profit Margin: {(total_profit / total_sales)*100:.2f}%")
print(f"Overall Return Rate: {(len(returns_list) / len(order_rows))*100:.2f}%")
print("="*60)
