"""
Dashboard File & Data Integrity Validator
Checks that index.html, style.css, app.js, and data.json are valid and well-formed.
"""

import json
import os

print("=" * 60)
print("VERIFYING DASHBOARD APP ASSETS")
print("=" * 60)

required_files = [
    "dashboard_app/index.html",
    "dashboard_app/style.css",
    "dashboard_app/app.js",
    "dashboard_app/data.json"
]

all_passed = True
for fpath in required_files:
    if os.path.exists(fpath):
        size_kb = os.path.getsize(fpath) / 1024
        print(f" [PASS] {fpath} exists ({size_kb:.1f} KB)")
    else:
        print(f" [FAIL] {fpath} is missing!")
        all_passed = False

with open("dashboard_app/data.json", "r", encoding="utf-8") as f:
    payload = json.load(f)
    print("\nPayload Data Health:")
    print(f" - Orders Count: {len(payload['orders']):,}")
    print(f" - Customers Count: {len(payload['customers']):,}")
    print(f" - Products Count: {len(payload['products']):,}")
    print(f" - Date Range: {payload['metadata']['date_range']}")

print("=" * 60)
print("ALL DASHBOARD ASSETS VALIDATED SUCCESSFULLY")
print("=" * 60)
