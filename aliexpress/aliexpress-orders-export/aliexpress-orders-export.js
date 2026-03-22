(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function text(el) {
    return (el?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function absUrl(url) {
    if (!url) return "";
    try {
      if (url.startsWith("//")) return location.protocol + url;
      return new URL(url, location.href).href;
    } catch {
      return url;
    }
  }

  function csvEscape(value) {
    const s = value == null ? "" : String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function parseHeaderInfo(headerInfoEl) {
    const raw = text(headerInfoEl);
    const dateMatch = raw.match(/Order date:\s*([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4})/i);
    const orderIdMatch = raw.match(/Order ID:\s*(\d{8,})/i);

    return {
      order_date: dateMatch ? dateMatch[1] : "",
      order_id: orderIdMatch ? orderIdMatch[1] : "",
      header_raw: raw,
    };
  }

  function parseQuantity(card) {
    const qtyText = text(card.querySelector(".order-item-content-info-number-quantity"));
    const m = qtyText.match(/x\s*(\d+)/i);
    return m ? Number(m[1]) : "";
  }

  function parseMoneyFromText(s) {
    const raw = (s || "").replace(/\s+/g, " ").trim();
    if (!raw) return { raw: "", currency: "", amount: "" };

    const currencyMatch = raw.match(/[₩$€£¥₹₽₫฿₪₺₱]|USD|EUR|GBP|JPY|KRW|CNY|AUD|CAD|SGD|HKD/i);
    const amountMatch = raw.match(/[\d,]+(?:\.\d+)?/);

    return {
      raw,
      currency: currencyMatch ? currencyMatch[0] : "",
      amount: amountMatch ? amountMatch[0].replace(/,/g, "") : "",
    };
  }

  function parseTotal(card) {
    const totalEl = card.querySelector(".order-item-content-opt-price-total");
    const totalText = text(totalEl).replace(/^Total:\s*/i, "").trim();
    return parseMoneyFromText(totalText);
  }

  function parseUnitPrice(card) {
    const numberWrap = card.querySelector(".order-item-content-info-number");
    const fullText = text(numberWrap);
    const cleaned = fullText.replace(/x\s*\d+/i, "").trim();
    return parseMoneyFromText(cleaned);
  }

  function parseOrder(card) {
    const status = text(card.querySelector(".order-item-header-status-text"));
    const headerInfoEl = card.querySelector(".order-item-header-right-info");
    const { order_date, order_id, header_raw } = parseHeaderInfo(headerInfoEl);

    const orderDetailLink = absUrl(
      card.querySelector('a[href*="/p/order/detail.html"]')?.getAttribute("href") || ""
    );

    const storeAnchor = card.querySelector(".order-item-store-name a");
    const store_name = text(storeAnchor);
    const store_url = absUrl(storeAnchor?.getAttribute("href") || "");

    const productAnchor = card.querySelector(".order-item-content-info-name a");
    const product_url = absUrl(productAnchor?.getAttribute("href") || "");
    const item_title =
      productAnchor?.querySelector("span")?.getAttribute("title") || text(productAnchor);

    const sku = text(card.querySelector(".order-item-content-info-sku"));
    const quantity = parseQuantity(card);

    const unitPrice = parseUnitPrice(card);
    const totalPrice = parseTotal(card);

    const imgDiv = card.querySelector(".order-item-content-img");
    const style = imgDiv?.getAttribute("style") || "";
    const imgMatch = style.match(/url\("?(.*?)"?\)/i);
    const image_url = imgMatch ? absUrl(imgMatch[1]) : "";

    const storeMessageUrl = absUrl(
      card.querySelector(".order-item-store-message")?.getAttribute("href") || ""
    );

    return {
      order_id,
      order_date,
      status,
      store_name,
      store_url,
      store_message_url: storeMessageUrl,
      item_title,
      sku,
      quantity,
      item_price: unitPrice.raw,
      item_price_currency: unitPrice.currency,
      item_price_amount: unitPrice.amount,
      order_total: totalPrice.raw,
      order_total_currency: totalPrice.currency,
      order_total_amount: totalPrice.amount,
      product_url,
      order_detail_url: orderDetailLink,
      image_url,
      raw_header: header_raw,
    };
  }

  function toCsv(rows) {
    const headers = [
      "order_id",
      "order_date",
      "status",
      "store_name",
      "store_url",
      "store_message_url",
      "item_title",
      "sku",
      "quantity",
      "item_price",
      "item_price_currency",
      "item_price_amount",
      "order_total",
      "order_total_currency",
      "order_total_amount",
      "product_url",
      "order_detail_url",
      "image_url",
    ];

    const lines = [headers.join(",")];
    for (const row of rows) {
      lines.push(headers.map((h) => csvEscape(row[h])).join(","));
    }
    return lines.join("\n");
  }

  function getOrderCount() {
    return document.querySelectorAll(".order-item").length;
  }

  function getViewOrdersButton() {
    const btn = document.querySelector(".order-more button");
    if (!btn) return null;
    const label = text(btn);
    if (!/view orders/i.test(label)) return null;
    return btn;
  }

  async function clickViewOrdersButton(btn) {
    try {
      btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    } catch {
      btn.click();
    }
  }

  async function loadAllOrders(maxClicks = 100) {
    let stableRounds = 0;
    let previousCount = getOrderCount();

    console.log(`[AE] initial order count = ${previousCount}`);

    for (let i = 0; i < maxClicks; i++) {
      const btn = getViewOrdersButton();

      if (!btn) {
        console.log("[AE] no more 'View orders' button found");
        break;
      }

      btn.scrollIntoView({ behavior: "auto", block: "center" });
      await sleep(800);

      const before = getOrderCount();
      console.log(`[AE] click ${i + 1}: before=${before}`);

      await clickViewOrdersButton(btn);
      await sleep(1800);

      let after = before;
      for (let j = 0; j < 12; j++) {
        await sleep(500);
        after = getOrderCount();
        if (after > before) break;
      }

      console.log(`[AE] click ${i + 1}: after=${after}`);

      if (after === previousCount) stableRounds++;
      else stableRounds = 0;

      previousCount = after;

      if (stableRounds >= 3) {
        console.log("[AE] order count stopped increasing");
        break;
      }
    }

    window.scrollTo(0, 0);
  }

  console.log("[AE] start loading all orders...");
  await loadAllOrders();

  const cards = Array.from(document.querySelectorAll(".order-item"));
  const rows = cards.map(parseOrder);

  const deduped = [];
  const seen = new Set();

  for (const row of rows) {
    const key = row.order_id || `${row.order_detail_url}|${row.item_title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(row);
  }

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonFilename = `aliexpress-orders-${ts}.json`;
  const csvFilename = `aliexpress-orders-${ts}.csv`;

  downloadFile(
    jsonFilename,
    JSON.stringify(deduped, null, 2),
    "application/json;charset=utf-8"
  );
  downloadFile(csvFilename, toCsv(deduped), "text/csv;charset=utf-8");

  console.table(
    deduped.map((r) => ({
      order_id: r.order_id,
      order_date: r.order_date,
      status: r.status,
      store_name: r.store_name,
      item_title: r.item_title,
      quantity: r.quantity,
      order_total: r.order_total,
    }))
  );

  console.log(`[AE] exported ${deduped.length} orders`);
  return deduped;
})();
