import { useState } from "react";
import { motion } from "framer-motion";
import { Send, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { API_URL } from "../../config/api";

import "./OperationForm.css";
export default function OperationForm({
  numeroCuenta,
  saldoActual,
  onOperationSuccess,
  setEstadoSistema,
  fetchConTimeout,
  authHeaders,
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
    if (!monto || monto <= 0) {
      setMensajeError("Ingresa un monto válido.");
      return;
    }

    if (tipo === "retiro" && parseFloat(monto) > saldoActual) {
      setMensajeError(`Saldo insuficiente.`);
      return;
    }

    setLoading(true);
    try {
      setEstadoSistema("loading");
      const endpoint =
        tipo === "deposito"
          ? `${API_URL}/api/deposito`
          : `${API_URL}/api/retiro`;

      const response = await fetchConTimeout(
        endpoint,
        {
          method: "POST",
          headers: authHeaders(),

          body: JSON.stringify({
            numeroCuenta: String(numeroCuenta),
            monto: parseFloat(monto),
          }),
        },
        5000,
      );

      const data = await response.json();
      if (!response.ok) {
        setEstadoSistema("offline");
        setMensajeError(data.error || `Error al realizar ${tipo}`);
        return;
      }
      setEstadoSistema("online");
      setMensajeExito(data.mensaje);
      setMonto("");

      if (onOperationSuccess) {
        await onOperationSuccess();
      }

      setTimeout(() => {
        setMensajeExito("");
      }, 3000);
    } catch (error) {
      console.error(error);

      if (error.name === "AbortError") {
        setEstadoSistema("loading");
        setMensajeError("Conexión lenta.");
      } else {
        setEstadoSistema("offline");
        setMensajeError("Error de conexión.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!numeroCuenta) return null;
  return (
    <motion.div
      className="operation-form"
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      <h2>Operaciones Bancarias</h2>
      {mensajeExito && (
        <motion.div
          className="mensaje-exito"
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
        >
          <CheckCircle size={20} />
          <span>{mensajeExito}</span>
        </motion.div>
      )}
      {mensajeError && (
        <motion.div
          className="mensaje-error"
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
        >
          <AlertCircle size={20} />
          <span>{mensajeError}</span>
        </motion.div>
      )}
      <div className="info-saldo">
        <span>Saldo actual:</span>
        <strong className="saldo-texto">
          {new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
          }).format(saldoActual)}
        </strong>
      </div>
      <div className="input-group">
        <label htmlFor="monto">Ingresa el Monto</label>
        <div className="input-wrapper">
          <DollarSign size={18} />
          <input
            id="monto"
            type="text"
            inputMode="decimal"
            value={monto}
            onChange={(e) => {
              const valor = e.target.value;
              if (mensajeError) {
                setMensajeError("");
              }
              if (mensajeExito) {
                setMensajeExito("");
              }
              if (/^\d*\.?\d*$/.test(valor)) {
                setMonto(valor);
              }
            }}
            placeholder="0.00"
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
    </motion.div>
  );
}
