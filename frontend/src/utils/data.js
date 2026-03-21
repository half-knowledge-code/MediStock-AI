export const CATEGORIES = [
  "Antibiotic","Cardiac","Analgesic","NSAID","Hormone",
  "Antihistamine","PPI","Antidiabetic","Antiplatelet","Other"
];

export const INITIAL_DRUGS = [
  { id:"1",  name:"Ciprofloxacin", category:"Antibiotic",    batch:"BATCH-3835", quantity:78,  threshold:40, unitPrice:12, expiry:"2026-05-18", supplier:"MedPlus Pharma" },
  { id:"2",  name:"Atorvastatin",  category:"Cardiac",       batch:"BATCH-1839", quantity:53,  threshold:30, unitPrice:8,  expiry:"2027-10-03", supplier:"Sun Pharma" },
  { id:"3",  name:"Azithromycin",  category:"Antibiotic",    batch:"BATCH-1628", quantity:43,  threshold:25, unitPrice:15, expiry:"2028-06-06", supplier:"Cipla Ltd" },
  { id:"4",  name:"Ciprofloxacin", category:"Antibiotic",    batch:"BATCH-8367", quantity:115, threshold:40, unitPrice:12, expiry:"2028-08-21", supplier:"MedPlus Pharma" },
  { id:"5",  name:"Ciprofloxacin", category:"Antibiotic",    batch:"BATCH-3703", quantity:16,  threshold:40, unitPrice:12, expiry:"2026-04-25", supplier:"MedPlus Pharma" },
  { id:"6",  name:"Amoxicillin",   category:"Antibiotic",    batch:"BATCH-9842", quantity:114, threshold:35, unitPrice:6,  expiry:"2026-12-02", supplier:"Alkem Labs" },
  { id:"7",  name:"Insulin",       category:"Hormone",       batch:"BATCH-6885", quantity:130, threshold:50, unitPrice:95, expiry:"2027-10-19", supplier:"Novo Nordisk" },
  { id:"8",  name:"Diclofenac",    category:"NSAID",         batch:"BATCH-0486", quantity:25,  threshold:30, unitPrice:5,  expiry:"2027-04-24", supplier:"Alkem Labs" },
  { id:"9",  name:"Cetirizine",    category:"Antihistamine", batch:"BATCH-7544", quantity:79,  threshold:30, unitPrice:4,  expiry:"2026-10-21", supplier:"Dr. Reddy's" },
  { id:"10", name:"Dolo 650",      category:"Analgesic",     batch:"BATCH-0738", quantity:84,  threshold:40, unitPrice:3,  expiry:"2028-05-28", supplier:"Micro Labs" },
  { id:"11", name:"Paracetamol",   category:"Analgesic",     batch:"BATCH-4623", quantity:65,  threshold:40, unitPrice:3,  expiry:"2026-12-27", supplier:"Micro Labs" },
  { id:"12", name:"Atorvastatin",  category:"Cardiac",       batch:"BATCH-4438", quantity:30,  threshold:30, unitPrice:8,  expiry:"2028-02-17", supplier:"Sun Pharma" },
  { id:"13", name:"Aspirin",       category:"Antiplatelet",  batch:"BATCH-5277", quantity:62,  threshold:30, unitPrice:2,  expiry:"2027-11-28", supplier:"Bayer" },
  { id:"14", name:"Ciprofloxacin", category:"Antibiotic",    batch:"BATCH-8538", quantity:158, threshold:40, unitPrice:12, expiry:"2027-12-15", supplier:"MedPlus Pharma" },
  { id:"15", name:"Azithromycin",  category:"Antibiotic",    batch:"BATCH-2615", quantity:96,  threshold:25, unitPrice:15, expiry:"2028-01-18", supplier:"Cipla Ltd" },
  { id:"16", name:"Azithromycin",  category:"Antibiotic",    batch:"BATCH-5082", quantity:179, threshold:25, unitPrice:15, expiry:"2028-04-02", supplier:"Cipla Ltd" },
  { id:"17", name:"Omeprazole",    category:"PPI",           batch:"BATCH-2721", quantity:51,  threshold:25, unitPrice:7,  expiry:"2027-11-04", supplier:"Dr. Reddy's" },
  { id:"18", name:"Diclofenac",    category:"NSAID",         batch:"BATCH-2625", quantity:21,  threshold:30, unitPrice:5,  expiry:"2027-07-04", supplier:"Alkem Labs" },
  { id:"19", name:"Ibuprofen",     category:"NSAID",         batch:"BATCH-8075", quantity:144, threshold:35, unitPrice:4,  expiry:"2027-08-08", supplier:"Cipla Ltd" },
  { id:"20", name:"Pantoprazole",  category:"PPI",           batch:"BATCH-6251", quantity:23,  threshold:25, unitPrice:9,  expiry:"2027-02-08", supplier:"Sun Pharma" },
  { id:"21", name:"Ibuprofen",     category:"NSAID",         batch:"BATCH-5055", quantity:42,  threshold:35, unitPrice:4,  expiry:"2027-05-15", supplier:"Cipla Ltd" },
  { id:"22", name:"Paracetamol",   category:"Analgesic",     batch:"BATCH-7400", quantity:87,  threshold:40, unitPrice:3,  expiry:"2028-02-24", supplier:"Micro Labs" },
  { id:"23", name:"Metformin",     category:"Antidiabetic",  batch:"BATCH-8930", quantity:30,  threshold:30, unitPrice:6,  expiry:"2027-08-02", supplier:"Sun Pharma" },
  { id:"24", name:"Insulin",       category:"Hormone",       batch:"BATCH-3633", quantity:55,  threshold:50, unitPrice:95, expiry:"2026-05-31", supplier:"Novo Nordisk" },
  { id:"25", name:"Aspirin",       category:"Antiplatelet",  batch:"BATCH-4798", quantity:101, threshold:30, unitPrice:2,  expiry:"2027-03-12", supplier:"Bayer" },
];

export const SUPPLIERS = [
  { id:"s1", name:"MedPlus Pharma", contact:"9876543210", email:"supply@medplus.in",   area:"Antibiotics, General",  rating:4.8 },
  { id:"s2", name:"Sun Pharma",     contact:"9812345678", email:"orders@sunpharma.in", area:"Cardiac, Antidiabetic", rating:4.6 },
  { id:"s3", name:"Cipla Ltd",      contact:"9898989898", email:"bulk@cipla.com",       area:"Antibiotics, NSAID",    rating:4.9 },
  { id:"s4", name:"Alkem Labs",     contact:"9823456789", email:"pharma@alkem.com",     area:"NSAID, Antibiotics",    rating:4.4 },
  { id:"s5", name:"Dr. Reddy's",    contact:"9845612378", email:"supply@drreddys.in",   area:"Antihistamine, PPI",    rating:4.7 },
  { id:"s6", name:"Micro Labs",     contact:"9867452310", email:"orders@microlabs.in",  area:"Analgesics",            rating:4.5 },
];

export const ML_PREDICTIONS = [
  { name:"Ciprofloxacin", avgMonthly:85,  predicted:102, reorderQty:150, confidence:87, trend:"up" },
  { name:"Insulin",       avgMonthly:60,  predicted:74,  reorderQty:120, confidence:92, trend:"up" },
  { name:"Azithromycin",  avgMonthly:45,  predicted:58,  reorderQty:80,  confidence:78, trend:"up" },
  { name:"Paracetamol",   avgMonthly:120, predicted:135, reorderQty:200, confidence:95, trend:"up" },
  { name:"Amoxicillin",   avgMonthly:70,  predicted:65,  reorderQty:100, confidence:83, trend:"down" },
  { name:"Ibuprofen",     avgMonthly:55,  predicted:70,  reorderQty:110, confidence:88, trend:"up" },
  { name:"Metformin",     avgMonthly:40,  predicted:52,  reorderQty:75,  confidence:81, trend:"up" },
];

export const TODAY = new Date("2026-03-21");

export function daysToExpiry(expiry) {
  return Math.ceil((new Date(expiry) - TODAY) / 86400000);
}

export function getStatus(drug) {
  const days = daysToExpiry(drug.expiry);
  if (days <= 30)                    return "crit";
  if (days <= 180)                   return "exp";
  if (drug.quantity <= drug.threshold) return "low";
  return "ok";
}

export function fefoSort(drugs) {
  return [...drugs].sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
}

export function exportCSV(drugs) {
  const rows = [
    ["ID","Name","Category","Batch","Quantity","Threshold","Unit Price","Expiry","Supplier","Status","Days to Expiry"],
    ...drugs.map(d => [
      d.id, d.name, d.category, d.batch, d.quantity,
      d.threshold, d.unitPrice, d.expiry, d.supplier,
      getStatus(d), daysToExpiry(d.expiry)
    ])
  ];
  const csv = rows.map(r => r.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `medistock_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

export function inventoryValue(drugs) {
  return drugs.reduce((s, d) => s + d.quantity * d.unitPrice, 0);
}
