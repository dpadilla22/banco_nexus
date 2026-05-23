import { useState } from "react";
import { motion } from "framer-motion";
import { Send, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import "./OperationForm.css";

export default function OperationForm({
  numeroCuenta,
  saldoActual,
  onOperationSuccess,
}) {
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const limpiarMensajes = () => {
    setMensajeExito("");
    setMensajeError("");
  };

  const realizarOperacion = async (tipo) => {
    limpiarMensajes();

    // Validaciones
    if (!monto || monto <= 0) {
      setMensajeError("Por favor ingresa un monto válido mayor a 0");
      return;
    }

    if (tipo === "retiro" && parseFloat(monto) > saldoActual) {
      setMensajeError(`Saldo insuficiente. Saldo disponible: $${saldoActual}`);
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        tipo === "deposito"
          ? "http://localhost:3000/api/deposito"
          : "http://localhost:3000/api/retiro";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numeroCuenta: String(numeroCuenta),
          monto: parseFloat(monto),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensajeError(data.error || `Error al realizar ${tipo}`);
        return;
      }

      // Éxito
      setMensajeExito(data.mensaje);
      setMonto("");
      
      if (onOperationSuccess) {
        onOperationSuccess();
      }

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setMensajeExito("");
      }, 3000);
    } catch (error) {
      setMensajeError("Error de conexión. Intenta de nuevo.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!numeroCuenta) return null;

  return (
    <motion.div
      className="operation-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2>Operaciones Bancarias</h2>

      {/* Mensaje de Éxito */}
      {mensajeExito && (
        <motion.div
          className="mensaje-exito"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <CheckCircle size={20} />
          <span>{mensajeExito}</span>
        </motion.div>
      )}

      {/* Mensaje de Error */}
      {mensajeError && (
        <motion.div
          className="mensaje-error"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <AlertCircle size={20} />
          <span>{mensajeError}</span>
        </motion.div>
      )}

      <div className="input-group">
        <label htmlFor="monto">Ingresa el Monto</label>
        <div className="input-wrapper">
          <DollarSign size={18} />
          <input
            id="monto"
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={loading}
          />
        </div>
      </div>

      <div className="botones-operaciones">
        <button
          className="btn-deposito"
          onClick={() => realizarOperacion("deposito")}
          disabled={loading}
        >
          <Send size={18} />
          {loading ? "Procesando..." : "Depositar"}
        </button>

        <button
          className="btn-retiro"
          onClick={() => realizarOperacion("retiro")}
          disabled={loading}
        >
          <Send size={18} />
          {loading ? "Procesando..." : "Retirar"}
        </button>
      </div>

      <div className="info-saldo">
        <span>Saldo actual:</span>
        <strong className="saldo-texto">${saldoActual}</strong>
      </div>
    </motion.div>
  );
}
