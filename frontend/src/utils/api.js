// src/utils/api.js
 
const BASE = "http://localhost:5000";
 
export const fetchMedicines     = () => fetch(`${BASE}/medicines`).then(r => r.json());
export const fetchStats         = () => fetch(`${BASE}/stats`).then(r => r.json());
export const fetchExpiryAlerts  = () => fetch(`${BASE}/expiry-alert`).then(r => r.json());
export const fetchLowStock      = () => fetch(`${BASE}/low-stock`).then(r => r.json());
export const fetchFefo          = () => fetch(`${BASE}/fefo`).then(r => r.json());
export const fetchMLPredictions = () => fetch(`${BASE}/ml-predict`).then(r => r.json());
export const fetchDispenseLog   = () => fetch(`${BASE}/dispense-log`).then(r => r.json());
 
export async function dispenseDrug(name, quantity, ward = "OPD") {
  const res = await fetch(`${BASE}/dispense`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, quantity, ward }),
  });
  return res.json();
}
 
// ── jsPDF Report Generator ──
export async function generatePDFReport(drugs, type = "full") {
  // Dynamically import jsPDF
  const { jsPDF } = await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const { default: autoTable } = await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
 
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString("en-IN");
 
  // Header
  doc.setFillColor(4, 13, 26);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(0, 200, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("MediGuard AI", 14, 18);
  doc.setFontSize(11);
  doc.setTextColor(122, 155, 191);
  doc.text("Hospital Pharmacy Intelligence System", 14, 26);
  doc.text(`Generated: ${today}`, 14, 33);
 
  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const titles = { full:"Full Inventory Report", expiry:"Expiry Alert Report", low:"Low Stock Report" };
  doc.text(titles[type] || "Inventory Report", 14, 52);
 
  // Filter data
  const TODAY_DATE = new Date();
  let data = [...drugs];
  if (type === "expiry") {
    data = drugs.filter(d => {
      const days = Math.ceil((new Date(d.expiry) - TODAY_DATE) / 86400000);
      return days <= 90;
    }).sort((a,b) => new Date(a.expiry) - new Date(b.expiry));
  } else if (type === "low") {
    data = drugs.filter(d => d.quantity <= (d.threshold || 30));
  }
 
  // Summary box
  doc.setFillColor(240, 248, 255);
  doc.rect(14, 56, 182, 18, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  doc.text(`Total Records: ${data.length}   |   Low Stock: ${drugs.filter(d=>d.quantity<=30).length}   |   Near Expiry: ${drugs.filter(d=>Math.ceil((new Date(d.expiry)-TODAY_DATE)/86400000)<=90).length}`, 18, 67);
 
  // Table
  autoTable(doc, {
    startY: 78,
    head: [["#","Drug Name","Category","Batch","Qty","Threshold","Expiry","Supplier","Status"]],
    body: data.map((d, i) => {
      const days = Math.ceil((new Date(d.expiry) - TODAY_DATE) / 86400000);
      const status = days <= 30 ? "Critical" : days <= 180 ? "Expiring" : d.quantity <= (d.threshold||30) ? "Low Stock" : "Good";
      return [i+1, d.name, d.category||"—", d.batch, d.quantity, d.threshold||30, d.expiry, d.supplier||"—", status];
    }),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [0, 102, 255], textColor: 255, fontStyle:"bold" },
    alternateRowStyles: { fillColor: [245, 250, 255] },
    didParseCell: (data) => {
      if (data.column.index === 8) {
        const val = data.cell.raw;
        if (val === "Critical")  data.cell.styles.textColor = [255, 77, 109];
        if (val === "Expiring")  data.cell.styles.textColor = [255, 160, 0];
        if (val === "Low Stock") data.cell.styles.textColor = [255, 100, 0];
        if (val === "Good")      data.cell.styles.textColor = [0, 180, 120];
      }
    }
  });
 
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`MediGuard AI · City General Hospital · Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 8);
  }
 
  doc.save(`medistock_${type}_report_${today.replace(/\//g,"-")}.pdf`);
}
 