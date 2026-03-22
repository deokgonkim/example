# AliExpress Orders Exporter

Browser DevTools script for exporting your AliExpress order history to **JSON** and **CSV**.

This script was written against a sample AliExpress orders page HTML and targets the current order-list structure such as:

- `.order-item`
- `.order-item-header-status-text`
- `.order-item-header-right-info`
- `.order-item-store-name a`
- `.order-item-content-info-name a`
- `.order-item-content-info-sku`
- `.order-item-content-opt-price-total`
- `.order-more button`

It also handles repeated clicking of the **View orders** button and avoids the unrelated **More to love** recommendation area.

## Features

- Exports loaded orders to `JSON`
- Exports loaded orders to `CSV`
- Clicks **View orders** repeatedly until no more orders are added
- Extracts:
  - order ID
  - order date
  - status
  - store name / store URL
  - item title
  - SKU
  - quantity
  - item price
  - order total
  - product URL
  - order detail URL
  - image URL
- Deduplicates rows by `order_id` when available

## File

- `aliexpress-orders-export.js`

## Usage

1. Log in to AliExpress.
2. Open your orders page.
3. Open browser developer tools.
4. Go to the **Console** tab.
5. Paste the contents of `aliexpress-orders-export.js`.
6. Run it.
7. Wait until the script finishes clicking **View orders** and exporting files.

The script will download two files:

- `aliexpress-orders-YYYY-MM-DDTHH-mm-ss-sssZ.json`
- `aliexpress-orders-YYYY-MM-DDTHH-mm-ss-sssZ.csv`

## Output fields

The exported objects include these fields:

- `order_id`
- `order_date`
- `status`
- `store_name`
- `store_url`
- `store_message_url`
- `item_title`
- `sku`
- `quantity`
- `item_price`
- `item_price_currency`
- `item_price_amount`
- `order_total`
- `order_total_currency`
- `order_total_amount`
- `product_url`
- `order_detail_url`
- `image_url`
- `raw_header`

## Notes

- This is **not** an official AliExpress export feature.
- It depends on the current DOM structure of the orders page.
- If AliExpress changes its HTML or class names, the script may need updates.
- Some orders may contain multiple products. The current script extracts the first matching product block inside each `.order-item` card.
- You may need to re-run the script later if AliExpress changes the page layout.

## Safety / privacy

- Run the script only in your own browser session.
- Review the code before running it.
- The script does not send data anywhere; it only reads the current page and downloads files locally.

## Example repository structure

```text
.
├── README.md
└── aliexpress-orders-export.js
```

## Reference

- Script logic was refined by analyzing a user-provided sample AliExpress orders page HTML with ChatGPT.
