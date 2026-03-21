import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function SettingsPage() {

  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {

    fetch("http://127.0.0.1:5000/medicines")
      .then(res => res.json())
      .then(data => setMedicines(data));

  }, []);

  const chartData = medicines.map(med => ({
    name: med.name,
    quantity: med.quantity
  }));

  const totalMedicines = medicines.length;

  const lowStock = medicines.filter(m => m.quantity < 20).length;

  const nearExpiry = medicines.filter(m =>
    new Date(m.expiry) < new Date(Date.now() + 60*24*60*60*1000)
  ).length;

  const downloadPDF = () => {

    const doc = new jsPDF();

    doc.text("MediStock AI Inventory Report", 14, 15);

    const tableData = medicines.map(med => [
      med.id,
      med.name,
      med.batch,
      med.quantity,
      med.expiry
    ]);

    autoTable(doc,{
      head:[["ID","Name","Batch","Quantity","Expiry"]],
      body:tableData,
      startY:20
    });

    doc.save("medicine_inventory.pdf");

  };

  return (

    <div style={{padding:"40px", color:"white"}}>

      <h1 style={{textAlign:"center"}}>MediStock AI Dashboard</h1>


      {/* Stats Cards */}

      <div style={{
        display:"flex",
        gap:"20px",
        marginTop:"30px",
        marginBottom:"30px"
      }}>

        <div style={{padding:"20px",background:"#1e293b",borderRadius:"10px"}}>
          <h3>Total Medicines</h3>
          <h2>{totalMedicines}</h2>
        </div>

        <div style={{padding:"20px",background:"#1e293b",borderRadius:"10px"}}>
          <h3>Low Stock</h3>
          <h2>{lowStock}</h2>
        </div>

        <div style={{padding:"20px",background:"#1e293b",borderRadius:"10px"}}>
          <h3>Near Expiry</h3>
          <h2>{nearExpiry}</h2>
        </div>

      </div>


      {/* Chart */}

      <h2>Medicine Stock Chart</h2>

      <div style={{width:"100%",height:300}}>

        <ResponsiveContainer>

          <BarChart data={chartData}>

            <CartesianGrid strokeDasharray="3 3"/>

            <XAxis dataKey="name"/>

            <YAxis/>

            <Tooltip/>

            <Bar dataKey="quantity" fill="#3b82f6"/>

          </BarChart>

        </ResponsiveContainer>

      </div>


      {/* Search + PDF */}

      <div style={{marginTop:"30px"}}>

        <input
          placeholder="Search medicine..."
          onChange={(e)=>setSearch(e.target.value)}
          style={{
            padding:"10px",
            width:"250px",
            marginRight:"20px"
          }}
        />

        <button
          onClick={downloadPDF}
          style={{
            padding:"10px 20px",
            background:"#2563eb",
            color:"white",
            border:"none",
            borderRadius:"5px",
            cursor:"pointer"
          }}
        >
          Download PDF
        </button>

      </div>


      {/* Inventory Table */}

      <h2 style={{marginTop:"30px"}}>Medicine Inventory</h2>

      <table border="1" cellPadding="8" style={{width:"100%"}}>

        <thead>

          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Batch</th>
            <th>Quantity</th>
            <th>Expiry</th>
          </tr>

        </thead>

        <tbody>

          {medicines
          .filter(med =>
            med.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((med)=> (

            <tr key={med.id}>

              <td>{med.id}</td>

              <td>{med.name}</td>

              <td>{med.batch}</td>

              <td style={{
                color: med.quantity < 20 ? "orange":"white"
              }}>
                {med.quantity}
              </td>

              <td style={{
                color:
                new Date(med.expiry) <
                new Date(Date.now()+60*24*60*60*1000)
                ? "red":"white"
              }}>
                {med.expiry}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}

export default SettingsPage;