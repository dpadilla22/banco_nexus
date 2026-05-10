import "./TransactionsList.css";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function TransactionsList({ datos }) {
  if (!datos) return null;

  const getIcon = (tipo) => {
    if (
      tipo.toLowerCase().includes("retiro") ||
      tipo.toLowerCase().includes("salida")
    ) {
      return <ArrowUpRight size={18} style={{ color: "#FF6B6B" }} />;
    }
    return <ArrowDownLeft size={18} style={{ color: "#4CAF50" }} />;
  };

  return (
    <div className="transactions">
      <h2>Movimientos</h2>

      {datos.transacciones.map((t, index) => (
        <div className="transaction-item" key={index}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {getIcon(t.tipo)}
            </div>
            <div>
              <h4>{t.tipo}</h4>

              <p>{new Date(t.fecha).toLocaleDateString()}</p>
            </div>
          </div>

          <h3>${t.monto}</h3>
        </div>
      ))}
    </div>
  );
}
