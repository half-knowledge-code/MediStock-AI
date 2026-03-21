import { useEffect, useState } from "react";
import ReorderCard from "../components/ReorderCard";

export default function ReorderPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/ml-predict")
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Order Medicines</h2>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {data.map((drug, index) => (
          <ReorderCard key={index} drug={drug} />
        ))}
      </div>
    </div>
  );
}