"use client";
import { useState } from "react";

export default function InvoicePage() {
  const [invoice, setInvoice] = useState({
    from: "", fromAddress: "", fromGST: "",
    to: "", toAddress: "", toGST: "",
    invoiceNo: `INV-${Date.now().toString(36).toUpperCase()}`,
    date: new Date().toISOString().split("T")[0],
    items: [{ desc: "", qty: 1, rate: 0 }],
    tax: 18,
    notes: "",
  });

  const addItem = () => setInvoice({ ...invoice, items: [...invoice.items, { desc: "", qty: 1, rate: 0 }] });
  const removeItem = (i) => setInvoice({ ...invoice, items: invoice.items.filter((_, j) => j !== i) });
  const updateItem = (i, k, v) => {
    const items = [...invoice.items];
    items[i] = { ...items[i], [k]: v };
    setInvoice({ ...invoice, items });
  };

  const subtotal = invoice.items.reduce((s, it) => s + it.qty * it.rate, 0);
  const taxAmount = (subtotal * invoice.tax) / 100;
  const total = subtotal + taxAmount;

  const printInvoice = () => window.print();

  return (
    <>
      <style>{`@media print { .no-print { display: none !important; } .print-only { display: block !important; } main { padding: 0 !important; } .site-header, .site-footer { display: none !important; } .invoice-preview { border: none !important; box-shadow: none !important; } }`}</style>

      <div className="no-print">
        <h1 className="display" style={{ fontSize: "2rem" }}>Free Invoice Generator</h1>
        <p style={{ color: "var(--ivory-dim)", marginTop: 8 }}>
          Create professional GST invoices in seconds. No signup required.
          <span style={{ color: "var(--gold)", marginLeft: 8 }}>Powered by GoSite</span>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 24 }} className="no-print">
        <div className="panel">
          <h3 className="display" style={{ fontSize: "1rem" }}>From (Your Business)</h3>
          <label>Business Name</label>
          <input value={invoice.from} onChange={(e) => setInvoice({ ...invoice, from: e.target.value })} placeholder="Your Company Name" />
          <label>Address</label>
          <input value={invoice.fromAddress} onChange={(e) => setInvoice({ ...invoice, fromAddress: e.target.value })} placeholder="Your address" />
          <label>GSTIN</label>
          <input value={invoice.fromGST} onChange={(e) => setInvoice({ ...invoice, fromGST: e.target.value })} placeholder="22AAAAA0000A1Z5" />
        </div>
        <div className="panel">
          <h3 className="display" style={{ fontSize: "1rem" }}>To (Client)</h3>
          <label>Client Name</label>
          <input value={invoice.to} onChange={(e) => setInvoice({ ...invoice, to: e.target.value })} placeholder="Client Company" />
          <label>Address</label>
          <input value={invoice.toAddress} onChange={(e) => setInvoice({ ...invoice, toAddress: e.target.value })} placeholder="Client address" />
          <label>GSTIN</label>
          <input value={invoice.toGST} onChange={(e) => setInvoice({ ...invoice, toGST: e.target.value })} placeholder="Optional" />
        </div>
      </div>

      <div className="panel no-print" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="display" style={{ fontSize: "1rem" }}>Items</h3>
          <div style={{ display: "flex", gap: 12 }}>
            <div>
              <label style={{ margin: 0 }}>Invoice #</label>
              <input value={invoice.invoiceNo} onChange={(e) => setInvoice({ ...invoice, invoiceNo: e.target.value })} style={{ width: 160 }} />
            </div>
            <div>
              <label style={{ margin: 0 }}>Date</label>
              <input type="date" value={invoice.date} onChange={(e) => setInvoice({ ...invoice, date: e.target.value })} style={{ width: 160 }} />
            </div>
          </div>
        </div>
        {invoice.items.map((item, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 80px 120px 40px", gap: 8, marginTop: 8, alignItems: "end" }}>
            <div>
              <label style={{ margin: 0, fontSize: "0.72rem" }}>Description</label>
              <input value={item.desc} onChange={(e) => updateItem(i, "desc", e.target.value)} placeholder="Service or product" />
            </div>
            <div>
              <label style={{ margin: 0, fontSize: "0.72rem" }}>Qty</label>
              <input type="number" value={item.qty} onChange={(e) => updateItem(i, "qty", Number(e.target.value))} min="1" />
            </div>
            <div>
              <label style={{ margin: 0, fontSize: "0.72rem" }}>Rate (₹)</label>
              <input type="number" value={item.rate} onChange={(e) => updateItem(i, "rate", Number(e.target.value))} min="0" />
            </div>
            <button onClick={() => removeItem(i)} className="secondary" style={{ padding: "8px", marginTop: 0, fontSize: "0.8rem" }}>✕</button>
          </div>
        ))}
        <button onClick={addItem} className="secondary" style={{ marginTop: 12, fontSize: "0.82rem" }}>+ Add item</button>

        <div style={{ display: "flex", gap: 16, marginTop: 16, alignItems: "center" }}>
          <div>
            <label style={{ margin: 0 }}>Tax %</label>
            <input type="number" value={invoice.tax} onChange={(e) => setInvoice({ ...invoice, tax: Number(e.target.value) })} style={{ width: 80 }} min="0" />
          </div>
          <div>
            <label style={{ margin: 0 }}>Notes</label>
            <input value={invoice.notes} onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })} placeholder="Payment terms, bank details…" style={{ width: 400 }} />
          </div>
        </div>
      </div>

      <div className="no-print" style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button onClick={printInvoice}>🖨️ Print / Save PDF</button>
      </div>

      {/* Print-friendly invoice preview */}
      <div className="invoice-preview panel" style={{ marginTop: 24, background: "#fff", color: "#111", padding: 32, borderRadius: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #111", paddingBottom: 16 }}>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>{invoice.from || "Your Business"}</div>
            <div style={{ fontSize: "0.85rem", color: "#666" }}>{invoice.fromAddress}</div>
            {invoice.fromGST && <div style={{ fontSize: "0.82rem" }}>GSTIN: {invoice.fromGST}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#D4A843" }}>INVOICE</div>
            <div style={{ fontSize: "0.85rem" }}>#{invoice.invoiceNo}</div>
            <div style={{ fontSize: "0.85rem" }}>Date: {invoice.date}</div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#999", letterSpacing: "0.1em" }}>Bill To</div>
          <div style={{ fontWeight: 600, marginTop: 4 }}>{invoice.to || "Client Name"}</div>
          <div style={{ fontSize: "0.85rem", color: "#666" }}>{invoice.toAddress}</div>
          {invoice.toGST && <div style={{ fontSize: "0.82rem" }}>GSTIN: {invoice.toGST}</div>}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ddd" }}>
              <th style={{ textAlign: "left", padding: "8px 0", fontSize: "0.75rem", color: "#999", textTransform: "uppercase" }}>Description</th>
              <th style={{ textAlign: "right", padding: "8px 0", fontSize: "0.75rem", color: "#999" }}>Qty</th>
              <th style={{ textAlign: "right", padding: "8px 0", fontSize: "0.75rem", color: "#999" }}>Rate</th>
              <th style={{ textAlign: "right", padding: "8px 0", fontSize: "0.75rem", color: "#999" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px 0" }}>{item.desc || "—"}</td>
                <td style={{ textAlign: "right", padding: "10px 0" }}>{item.qty}</td>
                <td style={{ textAlign: "right", padding: "10px 0" }}>₹{item.rate.toLocaleString()}</td>
                <td style={{ textAlign: "right", padding: "10px 0", fontWeight: 600 }}>₹{(item.qty * item.rate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 16, borderTop: "1px solid #ddd", paddingTop: 12, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <div style={{ display: "flex", gap: 40 }}>
            <span style={{ color: "#666" }}>Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", gap: 40 }}>
            <span style={{ color: "#666" }}>Tax ({invoice.tax}%)</span>
            <span>₹{taxAmount.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", gap: 40, fontSize: "1.2rem", fontWeight: 700, borderTop: "2px solid #111", paddingTop: 8, marginTop: 4 }}>
            <span>Total</span>
            <span style={{ color: "#D4A843" }}>₹{total.toLocaleString()}</span>
          </div>
        </div>

        {invoice.notes && (
          <div style={{ marginTop: 20, fontSize: "0.85rem", color: "#666", borderTop: "1px solid #eee", paddingTop: 12 }}>
            <strong>Notes:</strong> {invoice.notes}
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: "center", fontSize: "0.72rem", color: "#999" }}>
          Generated on gosite.lol — Free Invoice Generator for Indian Businesses
        </div>
      </div>

      <div className="panel no-print" style={{ marginTop: 24, textAlign: "center" }}>
        <p style={{ color: "var(--ivory-dim)", fontSize: "0.88rem" }}>
          📢 Want more customers? <a href="/promote" style={{ color: "var(--gold)", fontWeight: 600 }}>List your business on GoSite for free</a> and start getting WhatsApp leads today.
        </p>
      </div>
    </>
  );
}
