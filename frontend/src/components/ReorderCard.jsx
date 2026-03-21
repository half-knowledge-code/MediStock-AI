export default function ReorderCard({ drug }) {

  const handleOrder = () => {
  alert(`Order placed for ${drug.name}`);

  // 🔥 remove from UI instantly
  setData(prev => prev.filter(d => d.name !== drug.name));
};

  return (
    <div style={{
      background: "white",
      padding: "16px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      width: "220px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
    }}>
      
      <h3>{drug.name}</h3>

      <p>Stock: {drug.current_stock}</p>
      <p>Predicted: {drug.predicted_demand}</p>

      <p style={{ color: drug.suggest_reorder > 0 ? "red" : "green" }}>
        Reorder: {drug.suggest_reorder}
      </p>

      <p style={{
        color:
          drug.priority === "HIGH" ? "red" :
          drug.priority === "MEDIUM" ? "orange" : "green",
        fontWeight: "bold"
      }}>
        Priority: {drug.priority || "LOW"}
      </p>

      <button
        onClick={handleOrder}
        disabled={drug.suggest_reorder <= 0}
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "8px",
          borderRadius: "8px",
          border: "none",
          background: drug.suggest_reorder > 0 ? "#22a06b" : "gray",
          color: "white",
          cursor: drug.suggest_reorder > 0 ? "pointer" : "not-allowed"
        }}
      >
        {drug.suggest_reorder > 0 ? "Order Now" : "Stock OK"}
      </button>

    </div>
  );
}