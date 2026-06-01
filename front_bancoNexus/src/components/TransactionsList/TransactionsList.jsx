import "./TransactionsList.css";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useMemo } from "react";

export default function TransactionsList({ datos }) {
  const [paginaActual, setPaginaActual] = useState(1);
  const transacciones = datos?.transacciones || [];
  const movimientosPorPagina = 5;
  const totalPaginas = Math.ceil(transacciones.length / movimientosPorPagina);

  const movimientosActuales = useMemo(() => {
    const inicio = (paginaActual - 1) * movimientosPorPagina;
    const fin = inicio + movimientosPorPagina;
    return transacciones.slice(inicio, fin);
  }, [transacciones, paginaActual]);

  const getIcon = (tipo) => {
    if (
      tipo.toLowerCase().includes("retiro") ||
      tipo.toLowerCase().includes("salida")
    ) {
      return <ArrowUpRight size={18} style={{ color: "#FF6B6B" }} />;
    }
    return <ArrowDownLeft size={18} style={{ color: "#4CAF50" }} />;
  };

  if (!datos) return null;
  return (
    <div className="transactions">
      <h2>Movimientos</h2>
      {movimientosActuales.map((t, index) => (
        <div className="transaction-item" key={index}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
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
              <p>
                {new Date(t.fecha).toLocaleString("es-MX", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
          <h3
            style={{
              color: t.tipo.toLowerCase().includes("retiro")
                ? "#ef4444"
                : "#22c55e",
            }}
          >
            {t.tipo.toLowerCase().includes("retiro") ? "-" : "+"}
            {new Intl.NumberFormat("es-MX", {
              style: "currency",
              currency: "MXN",
            }).format(t.monto)}
          </h3>
        </div>
      ))}
      {totalPaginas > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
            disabled={paginaActual === 1}
          >
            <ChevronLeft size={18} />
          </button>
          <span>
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            onClick={() =>
              setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
            }
            disabled={paginaActual === totalPaginas}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
