import "./TransactionsList.css";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
} from "lucide-react";
import { useState, useMemo } from "react";

export default function TransactionsList({ datos, modo = "dashboard" }) {
  const [paginaActual, setPaginaActual] = useState(1);
  const transacciones = datos?.transacciones || [];
  const movimientosPorPagina = modo === "dashboard" ? 5 : 5;
  const totalPaginas = Math.ceil(transacciones.length / movimientosPorPagina);

  const movimientosActuales = useMemo(() => {
    if (modo === "dashboard") {
      return transacciones.slice(0, 5);
    }

    const inicio = (paginaActual - 1) * movimientosPorPagina;
    const fin = inicio + movimientosPorPagina;
    return transacciones.slice(inicio, fin);
  }, [transacciones, paginaActual, modo]);

  const getTipoMovimiento = (t) => {
    if (t.tipo.toLowerCase().includes("transferencia")) {
      return t.monto < 0 ? "Transferencia enviada" : "Transferencia recibida";
    }

    return t.tipo;
  };

  const getIcon = (tipo) => {
    const texto = tipo.toLowerCase();

    if (texto.includes("transferencia")) {
      return (
        <ArrowLeftRight
          size={18}
          style={{
            color: "var(--primary-blue)",
          }}
        />
      );
    }

    if (texto.includes("retiro")) {
      return (
        <ArrowUpRight
          size={18}
          style={{
            color: "#ef4444",
          }}
        />
      );
    }

    return (
      <ArrowDownLeft
        size={18}
        style={{
          color: "#22c55e",
        }}
      />
    );
  };

  const getColorMonto = (tipo) => {
    const texto = tipo.toLowerCase();

    if (texto.includes("transferencia")) {
      return "var(--primary-blue)";
    }

    if (texto.includes("retiro")) {
      return "#ef4444";
    }

    return "#22c55e";
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
              <h4>{getTipoMovimiento(t)}</h4>
              {modo === "historial" && t.mensaje && (
                <small className="concepto">{t.mensaje}</small>
              )}
              <p>
                {new Date(t.fecha).toLocaleString("es-MX", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
              {modo === "historial" && (t.cuentaDestino || t.cuentaOrigen) && (
                <p className="cuenta-info">
                  {t.cuentaDestino && `Destino: ${t.cuentaDestino}`}

                  {t.cuentaOrigen && `Origen: ${t.cuentaOrigen}`}
                </p>
              )}
            </div>
          </div>
          <h3
            style={{
              color: getColorMonto(t.tipo),
            }}
          >
            {t.tipo.toLowerCase().includes("retiro")
              ? "-"
              : t.tipo.toLowerCase().includes("transferencia")
                ? ""
                : "+"}
            {new Intl.NumberFormat("es-MX", {
              style: "currency",
              currency: "MXN",
            }).format(t.monto)}
          </h3>
        </div>
      ))}
      {modo === "historial" && totalPaginas > 1 && (
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
